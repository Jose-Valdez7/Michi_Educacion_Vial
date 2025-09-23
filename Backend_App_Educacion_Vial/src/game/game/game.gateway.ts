import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  SubscribeMessage 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(0, { // Puerto del servidor HTTP (0 = asignar automáticamente)
  cors: {
    origin: [
      'http://localhost:19006',
      'http://192.168.68.110:19006',
      'http://192.168.68.110:9999',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:8000',
      'http://localhost:8080',
      'http://localhost:9999',
      'http://localhost:*', // Permitir cualquier puerto localhost
      'exp://192.168.68.110:19000',
      /^https?:\/\/192\.168\.68\.\d{1,3}:\d+$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
  },
  path: '/socket.io/',
  serveClient: false,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private rooms = new Map<string, any>(); // Almacenar salas

  handleConnection(client: Socket) {
    console.log('Cliente conectado:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Cliente desconectado:', client.id);
    // Limpiar salas cuando un jugador se desconecta
    this.rooms.forEach((room, roomCode) => {
      if (room.players[client.id]) {
        delete room.players[client.id];
        // Si la sala queda vacía, eliminarla
        if (Object.keys(room.players).length === 0) {
          this.rooms.delete(roomCode);
        } else {
          // Notificar a los demás jugadores
          this.server.to(roomCode).emit('playerLeft', { playerId: client.id });
        }
      }
    });
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(client: Socket, data: { playerName: string }) {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = {
      code: roomCode,
      players: {
        [client.id]: {
          id: client.id,
          name: data.playerName,
          score: 0
        }
      },
      gameState: 'waiting'
    };
    
    this.rooms.set(roomCode, room);
    client.join(roomCode);
    
    return { 
      event: 'roomCreated', 
      data: { 
        roomCode,
        players: Object.values(room.players)
      } 
    };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: { roomCode: string; playerName: string }) {
    const room = this.rooms.get(data.roomCode);
    
    if (!room) {
      return { event: 'error', data: { message: 'Sala no encontrada' } };
    }
    
    if (Object.keys(room.players).length >= 4) {
      return { event: 'error', data: { message: 'La sala está llena' } };
    }
    
    room.players[client.id] = {
      id: client.id,
      name: data.playerName,
      score: 0
    };
    
    client.join(data.roomCode);
    
    // Notificar a todos en la sala
    this.server.to(data.roomCode).emit('playerJoined', {
      players: Object.values(room.players)
    });
    
    return { 
      event: 'roomJoined', 
      data: { 
        roomCode: data.roomCode,
        players: Object.values(room.players)
      } 
    };
  }
}