// orval emits extensionless relative specifiers (`export * from "./article"`,
// `import type { X } from "./article"`), which is fine under the repo's
// "bundler" moduleResolution for typechecking, but breaks at runtime when the
// compiled output is executed directly by Node's native ESM loader (as
// backend's Vercel deployment does for @workspace/api-zod) — Node requires
// the explicit ".js" extension. Run this after every `orval` codegen pass to
// patch the generated sources back to something Node can actually load.
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import path from "path";

function listTsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listTsFiles(full));
    } else if (entry.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

function fixExtensions(dir) {
  let changed = 0;
  for (const file of listTsFiles(dir)) {
    const content = readFileSync(file, "utf8");
    const fixed = content
      .replace(/^(export \* from ["'])(\.[^"']+)(["'];)$/gm, (m, pre, spec, post) =>
        /\.(js|json)$/.test(spec) ? m : `${pre}${spec}.js${post}`
      )
      .replace(/^(import type \{[^}]+\} from ["'])(\.[^"']+)(["'];)$/gm, (m, pre, spec, post) =>
        /\.(js|json)$/.test(spec) ? m : `${pre}${spec}.js${post}`
      );
    if (fixed !== content) {
      writeFileSync(file, fixed);
      changed++;
    }
  }
  console.log(`fix-esm-extensions: patched ${changed} file(s) under ${dir}`);
}

const root = path.resolve(import.meta.dirname, "..", "..", "..");
fixExtensions(path.resolve(root, "packages", "api-zod", "src"));
fixExtensions(path.resolve(root, "packages", "api-client-react", "src"));
