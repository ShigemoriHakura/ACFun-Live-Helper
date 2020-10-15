

const { remote } = require('electron');
const { BrowserWindow } = remote;
const fs = require("fs");
const path = require('path');
const ipcRenderer = require('electron').ipcRenderer;
const Config = require('electron-config');
const config = new Config();
var loaded = false;
$(document).ready(function () {

    var webview = document.getElementById('browserView');
    webview.addEventListener('dom-ready', function () {
        webview.insertCSS('*::-webkit-scrollbar { width: 0 !important }')
    });

    webview.addEventListener('dom-ready', function () {
        if(!loaded){
            loadPage(config.get('lastURL'))
            loaded = true
        }
    });

    // Address bar form
    $("#addressBar").submit(function(e) {
        e.preventDefault();
        loadURL();
    });

    // Opacity Slider
    $("#transparencyRange").change(function(){
        var opacityValue = $(this).val();
        changeOpacity(opacityValue);
    });

    // Select all text when changing URL
    $("input[type='text']").click(function () {
       $(this).select();
    });

});

function getUrl(){
    if(config.get('lastURL')){
        return config.get('lastURL')
    }
    return "https://vup.loli.ren"
}

// Change window Opacity
// Change window Opacity
// Change window Opacity
function changeOpacity(opacity){
    $("body").css('opacity', opacity);
}


// App Controls
// App Controls
// App Controls
function loadURL(){
    var url = $("#urlField").val();

    if(url.indexOf("http") >= 0){
        loadPage(url);

    }else{
        url = "http://" + url;
        loadPage(url);
    }
}

function loadPage(url){
    console.log("Loading " + url);
    config.set('lastURL', url)
    var webview = document.getElementById('browserView');
    fs.readFile(path.join(__dirname,"danmakuStyle.css"),"utf8",(err,data)=>{
        if(err){
            console.log("读取CSS失败");
        }else{
            webview.addEventListener('dom-ready', function () {
                webview.insertCSS(data);
                //webview.openDevTools();
                //console.log("注入CSS",data);
            });
            //console.log("注入CSS");
        }
    })
    webview.loadURL(url);
}


ipcRenderer.on('setClickable', function(event, arg) {
    $("body").css('opacity', 0.95);
    $("#transparencyRange").val(0.95)

    $("#browserView").removeClass("full-size");
    $(".window-chrome").slideDown(200, function(){
        $(".app-controls").slideDown(200);
    });
    // remote.BrowserWindow.getAllWindows().setIgnoreMouseEvents(false);

    console.log("Clickthrough disabled");
});

// Go back
function browserBack(){
    var webview = document.getElementById('browserView');
    webview.back;

}


function enableClickThrough(){
    console.log("Clickthrough enabled.")
    var window = remote.getCurrentWindow();
    window.setIgnoreMouseEvents(true);

    $("#browserView").addClass("full-size");
    $(".app-controls").slideUp(200, function(){
        $(".window-chrome").slideUp(200);
    });

}


// Window Controls
// Window Controls
// Window Controls

function openWebsite(){
    //shell.openExternal("http://mitch.works/apps/glass");
}
function minimizeWindow(){
    var window = remote.getCurrentWindow();
    window.minimize();
}
var windowIsMaximized = false;
function maximizeWindow(){
    var window = remote.getCurrentWindow();
    const { width, height } = remote.screen.getPrimaryDisplay().workAreaSize;
    if(windowIsMaximized){
        windowIsMaximized = false;
        window.setSize(800, 600);
    }else{
        window.setSize(Math.ceil(width * .95), Math.ceil(height * .95));
        window.setPosition(Math.ceil(width * .025), Math.ceil(height * .025))
        windowIsMaximized = true;
    }
}
function closeWindow(){
    var window = remote.getCurrentWindow();
    window.close();
}
