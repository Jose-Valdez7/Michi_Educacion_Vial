#!/usr/bin/env node

const { spawn } = require('child_process');

// Función simple para iniciar el servidor
function startServer() {
  console.log('🚀 Iniciando servidor Socket.IO...');

  const serverProcess = spawn('node', ['competition-server.js'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Error al iniciar servidor:', error);
  });

  return serverProcess;
}

// Función simple para iniciar Expo
function startExpo() {
  console.log('📱 Iniciando aplicación Expo...');

  const expoProcess = spawn('npx', ['expo', 'start', '--clear'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  expoProcess.on('error', (error) => {
    console.error('❌ Error al iniciar Expo:', error);
    console.log('💡 Solución: Ejecuta "npm install" e intenta de nuevo');
  });

  return expoProcess;
}

// Función principal
function main() {
  console.log('🎯 Iniciando aplicación completa...');
  console.log('📋 Presiona Ctrl+C para detener ambos procesos');

  try {
    // Iniciar servidor primero
    const serverProcess = startServer();

    // Esperar un poco para que el servidor se inicie
    setTimeout(() => {
      const expoProcess = startExpo();

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

  } catch (error) {
    console.error('❌ Error al iniciar aplicación:', error.message);
    console.log('\n🔧 Soluciones alternativas:');
    console.log('1. Usa: npm run server (solo servidor)');
    console.log('2. Usa: npm run expo (solo aplicación)');
    console.log('3. Ejecuta manualmente:');
    console.log('   Terminal 1: node competition-server.js');
    console.log('   Terminal 2: npx expo start --clear');
    process.exit(1);
  }
}

// Ejecutar
main();
