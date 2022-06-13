# @restroom-mw/http

Is a basic middleware to make REST calles to read and post data to endpoints.

## Usage

```js
import express from "express";
import zencode from "@restroom-mw/core";
import http from "@restroom-mw/http";

const app = express();

app.use(http);
app.use("/api/*", zencode);
```

## Zencode examples

The syntax of the actions is [here](https://github.com/dyne/restroom-mw/blob/master/packages/http/src/index.ts#L6-L10).

### Read output from an endpoint

Use this **Zencode**:

```gherkin
# we'll need to create a keypair to produce an ECDSA signature later
Scenario 'ecdh': Create the keypair
Given that I am known as 'Alice'

# Those are restroom-mw statements: define the endpoints
Given that I have an endpoint named 'endpoint' 
Given that I have an endpoint named 'timeServer' 

# We need those object to store the output of the endpoints
Given I have a 'string dictionary' named 'dataFromEndpoint'
Given I have a 'number' named 'timestamp'

# Those are restroom-mw statements: connect to endpoints and store their output into Zenroom's objects
Given I connect to 'endpoint' and save the output into 'dataFromEndpoint'
Given I connect to 'timeServer' and save the output into 'timestamp'

# Create a string dictionary to format the output 
When I create the 'string dictionary'
and I rename the 'string dictionary' to 'outputData'

# Organize the output of the endpoints in the string dictionary
When I insert 'dataFromEndpoint' in 'outputData'
When I insert 'timestamp' in 'outputData'

# ECDSA signature
When I create the keypair
When I create the signature of 'outputData'
When I rename the 'signature' to 'outputData.signature'

# Printing the output
Then print the 'outputData'
Then print the 'outputData.signature'
```

With this **keys**:

```json
{
	"endpoint": "https://apiroom.net/api/dyneorg/512-bits-random-generator",
	"timeServer": "http://showcase.api.linx.twenty57.net/UnixTime/tounix?date=now"
}
```

### Post output to an endpont

Use this **Zencode**:

```gherkin
# [R] Restroom-mw statements: state endpoints
Given that I have an endpoint named 'timeServer'  
Given that I have an endpoint named 'outputEndpoint'  

# We need this object to store the output of the timestamp endpoint
Given I have a 'number' named 'timestamp'

# [R] Restroom-mw statements: connect to endpoints and store the output
Given I connect to 'timeServer' and save the output into 'timestamp'

# Let's create an array of random objects
When I create the array of '8' random objects of '256' bits
and I rename the 'array' to 'randomArray'

# Create a string dictionary to format the output 
When I create the 'base64 dictionary'
and I rename the 'base64 dictionary' to 'outputData'

# Organize the output of the endpoints in the string dictionary
When I insert 'timestamp' in 'outputData'
When I insert 'randomArray' in 'outputData'

# Informative string
When I write string 'see the results in https://beeceptor.com/console/dyneorg' in 'outputString'

# Print the output
Then print all data

# [R] Restroom-mw statements: send the output to an endpoint via a REST call  
Then pass the output to 'outputEndpoint'

```

With this **keys**:

```json
{
	"timeServer": "http://showcase.api.linx.twenty57.net/UnixTime/tounix?date=now",
	"outputEndpoint": "https://dyneorg.free.beeceptor.com"
}
```

## Zencode examples

The syntax of the actions is [here](https://github.com/dyne/restroom-mw/blob/master/packages/http/src/index.ts#L6-L10).

### Read output from an endpoint

Use this **Zencode**:

```gherkin
# we'll need to create a keypair to produce an ECDSA signature later
Scenario 'ecdh': Create the keypair
Given that I am known as 'Alice'

# Those are restroom-mw statements: define the endpoints
Given that I have an endpoint named 'endpoint' 
Given that I have an endpoint named 'timeServer' 

# We need those object to store the output of the endpoints
Given I have a 'string dictionary' named 'dataFromEndpoint'
Given I have a 'number' named 'timestamp'

# Those are restroom-mw statements: connect to endpoints and store their output into Zenroom's objects
Given I connect to 'endpoint' and save the output into 'dataFromEndpoint'
Given I connect to 'timeServer' and save the output into 'timestamp'

# Create a string dictionary to format the output 
When I create the 'string dictionary'
and I rename the 'string dictionary' to 'outputData'

# Organize the output of the endpoints in the string dictionary
When I insert 'dataFromEndpoint' in 'outputData'
When I insert 'timestamp' in 'outputData'

# ECDSA signature
When I create the keypair
When I create the signature of 'outputData'
When I rename the 'signature' to 'outputData.signature'

# Printing the output
Then print the 'outputData'
Then print the 'outputData.signature'
```

With this **keys**:

```json
{
	"endpoint": "https://apiroom.net/api/dyneorg/512-bits-random-generator",
	"timeServer": "http://showcase.api.linx.twenty57.net/UnixTime/tounix?date=now"
}
```

### Post output to an endpont

Use this **Zencode**:

```gherkin
# [R] Restroom-mw statements: state endpoints
Given that I have an endpoint named 'timeServer'  
Given that I have an endpoint named 'outputEndpoint'  

# We need this object to store the output of the timestamp endpoint
Given I have a 'number' named 'timestamp'

# [R] Restroom-mw statements: connect to endpoints and store the output
Given I connect to 'timeServer' and save the output into 'timestamp'

# Let's create an array of random objects
When I create the array of '8' random objects of '256' bits
and I rename the 'array' to 'randomArray'

# Create a string dictionary to format the output 
When I create the 'base64 dictionary'
and I rename the 'base64 dictionary' to 'outputData'

# Organize the output of the endpoints in the string dictionary
When I insert 'timestamp' in 'outputData'
When I insert 'randomArray' in 'outputData'

# Informative string
When I write string 'see the results in https://beeceptor.com/console/dyneorg' in 'outputString'

# Print the output
Then print all data

# [R] Restroom-mw statements: send the output to an endpoint via a REST call  
Then pass the output to 'outputEndpoint'

```

With this **keys**:

```json
{
	"timeServer": "http://showcase.api.linx.twenty57.net/UnixTime/tounix?date=now",
	"outputEndpoint": "https://dyneorg.free.beeceptor.com"
}
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents
