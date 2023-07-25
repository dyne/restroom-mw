export enum Action {
  /**
   * `Given I read the http request`<br><br>
   * Read the http_request that is coming form the outside, it will return
   * a dictionary of the following form:
   * ```
   * {
   *  http_request: {
   *    base_url: '/api/http_request',
   *    headers: {
   *      'accept-encoding': 'gzip, deflate',
   *      connection: 'close',
   *      'content-length': '0',
   *      host: '127.0.0.1:44267'
   *    },
   *    http_version: '1.1',
   *    method: 'POST',
   *    path: '/',
   *    protocol: 'http',
   *    socket: {
   *      local_address: '::ffff:127.0.0.1',
   *      local_port: 44267,
   *      remote_address: '::ffff:127.0.0.1',
   *      remote_family: 'IPv6',
   *      remote_port: 59794
   *    }
   *  }
   * }
   * ```
   */
  READ_REQUEST = "read the http request",
  /**
   * `Given I have a endpoint named 'myEndpoint'`<br><br>
   * Set the endpoint to be used later in the other statements
   * @param {string} myEndpoint - Name of the variable containing the url's endpoint or the url's endpoint itself
   */
  EXTERNAL_CONNECTION = "have a endpoint named {}",
  /**
   * `Given I connect to 'myEndpoint' and save the output into 'myResult'`<br><br>
   * Connect to *myEndpoint* and store the result into *myResult*
   * @param {string} myEndpoint - Name of the variable containing the url's endpoint or the url's endpoint itself
   * @param {string} myResult - Name of the varibale where will be store the reuslt
   */
  EXTERNAL_OUTPUT = "connect to {} and save the output into {}",
  /**
   * `Then I pass the output to 'myEndpoint'`<br><br>
   * Perform a post to *myEndpoint* with data the zencode output
   * @param {string} myEndpoint - Name of the variable containing the url's endpoint or the url's endpoint itself
   */
  PASS_OUTPUT = "pass the output to {}",
  /**
   * `Given I connect to 'myEndpoint' and pass it the content of 'myVariable' and save the output into 'myResult'`<br><br>
   * Perform a post to *myEndpoint* with data contained in *myVariable* and store the result in *myResult* which
   * will be a dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myEndpoint - Name of the variable containing the url's endpoint or the url's endpoint itself
   * @param {string} myVairable - Name of the variable containing the post data
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the post
   */
  POST_AND_SAVE_TO_VARIABLE = "connect to {} and pass it the content of {} and save the output into {}",
  /**
   * `Given I execute parallel GET to 'myEndpoint' and save the result named 'myResult' within the object 'myObject'`<br><br>
   * By repeating this statment *n* times it will perform *n* parallel get to *myEndpoint* and store the result in
   * *myObject.myResult* which will be a dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myEndpoint - Name of the variable containing the url's endpoint or the url's endpoint itself
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the get
   * @param {string} myObject - Name of the varibale where will be store myResult
   */
  PARALLEL_GET = "execute parallel GET to {} and save the result named {} within the object {}",
   /**
   * `Given I execute parallel GET to 'myEndpoint' and save the result named 'myResult' within the object 'myObject' with header 'myHeader'`<br><br>
   * By repeating this statment *n* times it will perform *n* parallel get to *myEndpoint* with header *myHeader* and store the result in
   * *myObject.myResult* which will be a dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myEndpoint - Name of the variable containing the url's endpoint or the url's endpoint itself
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the get
   * @param {string} myObject - Name of the varibale where will be store myResult
   * @param {string} myHeader - Name of the variable containing the header
   */
   PARALLEL_GET_HEADER = "execute parallel GET to {} and save the result named {} within the object {} with header {}",
  /**
   * `Given I execute parallel GET to array 'myEndpointArray' and save the result named 'myResult' within the object 'myObject'`<br><br>
   * Perform parallel get to array *myEndpointArray* and store the result in *myObject.myResult* which will be an array of dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myEndpointArray - Name of the variable containing the array of urls' endpoint
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the get
   * @param {string} myObject - Name of the varibale where will be store myResult
   */
  PARALLEL_GET_ARRAY = "execute parallel GET to array {} and save the result named {} within the object {}",
    /**
   * `Given I execute parallel GET to array 'myEndpointArray' and save the result named 'myResult' within the object 'myObject' with header 'myHeader'`<br><br>
   * Perform parallel get to array *myEndpointArray* with header *myHeader* and store the result in *myObject.myResult* which will be an array of dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myEndpointArray - Name of the variable containing the array of urls' endpoint
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the get
   * @param {string} myObject - Name of the varibale where will be store myResult
   * @param {string} myHeader - Name of the variable containing the header
   */
    PARALLEL_GET_ARRAY_HEADER = "execute parallel GET to array {} and save the result named {} within the object {} with header {}",
  /**
   * `Given I execute parallel POST with 'myData' to 'myEndpoint' and save the result named 'myResult' within the object 'myObject'`<br><br>
   * By repeating this statment *n* times it will perform *n* parallel post to *myEndpoint* with data contained in *myData* and store the result in
   * *myObject.myResult* which will be an array of dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myData - Name of the variable containing the data of the post
   * @param {string} myEndpoint - Name of the variable containing the url's endpoint
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the post
   * @param {string} myObject - Name of the varibale where will be store myResult
   */
  PARALLEL_POST = "execute parallel POST with {} to {} and save the result named {} within the object {}",
  /**
   * `Given I execute parallel POST with 'myData' to 'myEndpoint' and save the result named 'myResult' within the object 'myObject'`<br><br>
   * By repeating this statment *n* times it will perform *n* parallel post to *myEndpoint* with data contained in *myData* and header contained in *myHeader* and store the result in
   * *myObject.myResult* which will be an array of dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myData - Name of the variable containing the data of the post
   * @param {string} myEndpoint - Name of the variable containing the url's endpoint
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the post
   * @param {string} myObject - Name of the varibale where will be store myResult
   * @param {string} myHeader - Name of the variable containing the header
   */
  PARALLEL_POST_HEADER = "execute parallel POST with {} to {} and save the result named {} within the object {} with header {}",
  /**
   * `Given I execute parallel POST with 'myData' to array 'myEndpointArray' and save the result named 'myResult' within the object 'myObject'`<br><br>
   * Perform parallel post to array *myEndpointArray* with data contained in *myData* and store the result in
   * *myObject.myResult* which will be an array of dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myData - Name of the variable containing the data of the post
   * @param {string} myEndpointArray - Name of the variable containing the array of urls' endpoint
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the post
   * @param {string} myObject - Name of the varibale where will be store myResult
   */
  PARALLEL_POST_ARRAY_WITHIN = "execute parallel POST with {} to array {} and save the result named {} within the object {}",
  /**
   * `Given I execute parallel POST with 'myData' to array 'myEndpointArray', with header 'myHeader' and save the result named 'myResult' within the object 'myObject'`<br><br>
   * Perform parallel post to array *myEndpointArray* with data contained in *myData* and store the result in
   * *myObject.myResult* which will be an array of dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myData - Name of the variable containing the data of the post
   * @param {string} myEndpointArray - Name of the variable containing the array of urls' endpoint
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the post
   * @param {string} myObject - Name of the varibale where will be store myResult
   * @param {string} myHeader - Name of the variable containing the header
   */
  PARALLEL_POST_ARRAY_WITHIN_HEADER = "execute parallel POST with {} to array {} and save the result named {} within the object {} with header {}",
  /**
   * `Given I execute parallel POST with 'myData' to array 'myEndpointArray' and save the result named 'myResult'`<br><br>
   * Perform parallel post to array *myEndpointArray* with data contained in *myData* and store the result in
   * *myResult* which will be an array of dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myData - Name of the variable containing the data of the post
   * @param {string} myEndpointArray - Name of the variable containing the array of urls' endpoint
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the post
   */
  PARALLEL_POST_ARRAY = "execute parallel POST with {} to array {} and save the result named {}",
   /**
   * `Given I execute parallel POST with 'myData' to array 'myEndpointArray' with header 'myHeader' and save the result named 'myResult'`<br><br>
   * Perform parallel post to array *myEndpointArray* with data contained in *myData* and store the result in
   * *myResult* which will be an array of dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myData - Name of the variable containing the data of the post
   * @param {string} myEndpointArray - Name of the variable containing the array of urls' endpoint
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the post
   * @param {string} myHeader - Name of the variable containing the header
   */
   PARALLEL_POST_ARRAY_HEADER = "execute parallel POST with {} to array {} and save the result named {} with header {}",
  /**
   * `Given I execute parallel POST with array 'myDataArray' to array 'myEndpointArray' and save the result named 'myResult'`<br><br>
   * Perform parallel post to array *myEndpointArray* and for the *n-th* endpoint uses the *n-th* entry found in the *myDataArray* as data
   * and store the result in *myResult* which will be an array of dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myDataArray - Name of the variable containing the array of data of the post
   * @param {string} myEndpointArray - Name of the variable containing the array of urls' endpoint
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the post
   */
  PARALLEL_POST_ARRAY_DIFFERENT_DATA = "execute parallel POST with array {} to array {} and save the result named {}",
    /**
   * `Given I execute parallel POST with array 'myDataArray' to array 'myEndpointArray', with header 'myHeader' and save the result named 'myResult'`<br><br>
   * Perform parallel post to array *myEndpointArray* and for the *n-th* endpoint uses the *n-th* entry found in the *myDataArray* as data
   * and store the result in *myResult* which will be an array of dictionary with two entries:
   * * **status**: will contain the status code
   * * **result**: in case of success will contain the result otherwise it is a empty string
   * @param {string} myDataArray - Name of the variable containing the array of data of the post
   * @param {string} myEndpointArray - Name of the variable containing the array of urls' endpoint
   * @param {string} myResult - Name of the varibale where will be store the reuslt of the post
   * @param {string} myHeader - Name of the variable containing the header
   */
  PARALLEL_POST_ARRAY_DIFFERENT_DATA_HEADER = "execute parallel POST with array {} to array {} and save the result named {} with header {}",

}
