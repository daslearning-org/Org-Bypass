/* Imports */

// file and config
#include "FS.h"
#include <LittleFS.h>
#include <Arduino_JSON.h>

// wifi & web
#include <WiFi.h>
#include <WebServer.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

// usb
#include "USB.h"
#include "USBHIDKeyboard.h"


/*Global definitions*/
#define CONFIG_FILE "/config.json"

/* Global vars / objects */
bool codeMode = false;
bool codeStarted = false;
bool autoMode = false;
bool wifiConnected = false;
unsigned long timeCounter = 0;
String gitLink = "";
USBHIDKeyboard Keyboard;
// Create WebServer object on port 80
WebServer server(80);

/* Functions */
void startAP() {
    Serial0.println("Starting AP mode...");

    WiFi.mode(WIFI_AP);
    WiFi.softAP("ESP32-AutoKB", "12345678");

    Serial0.print("AP IP: ");
    Serial0.println(WiFi.softAPIP());
}

bool connectWiFi(const String &ssid, const String &password) {
    Serial0.print("Connecting to ");
    Serial0.println(ssid);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid.c_str(), password.c_str());

    unsigned long start = millis();

    while (WiFi.status() != WL_CONNECTED &&
           millis() - start < 10000) {

        delay(500);
        Serial0.print(".");
    }

    Serial0.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial0.println("WiFi connected!");
        Serial0.print("IP: ");
        Serial0.println(WiFi.localIP());
        wifiConnected = true;
        return true;
    }

    Serial0.println("WiFi connection failed");
    return false;
}

void postMethod(String urlPath) {
    // Check that a request body was actually received
    if (!server.hasArg("plain")) {
        server.send(400, "application/json",
                    "{\"error\":\"Missing request body\"}");
        return;
    }

    String body = server.arg("plain");

    Serial0.println("Received:");
    Serial0.println(body);

    // Parse JSON
    JSONVar json = JSON.parse(body);

    if (JSON.typeof(json) == "undefined") {
        server.send(400, "application/json",
                    "{\"error\":\"Invalid JSON\"}");
        return;
    }

    if(urlPath == "stop") {
        // Check required fields
        if (!json.hasOwnProperty("stop")) {
            server.send(400, "application/json",
                        "{\"error\":\"Missing required argument\"}");
            return;
        }
        autoMode = false;
        Serial0.println("Stopped auto mode");
        server.send(200, "application/json",
                    "{\"success\":true}");
    }
    else if(urlPath == "start") {
        // Check required fields
        if (!json.hasOwnProperty("start")) {
            server.send(400, "application/json",
                        "{\"error\":\"Missing required arg.\"}");
            return;
        }
        autoMode = true;
        Serial0.println("Started auto mode");
        server.send(200, "application/json",
                    "{\"success\":true}");
    }
    else if(urlPath == "coder") {
        // Check required fields
        if (!json.hasOwnProperty("git")) {
            server.send(400, "application/json",
                        "{\"error\":\"Missing github link\"}");
            return;
        }
        gitLink = (const char *)json["git"];
        if(gitLink != "" or gitLink != "none"){
            codeMode = true;
        }
        else{
            codeMode = false;
        }
        Serial0.println("Coder mode " + codeMode ? "started" : "stopped");
        server.send(200, "application/json",
                    "{\"success\":true}");
    }
    else if(urlPath == "config") {
        // Check required fields
        if (!json.hasOwnProperty("ssid") ||
            !json.hasOwnProperty("password")) {
            server.send(400, "application/json",
                        "{\"error\":\"Missing ssid or password\"}");
            return;
        }
        // Open file for writing
        File file = LittleFS.open(CONFIG_FILE, "w");
        if (!file) {
            Serial0.println("Failed to open config file");
        
            server.send(500, "application/json",
                        "{\"error\":\"Failed to save configuration\"}");
            return;
        }
        file.print(body);
        file.close();
        server.send(200, "application/json",
                    "{\"success\":true}");
    }

}

bool loadConfig(String &ssid, String &password) {
    File file = LittleFS.open(CONFIG_FILE, "r");

    if (!file) {
        return false;
    }

    String json = file.readString();
    file.close();

    JSONVar config = JSON.parse(json);

    if (JSON.typeof(config) == "undefined") {
        Serial0.println("Invalid JSON");
        return false;
    }

    if (!config.hasOwnProperty("ssid") ||
        !config.hasOwnProperty("password")) {
        Serial0.println("Missing WiFi configuration");
        return false;
    }

    ssid = (const char *)config["ssid"];
    password = (const char *)config["password"];

    return true;
}

void readGitHubFile() {
    codeStarted = true;
    WiFiClientSecure client;
    client.setInsecure();  // Don't verify certificate

    HTTPClient http;

    if (!http.begin(client, gitLink)) {
        Serial0.println("HTTP begin failed");
        return;
    }

    int httpCode = http.GET();

    if (httpCode != HTTP_CODE_OK) {
        Serial0.printf("HTTP error: %d\n", httpCode);
        http.end();
        return;
    }

    WiFiClient *stream = http.getStreamPtr();

    while ((http.connected() || stream->available()) && codeMode && codeStarted) {
        while (stream->available() && codeStarted) {
            char c = stream->read();
            //Serial0.write(c);
            Keyboard.print(c);
            delay(400);
            server.handleClient();
        }
        delay(1);
    }

    http.end();
    codeStarted = false;
}

/* Main logics */

void setup() {
    Serial0.begin(115200);

    USB.manufacturerName("DasLearning");
    USB.productName("USB Keyboard");
    USB.serialNumber("USBKB0092");
    Keyboard.begin();
    USB.begin();
    delay(1000); // One second delay at startup
    Serial0.println("USB keyboard started");

    if (!LittleFS.begin(true)) {
        startAP();
    }
    else{
        String ssid;
        String password;

        if (!loadConfig(ssid, password)) {
            startAP();
        }
        else{
            if (!connectWiFi(ssid, password)) {
                startAP();
            }
        }
    }

    // Route for root / web page
    server.on("/", HTTP_GET, []() {
        File file = LittleFS.open("/index.html", "r");
        if (!file) {
            server.send(404, "text/plain", "index.html not found");
            return;
        }
        server.streamFile(file, "text/html");
        file.close();
    });
    server.on("/status", HTTP_GET, []() {
        String stat = "{\"auto\":" 
                        + String(autoMode ? "true" : "false")
                        + ", \"wifi\":"
                        + String(wifiConnected ? "true" : "false")
                        + ", \"code\":"
                        + String(codeMode ? "true" : "false")
                        + "}";
        server.send(200, "application/json", stat);
    });
    server.serveStatic("/", LittleFS, "/");
    server.on("/config", HTTP_POST, [](){
        postMethod("config");
    });
    server.on("/coder", HTTP_POST, [](){
        postMethod("coder");
    });
    server.on("/start", HTTP_POST, [](){
        postMethod("start");
    });
    server.on("/stop", HTTP_POST, [](){
        postMethod("stop");
    });
    server.begin();
    Serial0.println("Web server started");

}

void loop() {
    if(codeMode && autoMode && wifiConnected) {
        if(gitLink != "" or gitLink != "none"){
            if(!codeStarted){
                readGitHubFile();
            }
        }
        else{
            codeMode = false;
        }
    }
    else if(autoMode) {
        if (millis() - timeCounter > 3000) { // every 3 seconds
            //Serial0.println("Not in coder mode");
            timeCounter = millis();
            char randomChar = 'a' + random(26);
            Keyboard.print(randomChar);
        }
    }

    // Handle server inputs
    server.handleClient();
}
