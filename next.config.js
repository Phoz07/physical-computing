/**
 * Explicitly set Turbopack root to the Next.js app directory so Next doesn't
 * infer the workspace root when multiple lockfiles are present.
 */
module.exports = {
  turbopack: {
    root: './apps/frontend',
  },
};
