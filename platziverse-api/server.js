'use strict'

const express = require('express')
const http = require('http');
const chalk = require('chalk')
const api= require('./api')

const PORT = process.env.PORT || 3000

const app = express()

app.use('/api', api)

const server = http.createServer(app)

server.listen(PORT, () => {
    console.log(`${chalk.green('[platziverse-api]')} server listening on port ${PORT}`)
})

