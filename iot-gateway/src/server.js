import express from 'express';
import { connectMqtt } from './mqttClient.js';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.send('Gateway OK'));

app.listen(process.env.PORT, () => {
  console.log(`HTTP server rodando na porta ${process.env.PORT}`);
  connectMqtt();
});
