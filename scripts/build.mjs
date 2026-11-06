import { readFile, mkdir, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const { version } = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const clean = text => text.replace(/[ \t]+(?=\r?$)/gm, "");
const source = clean(await readFile(new URL("src/treezle.js", root), "utf8"));
const styles = clean(await readFile(new URL("src/treezle.css", root), "utf8"));
const builtAt = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
const banner = `/*! TreezleJS v${version} | built ${builtAt} | (c) 2026 Micha Sulman | MIT License */\n`;

await mkdir(new URL("dist/", root), { recursive: true });
await writeFile(new URL("dist/treezle.iife.js", root), banner + source);
await writeFile(new URL("dist/treezle.es.js", root), banner + source + "\nconst TreeView = globalThis.TreeView;\nexport { TreeView };\nexport default TreeView;\n");
// Icons belong to the host app; do not ship a broken import of a missing remixicon.css.
await writeFile(new URL("dist/treezle.css", root), banner + styles.replace(/^@import url\("\.\.\/remixicon\.css"\);\r?\n/m, ""));
console.log("Built dist/treezle.iife.js, dist/treezle.es.js and dist/treezle.css");
