'use strict'

const express = require('express')
const http = require('http');
const chalk = require('chalk')
const api = require('./api')
const debug = require('debug')('platziverse:api');

const { handleFatalError } = require('../platziverse-utils')

const PORT = process.env.PORT || 3000

const app = express()

app.use('/api', api)

app.use((err, req, res, next) => {
    debug(`${chalk.red('[Error]')} ${err.stack} }`)

    if (err.message.match(/not found/)) {
        return res.status(404).send(
            { 
            error: err.name, 
            message: err.message
            }
        )
    }

    res.status(500).send({ error: err.message })  
})

app.on('uncaughtException', handleFatalError)
app.on('unhandledRejection', handleFatalError)

const server = http.createServer(app)

server.listen(PORT, () => {
    console.log(`${chalk.green('[platziverse-api]')} server listening on port ${PORT}`)
})

