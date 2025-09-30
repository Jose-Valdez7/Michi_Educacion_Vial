const { spawn } = require('child_process');
const path = require('path');

// Función para iniciar el servidor
function startServer() {
  console.log('🚀 Iniciando servidor Socket.IO...');

  const serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Error al iniciar servidor:', error);
  });

  return serverProcess;
}

// Función para iniciar la aplicación Expo
function startExpo() {
  console.log('📱 Iniciando aplicación Expo...');

  // Esperar un poco para que el servidor se inicie primero
  setTimeout(() => {
    const expoProcess = spawn('npx', ['expo', 'start'], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    expoProcess.on('error', (error) => {
      console.error('❌ Error al iniciar Expo:', error);
    });

    return expoProcess;
  }, 2000); // Esperar 2 segundos
}

// Función para limpiar procesos al salir
function cleanup(serverProcess, expoProcess) {
  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando procesos...');

    if (serverProcess) {
      serverProcess.kill('SIGINT');
    }

    if (expoProcess) {
      expoProcess.kill('SIGINT');
    }

    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando procesos...');

    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }

    if (expoProcess) {
      expoProcess.kill('SIGTERM');
    }

    process.exit(0);
  });
}

// Iniciar ambos procesos
console.log('🎯 Iniciando aplicación completa...');
console.log('📋 Presiona Ctrl+C para detener ambos procesos');

const serverProcess = startServer();
const expoProcess = startExpo();

// Configurar limpieza
cleanup(serverProcess, expoProcess);

console.log('✅ Servidor y aplicación iniciados correctamente!');
console.log('🌐 Servidor Socket.IO: http://localhost:3002');
console.log('📱 Aplicación Expo: http://localhost:8081');
