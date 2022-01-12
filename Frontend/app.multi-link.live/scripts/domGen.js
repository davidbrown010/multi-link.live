var profileIconUrl = '';
//creates icons for all elems with corresponding classes
function createIcons(){
  let iconClasses = new Map();
  iconClasses.set('navBoxWrapper',`
  <div class = 'navBox clickable ${colorMode == 0 ? "whiteBG lightBorder iconShadow" : "whiteBGi lightBorderi outerShadowi"}' onclick='showNav()'>
    <div class = 'navLine ${colorMode == 0 ? "mediumBG" : "mediumBGi"} curve2'></div>
    <div class = 'navLine ${colorMode == 0 ? "mediumBG" : "mediumBGi"} curve2'></div>
    <div class = 'navLine ${colorMode == 0 ? "mediumBG" : "mediumBGi"} curve2'></div>
  </div>`);
  iconClasses.set('homeButtonWrapper',`
  <div class = 'homeButton clickable ${colorMode == 0 ? "whiteBG lightBorder iconShadow" : "whiteBGi lightBorderi outerShadowi"}' onclick='showHider(); window.location = "home.html?mode=${colorMode}"'>

  </div>
  `);
  iconClasses.set('backArrowWrapper',`
  <div class = 'backArrowBox clickable ${colorMode == 0 ? "whiteBG lightBorder iconShadow" : "whiteBGi lightBorderi outerShadowi"}'>
    <div class = 'rotate2 arrowContainer'>
      <div class = 'curve2 leftArrowFin1 ${colorMode == 0 ? 'mediumBG' : 'mediumBGi'}'></div>
      <div class = 'curve2 leftArrowFin2 ${colorMode == 0 ? 'mediumBG' : 'mediumBGi'}'></div>
    </div>
  </div>
  `);
  iconClasses.set('dropDownArrow',`
  <div class = 'curve2 arrowFin1 ${colorMode == 0 ? 'color1BG' : 'color1BGi'}'></div>
  <div class = 'curve2 arrowFin2 ${colorMode == 0 ? 'color1BG' : 'color1BGi'}'></div>
  `);
  iconClasses.forEach((value, key) => {
    $(`.${key}`).append(value);
  });
}

//creates dom elem to edit profile info
function showProfile(){
  hideNav(true);
  $(".pageWrapper").append(`
    <div class = 'profileWrapper curve2 ${getColor('whiteBG outerShadow','lightBGi outerShadowi')}'>
      <div class = 'color2BG whiteText curve2 clickable closeProfileButton font2Bold' onclick = 'hideProfile(); hideLoader();'>CLOSE<div>
    </div>
    `);
}

function hideProfile(){
  $(".profileWrapper").attr("style",'animation: profilePageWipeUpi .5s ease forwards');
  setTimeout(()=>{$(".profileWrapper").remove();$(".pageWrapper").attr('style','display:none;');},500);
}

//creates navBar
function showNav(){
  let options = new Map();
  options.set('Settings',`showHider(); location.href = "settings.html?mode=${colorMode}"`);
  options.set('Getting Started',`showHider(); location.href="gettingStarted.html?mode=${colorMode}"`);
  options.set('Log Out','logOut();');

  let optionsString = '';
  options.forEach((key,value) => {
    optionsString+=`<div class = 'navOptionText clickable ${colorMode == 0 ? "blackText" : "blackTexti"}' onclick = '${key}'>${value}</div>`;
  })

  $(".navBox").toggleClass(getColor('iconShadow','outerShadowi'));
  $(".navBox").attr("onclick","");
  $(".profileWrapper").attr("style",'animation: profilePageWipeUpi .5s ease forwards');
  setTimeout(()=>{$(".profileWrapper").remove();},500);
  setTimeout(function(){$(".navBox").attr("onclick","hideNav(false); hideLoader();")},500);
  createExitBox('hideNav(false); hideLoader(); hideProfile();').then(reply =>{
    $(".pageWrapper").attr('style',"display:block;");
    $(".pageWrapper").append(`
      <div class = 'outerBorder navWipeOnAnimation navPage font1 ${colorMode == 0 ? "whiteBG outerShadow" : "whiteBGi outerShadowi"} curve1'>
        <div class = 'profileInfoWrapper clickable'>
          <div class = 'smallProfilePic circle'></div>
          <div class = 'profileNameContainer'>
            <div class = 'profileNamePreview ${colorMode == 0 ? "blackText" : "blackTexti"}'>${userFullName}</div>
            <div class = 'profileStatusPreview ${colorMode == 0 ? "greyText" : "greyTexti"}'>${userPositionStats}</div>
          </div>
        </div>
        <div class = 'navPageOptionsContainer'>
          ${optionsString}
        </div>
        <div class = 'versionContainer'>
          <div class = 'versionLine curve2 ${colorMode == 0 ? "lightBG" : "lightBGi"}'></div>
          <div class = 'versionText ${colorMode == 0 ? "lightGreyText" : "lightGreyTexti"}'>${version}</div>
        </div>
      </div>`);
      $(".profileInfoWrapper").attr('onclick','');
      setTimeout(()=>{$(".profileInfoWrapper").attr('onclick','showProfile()')},500);
  });

}

function hideNav(isProfile){
  $(".navBox").toggleClass(getColor('iconShadow','outerShadowi'));
  $(".navBox").attr("onclick"," ");
  $(".profileInfoWrapper").attr('onclick','');
  setTimeout(function(){$(".navBox").attr("onclick","showNav()");$(".navPage").remove(); if (!isProfile) $(".pageWrapper").attr("style",'display:none;')},500);
  $(".navPage").toggleClass("navWipeOnAnimation");
  $(".navPage").attr("style","width:65%;");
  $(".navPage").toggleClass("navWipeOffAnimation");
}

function disableNav(){
  $(".navBox").attr("onclick"," ");
  $(".navBox").removeClass("clickable");
}

function enableNav(){
  $(".navBox").attr("onclick","showNav()");
  $(".navBox").addClass("clickable");
}

//creates loading screen
function showLoader(){
  $('body').append(`<div class = 'pageLoader'>
                      <div class = 'clearBG ${colorMode == 0 ? "whiteBG" : "whiteBGi"}'></div>
                      <div class = 'animationWrapper'>
                        <div class = 'loadingCircle color3BG circle'></div>
                        <div class = 'loadingCircle color4BG circle animationDelay1'></div>
                        <div class = 'loadingCircle color2BG circle animationDelay2'></div>
                        <div class = 'loadingCircle color5BG circle animationDelay3'></div>
                      </div>
                    </div>`);

}

function hideLoader(){
  $(".pageLoader").attr("onclick"," ");
  $(".pageExitLoader").attr("onclick"," ");
  $(".clearBG").removeClass("clickable");
  $(".pageLoader").attr("style","opacity:0;")
  setTimeout(function(){$(".pageLoader").remove();},500);
  $(".pageExitLoader").attr("style","opacity:0;")
  setTimeout(function(){$(".pageExitLoader").remove();},500);
}

//creates complete cover
function showHider(){
  $('body').append(`<div class = 'pageLoader'>
                      <div class = 'hiderBG ${colorMode == 0 ? "whiteBG" : "whiteBGi"}'></div>
                      <div class = 'animationWrapper'>
                        <div class = 'loadingCircle color3BG circle'></div>
                        <div class = 'loadingCircle color4BG circle animationDelay1'></div>
                        <div class = 'loadingCircle color2BG circle animationDelay2'></div>
                        <div class = 'loadingCircle color5BG circle animationDelay3'></div>
                      </div>
                    </div>`);
}

//creates invisble click out box
function createExitBox(callback){
  let exitBoxPromise = new Promise((resolve, reject)=>{
    $(".pageWrapper").attr('style',"display:block;");
    $('.pageWrapper').append(`<div class = 'pageExitLoader'>
                        <div class = 'clearBG clickable ${colorMode == 0 ? "whiteBG" : "whiteBGi"}'></div>
                      </div>`);
    $(".pageExitLoader").attr("onclick","");
    setTimeout(function(){
      $(".pageExitLoader").attr("onclick",`${callback}`)},500);
    resolve('completed creating exit box');
  });
  return exitBoxPromise;
}

function showBackArrow(){
  $(".backArrowWrapper").attr("style","display:block;");
  $(".backArrowBox").attr("onclick",'regenHomePage()');
}
