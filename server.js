/**
 * PMHub 静态站点服务器（ESM）— 支持 --host / --port（或 -h / -p）参数，
 * 默认 host 127.0.0.1、端口 7100（Kimi Work 会分配冲突空闲端口）。
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
function argValue(flags, dflt) {
  for (const f of flags) {
    const i = args.indexOf(f);
    if (i !== -1 && args[i + 1]) return args[i + 1];
  }
  return dflt;
}
const HOST = argValue(['--host', '-h'], '127.0.0.1');
const PORT = parseInt(argValue(['--port', '-p'], '7100'), 10);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8'
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not Found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, HOST, () => {
  console.log(`PMHub 知识库已启动: http://${HOST}:${PORT}/`);
});
