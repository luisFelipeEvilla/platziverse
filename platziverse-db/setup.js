'use strict'

const { config, handleFatalError } = require('../platziverse-utils')
const debug = require('debug')('platziverse:db:setup')
const conf = config({logging: debug})
const db = require('./')
const inquirer = require('inquirer')

console.log(conf);


async function setup() {
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

  conf.setup = true

  await db(conf).catch(handleFatalError)

  console.log('Sucess')
  process.exit(0)
}

setup()
