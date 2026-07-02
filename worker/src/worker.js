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

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(255) PRIMARY KEY,
        event_id VARCHAR(255),
        customer_email VARCHAR(255),
        quantity INTEGER,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Worker - Tablica "orders" je spremna');

    setInterval(async () => {
      try {
        const item = await redisClient.rPop('ticket_orders');
        
        if (item) {
          const order = JSON.parse(item);
          console.log(`Worker - obraduje: ${order.orderId} za ${order.customerEmail}`);
          
          await pgClient.query(
            'INSERT INTO orders (order_id, event_id, customer_email, quantity, status) VALUES ($1, $2, $3, $4, $5)',
            [order.orderId, order.eventId, order.customerEmail, order.quantity, order.status]
          );
          
          console.log(`Worker - Narudzba ${order.orderId} uspjesno spremljena u bazu`);
        }
      } catch (err) {
        console.error('Worker - Greska kod obrade ulaznice:', err.message);
      }
    }, 2000);
  } catch (error) {
    console.error('Greska kod inicijalizacije Workera:', error.message);
    process.exit(1);
  }
}

main();

const gracefulShutdown = async (signal) => {
  console.log(`\nPrimljen ${signal}. Zatvaranje veze i gasenje workera...`);
  try {
    await redisClient.quit();
    await pgClient.end();
    console.log('Veze prema bazi i Redisu zatvorene. Gasenje kontejnera');
    process.exit(0);
  } catch (err) {
    console.error('Greska kod shutdowna:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);