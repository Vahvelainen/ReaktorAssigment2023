const axios = require('axios');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: "ATTR", explicitArray: false });

exports.euclideanDistance2D = (x1, y1, x2, y2) => {
  const distX = Math.abs( x1 - x2 )
  const distY = Math.abs( y1 - y2 )
  return Math.hypot( distX, distY )
}

exports.httpGetAndParseXML = async(URL) => {
  const resp = await axios.get(URL)

  let error = null;
  let result = "";

  parser.parseString(resp.data, (err, res) => {
    result = res;
    error = err;
  });
  return error, result

}

exports.sleep = (duration) => { return new Promise(resolve => setTimeout(resolve, duration)); }

exports.differenseInMinutes = (t1, t2) => {
  const diffMs = Math.abs( t1.valueOf() - t2.valueOf() )
  return diffMs / 1000 / 60
}