<p align="center"><img width="20%" src="./docs/images/orgBypassLogoT.png" /></p>

# 💼 Org-Bypass 🤫
An open-source initiative to bypass some of the unnecessary stupid restrictions or monitoring implementations on your work computer.

> Note: We do not encourage to do illegal things which might cause security voilations. Use this at your own risk!

## 🕥 Bypass Time Tracking
Your corporate device may track mouse movement or keyboard inputs to track active time. We have seen some bypasses using a rotating fan attached to a mouse etc. <br>

What if we could automatically send some keyboard inputs to the computer & we do not need to create any script or install any additional software? Yup, that's right, we will be leveraging simple usb keyboard technology with a tiny micro-controller.

### 📽️ Demo
You can click on the below Image or this [Youtube Link](https://www.youtube.com/watch?v=1WQOeCBd_mk) to see the demo. Please let me know in the comments, how do you feel about this App. <br>

<a href="https://www.youtube.com/watch?v=1WQOeCBd_mk" align="center"><img width="50%" src="./docs/images/OrgBypassThumbYT.jpg" /></a>

### ⌨ Using ESP32-S3 as a USB Keyboard
ESP32-S3 natively supports USB OTG and it is perfect for this project. It will act as a USB keyboard which can send automatic inputs from `a-z` every 3 seconds (configurable in code).

#### 𓏠 Hardware requirement
1. [ESP32-S3-super-mini](https://amzn.in/d/0hTg92ZB) or [Standard ESP32-S3](https://amzn.in/d/0fae1Qvm) or any variant of ESP32-S3
2. A type-c USB cable or a micro-usb cable depending on your ESP model.

#### 🧩 Steps

##### Using the web flasher (Easy)

* Go to this [web flasher](https://mc.daslearning.in/esp32/automatic-keyboard/) using any Chromium based browser like Chrome, Edge, Brave etc on you computer. <br>
<a href="https://mc.daslearning.in/esp32/automatic-keyboard/"><img src="./flasher/assets/images/icons/usb-memory.svg" width="50"></a>

* Connect your ESP32-S3 with a USB cable. If you don't see your serial device, you can press & hold `Boot` button on ESP32, then press the `Reset` button and release both. Try to connect again.

* After successful conenction, just press the `Flash` button from the web.

* Once flashing is successful you can remove the USB cable & use the automatic keyboard anywhere.

##### Using Arduni IDE (Manual)

* Install ESP32 on Arduino IDE. You can follow this simple [guide](https://randomnerdtutorials.com/installing-the-esp32-board-in-arduino-ide-windows-instructions/).

* Select your ESP32-S3 board in `Tools` > `Board`. Generally is should be `ESP32S3 Dev Module`.

* Copy our [auto-keyboard-code](./auto-keyboard-input/autoUsbKeyInpEsp32.ino) in your `Arduino IDE`.

* Simply press the `Upload` button and relax.

* After a successful flashing, it becomes your USB keyoard which sends automatic inputs.

## 💰 Sponsor Me
You can buy me a coffee via [this link](https://www.paypal.com/paypalme/soomnathsdas) or tap on below image. Thank you 🙏. <br>
<a href="https://www.paypal.com/paypalme/soomnathsdas"><img src="./docs/images/donate.svg" height="40"></a>
