import test from "ava";
process.env.ZENCODE_DIR = "./test/fixtures";

const {
  validateStartBlock,
  validateNextBlock,
  validateIfIterable,
  validateForEach,
  validateZenFile
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

test("validateIfIterable works correctly if forEachObject is not iterable", (t) => {

  const forEachObject = 18;
  const forEachObjectName = 'myList';
  const block = 'currentBlock';

  const error = t.throws(() => {
    validateIfIterable(forEachObject, forEachObjectName, block);
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
});