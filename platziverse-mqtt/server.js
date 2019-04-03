'use strict'

const debug = require('debug')('platziverse:mqtt')
const chalk = require('chalk')
const mosca = require('mosca')
const redis = require('redis')
const { handleFatalError, handleError, config, parsePayload } = require('../platziverse-utils')
const db = require('platziverse-db')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

const conf = config()

let Agent, Metric
const clients = new Map()

const server = new mosca.Server(settings)

server.on('clienteConnected', client => {
  debug(`Client connected: ${client.id}`)
  clients.set(client.id, null)
})

server.on('clientDisconnected', client => {
  debug(`Client disconnected: ${client.id}`)
  clients.delete(client.id)
})

server.on('published', async (packet, client) => {
  debug(`Received: ${packet.topic}`)
  debug(`Payload: ${packet.payload}`)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      break
    case 'agent/message':
      const payload = parsePayload(packet.payload)

      let agent
      try {
        agent = await Agent.createOrUpdate(payload)
      } catch (e) {
        return handleError(e)
      }

      debug(`Agent ${agent.uuid} saved`)

      // Notify agent is connected
      if (!clients.get(client.id)) {
        clients.set(client.id, agent)
        server.publish({
          topic: 'agent/connected',
          payload: JSON.stringify({
            agent: {
              uuid: agent.uuid,
              username: agent.username,
              hostname: agent.hostname,
              pid: agent.pid,
              connected: agent.connected
            }
          })
        })
      }
      break
  }
})

server.on('ready', async () => {
  console.log(`${chalk.green('[Platziver-mqtt]')} server is running`)
  const Services = await db(conf).catch(handleFatalError)

  Agent = Services.Agent
  Metric = Services.Metric
})

server.on('error', (err) => {
  handleFatalError(err)
})

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
