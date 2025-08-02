import os, json, time, threading, random
from pathlib import Path
import paho.mqtt.client as mqtt

# --- Variáveis de ambiente para controlar o comportamento global ---
BROKER_HOST = os.getenv('BROKER_HOST', None)
BROKER_PORT = int(os.getenv('BROKER_PORT', 1883))
GLOBAL_DELAY = os.getenv('SET_DELAY_BETWEEN_MESSAGES', None)
RANDOMIZE = os.getenv('RANDOMIZE_DELAY_BETWEEN_MESSAGES', 'false').lower() == 'true'

# --- Lê todos os arquivos simuladores que terminam com '-data.json' ---
dir_sim = Path(__file__).parent / 'simulators'
arqs = [f for f in dir_sim.iterdir() if f.name.endswith('-data.json')]

def publish_sensor(mqtt_cfg, root, qos, retain, delay_json, rand_json, sim):
    # --- Conexão MQTT ---
    url = mqtt_cfg['SERVER_URL']
    host = BROKER_HOST or url.split('mqtt://')[1].split(':')[0]
    port = BROKER_PORT or int(url.rsplit(':',1)[1])

    client = mqtt.Client()
    client.connect(host, port)
    client.loop_start()

    # --- Cada sensor tem seu tópico exclusivo, ex: plantA/assembly/line1/robotArm1/Temperature/data ---
    topic = f"{root}/{sim['Name']}"
    mean = float(sim['Mean'])                    # Média personalizada do sensor
    std = float(sim['StandardDeviation'])        # Desvio padrão personalizado do sensor

    # --- Jitter inicial: cada thread espera até 2s aleatórios antes de começar ---
    time.sleep(random.uniform(0, 2))

    while True:
        value = random.gauss(mean, std)         # Gera valor realista usando as métricas do sensor
        payload = json.dumps({'timestamp': time.time(), 'value': value})
        client.publish(topic, payload, qos=qos, retain=retain)
        # Delay: usa variável global se houver, senão valor do JSON
        d = float(GLOBAL_DELAY) if GLOBAL_DELAY else delay_json
        if RANDOMIZE or rand_json:
            time.sleep(random.uniform(0, d))
        else:
            time.sleep(d)

if __name__ == '__main__':
    for arq in arqs:
        cfg = json.loads(arq.read_text())
        mqtt_cfg = cfg['MQTT_BROKER']
        root = mqtt_cfg['ROOT_TOPIC']
        qos = mqtt_cfg.get('QOS', 0)
        retain = mqtt_cfg.get('RETAIN', False)
        delay_json = float(mqtt_cfg.get('SET_DELAY_BETWEEN_MESSAGES', 1))
        rand_json = mqtt_cfg.get('RANDOMIZE_DELAY_BETWEEN_MESSAGES', 'false').lower() == 'true'
        for sim in cfg['SIMULATORS']:
            threading.Thread(
                target=publish_sensor,
                args=(mqtt_cfg, root, qos, retain, delay_json, rand_json, sim),
                daemon=True
            ).start()
    while True:
        time.sleep(1)
