export enum Action {
  /**
   * `Then I download the 'myUrl' and extract it into 'myFolder'`<br><br>
   * Download a zip file located at the url *myUrl* and extract it at the path
   * *myFolder*  under the *FILES_DIR* on the server.
   * @param {string} myUrl - Name of the variable containing the url
   * @param {string} myFolder - Name of the variable containing the path to
   *        the folder where the data will be stored
   */
  DOWNLOAD = "download the {} and extract it into {}",
  /**
   * `Then I store 'myVariable' in the file 'myFile'`<br><br>
   * Store the content of the variable *myVariable* in the filesystem at the path
   * *myFile* under the *FILES_DIR* directory on the server
   * @param {string} myVariable - Name of the variable containing the data to be stored
   * @param {string} myFile - Name of the variable containing the path to the file where
   *        the data will be stored
   */
  STORE_RESULT = "store {} in the file {}",
  /**
   * `Given I read the content of 'myFile'`<br><br>
   * write the content of *myFile*, found under the *FILES_DIR* directory, in the data
   * @param {string} myFile - It can be the name of the variable that contains the path
   *        to the file or the path itself
   */
  READ = "read the content of {}",
  /**
   * `Given I read the content of 'myFile' and save the output into 'myVariable'`<br><br>
   * Write the content of *myFile* in the data under the key *myVariable*
   * @param {string} myFile - It can be the name of the variable that contains the path
   *        to the file or the path itself
   * @param {string} myVariable - Name of the variable where the content of the file will be stored
   */
  READ_AND_SAVE = "read the content of {} and save the output into {}",
  /**
   * `Given I list the content of directory 'dir_path' as 'dir_result'`<br><br>
   * Write the list of objects found in *dir_path*, under the *FILES_DIR* directory, in the data,
   * the result is an array of dictionaries whose structure is:
   * ```
   * {
   * atime: '2022-06-13T07:00:34.870Z',
   * birthtime: '2022-06-13T07:00:34.870Z',
   * blksize: 4096,
   * blocks: 8,
   * ctime: '2022-08-09T11:09:22.718Z',
   * dev: 2055,
   * gid: 1000,
   * mode: '40755',
   * mtime: '2022-08-09T11:09:22.718Z',
   * name: 'zencode',
   * nlink: 6,
   * size: 4096,
   * uid: 1000
   * }
   * ```
   * In particular, if `mode` starts with `40` the current item is a directory
   *
   * @param {string} dir_path - Variable name containing the path to the directory
   *        under the *FILES_DIR* directory
   * @param {string} dir_result - Name of the variable where the result will be stored
   */
  LS = "list the content of directory {} as {}",
}
