#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Iniciando servidor Socket.IO...');

// Iniciar servidor primero
const serverProcess = spawn('node', ['competition-server.js'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

serverProcess.on('error', (error) => {
  console.error('❌ Error al iniciar servidor:', error);
  process.exit(1);
});

// Esperar 3 segundos para que el servidor se inicie completamente
setTimeout(() => {
  console.log('📱 Iniciando aplicación Expo...');

  // Iniciar Expo después del servidor
  const expoProcess = spawn('npx', ['expo', 'start', '--clear'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  expoProcess.on('error', (error) => {
    console.error('❌ Error al iniciar Expo:', error);
    console.log('💡 Solución: Ejecuta manualmente: npx expo start --clear');
  });

  // Manejar cierre graceful
  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando procesos...');
    serverProcess.kill('SIGINT');
    expoProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando procesos...');
    serverProcess.kill('SIGTERM');
    expoProcess.kill('SIGTERM');
    process.exit(0);
  });

  console.log('✅ Aplicación iniciada correctamente!');
  console.log('🌐 Servidor Socket.IO: http://localhost:3003');
  console.log('📱 Aplicación Expo: http://localhost:8081');

}, 3000);
