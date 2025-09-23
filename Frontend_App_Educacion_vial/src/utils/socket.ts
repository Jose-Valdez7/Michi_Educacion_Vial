import { io, Socket } from 'socket.io-client';

// Asegúrate de que la URL coincida con la IP y puerto de tu servidor backend
const URL = 'http://192.168.68.110:3002';

export const socket: Socket = io(URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'], // Añadido 'polling' como respaldo
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

// Manejadores de eventos para depuración
socket.on('connect', () => {
  console.log('Conectado al servidor de socket');
});

socket.on('disconnect', (reason) => {
  console.log('Desconectado del servidor de socket:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Error de conexión de socket:', error);
});