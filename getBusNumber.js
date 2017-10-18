// https://www.metlink.org.nz/#locat
var request = require('superagent')
var cheerio = require('cheerio')

module.exports = () => {
  return new Promise(function(resolve, reject) {
    request
    .get('https://www.metlink.org.nz/#timetables')
    .end((err, res) => {
      if (err) reject(err)
      const $ = cheerio.load(res.text)
      let selected = $('#containerTimetableListBus').find('a[class=js-route-code]').contents()
      let mapped = []
      for (var i = 0; i < selected.length; i++) {
        mapped.push(selected[i].data)
      }
      resolve(mapped)
    })
  });
}
