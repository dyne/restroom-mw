export enum Action {
  /**
   * `Given I verify the path 'myFolder' is a git repository`<br><br>
   * Verify that the directory defined by the path *myFolder*, under the *FILES_DIR*
   * directory, is a git repository (i.e. it exists the .git directory)
   * @param {string} myFolder - Name of the variable containing the path
   *        or the path itself
   */
  VERIFY = "verify the path {} is a git repository",
  /**
   * `Given I clone the repository 'myRepo' in 'myDirectory'`<br><br>
   * Clone the repository *myRepo* in the specified directory *myDirectory* under
   * the *FILES_DIR* directory
   * @param {string} myRepo - Name of the variable containing the repository url
   *        or the repository url itself
   * @param {string} myDirectory - Name of the variable containing the path
   *        or the path itself where the repo will be cloned
   */
  CLONE = "clone the repository {} in {}",
  /**
   * `Then make a new commit to the git repository in 'myDirectory'`<br><br>
   * Add files to a local repository *myDirectory* and create a commit in the repository,
   * the commit that will be created is passed in the data or in the output as:
   * ```json
   * {"commit": {
   *   "message": "My interesting random file",
   *   "author": "restroom",
   *   "email": "restroom@dyne.org",
   *   "files": ["interestingFile.txt"]
   * }}
   * ```
   * @param {string} myDirectory - Name of the variable containing the path to the
   *        local repository or the path itself
   */
  COMMIT = "make a new commit to the git repository in {}",
}
