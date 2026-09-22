import requests
import os
from pathlib import Path

base_path = Path(__file__).resolve().parent.parent.parent
flasher_path = base_path / "flasher"
print(flasher_path)

def download_file(session, download_url, download_path):
    filename = download_url.split("/")[-1]
    try:
        with session.get(download_url, stream=True) as req:
            req.raise_for_status()
            total_size = int(req.headers.get('content-length', 0))
            downloaded = 0
            with open(download_path, 'wb') as f:
                for chunk in req.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        percentage = (downloaded / total_size) * 100
                        print(f"Downlaoding {filename}: {percentage:.1f}%")
        if os.path.exists(download_path):
            print(f"Successfully downloaded {filename}")
        return True
    except Exception as e:
        print(f"Error while downloading {filename}, error: {e}")
        return False

files_to_download = {
    "esp32s3_auto_key.ino.bootloader.bin": {
        "path": f"{flasher_path}/esp32/automatic-keyboard",
        "url": "https://github.com/daslearning-org/Org-Bypass/releases/download/v0.1.0/esp32s3_auto_key.ino.bootloader.bin"
    },
    "esp32s3_auto_key.ino.partitions.bin": {
        "path": f"{flasher_path}/esp32/automatic-keyboard",
        "url": "https://github.com/daslearning-org/Org-Bypass/releases/download/v0.1.0/esp32s3_auto_key.ino.partitions.bin"
    },
    "esp32s3_auto_key_boot_app0.bin": {
        "path": f"{flasher_path}/esp32/automatic-keyboard",
        "url": "https://github.com/daslearning-org/Org-Bypass/releases/download/v0.1.0/esp32s3_auto_key_boot_app0.bin"
    },
    "esp32s3_auto_key.ino.bin": {
        "path": f"{flasher_path}/esp32/automatic-keyboard",
        "url": "https://github.com/daslearning-org/Org-Bypass/releases/download/v0.1.0/esp32s3_auto_key.ino.bin"
    },
    "esp32s3_coder_kb.ino.bootloader.bin": {
        "path": f"{flasher_path}/esp32/coder-keyboard",
        "url": "https://github.com/daslearning-org/Org-Bypass/releases/download/v0.1.0/esp32s3_coder_kb.ino.bootloader.bin"
    },
    "esp32s3_coder_kb.ino.partitions.bin": {
        "path": f"{flasher_path}/esp32/coder-keyboard",
        "url": "https://github.com/daslearning-org/Org-Bypass/releases/download/v0.1.0/esp32s3_coder_kb.ino.partitions.bin"
    },
    "esp32s3_coder_kb_boot_app0.bin": {
        "path": f"{flasher_path}/esp32/coder-keyboard",
        "url": "https://github.com/daslearning-org/Org-Bypass/releases/download/v0.1.0/esp32s3_coder_kb_boot_app0.bin"
    },
    "esp32s3_coder_kb.ino.bin": {
        "path": f"{flasher_path}/esp32/coder-keyboard",
        "url": "https://github.com/daslearning-org/Org-Bypass/releases/download/v0.1.0/esp32s3_coder_kb.ino.bin"
    },
    "esp32s3_coder_kb_static_web.bin": {
        "path": f"{flasher_path}/esp32/coder-keyboard",
        "url": "https://github.com/daslearning-org/Org-Bypass/releases/download/v0.1.0/esp32s3_coder_kb_static_web.bin"
    }
}

with requests.Session() as session:
    for file in files_to_download:
        download_path = files_to_download[file]["path"]
        download_file(session, files_to_download[file]["url"], f"{download_path}/{file}")
