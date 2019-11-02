const _ = require('lodash');
const assert = require('assert');
const pkg = require('../package.json');
const debug = require('debug')(pkg.name);

const Influx = require('influx');

module.exports = {
  bind: (fpm) => {

    let client;

    // 查询函数，
    const _query = async args => {
      try {
        assert(client, 'InfluxDB client not inited~');
        const { query } = args;
        assert(query, 'query required!');
        debug('query: %s', query);
        const data = await client.query(query);
        _.map(data, item => {
          item.time = item.time.getNanoTime().substring(0,13);
          return item;
        });
        debug('data: %O', JSON.stringify(data));
        return data;
      } catch (error) {
        fpm.logger.error(error);
        return Promise.reject({
          message: error.message,
        })
      }
    };
    const bizModule = { 
      query: _query,
      // 批量插入的接口
      create: async args => {
        try {
          assert(client, 'InfluxDB client not inited~');
          debug('create args: %O', args);
          const data = await client.writePoints(args);
          debug('create data %O', data);
          return 1;
        } catch (error) {
          fpm.logger.error(error);
          return Promise.reject({
            message: error.message,
          })
        }
      },

      // 批量插入的接口
      insert: async args => {
        try {
          assert(client, 'InfluxDB client not inited~');
          debug('create args: %O', args);
          const data = await client.writePoints(args);
          debug('create data %O', data);
          return 1;
        } catch (error) {
          fpm.logger.error(error);
          return Promise.reject({
            message: error.message,
          })
        }
      },

      // 重置链接的函数，主要为了重置所有的 schema
      reset: async () => {
        try {
          const c = fpm.getConfig('influx');
          client =  new Influx.InfluxDB(c);
          return 1;
        } catch (error) {
          fpm.logger.error(error);
          return Promise.reject({
            message: error.message,
          })
        }
      },

      // 查询函数，
      find: async args => {
        debug('find Args: %O', args);
        const {
          measurement,
          condition,
          fields,
          limit = 0,
          sort,
          groupBy,
        } = args;
        try {
          const query = `select ${fields} from ${measurement} where ${ !_.isEmpty(condition) ? condition:'1=1' } ${ !!groupBy ? ('group by ' + groupBy) : ''} ${ !!sort ? ('order by ' + sort.replace('-', ' desc').replace('+', ' asc') ): ''} ${ parseInt(limit) > 0?('limit ' + limit):'' }  `;
          return await _query({ query });
        } catch (error) {
          fpm.logger.error(error);
          return Promise.reject({
            message: error.message,
          })
        }
      },
      // 获取第一条数据
      first: async args => {
        debug('first Args: %O', args);
        const {
          measurement,
          condition,
          fields,
          sort,
        } = args;
        try {
          const query = `select ${fields} from ${measurement} where ${ !_.isEmpty(condition) ? condition:'1=1' }  ${ !!sort ? ('order by ' + sort.replace('-', ' desc').replace('+', ' asc') ): ''} limit 1 `;
          const data = await _query({ query });
          if(!data) return;
          if(data.length < 1) return;
          const one = data[0];
          one._id = one.time;
          return one;
        } catch (error) {
          fpm.logger.error(error);
          return Promise.reject({
            message: error.message,
          })
        }
      },
      // count函数，
      count: async args => {
        debug('count Args: %O', args);
        const {
          measurement,
          condition,
        } = args;
        try {
          const query = `select count(*) from ${measurement} where ${ !_.isEmpty(condition) ? condition:'1=1' } `;
          const data = await _query({ query });
          if(!data) return 0;
          return _.head(data).count_value;
        } catch (error) {
          fpm.logger.error(error);
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
      fpm.extendModule('influx', bizModule);      
    })
    return bizModule;
  }
}
