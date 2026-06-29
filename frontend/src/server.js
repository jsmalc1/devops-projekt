const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/healthz', (req, res) => res.status(200).send('OK'));

const server = app.listen(PORT, () => {
    console.log(`- Web Frontend slusa na portu ${PORT} -`);
});

const gracefulShutdown = (signal) => {
    console.log(`\nPrimljen ${signal}. Gasenje frontend servisa`);
    server.close(() => process.exit(0));
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);