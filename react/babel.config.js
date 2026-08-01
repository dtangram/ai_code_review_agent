// This config is used by Jest only (via babel-jest) — Vite's own build
// doesn't go through Babel at all. It exists specifically so Jest can parse
// two things Vite handles natively but plain Node/Jest can't:
//   1. `import.meta.env.*` — rewritten to `process.env.*` by
//      babel-plugin-transform-vite-meta-env, since `import.meta` has no
//      meaning outside a real ES module and throws a SyntaxError under Jest's
//      CommonJS test runner otherwise.
//   2. TypeScript + JSX syntax, via the standard presets.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: ['transform-vite-meta-env'],
};
