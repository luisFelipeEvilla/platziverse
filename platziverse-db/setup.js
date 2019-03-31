'use strict'

require('dotenv').config()
const db = require('./')
const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')

const prompt = inquirer.createPromptModule()

async function setup () {
  const answer = await prompt([
    {
      type: 'confirm',
      name: 'setup',
      message: 'this will destroy your database, are you sure?'
    }
  ])

  if (!answer) {
    return console.log('Nothing has happened')
  }

  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'random',
    host: process.env.DB_HOST || 'localhots',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }
  await db(config).catch(handleFatalError)

  console.log('Sucess')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
