import "@testing-library/jest-dom/jest-globals";

import type { expect } from "@jest/globals";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

type JestDomExpected = ReturnType<typeof expect.stringContaining>;

declare module "expect" {
  interface Matchers<R extends void | Promise<void>, T = unknown> extends TestingLibraryMatchers<
    JestDomExpected,
    R
  > {
    readonly __jestDomMatcherTarget?: T;
  }
}
