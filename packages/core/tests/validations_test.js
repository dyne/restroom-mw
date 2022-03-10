import test from "ava";
process.env.ZENCODE_DIR = "./test/fixtures";

const {
  validateStartBlock,
  validateNextBlock,
<<<<<<< HEAD
  validateIterable,
  validateForEach,
  validateZenFile,
  validatePathsInYml,  
  validateNoLoopInChain,
=======
  validateIfIterable,
  validateForEach,
  validateZenFile
>>>>>>> ef21e30 (added tests for validations)
} = require("../dist/validations");

test("validateStartBlock works correctly if startBlock is null", (t) => {

  const ymlContent = {
    data: { inputData: "iwillbechanged", otherStuff: "other" },
  };

  const error = t.throws(() => {
    validateStartBlock(null, ymlContent);
  });

  t.is(error.message, 'Yml is incomplete. Start (start:) first level definition is missing!');
});

test("validateStartBlock works correctly if startBlock is not present", (t) => {

  const ymlContent = {
    blocks: { inputData: "iwillbechanged", otherStuff: "other" },
  };
  const startBlock = 'Imnotpresent';

  const error = t.throws(() => {
    validateStartBlock(startBlock, ymlContent);
  });

  t.is(error.message, 'Please check your yml. Start (start:) is pointing nowhere!');
});

test("validateNextBlock works correctly if nextBlock is not present", (t) => {

  const ymlContent = {
    blocks: { inputData: "iwillbechanged", otherStuff: "other" },
  };
  const nextBlock = 'Imnotpresent';
  const currentBlock = 'currentBlock';

  const error = t.throws(() => {
    validateNextBlock(nextBlock, currentBlock, ymlContent);
  });

  t.is(error.message, 'Please check your yml. Next (next:) is pointing nowhere for current block currentBlock!');
});

<<<<<<< HEAD
test("validateIterable works correctly if forEachObject is not iterable", (t) => {
=======
test("validateIfIterable works correctly if forEachObject is not iterable", (t) => {
>>>>>>> ef21e30 (added tests for validations)

  const forEachObject = 18;
  const forEachObjectName = 'myList';
  const block = 'currentBlock';

  const error = t.throws(() => {
<<<<<<< HEAD
    validateIterable(forEachObject, forEachObjectName, block);
=======
    validateIfIterable(forEachObject, forEachObjectName, block);
>>>>>>> ef21e30 (added tests for validations)
  });

  t.is(error.message, 'For each object with name:myList defined for the block: currentBlock is not an iterable object');
});

test("validateForEach works correctly if forEachObject is null", (t) => {

  const forEachObject = null;
  const forEachObjectName = 'myList';
  const block = 'currentBlock';

  const error = t.throws(() => {
    validateForEach(forEachObject, forEachObjectName, block);
  });

  t.is(error.message, 'For each object with name:myList defined for the block: currentBlock is null or undefined');
});

test("validateForEach works correctly if forEachObject is undefined", (t) => {

  const forEachObject = undefined;
  const forEachObjectName = 'myList';
  const block = 'currentBlock';

  const error = t.throws(() => {
    validateForEach(forEachObject, forEachObjectName, block);
  });

  t.is(error.message, 'For each object with name:myList defined for the block: currentBlock is null or undefined');
});

test("validateZenFile works correctly if forEachObject is undefined", (t) => {

  const singleContext = {
    whatever: "whatever"
  }
  const block = 'currentBlock';

  const error = t.throws(() => {
    validateZenFile(singleContext, block);
  });

  t.is(error.message, 'Zen file is missing for block id: currentBlock');
<<<<<<< HEAD
});

test("validatePathsInYml works correctly if different paths are present", (t) => {

  const ymlContent = {
    blocks:{
      "id-0":{
        zenFile: "path1/to/file.zen"
      },
      "id-1":{
        zenFile: "path2/to/file.zen"
      },
    }
  }

  const error = t.throws(() => {
    validatePathsInYml(ymlContent);
  });

  t.is(error.message, 'Permission Denied. The paths in the yml cannot be different');
});

test("validateNoLoopInChain works correctly if a loop is present", (t) => {

  const ymlContent = {
    start: "id-0",
    blocks:{
      "id-0":{
        zenFile: "path1/to/file.zen",
        next: "id-1"
      },
      "id-1":{
        zenFile: "path2/to/file.zen",
        next: "id-0"
      },
    }
  }

  const error = t.throws(() => {
    validateNoLoopInChain(ymlContent.start, ymlContent);
  });

  t.is(error.message, 'Loop detected in chain. Execution is aborted!');
});

=======
});
>>>>>>> ef21e30 (added tests for validations)
