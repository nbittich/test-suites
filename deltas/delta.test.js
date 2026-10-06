import { TurtleDoc } from "@nbittich/tortank-wasm";
import { readFile } from "fs/promises";
import { createReadStream } from "fs";
import { json } from "stream/consumers";
import { describe, it, expect } from "vitest";

async function buildTurtleDocumentFromDelta() {
  const deltaFiles = await Promise.all(
    [1, 2, 3, 4, 5, 6, 7]
      .map((n) => `deltas/examples/${n}.json`)
      .map(async (fileName) => json(createReadStream(fileName))),
  );
  const inserts = deltaFiles.flat().flatMap(({ inserts }) => inserts);
  return TurtleDoc.fromJSON(inserts);
}

describe("delta files", () => {
  it("merges the inserts of all delta files into the expected turtle", async () => {
    const actual = await buildTurtleDocumentFromDelta();

    const expected = TurtleDoc.parse(
      await readFile("deltas/examples/expected.ttl", {
        encoding: "utf-8",
      }),
    );

    const unexpected = actual.difference(expected);
    const missing = expected.difference(actual);

    expect(
      unexpected.isEmpty(),
      `Actual contains triples not present in expected:\n${unexpected.toString()}`,
    ).toBe(true);
    expect(
      missing.isEmpty(),
      `Expected triples are missing from actual:\n${missing.toString()}`,
    ).toBe(true);
  });
});
