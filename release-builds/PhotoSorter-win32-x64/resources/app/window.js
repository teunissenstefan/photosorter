const remote = require('electron').remote;

function Close(){
    var window = remote.getCurrentWindow();
    window.close();  
}

function Minimize(){
    var window = remote.getCurrentWindow();
    window.minimize();  
}