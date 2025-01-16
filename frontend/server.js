const dotenv = require('dotenv');
const { createServer: createHttpServer } = require('http');
const { createServer: createHttpsServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

dotenv.config();
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpPort = process.env.HTTP_PORT || 2999;
const httpsPort = process.env.HTTPS_PORT || 3000;
const host = process.env.BASE_URL || 'localhost';

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'private.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt')),
};

app.prepare().then(() => {
    // Create HTTP server
    createHttpServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(httpPort, (err) => {
        if (err) throw err;
        console.log(`> HTTP server ready on http://${host}:${httpPort}`);
    });

    // Create HTTPS server
    createHttpsServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(httpsPort, (err) => {
        if (err) throw err;
        console.log(`> HTTPS server ready on https://${host}:${httpsPort}`);
    });
});


// const dotenv = require('dotenv');
// const { createServer } = require('http');
// const { parse } = require('url');
// const next = require('next');

// dotenv.config();
// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();

// const port = process.env.PORT || 3000;
// const host = process.env.BASE_URL || 'localhost';
// app.prepare().then(() => {
//     createServer((req, res) => {
//         const parsedUrl = parse(req.url, true);
//         handle(req, res, parsedUrl);
//     }).listen(port, (err) => {
//         if (err) throw err;
//         console.log(`> Ready on http://${host}:${port}`);
//     });
// });