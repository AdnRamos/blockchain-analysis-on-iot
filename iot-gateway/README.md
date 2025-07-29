# IoT Gateway

Um **gateway** em Node.js para consumir dados de sensores simulados via MQTT e encaminhá‑los para processamento, armazenamento ou APIs REST.

---

## 📋 Sumário

* [Visão Geral](#vis%C3%A3o-geral)
* [Principais Features](#principais-features)
* [Pré‑requisitos](#pr%C3%A9-requisitos)
* [Instalação](#instala%C3%A7%C3%A3o)
* [Estrutura do Projeto](#estrutura-do-projeto)
* [Uso](#uso)

---

## Visão Geral

Este projeto implementa um **cliente MQTT** em Node.js que se conecta a um broker (Eclipse Mosquitto), se inscreve em tópicos definidos e processa cada mensagem recebida.

## Principais Features

* Conexão automática a qualquer broker MQTT (configurável via `.env`)
* Inscrição dinâmica em tópicos MQTT (wildcards suportados)
* Handler genérico de mensagens em `src/dataProcessor.js`
* Servidor HTTP opcional com endpoint de health check (`/health`)

## Pré‑requisitos

* [Node.js](https://nodejs.org/) v22 ou v24

## Instalação


1. Instale dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo de exemplo e ajuste suas variáveis:

   ```bash
   cp .env.example .env
   ```


**Observação:** o broker MQTT está localizado na pasta `../iot-simulation`, que inclui um tutorial completo de como rodá‑lo. Antes de iniciar o gateway, execute o tutorial do iot-simulation.

## Estrutura do Projeto

```text
iot-gateway/
├─ package.json
├─ .env.example
└─ src/
   ├─ index.js         # Ponto de entrada
   ├─ server.js        # HTTP server + inicia MQTT
   ├─ mqttClient.js    # Configurações e conexão MQTT
   └─ dataProcessor.js # Lógica de tratamento de mensagens
```

## Uso

1. **Rodando localmente**:

   ```bash
   npm start
   ```

   * Verifique o log:

     ```text
     ✔ Conectado ao MQTT em mqtt://localhost:1883
     ▶ Inscrito em tópico "plantA/+/+/+/+/#"
     ```

2. **Health check** (caso use HTTP):

   ```bash
   curl http://localhost:3000/health
   # retorna: Gateway OK
   ```
