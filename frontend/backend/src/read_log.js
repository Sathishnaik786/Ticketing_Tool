const fs = require('fs');
const path = require('path');

try {
  const logPath = path.join(__dirname, 'server_log.txt');
  const content = fs.readFileSync(logPath, 'utf16le');
  fs.writeFileSync(path.join(__dirname, 'server_log_utf8.txt'), content, 'utf8');
  console.log('Successfully converted server_log.txt to UTF-8.');
} catch (err) {
  console.error('Error: ', err.message);
}
