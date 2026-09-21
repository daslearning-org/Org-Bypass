let ipHostName = window.location.hostname;
let autoMode = false;

document.addEventListener('DOMContentLoaded', () => {
  const autoModeBtn = document.getElementById("autoModeBtn");
  const gitLinkInp = document.getElementById("gitLinkInp");
  const gitLinkBtn = document.getElementById("gitLinkBtn");

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

  gitLinkBtn.addEventListener("click", async function(event) {
    let gitLinkTxt = gitLinkInp.textContent.trim();
    if(gitLinkTxt.startsWith("https://") || gitLinkTxt.startsWith("http://")){
      let data = await postMethod("coder", {"git": gitLinkTxt});
      if(data){
        alert("Code link sent to your ESP32 keybaord ✅️")
      }
    }
    else{
      alert("You need to provide a proper link ❗");
    }
  });

});

function darkMode() {
  document.body.classList.toggle("w3-black");
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

