var checkStatus = '';
var rooms = new Map();
var playlistPos = new Map();
var ministry;
var serviceType;
var service;
var auth;
var itemTotal;
var itemList = [];
var currentPos;
let color1 = '#542D9B';
let color2 = '#de926a';
var manualConnection;
var currentRoom;
var defaultRoom;
var roomIp;
var disabledDevices = [];
var deviceIcons = new Map();
var selectedMatrixEditItem;
var sessionLoadTime = 3000;

function pageBuilder(){
  $(".header").addClass(`${colorMode == 0 ? 'greyText' : 'greyTexti'} font1Bold`);
  $('.header').text('Playlist Manager');
  getDBdata('getVars|home|*').then(j => {
    let data = j.data;
    ministry = data[0][1];
    serviceType = data[1][1];
    service = data[2][1];
    auth = data[3][1];
    manualConnection = data[5][1];
    defaultRoom = data[8][1];
    let intervalCheck;
    checkServerStatus(manualConnection);
    checkPlaylistPos();

    if (!manualConnection) intervalCheck = setInterval(()=>{
      if (manualConnection){
        clearInterval(intervalCheck);
      }
      else{
        checkServerStatus(manualConnection);
        checkPlaylistPos();
        checkDisabledDevices();
        checkMatrix();
        checkRooms();
      }
    },5000);

    getPCOdata(`service_types/${serviceType}/plans/${service}`,auth).then(reply => {
      let data = reply.data;
      let seriesTitle = data.attributes.series_title;
      let serviceTitle = data.attributes.title;
      let serviceDate = data.attributes.dates;
      let serviceId = data.id;
      $(".infoContent").append(`
        <div class = 'infoDate whiteText font1Bold'>${serviceDate.split(",")[0]+',<br>'+serviceDate.split(",")[1].replace(' ','')}</div>
        <div class='whiteText font1 infoServiceType'>${serviceTitle}</div>`);
      getPCOdata(`series?where[title]=${seriesTitle}`,auth).then(e => {
        let seriesURL = e.data[0];
        $(".infoBoxWrapper").attr("style", `background-image:${seriesURL!=null?"url('"+seriesURL.attributes.artwork_original+"')":'linear-gradient(to bottom right, '+color1+','+color2}`);
      });
      let matrixData = '';
      getDBdata(`getVars|matrix${service}|*`).then(a=>{
        matrixData = a.data;
      }).then(()=>{
      getPCOdata(`service_types/${serviceType}/plans/${service}/items?include=item_notes`,auth).then(e =>{


        getDBdata('getVars|playlistPositions|*').then(p=>{
          let servicePositions = p.data;

          for (i in servicePositions){
            playlistPos.set(servicePositions[i][0],[servicePositions[i][1],servicePositions[i][2],servicePositions[i][3]]);
          }

          //if exists, set playlist position, if not, create one
          let playlistExists = false;
          playlistPos.forEach((value, key) => {
            if (key == service){
              updateCircle((value[0]/itemTotal)*100);
              currentPos = value[0];
              playlistExists = true;
            }
          });
          if (!playlistExists){
            updateCircle(0);
            currentPos = 0;
            setDBdata('setVar|playlistPositions',`${service}=${currentPos}=${defaultRoom}=`);
            playlistPos.set(service,[currentPos,defaultRoom,]);
          }
        }).then(j => {
          //creates room area
          getDBdata('getVars|playlistRooms|*').then(k=>{
            $(".devicesWrapper").append(`
              <div class = 'roomSelector ${colorMode == 0 ? 'greyText' : 'greyTexti'} font2Bold'>
                <div class = 'roomSelect clickable font2Bold ${colorMode == 0 ? 'greyText' : 'greyTexti'}' onclick = 'showRoomSelectionMenu()'></div>
                <div class = 'font1 devicesText'>Devices</div>
                <div class = 'editRoomsButtonWrapper'><div class = 'curve2 clickable iconShadow editRoomsButton font1 ${colorMode == 0 ? 'greyText whiteBG' : 'greyTexti whiteBGi'}'onclick = 'editRooms()'>Edit</div></div>
              </div>
              <div class = 'devicesContainer font1'>
                <div class = 'devicesScrollWrapper'></div>
              </div>
              `);
            let data = k.data;
            //creates options for room names and adds room to map
            for (i in data){
              let name = data[i][0];
              rooms.set(data[i][1],new Room(name,data[i][2],data[i][3]));
            }

            try{
              if (playlistPos.get(service)[2].split("^").length == 1 && playlistPos.get(service)[2].split("^")[0] == ""){

              }
              else{
                disabledDevices = playlistPos.get(service)[2].split("^");
              }
            }
            catch {
              disabledDevices = [playlistPos.get(service)[2]];
            }
            selectRoom(playlistPos.get(service)[1],true).then(()=>{
              itemAr = e.data;
              let itemNotes = e.included;
              let emptyMatrix = false;
              itemList.push(new ItemObj('Start','nullNode',0,'','000000000',itemList.length,'','',''));
              itemAr.forEach(j=>{
                  let itemNoteId = '';
                  for (i in itemNotes){
                    if (itemNotes[i].attributes.category_name.toLowerCase() == 'automation id' && itemNotes[i].relationships.item.data.id == j.id){
                      itemNoteId = itemNotes[i].attributes.content;
                    }
                  }
                  let page = '';
                  let matrixDevices = new Map();
                  try {
                    page = matrixData[parseInt(itemNoteId)][1];
                    matrixDevicesTemp = matrixData[itemNoteId].slice(2,matrixData[itemNoteId].length);
                    if (matrixDevicesTemp.length == 0){
                      emptyMatrix = true;
                      rooms.get(currentRoom).deviceAr.forEach(currentRoomDevice =>{
                        matrixDevices.set(currentRoomDevice.identifier,1);
                      });
                    }
                    else {
                      for (i in matrixDevicesTemp){
                        matrixDevices.set(matrixDevicesTemp[i].split("^")[0], matrixDevicesTemp[i].split("^")[1]);
                      }
                    }
                  }
                  catch{}
                  itemList.push(new ItemObj(j.attributes.title,j.attributes.item_type,j.attributes.length,itemNoteId, j.id, itemList.length, page, matrixDevices));


              });
              if (emptyMatrix){
                updateDBMatrixAll();
              }
              itemTotal = itemList.length;
              //creates an end node for playlist
              itemList.push(new ItemObj('End','nullNode',0,'','999999999',itemList.length,'','',''));
              $(".playlistItemsWrapper").addClass(`${colorMode == 0 ? 'whiteBG outerShadow' : 'whiteBGi outerShadowi'}`);

              itemList.forEach(g => {
                //comeHere
                if (g.type == 'nullNode'){
                  $(".playlistItemsWrapper").append(`
                    <div class = 'playlistItemNullNode ${getColor('outerShadow','outerShadowi')} ${getColor('whiteBG','lightBGi')} curve1 clickable ${getColor('greyText','blackTexti')}' id = '${g.id}' onclick = 'selectItem(this,false)'>
                      <div class = 'playlistItemCircle circle ${getColor('outerShadow','outerShadowi')}'></div>
                      <div class = 'playlistItemNameNullNode font1Bold'>${g.name}</div>
                      <div class = 'playlistItemLength font1'><span></span></div>
                    </div>
                    `);
                }
                else if (g.type !='header'){
                  $(".playlistItemsWrapper").append(`
                    <div class = 'playlistItem ${getColor('outerShadow','outerShadowi')} ${getColor('whiteBG','lightBGi')} curve1 clickable ${getColor('greyText','blackTexti')}' id = '${g.id}' onclick = 'selectItem(this,true)'>
                      <div class = 'playlistItemCircle circle ${getColor('outerShadow','outerShadowi')}'></div>
                      <div class = 'playlistItemName font1Bold'>${g.name}</div>
                      <div class = 'playlistItemLength font1'>
                        <svg class = 'clockWrapper' x="0px" y="0px" viewBox="0 0 512 512">
                          <path d="M347.216,301.211l-71.387-53.54V138.609c0-10.966-8.864-19.83-19.83-19.83c-10.966,0-19.83,8.864-19.83,19.83v118.978
                            c0,6.246,2.935,12.136,7.932,15.864l79.318,59.489c3.569,2.677,7.734,3.966,11.878,3.966c6.048,0,11.997-2.717,15.884-7.952
                            C357.766,320.208,355.981,307.775,347.216,301.211z"/>
                          <path d="M256,0C114.833,0,0,114.833,0,256s114.833,256,256,256s256-114.833,256-256S397.167,0,256,0z M256,472.341
                            c-119.275,0-216.341-97.066-216.341-216.341S136.725,39.659,256,39.659c119.295,0,216.341,97.066,216.341,216.341
                            S375.275,472.341,256,472.341z"/>
                        </svg>
                        <div style = 'margin-left:1vw;'>${toTime(g.length)}</div>
                      </div>
                    </div>
                    `);
                }
              });
              selectItem(document.getElementById(itemList[currentPos].id),false).then(()=>{
                hideLoader();
              });





            });



          });
        });

      });
    });


    });

    getDBdata(`getVars|matrix${service}|*`).then(e=>{
      e.data.forEach(i=>{
        if (i[0]!='id'){
          itemList.forEach(j =>{
            if (i[0] == j.automationId){
              j.matrixItem.page = i[1];
              j.matrixItem.page = i[1];
            }
          });
        }
      });
    });


  });

}
function showRoomSelectionMenu(){
  returnString = '';
  rooms.forEach((e, key) => {
  let selectedClass = key == currentRoom ? 'color2Text font2Bold noCaps' : (colorMode == 0 ? 'greyText font1' : 'greyTexti font1');
  returnString += '<div class = "roomSelectionText clickable '+selectedClass+'" id = "'+key+'" onclick = "selectRoom(this.id,false); hideRoomSelectionMenu()">'+e.name+'</div>';
  });
  $(`
    <div class = 'roomSelectionMenu curve1 ${colorMode == 0 ? 'whiteBG outerShadow' : 'whiteBGi outerShadowi'}'>
      ${returnString}
    </div>
    `).insertBefore(".pageWrapper");
  $('.roomSelect').attr("onclick",'hideRoomSelectionMenu()');
}
function hideRoomSelectionMenu(){
  $(".roomSelectionMenu").remove();
  $(".roomSelect").attr("onclick","showRoomSelectionMenu()");
}
//creates new room
function editRooms(){
  $(".roomSelectionMenu").remove();
  let roomString = ``;
  rooms.forEach((e, key) => {
    let selectedClass = key == currentRoom ? (colorMode == 0 ? 'color1BG' : 'color1BGi') : (colorMode == 0 ? 'lightMediumBG' : 'lightMediumBGi');
    roomString += `<div class = "editorRoom curve1 ${selectedClass}" id = "${key}">
      <div class = 'editorButtonWrapper'>
        <div style = '${key == currentRoom ? 'grid-column:row2':""}' class = 'editorEdit circle clickable ${colorMode == 0 ? 'whiteBG outerShadow' : 'whiteBGi outerShadowi'}' id = '${key}' onclick = 'openDeviceEditor(this)'>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" class = 'scaleDown' height="16" viewBox="0 0 16 16"><path fill="${getColor('rgb(100,100,100)','rgb(170,170,170)')}" d="M13.6568542,2.34314575 C14.4379028,3.12419433 14.4379028,4.39052429 13.6568542,5.17157288 L6.27039414,12.558033 C5.94999708,12.87843 5.54854738,13.105727 5.10896625,13.2156223 L2.81796695,13.7883721 C2.45177672,13.8799197 2.12008033,13.5482233 2.21162789,13.182033 L2.78437771,10.8910338 C2.894273,10.4514526 3.12156995,10.0500029 3.44196701,9.72960586 L10.8284271,2.34314575 C11.6094757,1.56209717 12.8758057,1.56209717 13.6568542,2.34314575 Z M10.1212441,4.46435931 L4.14907379,10.4367126 C3.95683556,10.6289509 3.82045738,10.8698207 3.75452021,11.1335694 L3.38388341,12.6161166 L4.86643062,12.2454798 C5.1301793,12.1795426 5.37104912,12.0431644 5.56328736,11.8509262 L11.5352441,5.87835931 L10.1212441,4.46435931 Z M11.5355339,3.05025253 L10.8282441,3.75735931 L12.2422441,5.17135931 L12.9497475,4.46446609 C13.3402718,4.0739418 13.3402718,3.44077682 12.9497475,3.05025253 C12.5592232,2.65972824 11.9260582,2.65972824 11.5355339,3.05025253 Z"/></svg>
        </div>
      ${key != currentRoom ? "<div class = 'editorRemove clickable circle outerShadow errorBG' id="+key+" onclick = 'eraseRoom(this)'><div class = 'editorRemoveLine whiteBG'></div></div>" : ''}
      </div>
      <input id = '${key}' type='text' class = 'editorRoomName resetStyles ${colorMode == 0 ? 'blackText' : 'blackTexti'} font2Semibold' onblur = 'updateRoomName(this, value);' value = "${e.name}">
      <input id = '${key}' type = 'text' class = 'editorRoomIp resetStyles ${colorMode == 0 ? 'blackText' : 'blackTexti'} font2' onblur = 'updateRoomIp(this, value);' value = '${e.ip}'>
    </div>`;
  });
  $("body").append(`
    <div class = 'editPane curve1 ${colorMode == 0 ? 'whiteBG outerShadow' : 'lightBGi outerShadowi'}'>
      <div class = 'editPaneHeader font2Semibold ${colorMode == 0 ? 'greyText' : 'greyTexti'}'>Room Manager</div>
      ${roomString}
      <div class = 'createRoomButton font2Bold curve2 ${getColor('outerShadow','outerShadowi')} whiteText color2BG clickable' onclick = 'createRoom()'>CREATE ROOM</div>
    </div>
    `);
  createExitBox(`
    hideLoader();
    $(".editPane").attr('style','animation: wipeUpi .5s forwards');
    setTimeout(function(){$(".editPane").remove();},500);`
  );
}
function updateRoomName(elem, newName){
  id = elem.id;
  setDBdata('setVarName|playlistRooms',`${rooms.get(id).name+'='+newName}`);
  rooms.get(id).name = newName;
  rooms.set(id, rooms.get(id));
}
function updateRoomIp(elem, newIp){
  id = elem.id;
  rooms.get(id).ip = newIp;
  rooms.set(id, rooms.get(id));
  roomIp = rooms.get(currentRoom).ip;
    console.log(roomIp);
  setDBdata('setVar|playlistRooms',`${rooms.get(id).name+'='+getKeyByVal(rooms,rooms.get(id))+'='+newIp}`);
}
function getKeyByVal(map, val){
  let key = -1;
  map.forEach((v,k)=>{
    let compare = true;
    for (x in v){
      try{
        if (v[x] != val[x]){
          compare = false;
        }
      }
      catch{
        compare = false;
      }
    }
    if (compare) key = k;
  });
  return key;
}
function createRoom(){
  let newRoomName = 'Untitled Room';
  let sameRoomNameAr = [];
  rooms.forEach(e => {
    if(e.name.includes(newRoomName)) sameRoomNameAr.push(e.name);
  });
  if (sameRoomNameAr.length > 0) newRoomName += " " + (sameRoomNameAr.length+1);

  let newRoom = new Room(newRoomName,"blank_ip","");
  let key = generateRoomId();
  rooms.set(key,newRoom);

  $(`<div class = "editorRoom curve1 ${getColor("lightMediumBG","lightMediumBGi")}" id = "${key}">
    <div class = 'editorButtonWrapper'>
      <div style = '${key == currentRoom ? 'grid-column:row2':""}' class = 'editorEdit circle clickable ${colorMode == 0 ? 'whiteBG outerShadow' : 'whiteBGi outerShadowi'}' id = '${key}' onclick = 'openDeviceEditor(this)'>
        <svg xmlns="http://www.w3.org/2000/svg" class = 'scaleDown' width="16" height="16" viewBox="0 0 16 16"><path fill="${getColor('rgb(100,100,100)','rgb(170,170,170)')}" d="M13.6568542,2.34314575 C14.4379028,3.12419433 14.4379028,4.39052429 13.6568542,5.17157288 L6.27039414,12.558033 C5.94999708,12.87843 5.54854738,13.105727 5.10896625,13.2156223 L2.81796695,13.7883721 C2.45177672,13.8799197 2.12008033,13.5482233 2.21162789,13.182033 L2.78437771,10.8910338 C2.894273,10.4514526 3.12156995,10.0500029 3.44196701,9.72960586 L10.8284271,2.34314575 C11.6094757,1.56209717 12.8758057,1.56209717 13.6568542,2.34314575 Z M10.1212441,4.46435931 L4.14907379,10.4367126 C3.95683556,10.6289509 3.82045738,10.8698207 3.75452021,11.1335694 L3.38388341,12.6161166 L4.86643062,12.2454798 C5.1301793,12.1795426 5.37104912,12.0431644 5.56328736,11.8509262 L11.5352441,5.87835931 L10.1212441,4.46435931 Z M11.5355339,3.05025253 L10.8282441,3.75735931 L12.2422441,5.17135931 L12.9497475,4.46446609 C13.3402718,4.0739418 13.3402718,3.44077682 12.9497475,3.05025253 C12.5592232,2.65972824 11.9260582,2.65972824 11.5355339,3.05025253 Z"/></svg>
      </div>
      ${key != currentRoom ? "<div class = 'editorRemove clickable circle "+getColor('outerShadow','outerShadowi')+" errorBG' id="+key+" onclick = 'eraseRoom(this)'><div class = 'editorRemoveLine whiteBG'></div></div>" : ''}
    </div>
    <input id = '${key}' type='text' class = 'editorRoomName resetStyles ${colorMode == 0 ? 'blackText' : 'blackTexti'} font2Semibold' onblur = 'updateRoomName(this, value);' value = "${newRoom.name}">
    <input id = '${key}' type = 'text' class = 'editorRoomIp resetStyles ${colorMode == 0 ? 'blackText' : 'blackTexti'} font2' onblur = 'updateRoomIp(this, value);' value = '${newRoom.ip}'>
  </div>`).insertBefore(".createRoomButton");
  $(".editPane").scrollTop($(".editPane")[0].scrollHeight);
  setDBdata("setVar|playlistRooms",`${newRoom.name}=${key}=${newRoom.ip}=${newRoom.deviceAr}`);
}
function eraseRoom(elem){
  let id = elem.id;
  setDBdata(`deleteVar|playlistRooms|${rooms.get(id).name}`,'');
  elem.parentElement.parentElement.remove();
  rooms.delete(id);
}
function setPlaylistPosition(index,triggerMidi){
  currentPos = index;
  updateCircle((index/itemTotal)*100);
  let elem = document.getElementById(itemList[index].id);
  let item = itemList[index];
  if (!manualConnection){
    setDBdata('setVar|playlistPositions',`${service}=${index}`);
  }
  if (triggerMidi && item.type !='nullNode' && !manualConnection){
    let devicesToTrigger = item.matrixItem.matrixDeviceMap;
    let automationCol = '';
    let isDeviceDisabled = false;
    devicesToTrigger.forEach((row, key) => {
      rooms.get(currentRoom).deviceAr.forEach(d => {
        if (d.identifier == key){
          automationCol = d.colId;
        }
        if (disabledDevices.indexOf(key) == -1) isDeviceDisabled = true;
      });
      let deviceRow = row;
      if (isDeviceDisabled){
        try{
          let recieved = false;
          setTimeout(()=>{
            if (!recieved){
              xhr.abort();
              console.log('timeout');
            }
          },sessionLoadTime);
          let xhr = $.ajax({
            url:'http://'+roomIp+`/press/bank/${item.matrixItem.page}/${getCompanionButtonId(deviceRow, automationCol)}`,
            type:'GET',
            crossDomain: true,
            processData:false,
            success:()=>{
              recieved = true;
              console.log('success');
            },
            error:()=>{
              recieved = true;
              console.log('err');
            }
          });
        }
        catch{}
      }
    });

  }

}

function getCompanionButtonId(row, col){
  row = parseInt(row);
  col = parseInt(col);
  let result = ((row-1)*8)+col;
  return result;
}
//checks for updates
function checkPlaylistPos(){
  let posStamp = currentPos;
  getDBdata(`getVar|playlistPositions|${service}`).then(e => {
    //checks to make sure user hasn't updated the pos since the sync query was sent. if changed, the new position won't be synced
    if (posStamp == currentPos){
      try{
        //wont update unless different
        if (e.data[1] != currentPos){
          updateCircle((e.data[1]/itemTotal)*100);
          setPlaylistPosition(e.data[1],false);
          selectItem(document.getElementById(itemList[e.data[1]].id),false);
        }
      }catch{}
    }

  });

}
//periodically checks if companion connection is active
function checkServerStatus(isDisabled){
  let isActive = true;
  let recieved = false;
  try{
    setTimeout(()=>{
      if (!recieved){
        xhr.abort();
        $("#manualConnectionPing").removeClass('errorBG successBG nullBG');
        $("#manualConnectionPing").attr('style','');
        isActive=false;
        $("#manualConnectionPing").addClass(`${!isDisabled ? isActive ? 'successBG' : 'errorBG' : 'nullBG'}`);
      }
    },sessionLoadTime);
    let xhr = $.ajax({
      url:'http://'+roomIp+'/press/bank/99/1',
      type:'GET',
      crossDomain: true,
      processData:false,
      success:()=>{
        recieved = true;
        $("#manualConnectionPing").removeClass('errorBG successBG nullBG');
        $("#manualConnectionPing").attr('style','');
        isActive = true;
        $("#manualConnectionPing").addClass(`${!isDisabled ? isActive ? 'successBG' : 'errorBG' : 'nullBG'}`);
      },
      error:()=>{
        recieved = true;
        $("#manualConnectionPing").removeClass('errorBG successBG nullBG');
        $("#manualConnectionPing").attr('style','');
        isActive=false;
        $("#manualConnectionPing").addClass(`${!isDisabled ? isActive ? 'successBG' : 'errorBG' : 'nullBG'}`);
      }
    });
  }
  catch{}

}
function checkDisabledDevices(){

}
function checkMatrix(){

}
function checkRooms(){

}
//disables connection checks
function disableConnectionCheck(elem){
  console.log('connection Checl');
  isManual = elem.classList.contains("nullBG");
  setDBdata('setVar|home',`manualConnectionPing=${!isManual}`);
  elem.style.animation = 'pinging 4s infinite';
  checkServerStatus(!isManual);
  manualConnection = !isManual;
  let intervalCheck;
  if (!manualConnection) intervalCheck = setInterval(()=>{
    if (manualConnection){
      clearInterval(intervalCheck);
    }
    else{
      checkServerStatus(manualConnection);
      checkPlaylistPos();
      checkDisabledDevices();
      checkMatrix();
      checkRooms();
    }
  },5000);
}
function updateCircle(percent){
  $("#changingCircle").attr(`stroke-dasharray`,`${percent}, 100`);
}



//creates elements for selected room
function selectRoom(roomId,init){
  let p = new Promise((resolve, reject)=>{
    let currentRoomProperties = '';
    try{
      currentRoomProperties = rooms.get(roomId);
      if (currentRoomProperties == null) throw new Error();
      currentRoom = roomId;
    }
    catch{
      let catchRoom = Array.from(rooms)[0][0];

      currentRoomProperties = rooms.get(catchRoom);
      currentRoom = roomId;
    }
    roomIp = currentRoomProperties.ip;
    setDBdata('setVar|home',`adminDefaultIp=${roomIp}`);
    if (!init){
      disabledDevices.splice(0, disabledDevices.length);
      itemList.forEach(itemEntry =>{
        if(itemEntry.type !='nullNode'){
          itemEntry.matrixItem.matrixDeviceMap.clear();
        }
      });
      itemList.forEach(e =>{
        if(e.type !='nullNode'){
          rooms.get(currentRoom).deviceAr.forEach(a=>{
            e.matrixItem.matrixDeviceMap.set(a.identifier,1);
          });
        }
      });
      updateDBMatrixAll();
    }
    $(".roomSelect").text(rooms.get(currentRoom).name.substring(0,13)+(rooms.get(currentRoom).name.substring(0,13).length > 12 ? "...":""));
    setDBdata('setVar|playlistPositions',`${service}=${currentPos}=${currentRoom}=${init ? disabledDevices.toString().replaceAll(",","^"): ''}`);
    let devicesAr = currentRoomProperties.deviceAr;
    $(".devicesScrollWrapper").empty();
    for (i in devicesAr){
      $(".devicesScrollWrapper").append(`
          <div class = 'deviceBoxContainer' id = '${devicesAr[i].identifier}e'>
            <div class = 'deviceBox clickable ${colorMode == 0 ? 'whiteBG' : 'whiteBGi'}' id = 'deviceButton${devicesAr[i].identifier}' onclick = 'toggleManualDevice(this)'>
              <div style = 'width:80%; height:80%; display:grid; place-items:center;' class = '${disabledDevices.indexOf(devicesAr[i].identifier) != -1 ? 'disabledDevice' : ""} ${devicesAr[i].type}'></div>
            </div>
            <div class = 'deviceName ${colorMode == 0 ? 'greyText' : 'greyTexti'}'>${devicesAr[i].name}</div>
          </div>
        `);
    }
    $(".devicesScrollWrapper").append(`
      <div class = 'roomDevicesRightSpacer' style = 'width:3vw;'></div>
    `);
    /*
    <div class = 'deviceBox clickable ${colorMode == 0 ? 'whiteBG' : 'whiteBGi'} addDevice' onclick = 'createDeviceButton()'>
      <div class = 'reAlign horizontalLine2 ${colorMode == 0 ? 'color1BG' : 'color1BGi'} curve2 plusButton1'></div>
      <div class = 'reAlign verticalLine2 ${colorMode == 0 ? 'color1BG' : 'color1BGi'} curve2 plusButton2'></div>
    </div>


    */
    generateDeviceIcons();
    resolve("complete");
  });
  return p;
}
function openDeviceEditor(elem){
  elem.parentElement.parentElement.classList.add("currentlyEditing");
  $(".editPane").children().filter((index,elem)=> {
    return !(elem.classList.contains("createRoomButton"));
  }).attr('onclick','');
  let children = $(".editPane").children().filter((index, elem) => {
    return !(elem.classList.contains("currentlyEditing"));
  });
  children.attr("style","animation:swipeRight .5s forwards");
  $(".currentlyEditing").attr("style","animation:wipeToEdge .5s forwards");
  setTimeout(function(){$('.currentlyEditing').attr('onclick','closeDeviceEditor()');$('.currentlyEditing').addClass("clickable");},500);
  let editingRoom = rooms.get(elem.id);
  let devicesString = '';
  editingRoom.deviceAr.forEach(e => {

    devicesString += `
    <div id = '${e.identifier}' class = 'roomDeviceEditorDeviceBox curve1 ${getColor('lightMediumBG','lightMediumBGi')}'>
      <div class = 'roomDeviceEditorDevicePicture ${getColor('whiteBG outerShadow','whiteBGi outerShadowi')} curve1'>
        <div style = 'width:80%; height:80%; display:grid; place-items:center;' class = '${e.type}'></div>
      </div>
      <div class = 'roomDeviceEditorTextArea'>
        <input class = 'deviceNameEdit resetStyles font1 ${getColor('blackText','blackTexti')}' onblur = 'updateDeviceName(this, value);' value = "${e.name}">
        <select class = 'deviceTypeEdit resetStyles font1 ${getColor('blackText','blackTexti')}' onchange = 'updateDeviceType(this, value);'>
          <option value = 'computer' ${e.type == 'computer' ? 'selected' : ''}>Computer</option>
          <option value = 'laptop' ${e.type == 'laptop' ? 'selected' : ''}>Laptop</option>
          <option value = 'console' ${e.type == 'console' ? 'selected' : ''}>Console</option>
          <option value = 'video' ${e.type == 'video' ? 'selected' : ''}>Video</option>
        </select>
      </div>
      <input class = 'resetStyles deviceIdEdit circle font2Bold color2Text' style = 'background:${colorMode == 0 ? 'rgb(255,255,255)':'rgb(10,10,10)'}' onblur = 'updateDeviceId(this, value)' value = '${e.colId}'>
      <div class = 'roomDeviceEditorRemove clickable circle ${getColor('outerShadow','outerShadowi')} errorBG' id="${e.name}" onclick = 'eraseDevice(this)'><div class = 'editorRemoveLine whiteBG'></div></div>
    </div>
    `});
  $(".editPane").append(`
    <div class = 'roomDeviceEditor'>
      <div class = 'roomDeviceEditorName font2 ${getColor('blackText','blackTexti')}' id = '${getKeyByVal(rooms, editingRoom)}'>${editingRoom.name}</div>
      <div class = 'editBackButton' onclick = 'closeDeviceEditor()'>
        <div class = 'backArrowBox clickable iconShadow ${colorMode == 0 ? "whiteBG lightBorder" : "whiteBGi lightBorderi"}'>
          <div class = 'rotate2 arrowContainer'>
            <div class = 'curve2 leftArrowFin1 ${colorMode == 0 ? 'mediumBG' : 'mediumBGi'}'></div>
            <div class = 'curve2 leftArrowFin2 ${colorMode == 0 ? 'mediumBG' : 'mediumBGi'}'></div>
          </div>
        </div>
      </div>
      ${devicesString}
      <div class = 'createNewDeviceButton curve2 color2BG whiteText font2Bold ${elem.id}CreateDeviceButton clickable' onclick='createDevice("${elem.id}")'>CREATE DEVICE</div>
    </div>
    `);
  deviceIcons.forEach((val, key) => {
    $("."+key).filter((index, elem)=>{return elem.innerHTML==''}).append(val);
  });
  resetDeviceColors('sizer');
  checkDeviceCount(rooms.get(elem.parentElement.parentElement.id));
  $(".roomDeviceEditor").attr('style','animation: deviceEditorWipeIn .5s forwards');
  $(".editPane").animate({ scrollTop:0});
}
function closeDeviceEditor(){
  let children = $(".editPane").children().filter((index, elem) => {
    return !(elem.classList.contains("currentlyEditing") || elem.classList.contains('roomDeviceEditor'));
  });
  $(".roomDeviceEditor").attr('style','animation: deviceEditorWipeIni .5s forwards');
  $(".editorRoom").attr("onclick",'');
  children.attr("style","animation:swipeRighti .5s forwards");
  setTimeout(function(){$(".roomDeviceEditor").remove()},500);
  $(".currentlyEditing").attr("style","animation:wipeToEdgei .5s forwards");
  $('.currentlyEditing').removeClass("clickable");
  $('.currentlyEditing').removeClass("currentlyEditing");
}

function eraseDevice(elem){
  let id = elem.parentElement.id;
  let roomEraseDeviceRoom = '';
  rooms.forEach(e => {
    e.deviceAr.forEach(i => {
      if (id == i.identifier){
        roomEraseDeviceRoom = e;
        e.deviceAr.splice(e.deviceAr.indexOf(i),1);
        setDBdata('setVar|playlistRooms',`${e.name}=${getKeyByVal(rooms,e)}=${e.ip}=${packagedDeviceAr(e.deviceAr)}`);
      }
    });
  });
  $(`#${id}`).remove();
  $(`#${id}e`).remove();
  disabledDevices.splice(disabledDevices.indexOf(id),1);
  setDBdata('setVar|playlistPositions',`${service}=${currentPos}=${currentRoom}=${disabledDevices.toString().replaceAll("e","").replaceAll(",","^")}`);
  itemList.forEach(itemL => {
    itemL.matrixItem.matrixDeviceMap.delete(id);
  });
  updateDBMatrixAll();
  checkDeviceCount(roomEraseDeviceRoom);
}
function createDevice(id){
  let currentAddDeviceRoom = rooms.get(id);
  let newName = 'Untitled Device';
  let newId = '0';
  let newType = 'computer';
  let newDevice = new DeviceObj(newName, generateId(), newId, newType, currentAddDeviceRoom.deviceAr.length, id);
  currentAddDeviceRoom.deviceAr.push(newDevice);
  setDBdata(`setVar|playlistRooms`,`${currentAddDeviceRoom.name}=${getKeyByVal(rooms,currentAddDeviceRoom)}=${currentAddDeviceRoom.ip}=${packagedDeviceAr(currentAddDeviceRoom.deviceAr)}`);
  if (currentRoom == id){
    $(`
    <div class = 'deviceBoxContainer' id = '${newDevice.identifier}e'>
      <div class = 'deviceBox clickable ${colorMode == 0 ? 'whiteBG' : 'whiteBGi'} ${disabledDevices.indexOf(newDevice.identifier) != -1 ? 'disabledDevice' : ""}' id = 'deviceButton${newDevice.identifier}' onclick = 'toggleManualDevice(this)'>
        <div style = 'width:80%; height:80%; display:grid; place-items:center;' class = '${newDevice.type}'></div>
      </div>
      <div class = 'deviceName ${colorMode == 0 ? 'greyText' : 'greyTexti'}'>${newDevice.name}</div>
    </div>`).insertBefore(".roomDevicesRightSpacer");
    itemList.forEach(entry =>{
      if (entry.type != 'header'){
        entry.matrixItem.matrixDeviceMap.set(newDevice.identifier,1);
      }
    });
    updateDBMatrixAll();
  }
  $(`
    <div id = '${newDevice.identifier}' class = 'roomDeviceEditorDeviceBox curve1 ${getColor('lightMediumBG','lightMediumBGi')}'>
      <div class = 'roomDeviceEditorDevicePicture ${getColor('whiteBG outerShadow','whiteBGi outerShadowi')} curve1'>
      <div style = 'width:80%; height:80%; display:grid; place-items:center;' class = '${newDevice.type}'></div></div>
      <div class = 'roomDeviceEditorTextArea'>
        <input class = 'deviceNameEdit resetStyles font1 ${getColor('blackText','blackTexti')}' onblur = 'updateDeviceName(this, value);' value = "${newDevice.name}">
        <select class = 'deviceTypeEdit resetStyles font1 ${getColor('blackText','blackTexti')}' onchange = 'updateDeviceType(this, value);'>
          <option value = 'computer' ${newDevice.type == 'computer' ? 'selected' : ''}>Computer</option>
          <option value = 'laptop' ${newDevice.type == 'laptop' ? 'selected' : ''}>Laptop</option>
          <option value = 'console' ${newDevice.type == 'console' ? 'selected' : ''}>Console</option>
          <option value = 'video' ${newDevice.type == 'video' ? 'selected' : ''}>Video</option>
        </select>
      </div>
      <input class = 'resetStyles deviceIdEdit circle font2Bold color2Text' style = 'background:${colorMode == 0 ? 'rgb(255,255,255)':'rgb(10,10,10)'}' onblur = 'updateDeviceId(this, value)' value = '${newDevice.colId}'>
      <div class = 'roomDeviceEditorRemove clickable circle ${getColor('outerShadow','outerShadowi')} errorBG' id="${newDevice.name}" onclick = 'eraseDevice(this)'><div class = 'editorRemoveLine whiteBG'></div></div>
    </div>
    `).insertBefore(".createNewDeviceButton");
    $(`#${newDevice.identifier}`).find($(".roomDeviceEditorDevicePicture")).find($("div")).append(deviceIcons.get(newDevice.type));
    $(`#${newDevice.identifier}e`).find($(".deviceBox")).find($("div")).append(deviceIcons.get(newDevice.type));
    resetDeviceColors('sizer');
    checkDeviceCount(currentAddDeviceRoom);
    $(".editPane").scrollTop($(".roomDeviceEditor")[0].scrollHeight);
}
function updateDeviceName(elem, name){
  rooms.forEach(e => {
    e.deviceAr.forEach(i => {
      if (elem.parentElement.parentElement.id == i.identifier){
        i.name = name;
        setDBdata(`setVar|playlistRooms`,`${e.name}=${getKeyByVal(rooms,e)}=${e.ip}=${packagedDeviceAr(e.deviceAr)}`);
        try{
          $(`#${elem.parentElement.parentElement.id}e`).children()[1].innerHTML = i.name;
        }catch{}
      }
    });
  });
}
function updateDeviceType(elem, type){
  rooms.forEach(e => {
    e.deviceAr.forEach(i => {
      if (elem.parentElement.parentElement.id == i.identifier){
        i.type = type;
        setDBdata(`setVar|playlistRooms`,`${e.name}=${getKeyByVal(rooms,e)}=${e.ip}=${packagedDeviceAr(e.deviceAr)}`);
        $(`#${i.identifier}`).children()[0].innerHTML = '';
        $(`#${i.identifier}`).children()[0].innerHTML = '<div style = "width:80%; height:80%; display:grid; place-items:center;" class = "'+type+'">'+deviceIcons.get(type)+'</div>';
        try {
          $(`#${i.identifier}e`).children()[0].innerHTML = '';
          $(`#${i.identifier}e`).children()[0].innerHTML = '<div style = "width:80%; height:80%; display:grid; place-items:center;" class = "'+type+'">'+deviceIcons.get(type)+'</div>';
        }catch{}
        resetDeviceColors('sizer');
      }
    });
  });
}
function updateDeviceId(elem, id){
  rooms.forEach(e => {
    e.deviceAr.forEach(i => {
      if (elem.parentElement.id == i.identifier){
        i.colId = id;
        setDBdata(`setVar|playlistRooms`,`${e.name}=${getKeyByVal(rooms,e)}=${e.ip}=${packagedDeviceAr(e.deviceAr)}`);
      }
    });
  });
}
function checkDeviceCount(room){
  let count = room.deviceAr.length;
  let roomId = '';
  rooms.forEach((val, key)=>{if (val == room) roomId = key;});
  if (count >= 8){
    let el = $(`.${roomId}CreateDeviceButton`);
    el.removeClass("color2BG");
    el.addClass(`${getColor('nullBG','nullBGlight')}`);
    el.removeClass("clickable");
    el.attr('onclick','');
  }
  else{
    let el = $(`.${roomId}CreateDeviceButton`);
    el.addClass("color2BG");
    el.removeClass(`${getColor('nullBG','nullBGlight')}`);
    el.addClass("clickable");
    el.attr('onclick',`createDevice("${roomId}")`);
  }
}


function generateDeviceIcons(){
  deviceIcons.set('computer',`
  <div class = 'sizer'>
    <div style = ' position:absolute; background-color:rgba(0,0,0,0); box-sizing: border-box; height:75%; width:100%; border-width:1vw; border-radius:1vw; top:5%; left: 0%;'></div>

    <div class = 'curve3 horizontalLine' style = 'width:100%; top:57%; left: 0%;'></div>
    <div class = 'curve3 horizontalLine' style = 'width:30%; bottom:5%; left: 50%; transform:translateX(-50%);'></div>
    <div class = 'curve3 verticalLine' style = 'height:20%; bottom:5%; left: 50%; transform:translateX(-50%);'></div>
  </div>
  `);
  deviceIcons.set('laptop',`
  <div class = 'sizer'>
    <div style = 'position:absolute; background-color:rgba(0,0,0,0); box-sizing: border-box; height:70%; width:90%; border-width:1vw; border-radius:1vw; top:10%; left: 50%; transform:translateX(-50%);'></div>
    <div class = 'curve3 horizontalLine' style = 'width:100%; bottom:10%; left: 0%;'></div>
  </div>
  `);
  deviceIcons.set('console',`
  <div class = 'sizer'>
    <div style = ' position:absolute; background-color:rgba(0,0,0,0); box-sizing: border-box; height:100%; width:100%; border-width:1vw; border-radius:3vw; top:0%; left: 0%;'></div>

    <div class = 'curve3 verticalLine' style = 'height:15%; top:20%; left: 70%; transform:translateX(-50%);'></div>
    <div class = 'curve3 verticalLine' style = 'height:22%; bottom:20%; left: 70%; transform:translate(-50%,0%);'></div>
    <div style = ' position:absolute; background-color:rgba(0,0,0,0); box-sizing: border-box; height:30%; width:25%; border-width:1vw; border-radius:1vw; top:45%; left: 70%; transform:translate(-50%,-50%);'></div>

    <div class = 'curve3 verticalLine' style = 'height:22%; top:20%; left: 30%; transform:translateX(-50%);'></div>
    <div class = 'curve3 verticalLine' style = 'height:15%; bottom:20%; left: 30%; transform:translate(-50%,0%);'></div>
    <div style = ' position:absolute; background-color:rgba(0,0,0,0); box-sizing: border-box; height:30%; width:25%; border-width:1vw; border-radius:1vw; bottom:15%; left: 30%; transform:translate(-50%,-50%);'></div>
  </div>
  `);
  deviceIcons.set('video',`
  <div class = 'sizer'>
    <div style = ' position:absolute; background-color:rgba(0,0,0,0); box-sizing: border-box; height:100%; width:70%; border-width:1vw; border-radius:2vw; top:0%; left: 50%; transform:translateX(-50%);'></div>

    <div style = ' position:absolute; background-color:rgba(0,0,0,0); box-sizing: border-box; height:20%; width:45%; border-width:.75vw; border-bottom-style:none; border-radius:1vw; top:30%; left: 50%; transform:translate(-50%,-50%);'></div>
    <div class = 'curve3 verticalLine' style = 'height:10%; width:.6vw; bottom:56.5%; right: 32%; transform:rotate(55deg);'></div>
    <div class = 'curve3 verticalLine' style = 'height:10%; width:.6vw; bottom:56.5%; left: 32%; transform:rotate(-55deg);'></div>
    <div class = 'curve3 horizontalLine' style = 'width:28.5%; height:.6vw; top:42%; left:50%; transform:translate(-50%, -50%);'></div>
    <div class = 'curve3 horizontalLine' style = 'width:24%; height: .5vw; top:31%; left:50%; transform:translate(-50%, -50%);'></div>

    <div style = ' position:absolute; background-color:rgba(0,0,0,0); box-sizing: border-box; height:20%; width:45%; border-width:.75vw; border-bottom-style:none; border-radius:1vw; top:69%; left: 50%; transform:translate(-50%,-50%);'></div>
    <div class = 'curve3 verticalLine' style = 'height:10%; width:.6vw; bottom:17.5%; right: 32%; transform:rotate(55deg);'></div>
    <div class = 'curve3 verticalLine' style = 'height:10%; width:.6vw; bottom:17.5%; left: 32%; transform:rotate(-55deg);'></div>
    <div class = 'curve3 horizontalLine' style = 'width:28.5%; height:.6vw; top:79%; left:50%; transform:translate(-50%, -50%);'></div>
    <div class = 'curve3 horizontalLine' style = 'width:24%; height: .5vw; top:71%; left:50%; transform:translate(-50%, -50%);'></div>

  </div>
  `);
  deviceIcons.forEach((value, key) => {
    $(`.${key}`).empty();
    $(`.${key}`).append(value);
  });
  resetDeviceColors('sizer');
}

function toggleManualDevice(elem){
  let deviceSelection = $("#"+elem.parentElement.id).children()[0];
  let isDisabled = deviceSelection.children[0].classList.contains("disabledDevice");
  if (!isDisabled){
    deviceSelection.children[0].classList.add("disabledDevice");
    disabledDevices.push(elem.parentElement.id.replace("e",""));
    setDBdata('setVar|playlistPositions',`${service}=${currentPos}=${currentRoom}=${disabledDevices.toString().replaceAll("e","").replaceAll(",","^")}`);
    let devicePieces = deviceSelection.children[0].children[0].children;
    for (e in devicePieces){
      try{
        devicePieces[e].classList.add(`${colorMode == 0 ? 'disabledColor' : 'disabledColori'}`);
      }
      catch{}
    }
  }
  else{
    deviceSelection.children[0].classList.remove("disabledDevice");
    disabledDevices.splice(disabledDevices.indexOf(elem.parentElement.id.replace("e","")),1);
    setDBdata('setVar|playlistPositions',`${service}=${currentPos}=${currentRoom}=${disabledDevices.toString().replaceAll("e","").replaceAll(",","^")}`);
    let devicePieces = deviceSelection.children[0].children[0].children;
    for (e in devicePieces){
      try{
        devicePieces[e].classList.remove(`${colorMode == 0 ? 'disabledColor' : 'disabledColori'}`);
      }
      catch{}
    }
  }
}
function splitArray(deviceAr){
  let devices = [];
  if (deviceAr != ""){
    for (i in deviceAr){
      devices.push(new DeviceObj(deviceAr[i].split("#")[0],deviceAr[i].split("#")[1].split(".")[0],deviceAr[i].split(".")[1].split("<")[0], deviceAr[i].split(".")[1].split("<")[1], i));
    }
  }
  return devices;
}
class Room {
  constructor(name, ip, deviceList){
    this.name = name;
    this.ip = ip;
    this.deviceAr = splitArray(deviceList.split("^"));
  }
}
class DeviceObj {
  constructor(name, identifier, colId, type, num){
    this.name = name;
    this.colId = colId;
    this.type = type;
    this.identifier = identifier;
  }
}
function generateId(){
  let returned = false;
  while (!returned){
    let newNum = ""+Math.floor(Math.random() * 10)+Math.floor(Math.random() * 10)+Math.floor(Math.random() * 10)+Math.floor(Math.random() * 10);
    if (rooms.length == null){
      return newNum;
      returned = true;
    }
    for (i in rooms){
      if (rooms[i].deviceAr.length == null){
        return newNum;
        returned = true;
      }
      for (a in rooms[i].deviceAr){
        if (rooms[i].deviceAr[a].identifier != newNum){
          return newNum;
          returned = true;
        }
      }
    }
  }
}
function generateRoomId(){
  let returned = false;
  while (!returned){
    let newNum = "room"+Math.floor(Math.random() * 10)+Math.floor(Math.random() * 10)+Math.floor(Math.random() * 10)+Math.floor(Math.random() * 10);
    if (rooms.length == null){
      return newNum;
      returned = true;
    }
    rooms.forEach((value, key)=> {
      if (key != newNum){
        return newNum;
        returned = true;
      }
    });
  }
}

function packagedDeviceAr(ar){
  let returnString = '';
  ar.forEach(e => {
    returnString+=`${e.name}#${e.identifier}.${e.colId}<${e.type}${ar.indexOf(e)!=ar.length-1 ? '^' :''}`;
  });
  return returnString;
}
function resetDeviceColors(query){
  let icons = document.querySelectorAll(`.${query}`);
  let count = 0;
  icons.forEach(i => {
    let tempDeviceId =i.parentElement.parentElement.parentElement.id.replace("e","");
    let child = i.children;
    for (c = 0; c < child.length; c++){
      child.item(c).classList.remove("color2BG");
      child.item(c).classList.remove("color3BG");
      child.item(c).classList.remove("color4BG");
      child.item(c).classList.remove("color5BG");
      child.item(c).classList.remove("disabledColor");
      child.item(c).classList.remove("disabledColori");
      child.item(c).classList.add(`color${((count)%4)+2}BG`);
      if (disabledDevices.includes(tempDeviceId)){
        child.item(c).classList.add(`${colorMode == 0 ? 'disabledColor' : 'disabledColori'}`);
      }
    }
    count++;
  });
}

function openMatrix(){
  $(`
    <div class ='matrixButtonExpandToContainer curve2 color4BG'></div>
    <div class = 'matrixContainer'>
      <div class = 'matrixHeader font2Bold whiteText'>MATRIX</div>
      <div class = 'matrixEditPanel'>

        <div class = 'matrixEditItemWrapper outerShadow color1BG curve1 font2Bold whiteText clickable'>
          <div class = 'font2Bold whiteText matrixEditItemSelectText'></div>
          <select class = 'matrixEditItemSelect font2Bold curve1 whiteText clickable resetStyles' onchange='changeMatrixEditItemSelect(value); changeMatrixEditRows();'></select>
        </div>

        <div class = 'matrixEditItemId curve1 font2Bold ${getColor('whiteBG lightGreyText','lightBGi lightGreyTexti')}'></div>

        <div class = 'matrixEditPageWrapper outerShadow color2BG curve1 font2Bold whiteText clickable'>
          <div class = 'font2Bold whiteText matrixEditPageText'></div>
          <select class = 'matrixEditPageSelect font2Bold whiteText curve1 clickable resetStyles' onchange='changeMatrixEditPageSelect(value);'>
            <option value = 'Inactive'>Inactive</option>
          </select>
        </div>

        <div class = 'matrixEditDeviceWrapper'>

        </div>


      </div>
      <div class = 'matrixContianerExitButton circle outerShadow clickable font2Bold ${getColor('lightMediumBGi','lightBGi')}' onclick = 'closeMatrix()'>
        <div style ='position:relative; width:100%; height:100%;'>
          <div style = 'transform: translate(-50%, -50%) rotate(45deg)' class = 'matrixExitButtonLine ${getColor('whiteBG','lightMediumBGi')}'></div>
          <div style = 'transform: translate(-50%, -50%) rotate(-45deg)' class = 'matrixExitButtonLine ${getColor('whiteBG','lightMediumBGi')}'></div>
        </div>
      </div>
    </div>
    `).insertAfter(".playlistItemsWrapper");
  setTimeout(()=>{$(".matrixContainer").attr('style','animation:fadeTextUp .5s ease forwards');},300);
  let doesItemWithIdExist = false;
  itemList.forEach(e=>{
    if (e.type != 'header' && e.automationId != ""){
      doesItemWithIdExist = true;
      $(".matrixEditItemSelect").append(`
        <option type = 'text' value = '${e.name}'>${e.name}</option>
      `);
    }
  });
  if (!doesItemWithIdExist) {
    $(".matrixEditDeviceWrapper").append(`
      <div style = 'text-align:center; font-size:5vw; width: 80vw;' class = 'font1Bold whiteText'>Uh Oh! Looks like you haven't added any automation IDs. Head to <a target="_blank" class = 'clickable' href='https://services.planningcenteronline.com/dashboard/' style = 'text-decoration: underline;'>Planning Center Online</a> to add those tags. Once those are complete, reselect this service from the main menu to continue setting up your automation.</div>
      `);
  }
  else {
    for (let i = 0; i < 100; i++){
      $(".matrixEditPageSelect").append(`
          <option type = 'text' value = '${i}'>page ${i}</option>
        `);
    }
    let tempPromise = new Promise((resolve,reject)=>{
      changeMatrixEditItemSelect($(".matrixEditItemSelect").children()[0].value);
      let deviceTemp =  rooms.get(currentRoom).deviceAr;
      for (l in deviceTemp) {
        $(".matrixEditDeviceWrapper").append(`
          <div class = 'matrixEditDeviceContainer curve1 ${getColor('greyText whiteBG','greyTexti lightBGi')}'>
            <div class = 'matrixEditDeviceIconWrapper'>
              <div style = 'width:80%; height:80%; display:grid; place-items:center;' class = '${deviceTemp[l].type} matrixSizerParent'></div>
            </div>
            <div class = 'matrixEditDeviceText font1'>${deviceTemp[l].name}</div>
            <div class = 'matrixEditDeviceSubText font1'>device id# ${deviceTemp[l].colId}</div>
            <div class = 'matrixEditDeviceRowButton outerShadow curve1 clickable' id = '${deviceTemp[l].identifier}'>
              <div class = 'matrixEditDeviceRowButtonText whiteText font2Bold ${deviceTemp[l].identifier}Text'></div>
              <select class = 'matrixEditDeviceRowButtonSelect clickable resetStyles ${deviceTemp[l].identifier}Select' onchange = 'changeMatrixEditRowSelect(value,"${deviceTemp[l].identifier}",${deviceTemp[l].colId});'>
                <option value = '1'>1</option>
                <option value = '2'>2</option>
                <option value = '3'>3</option>
                <option value = '4'>4</option>
              </select>
            </div>
          </div>
          `);
      }
      $(".matrixEditDeviceWrapper").append(`
        <div style = 'width:5vw;'></div>
        `);
      generateDeviceIcons();
      $(".matrixSizerParent").children().addClass('matrixSizer');
      resetDeviceColors('matrixSizer')
      for (l in deviceTemp) {
        let eleme = $(`.${deviceTemp[l].identifier}Select`)[0].parentElement;
        let borderEleme = eleme.parentElement.children[0];
        eleme.classList.remove("color2BG");
        eleme.classList.remove("color3BG");
        eleme.classList.remove("color4BG");
        eleme.classList.remove("color5BG");
        eleme.classList.add(`color${((l)%4)+2}BG`);

        borderEleme.classList.remove("color2BG");
        borderEleme.classList.remove("color3BG");
        borderEleme.classList.remove("color4BG");
        borderEleme.classList.remove("color5BG");
        borderEleme.classList.add(`color${((l)%4)+2}BG`);
      }
      resolve("");
    });
    tempPromise.then(()=>{
      changeMatrixEditRows();
    })

  }

}
function changeMatrixEditItemSelect(val){
   $(".matrixEditItemSelectText").html(val);
   $(".matrixEditItemSelect").val(val);
  itemList.forEach(e=>{
    if (e.name == val) selectedMatrixEditItem = e;
  });
  $(".matrixEditItemId").html('ID# '+selectedMatrixEditItem.matrixItem.id);
  let pageVal = selectedMatrixEditItem.matrixItem.page;
  changeMatrixEditPageSelect(pageVal);
}
function changeMatrixEditPageSelect(val){
   $(".matrixEditPageText").text("PAGE " +val);
   $(".matrixEditPageSelect").val(val);
   selectedMatrixEditItem.matrixItem.page = val;
   updateDBMatrix();
}
function changeMatrixEditRowSelect(val, id, uniqueId){
  $(`.${id}Text`).text(val!='inactive'?("ROW " +val):'Inactive');
  $(`.${id}Select`).val(val);
  selectedMatrixEditItem.matrixItem.matrixDeviceMap.set(id,val);
  updateDBMatrix();
}
function changeMatrixEditRows(){
  $(".matrixEditDeviceRowButton").each((i, elem)=>{
    elem.children[0].innerHTML = 'ROW ' + selectedMatrixEditItem.matrixItem.matrixDeviceMap.get(elem.id);
    elem.children[1].value = selectedMatrixEditItem.matrixItem.matrixDeviceMap.get(elem.id);
  });
}
function updateDBMatrix(){
  let tempStringAr = '';
  let c = 0;
  selectedMatrixEditItem.matrixItem.matrixDeviceMap.forEach((v, k)=>{
    tempStringAr += k+"^"+v+(c < selectedMatrixEditItem.matrixItem.matrixDeviceMap.size-1 ? '=' : '');
    c++;
  });
  setDBdata(`setVar|matrix${service}`,`${selectedMatrixEditItem.matrixItem.id}=${selectedMatrixEditItem.matrixItem.page}=${tempStringAr.replaceAll(",","^")}`);
}
function updateDBMatrixAll(){
  itemList.forEach(item => {
    if(item.type != 'nullNode'){
      let tempStringAr = '';
      let c = 0;
      item.matrixItem.matrixDeviceMap.forEach((v, k)=>{
        tempStringAr += k+"^"+v+(c < item.matrixItem.matrixDeviceMap.size-1 ? '=' : '');
        c++;
      });
      for(let i = c; i < 8; i++){
        tempStringAr+="=";
      }
      setDBdata(`setVar|matrix${service}`,`${item.matrixItem.id}=${item.matrixItem.page}=${tempStringAr.replaceAll(",","^")}`);
    }
  });
}
function closeMatrix(){
  console.log('close');
  $(".matrixContainer").attr('style','animation:fadeTextUpi .2s ease forwards');
  setTimeout(()=>{$(".matrixContainer").remove();},500);
  $(".matrixContianerExitButton").attr('style','animation:fadeTextUpi .2s ease forwards');
  setTimeout(()=>{$(".matrixContianerExitButton").remove();},500);
  $(".matrixButtonExpandToContainer").attr('style','animation:scaleUpMatrixi .3s cubic-bezier(.2,.27,.67,.84) forwards');
  setTimeout(()=>{$(".matrixButtonExpandToContainer").remove();},500);
}

class ItemObj{
  constructor(name, type, length, automationId, id, orderId, page, map){
    this.name = name;
    this.type = type;
    this.length = length;
    this.automationId = automationId;
    this.id = id;
    this.orderId = orderId;
    this.matrixItem = new MatrixItem(automationId, page, name, map);
  }
}

class MatrixItem{
  constructor(id, page, name, map){
    this.id = id;
    this.page = page;
    this.name = name;
    this.matrixDeviceMap = map;
  }
}
function toTime(num){
  let i = parseInt(num);
  let minute = Math.floor(i / 60);
  let second = Math.round(i%60);
  if (second < 10) second = "0"+second;
  return minute+":"+second;
}
//come2
function selectItem(elem, fromClick){
  let selectPromise = new Promise((resolve, reject)=>{
    if (elem!=null){
      id = elem.id;
      let foundSelected = false;
      let count = 0;
      itemList.forEach(e => {
        try{
          if (e.type == 'header' && !foundSelected){
             count++;
          }
          $(`#${e.id}`).children()[0].classList.remove(getColor('color1BG','color1BGi'), getColor('color1Shadow','color1Shadowi'), getColor('lightBG','lightLightMediumBGi'), getColor('mediumBG','mediumBGi'));
          $(`#${e.id}`).removeClass(`${getColor('lightGreyText','lightGreyTexti')}`);
          let clock = $(`#${e.id}`).children()[2].children[0];
          clock.classList.remove(getColor('lightFill','lightFilli'), getColor('darkFill','darkFilli'));

          if (e.id == id) {
            foundSelected = true;
            $(`#${e.id}`).children()[0].classList.add(getColor('color1BG','color1BGi'), getColor('color1Shadow','color1Shadowi'));
            clock.classList.add(getColor('darkFill','darkFilli'));
          }
          else if (!foundSelected){
            $(`#${e.id}`).children()[0].classList.add(`${getColor('lightBG','lightLightMediumBGi')}`);
            $(`#${e.id}`).addClass(`${getColor('lightGreyText','lightGreyTexti')}`);
            clock.classList.add(getColor('lightFill','lightFilli'));
            count++;
          }
          else{
            $(`#${e.id}`).children()[0].classList.add(`${getColor('mediumBG','mediumBGi')}`);
            clock.classList.add(getColor('darkFill','darkFilli'));
          }
        }
        catch{}
      });
      setPlaylistPosition(count,fromClick);
    }
    resolve('success');
  });
  return selectPromise;
}
