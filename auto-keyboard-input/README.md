# Writing down local docs

## Data upload
```bash
LittleFS Filesystem Uploader v1.6.3 -- https://github.com/earlephilhower/arduino-littlefs-upload

 Sketch Path: /home/somnath/codes/git/my-org/Org-Bypass/auto-keyboard-input/autoKeyCoder
   Data Path: /home/somnath/codes/git/my-org/Org-Bypass/auto-keyboard-input/autoKeyCoder/data
      Device: ESP32 series, model esp32s3
Using partition: default
  Partitions: /home/somnath/.arduino15/packages/esp32/hardware/esp32/3.3.7/tools/partitions/default.csv
       Start: 0x290000
         End: 0x3f0000
 Serial Port: /dev/ttyACM0

Building LittleFS filesystem
Command Line: /home/somnath/.arduino15/packages/esp32/tools/mklittlefs/4.0.2-db0513a/mklittlefs -c /home/somnath/codes/git/my-org/Org-Bypass/auto-keyboard-input/autoKeyCoder/data -p 256 -b 4096 -s 1441792 /tmp/tmp-17188-PogB6MSgr6wr-.littlefs.bin
/logic.js
/w3.css
/index.html

Uploading LittleFS filesystem
Command Line: /home/somnath/.arduino15/packages/esp32/tools/esptool_py/5.1.0/esptool --chip esp32s3 --port /dev/ttyACM0 --baud 921600 --before default_reset --after hard_reset write_flash -z --flash_mode dio --flash_freq 80m --flash_size detect 2686976 /tmp/tmp-17188-PogB6MSgr6wr-.littlefs.bin
Warning: Deprecated: Option '--flash_mode' is deprecated. Use '--flash-mode' instead.
Warning: Deprecated: Option '--flash_freq' is deprecated. Use '--flash-freq' instead.
Warning: Deprecated: Option '--flash_size' is deprecated. Use '--flash-size' instead.
Warning: Deprecated: Choice 'default_reset' for option '--before' is deprecated. Use 'default-reset' instead.
Warning: Deprecated: Choice 'hard_reset' for option '--after' is deprecated. Use 'hard-reset' instead.
Warning: Deprecated: Command 'write_flash' is deprecated. Use 'write-flash' instead.
```

## Test APIs on ESP32

```bash
# start
curl -X POST http://192.168.4.1/start -H "Content-Type: text/plain" -d '{"start": "on"}'

# stop
curl -X POST http://192.168.4.1/stop -H "Content-Type: text/plain" -d '{"stop": "ok"}'

# set config
curl -X POST http://192.168.4.1/config -H "Content-Type: text/plain" -d '{"ssid": "yourSSID", "password": "yourpass"}'

# auto coder github link
curl -X POST http://192.168.x.x/coder -H "Content-Type: text/plain" -d '{"git": "github.com/RuiSantosdotme/Random-Nerd-Tutorials/raw/refs/heads/master/Projects/Arduino-JSON/Arduino_HTTP_GET_Client.ino"}'

```
