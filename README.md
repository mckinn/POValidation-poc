# POValidation-poc
Port Out Validation API responder Proof of Concept

This node application represents a personal learning experiment that provides a response to an API request to port out a number, and tracks that request in a mongo db instance.

## Objectives

Overall this is a learning experiment, intended to provide the excuse to learn at least the basics of key web technologies.  The chosen technologies are...
* nodejs
* javascript
* html + css + bootstrap
* mongodb
* angularJS
* express

I'd also like to host it in the cloud somewhere to learn about that technology.

This will not create a productized outcome, but it should work reliably for it's purpose.   

## a little background

A "port out" is the action taken in a telecom network to remove a number from service in one network (like AT&T) and place it in service in another network (say Verizon).  A "port-out validation" is a step taken before it is removed from the network to ensure that the request is valid.   In this case the port-out-validation is performed via an API call.  This project will accept this API call, make a record of the port-out-validation request, respond in a way that provides a mock validation answer, and in the future, provide access to the series of requests on a web page. 

## overall solution architecture

The basic structure of the project will be centered on the mongodb instance, which will act as a datastore for storing requested port-out activity, and act as a data source to examine what port-out requests have been made, for exposure on a web page.

## behavior

The API will...
* return a mock response of *Portable* == true if the <AccountNumber> information is present, and false otherwise
* return...
 * a valid error response payload if the *PIN* equals a valid error response,
 * the submitted *PIN* itself if the *PIN* is not a valid value, and 
 * no error payload at all if the *PIN* is blank

## project status

1. Initial step - receive the requests, and write them to a flat file (done)
2. database - write a copy of the requests to mongodb (done)
3. build some simple business logic to provide a mock validation response (done)
4. serve a web-page template to encapsulate the display of past requests
5. create a table to display said requests
6. enable Deletion of selected listed requests
