var request = require('superagent')
var cheerio = require('cheerio')
var fs = require('fs')

const busNumber = process.argv[2]
const isInbound = process.argv[3] == 'i'

request
  .get(`https://www.metlink.org.nz/timetables/bus/${busNumber}/${isInbound?'inbound':'outbound'}`)
  .end((err, res) => {
    if (err) console.log(err)
    const $ = cheerio.load(res.text)
    let selected = $('#timetableDataStops').find('.stop').find('a')
    const stops = []
    for (let i = 0; i < selected.length; i++) {
      stops.push(selected[i].attribs.name)
    }
    console.log("got the bus numbers, now to find their coordinates")
    promiseChain(stops, 0, [])
      .then(arr => {
        console.log("We got the coordinates, now to write them to a file :)")
        const fileName = `bus${busNumber}${isInbound?'IN':'OUT'}.txt`
        fs.writeFile(`${__dirname}/coords/${fileName}`, JSON.stringify(arr), (err) => {
          if (!err) console.log(`Positions of ${isInbound?"Inbound":'Outbound'} stops for bus ${busNumber} written! to ${fileName}, have fun!`)
          else console.log(err)
        })
      })
  })

function promiseChain (stops, idx, arr) {
  return new Promise(function(resolve, reject) {
    request
    .get('https://www.metlink.org.nz/api/v1/StopDepartures/' + stops[idx])
    .then(res => {
      const coords = {Lat: res.body.Stop.Lat, Lng: res.body.Stop.Long}
      arr.push(coords)
      console.log({coords})
      if (idx == stops.length - 1) resolve(arr)
      else setTimeout(() => resolve(promiseChain(stops, idx + 1, arr)), 500)
    })
    .catch(err => reject(err))
  });
}
