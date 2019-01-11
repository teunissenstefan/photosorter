const baseFolder = './tests/';
const fs = require('fs');

window.$ = window.jQuery = require('jquery');
window.Bootstrap = require('bootstrap');
trash = require('trash');

var directories = [];
var filesList = [];
var currentPhotoFullPath = "";
var currentPhoto = "";

function Move(file,folder){
    var oldPath = baseFolder+file;
    var newPath = baseFolder+folder+"/"+file;
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
    filesList.shift();
    if(filesList.length>=1){
        LoadPhoto();
    }else{
        currentPhotoFullPath = "";
        currentPhoto = "";
        document.getElementById('photoimg').src = "empty.png";
    }
}

function LoadPhoto(){
    currentPhotoFullPath = baseFolder+filesList[0];
    currentPhoto = filesList[0];
    document.getElementById('photoimg').src = baseFolder+filesList[0];
}

function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function LoadContents () {
    return new Promise(function(resolve, reject) {
        fs.readdir(baseFolder, (err, files) => {
            files.forEach(file => {
                fs.stat('./tests/'+file,function(err,stats){
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
    Move(currentPhoto,$(this).attr('data-folder'));
});

$( "#trashBtn" ).click(function() {
    if(confirm("Are you sure you want to move this image to the trash can?")){
        trash(currentPhotoFullPath).then(() => {
            NextPhoto();
        });
    }
});

LoadContents().then(function(){
    if(filesList.length>=1){
        LoadPhoto();
    }else{
        currentPhotoFullPath = "";
        currentPhoto = "";
        document.getElementById('photoimg').src = "empty.png";
    }
})
.catch((error) => alert(error));