export enum Action {
  READ_REQUEST = "read the http request",
  EXTERNAL_CONNECTION = "have a endpoint named {}",
  EXTERNAL_OUTPUT = "connect to {} and save the output into {}",
  PASS_OUTPUT = "pass the output to {}",
  POST_AND_SAVE_TO_VARIABLE = "connect to {} and pass it the content of {} and save the output into {}",
  PARALLEL_GET = "execute parallel GET to {} and save the result named {} within the object {}",
  PARALLEL_GET_ARRAY = "execute parallel GET to array {} and save the result named {} within the object {}",
  PARALLEL_POST = "execute parallel POST with {} to {} and save the result named {} within the object {}",
  PARALLEL_POST_ARRAY_WITHIN = "execute parallel POST with {} to array {} and save the result named {} within the object {}",
  PARALLEL_POST_ARRAY = "execute parallel POST with {} to array {} and save the result named {}",
  PARALLEL_POST_ARRAY_DIFFERENT_DATA = "execute parallel POST with array {} to array {} and save the result named {}",
}
