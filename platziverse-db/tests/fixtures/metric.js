'use strict'

const { extend, sortBy } = require('../../utils')
const agentFixtures = require('../fixtures/agent')

const metric = {
  id: 1,
  AgentId: 1,
  type: 'CPU',
  value: '68%',
  createdAt: new Date(),
  agent: agentFixtures.byId(1)
}

const newMetric = {
  id: 1,
  AgentId: 3,
  type: 'TEMPERATURE',
  value: '40°',
  createdAt: new Date(),
  agent: agentFixtures.byId(3)
}

const metrics = [
  metric,
  extend(metric, { id: 4, value: '70%' }),
  extend(metric, { id: 3, type: 'MEMORY', value: '30%' }),
  extend(metric, { id: 5, agentId: 2 }),
  extend(metric, { id: 6, agentId: 3 }),
  extend(metric, { id: 7, agentId: 2, type: 'MEMORY', value: '50%' })
]

function byTypeAgentUuid (type, uuid) {
  return metrics.filter(m => m.type === type && (m.agent ? m.agent.uuid === uuid : false)).map(m => {
    const clone = Object.assign({}, m)

    delete clone.agentId
    delete clone.agent

    return clone
  }).sort(sortBy('createdAt')).reverse
}

function byAgentUuid (uuid) {
  return metrics.filter(m => m.agent ? m.agent.uuid === uuid : false).map(m => {
    const clone = Object.assign({}, m)
    Object.assign(m, { agentUuid: m.agent.uuid })

    delete clone.agentId
    delete clone.agent

    return clone
  })
}

module.exports = {
  single: metric,
  all: metrics,
  new: newMetric,
  byId: id => metrics.filter(m => m.id === id).shift(),
  byAgentId: id => metrics.filter(m => m.agentId === id).shift(),
  byTypeAgentUuid,
  byAgentUuid,
  cpu: metrics.filter(m => m.type === 'CPU')
}
