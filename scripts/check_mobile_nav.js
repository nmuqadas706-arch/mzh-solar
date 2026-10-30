const fs = require('fs');
const files = ['index.html', ...fs.readdirSync('pages').filter(x => x.endsWith('.html')).map(f => 'pages/' + f)];
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  lines.forEach((line, idx) => {
    if ((line.includes('Solar / Inverters') || line.includes('Solar Panels')) && (line.includes('mobile-nav') || line.includes('<li>'))) {
      console.log(`${f}:${idx+1}: ${line.trim()}`);
    }
  });
});

