'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const metricFixtures = require('./fixtures/metric')
const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () { }
}

let agentStub = null
let metricStub = null
let db = null
let sandbox = null

let type = 'CPU'
let singleAgent = agentFixtures.single
let newMetric = metricFixtures.new
let newAgent = agentFixtures.new

let uuidArgs = {
  where: {
    uuid: singleAgent.uuid
  }
}

let agentUuidArgs = {
  attributes: [ 'type' ],
  group: [ 'type' ],
  include: [{
    model: agentStub,
    attributes: [],
    where: {
      uuid: singleAgent.uuid
    }
  }],
  raw: true
}

let typeUuidArgs = {
  attributes: ['id', 'type', 'value', 'createdAt'],
  where: {
    type
  },
  limit: 20,
  order: [' createdAt'],
  include: [{
    model: agentStub,
    attributes: [],
    where: {
      uuid: singleAgent.uuid
    }
  }],
  raw: true
}

test.beforeEach(async () => {
  let sandbox = sinon.createSandbox()
  metricStub = {
    belongsTo: sandbox.spy()
  }
  agentStub = {
    hasMany: sinon.spy()
  }

  // Agent findOne stub
  agentStub.findOne = sandbox.stub()
  agentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(singleAgent.uuid)))

  // Metric create stub
  metricStub.create = sandbox.stub()
  metricStub.create.withArgs(newMetric).returns(Promise.resolve(newMetric))

  agentUuidArgs.include[0].model = agentStub
  typeUuidArgs.include[0].model = agentStub

  // Metric findAll stub
  metricStub.findAll = sandbox.stub()
  metricStub.findAll.withArgs(typeUuidArgs).returns(Promise.resolve(metricFixtures.byTypeAgentUuid(type, singleAgent.uuid)))
  metricStub.findAll.withArgs(agentUuidArgs).returns(Promise.resolve(metricFixtures.byAgentUuid(singleAgent.uuid)))

  // newMetric toJSON Stub
  newMetric.toJSON = sandbox.stub()
  newMetric.toJSON.returns(newMetric)

  const setupDatabase = proxyquire('../', {
    './models/agent': () => agentStub,
    './models/metric': () => metricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(async () => {
  sandbox && sinon.restore()
})

test('Metric', t => {
  t.truthy(db.Agent, 'Agent service should exist')
  t.truthy(db.Metric, 'Metric service should exist')
})

test.serial('Metric#create - Agent exist', async t => {
  const metric = await db.Metric.create(singleAgent.uuid, newMetric)

  t.true(agentStub.findOne.called, 'findOne should be called')
  t.true(agentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(agentStub.findOne.calledWith(uuidArgs), 'findOne should be called with specified args')
  t.true(metricStub.create.called, 'create should be called')
  t.true(metricStub.create.calledOnce, 'create should be called once')
  t.true(metricStub.create.calledWith(newMetric), 'create should be called with specified args')
  t.true(newMetric.toJSON.called, 'toJSON should be called once')
  t.true(newMetric.toJSON.calledOnce, 'toJSON should be called once')
  t.true(newMetric.toJSON.calledWithExactly(), 'toJSON should be called without args')

  t.deepEqual(metric, newMetric, 'Metrics should be the sames')
})

test.serial('Metric#create -Agent do not exist', async t => {
  const metric = await db.Metric.create(newAgent.uuid, newMetric)

  t.true(agentStub.findOne.called, 'findOne should be called')
  t.true(agentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(agentStub.findOne.calledWith({ where: { uuid: newAgent.uuid } }), 'findOne should be called with specified args')

  t.deepEqual(metric, undefined, 'Metrics should be the sames')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  const metrics = await db.Metric.findByTypeAgentUuid(type, singleAgent.uuid)

  t.true(metricStub.findAll.called, 'findAll should be called')
  t.true(metricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(metricStub.findAll.calledWith(typeUuidArgs), 'findAll should be called with specified args')

  t.deepEqual(metrics, metricFixtures.byTypeAgentUuid(type, singleAgent.uuid), 'metrics types and agents should be the same')
})

test.serial('Metric#findByAgentUuid', async t => {
  const metrics = await db.Metric.findByAgentUuid(singleAgent.uuid)

  t.true(metricStub.findAll.called, 'findAll should be called')
  t.true(metricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(metricStub.findAll.calledWith(agentUuidArgs))

  t.deepEqual(metrics, metricFixtures.byAgentUuid(singleAgent.uuid), 'Metrics should be the same')
})
