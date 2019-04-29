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

server.on('clienteConnected', async client => {
  debug(`Client connected: ${client.id}`)
  clients.set(client.id, null)
})

server.on('clientDisconnected', async client => {
  debug(`Client disconnected: ${client.id}`)
  let agent = clients.get(client.id)

  if (agent) {
    // Mark Agent as disconnected
    agent.connected = false

    try {
      await Agent.createOrUpdate(agent)
    } catch (err) {
      handleError(err)
    }

    clients.delete(client.id)

    // Notify Agent disconnected
    server.publish({
      topic: 'agent/disconnected',
      payload: {
        agent: {
          uuid: agent.uuid
        }
      }
    })

    debug(`Client ${client.id} associated to Agent with (${agent.uuid}) marked as disconnected`)
  }
})

server.on('published', async (packet, client) => {
  debug(`Received: ${packet.topic}`)
  debug(`Payload: ${packet.payload}`)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.topic}`)
      break
    case 'agent/message':
      const payload = parsePayload(packet.payload)

      if (payload) {
        payload.agent.connected = true

        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }

        debug(`Agent ${agent.uuid} saved`)

        // Notify agent is connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          server.publish({ topic: 'agent/connected',
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
          debug('hola')
        }

        // Store Metrics
        for (let metric of payload.metrics) {
          let m

          try {
            m = await Metric.create(agent.uuid, metric)
          } catch (err) {
            return handleError(err)
          }

          debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
        }
      }
      break
  }
})

server.on('ready', async () => {
  const Services = await db(conf).catch(handleFatalError)

  Agent = Services.Agent
  Metric = Services.Metric

  console.log(`${chalk.green('[Platziver-mqtt]')} server is running`)
})

server.on('error', (err) => {
  handleFatalError(err)
})

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
