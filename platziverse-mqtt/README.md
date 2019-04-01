# Platziverse-mqtt

## `agent/connected`

``` js
{
    agent: {
        uuid, // auto generate
        username, // define by configuration
        name, // define by configuration
        hostname, // get by the operative sistem
        pid // get by the process
    }
}
```

## `agent/disconnected`

``` js
{
    agent: {
        uuid
    }
}
```

## `agent/message` 

``` js
{
    agent,
    metrics: [
        {
            type,
            value
        }
    ],
    timestamp // generate when create the message
}
```