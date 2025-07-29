import mqtt from 'mqtt';
import { handleMessage } from './dataProcessor.js';
import dotenv from 'dotenv';
dotenv.config();

const brokerUrl = process.env.MQTT_BROKER_URL;
const topic     = process.env.MQTT_TOPIC;

export function connectMqtt() {
  const client = mqtt.connect(brokerUrl, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  });

  client.on('connect', () => {
    console.log(`✔ Conectado ao MQTT em ${brokerUrl}`);
    client.subscribe(topic, { qos: 1 }, err => {
      if (err) console.error('❌ Falha ao inscrever:', err);
      else console.log(`▶ Inscrito em tópico "${topic}"`);
    });
  });

  client.on('message', (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      handleMessage(topic, data);
    } catch (err) {
      console.error('❌ Payload inválido:', payload.toString());
    }
  });

  client.on('error', err => console.error('MQTT Error:', err));
  return client;
}
