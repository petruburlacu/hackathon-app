import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("writes the header and rows with CRLF line ends", () => {
    expect(toCsv(["rank", "team"], [[1, "Rabbits"]])).toBe(
      "rank,team\r\n1,Rabbits\r\n",
    );
  });

  it("quotes a value containing a comma", () => {
    expect(toCsv(["team"], [["Cats, Dogs"]])).toBe('team\r\n"Cats, Dogs"\r\n');
  });

  it("doubles quotes and quotes values with quotes or newlines", () => {
    expect(toCsv(["title"], [['The "best" one'], ["two\nlines"]])).toBe(
      'title\r\n"The ""best"" one"\r\n"two\nlines"\r\n',
    );
  });

  it("neutralises text that a spreadsheet would run as a formula", () => {
    expect(toCsv(["team"], [["=HYPERLINK(1)"], ["@cmd"], ["-1+2"]])).toBe(
      'team\r\n"\'=HYPERLINK(1)"\r\n"\'@cmd"\r\n"\'-1+2"\r\n',
    );
  });

  it("leaves negative numbers alone", () => {
    expect(toCsv(["n"], [[-3]])).toBe("n\r\n-3\r\n");
  });
});
