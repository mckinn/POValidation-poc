# POValidation-poc
Port Out Validation API responder Proof of Concept

This node experiment provides a positive response to a request to port out a number, and tracks that request in a file.

## Objectives

Overall this is a learning experiment, intended to provide the excuse to learn at least the basics of key web technologies.  The chosen technologies are...
* nodejs
* javascript
* html + css + bootstrap
* mongodb
* angularJS
* express

I'd also like to host it on AWS EC2 to learn about that technology.

This will not create a productized outcome, but it should work reliably for it's purpose.


## a little background

A "port out" is the action taken in a telecom network to remove a number from service in one network (like AT&T) and place it in service in another network (say Verizon).  A "port-out validation" is a step taken before it is removed from the network to ensure that the request is valid.   In this case the port-out-validation is performed via an API call.  This project will receive this API call, make a record of the port-out-validation request, respond in the affirmative (we don't want to tick off the FCC, and make those approvals available for viewing via a web interface)

## overall solution architecture

The basic structure of the project will be centered on the mongodb instance, which will act as a datastore for storing requested port-out activity, and act as a data source to examine what port-out requests have been made, for exposure on a web page.

## project status

1. Initial step - receive the requests, and write them to a flat file (sort of working)
2. database - write a copy of the requests to mongodb