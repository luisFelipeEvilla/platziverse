'use strict'

require('dotenv').config()
const db = require('./')
const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const { handleFatalError } = require('./utils')

async function setup () {
  const byPass = process.argv.indexOf('yes') !== -1 || process.argv.indexOf('y') !== -1

  if (!byPass) {
    const prompt = inquirer.createPromptModule()
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'this will destroy your database, are you sure?'
      }
    ])

    if (!answer.setup) {
      return console.log('Nothing has happened :)')
    }
  }

  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'random',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }
  await db(config).catch(handleFatalError)

  console.log('Sucess')
  process.exit(0)
}

setup()
