var request = require('superagent')
var cheerio = require('cheerio')
var fs = require('fs')

var getBusNumbers = require('./getBusNumber')

const number = process.argv[2]
const inbound = process.argv[3] == 'i'

// busScraper(number, inbound)

start()

function start() {
  getBusNumbers()
    .then(busArr => {
      console.log(busArr.length, 'services to request')
      mapBusses(busArr, 0)
      .then(() => console.log('done'))
      .catch(err => console.log({err}))
    })
    .catch(err => console.log(err))
}


function mapBusses(busArr, idx) {
  console.log('mapping', busArr[idx])
  return new Promise(function(resolve, reject) {
    if (idx == busArr.length) resolve()
    else return twoDirecional(busArr[idx])
      .then(() => resolve(mapBusses(busArr, idx + 1)))
      .catch(err => reject(err))
  });
}

function twoDirecional(busNumber) {
  return new Promise(function(resolve, reject) {
    console.log('getting inbound / outbound for bus ' + busNumber)
    // return resolve()
    return busScraper(busNumber, true)
    .then(() => busScraper(busNumber), false)
    .then(() => resolve())
    .catch(err => reject(err))
  });
}

function busScraper(busNumber, isInbound) {
  console.log(busNumber,  isInbound ? 'inbound' : 'outbound')
  return new Promise(function(resolve, reject) {
    request
      .get(`https://www.metlink.org.nz/timetables/bus/${busNumber}/${isInbound?'inbound':'outbound'}`)
      .end((err, res) => {
        if (err) reject(err)
        const $ = cheerio.load(res.text)
        let selected = $('#timetableDataStops').find('.stop').find('a')
        const stops = []
        for (let i = 0; i < selected.length; i++) {
          stops.push(selected[i].attribs.name)
        }
        console.log("got the stop numbers, now to find their coordinates")
        promiseChain(stops, 0, [])
          .then(coords => {
            console.log("We got the coordinates, now to write them to a file :)")
            const fileName = `bus${busNumber}${isInbound?'IN':'OUT'}.txt`
            fs.writeFile(`${__dirname}/coords/${fileName}`, JSON.stringify({busNumber, coords}), (err) => {
              if (!err) {
                console.log(`Positions of ${isInbound?"Inbound":'Outbound'} stops for bus ${busNumber} written! to ${fileName}, have fun!`)
                resolve()
              }
              else reject(err)
            })
          })
          .catch(err => reject(err))
    })
  });
}

function promiseChain (stops, idx, arr) {
  return new Promise(function(resolve, reject) {
    process.stdout.write('.')
    request
    .get('https://www.metlink.org.nz/api/v1/StopDepartures/' + stops[idx])
    .then(res => {
      const coords = {stopNumber: stops[idx], lat: res.body.Stop.Lat, lng: res.body.Stop.Long}
      arr.push(coords)
      if (idx == stops.length - 1) resolve(arr)
      else setTimeout(() => resolve(promiseChain(stops, idx + 1, arr)), 3000)
    })
    .catch(err => reject(err))
  });
}
