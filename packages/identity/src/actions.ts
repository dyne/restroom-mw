export enum Action {
  /**
   * `Given I resolve the did 'myDid' from 'myUrl' and save the output into 'myOutput'`<br><br>
   * Resolve 'myDid' using the resolver in 'myUrl' and save the resolved did json inside 'myOutput'
   * @param {string} myDid - Name of the variable containing the did to be resolved
   * @param {string} myUrl - Name of the variable containing the url of the resolver
   * @param {string} myOutput - Name of the variable where the output json will be stored
   */
  RESOLVE_DID = "Given I resolve the did {} from {} and save the output into {}",
}
