import "@testing-library/jest-dom";

// Polyfill crypto.randomUUID for JSDOM
if (!globalThis.crypto?.randomUUID) {
  let counter = 0;
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () => `mock-uuid-${++counter}`,
    },
    configurable: true,
  });
}
