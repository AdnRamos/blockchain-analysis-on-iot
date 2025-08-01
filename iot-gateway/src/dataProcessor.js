import { HlfProvider } from "./hlfProvider.js";

export async function handleMessage(topic, data) {
  const [plant, area, line, machine, sensor, type] = topic.split('/');
  const value = JSON.stringify(data);
  await HlfProvider.registerReading(
    sensor,
    type,
    value,
    Date.now()
  );
  console.log({
    date: new Date().toISOString(),
    plant, 
    area, 
    line, 
    machine, 
    sensor, 
    type, 
    value 
  });
}
