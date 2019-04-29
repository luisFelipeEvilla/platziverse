'use strict'

const chalk = require('chalk')

module.exports = function handleError (err) {
    console.error(`${chalk.red('[error]')} ${err.message}`)
    console.error(err.stack)  
}