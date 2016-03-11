// const http = require('http');
var express = require('express');
var app = express();
var parseString = require('xml2js').parseString;
var js2xmlparser = require("js2xmlparser");
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

var count = 1;

// set up a clean exit from console <ctrl-c>
process.stdin.resume();
process.on('SIGINT', function() {
  console.log('Closing file');
  outstream.end();
  mongoose.connection.close();
  process.exit(0);
});

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
			savethis.pin +  "," +
			savethis.accountno + "," +
			savethis.zip + "," +
			savethis.subname + "," +
			moment().format();
		var phonenumbers = payload.TelephoneNumbers[0].TelephoneNumber;

		for ( telno = 0; telno < phonenumbers.length; telno += 1) {
			// console.log(phonenumbers[telno]);
			summary = summary + ", " + (phonenumbers[telno] || "no telno");
			savethis.telephones.push((phonenumbers[telno] || "no telno"));
		}

		POVModel.findOne({pon:PON},function(err,indb){
			if (!indb) { // presume not found
				savethis.save(function(err) {
				  if (err) throw err;
				  console.log('new POV saved successfully!');
				  console.log(JSON.stringify(savethis));
				});
			} else {
				//indb.pon = savethis.pon;
				indb.pin = savethis.pin;
				indb.accountno = savethis.accountno;
				indb.zip = savethis.zip;
				indb.subname = savethis.subname;
				indb.telephones = savethis.telephones;
				indb.save(function(err) {
					if (err) throw err;
					console.log('OLD POV re-saved successfully!');
					console.log(JSON.stringify(indb));
				});
			}
		});
	}
	return summary;
	};

// var is_array = function (value) {
// 	return Object.prototype.toString.apply(value) === '[object Array]';
// };

var options = {     
    declaration: {
        include: false
    },
    arrayMap: {
        telephones: "tn"
    }
};

app.get('/getdata',function(request, result){
	POVModel.find({}, function(err, records) {
			if (err) throw err;
			var xmlrecords = '<POVDatabase>';
			// console.log(records);
			for (record in records) {
				xmlrecords = xmlrecords + js2xmlparser("POVRecord", JSON.stringify(records[record]), options);
			};
			xmlrecords = xmlrecords + '</POVDatabase>';
			result.set( {'Content-Type': 'application/xml'});
			result.send(xmlrecords);
			result.end();
		});
	});

app.post('/', function (request, response) {

	var body = '';
	var xmlOut = '';

	request.on('data', function (chunk) {
    	body += chunk;
  	});
	request.on('end', function () {
		if (body != '') {
			// console.log("Body: "+body);
			parseString(body,function(err,result) {
				if (result.PortOutValidationRequest) {
					// for use in the response
					// console.log(JSON.stringify(result));
					var PON = result.PortOutValidationRequest.PON || "invalid PON";
					var summary = extractPovRequest(count, result.PortOutValidationRequest);
					console.log(summary);
					// outstream.write(summary + '\n');
				}
				xmlOut =   '<PortOutValidationResponse>' + '\n' +
						      '<Portable>false</Portable>' + '\n' +
						      '<PON>'+ PON + '</PON>' + '\n' +
						      '<Errors>' + '\n' +
						          '<Error>' + '\n' +
						              '<Code>7519</Code>' + '\n' +
						              '<Description>Custom Complaint Message</Description>' + '\n' +
						          '</Error>' + '\n' +
						      '</Errors>' + '\n' +
						  '</PortOutValidationResponse>';
			});
		};
		response.set( {'Content-Type': 'application/xml'});
		response.send( xmlOut );
		response.end();
		count = count + 1;
	});
	});

app.listen(8124, function () {
	console.log('Example app listening on port 8124!');
	});

// outstream.write("index, PON, Pin, AccountNumber, ZipCode, SubscriberName, Timestamp " + '\n');
// console.log("PON, Pin, AccountNumber, ZipCode, SubscriberName, Timestamp " + '\n');
