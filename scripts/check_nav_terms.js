const fs = require('fs');
const files = ['index.html', ...fs.readdirSync('pages').filter(x => x.endsWith('.html')).map(f => 'pages/' + f)];
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  ['solar panel', 'solar panels', 'solar / inverters'].forEach(term => {
    const lines = c.split('\n');
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(term) && (line.includes('nav') || line.includes('dropdown') || line.includes('mobile-nav') || line.includes('menu'))) {
        console.log(`${f}:${idx+1}: ${line.trim()}`);
      }
    });
  });
});

