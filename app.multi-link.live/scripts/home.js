var ministries = [];
var serviceTypes = [];
let color1 = '#542D9B';
let color2 = '#de926a';
var serviceType;
var ministry;
var service;
var homePage;

function pageBuilder(){
  getDBdata('getVars|home|*').then(result => {
    ministry = result.data[0][1];
    serviceType = result.data[1][1];
    service = result.data[2][1];
    let authToken = result.data[3][1];
    let defaultMinistry = result.data[7][1];

    //generates ministries and serviceTypes arrays
    getPCOdata(`folders?order=name`,'').then(reply => {
      let data = reply.data;
      for (entry in data){
        ministries.push(data[entry]);
      }
    }).then(response => {
      getPCOdata(`service_types?per_page=200&order=name`,'').then(reply => {
        let data = reply.data;
        for (entry in data){
          serviceTypes.push(data[entry]);
        }
      }).then(e => {
        $('.header').append(`
        <div class = 'selectedMinistryText ${colorMode == 0 ? "blackText" : "blackTexti"} font1Bold'></div>
        <div class = 'selectedServiceTypeText ${colorMode == 0 ? "blackText" : "blackTexti"}'></div>
      `);
      $(".header").addClass(`${colorMode == 0 ? 'lightBGgradient' : 'lightBGgradienti'}`);
        //generates header text
        for (name in ministries){
          if ((ministry != "-"?ministry:defaultMinistry.split("-")[0]) == ministries[name].id){
            $(".selectedMinistryText").text(`${ministries[name].attributes.name}`);
          }
        }
        for (type in serviceTypes){
          if ((serviceType!="-"?serviceType:defaultMinistry.split("-")[1]) == serviceTypes[type].id){
            $(".selectedServiceTypeText").text(`${serviceTypes[type].attributes.name}`);
          }
        }
      });
    });

    //checks to create recent panel
    if (service!='-'){
      getPCOdata(`service_types/${serviceType}/plans/${service}`).then(reply => {
        let data = reply.data;
        let seriesTitle = data.attributes.series_title;
        let serviceTitle = data.attributes.title;
        let serviceDate = data.attributes.dates;
        let serviceId = data.id;
        getPCOdata(`series?where[title]=${seriesTitle}`).then(e => {
          let seriesURL = e.data[0];
          $(".recent").append(`
            <div class = 'recentText font1Bold ${colorMode == 0 ? 'blackText' : 'blackTexti'}'>Recent</div>
            <div class = 'recentBlock curve1 ${colorMode == 0 ? 'color1BG color1Shadow' : 'color1BGi color1Shadowi'} clickable' id = '${serviceId}' onclick = 'selectedService(this)'>
              <div class = 'seriesImgContainer curve1' style = 'background-image:${seriesURL!=null?'url('+seriesURL.attributes.artwork_original+')':'linear-gradient(to bottom right, '+color1+','+color2+')'}';></div>
              <div class = 'recentServiceText'>
                <div class = 'seriesTitle font2Bold ${colorMode == 0 ? "greyText" : "greyText"}'>${seriesTitle==null?"<br>":seriesTitle}</div>
                <div class = 'serviceTitle font1Bold ${colorMode == 0 ? "whiteText" : "whiteTexti"}'>${serviceTitle==null?"<br>":serviceTitle}</div>
                <div class = 'serviceDate font1 ${colorMode == 0 ? "whiteText" : "whiteTexti"}'>${serviceDate==null?"<br>":serviceDate}</div>
              </div>
            </div>
            `);
        });
      });
    }
    //generates all plans
    getPCOdata(`service_types/${serviceType != '-' ? serviceType : defaultMinistry.split("-")[1]}/plans?order=-sort_date&per_page=20`,'').then(reply =>{
      let data = reply.data;
      $(".comingUp").append(`<div class = 'comingUpText ${colorMode == 0 ? 'blackText' : 'blackTexti'} font1Bold'>Coming Up</div>`);
      for (entry in data){
        let seriesTitle = data[entry].attributes.series_title;
        let serviceTitle = data[entry].attributes.title;
        let serviceDate = data[entry].attributes.dates;
        let serviceId = data[entry].id;
        $(".comingUp").append(`
          <div class = 'curve1 block ${colorMode == 0 ? 'whiteBG outerShadow' : 'whiteBGi outerShadowi'} clickable' id = '${serviceId}' onclick = 'selectedService(this)'>
            <div class = 'serviceText'>
              <div class = 'seriesTitle font2Bold color1Text'>${seriesTitle==null?"<br>":seriesTitle}</div>
              <div class = 'serviceTitle font1Bold ${colorMode == 0 ? "blackText" : "blackTexti"}'>${serviceTitle==null?"<br>":serviceTitle}</div>
              <div class = 'serviceDate font1 ${colorMode == 0 ? "greyText" : "greyTexti"}'>${serviceDate==null?"<br>":serviceDate}</div>
            </div>
          </div>
          `);
      }
    }).then(e =>{
      hideLoader();
    });

  });

}

function serviceMenuBuilder(){
  disableNav();
  createExitBox('hideServiceMenu(); hideLoader();');
  $('body').append(`
    <div class = 'ministrySelector curve1 ${colorMode == 0 ? 'whiteBG outerShadow' : 'whiteBGi outerShadowi'}'></div>`);
    for (entry in ministries){
      $(".ministrySelector").append(`
        <div class = 'ministryNameInMenu font1Bold clickable ${colorMode == 0 ? 'blackText' : 'blackTexti'}' onclick = 'showServiceType(this.id);'  id = '${ministries[entry].id}'>${ministries[entry].attributes.name}</div>`);
    }
    //makes current selection appear
    showServiceType(ministry);
}
function showServiceType(id){
  hideServiceType();
  let validTypes = '<div class = "serviceTypeWrapper">';
  for (type in serviceTypes){
    if (serviceTypes[type].relationships.parent.data.id == id){
      let currentId = serviceTypes[type].id;
      validTypes += `<div class = 'serviceTypeNameInMenu font1Bold ${serviceType == currentId ? 'color2Text' : colorMode == 0 ? 'greyText' : 'greyTexti'} clickable' onclick = 'selectedServiceType(this);' id = '${id}_${currentId}'>${serviceTypes[type].attributes.name}</div>`;
    }
  }
  validTypes += '</div>';
  $(validTypes).insertAfter(`#${id}`);

}
function hideServiceType(){
  $('.serviceTypeWrapper').remove();
}
function hideServiceMenu(){
  $('.ministrySelector').attr('style','animation:wipeDownInv .5s');
  setTimeout(()=>{$('.ministrySelector').remove();enableNav(); $(".pageWrapper").attr('style',"display:none;");},500);
}
function selectedServiceType(elem){
  let parentId = elem.id.split("_")[0];
  let childId = elem.id.split("_")[1];
  serviceType = childId;
  ministry = parentId;
  let serviceReplaceName = '';
  let ministryReplaceName = '';
  hideServiceMenu();
  showHider();
  setDBdata('setVars|home',`selectedMinistry=${parentId}&selectedServiceTypeID=${childId}&selectedServiceID=-`).then(e => {
    for (type in serviceTypes){
      if (serviceTypes[type].id == childId){
        serviceReplaceName = serviceTypes[type].attributes.name;
      }
    }
    for (type in ministries){
      if (ministries[type].id == parentId){
        ministryReplaceName = ministries[type].attributes.name;
      }
    }
    $(".selectedMinistryText").text(ministryReplaceName);
    $(".selectedServiceTypeText").text(serviceReplaceName);
    $('.recent').html("");
    getPCOdata(`service_types/${childId}/plans?order=-sort_date&per_page=20`,'').then(reply =>{
      let data = reply.data;
      $('.comingUp').html("");
      $(".comingUp").append(`<div class = 'comingUpText ${colorMode == 0 ? 'blackText' : 'blackTexti'} font1Bold'>Coming Up</div>`);
      for (entry in data){
        let seriesTitle = data[entry].attributes.series_title;
        let serviceTitle = data[entry].attributes.title;
        let serviceDate = data[entry].attributes.dates;
        let serviceId = data[entry].id;
        $(".comingUp").append(`
          <div class = 'curve1 block ${colorMode == 0 ? 'whiteBG outerShadow' : 'whiteBGi outerShadowi'} clickable' id = '${serviceId}' onclick = 'selectedService(this)'>
            <div class = 'serviceText'>
              <div class = 'seriesTitle font2Bold color1Text'>${seriesTitle==null?"<br>":seriesTitle}</div>
              <div class = 'serviceTitle font1Bold ${colorMode == 0 ? "blackText" : "blackTexti"}'>${serviceTitle==null?"<br>":serviceTitle}</div>
              <div class = 'serviceDate font1 ${colorMode == 0 ? "greyText" : "greyTexti"}'>${serviceDate==null?"<br>":serviceDate}</div>
            </div>
          </div>
          `);
      }
    }).then(e =>{
      hideLoader();
    });
  });
}


function selectedService(elem){
  service = elem.id;
  showLoader();
  setDBdata(`createNewMatrix|${service}`).then(()=>{
    setDBdata('setVar|home',`selectedServiceID=${elem.id}`).then(e => {
      $(`
        <iframe src='playlist.html?mode=${colorMode}' class = 'playlistIframe' title = 'playlist manager' frameBorder="0" height = '100%' width = '100%'>
        `).insertAfter('.comingUp');
        setTimeout(()=> {
          homePage = $(".homePage");
          homePage.remove();
          showBackArrow();
          hideLoader();
        },500);
    });
  });


}

function regenHomePage(){
  $('body').prepend(homePage);
  $('.recent').html(" ");
  //checks to create recent panel
  if (service!='-'){
    getPCOdata(`service_types/${serviceType}/plans/${service}`).then(reply => {
      let data = reply.data;
      let seriesTitle = data.attributes.series_title;
      let serviceTitle = data.attributes.title;
      let serviceDate = data.attributes.dates;
      let serviceId = data.id;
      getPCOdata(`series?where[title]=${seriesTitle}`).then(e => {
        let seriesURL = e.data[0];
        $(".recent").append(`
          <div class = 'recentText font1Bold ${colorMode == 0 ? 'blackText' : 'blackTexti'}'>Recent</div>
          <div class = 'recentBlock curve1 ${colorMode == 0 ? 'color1BG color1Shadow' : 'color1BGi color1Shadowi'} clickable' id = '${serviceId}' onclick = 'selectedService(this)'>
            <div class = 'seriesImgContainer curve1' style = 'background-image:${seriesURL!=null?'url('+seriesURL.attributes.artwork_original+')':'linear-gradient(to bottom right, '+color1+','+color2+')'}';></div>
            <div class = 'recentServiceText'>
              <div class = 'seriesTitle font2Bold ${colorMode == 0 ? "greyText" : "greyText"}'>${seriesTitle==null?"<br>":seriesTitle}</div>
              <div class = 'serviceTitle font1Bold ${colorMode == 0 ? "whiteText" : "whiteTexti"}'>${serviceTitle==null?"<br>":serviceTitle}</div>
              <div class = 'serviceDate font1 ${colorMode == 0 ? "whiteText" : "whiteTexti"}'>${serviceDate==null?"<br>":serviceDate}</div>
            </div>
          </div>
          `);
      }).then(j => {
        $('.playlistIframe').attr('style','animation: swipeOutRight .5s forwards');
        setTimeout(function(){$('.playlistIframe').remove()},500);
        $('.backArrowWrapper').attr("style","display:none;");
      });
    });
  }
  else {
    $('.playlistIframe').attr('style','animation: swipeOutRight .5s forwards');
    setTimeout(function(){$('.playlistIframe').remove()},500);
    $('.backArrowWrapper').attr("style","display:none;");
  }

}
