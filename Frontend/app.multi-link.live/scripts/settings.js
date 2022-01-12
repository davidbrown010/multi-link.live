var rooms = new Map();
var services = new Map();

function pageBuilder(){
  $('body').prepend(`<div class = 'settingsHeader font1Bold ${getColor('greyText','greyTexti')}'>Settings</div>`);
  getDBdata('getVars|home|*').then(e=>{
    let settingTypes = new Map();
    settingTypes.set('manualConnectionPing',['Manual Connection','toggle']);
    settingTypes.set('darkMode',['Dark Mode','toggle']);
    settingTypes.set('defaultMinistry',['Default Ministry','select']);
    settingTypes.set('defaultRoom',['Default Room','select']);

    e.data.forEach(setting => {
      if (settingTypes.has(setting[0])){
        $(`
          <div class = 'settingWrapper'>
            <div class = 'settingsText font2 ${getColor('greyText','greyTexti')}'>
              ${settingTypes.get(setting[0])[0]}
              <div class = 'infoCard circle clickable ${getColor('whiteBG outerShadow','whiteBGi outerShadowi')}' id='${setting[0]}ICard' onclick ='showICard(this.id)'>i</div>
            </div>

            <div class = 'controller'>
              <div id='${setting[0]}Control' class = '${settingTypes.get(setting[0])[1]} font2Bold ${getColor('greyText outerShadow','greyTexti outerShadowi')}'
            </div>
          </div>
          `).insertBefore($('.pageWrapper'));
      }

    });
    $(`
      <div class = 'settingWrapper'>
        <div class = 'settingsText font2 ${getColor('greyText','greyTexti')}'>
          Matrix Storage
          <div class = 'infoCard circle clickable ${getColor('whiteBG outerShadow','whiteBGi outerShadowi')}' id='matrixStorageICard' onclick ='showICard(this.id)'>i</div>
        </div>
        <div class = 'controller'>
          <div id='matrixStorageControl' class = 'button font2Bold ${getColor('greyText outerShadow','greyTexti outerShadowi')}'></div>
        </div>
      </div>
      `).insertBefore($(".pageWrapper"));
    //adds elements
    $(".toggle").append(`
      <div class = 'circle clickable toggleMarker ${getColor('color1BG','color1BGi')}'></div>
      <div class = 'curve2 clickable toggleBody innerShadow color1BGlight'></div>
      `);
    $('.select').append(`
      <div class = 'curve2 selectMarker innerShadow color1BGlight'></div>
      <select class = 'resetStyles curve2 clickable selectBody'></select>
      `);
    $('.button').append(`
      <div class = 'curve2 buttonBody clickable errorBGlight'></div>
      `);
    //gets data for ministry maps
    getPCOdata('folders?order=name','').then(result => {
      let folders = result.data;
      //comehere
      getPCOdata('service_types?per_page=200&order=name','').then(reply => {
        let service_types = reply.data;

        folders.forEach(u => {
          let folderId = u.id;
          let servicesMap = new Map();
          service_types.forEach(s => {
            if (folderId == s.relationships.parent.data.id){
              servicesMap.set(s.id, new ServiceObj(s.attributes.name,s.id,s.relationships.parent.data.id));
            }
          });
          services.set(folderId,new Folder(u.attributes.name,folderId,servicesMap));
        });

        //gets room data for room map
        getDBdata('getVars|playlistRooms|*','').then(roomData => {
          roomData.data.forEach(j => {
            rooms.set(j[1],j[0]);
          });
          //adds functions to elements
          $(".controller").each((i,elem)=>{
            let controller = elem.children[0];
            switch(controller.id){
              case 'manualConnectionPingControl':
                controller.setAttribute('onclick','togglePress(this)');
                if (!e.data[i+5][1]){
                  controller.children[0].setAttribute('style','left:0;');
                  controller.children[0].setAttribute('id','false');
                }
                else{
                  controller.children[0].setAttribute('id','true');
                }
              break;
              case 'darkModeControl':
                controller.setAttribute('onclick','togglePress(this)');
                if (!e.data[i+5][1]){
                  controller.children[0].setAttribute('style','left:0;');
                  controller.children[0].setAttribute('id','false');
                }
                else{
                  controller.children[0].setAttribute('id','true');
                }
              break;
              case 'defaultMinistryControl':
                let ministrySplit1 = e.data[i+5][1].split('-')[0];
                let ministrySplit2 = e.data[i+5][1].split('-')[1];
                let optionsString2 = '';
                services.forEach((v,k)=> {
                  optionsString2 += `<optgroup label="${v.folderName}">`;
                  v.servicesMap.forEach((v2,k2)=>{
                    optionsString2 += `<option value = '${v.folderId}-${v2.serviceId}' ${v2.serviceId==ministrySplit2 ? 'selected' : ''}>${v2.serviceName}</option>`
                  });
                  optionsString2 += '</optgroup>'
                });
                controller.children[1].innerHTML = optionsString2;
                controller.children[1].setAttribute('onchange','selectNew(this)');
                controller.children[0].innerHTML = services.get(ministrySplit1).servicesMap.get(ministrySplit2).serviceName;
              break;
              case 'defaultRoomControl':
                let optionsString = '';
                rooms.forEach((val, key)=> {
                  optionsString += `<option ${e.data[i+5][1] == key ? 'selected':''} value = '${key}'>${val}</option>`;
                });
                controller.children[1].innerHTML = optionsString;
                controller.children[1].setAttribute('onchange','selectNew(this)');
                controller.children[0].innerHTML = rooms.get(e.data[i+5][1]);
              break;
              case 'matrixStorageControl':
                controller.children[0].innerHTML = '<span>ERASE MATRIX</span>';
                controller.setAttribute('onclick','eraseMatrixPreview()');
              break;
            }
          });
          hideLoader();
        });
      });
    });
  });
}
function togglePress(elem){
  if (elem.children[0].id == 'true'){
    elem.children[0].id = 'false';
    elem.children[0].setAttribute('style','');
    elem.children[0].setAttribute('style','left:0;');
  }
  else {
    elem.children[0].id = 'true';
    elem.children[0].setAttribute('style','');
    elem.children[0].setAttribute('style','right:0;');
  }
  changeSetting(elem.id,(elem.children[0].id =='true'?true:false));
}
function selectNew(elem){
  elem.parentElement.children[0].innerHTML = elem.options[elem.selectedIndex].text;
  changeSetting(elem.parentElement.id,elem.value);
}
function changeSetting(name, val){
  console.log(name+": "+val);
  if (name=='darkModeControl') showHider();
  setDBdata('setVar|home',`${name.replace('Control','')}=${val}`).then(()=>{
    if (name == 'darkModeControl'){
      window.location.href = `settings.html?mode=${val?'1':'0'}`;
    }
  });
}
function eraseMatrixPreview(){
  $("#matrixStorageControl")[0].children[0].innerHTML = '<span>TAP TO CONFIRM</span>';
  $("#matrixStorageControl").attr('onclick','eraseMatrix()');
  $("#matrixStorageControl")[0].children[0].setAttribute('style','animation:warning ease 1s infinite;');
}
function eraseMatrix(){
  $("#matrixStorageControl").attr('onclick','');
  setDBdata('deleteMatrixCache','').then(()=>{
    setTimeout(()=>{
      $("#matrixStorageControl")[0].children[0].innerHTML = '<span>ERASE MATRIX</span>';
      $("#matrixStorageControl").attr('onclick','eraseMatrix()');
      $("#matrixStorageControl")[0].children[0].setAttribute('style','');
    },1000);
    $("#matrixStorageControl")[0].children[0].innerHTML = '<span>SUCCESS</span>';
    $("#matrixStorageControl")[0].children[0].setAttribute('style','background-color:#93c47dff;');
  });
}
class Folder{
  constructor(folderName, folderId, servicesMap){
    this.folderName = folderName;
    this.folderId = folderId;
    this.servicesMap = servicesMap;
  }
}
class ServiceObj{
  constructor(serviceName, serviceId, parentLinkId){
    this.serviceName =serviceName;
    this.serviceId = serviceId;
    this.parentLinkId = parentLinkId;
  }
}
