#!/usr/bin/env node
/**
 * Builds a local, GitHub-like preview of README.md and opens it in the browser.
 * Output goes to .cache/preview.html (gitignored) so hero.svg resolves as ../hero.svg.
 *
 * Usage: node scripts/preview.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, '.cache/preview.html');

const body = execFileSync('npx', ['--yes', 'marked', '-i', resolve(root, 'README.md')], {
    encoding: 'utf8'
}).replaceAll('src="hero.svg"', 'src="../hero.svg"');

const css = `
:root {
    color-scheme: dark;
    --bg: #0d1117;
    --fg: #e6edf3;
    --line: #3d444d;
    --link: #4493f8;
    --chip: #151b23;
    --head: #161b22;
}
@media (prefers-color-scheme: light) {
    :root {
        color-scheme: light;
        --bg: #ffffff;
        --fg: #1f2328;
        --line: #d1d9e0;
        --link: #0969da;
        --chip: #f6f8fa;
        --head: #f6f8fa;
    }
}
body {
    margin: 0;
    background: var(--bg);
    color: var(--fg);
    font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}
.markdown-body { max-width: 880px; margin: 0 auto; padding: 32px; }
img { max-width: 100%; }
h2 { margin: 24px 0 16px; padding-bottom: .3em; font-size: 1.5em; border-bottom: 1px solid var(--line); }
h3 { margin: 24px 0 16px; font-size: 1.25em; }
p { margin: 0 0 16px; }
a { color: var(--link); text-decoration: none; }
a:hover { text-decoration: underline; }
sub { font-size: .75em; }
samp { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 85%; }
kbd {
    display: inline-block;
    padding: 4px;
    font: 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    line-height: 10px;
    color: var(--fg);
    vertical-align: middle;
    background: var(--chip);
    border: 1px solid var(--line);
    border-radius: 6px;
    box-shadow: inset 0 -1px 0 var(--line);
}
table { width: 100%; margin-bottom: 16px; border-collapse: collapse; }
th, td { padding: 6px 13px; border: 1px solid var(--line); text-align: left; }
th { background: var(--head); }
`;

mkdirSync(resolve(root, '.cache'), { recursive: true });
writeFileSync(
    output,
    `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>README preview</title>
<style>${css}</style>
<div class="markdown-body">${body}</div>
`
);

execFileSync('open', [output]);
console.log(`preview written to ${output}`);
