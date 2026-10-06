import { describe, test, expect } from "vitest";
import { readFile } from "fs/promises";
import { TurtleDoc } from "@nbittich/tortank-wasm";

const INPUT_DIR = "turtle_parser/examples";
const DEFAULT_WELL_KNOWN_PREFIX = "http://data.lblod.info/.well-known/genid#";

const CASES = [
  ["0001", "EQ: complex document with blank nodes, nested objects, etc"],
  ["0002", "EQ: another complex document"],
  ["0003", "EQ: could not parse completely"],
  ["0006", "EQ: complex string with spaces"],
  ["0007", "EQ: complex string with spaces but more complex"],
  ["0008", "EQ: simple doc with comments etc"],
  ["0009", "EQ: test simple blank nodes (unlabeled)"],
  ["0010", "EQ: test simple xsd:time"],
  ["0011", "EQ: test simple parsing"],
  ["0012", "EQ: test simple parsing multi comments"],
  ["0013", "EQ: test labeled bnode error"],
  ["0014", "EQ: a bit of everything (list, bnode, nested unlabeled bnode etc)"],
  ["0015", "EQ: test simple collections"],
  ["0016", "EQ: test date 2000-01-12T12:13:14Z"],
  ["0017", "EQ: test date 2002-10-10+13:00"],
  ["0018", "EQ: test date 2002-10-10T00:00:00+13"],
  ["0019", "EQ: test date 2002-10-09T11:00:00Z"],
  ["0020", "EQ: test date 2002-10-10T00:00:00+05:00"],
  ["0021", "EQ: test date 2002-10-09T19:00:00Z"],
  ["0022", "EQ: test date 2002-09-29"],
  ["0023", "EQ: test date 20-09-2021"],
  ["0024", "EQ: test date 09/20/2021"],
  ["0025", "EQ: test date 20/09/2012"],
  ["0026", "EQ: test date 2023-08-30T10:31:00.080Z"],
  ["0028", "EQ: all the different ways of writing IRIs in Turtle"],
  ["0029", "EQ: Simple base example"],
  ["0030", "EQ: empty STRING_LITERAL_LONG_QUOTE"],
  ["0031", "EQ: alt quotes"],
  ["0032", "EQ: test dateTime 2025-04-15T12:00:00Z"],
  ["0033", "Could not parse"],
];

const makeUuidGen = () => {
  let n = 1;
  return () => `${n++}`;
};

const parseTTL = async (path) =>
  TurtleDoc.parse(
    await readFile(path, "utf8"),
    DEFAULT_WELL_KNOWN_PREFIX,
    makeUuidGen(),
  );

async function cmpInputFile(name) {
  const actual = await parseTTL(`${INPUT_DIR}/input/${name}.ttl`);

  const expected = await parseTTL(`${INPUT_DIR}/output/${name}.ttl`);

  expect(
    actual.difference(expected).isEmpty(),
    "Actual contains unexpected triples that are not present in expected:\n " +
      actual.difference(expected).toString(),
  ).toBe(true);

  expect(
    expected.difference(actual).isEmpty(),
    "Expected triples are missing from actual:\n " +
      expected.difference(actual).toString(),
  ).toBe(true);
}

describe("turtle_doc", () => {
  // vitest runs tests within a file sequentially by default (no #[serial] needed)
  test.each(
    CASES.map(([name, desc]) => ({
      name,
      title: `${desc} : ${name}`,
    })),
  )("$title", async ({ name }) => {
    await cmpInputFile(name);
  });
});
