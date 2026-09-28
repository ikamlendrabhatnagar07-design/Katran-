const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const out = path.join(root, 'dist');
fs.mkdirSync(out, {recursive:true});
for (const file of ['index.html','styles.css','app.js','hero.svg','katran-icon.svg']) fs.cpSync(path.join(root,file),path.join(out,file),{recursive:true});
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log('Built Katran in dist/');
