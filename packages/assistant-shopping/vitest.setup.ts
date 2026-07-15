import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement Element.scrollTo — ChatShell calls it to auto-scroll
// the message history. No-op polyfill so component effects don't throw in tests.
Element.prototype.scrollTo = () => {}
