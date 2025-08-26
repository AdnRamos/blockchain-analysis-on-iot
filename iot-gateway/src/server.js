import express from 'express';
import { connectMqtt } from './mqttClient.js';
import { HlfProvider } from './hlfProvider.js';
import { collectDefaultMetrics, Registry } from 'prom-client';

var hlfProvider;
const register = new Registry();
collectDefaultMetrics({ register });

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.send('Gateway OK'));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const server = app.listen(process.env.PORT, async () => {
  console.log(`HTTP server rodando na porta ${process.env.PORT}`);
  hlfProvider = new HlfProvider();
  await hlfProvider.connect();
  connectMqtt(hlfProvider);
});

server.on('close', () => {
  hlfProvider.gateway.close();
  hlfProvider.client.close();
  console.log('Servidor Express foi encerrado.');
});

process.on('SIGINT', () => {
  console.log('Encerrando servidor...');
  server.close(() => {
    process.exit(0);
  });
});