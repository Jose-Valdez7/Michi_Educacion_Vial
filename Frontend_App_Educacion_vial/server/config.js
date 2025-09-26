require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://192.168.68.110:3000',
    methods: ['GET', 'POST']
  },
  game: {
    maxPlayers: 4,
    questionTime: 30, // segundos
    questionsPerGame: 10,
    countdownTime: 5 // segundos para empezar el juego
  }
};
