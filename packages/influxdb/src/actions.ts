export enum Action {
  /**
   * `Given I connect to influxdb with the connection object named 'influx'`<br><br>
   * Connect to influxdb at *influx.url* under the organization *influx.org*
   * using the token API *influx.token*
   * @param {Object} influx - A dictionary of the form `{token: string, url: string, org: string}`
   */
  FLUX_CONNECT = "connect to influxdb with the connection object named {}",
  /**
   * `Given I execute the flux query named 'query' and save the output into 'result'`<br><br>
   * Execute the flux query *query* and store the result in the data under the variable *result*
   * @param {string} query - The variable name that contains the flux query
   * @param {string} result - The variable name that will contain the result of the query
   */
  FLUX_QUERY = "execute the flux query named {} and save the output into {}",
  /**
   * `Given I execute the array of flux queries named 'query_array' and save the output into 'result'`<br><br>
   * Execute the array of flux queries *query_array* and store the result in the data under the variable *result*
   * @param {string} query_array - The variable name that contains the array of flux queries
   * @param {string} result - The variable name that will contain the result of the queries
   */
  FLUX_QUERY_ARRAY = "execute the array of flux queries named {} and save the output into {}",
}
