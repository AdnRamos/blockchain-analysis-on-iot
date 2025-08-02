'use strict';

const { Contract } = require('fabric-contract-api');
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');

class IoTContract extends Contract {

  async registerReading(ctx, sensorId, type, value, timestamp) {
    if (!sensorId || !type || !value || !timestamp) {
      throw new Error("Todos os parâmetros são obrigatórios: sensorId, type, value, timestamp");
    }

    const reading = {
      sensorId,
      type,
      value,
      timestamp,
    };

    const key = `READING_${sensorId}_${timestamp}`;
    await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(reading))));

    return JSON.stringify(reading);
  }

  async getReadingByKey(ctx, key) {
    const result = await ctx.stub.getState(key);
    if (!result || result.length === 0) {
      throw new Error(`Leitura com chave ${key} não encontrada`);
    }
    return result.toString();
  }

  async getAllReadingsPaginated(ctx, limitStr, bookmark) {
    const prefix = 'READING_';
    const startKey = prefix;
    const endKey = prefix + '~'; // para pegar apenas as chaves que começam com READING_

    const pageSize = parseInt(limitStr, 10) || 1000;
    if (pageSize > 1000) {
      throw new Error("O limite máximo de itens por página é 1000");
    }

    const { iterator, metadata } = await ctx.stub.getStateByRangeWithPagination(startKey, endKey, pageSize, bookmark || '');
    const results = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        const json = res.value.value.toString('utf8');
        try {
          results.push(JSON.parse(json));
        } catch (e) {
          results.push({ raw: json });
        }
      }
      if (res.done) {
        await iterator.close();
        break;
      }
    }

    return JSON.stringify({
      readings: results,
      metadata,
    });
  }
}

module.exports = IoTContract;
