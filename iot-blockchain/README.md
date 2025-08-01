# IoT Hyperledger Fabric Chaincode (v2.5)

Este projeto demonstra como configurar, implantar e interagir com um chaincode para IoT em uma rede Hyperledger Fabric utilizando JavaScript (Node.js). O foco é registrar leituras de sensores industriais e consultá-las com rastreabilidade e paginação.

---

## 📄 Requisitos obrigatórios

Antes de iniciar, instale os requisitos do Fabric 2.5:

### ✍️ Documentação oficial:

* [Requisitos](https://hyperledger-fabric.readthedocs.io/en/release-2.5/prereqs.html)
* [Instalação](https://hyperledger-fabric.readthedocs.io/en/release-2.5/install.html)

### ✅ Verifique se você possui:

* Docker e Docker Compose instalados
* Node.js >= 18 e npm
* `git`, `curl`, `wget`, `tar` instalados
* Binários do Fabric (cryptogen, configtxgen, peer, etc)

Baixe os samples e binários:

```bash
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0 1.5.4
```

---

## 🔧 Estrutura do Projeto

```
iot-blockchain/
├── iot-app/
│   └── chaincode/
│        ├── index.js                 # Chaincode principal em JavaScript
│        ├── package.json            # Dependências (fabric-shim, etc)
│        ├── package-lock.json
│        ├── node_modules/            # Gerado por npm install
│        └── lib/                     # (opcional) utilitários do chaincode
└── test-network/                 # Rede de exemplo do Fabric
```

---

## 🚀 Deploy simplificado (recomendado para desenvolvimento)

Para acelerar o processo, você pode usar o comando abaixo, que instala, aprova e comita automaticamente o chaincode no canal `fabric`:

```bash
./network.sh deployCC -ccn iot_contract -ccp ../iot-app/chaincode -ccl javascript -c fabric
```

> 📌 **Importante**: se você modificar o código do chaincode, é necessário alterar manualmente o valor da `--sequence` (ex: de 1 para 2) para permitir o redeploy.

---

## 📅 Etapas detalhadas para executar

### 1. Subir a rede com canal personalizado

```bash
cd fabric-samples/test-network
./network.sh down                      # Garante ambiente limpo
./network.sh up createChannel -c fabric -ca
```

> Isso inicializa Orderer, Org1, Org2 e cria o canal "fabric"

### 2. Preparar o chaincode

```bash
cd ../iot-app/chaincode/
npm install
cd ../../test-network
```

### 3. Empacotar o chaincode (Node.js)

```bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

peer lifecycle chaincode package iot_contract.tar.gz \
  --path ../iot-app/chaincode/ \
  --lang node \
  --label iot_contract_1.0
```

> Gera o pacote .tar.gz que será distribuído para os peers

### 4. Instalar o chaincode em Org1 e Org2

```bash
export CORE_PEER_TLS_ENABLED=true

# Org1
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
peer lifecycle chaincode install iot_contract.tar.gz

# Org2
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
peer lifecycle chaincode install iot_contract.tar.gz
```

### 5. Aprovar a definição do chaincode

```bash
peer lifecycle chaincode queryinstalled
export CC_PACKAGE_ID=<copie_o_PACKAGE_ID_do_iot_contract>

peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --channelID fabric \
  --name iot_contract \
  --version 1.0 \
  --package-id $CC_PACKAGE_ID \
  --sequence 1 \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

> Repita para Org1 e Org2, ajustando as variáveis de MSP

### 6. Validar aprovação e comitar

```bash
peer lifecycle chaincode checkcommitreadiness \
  --channelID fabric \
  --name iot_contract \
  --version 1.0 \
  --sequence 1 \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json

peer lifecycle chaincode commit \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --channelID fabric \
  --name iot_contract \
  --version 1.0 \
  --sequence 1 \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
```

### 7. Confirmar deploy

```bash
peer lifecycle chaincode querycommitted \
  --channelID fabric \
  --name iot_contract \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

---

## 💡 Testando o Chaincode

### Criar leitura:

```bash
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  -C fabric -n iot_contract \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
  -c '{"function":"registerReading","Args":["sensor1", "temperature", "22.4", "1753935125766"]}'
```

### Listar com paginação:

```bash
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  -C fabric -n iot_contract \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
  -c '{"function":"getAllReadingsPaginated","Args":["", ""]}'
```

---

## 📅 Observações finais

* Use `--sequence` incrementado ao alterar o código do chaincode
* O nome do canal aqui é `fabric` (pode ser outro)
* Evite esquecer do `npm install` antes de empacotar o chaincode
* Prefira trabalhar com `./network.sh deployCC` apenas para atualizações simples

---

Pronto! Com esses passos você tem um ambiente completo e profissional para desenvolver e testar sua aplicação de IoT com blockchain permissionada.
