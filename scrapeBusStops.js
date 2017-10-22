var request = require('superagent')
var cheerio = require('cheerio')
var fs = require('fs')

var recurseStopNumbers = require('./recurseStopNumbers')

module.exports = function scrapeBusStops (busNumber, isInbound) {
  console.log(busNumber,  isInbound ? 'inbound' : 'outbound')
  return new Promise(function(resolve, reject) {
    fs.readdir(`${__dirname}/coords`, (err, files) => {
      const fileName = `bus-${busNumber}-${isInbound?'IN':'OUT'}.txt`
      if (files.find(f => f == fileName)) {
        console.log(fileName, 'already exists')
        resolve()
      } else {
        request
        .get(`https://www.metlink.org.nz/timetables/bus/${busNumber}/${isInbound?'inbound':'outbound'}`)
        .end((err, res) => {
          if (err) reject(err)
          const $ = cheerio.load(res.text)
          let selected = $('#timetableDataStops').find('.stop').find('a')
          const stops = []
          for (let i = 0; i < selected.length; i++) {
            if (selected[i].attribs.name) stops.push(selected[i].attribs.name)
          }
          console.log("got the stop numbers, now to find their coordinates")
          recurseStopNumbers(stops, 0, [])
          .then(coords => {
            console.log("We got the coordinates, now to write them to a file :)")
            const file = {busNumber, coords, isInbound: !!isInbound}
            fs.writeFile(`${__dirname}/coords/${fileName}`, JSON.stringify(file), (err) => {
              if (!err) {
                console.log(`Positions of ${isInbound?"Inbound":'Outbound'} stops for bus ${busNumber} written! to ${fileName}, have fun!`)
                console.log('-------')
                resolve()
              }
              else reject(err)
            })
          })
          .catch(err => reject(err))
        })
      }
    })
  });
}
