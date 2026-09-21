let ipHostName = window.location.hostname;
let autoMode = false;
let codeMode = false;
let wifiOk = false;

document.addEventListener('DOMContentLoaded', () => {
  const autoModeBtn = document.getElementById("autoModeBtn");
  const codeModeBtn = document.getElementById("codeModeBtn");
  const gitLinkInp = document.getElementById("gitLinkInp");
  const gitLinkBtn = document.getElementById("gitLinkBtn");
  const wifiSetupDiv = document.getElementById("wifiSetupDiv");
  const gitCodeDiv = document.getElementById("gitCodeDiv");
  const ssidInp = document.getElementById("ssidInp");
  const wifiPswdInp = document.getElementById("wifiPswdInp");
  const wifiSetBtn = document.getElementById("wifiSetBtn");

  autoModeBtn.addEventListener("click", async function(event) {
    if(autoMode){
      let data = await postMethod("stop", {"stop": "ok"});
      if(data){
        autoModeBtn.className.replace("w3-orange", "w3-green");
        autoModeBtn.textContent = "Start Auto Mode";
        autoMode = false;
      }
    }
    else{
      let data = await postMethod("start", {"start": "on"});
      if(data){
        autoModeBtn.className.replace("w3-green", "w3-orange");
        autoModeBtn.textContent = "Stop Auto Mode";
        autoMode = true;
      }
    }
  });

  codeModeBtn.addEventListener("click", async function(event) {
    if(codeMode){
      let data = await postMethod("coder", {"git": "none"});
      if(data){
        codeModeBtn.classList.add("w3-hide");
        codeMode = false;
        alert("Code method is stopped, you may start again by Set Code button.");
      }
    }
  });

  wifiSetBtn.addEventListener("click", async function(event) {
    let ssidTxt = ssidInp.textContent.trim();
    let wifiPassTxt = wifiPswdInp.textContent.trim();
    if(ssidTxt.length<=2 || wifiPassTxt.length<=2){
      alert("Carefully enter wifi name (ssid) & password");
      return;
    }
    let data = await postMethod("config", {"ssid": ssidTxt, "password": wifiPassTxt});
    if(data){
      this.disabled = true;
      alert("Wifi credentials saved, please reboot your esp32 (unplug & plug) ✅️")
    }
  });

  gitLinkBtn.addEventListener("click", async function(event) {
    let gitLinkTxt = gitLinkInp.textContent.trim();
    if(gitLinkTxt.startsWith("https://") || gitLinkTxt.startsWith("http://")){
      let data = await postMethod("coder", {"git": gitLinkTxt});
      if(data){
        codeModeBtn.classList.remove("w3-hide");
        alert("Code link sent to your ESP32 keybaord ✅️")
      }
    }
    else{
      alert("You need to provide a proper link ❗");
    }
  });

  const statData = getMethod("status");
  if(statData){
    if(statData["auto"]){
        autoMode = true;
    }
    if(statData["wifi"]){
        wifiOk = true;
    }
    if(statData["code"]){
        codeMode = true;
    }
  }

  if(autoMode){
    autoModeBtn.className.replace("w3-green", "w3-orange");
    autoModeBtn.textContent = "Stop Auto Mode";
  }

  if(codeMode){
    codeModeBtn.classList.remove("w3-hide");
    codeModeBtn.className.replace("w3-green", "w3-orange");
    codeModeBtn.textContent = "Stop Code Mode";
  }

  if(wifiOk){
    wifiSetupDiv.classList.add("w3-hide");
    gitCodeDiv.classList.remove("w3-hide");
    codeModeBtn.classList.remove("w3-hide");
  }
  else{
    wifiSetupDiv.classList.remove("w3-hide");
    gitCodeDiv.classList.add("w3-hide");
  }


});

function darkMode() {
  document.body.classList.toggle("w3-black");
}

async function getMethod(path) {
  let url = `http://${ipHostName}/${path}`;
  try {
    const response = await fetch(url);

    // Check if the response status is successful (200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Returns the data (resolves the promise)
  }
  catch (error) {
    console.error('Fetch error:', error);
    throw error; // Re-throw so the caller knows it failed
  }
}

async function postMethod(path, payload) {
  let url = `http://${ipHostName}/${path}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(payload)
    });

    // Check if the response status is successful (200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success:', data);
    return data;
  }
  catch (error) {
    console.error('Error:', error);
  }
}

