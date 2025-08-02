# 🏭 Simulação de Mini-Fábrica Indústria 4.0 com IoT-and-IIoT Simulators e MQTT

Este projeto simula uma **mini-fábrica inteligente** com sensores industriais utilizando:

- **Docker & Docker Compose**
- **Eclipse Mosquitto** como broker MQTT
- **IoT-and-IIoT Simulators** ([amineamaach/sensors-mqtt:v1.0.0](https://hub.docker.com/r/amineamaach/sensors-mqtt))
- **Scripts PowerShell (Windows)** e **Bash (Linux)** para injetar anomalias aleatórias

Todas as mensagens seguem a hierarquia de tópicos MQTT:

```
plantA/<area>/<line>/<machine>/<sensorType>/<messageType>
```

`<messageType>` pode ser:
- `data` → Telemetria normal
- `anomaly` → Simulação de falha

---

## 📁 Estrutura do Projeto

```
iot-simulation/
├── broker/
│ └── mosquitto.conf
├── simulators/
│ ├── assembly-line1-robotArm1-data.json
│ ├── assembly-line1-robotArm2-data.json
│ ├── packaging-line1-conveyor1-data.json
│ ├── packaging-line1-sealer1-data.json
│ ├── ... (outras variações .json)
├── Dockerfile
├── requirements.txt
├── mini_factory_simulator.py
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Pré-requisitos

- Docker (com Docker Compose v2)
- PowerShell (Windows) ou Bash (Linux)

---

## 🚀 Como Executar

### 📌 1. Subir Broker e Sensores Normais

```bash
docker compose down --volumes

# Configure a taxa de mensagens (20 TPS = 0.05s de delay)
$env:BROKER_HOST = "broker-mosquitto"
$env:BROKER_PORT = "1883"
$env:SET_DELAY_BETWEEN_MESSAGES = "0.05"
$env:RANDOMIZE_DELAY_BETWEEN_MESSAGES = "false"

docker compose up -d --build
```

Sensores normais sobem automaticamente:  
`sim-robotArm1`, `sim-robotArm2`, `sim-conveyor1`, `sim-sealer1`

---

### 🔍 2. Ver Telemetria

```bash
#Dados gerais
docker compose up mosquitto-client

#Dados especificos
docker compose exec broker-mosquitto \
  mosquitto_sub -h localhost -t "plantA/+/+/+/+/{messageType}" -v
```

---

### 🛑 5. Parar e Limpar

```bash
# Interrompa o script (Ctrl+C)
docker compose down
```
---

## 🔄 Escalabilidade

- Todos os sensores são lidos a partir dos arquivos .json na pasta simulators/
- Controle a taxa de mensagens ajustando a variável de ambiente SET_DELAY_BETWEEN_MESSAGES:
```
    0.05 = ~20 TPS

    0.02 = ~50 TPS

    0.01 = ~100 TPS
```

> Lembre-se: cada instância deve ter `CLIENT_ID` único para evitar desconexões MQTT

---

## 🧠 Estrutura de Tópicos MQTT

| Nível        | Exemplo                      |
|--------------|------------------------------|
| fábrica      | `plantA`                     |
| área         | `assembly`, `packaging`      |
| linha        | `line1`                      |
| máquina      | `robotArm1`, `conveyor1`     |
| sensorType   | `Temperature`, `Vibration`…  |
| messageType  | `data`           |

**Exemplos:**
```
plantA/assembly/line1/robotArm1/Temperature/data
```

---

## 🛠️ Dicas / Troubleshooting

- **Não vê mensagens?** → Confira o valor de `ROOT_TOPIC` nos seus JSONs e ajuste o filtro do cliente MQTT.
- **Erro de conexão?** → Sempre use o nome do serviço docker como hostname MQTT (`broker-mosquitto`)
- **Delay estranho?** → Ajuste `SET_DELAY_BETWEEN_MESSAGES` e `RANDOMIZE_DELAY_BETWEEN_MESSAGES` nas variáveis de ambiente do Compose.
- **Adicionar sensores?** → Basta criar novos .json na pasta `simulators/`.
---
## ✅ Resumo

- Simulação completa de Indústria 4.0 com sensores Dockerizados e escalabilidade dinâmica
- Dados em tempo real com Mosquitto + MQTT
- Monitoramento simples via serviço mosquitto-client
- Modular, fácil de escalar e atualizar