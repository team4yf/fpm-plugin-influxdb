## FPM-PLUGIN-influxdb
用于influxdb的插件



### Install
```bash
npm i fpm-plugin-influxdb -S
```

### Useage

- config

使用之前需要配置好所有的 schema ，如果schema修改需要重新启动服务才能生效


schema 中可用的字段类型

```
FLOAT = 0,
INTEGER = 1,
STRING = 2,
BOOLEAN = 3
```

```javascript
{
    "influx": {
        "database": "mydb",
        "username": "",
        "password": "",
        "hosts": [
          { "host": "localhost" , "port": 19786}
        ],
        "schema": [{
          "measurement": "cpu_load_short",
          "tags": ["host", "region"],
          "fields": {
            "value": 0
          }
        }]
      }
}
```

- subscribe

- other