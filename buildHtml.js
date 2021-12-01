const fs = require('fs');
const str = fs.readFileSync(__dirname + '/src/ui/index.html', 'utf8');
const b = { html: str };
fs.writeFileSync(
    __dirname + '/src/ui/html.ts',
    'export const html = ' + JSON.stringify(b.html) + ';'
);
