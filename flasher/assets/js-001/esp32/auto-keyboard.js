
import { ESPLoader, Transport } from "https://unpkg.com/esptool-js@0.5.0/bundle.js";

let device = null;
let transport = null;
let esploader = null;

const connectBtn = document.getElementById("connectBtn");
const flashMultiBtn = document.getElementById("flashMultiBtn");
const flashMergedBtn = document.getElementById("flashMergedBtn");
const statusText = document.getElementById("status");
const logArea = document.getElementById("log");

function log(msg) {
  logArea.value += msg + "\n";
  logArea.scrollTop = logArea.scrollHeight;
}

const terminal = {
  clean() { logArea.value = ""; },
  writeLine(data) { log(data); },
  write(data) { log(data); }
};

// Helper to fetch file and convert to binary string array buffer
async function loadBin(path) {
  const response = await fetch(`https://proxy.corsfix.com/?${path}`);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.statusText}`);
  const buffer = await response.arrayBuffer();
  console.log("downloaded bytes:", buffer.byteLength);
  // esptool-js expects raw binary string format
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}

// 1. Connect to ESP32-S3
connectBtn.onclick = async () => {
  try {
    device = await navigator.serial.requestPort();
    transport = new Transport(device);
    // Standard connection options
    esploader = new ESPLoader({
      transport: transport,
      baudrate: 115200,      // Communication baud rate
      terminal: terminal,
      romBaudrate: 115200
    });
    statusText.innerText = "Status: Connecting... (Hold BOOT if unresponsive)";
    const detectedChip = await esploader.main();
    statusText.innerText = `Status: Connected to ${detectedChip}`;

    flashMultiBtn.disabled = false;
    flashMergedBtn.disabled = false;
    connectBtn.disabled = true;

    flashMultiBtn.classList.replace("btn-secondary", "btn-primary");
    flashMergedBtn.classList.replace("btn-secondary", "btn-primary");
    connectBtn.classList.replace("btn-primary", "btn-secondary");
  }
  catch (err) {
    log(`Connection Error: ${err.message}`);
    statusText.innerText = "Status: Connection Failed";
  }
};

async function getGitReleaseLink(bin_list){
  let url = "https://api.github.com/repos/daslearning-org/Org-Bypass/releases/latest"

  try {
    const response = await fetch(url);

    // Crucial: check if the HTTP status code is 200-299
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success:', data);

    for(let bin_item in bin_list){
      for(let asset in data["assets"]){
        if(bin_item === data["assets"][asset]["name"]){
          //console.log(bin_item, data["assets"][asset]["url"]);
          bin_list[bin_item] = data["assets"][asset]["browser_download_url"];
        }
      }
    }

    //console.log("binList: ", bin_list);
    return bin_list
  }
  catch (error) {
    console.error('Fetch failed:', error);
  }
}

// 2. Flash Individual Files at ESP32-S3 Offsets
flashMultiBtn.onclick = async () => {
  try {
    statusText.innerText = "Status: Downloading binaries...";
    let bin_list = {
      "esp32s3_auto_key.ino.bootloader.bin": "",
      "esp32s3_auto_key.ino.partitions.bin": "",
      "esp32s3_auto_key_boot_app0.bin": "",
      "esp32s3_auto_key.ino.bin": ""
    }
    let git_assets = await getGitReleaseLink(bin_list);
    console.log(git_assets);
    // Exact 4 files generated in your Arduino S3 build folder
    const [bootloader, partitions, bootApp0, app] = await Promise.all([
      loadBin(git_assets["esp32s3_auto_key.ino.bootloader.bin"]),
      loadBin(git_assets["esp32s3_auto_key.ino.partitions.bin"]),
      loadBin(git_assets["esp32s3_auto_key_boot_app0.bin"]),
      loadBin(git_assets["esp32s3_auto_key.ino.bin"])
    ]);
    // ESP32-S3 Specific Memory Map
    const fileArray = [
      { data: bootloader, address: 0x0000 },
      { data: partitions, address: 0x8000 },
      { data: bootApp0,   address: 0xe000 },
      { data: app,        address: 0x10000 }
    ];
    statusText.innerText = "Status: Writing to flash...";
    await esploader.writeFlash({
      fileArray: fileArray,
      flashSize: "keep",
      flashMode: "keep",
      flashFreq: "keep",
      eraseAll: false,
      compress: true,
      reportProgress: (fileIndex, written, total) => {
        const percent = Math.round((written / total) * 100);
        statusText.innerText = `Status: Flashing file ${fileIndex + 1}/4 (${percent}%)`;
      }
    });
    statusText.innerText = "Status: Flashing complete! Resetting board...";
    log("Done! Rebooting chip into user firmware...");
    // 1. Trigger a hard reset using esptool-js's built-in reset method
    await esploader.hardReset();
    // 2. Release the USB serial port locks so the browser or other tools can read serial
    await transport.disconnect();
    log("Device reset successfully!");
  }
  catch (err) {
    log(`Flash Error: ${err.message}`);
    statusText.innerText = "Status: Flash Failed";
  }
};

// 3. Flash Single Merged Binary (Custom or Arduino 4MB merged.bin)
flashMergedBtn.onclick = async () => {
  try {
    let bin_list = {
      "esp32s3_auto_key.ino.merged.bin": ""
    }
    let git_assets = await getGitReleaseLink(bin_list);
    console.log(git_assets);
    statusText.innerText = "Status: Downloading merged binary...";
    const mergedData = await loadBin(git_assets["esp32s3_auto_key.ino.merged.bin"]);
    statusText.innerText = "Status: Writing merged image...";
    await esploader.writeFlash({
      fileArray: [
        { data: mergedData, address: 0x0000 }
      ],
      flashSize: "keep",
      flashMode: "keep",
      flashFreq: "keep",
      eraseAll: false,
      compress: true,
      reportProgress: (fileIndex, written, total) => {
        const percent = Math.round((written / total) * 100);
        statusText.innerText = `Status: Flashing merged.bin (${percent}%)`;
      }
    });
    statusText.innerText = "Status: Flash complete! Resetting board...";
    log("Done! Rebooting chip into user firmware...");
    // 1. Trigger a hard reset using esptool-js's built-in reset method
    await esploader.hardReset();
    // 2. Release the USB serial port locks so the browser or other tools can read serial
    await transport.disconnect();
    log("Device reset successfully!");
  }
  catch (err) {
    log(`Flash Error: ${err.message}`);
    statusText.innerText = "Status: Flash Failed";
  }
};
