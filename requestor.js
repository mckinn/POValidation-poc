//
// basic model - make a request of the backordered numbers API and display the results in JSON.
//
var request = require('request');

// https://github.com/Leonidas-from-XIV/node-xml2js
var xml2js = require('xml2js');
// github.com/request/request-promise
require('request').debug = false;

// request.get('http://test.dashboard.bandwidth.com/api/accounts/9900012/orders?page=1&size=5');

parser = new xml2js.Parser({explicitArray: false});

var returnedPayload;

request.get('http://test.dashboard.bandwidth.com/api/accounts/9900012/orders?page=1&size=5', {
  'auth': {
    'user': 'customer',
    'pass': 'password',
    'sendImmediately': false
		}
	},
	function (error, response, body) {
		console.log('got here ' + response.statusCode);
	 	if (!error && response.statusCode == 200) {
//			console.log(body);
			parser.parseString(body,function(err,result) {
				console.log(JSON.stringify(result));
				if (result.ResponseSelectWrapper) {
					console.log('\n' +'recognized it' + '\n');
					var orders;
					var orderIndex;
					orders = result.ResponseSelectWrapper.ListOrderIdUserIdDate.OrderIdUserIdDate;
					console.log('Orders are:' + JSON.stringify(orders) + '\n' + '\n' );
					console.log('Number of Orders is:' + orders.length + '\n' + '\n' );
					for (orderIndex = 0; orderIndex < orders.length; orderIndex++) {
						console.log('orderId: ' + orders[orderIndex].orderId );
						console.log('CountOfTNs: ' + orders[orderIndex].CountOfTNs );
						console.log('userId: ' + orders[orderIndex].userId + '\n' );
					}

				}
			});
	 	}
	});


/*
General Approach...
get all of the orders --> internal list
Ramble through the list getting all of the individual order-id details, and augmenting the array of orders

*/
// not defined yet in the flow.
// console.log(returnedPayload);