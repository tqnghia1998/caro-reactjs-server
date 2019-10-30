var io = require('../bin');

var room = {
    roomId: null,
    playerX: null,
    playerO: null
};

var listRooms = [];

io.on('connection', function (socket) { 
    
    console.log('a connection request');

    socket.on('joinroom', function(data) {

        // create new room if neccessary
        var room = {
            roomId: listRoom.length,
            playerX: data.username,
            playerO: null
        }
        listRooms.push(room);

        console.log("socket.on joinroom", JSON.stringify(data));
    }); 

    socket.on('disconnect', function() {
        console.log("socket.on disconnect", JSON.stringify(data));
    }); 
});

function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function getBase64Image(imgData) {
    return imgData.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
}