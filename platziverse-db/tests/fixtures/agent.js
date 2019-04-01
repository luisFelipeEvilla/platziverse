'use strict'

const agent = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const newAgent = {
  id: 2,
  uuid: 'nnn-nnn-nnn',
  name: 'new Agent',
  username: 'new fixture',
  hostName: 'new host',
  pid: 1,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const agents = [
  agent,
  extend(agent, { id: 2, uuid: 'yyy-yyy-yyz' }),
  extend(agent, { id: 3, uuid: 'yyy-yyy-yzz', name: 'platzo' }),
  extend(agent, { id: 4, uuid: 'xxx-xxx-xxx', connected: false }),
  extend(agent, { id: 5, uuid: 'zzz-zzz-zzz', connected: false }),
  extend(agent, { uuid: 'www-www-www', hostname: 'localhost', pid: 2 })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: agent,
  new: newAgent,
  all: agents,
  connected: agents.filter(a => agent.connected),
  platzi: agents.filter(a => agent.name === 'platzi'),
  byUuid: uuid => agents.filter(a => a.uuid === uuid).shift(),
  byId: id => agents.filter(a => a.id === id).shift()
}
