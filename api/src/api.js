const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const { createClient } = require('redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ticketing';

app.use(cors());
app.use(express.json());

const redisClient = createClient({ url: REDIS_URL });
const pgClient = new Client({ connectionString: DATABASE_URL });

(async () => {
    try {
        await redisClient.connect();
        await pgClient.connect();
        console.log('API spojen na bazu i Redis');
    } catch (err) {
        console.error('Greska kod inicijalnog spajanju:', err.message);
    }
})();

app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

app.get('/readyz', async (req, res) => {
    try {
        await redisClient.ping();
        await pgClient.query('SELECT 1');
        res.status(200).send('READY');
    } catch (error) {
        console.error('Readiness probe failao:', error.message);
        res.status(503).send('UNAVAILABLE');
    }
});

app.get('/events', (req, res) => {
    res.json([
        { id: 'evt-1001', name: 'DevSecOps Konferencija', date: '2026-10-15' },
        { id: 'evt-1002', name: 'Kubernetes Radionica', date: '2026-11-20' }
    ]);
});

app.post('/tickets/purchase', async (req, res) => {
    const { eventId, customerEmail, quantity } = req.body;
    try {
        const orderInfo = JSON.stringify({ eventId, customerEmail, quantity, status: 'pending' });
        console.log(`Poslana narudzba za ${customerEmail}`);
        res.status(202).json({ message: 'Narudzba primljena i u obradi' });
    } catch (error) {
        res.status(500).json({ error: 'Greska kod obrade narudzbe' });
    }
});

app.get('/tickets/orders', async (req, res) => {
    try {
        res.json([{ id: 1, customer: 'student@example.com', status: 'processed' }]);
    } catch (error) {
        res.status(500).json({ error: 'Greska kod dohvata narudzbi' });
    }
});

const server = app.listen(PORT, () => {
    console.log(`- API Servis slusa na portu ${PORT} -`);
});

const gracefulShutdown = async (signal) => {
    console.log(`\nPrimljen ${signal}. Gasenje API servisa`);
    server.close(async () => {
        await redisClient.quit();
        await pgClient.end();
        console.log('Gasenje kontejnera');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);