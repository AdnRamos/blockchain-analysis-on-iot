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
│   └── mosquitto.conf
├── simulators/
│   ├── assembly-line1-robotArm1-data.json
│   ├── assembly-line1-robotArm1-anomaly.json
│   ├── assembly-line1-robotArm2-data.json
│   ├── assembly-line1-robotArm2-anomaly.json
│   ├── packaging-line1-conveyor1-data.json
│   ├── packaging-line1-conveyor1-anomaly.json
│   ├── packaging-line1-sealer1-data.json
│   └── packaging-line1-sealer1-anomaly.json
├── anomaly-loop.ps1
├── anomaly-loop.sh
└── docker-compose.yml
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
docker compose up -d
```

Sensores normais sobem automaticamente:  
`sim-robotArm1`, `sim-robotArm2`, `sim-conveyor1`, `sim-sealer1`

---

### 🔍 2. Ver Telemetria Normal

```bash
docker compose exec broker-mosquitto \
  mosquitto_sub -h localhost -t "plantA/+/+/+/+/data" -v
```

---

### ⚠️ 3. Injetar Anomalias

#### No **Windows** (PowerShell):

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.\anomaly-loop.ps1
```

#### No **Linux/macOS** (Bash):

```bash
chmod +x anomaly-loop.sh
./anomaly-loop.sh
```

---

### 🔎 4. Verificar Anomalias

```bash
docker compose exec broker-mosquitto \
  mosquitto_sub -h localhost -t "plantA/+/+/+/+/anomaly" -v
```

---

### 🧪 5. Ver Tudo (Data + Anomaly)

```bash
docker compose exec broker-mosquitto \
  mosquitto_sub -h localhost -t "plantA/+/+/+/+/#" -v
```

---

### 🛑 6. Parar e Limpar

```bash
# Interrompa o script (Ctrl+C)
docker compose down
```

---

## 🧩 Executar Sensor Isoladamente

Para subir apenas **um sensor específico**, use:

```bash
docker compose up -d sim-robotArm1
docker compose up -d sim-robotArm2
docker compose up -d sim-conveyor1
docker compose up -d sim-sealer1
```

Para iniciar uma **anomalia isolada**:

```bash
docker compose up -d --no-start sim-robotArm2-anomaly
docker compose start sim-robotArm2-anomaly
# Espera alguns segundos...
docker compose stop sim-robotArm2-anomaly
```

---

## 🔄 Escalabilidade

- Adicione mais sensores editando os arquivos `.json` dentro de `simulators/`
- Use `--scale` para múltiplas instâncias:
```bash
docker compose up -d --scale sim-robotArm1=5 --scale sim-robotArm2=3 --scale sim-conveyor1=4
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
| messageType  | `data`, `anomaly`            |

**Exemplos:**
```
plantA/assembly/line1/robotArm1/Temperature/data
plantA/assembly/line1/robotArm1/Temperature/anomaly
```

---

## 🛠️ Dicas / Troubleshooting

- **Delay estranho?** → reduza `SET_DELAY_BETWEEN_MESSAGES` nos arquivos JSON e defina `RANDOMIZE_DELAY_BETWEEN_MESSAGES: false`
- **Erro “unknown flag: --profile”?** → utilize `up --no-start` seguido de `start`, como feito no `anomaly-loop.ps1`
- **Erro “panic: nil pointer”?** → verifique se `QOS` e `RETAIN` estão definidos nos JSONs (ex: `QOS: 0`, `RETAIN: false`)

---

## ✅ Resumo

- Simulação completa de Indústria 4.0 com sensores Dockerizados
- Dados em tempo real com Mosquitto + MQTT
- Controle automatizado de anomalias via PowerShell ou Bash
- Modular e escalável

Bom uso! 🚀🔧
