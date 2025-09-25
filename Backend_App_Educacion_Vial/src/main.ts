import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Agregar middleware de JSON parsing
  app.use(require('body-parser').json({ limit: '10mb' }));
  app.use(require('body-parser').urlencoded({ extended: true, limit: '10mb' }));

  // ✅ Agregar logging para debugging
  app.use((req, res, next) => {
    console.log('🌐 Solicitud HTTP recibida:', {
      method: req.method,
      path: req.path,
      contentType: req.headers['content-type'],
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : 'undefined',
      bodySize: JSON.stringify(req.body).length
    });
    next();
  });

  // Configuración de CORS
  
  // Configuración de CORS
  const allowedOrigins = [
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
    'http://localhost:8081',
    'http://localhost:9999',
    'exp://v4l4vge-anonymous-8081.exp.direct',
    'http://localhost:*', // Permitir cualquier puerto localhost
    'exp://192.168.68.110:19000', // Asegúrate de que esta sea la URL de tu Expo Go
    /^https?:\/\/192\.168\.68\.\d{1,3}:\d+$/, // Permite cualquier puerto en tu red local
  ];

  app.enableCors({
    origin: (origin, callback) => {
      console.log('Solicitud desde origen:', origin);
      // Permitir solicitudes sin origen (como aplicaciones móviles o solicitudes de Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return origin === allowedOrigin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      })) {
        return callback(null, true);
      }
      
      const msg = 'El CORS policy no permite el acceso desde este origen.';
      console.error(msg, { origin });
      return callback(new Error(msg), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  console.log('Configuración CORS completada. Orígenes permitidos:', allowedOrigins);

  // Configuración de WebSocket
  app.useWebSocketAdapter(new IoAdapter(app));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Quiz Vial')
    .setDescription('API para el juego de educación vial')
    .setVersion('1.0')
    .addTag('quiz')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Validación global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(3002);
  console.log(`Servidor escuchando en: ${await app.getUrl()}`);
  console.log(`Documentación de la API: ${await app.getUrl()}/api`);
}
bootstrap();