/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { credentials as _credentials, Client } from '@grpc/grpc-js';
import { connect, hash, signers } from '@hyperledger/fabric-gateway';
import { createPrivateKey } from 'node:crypto';
import { TextDecoder } from 'node:util';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import path from 'path';
import { fileURLToPath } from 'url';

const channelName = envOrDefault('CHANNEL_NAME', 'fabric');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'iot_contract');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

const utf8Decoder = new TextDecoder();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cryptoPath = envOrDefault(
    'CRYPTO_PATH',
    resolve(
        __dirname,
        '..',
        '..',
        'iot-blockchain',
        'test-network',
        'organizations',
        'peerOrganizations',
        'org1.example.com'
    )
);

const keyDirectoryPath = envOrDefault(
    'KEY_DIRECTORY_PATH',
    resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'keystore'
    )
);

const certDirectoryPath = envOrDefault(
    'CERT_DIRECTORY_PATH',
    resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'signcerts'
    )
);

const tlsCertPath = envOrDefault(
    'TLS_CERT_PATH',
    resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt')
);

const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

export class HlfProvider {
    constructor() {
        this.client;
        this.gateway;
        this.contract;
    }

    async connect() {
        this.#displayInputParameters();
        const client = await this.#newGrpcConnection();
        const gateway = connect({
            client,
            identity: await this.#newIdentity(),
            signer: await this.#newSigner(),
            hash: hash.sha256,
            evaluateOptions: () => {
                return { deadline: Date.now() + 5000 };
            },
            endorseOptions: () => {
                return { deadline: Date.now() + 15000 };
            },
            submitOptions: () => {
                return { deadline: Date.now() + 5000 };
            },
            commitStatusOptions: () => {
                return { deadline: Date.now() + 60000 };
            },
        });
        const network = gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        this.gateway = gateway;
        this.client = client;
        this.contract = contract;
    }

    async #newGrpcConnection() {
        const tlsRootCert = await readFile(tlsCertPath);
        const tlsCredentials = _credentials.createSsl(tlsRootCert);
        return new Client(peerEndpoint, tlsCredentials, {
            'grpc.ssl_target_name_override': peerHostAlias,
        });
    }

    async #newIdentity() {
        const certPath = await this.#getFirstDirFileName(certDirectoryPath);
        const credentials = await readFile(certPath);
        return { mspId, credentials };
    }

    async #getFirstDirFileName(dirPath) {
        const files = await readdir(dirPath);
        const file = files[0];
        if (!file) {
            throw new Error(`No files in directory: ${dirPath}`);
        }
        return join(dirPath, file);
    }

    async #newSigner() {
        const keyPath = await this.#getFirstDirFileName(keyDirectoryPath);
        const privateKeyPem = await readFile(keyPath);
        const privateKey = createPrivateKey(privateKeyPem);
        return signers.newPrivateKeySigner(privateKey);
    }

    async registerReading(sensorId, type, value, timestamp) {
        console.log(
            '\n--> Submit Transaction: registerReading'
        );
        await this.contract.submitTransaction(
            'registerReading',
            sensorId,
            type,
            value,
            timestamp
        );
        console.log('*** Transaction committed successfully');
    }

    async getReadingByKey(key) {
        console.log(
            '\n--> Evaluate Transaction: getReadingByKey'
        );
        const resultBytes = await this.contract.evaluateTransaction(
            'getReadingByKey',
            key
        );
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        console.log('*** Result:', result);
    }

    async getAllReadingsPaginated(limitStr, bookmark) {
        console.log(
            '\n--> Evaluate Transaction: getAllReadingsPaginated'
        );
        const resultBytes = await this.contract.evaluateTransaction(
            'getAllReadingsPaginated',
            limitStr,
            bookmark
        );
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        console.log('*** Result:', result);
    }

    #displayInputParameters() {
        console.log(`channelName:       ${channelName}`);
        console.log(`chaincodeName:     ${chaincodeName}`);
        console.log(`mspId:             ${mspId}`);
        console.log(`cryptoPath:        ${cryptoPath}`);
        console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
        console.log(`certDirectoryPath: ${certDirectoryPath}`);
        console.log(`tlsCertPath:       ${tlsCertPath}`);
        console.log(`peerEndpoint:      ${peerEndpoint}`);
        console.log(`peerHostAlias:     ${peerHostAlias}`);
    }
}

function envOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}
