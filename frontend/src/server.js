const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.get('/healthz', (req, res) => res.status(200).send('OK'));

app.get('/config', (req, res) => {
    res.json({ apiBaseUrl: "http://localhost:8080" });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Frontend server sluša na portu ${PORT}`));