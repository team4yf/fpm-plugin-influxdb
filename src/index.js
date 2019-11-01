const _ = require('lodash');
const assert = require('assert');
const pkg = require('../package.json');
const debug = require('debug')(pkg.name);

const Influx = require('influx');

module.exports = {
  bind: (fpm) => {

    let client;
    const bizModule = { 
      create: async args => {
        assert(client, 'InfluxDB client not inited~');
        debug('args: %O', args);
        const data = await client.writePoints(args);
        debug('data %O', data);
        return 1;
      },
      query: async args => {
        try {
          assert(client, 'InfluxDB client not inited~');
          const { query } = args;
          assert(query, 'query required!');
          debug('query: %s', query);
          const data = await client.query(query);
          _.map(data, item => {
            item.time = item.time.getNanoTime().substring(0,13);
            return item;
          })
          debug('data: %O', JSON.stringify(data));
          return data;
        } catch (error) {
          return Promise.reject({
            message: error.message,
          })
        }
      },
    };
    // Run When Server Init
    fpm.registerAction('INIT', () => {
      const c = fpm.getConfig('influx');

      client =  new Influx.InfluxDB(c);

      debug('%o', c);
      debug('%o', client);
      

    })

    fpm.registerAction('BEFORE_SERVER_START', () => {
      console.log('Run BEFORE_SERVER_START Actions')
      fpm.extendModule('influx', bizModule);      
    })
    return bizModule;
  }
}
