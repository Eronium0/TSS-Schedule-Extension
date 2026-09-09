const data = require('./tester.json');
const string = JSON.stringify(data);
const pers = JSON.parse(string);
console.log(pers.d.results[1].SmShort);