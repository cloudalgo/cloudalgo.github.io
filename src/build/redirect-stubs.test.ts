import { describe, it, expect } from 'vitest';
import { unblockRedirectStub } from './redirect-stubs';

/** Byte-for-byte what astro/dist/core/routing/3xx.js emits for a 301. */
const stub = (to: string) => `<!doctype html>
<title>Redirecting to: ${to}</title>
<meta http-equiv="refresh" content="0;url=${to}">
<meta name="robots" content="noindex">
<link rel="canonical" href="https://cloudalgo.com${to}">
<body>
\t<a href="${to}">Redirecting to <code>${to}</code></a>
</body>`;

describe('unblockRedirectStub', () => {
  it('removes the noindex from a generated stub', () => {
    const out = unblockRedirectStub(stub('/blog/new-slug/'));
    expect(out).not.toBeNull();
    expect(out).not.toContain('noindex');
  });

  it('keeps the refresh and the canonical, which carry the signal', () => {
    const out = unblockRedirectStub(stub('/blog/new-slug/'))!;
    expect(out).toContain('<meta http-equiv="refresh" content="0;url=/blog/new-slug/">');
    expect(out).toContain('<link rel="canonical" href="https://cloudalgo.com/blog/new-slug/">');
  });

  it('changes nothing else about the stub', () => {
    const original = stub('/about/');
    const out = unblockRedirectStub(original)!;
    expect(out).toBe(original.replace('<meta name="robots" content="noindex">\n', ''));
  });

  it('leaves a real page alone, so nothing is rewritten by accident', () => {
    const page = `<!doctype html><html><head>
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://cloudalgo.com/about/"></head><body>copy</body></html>`;
    expect(unblockRedirectStub(page)).toBeNull();
  });

  it('leaves the 404 page indexable-flagged as Base.astro wrote it', () => {
    // Base.astro emits `noindex, follow` -- a different string, and on a page
    // with no refresh tag. Both guards have to miss it.
    const notFound = `<!doctype html><html><head>
<meta name="robots" content="noindex, follow"></head><body>404</body></html>`;
    expect(unblockRedirectStub(notFound)).toBeNull();
  });

  it('returns null for a stub that has already been rewritten', () => {
    const once = unblockRedirectStub(stub('/contact/'))!;
    expect(unblockRedirectStub(once)).toBeNull();
  });
});
