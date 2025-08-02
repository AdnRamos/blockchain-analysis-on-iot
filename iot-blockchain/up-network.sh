#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/test-network/network.sh" down
"$SCRIPT_DIR/test-network/network.sh" up createChannel -c fabric -ca
"$SCRIPT_DIR/test-network/network.sh" deployCC -ccn iot_contract -ccp ../iot-app/chaincode -ccl javascript -c fabric
