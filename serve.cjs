const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};
http.createServer((req,res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  const relative = path.relative(root,file);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !(relative === 'index.html' || relative === 'styles.css' || relative === 'app.js' || relative === 'hero.svg' || relative === 'katran-icon.svg')) {res.writeHead(404).end('Not found'); return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;} res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream'});res.end(data);});
}).listen(Number(process.env.PORT || 3000),'127.0.0.1',()=>console.log('Katran: http://localhost:' + (process.env.PORT || 3000)));
