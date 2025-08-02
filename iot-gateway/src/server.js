import express from 'express';
import { connectMqtt } from './mqttClient.js';
import { HlfProvider } from './hlfProvider.js';

var hlfProvider;

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.send('Gateway OK'));

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