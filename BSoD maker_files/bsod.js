//skala interfejsu + slider callback
function setFhdMultiplier(val){
    document.querySelector(':root').style.setProperty('--fhd-multiplier', val.toFixed(1));
    bsodQr.update();
}
function getFhdMultiplier(){
    let cs = getComputedStyle(document.querySelector(':root'));
    return Number(cs.getPropertyValue('--fhd-multiplier'));
}
function calcAndSetFhdMultiplier(){
    //let fhdMultiplierWidth = Math.round(window.innerWidth * 10 / (970 + 2*205));
    //let fhdMultiplierHeight = Math.round(window.innerHeight * 10/ (725 + 2*100));
    let fhdMultiplierWidth = Math.round(window.innerWidth * 10 / 1380);
    let fhdMultiplierHeight = Math.round(window.innerHeight * 10 / 1080);
    let fhdMultiplier = Math.min(fhdMultiplierWidth, fhdMultiplierHeight) / 10;
    fhdMultiplier = fhdMultiplier < 0.1 ? 0.1 : fhdMultiplier > 2 ? 2 : fhdMultiplier;
    //console.log("fhd", fhdMultiplier);
    setFhdMultiplier(fhdMultiplier);
}

//fullscreen
function isFullScreen() {
    return (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    ) ? true : false;
}
function openFullscreen() {
    let elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}

//qr code w bsod
class BSOD_qr{
    constructor(id, id2, content){
        this.id = id;
        this.id2 = id2;
        this.dom = document.getElementById(this.id);
        this.dom2 = document.getElementById(this.id2);
        this.content = content;
    }
    generate(){
        let fhdMultiplier = getFhdMultiplier();
        let cs = getComputedStyle(document.querySelector(':root'));
        let bgColor = cs.getPropertyValue('--bg-color');
        let fontColor = cs.getPropertyValue('--font-color');
        new QRCode(this.id, {
            text: this.content,
            width:  Math.round(100 * fhdMultiplier),
            height: Math.round(100 * fhdMultiplier),
            colorDark : bgColor,
            colorLight : fontColor,
            correctLevel : QRCode.CorrectLevel.L
        });
        new QRCode(this.id2, {
            text: this.content,
            width:  100,
            height: 100,
            colorDark : bgColor,
            colorLight : fontColor,
            correctLevel : QRCode.CorrectLevel.L
        });
    }
    update(content){
        if(content !== undefined){
            this.content = content;
        }
        this.dom.innerHTML = "";
        this.dom2.innerHTML = "";
        this.generate();
    }
    getContent(){
        return this.content;
    }
}

//poprawna edycja contenteditable
//https://stackoverflow.com/questions/18552336/prevent-contenteditable-adding-div-on-enter-chrome
document.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        if(event.target.getAttribute("contenteditable") == "true"){
            document.execCommand('insertLineBreak');
            event.preventDefault();
        }        
    }
});

//--------------------------

//domyślny qr code - "You are Hacked"
let bsodQr = new BSOD_qr("bsod-qrcode", "bsod-qrcode2" ,"You are Hacked");

//domyślna skala bsoda
calcAndSetFhdMultiplier();
window.addEventListener('resize', function(event){
    calcAndSetFhdMultiplier();
});

//wyróżnienie qr code
if(!RETURN_VISIT){
    $("#bsod-qrcode").addClass("attention-animation");
}
//pokazywanie menu po kliknięciu qr code
$("#bsod-qrcode").click(()=>{
    $("#bsod-qrcode").removeClass("attention-animation");
    $(".window").addClass("window-inactive");
    $("#qr-menu-window").removeClass("window-inactive");
    $("#qr-menu-window").fadeIn(100);
    organizeWindows($("#qr-menu-window")); //funkcja z windowsui.js
});

//mirror 2 bsody
const ID_TEMPLATE = "bsod-print-field-";
$(".bsod-render").on("input", (e)=>{
    let targetId = e.target.id;
    let printId = ID_TEMPLATE + e.target.id[e.target.id.length-1];
    $("#" + printId).html($("#" + targetId).html());
});

//updater qr code
$("#qrcode-content").val(bsodQr.getContent());
$("#qrcode-content").on("input", ()=>{
    let content = $("#qrcode-content").val();
    if(content === ""){
        content = "You are Hacked";
    }
    bsodQr.update(content);
});

//show menu btn
$("#btn-show-welcome-screen").click(()=>{
    $(".window").addClass("window-inactive");
    $("#welcome-menu-window").removeClass("window-inactive");
    $("#welcome-menu-window").fadeIn(100);
    organizeWindows($("#welcome-menu-window")); //funkcja z windowsui.js
});

//show support btn
$("#btn-show-contact-window").click(()=>{
    $(".window").addClass("window-inactive");
    $("#contact-menu-window").removeClass("window-inactive");
    $("#contact-menu-window").fadeIn(100);
    organizeWindows($("#contact-menu-window")); //funkcja z windowsui.js
});

//fullscreen
$("#btn-fullscreen").click(()=>{
    isFullScreen() ? closeFullscreen() : openFullscreen();
});

//cursor visibility
function toggleCursorVisibility(hide){
    if(hide === true){
        $("#bsod-render").addClass("bsod-nocursor");
    }else{
        $("#bsod-render").removeClass("bsod-nocursor");
    }
}

//save screenshot
$("#btn-save-screenshot").click(saveScreenshot);
function saveScreenshot(){
    html2canvas(document.querySelector("#bsod-render2")).then(canvas => {
        let downloadLink = document.createElement('a');
        downloadLink.href = canvas.toDataURL();
        downloadLink.download = 'bsodmaker.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
}

//dont show welcome screen
function dontShowWelcomeScreen(val){
    const d = new Date();
    let exdays = 6 * 30;
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = `${COOKIE_NAME}=${val};${expires}; path=/`;
}

//pokazanie bsoda po załadowaniu strony i CSSa
window.addEventListener("load", ()=>{
    $(".bsod-hidden-content").removeClass("bsod-hidden-content");
});
