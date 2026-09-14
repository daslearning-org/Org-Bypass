# Web Flasher
We can skip `Arduino IDE` and flash it from the web using [EspTool-js](https://github.com/espressif/esptool-js)

## ESP32-S3

### Create bin files
* Go to `Sketch` option from `Arduino IDE`.
* Click on `Export compiled binary`.
* It will generate something like `esp32.esp32.esp32s3` folder under `<sketch_dir>/build`.
* We can directly take the `<sketch_name>.ino.merged.bin` or manually merge `<sketch_name>.ino.bin`, `<sketch_name>.ino.bootloader.bin`, `<sketch_name>.ino.partitions.bin` & `boot_app0.bin` into one.
* Or we can use multi part flashing using the above four files too.

### Merging the bin files
```bash
pip install esptool
esptool.py --chip esp32s3 merge_bin -o custom_merged.bin 0x0 sketch_may24a.ino.bootloader.bin 0x8000 sketch_may24a.ino.partitions.bin 0xe000 boot_app0.bin 0x10000 sketch_may24a.ino.bin
```

### GitHub automation
If esp32-s3 needs `CDC on boot`, we can add `--fqbn esp32:esp32:esp32s3:CDCOnBoot=cdc` or similar for `PSRAM`

```yml
name: Build ESP32-S3 Firmware

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Python & esptool
        uses: actions/setup-python@v5
        with:
          python-version: "3.x"

      - name: Install esptool
        run: pip install esptool

      - name: Setup Arduino CLI
        uses: arduino/setup-arduino-cli@v1

      - name: Install ESP32 Core & Libraries
        run: |
          arduino-cli config init
          arduino-cli config add board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
          arduino-cli core update-index
          arduino-cli core install esp32:esp32
          # If your sketch requires external libraries, install them here:
          # arduino-cli lib install "ArduinoJson"

      - name: Compile Sketch
        run: |
          mkdir -p output
          arduino-cli compile \
            --fqbn esp32:esp32:esp32s3 \
            --export-binaries \
            --output-dir ./output \
            ./sketch_may24a

      - name: Create Compact Merged Binary (Optional)
        run: |
          cd output
          esptool.py --chip esp32s3 merge_bin \
            -o firmware_merged_compact.bin \
            0x0 *.bootloader.bin \
            0x8000 *.partitions.bin \
            0xe000 boot_app0.bin \
            0x10000 *.bin

      - name: Upload Binaries as Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: esp32s3-binaries
          path: ./output/*.bin

      - name: Publish or Update 'latest' Release
        uses: softprops/action-gh-release@v2
        if: github.ref == 'refs/heads/main'  # Only release on pushes to main
        with:
          tag_name: latest
          name: "Latest Build"
          body: |
            Automated build from commit: ${{ github.sha }}
            
            Flashable binaries for ESP32-S3.
          draft: false
          prerelease: false
          files: |
            ./output/*.bin
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
