'use strict'

const db = require('../')
const { handleFatalError } = require('../../platziverse-utils')
const debug = require('debug')('platziverse:example')
const chalk = require('chalk')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || '123',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }

  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.create({
    uuid: 'yyy',
    name: 'test',
    username: 'test',
    pid: 1,
    connected: true
  }).catch(handleFatalError)

  debug(`${chalk.green('--AGENT CREATED--')}`)
  debug(agent)

  const agents = await Agent.findAll().catch(handleFatalError)

  debug(`${chalk.green('--AGENTS FOUNDS--')}`)
  debug(agents)

  const metric = await Metric.create(agent.uuid).catch(handleFatalError)

  debug(`${chalk.green('--METRIC CREATED--')}`)
  debug(metric)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)

  debug(`${chalk.green('--METRICS FOUNDS')}`)
  debug(metrics)

  const metricsByType = await Metric.findByTypeAgentUuid('CPU', agent.uuid).catch(handleFatalError)

  debug(`${chalk.green('---METRICS BY TYPE FOUNDS---')}`)
  debug(metricsByType)
}

run()
