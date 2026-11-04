const { spawn } = require('child_process');
const net = require('net');

// Check if port is available
function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        reject(err);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Main diagnostic function
async function diagnose() {
  console.log('🔍 Running Angular development server diagnostics...\n');
  
  // Check port 4200
  const port4200Available = await checkPort(4200);
  const port4201Available = await checkPort(4201);
  
  console.log(`Port 4200 available: ${port4200Available ? '✅' : '❌'}`);
  console.log(`Port 4201 available: ${port4201Available ? '✅' : '❌'}`);
  
  if (!port4200Available) {
    console.log('\n⚠️  Port 4200 is in use. Trying port 4201...');
    startServer(4201);
  } else {
    startServer(4200);
  }
}

function startServer(port) {
  console.log(`\n🚀 Starting Angular development server on port ${port}...`);
  
  const ngServe = spawn('npx', ['ng', 'serve', '--port', port, '--host', 'localhost', '--verbose'], {
    stdio: 'inherit',
    shell: true
  });
  
  ngServe.on('error', (error) => {
    console.error('❌ Failed to start ng serve:', error);
  });
  
  ngServe.on('close', (code) => {
    console.log(`\n ng serve exited with code ${code}`);
  });
}

diagnose().catch(console.error);