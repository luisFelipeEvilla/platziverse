'use strict'

const debug = require('debug')('platziverse:api')
const express = require('express')
const err = require('./errors');

const api = express.Router()

api.get('/agents', (req, res) => {
    res.send({})
})

api.get('/agents/:uuid', (req, res, next) => {
    const { uuid } = req.params

    if (uuid === 'yyy') {
        return next(new err.MetricsNotFounds('yyy', 'memory'))    
    }

    res.send({ uuid })
})

api.get('/metrics', (req, res) => {
    res.send({})
})

api.get('/metrics/:uuid', (req, res) => {
    const { uuid } = req.params
    res.send({ uuid })
})

api.get('/metrics/:uuid/:type', (req, res) => {
    const { uuid, type } = req.params
    res.send({ uuid, type })
})

module.exports = api
