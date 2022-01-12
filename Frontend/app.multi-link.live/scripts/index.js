let ip;
let interval;
function pageBuilder(){
  $(".appWrapper").attr('src',`html/home.html?mode=${colorMode}`);
  $(".guiWrapper").addClass(`${getColor("whiteBG","whiteBGi")}`);
  setWindowToGui();
}
function checkForIp(){
  return setInterval(()=>{
      getDBdata('getVar|home|adminDefaultIp').then(e=>{
        if (ip != e.data[1]){
          ip = e.data[1];
          console.log(ip);
          $(".guiWrapper").attr('src',`http://${e.data[1]}`);

        }
      });
  },2000);
}

function setWindowToGui(){
  $("*").removeClass("selected");
  $(".guiButton").addClass("selected");
  getDBdata('getVar|home|defaultRoom').then(e=>{
    $(".guiWrapper").attr('src',`http://${e.data[1]}`);
    hideLoader();
  });
  interval = checkForIp();
}
