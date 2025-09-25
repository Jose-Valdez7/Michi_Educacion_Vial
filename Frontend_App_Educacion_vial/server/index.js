const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const questions = require('../app/quiz/questions.json');

// Inicializar la aplicación Express
const app = express();
const server = http.createServer(app);

// Configurar CORS
app.use(cors({
  origin: config.cors.origin,
  methods: config.cors.methods
}));

// Configurar middleware para parsear JSON
app.use(express.json());

// Configurar multer para manejar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Almacenamiento en memoria para imágenes
const images = new Map();

// Endpoints para manejar imágenes
app.post('/images/:childId', upload.single('image'), (req, res) => {
  try {
    const { childId } = req.params;
    const { title, taskId, baseImage } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó imagen' });
    }
    
    const imageData = {
      id: Date.now().toString(),
      childId,
      title: title || 'Dibujo',
      taskId,
      baseImage,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      dateCreated: new Date().toISOString(),
      data: {
        title: title || 'Dibujo',
        taskId,
        baseImage,
        imageUrl: `/uploads/${req.file.filename}`
      }
    };
    
    // Almacenar en memoria (en producción usar base de datos)
    images.set(imageData.id, imageData);
    
    console.log('Imagen guardada:', imageData);
    res.json(imageData);
  } catch (error) {
    console.error('Error guardando imagen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener imágenes de un niño
app.get('/images/:childId', (req, res) => {
  try {
    const { childId } = req.params;
    const childImages = Array.from(images.values())
      .filter(img => img.childId === childId)
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    
    res.json(childImages);
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar imagen
app.delete('/images/:childId/:imageId', (req, res) => {
  try {
    const { childId, imageId } = req.params;
    const image = images.get(imageId);
    
    if (!image || image.childId !== childId) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    // Eliminar archivo del sistema
    if (fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }
    
    // Eliminar de memoria
    images.delete(imageId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    methods: config.cors.methods
  },
  // Habilitar compresión y otros ajustes de rendimiento
  maxHttpBufferSize: 1e8, // 100MB
  pingTimeout: 60000, // 60 segundos
  pingInterval: 25000, // 25 segundos
});

// Almacenamiento en memoria (en producción, usa una base de datos)
const rooms = new Map();
const players = new Map();

// Función para obtener una sala por código
function getRoom(roomCode) {
  return rooms.get(roomCode);
}

// Función para crear una nueva sala
function createRoom(roomCode, playerId, playerName) {
  const room = {
    code: roomCode,
    hostId: playerId,
    players: [playerId],
    gameState: 'waiting',
    questions: [],
    currentQuestion: 0,
    timer: null,
    startTime: null,
    countdown: null
  };
  
  rooms.set(roomCode, room);
  return room;
}

// Función para seleccionar preguntas aleatorias
function selectRandomQuestions(count) {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, questions.length));
}

// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
  // Nuevo cliente conectado
  
  // Unirse a una sala
  socket.on('joinRoom', ({ roomCode, playerId, playerName }) => {
    try {
      let room = getRoom(roomCode);
      
      // Si la sala no existe, el primer jugador la crea
      if (!room) {
        room = createRoom(roomCode, playerId, playerName);
      } 
      // Si la sala existe pero ya está en juego
      else if (room.gameState !== 'waiting') {
        socket.emit('error', 'La partida ya ha comenzado');
        return;
      }
      // Si la sala está llena
      else if (room.players.length >= config.game.maxPlayers) {
        socket.emit('error', 'La sala está llena');
        return;
      }
      
      // Unir al jugador a la sala
      socket.join(roomCode);
      
      // Registrar al jugador
      players.set(playerId, {
        id: playerId,
        socketId: socket.id,
        name: playerName,
        roomCode,
        score: 0,
        isReady: false,
        answers: [],
        joinTime: Date.now()
      });
      
      // Agregar jugador a la sala
      if (!room.players.includes(playerId)) {
        room.players.push(playerId);
      }
      
      // Notificar a todos en la sala sobre el nuevo jugador
      io.to(roomCode).emit('playerJoined', {
        playerId,
        playerName,
        players: room.players.map(id => players.get(id))
      });
      
    } catch (error) {
      socket.emit('error', 'Error al unirse a la sala');
    }
  });
  
  // Marcar jugador como listo
  socket.on('toggleReady', ({ roomCode, playerId }) => {
    const player = players.get(playerId);
    if (!player) return;
    
    player.isReady = !player.isReady;
    
    io.to(roomCode).emit('playerReady', {
      playerId,
      isReady: player.isReady,
      players: getRoom(roomCode)?.players.map(id => players.get(id)) || []
    });
  });
  
  // Iniciar el juego (solo el anfitrión)
  socket.on('startGame', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostId !== socket.id) return;
    
    // Verificar que haya al menos 2 jugadores
    if (room.players.length < 2) {
      socket.emit('error', 'Se necesitan al menos 2 jugadores para comenzar');
      return;
    }
    
    // Verificar que todos estén listos
    const allReady = room.players.every(id => players.get(id)?.isReady);
    if (!allReady) {
      socket.emit('error', 'Todos los jugadores deben estar listos');
      return;
    }
    
    // Iniciar cuenta regresiva
    room.gameState = 'starting';
    let countdown = config.game.countdownTime;
    
    io.to(roomCode).emit('gameStarting', { countdown });
    
    room.countdown = setInterval(() => {
      countdown--;
      
      if (countdown <= 0) {
        clearInterval(room.countdown);
        startGame(room);
      } else {
        io.to(roomCode).emit('countdownUpdate', { countdown });
      }
    }, 1000);
  });
  
  // Manejar respuestas de los jugadores
  socket.on('answer', ({ roomCode, playerId, questionIndex, answer, isCorrect, timeSpent }) => {
    const player = players.get(playerId);
    const room = getRoom(roomCode);
    
    if (!player || !room || room.gameState !== 'in_progress') return;
    
    // Registrar la respuesta del jugador
    player.answers[questionIndex] = {
      questionIndex,
      answer,
      isCorrect,
      timeSpent,
      timestamp: Date.now()
    };
    
    // Calcular puntuación (más puntos por respuestas más rápidas)
    if (isCorrect) {
      const timeBonus = Math.ceil((config.game.questionTime - timeSpent) / 10) + 1;
      player.score += timeBonus;
    }
    
    // Notificar a todos los jugadores sobre la respuesta
    io.to(roomCode).emit('answerReceived', {
      playerId,
      questionIndex,
      isCorrect,
      score: player.score
    });
    
    // Verificar si todos han respondido
    checkAllAnswered(room);
  });
  
  // Verificar si todos han respondido a la pregunta actual
  function checkAllAnswered(room) {
    const allAnswered = room.players.every(playerId => {
      const player = players.get(playerId);
      return player.answers[room.currentQuestion] !== undefined;
    });
    
    if (allAnswered) {
      // Esperar un momento antes de pasar a la siguiente pregunta
      setTimeout(() => nextQuestion(room), 2000);
    }
  }
  
  // Pasar a la siguiente pregunta
  function nextQuestion(room) {
    room.currentQuestion++;
    
    if (room.currentQuestion < config.game.questionsPerGame) {
      io.to(room.code).emit('nextQuestion', {
        questionIndex: room.currentQuestion,
        question: room.questions[room.currentQuestion]
      });
    } else {
      // Fin del juego
      endGame(room);
    }
  }
  
  // Iniciar el juego
  function startGame(room) {
    room.gameState = 'in_progress';
    room.questions = selectRandomQuestions(config.game.questionsPerGame);
    room.currentQuestion = 0;
    room.startTime = Date.now();
    
    // Enviar la primera pregunta a todos los jugadores
    io.to(room.code).emit('gameStarted', {
      questions: room.questions,
      currentQuestion: 0
    });
  }
  
  // Finalizar el juego
  function endGame(room) {
    room.gameState = 'finished';
    
    // Calcular resultados finales
    const results = room.players.map(playerId => {
      const player = players.get(playerId);
      return {
        id: player.id,
        name: player.name,
        score: player.score,
        correctAnswers: player.answers.filter(a => a?.isCorrect).length,
        totalTime: player.answers.reduce((total, a) => total + (a?.timeSpent || 0), 0)
      };
    }).sort((a, b) => b.score - a.score || a.totalTime - b.totalTime);
    
    // Enviar resultados a todos los jugadores
    io.to(room.code).emit('gameOver', { results });
    
    // Limpiar la sala después de un tiempo
    setTimeout(() => {
      room.players.forEach(playerId => {
        const player = players.get(playerId);
        if (player) {
          player.socketId && io.sockets.sockets.get(player.socketId)?.leave(room.code);
          players.delete(playerId);
        }
      });
      rooms.delete(room.code);
    }, 300000); // 5 minutos para ver los resultados
  }
  
  // Manejar desconexiones
  socket.on('disconnect', () => {
    // Cliente desconectado
    
    // Encontrar al jugador desconectado
    const player = Array.from(players.values()).find(p => p.socketId === socket.id);
    if (!player) return;
    
    const room = getRoom(player.roomCode);
    if (!room) return;
    
    // Notificar a los demás jugadores
    socket.to(room.code).emit('playerLeft', {
      playerId: player.id,
      playerName: player.name
    });
    
    // Si el anfitrión se desconecta, elegir uno nuevo o terminar el juego
    if (room.hostId === player.id) {
      const newHost = room.players.find(id => id !== player.id);
      if (newHost) {
        room.hostId = newHost;
        io.to(room.code).emit('newHost', { playerId: newHost });
      } else if (room.gameState === 'waiting') {
        // Si no hay más jugadores, eliminar la sala
        rooms.delete(room.code);
      }
    }
    
    // Eliminar al jugador de la sala
    room.players = room.players.filter(id => id !== player.id);
    players.delete(player.id);
    
    // Si no quedan jugadores en una sala de espera, eliminarla
    if (room.players.length === 0 && room.gameState === 'waiting') {
      rooms.delete(room.code);
    }
  });
});

// Iniciar el servidor
server.listen(config.port, () => {
  // Servidor iniciado
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  // Error no capturado
});

process.on('unhandledRejection', (reason, promise) => {
  // Promesa rechazada no manejada
});
