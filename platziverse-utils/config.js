'use strict'

const extend = require('./extend')
const debug = require('debug')('platziverse:db')

function config(configExtra) {
    require('dotenv').config()
    
    const config = {
        database: process.env.DB_NAME || 'platziverse', // Database name
        username: process.env.DB_USER || 'admin',   // username of the database
        password: process.env.DB_PASSWORD || '123', // password for the user
        host: process.env.DB_HOST || 'localhost', // IP direction
        dialect: 'postgres', // Database that will be use
        logging: s => debug(s), // function that show each query
        setup: false // setup = true will create again each table in the db and destroy all the data
    }

    if (configExtra) {
        return extend(config, configExtra)
    } else {
        return config
    }
}

module.exports = config 