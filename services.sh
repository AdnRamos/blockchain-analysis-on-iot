#!/usr/bin/env bash

# service.sh - A script to manage all services
# Usage: ./service.sh [start|stop|stop-monitoring|execucao]

set -e

if [ $# -ne 1 ]; then
    echo "Uso: $0 [start|stop|stop-monitoring|execucao]"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$1" in
    start)
        echo "Iniciando os serviços..."

        echo "Iniciando rede de blockchain..."
        "$SCRIPT_DIR/iot-blockchain/up-network.sh"
        echo "Rede de blockchain iniciada."

        echo "Iniciando sensores..."
        (
            cd "$SCRIPT_DIR/iot-simulation" && docker compose down -v
            cd "$SCRIPT_DIR/iot-simulation" && docker compose up -d
        )
        echo "Sensores iniciados."

        echo "Iniciando serviço de monitoramento..."
        (
            cd "$SCRIPT_DIR/iot-blockchain/test-network/prometheus-grafana" && docker compose down -v
            cd "$SCRIPT_DIR/iot-blockchain/test-network/prometheus-grafana" && docker compose up -d
        )
        sleep 8  # Aguarda o serviço de monitoramento iniciar completamente
        echo "Serviço de monitoramento iniciado."
        
        echo "Iniciando gateway IoT..."
        (
            cd "$SCRIPT_DIR/iot-gateway" && docker compose down -v
            cd "$SCRIPT_DIR/iot-gateway" && docker compose up --build -d
        )
        echo "Gateway IoT iniciado."

        echo "Todos os serviços foram iniciados com sucesso."
        ;;

    stop)
        echo "Parando os serviços..."

        echo "Parando sensores..."
        (
            cd "$SCRIPT_DIR/iot-simulation" && docker compose down -v
        )
        echo "Sensores parados."

        echo "Parando gateway IoT..."
        (
            cd "$SCRIPT_DIR/iot-gateway" && docker compose down -v
        )
        echo "Gateway IoT parado."

        echo "Todos os serviços foram parados com sucesso."
        ;;

    stop-monitoring)
        echo "Parando rede de blockchain..."
        "$SCRIPT_DIR/iot-blockchain/test-network/network.sh" down
        echo "Rede de blockchain parada."

        echo "Parando serviço de monitoramento..."
        (
            cd "$SCRIPT_DIR/iot-blockchain/test-network/prometheus-grafana" && docker compose down -v
        )
        echo "Serviço de monitoramento parado."
        ;;

    execucao)
        echo "Execução temporária dos serviços por 5 minutos..."


        "$0" start
        INICIO=$(date "+%Y-%m-%d %H:%M:%S")
        echo "Início: $INICIO"

        echo "Serviços em execução por 5 minutos..."
        sleep 300  # 5 minutos em segundos


        FIM=$(date "+%Y-%m-%d %H:%M:%S")
        echo "Fim: $FIM"
        "$0" stop

        echo "Execução temporária concluída."
        echo "INICIO: $INICIO"
        echo "FIM: $FIM"
        ;;

    *)
        echo "Opção inválida: $1"
        echo "Uso: $0 [start|stop|stop-monitoring|execucao]"
        exit 1
        ;;
esac
