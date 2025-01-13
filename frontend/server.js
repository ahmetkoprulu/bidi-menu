const dotenv = require('dotenv');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

dotenv.config();
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;
const host = process.env.BASE_URL || 'localhost';
app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${host}:${port}`);
    });
});