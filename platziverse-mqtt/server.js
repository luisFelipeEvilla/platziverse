'use strict'

const debug = require('debug')('platziverse:mqtt')
const chalk = require('chalk')
const mosca = require('mosca')
const redis = require('redis')
const {handleFatalError} = require('../utils')

const backend = {
    type: 'redis',
    redis,
    return_buffers: true
}

const settings = {
    port: 1883,
    backend
}

const server = new mosca.Server(settings)

server.on('clienteConnected', client => {
    debug(`Client connected: ${client.id}`)
})

server.on('clientDisconnected', clinet => {
    debug(`Client disconnected: ${client.id}`)
})

server.on('published', (packet, client) => {
    debug(`Received: ${packet.topic}`)
    debug(`Payload: ${packet.payload}`)
})

server.on('ready', () => {
    console.log(`${chalk.green('[Platziver-mqtt]')} server is running`);
    
})

server.on('error', (err) => {
    handleFatalError(err)
})

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
