import { describe, expect, it } from "vitest";
import {
  cleanText,
  exposeCommentedHtml
} from "../src/utils/textUtils.js";

describe("cleanText", () => {
  it("normalizes whitespace and nonbreaking spaces", () => {
    expect(cleanText("  When\n\t was\u00a0Tal?  ")).toBe(
      "When was Tal?"
    );
  });
});

describe("exposeCommentedHtml", () => {
  it("exposes markup inside HTML comments", () => {
    expect(exposeCommentedHtml("<!--<h3>Question?</h3>-->")).toBe(
      "<h3>Question?</h3>"
    );
  });
});
