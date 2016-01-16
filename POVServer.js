const http = require('http');
var parseString = require('xml2js').parseString;
var xml2js = require('xml2js');
var builder = new require('xml2js').Builder();
var outfile = require('fs');
var outstream = outfile.createWriteStream('portoutRequestLog.csv');
var moment = require('moment');

/* 
     this js code reflects the request back to the source with a 200 OK.
*/

var count = 1;

console.log(`This process is pid ${process.pid}`);

process.stdin.resume();

process.on('SIGINT', () => {
  console.log('Closing file');
  outstream.end();
  process.exit(1);
});


http.createServer( function (request, response) {

	var body = '';
	var xmlOut = '';

	request.on('data', function (chunk) {
    	body += chunk;
  	});
	request.on('end', function () {
		response.writeHead(200, {'Content-Type': 'application/xml'});
		// response.write(request.method + ' ' + count + '\n' );
		if (body != '') {
			parseString(body,function(err,result) {
				// var builder = new xml2js.Builder();
				// var xml = builder.buildObject(result);
				// console.log(xml);
				// console.log(JSON.stringify(result));
				if (result.PortOutValidationRequest) {
					// for use in the response
					var PON = result.PortOutValidationRequest.PON || "invalid PON";
					var summary = count + "," +
						PON + "," +
						(result.PortOutValidationRequest.Pin ||"missing Pin ") +  "," +
						(result.PortOutValidationRequest.AccountNumber ||"missing AccountNumber ") + "," +
						(result.PortOutValidationRequest.ZipCode ||"missing ZipCode ") + "," +
						(result.PortOutValidationRequest.SubscriberName ||"missing SubscriberName") + "," +
						moment().format();
					console.log(summary);
					outstream.write(summary + '\n');
				}
				xmlOut = '<PortOutValidationResponse>' + '\n' +
      					'<Portable>true</Portable>' + '\n' + 
						'<PON>'+ PON + '</PON>' + '\n' + 
						'</PortOutValidationResponse>'
			});
		};

		// console.log ( body +'\n' );
		response.end( xmlOut +'\n' );
		count = count + 1;
		// console.log(count);
	});

}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');

outstream.write("index, PON, Pin, AccountNumber, ZipCode, SubscriberName, Timestamp " + '\n');
console.log("PON, Pin, AccountNumber, ZipCode, SubscriberName, Timestamp " + '\n');
