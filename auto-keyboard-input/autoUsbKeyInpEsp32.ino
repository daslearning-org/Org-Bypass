#include "USB.h"
#include "USBHIDKeyboard.h"

USBHIDKeyboard Keyboard;

void setup() {
    USB.manufacturerName("DasLearning");
    USB.productName("USB Keyboard");
    USB.serialNumber("USBKB0092");

    USB.begin();
    Keyboard.begin();

    delay(1000); // One second delay at startup
}

void loop() {
    // send a lower case input from a-z every 3 seconds
    delay(3000);
    char randomChar = 'a' + random(26);
    Keyboard.print(randomChar);
}
