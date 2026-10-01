import { HttpError } from "./httpError.js";
import { readBody, readOptionalString, readRequiredString, readRouteParam } from "./validate.js";

describe("validate helpers", () => {
  describe("readBody", () => {
    it.each([null, undefined, "text", 1, []])("rejects %p", (value) => {
      expect(() => readBody(value)).toThrow(HttpError);
    });

    it("returns object bodies", () => {
      const body = { text: "Hello" };

      expect(readBody(body)).toBe(body);
    });
  });

  describe("readRequiredString", () => {
    it("returns trimmed strings", () => {
      expect(readRequiredString({ text: "  Hello  " }, "text")).toBe("Hello");
    });

    it.each(["", "   ", undefined, 1])("rejects invalid value %p", (value) => {
      expect(() => readRequiredString({ text: value }, "text")).toThrow(HttpError);
    });
  });

  describe("readOptionalString", () => {
    it("returns undefined for missing and blank strings", () => {
      expect(readOptionalString({}, "title")).toBeUndefined();
      expect(readOptionalString({ title: "   " }, "title")).toBeUndefined();
    });

    it("returns trimmed strings", () => {
      expect(readOptionalString({ title: "  Demo  " }, "title")).toBe("Demo");
    });

    it("rejects non-string values", () => {
      expect(() => readOptionalString({ title: 1 }, "title")).toThrow(HttpError);
    });
  });

  describe("readRouteParam", () => {
    it("returns trimmed route params", () => {
      expect(readRouteParam("  chat-id  ", "chatId")).toBe("chat-id");
    });

    it.each([undefined, "", "   ", ["chat-id"]])("rejects invalid param %p", (value) => {
      expect(() => readRouteParam(value, "chatId")).toThrow(HttpError);
    });
  });
});
