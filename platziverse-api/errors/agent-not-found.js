'use strict'

class AgentNotFound extends Error {
    constructor (uuid) {
        super()

        this. message = `Agent with uuid: ${uuid} not found`
        this.name = this.constructor.name
        this.status = 404

        Error.captureStackTrace && Error.captureStackTrace(this, AgentNotFound)
    }
}

module.exports = AgentNotFound