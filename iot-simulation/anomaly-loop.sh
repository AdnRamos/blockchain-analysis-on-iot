#!/bin/bash

# anomaly-loop.sh
# Executar no Linux com: chmod +x anomaly-loop.sh && ./anomaly-loop.sh

# 0) Pré-cria todos os containers de anomalia (sem iniciar)
anom_services=(
  sim-robotArm1-anomaly
  sim-robotArm2-anomaly
  sim-conveyor1-anomaly
  sim-sealer1-anomaly
)

echo "🛠️ Criando containers de anomalia (sem iniciar)..."
docker compose up -d --no-start "${anom_services[@]}"

# 1) Loop de ativação/desativação
while true; do
  # 1a) Espera entre 60 e 300 segundos
  wait_sec=$((RANDOM % 241 + 60))
  echo "$(date '+%H:%M:%S') → aguardando $wait_sec s para próxima anomalia..."
  sleep "$wait_sec"

  # 1b) Escolhe um serviço ao acaso
  svc=${anom_services[$RANDOM % ${#anom_services[@]}]}
  echo "$(date '+%H:%M:%S') → iniciando anomalia: $svc"

  # 1c) Start
  docker compose start "$svc"

  # 1d) Duração entre 30 e 120 segundos
  anom_dur=$((RANDOM % 91 + 30))
  echo "$(date '+%H:%M:%S') → anomalia $svc ativa por $anom_dur s"
  sleep "$anom_dur"

  # 1e) Stop
  echo "$(date '+%H:%M:%S') → parando anomalia: $svc"
  docker compose stop "$svc"

  echo ""  # separa ciclos
done
