export function handleMessage(topic, data) {
  const [plant, area, line, machine, sensor, type] = topic.split('/');
  const value = JSON.stringify(data);
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
