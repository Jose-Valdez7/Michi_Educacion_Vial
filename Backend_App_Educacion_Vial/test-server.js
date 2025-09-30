const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = createServer(app);

// Configuración de CORS
app.use(cors({
  origin: [
    'http://localhost:19006',
    'http://192.168.68.117:19006',
    'http://192.168.68.117:9999',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:8000',
    'http://localhost:8080',
    'http://localhost:9999',
    'http://localhost:*',
    'exp://192.168.68.117:19000',
    /^https?:\/\/192\.168\.68\.\d{1,3}:\d+$/,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Crear servidor Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:19006',
      'http://192.168.68.117:19006',
      'http://192.168.68.117:9999',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:8000',
      'http://localhost:8080',
      'http://localhost:9999',
      'http://localhost:*',
      'exp://192.168.68.117:19000',
      /^https?:\/\/192\.168\.68\.\d{1,3}:\d+$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Almacenar salas
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('createRoom', (data) => {
    console.log('Creando sala:', data);

    let roomCode;
    if (data.roomCode) {
      if (rooms.has(data.roomCode)) {
        socket.emit('error', { message: 'El código de sala ya existe' });
        return;
      }
      roomCode = data.roomCode;
    } else {
      do {
        roomCode = generateRoomCode();
      } while (rooms.has(roomCode));
    }

    const room = {
      code: roomCode,
      players: {
        [socket.id]: {
          id: data.playerId,
          name: data.playerName,
          score: 0,
          isHost: true
        }
      },
      gameState: 'waiting',
      maxPlayers: data.maxPlayers || 4
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);

    io.to(roomCode).emit('roomCreated', {
      roomCode,
      players: Object.values(room.players)
    });

    console.log('Sala creada:', roomCode);
  });

  socket.on('joinRoom', (data) => {
    console.log('Uniendo a sala:', data);

    const room = rooms.get(data.roomCode);

    if (!room) {
      socket.emit('error', { message: 'Sala no encontrada' });
      return;
    }

    if (Object.keys(room.players).length >= room.maxPlayers) {
      socket.emit('error', { message: 'La sala está llena' });
      return;
    }

    room.players[socket.id] = {
      id: data.playerId,
      name: data.playerName,
      score: 0,
      isHost: false
    };

    socket.join(data.roomCode);

    io.to(data.roomCode).emit('playerJoined', {
      players: Object.values(room.players)
    });

    console.log('Jugador unido:', data.playerName);
  });

  socket.on('startCompetition', (data) => {
    console.log('Iniciando competencia:', data);

    const room = rooms.get(data.roomCode);

    if (!room) {
      socket.emit('error', { message: 'Sala no encontrada' });
      return;
    }

    // Verificar que el jugador que inicia la competencia sea el host
    const player = room.players[socket.id];
    if (!player || !player.isHost) {
      socket.emit('error', { message: 'Solo el host puede iniciar la competencia' });
      return;
    }

    // Cambiar el estado de la sala a in_progress
    room.gameState = 'in_progress';

    // Notificar a todos los jugadores que la competencia ha iniciado
    io.to(data.roomCode).emit('competitionStarted', {
      roomCode: data.roomCode,
      players: Object.values(room.players)
    });

    console.log('Competencia iniciada por:', player.name);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);

    rooms.forEach((room, roomCode) => {
      if (room.players[socket.id]) {
        delete room.players[socket.id];

        if (Object.keys(room.players).length === 0) {
          rooms.delete(roomCode);
          console.log('Sala eliminada:', roomCode);
        } else {
          io.to(roomCode).emit('playerLeft', {
            playerId: socket.id,
            players: Object.values(room.players)
          });
        }
      }
    });
  });
});

// Función para generar código único de sala
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Servidor de competencia funcionando!', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Socket.IO disponible en ws://192.168.68.117:${PORT}`);
});

module.exports = { app, server, io };
