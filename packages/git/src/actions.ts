export enum Action {
  /**
   * Verify that the given directory is a git repository
   * (i.e. it exists the .git directory)
   */
  VERIFY = "verify the path {} is a git repository",
  /**
   * Clone the repository in the specified directory under
   * the `FILES_DIR` directory
   */
  CLONE = "clone the repository {} in {}",
  /**
   * Add files to a local repository and
   * create a commit in the repository
   */
  COMMIT = "make a new commit to the git repository in {}",
}
