var listRooms = [];
var initLogic = require('../ai/logic');

module.exports = function (io, socket) {

    socket.on('on-reconnect', function (data) {
  
      // find the room
      if (data.roomInfo) {
  
        socket.data = data.userInfo;
  
        for (var i = 0; i < listRooms.length; i++) {
          if (listRooms[i].id === data.roomInfo.id) {
  
            // assigan player name
            if (listRooms[i].playerO === 'DISCONNECTED') {
              listRooms[i].playerO = data.userInfo.fullname;
            }
            else {
              listRooms[i].playerX = data.userInfo.fullname;
            }
  
            // restore value
            socket.room = listRooms[i].id;
            socket.join(socket.room);
  
            // inform the other
            socket.to(socket.room).emit('on-reconnect', listRooms[i]);
            console.log('Player [' + data.userInfo.username + '] reconnected in room [' + socket.room + ']');
            
            // send last move in case user missed it when reconnecting
            if (listRooms[i].lastMove) {
              socket.emit('move', listRooms[i].lastMove);
            }
            
            return;
          }
        }
  
        // in case the room was destroyed
        socket.emit('on-reconnect', null);
        console.log('Player [' + data.userInfo.username + '] find room [' + data.roomInfo.id + '] but not exists');
      }
    });
  
    socket.on('joinroom', function (data) {
  
      // save data
      socket.data = data;
  
      // find an empty room
      for (var i = 0; i < listRooms.length; i++) {
  
        // it's empty when there is no second player
        if (listRooms[i].playerO == null) {
  
          // fill empty seat and join room
          listRooms[i].playerO = data.fullname;
          socket.room = listRooms[i].id;
          socket.join(socket.room);
  
          // send successful message to both
          io.in(listRooms[i].id).emit('joinroom-success', listRooms[i]);
  
          console.log('Room [' + socket.room + '] played');
          return;
        }
      }
  
      // create new room if there is no empty one
      var room = {
        id: data.username + Date.now(),
        playerX: data.fullname,
        playerO: null
      }
      listRooms.push(room);
  
      // add this client to the room
      socket.room = room.id;
      socket.join(socket.room);
  
      console.log('Room [' + socket.room + '] created');
    });
  
    /**
     * please not try to understand the algorithm, it is complicated
     */
    socket.on('joinroom-ai', function (data) {
  
      // save data
      socket.data = data;
  
      // create new room with AI
      var room = {
        id: data.username + Date.now(),
        playerX: data.fullname,
        playerO: 'I am Bot'
      }
      listRooms.push(room);
  
      // mark flag
      socket.room = room.id;
      socket.withBot = true;
      socket.emit('joinroom-success-ai', room);
  
      // initialize logic game on server
      socket.logic = initLogic();
  
      // bot will do the first move (hard mode)
      const randX = Math.floor(Math.random() * 10 + 5);
      const randY = Math.floor(Math.random() * 10 + 5);
      socket.logic.makeBotMove(randX, randY);
      socket.emit('move', {
        row: randX,
        col: randY
      });
  
      console.log('Room [' + socket.room + '] with AI created');
    });
  
    // has handle bot
    socket.on('move', function (data) {
  
      if (socket.withBot) {
  
        // Save to logic server and get bot move
        const botMove = socket.logic.makePlayerMove(data.row, data.col);
  
        if (botMove[0] == -1 && botMove[1] == -1) {
          socket.emit('surrender-request', 'I am bot');
        }
        else {
          socket.emit('move', {
            row: botMove[0],
            col: botMove[1]
          })
        }
      }
      else {
        socket.to(socket.room).emit('move', data);
      }
      
      // mark last move
      for (var i = 0; i < listRooms.length; i++) {
        if (listRooms[i].id == socket.room) {
          listRooms[i].lastMove = data;
        }
      }
    });
  
    // has handle bot
    socket.on('chat', function (data) {
      if (socket.withBot) {
        socket.emit('chat', {
          sender: 'Mình',
          message: data
        });
        socket.emit('chat', {
          sender: 'ĐThủ',
          message: 'I am just a Bot'
        });
      }
      else {
        socket.emit('chat', {
          sender: 'Mình',
          message: data
        });
        socket.to(socket.room).emit('chat', {
          sender: 'ĐThủ',
          message: data
        });
      }
    });
  
    // has handle bot
    socket.on('surrender-request', function (data) {
      if (socket.withBot) {
        socket.emit('surrender-result', {
          message: 'yes',
          noAlert: true
        });
      }
      else {
        socket.to(socket.room).emit('surrender-request', '');
      }
    });
  
    socket.on('surrender-result', function (data) {
      socket.to(socket.room).emit('surrender-result', data);
    });
  
    // has handle bot
    socket.on('ceasefire-request', function (data) {
      if (socket.withBot) {
        socket.emit('ceasefire-result', {
          message: 'yes',
          noAlert: true
        });
      }
      else {
        socket.to(socket.room).emit('ceasefire-request', data);
      }
    });
  
    socket.on('ceasefire-result', function (data) {
      socket.to(socket.room).emit('ceasefire-result', data);
    });
  
    // has handle bot
    socket.on('undo-request', function (data) {
      if (socket.withBot) {
  
        socket.emit('undo-result', {
          noAlert: true,
          message: 'yes',
          stepNumber: data.stepNumber
        });
  
        if (socket.logic.rollBackTo(data.stepNumber, data.x, data.y)) {
          setTimeout(function () {
            socket.emit('move', {
              row: data.nextX,
              col: data.nextY
            });
          }, 1000);
        }
      }
      else {
        socket.to(socket.room).emit('undo-request', data);
      }
    });
  
    socket.on('undo-result', function (data) {
      socket.to(socket.room).emit('undo-result', data);
    });
  
    // has handle bot
    socket.on('play-again-request', function (data) {
      if (socket.withBot) {
        socket.emit('play-again-result', {
          message: 'yes',
          noAlert: true
        });
  
        // Bot auto first move
        socket.logic.reset();
        const randX = Math.floor(Math.random() * 10 + 5);
        const randY = Math.floor(Math.random() * 10 + 5);
        socket.logic.makeBotMove(randX, randY);
        socket.emit('move', {
          row: randX,
          col: randY
        });
      }
      else {
        socket.to(socket.room).emit('play-again-request', data);
      }
    });
  
    socket.on('play-again-result', function (data) {
      socket.to(socket.room).emit('play-again-result', data);
    });
  
    socket.on('disconnect', function () {
  
      socket.removeAllListeners();
  
      // leave current room
      socket.leave(socket.room);
  
      // make the room empty or destroy it
      for (var i = 0; i < listRooms.length; i++) {
        if (listRooms[i].id == socket.room) {
  
          // destroy it when the room just created, second player hasn't enter yet
          if (socket.withBot || listRooms[i].playerO == null) {
            listRooms.splice(i, 1);
            console.log('Room [' + socket.room + '] destroyed');
          }
          // mark the room empty by set flag DISCONNECTED for the one left 
          else {
  
            if (listRooms[i].playerO === socket.data.fullname) {
              listRooms[i].playerO = 'DISCONNECTED';
            }
            else {
              listRooms[i].playerX = 'DISCONNECTED';
            }
  
            // check if both is disconnect
            if (listRooms[i].playerO === 'DISCONNECTED' && listRooms[i].playerX === 'DISCONNECTED') {
  
              // destroy the room
              listRooms.splice(i, 1);
              console.log('Room [' + socket.room + '] destroyed');
            } else {
            
              // inform the other
              io.to(listRooms[i].id).emit('disconnect', listRooms[i]);
              console.log('Player [' + socket.data.username + '] leave room [' + socket.room + ']');
            }
          }
          
          break;
        }
      }
    });
}