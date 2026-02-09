const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5050;
const BASE = __dirname; // serve files from this folder

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html';
    case '.css': return 'text/css';
    case '.js': return 'application/javascript';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.gif': return 'image/gif';
    default: return 'application/octet-stream';
  }
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let safePath = urlPath === '/' ? '/index.html' : urlPath;
    const filePath = path.join(BASE, safePath);

    // Prevent directory traversal
    if (!filePath.startsWith(BASE)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }

      const ct = contentType(filePath);
      res.writeHead(200, { 'Content-Type': ct });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  } catch (e) {
    res.statusCode = 500;
    res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`Get To Know Me server running: http://localhost:${PORT}/`);
});
