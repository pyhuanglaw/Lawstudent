#!/usr/bin/env node
/* 把一個資料檔（src/data/*.js）在 Node 載起來，印出某個全域常數底下每一個字串（和函式原始碼）的路徑 → 值（JSON）。
   覆蓋層工具（tools/invite/apply_overlay.py、tools/msg/apply_overlay.py）用來「照 at 找那一格」「換完以後舊句一個不剩」。
   路徑寫法＝AA 稿的 at：people.heroine_01.walk.any[2].l[0]（名字用 .key、陣列用 [i]；不是識別字的 key 用 ["…"]）。
   同一個物件掛在好幾個地方（例：invites.js 的 walk118 組進 people.<id>.walk）＝每個路徑都列；函式＝'ƒ'＋原始碼。
   用法：node tools/invite/js_leaves.js <檔案> <全域常數名> [輸出檔]（沒有輸出檔＝印到 stdout） */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const [file, name, out] = process.argv.slice(2);
if (!file || !name) { console.error('用法：node tools/invite/js_leaves.js <檔案> <全域常數名> [輸出檔]'); process.exit(2); }
const src = fs.readFileSync(file, 'utf8').replace(new RegExp('^const ' + name + '\\s*=', 'm'), 'globalThis.' + name + '=');
const ctx = { console };
ctx.globalThis = ctx; ctx.window = ctx; ctx.self = ctx;
vm.createContext(ctx);
vm.runInContext(src, ctx, { filename: path.basename(file) });
const root = ctx[name];
if (root == null) { console.error(name + '：載入以後沒有這個全域常數'); process.exit(2); }
const res = {}, stack = new Set();
const key = (p, k) => typeof k === 'number' ? p + '[' + k + ']' : (/^[A-Za-z_$][\w$]*$/.test(k) ? (p ? p + '.' : '') + k : p + '[' + JSON.stringify(k) + ']');
const walk = (x, p) => {
  if (typeof x === 'string') { res[p] = x; return; }
  if (typeof x === 'function') { res[p] = 'ƒ' + x.toString(); return; }
  if (!x || typeof x !== 'object' || stack.has(x)) return;
  stack.add(x);
  if (Array.isArray(x)) { x.forEach((v, i) => walk(v, key(p, i))); for (const k of Object.keys(x)) if (!/^\d+$/.test(k)) walk(x[k], key(p, k)); }
  else for (const k of Object.keys(x)) walk(x[k], key(p, k));
  stack.delete(x);
};
walk(root, '');
const txt = JSON.stringify(res);
if (out) fs.writeFileSync(out, txt); else process.stdout.write(txt);
