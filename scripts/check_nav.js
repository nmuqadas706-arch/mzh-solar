const fs = require('fs');
const files = ['index.html', ...fs.readdirSync('pages').filter(x => x.endsWith('.html')).map(f => 'pages/' + f)];
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/<div class="nav-dropdown-menu"[\s\S]*?<\/div>/);
  if (m) {
    console.log(f + ': ' + m[0].replace(/\s+/g, ' '));
  }
});

