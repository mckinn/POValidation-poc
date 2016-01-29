const http = require('http');
var parseString = require('xml2js').parseString;
var outfile = require('fs');
var outstream = outfile.createWriteStream('data/portoutRequestLog.csv');
var moment = require('moment');
var mongoose = require('mongoose');
mongoose.connect('mongodb://povalidation:subbylou@ds051625.mongolab.com:51625/povalidation');

//
// this sets up a mongoose schema and model - just picking away at this.
//
var Schema = mongoose.Schema;

// create a schema
var POVSchema = new Schema(
	//
	//<PortOutValidationRequest>
	//    <PON>some_pon</PON>
	//    <Pin>1111</Pin>
	//    <AccountNumber>777</AccountNumber>
	//    <ZipCode>62025</ZipCode>
	//    <SubscriberName>Subscriber Name</SubscriberName>
	//    <TelephoneNumbers>
	//        <TelephoneNumber>2223331000</TelephoneNumber>
	//        <TelephoneNumber>2223331001</TelephoneNumber>
	//    </TelephoneNumbers>
	//</PortOutValidationRequest>
	{
	  pon: { type: String, required: true, unique: true },
	  pin: String,
	  accountno: String,
	  zip: String,
	  subname: String,
	  telephones: [String]
	});

// create the model
var POVModel = mongoose.model('PortOutValidation', POVSchema);

// 
//   this js code reflects the request back to the source with a 200 OK.
//

var count = 1;

process.stdin.resume();

process.on('SIGINT', function() {
  console.log('Closing file');
  outstream.end();
  mongoose.connection.close();
  process.exit(0);
});

/*
var extractPovRequest = function(count,payload) {
	var summary = 'x';
	if (payload) {
		// for use in the response
		var PON = payload.PON || "invalid PON";
		summary = count + "," +
			PON + "," +
			(payload.Pin ||"missing Pin ") +  "," +
			(payload.AccountNumber ||"missing AccountNumber ") + "," +
			(payload.ZipCode ||"missing ZipCode ") + "," +
			(payload.SubscriberName ||"missing SubscriberName") + "," +
			moment().format();
		var phonenumbers = payload.TelephoneNumbers[0].TelephoneNumber;
		// console.log("telephone number = " + JSON.stringify(phonenumbers));
		// console.log("array: "+Object.prototype.toString.apply(phonenumbers));
		for ( telno = 0; telno < phonenumbers.length; telno += 1) {
			// console.log(phonenumbers[telno]);
			summary = summary + ", " + (phonenumbers[telno] || "no telno");
		}
	}
	return summary;
};
*/

var extractPovRequest = function(count,payload) {
	var summary = 'x';
	if (payload) {
		// for use in the response
		var PON = payload.PON || "invalid PON";
		var savethis = new POVModel({
			pon: PON,
			pin: (payload.Pin ||"missing Pin "),
			accountno: (payload.AccountNumber ||"missing AccountNumber "),
			zip: (payload.ZipCode ||"missing ZipCode "),
			subname: (payload.SubscriberName ||"missing SubscriberName"),
			telephones: []
		});
		summary = count + "," +
			PON + "," +
			(payload.Pin ||"missing Pin ") +  "," +
			(payload.AccountNumber ||"missing AccountNumber ") + "," +
			(payload.ZipCode ||"missing ZipCode ") + "," +
			(payload.SubscriberName ||"missing SubscriberName") + "," +
			moment().format();
		var phonenumbers = payload.TelephoneNumbers[0].TelephoneNumber;
		// console.log("telephone number = " + JSON.stringify(phonenumbers));
		// console.log("array: "+Object.prototype.toString.apply(phonenumbers));
		for ( telno = 0; telno < phonenumbers.length; telno += 1) {
			// console.log(phonenumbers[telno]);
			summary = summary + ", " + (phonenumbers[telno] || "no telno");
			savethis.telephones.push((phonenumbers[telno] || "no telno"));
		}
		savethis.save(function(err) {
		  if (err) throw err;
		  console.log('POV saved successfully!');
		  console.log(JSON.stringify(savethis));
		});
	}
	return summary;
};


// var is_array = function (value) {
// 	return Object.prototype.toString.apply(value) === '[object Array]';
// };

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
				if (result.PortOutValidationRequest) {
					// for use in the response
					// console.log(JSON.stringify(result));
					var PON = result.PortOutValidationRequest.PON || "invalid PON";
					var summary = extractPovRequest(count, result.PortOutValidationRequest);
					console.log(summary);
					outstream.write(summary + '\n');
				}
				// xmlOut = '<PortOutValidationResponse>' + '\n' +
      			// 		'<Portable>true</Portable>' + '\n' + 
				// 		'<PON>'+ PON + '</PON>' + '\n' + 
				// 		'</PortOutValidationResponse>'
				xmlOut =   '<PortOutValidationResponse>' + '\n' +
						      '<Portable>false</Portable>' + '\n' +
						      '<PON>'+ PON + '</PON>' + '\n' +
						      '<Errors>' + '\n' +
						          '<Error>' + '\n' +
						              '<Code>7999</Code>' + '\n' +
						              '<Description>fatal error</Description>' + '\n' +
						          '</Error>' + '\n' +
						      '</Errors>' + '\n' +
						  '</PortOutValidationResponse>'
						  ' ';
			});
		} else {
			  POVModel.find({}, function(err, records) {
				  if (err) throw err;

				  // object of all the users
				  console.log(records);
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
