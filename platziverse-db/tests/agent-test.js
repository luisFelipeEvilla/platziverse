'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () { }
}

let MetricStub = {
  belongsTo: sinon.spy()
}

let single = Object.assign({}, agentFixtures.single)
let newAgent = Object.assign({}, agentFixtures.new)
let id = 1
let uuid = 'yyy-yyy-yyy'
let AgentStub = null
let sandbox = null
let db = null

let uuidArgs = {
  where: {
    uuid
  }
}
let newUuidArgs = {
  where: {
    uuid: newAgent.uuid
  }
}
let connectedArg = {
  where: {
    connected: true
  }
}
let usernameArgs = {
  where: {
    username: 'platzi',
    connected: true
  }
}
test.beforeEach(async () => {
  let sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  // Model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model update stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // Model create stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve(newAgent))

  // NewAgent toJSON stub
  newAgent.toJSON = sandbox.stub()
  newAgent.toJSON.returns(newAgent)

  // Moddel findAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.returns(agentFixtures.all)
  AgentStub.findAll.withArgs(connectedArg).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))
  AgentStub.findAll.withArgs({ where: { username: 'random', connected: true } }).returns(Promise.resolve(null))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(async () => {
  sandbox && sinon.restore()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany should be called')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo should be called')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be AgentModel')
})

test.serial('Agent#findById', async t => {
  const agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called')
  t.true(AgentStub.findById.calledOnce, 'findById should called only once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with specified id')

  t.deepEqual(agent, agentFixtures.byId(id), 'Agents should be the same')
})

test.serial('Agent#createOrUpdate - exist', async t => {
  const agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called Twice')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with specified args')
  t.true(AgentStub.update.called, 'update should be called')
  t.true(AgentStub.update.calledOnce, 'update should be called once')
  t.true(AgentStub.update.calledWith(single, uuidArgs), 'update should be called with specified args')

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'Agents should be the same')
})

test.serial('Agent#createOrUpdate - do not exist', async t => {
  const agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(newUuidArgs), 'findOne should be called with specified args')
  t.true(AgentStub.create.called, 'create should be called')
  t.true(AgentStub.create.calledOnce, 'create should be called once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with specified args')
  t.true(newAgent.toJSON.called, 'toJSON should be called')
  t.true(newAgent.toJSON.calledOnce, 'toJSON should be called')
  t.true(newAgent.toJSON.calledWithExactly(), 'toJSON should be called without args')

  t.deepEqual(agent, newAgent, 'Agents should be the same')
})

test.serial('Agent#findByUuid - found', async t => {
  const agent = await db.Agent.findByUuid(uuid)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with specified args')

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'Agents should be the same')
})

test.serial('Agent#finddByUuid - not found', async t => {
  const agent = await db.Agent.findByUuid(newAgent.uuid)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called')
  t.true(AgentStub.findOne.calledWith(newUuidArgs), 'findOne should be called with specified args')

  t.deepEqual(agent, undefined, 'agents should be called')
})

test.serial('Agent#findAll', async t => {
  const agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWithExactly(), 'findOne should be called without args')

  t.deepEqual(agents, agentFixtures.all, 'Agents should be the sames')
})

test.serial('Agent#findConnected', async t => {
  const agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWithExactly(connectedArg), 'fndAll should be called with specified arg')

  t.deepEqual(agents, agentFixtures.connected, 'agents should be the sames')
})

test.serial('Agent#findByUsername', async t => {
  const agents = await db.Agent.findByUsername('platzi')

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll should be called with specified args')

  t.deepEqual(agents, agentFixtures.platzi, 'agents should be the same')
})

test.serial('Agent#findByUsername - not found', async t => {
  const agents = await db.Agent.findByUsername('random')

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith({ where: { username: 'random', connected: true } }), 'findAll should be called with specified args')

  t.deepEqual(agents, null, 'should do not found any agent')
})
