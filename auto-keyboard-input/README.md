# Writing down local docs


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
