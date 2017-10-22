var request = require('superagent')

module.exports = function recurseStopNumbers (stops, idx, arr) {
  return new Promise(function(resolve, reject) {
    if (stops.length == 0) {
      console.log('no stops found')
      return resolve(arr)
    }
    // process.stdout('.')
    console.log((idx / stops.length * 100).toString().split('.')[0] + '% - next:', stops[idx])
    request
    .get('https://www.metlink.org.nz/api/v1/StopDepartures/' + stops[idx])
    .then(res => {
      const coords = {stopNumber: stops[idx], lat: res.body.Stop.Lat, lng: res.body.Stop.Long}
      arr.push(coords)
      if (idx == stops.length - 1) resolve(arr)
      else setTimeout(() => resolve(recurseStopNumbers(stops, idx + 1, arr)), 100)
    })
    .catch(err => {
      console.log('hit error for stop', stops[idx], '...trying again')
      setTimeout(() => resolve(recurseStopNumbers(stops, idx, arr)), 3000)
    })
  });
}
