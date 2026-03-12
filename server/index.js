const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST"]
  }
});

// In-memory store for rooms
// Structure:
// rooms[roomId] = {
//   players: [{ id: socket.id, profile: Profile, score: 0, isReady: boolean }],
//   gameState: GameState,
//   hostId: socket.id
// }
const rooms = {};

const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', (data, callback) => {
    // data: { profile, maxPlayers, boardSize, theme }
    const roomId = generateRoomCode();
    
    rooms[roomId] = {
      id: roomId,
      hostId: socket.id,
      players: [{
        socketId: socket.id,
        id: 1, // Player 1
        name: data.profile.name,
        avatar: data.profile.avatar,
        score: 0,
        isReady: false
      }],
      settings: {
        maxPlayers: data.maxPlayers || 2,
        boardSize: data.boardSize,
        theme: data.theme || 'classic'
      },
      status: 'LOBBY'
    };

    socket.join(roomId);
    console.log(`Room created: ${roomId} by ${socket.id}`);
    
    if (callback) {
        callback({ success: true, roomId, roomData: rooms[roomId] });
    }
  });

  socket.on('joinRoom', ({ roomId, profile }, callback) => {
    const room = rooms[roomId];
    if (!room) {
      if(callback) callback({ success: false, message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.settings.maxPlayers) {
      if(callback) callback({ success: false, message: 'Room is full' });
      return;
    }

    if(room.status !== 'LOBBY') {
        if(callback) callback({ success: false, message: 'Game has already started' });
        return;
    }

    const newPlayerId = room.players.length + 1;
    const newPlayer = {
      socketId: socket.id,
      id: newPlayerId,
      name: profile.name,
      avatar: profile.avatar,
      score: 0,
      isReady: false
    };

    room.players.push(newPlayer);
    socket.join(roomId);

    console.log(`User ${socket.id} joined room ${roomId}`);
    
    // Broadcast updated room data to all players in the room
    io.to(roomId).emit('roomUpdated', room);

    if(callback) callback({ success: true, roomId, roomData: room });
  });

  socket.on('leaveRoom', (roomId) => {
      leaveRoom(socket.id, roomId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Find all rooms this socket is in and remove them
    for (const roomId in rooms) {
        leaveRoom(socket.id, roomId);
    }
  });

  const leaveRoom = (socketId, roomId) => {
    const room = rooms[roomId];
    if (room) {
        room.players = room.players.filter(p => p.socketId !== socketId);
        socket.leave(roomId);
        
        if (room.players.length === 0) {
            delete rooms[roomId];
            console.log(`Room ${roomId} deleted`);
        } else {
            // Re-assign host if host left
            if(room.hostId === socketId) {
                room.hostId = room.players[0].socketId;
            }
            io.to(roomId).emit('roomUpdated', room);
            io.to(roomId).emit('playerLeft', { socketId });
        }
    }
  };

  // Game actions
  socket.on('startGame', ({ roomId, seed }) => {
      const room = rooms[roomId];
      if (room && room.hostId === socket.id) {
          room.status = 'PLAYING';
          room.currentFrame = 0;
          room.seed = seed;
          room.players.forEach(p => p.score = 0);
          io.to(roomId).emit('gameStarted', { ...room, seed });
          console.log(`Game started in room ${roomId} with seed ${seed}`);
      }
  });

  socket.on('playerInput', ({ roomId, type, data }) => {
      const room = rooms[roomId];
      if(room) {
          room.currentFrame = (room.currentFrame || 0) + 1;
          const inputFrame = {
              frame: room.currentFrame,
              playerId: room.players.find(p => p.socketId === socket.id)?.id,
              type,
              data
          };
          io.to(roomId).emit('inputReceived', inputFrame);
      }
  });

  // Since the frontend currently generates the board, we can let the host generate the board and sync it,
  // or generate it on the server. For simplicity with existing code, let host send the initial board.
  socket.on('syncBoard', ({ roomId, board, players, activePlayerId }) => {
      const room = rooms[roomId];
      if(room && room.hostId === socket.id) {
          room.board = board;
          room.players = players;
          room.activePlayerId = activePlayerId;
          io.to(roomId).emit('boardSynced', { board, players, activePlayerId });
          // Also broadcast room update to keep caches in sync
          io.to(roomId).emit('roomUpdated', room);
      }
  });

  socket.on('cardFlipped', ({ roomId, cardIndex, playerId }) => {
      // Broadcast card flip to all other players in the room
      socket.to(roomId).emit('playerFlippedCard', { cardIndex, playerId });
  });

  socket.on('cardsMatched', ({ roomId, matchData, updatedPlayers, nextActivePlayerId, isGameOver }) => {
      // Host typically authorizes/determines this and broadcasts the state update
      const room = rooms[roomId];
      if(room) {
          // Sync scores
          updatedPlayers.forEach(up => {
            const p = room.players.find(rp => rp.id === up.id);
            if(p) p.score = up.score;
          });
          room.activePlayerId = nextActivePlayerId;
          if(isGameOver) {
              room.status = 'GAME_OVER';
          }
          
          io.to(roomId).emit('matchResolved', { matchData, updatedPlayers, nextActivePlayerId, isGameOver });
      }
  });

   socket.on('noMatch', ({ roomId, nextActivePlayerId }) => {
      const room = rooms[roomId];
      if(room) {
          room.activePlayerId = nextActivePlayerId;
          io.to(roomId).emit('turnChanged', { nextActivePlayerId });
      }
   });

   socket.on('usePowerUp', ({ roomId, powerUpType, playerId }) => {
       const room = rooms[roomId];
       if(room) {
           // Broadcast to everyone else
           socket.to(roomId).emit('powerUpUsed', { powerUpType, playerId });
       }
   });

 });

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
