const { init, Func } = require("fpmc-jssdk");
const assert = require('assert');
init({ appkey:'123123', masterKey:'123123', endpoint: 'http://localhost:9999/api' });

describe('Function', function(){
  beforeEach(done => {
    done()
  })


  afterEach(done => {
    done()
  })

  it('Function query', async () => {
    try {
      const data = await new Func('influx.query').invoke({
        query: `select max(value), sum(value) from cpu_load_short where time > '2019-10-10T15:00:00Z' group by host`
      })
      console.log(data)
      assert.strictEqual(data == undefined, false, 'should not be undefined');
    } catch (error) {
      throw error;
    }
  })

  it('Function query', async () => {
    try {
      const data = await new Func('influx.create').invoke([{
        measurement: 'cpu_load_short',
        tags: {host: 'server02', region: 'us-east'},
        fields: { value: .91 },
      }])
      console.log(data)
      assert.strictEqual(data == undefined, false, 'should not be undefined');
    } catch (error) {
      throw error;
    }
  })

})
