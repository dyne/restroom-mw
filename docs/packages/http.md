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

#### Table of Contents

*   [READ_REQUEST](#read_request)
*   [EXTERNAL_CONNECTION](#external_connection)
    *   [Parameters](#parameters)
*   [EXTERNAL_OUTPUT](#external_output)
    *   [Parameters](#parameters-1)
*   [PASS_OUTPUT](#pass_output)
    *   [Parameters](#parameters-2)
*   [POST_AND_SAVE_TO_VARIABLE](#post_and_save_to_variable)
    *   [Parameters](#parameters-3)
*   [PARALLEL_GET](#parallel_get)
    *   [Parameters](#parameters-4)
*   [PARALLEL_GET_HEADER](#parallel_get_header)
    *   [Parameters](#parameters-5)
*   [PARALLEL_GET_ARRAY](#parallel_get_array)
    *   [Parameters](#parameters-6)
*   [PARALLEL_GET_ARRAY_HEADER](#parallel_get_array_header)
    *   [Parameters](#parameters-7)
*   [PARALLEL_POST](#parallel_post)
    *   [Parameters](#parameters-8)
*   [PARALLEL_POST_HEADER](#parallel_post_header)
    *   [Parameters](#parameters-9)
*   [PARALLEL_POST_ARRAY_WITHIN](#parallel_post_array_within)
    *   [Parameters](#parameters-10)
*   [PARALLEL_POST_ARRAY_WITHIN_HEADER](#parallel_post_array_within_header)
    *   [Parameters](#parameters-11)
*   [PARALLEL_POST_ARRAY](#parallel_post_array)
    *   [Parameters](#parameters-12)
*   [PARALLEL_POST_ARRAY_HEADER](#parallel_post_array_header)
    *   [Parameters](#parameters-13)
*   [PARALLEL_POST_ARRAY_DIFFERENT_DATA](#parallel_post_array_different_data)
    *   [Parameters](#parameters-14)
*   [PARALLEL_POST_ARRAY_DIFFERENT_DATA_HEADER](#parallel_post_array_different_data_header)
    *   [Parameters](#parameters-15)

### READ_REQUEST

[packages/http/src/actions.ts:31-31](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L31-L31 "Source code on GitHub")

`Given I read the http request`<br><br>
Read the http_request that is coming form the outside, it will return
a dictionary of the following form:

    {
     http_request: {
       base_url: '/api/http_request',
       headers: {
         'accept-encoding': 'gzip, deflate',
         connection: 'close',
         'content-length': '0',
         host: '127.0.0.1:44267'
       },
       http_version: '1.1',
       method: 'POST',
       path: '/',
       protocol: 'http',
       socket: {
         local_address: '::ffff:127.0.0.1',
         local_port: 44267,
         remote_address: '::ffff:127.0.0.1',
         remote_family: 'IPv6',
         remote_port: 59794
       }
     }
    }

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

### EXTERNAL_CONNECTION

[packages/http/src/actions.ts:37-37](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L37-L37 "Source code on GitHub")

`Given I have a endpoint named 'myEndpoint'`<br><br>
Set the endpoint to be used later in the other statements

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myEndpoint` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the url's endpoint or the url's endpoint itself

### EXTERNAL_OUTPUT

[packages/http/src/actions.ts:44-44](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L44-L44 "Source code on GitHub")

`Given I connect to 'myEndpoint' and save the output into 'myResult'`<br><br>
Connect to *myEndpoint* and store the result into *myResult*

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myEndpoint` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the url's endpoint or the url's endpoint itself
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt

### PASS_OUTPUT

[packages/http/src/actions.ts:50-50](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L50-L50 "Source code on GitHub")

`Then I pass the output to 'myEndpoint'`<br><br>
Perform a post to *myEndpoint* with data the zencode output

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myEndpoint` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the url's endpoint or the url's endpoint itself

### POST_AND_SAVE_TO_VARIABLE

[packages/http/src/actions.ts:61-61](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L61-L61 "Source code on GitHub")

`Given I connect to 'myEndpoint' and pass it the content of 'myVariable' and save the output into 'myResult'`<br><br>
Perform a post to *myEndpoint* with data contained in *myVariable* and store the result in *myResult* which
will be a dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myEndpoint` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the url's endpoint or the url's endpoint itself
*   `myVairable` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the post data
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the post

### PARALLEL_GET

[packages/http/src/actions.ts:72-72](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L72-L72 "Source code on GitHub")

`Given I execute parallel GET to 'myEndpoint' and save the result named 'myResult' within the object 'myObject'`<br><br>
By repeating this statment *n* times it will perform *n* parallel get to *myEndpoint* and store the result in
*myObject.myResult* which will be a dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myEndpoint` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the url's endpoint or the url's endpoint itself
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the get
*   `myObject` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store myResult

### PARALLEL_GET_HEADER

[packages/http/src/actions.ts:84-84](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L84-L84 "Source code on GitHub")

`Given I execute parallel GET to 'myEndpoint' and save the result named 'myResult' within the object 'myObject' with header 'myHeader'`<br><br>
By repeating this statment *n* times it will perform *n* parallel get to *myEndpoint* with header *myHeader* and store the result in
*myObject.myResult* which will be a dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myEndpoint` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the url's endpoint or the url's endpoint itself
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the get
*   `myObject` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store myResult
*   `myHeader` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the header

### PARALLEL_GET_ARRAY

[packages/http/src/actions.ts:94-94](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L94-L94 "Source code on GitHub")

`Given I execute parallel GET to array 'myEndpointArray' and save the result named 'myResult' within the object 'myObject'`<br><br>
Perform parallel get to array *myEndpointArray* and store the result in *myObject.myResult* which will be an array of dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myEndpointArray` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the array of urls' endpoint
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the get
*   `myObject` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store myResult

### PARALLEL_GET_ARRAY_HEADER

[packages/http/src/actions.ts:105-105](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L105-L105 "Source code on GitHub")

`Given I execute parallel GET to array 'myEndpointArray' and save the result named 'myResult' within the object 'myObject' with header 'myHeader'`<br><br>
Perform parallel get to array *myEndpointArray* with header *myHeader* and store the result in *myObject.myResult* which will be an array of dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myEndpointArray` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the array of urls' endpoint
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the get
*   `myObject` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store myResult
*   `myHeader` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the header

### PARALLEL_POST

[packages/http/src/actions.ts:117-117](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L117-L117 "Source code on GitHub")

`Given I execute parallel POST with 'myData' to 'myEndpoint' and save the result named 'myResult' within the object 'myObject'`<br><br>
By repeating this statment *n* times it will perform *n* parallel post to *myEndpoint* with data contained in *myData* and store the result in
*myObject.myResult* which will be an array of dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myData` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the data of the post
*   `myEndpoint` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the url's endpoint
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the post
*   `myObject` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store myResult

### PARALLEL_POST_HEADER

[packages/http/src/actions.ts:130-130](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L130-L130 "Source code on GitHub")

`Given I execute parallel POST with 'myData' to 'myEndpoint' and save the result named 'myResult' within the object 'myObject' with header 'myHeader'`<br><br>
By repeating this statment *n* times it will perform *n* parallel post to *myEndpoint* with data contained in *myData* and header contained in *myHeader* and store the result in
*myObject.myResult* which will be an array of dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myData` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the data of the post
*   `myEndpoint` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the url's endpoint
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the post
*   `myObject` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store myResult
*   `myHeader` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the header

### PARALLEL_POST_ARRAY_WITHIN

[packages/http/src/actions.ts:142-142](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L142-L142 "Source code on GitHub")

`Given I execute parallel POST with 'myData' to array 'myEndpointArray' and save the result named 'myResult' within the object 'myObject'`<br><br>
Perform parallel post to array *myEndpointArray* with data contained in *myData* and store the result in
*myObject.myResult* which will be an array of dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myData` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the data of the post
*   `myEndpointArray` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the array of urls' endpoint
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the post
*   `myObject` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store myResult

### PARALLEL_POST_ARRAY_WITHIN_HEADER

[packages/http/src/actions.ts:155-155](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L155-L155 "Source code on GitHub")

`Given I execute parallel POST with 'myData' to array 'myEndpointArray', with header 'myHeader' and save the result named 'myResult' within the object 'myObject' with header 'myHeader'`<br><br>
Perform parallel post to array *myEndpointArray* with data contained in *myData* and header contained in *myHeader* and store the result in
*myObject.myResult* which will be an array of dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myData` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the data of the post
*   `myEndpointArray` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the array of urls' endpoint
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the post
*   `myObject` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store myResult
*   `myHeader` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the header

### PARALLEL_POST_ARRAY

[packages/http/src/actions.ts:166-166](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L166-L166 "Source code on GitHub")

`Given I execute parallel POST with 'myData' to array 'myEndpointArray' and save the result named 'myResult'`<br><br>
Perform parallel post to array *myEndpointArray* with data contained in *myData* and store the result in
*myResult* which will be an array of dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myData` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the data of the post
*   `myEndpointArray` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the array of urls' endpoint
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the post

### PARALLEL_POST_ARRAY_HEADER

[packages/http/src/actions.ts:178-178](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L178-L178 "Source code on GitHub")

`Given I execute parallel POST with 'myData' to array 'myEndpointArray' with header 'myHeader' and save the result named 'myResult' with header 'myHeader'`<br><br>
Perform parallel post to array *myEndpointArray* with data contained in *myData* and with header contained in *myHeader* and store the result in
*myResult* which will be an array of dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myData` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the data of the post
*   `myEndpointArray` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the array of urls' endpoint
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the post
*   `myHeader` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the header

### PARALLEL_POST_ARRAY_DIFFERENT_DATA

[packages/http/src/actions.ts:189-189](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L189-L189 "Source code on GitHub")

`Given I execute parallel POST with array 'myDataArray' to array 'myEndpointArray' and save the result named 'myResult'`<br><br>
Perform parallel post to array *myEndpointArray* and for the *n-th* endpoint uses the *n-th* entry found in the *myDataArray* as data
and store the result in *myResult* which will be an array of dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myDataArray` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the array of data of the post
*   `myEndpointArray` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the array of urls' endpoint
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the post

### PARALLEL_POST_ARRAY_DIFFERENT_DATA_HEADER

[packages/http/src/actions.ts:201-201](https://github.com/RebeccaSelvaggini/restroom-mw/blob/e28a59c4454e3d0584565b5c9b06c50442468214/packages/http/src/actions.ts#L201-L201 "Source code on GitHub")

`Given I execute parallel POST with array 'myDataArray' to array 'myEndpointArray' and save the result named 'myResult' with header 'myHeader'`<br><br>
Perform parallel post to array *myEndpointArray* with header *myHeader* and for the *n-th* endpoint uses the *n-th* entry found in the *myDataArray* as data
and store the result in *myResult* which will be an array of dictionary with two entries:

*   **status**: will contain the status code
*   **result**: in case of success will contain the result otherwise it is a empty string

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### Parameters

*   `myDataArray` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the array of data of the post
*   `myEndpointArray` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the array of urls' endpoint
*   `myResult` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the varibale where will be store the reuslt of the post
*   `myHeader` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the variable containing the header
