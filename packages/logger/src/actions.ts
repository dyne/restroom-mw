export enum Action {
  /**
   * `Then I append the string 'log' to the logfile in 'logPath'`<br><br>
   * Append the string *log* to the logfile in the *logPath* under the *LOGGER_DIR* directory
   * @param {string} log - The name of the variable that contains the log string
   *        or the log string itself
   * @param {string} logPath - Path to the log file
   */
  APPEND = "append the string {} to the logfile in {}",
  /**
   * `Then I append the string 'log' to the logfile named by 'logName'`<br><br>
   * Append the string *log* to the logfile in the variable *logName* under the *LOGGER_DIR* directory
   * @param {string} log - The name of the variable that contains the log string
   *        or the log string itself
   * @param {string} logName - Name of the variable the contains the path to log file
   */
  APPEND_NAMED = "append the string {} to the logfile named by {}",
  /**
   * `Then I append the array of strings 'logArray' to the logfile named by 'logName'`<br><br>
   * Append the array of strings *logArray* to the logfile in the variable *logName* under the *LOGGER_DIR* directory
   * @param {string} logArray - The name of the variable that contains the array of log strings
   * @param {string} logName - Name of the variable the contains the path to log file
   */
  APPEND_ARRAY = "append the array of strings {} to the logfile named by {}"
}
