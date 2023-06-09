enum Action {
  /**
   * `Given I have a redis connection on 'redis_url'`<br><br>
   * Connect to redis database at url *redis_url*
   * @param {string} redis_url - Connection url
   */
  CONNECT = "have a redis connection on {}",
  /**
   * `Then I write data into redis under the key 'myKey'`<br><br>
   * Write into redis the zencode output under the key *myKey*
   * @param {string} myKey - Name of the variable containing the key or the key itself
   */
  SET = "write data into redis under the key {}",
  /**
   * `Given I read from redis the data under the key 'myKey' and save the output into 'myVariable'`<br><br>
   * Read from redis the data under the key *myKey* and save them in the data under the variable *myVariable*
   * @param {string} myKey - Name of the variable containing the key or the key itself
   * @param {string} myVariable - Name of the variable where will be store the result
   */
  GET = `read from redis the data under the key {} and save the output into {}`,
  /**
   * `Given/Then I write data into redis under the key named by 'myKey'`<br><br>
   * Write into redis the zencode output under the key named by *myKey*
   * @param {string} myKey - Name of the variable containing the key
   */
  SET_NAMED = "write data into redis under the key named by {}",
  /**
   * `Given I read from redis the data under the key named 'myKey' and save the output into 'myVariable'`<br><br>
   * Read from redis the data under the key *myKey* and save them in the data under the variable *myVariable*
   * @param {string} myKey - Name of the variable containing the key or the key itself
   * @param {string} myVariable - Name of the variable where will be store the result
   */
  GET_NAMED = `read from redis the data under the key named {} and save the output into {}`,
  /**
   * `Given I read from redis the data under the key containing 'pattern' and save the output into 'myVariable'`<br><br>
   * Read from redis the data under the keys that contains the pattern *pattern* and save the result in the data under the variable *myVariable*
   * @param {string} pattern - Name of the variable containing the pattern or the pattern itself
   * @param {string} myVariable - Name of the the variable where will be store the result
   */
  GET_KEYS_CONTAIN = "read from redis the data under the keys containing {} and save the output into {}",
  /**
   * `Then I write 'myVariable' into redis under the key named by 'myKey'`<br><br>
   * Write into redis the value of *myVariable* under the key named by *myKey*
   * @param {string} myVariable - Name of the variable containing the data to be stored
   * @param {string} myKey - Name of the the variable containing the key
   */
  SET_OBJECT_NAMED = "write {} into redis under the key named by {}",
  /**
   * `Given I read into 'myVariable' and increment the key named by 'myKey'`<br><br>
   * Read from redis the data under the key *myKey*, save the result in the data under the variable *myVariable*
   * and increment the value of the data under *myKey* of one.
   * @param {string} myVariable - Name of the variable where will be store the result
   * @param {string} key - Name of the variable containing the key or the key itself
   */
  INCREMENT = "read into {} and increment the key named by {}",
  /**
   * `Then I remove the key 'myKey' in redis`<br><br>
   * Remove the data under the key *myKey* on redis
   * @param {string} myKey - Name of the variable containing the key
   */
  DEL = `remove the key {} in redis`,
}
