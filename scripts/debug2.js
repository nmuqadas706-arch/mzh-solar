const fs = require('fs');
const c = fs.readFileSync('pages/cctv-security.html', 'utf8');
const start = c.indexOf('filter-box');
const end = c.indexOf('Solar + CCTV');
console.log(JSON.stringify(c.slice(start - 10, end + 5)));

