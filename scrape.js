var request = require('superagent')
var cheerio = require('cheerio')
var fs = require('fs')

var getBusNumbers = require('./getBusNumber')
var recurseServices = require('./recurseServices')

const number = process.argv[2]
const inbound = process.argv[3] == 'i'

// busScraper(number, inbound)

start()

function start() {
  getBusNumbers()
    .then(busArr => {
      console.log(busArr.length, 'services to request')
      recurseServices(busArr, 0)
      .then(() => console.log('done'))
      .catch(err => console.log({err}))
    })
    .catch(err => console.log(err))
}
