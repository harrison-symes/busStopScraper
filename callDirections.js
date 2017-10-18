var scrapeBusStops = require('./scrapeBusStops')

module.exports = function callDirections (busNumber) {
  return new Promise(function(resolve, reject) {
    console.log('getting inbound / outbound for bus ' + busNumber)
    // return resolve()
    return scrapeBusStops(busNumber, true)
    .then(() => scrapeBusStops(busNumber), false)
    .then(() => resolve())
    .catch(err => reject(err))
  });
}
