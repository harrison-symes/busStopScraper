module.exports = function recurseServices(busArr, idx) {
  console.log('OVERALL ' + (idx / busArr.length * 100).toString().split('.')[0] + '% - next:' + busArr[idx] )
  return new Promise(function(resolve, reject) {
    if (idx == busArr.length) resolve()
    else return require('./callDirections')(busArr[idx])
      .then(() => resolve(recurseServices(busArr, idx + 1)))
      .catch(err => reject(err))
  });
}
