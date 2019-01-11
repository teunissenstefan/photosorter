const fs = require('fs');
const remote = require('electron').remote
const dialog = remote.dialog;

window.$ = window.jQuery = require('jquery');
window.Bootstrap = require('bootstrap');
trash = require('trash');

var directories = [];
var filesList = [];
var baseFolder = '';
var currentPhotoIndex = 0;
var currentPhotoFullPath = "";
var currentPhoto = "";

function Move(file,folder){
    var oldPath = baseFolder+"\\"+file;
    var newPath = baseFolder+"\\"+folder+"\\"+file;
    // console.log("basefolder:"+baseFolder);
    // console.log("file:"+file);
    // console.log("folder:"+folder);
    // console.log("newpath:"+newPath);
    fs.rename(oldPath, newPath, function (err) {
    if (err) throw err
        NextPhoto();
    }) 
}

function NextPhoto(){
    filesList.splice(currentPhotoIndex,1);
    if(currentPhotoIndex>=filesList.length){
        currentPhotoIndex--;
    }
    if(filesList.length>=1){
        LoadPhoto();
    }else{
        EmptyPhoto();
    }
}

function EmptyPhoto(){
    currentPhotoFullPath = "";
    currentPhoto = "";
    document.getElementById('photoimg').src = "empty.png";
}

function LoadPhoto(){
    currentPhotoFullPath = baseFolder+"\\"+filesList[currentPhotoIndex];
    currentPhoto = filesList[currentPhotoIndex];
    document.getElementById('photoimg').src = currentPhotoFullPath;
}

function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function LoadContents () {
    return new Promise(function(resolve, reject) {
        fs.readdir(baseFolder, (err, files) => {
            files.forEach(file => {
                fs.stat(baseFolder+"\\"+file,function(err,stats){
                    if(stats.isDirectory()){
                        directories.push(file);
                        var newLi = $("<li class='nav-item'></li>");
                        var newA = $("<a class='nav-link movetolink' data-folder='"+file+"' href='#'>"+capitalizeFirstLetter(file)+"</a>");
                        newLi.append(newA);
                        $( "#foldersListUl" ).append(newLi);
                    }else if(stats.isFile()){
                        filesList.push(file);
                    }
                    resolve();
                });
            });
            // console.log(directories);
            // console.log(filesList);
        })
    });
};

$('body').on('click', '.movetolink', function() {
    if(filesList.length>=1){
        Move(currentPhoto,$(this).attr('data-folder'));
    }
});

$( "#nextBtn" ).click(function() {
    if(filesList.length>(currentPhotoIndex+1)){
        currentPhotoIndex++;
        LoadPhoto();
    }
});

$( "#previousBtn" ).click(function() {
    if(currentPhotoIndex>0){
        currentPhotoIndex--;
        LoadPhoto();
    }
});

$( "#trashBtn" ).click(function() {
    if(filesList.length>=1){
        if(confirm("Are you sure you want to move this image to the trash can?")){
            trash(currentPhotoFullPath).then(() => {
                NextPhoto();
            });
        }
    }
});

var dialogResult = dialog.showOpenDialog({ properties: ['openDirectory'] });
if(dialogResult===undefined){
    remote.getCurrentWindow().close();
}else{
    baseFolder = dialogResult[0];
    AfterFolderChosen();
}

function AfterFolderChosen(){
    LoadContents().then(function(){
        if(filesList.length>=1){
            LoadPhoto();
        }else{
            EmptyPhoto();
        }
    })
    .catch((error) => alert(error));
}