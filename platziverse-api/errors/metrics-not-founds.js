'use strict'

class MetricsNotFounds extends Error {
    constructor (uuid, type = null) {
        super()

        this.name = this.constructor.name
        this.status = 404

        if (type) {
            this.message = `Metrics with the Agent uuid ${uuid} and type ${type} not founds`
        } else {
            this.message = `Metrics with the Agent uuid ${uuid} not founds`
        }
    }
}

module.exports = MetricsNotFounds