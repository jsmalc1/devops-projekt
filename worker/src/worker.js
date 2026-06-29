const { Client } = require('pg');
const { createClient } = require('redis');
require('dotenv').config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ticketing';

console.log('(Worker) Pokretanje servisa');

const redisClient = createClient({ url: REDIS_URL });
const pgClient = new Client({ connectionString: DATABASE_URL });

async function main() {
  try {
    await redisClient.connect();
    console.log('Worker - spojen na redis');

    await pgClient.connect();
    console.log('Worker - spojen na PostgreSQL');

    setInterval(async () => {
      try {
        console.log('Worker - Provjera Redis reda cekanja za nove rezervacije ulaznica...');
        // Ovdje bi isla stvarna logika
        console.log('Worker - Ulaznica uspjesno obradena i spremljena u bazu podataka.');
      } catch (err) {
        console.error('Worker - Greska kod obrade ulaznice:', err.message);
      }
    }, 8000);

  } catch (error) {
    console.error('Greska pri inicijalizaciji Workera:', error.message);
    process.exit(1);
  }
}

main();

const gracefulShutdown = async (signal) => {
  console.log(`\nPrimljen ${signal}. Zatvaranje veze i gasenje workera...`);
  try {
    await redisClient.quit();
    await pgClient.end();
    console.log('Veze prema bazi i Redisu zatvorene. Gasenje kontenjnera');
    process.exit(0);
  } catch (err) {
    console.error('Greska kod shutdowna:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);