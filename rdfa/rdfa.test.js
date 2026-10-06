import { describe, test, expect } from "vitest";
import { readFile } from "fs/promises";
import { TurtleDoc } from "@nbittich/tortank-wasm";
import { html_to_rdfa } from "@nbittich/rdfa-wasm";
import RDFA_CORE from "./suites/rdfa_core";
import RDFA_PRIMER from "./suites/rdfa_primer";
import RDFA_OTHER from "./suites/rdfa_other";
import RDFA_HTML5 from "./suites/rdfa_html5";

const suites = [RDFA_CORE, RDFA_PRIMER, RDFA_OTHER, RDFA_HTML5];

const DEFAULT_WELL_KNOWN_PREFIX = "http://data.lblod.info/.well-known/genid#";

const makeUuidGen = () => {
  let n = 0;
  return () => {
    n += 1;
    return `${n}`;
  };
};

async function cmpFiles(name, dir, base) {
  const html = await readFile(`${dir}/${name}.html`, "utf8");

  const expected = TurtleDoc.parse(
    await readFile(`${dir}/${name}.ttl`, "utf8"),
    DEFAULT_WELL_KNOWN_PREFIX,
    makeUuidGen(),
  );

  const rdfa = html_to_rdfa(html, base, "", makeUuidGen());

  const actual = TurtleDoc.parse(
    rdfa,
    DEFAULT_WELL_KNOWN_PREFIX,
    makeUuidGen(),
  );

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

for (const suite of suites) {
  describe(suite.name, () => {
    const cases = suite.tests.map(([name, desc]) => ({
      name,
      title: `${desc} : ${suite.prefix}_${name.replace("example", "")}`,
    }));

    test.each(cases)("$title", async ({ name }) => {
      await cmpFiles(name, suite.dir, suite.base);
    });
  });
}
