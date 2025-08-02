export async function handleMessage(topic, data, hlfProvider) {
  const [plant, area, line, machine, sensor, type] = topic.split('/');
  const value = JSON.stringify(data);
  await hlfProvider.registerReading(
    sensor,
    type,
    value,
    new Date().toISOString()
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
