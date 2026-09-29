// Side-effect CSS imports for the @wterm packages.
// The wterm packages ship `import "@wterm/dom/css"` as their public styling
// entry point. They have no `.d.ts` (the resolution target is a stylesheet),
// so TypeScript needs a module declaration to treat them as side-effect
// imports rather than missing modules.

declare module "@wterm/dom/css";
declare module "@wterm/react/css";
declare module "@wterm/ghostty/ghostty-vt.wasm" {
  const url: string;
  export default url;
}