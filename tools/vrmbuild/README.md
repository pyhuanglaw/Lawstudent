# vrmbuild — 重新產生 lib/three-vrm.bundle.js

`lib/three-vrm.bundle.js` 是 @pixiv/three-vrm（MIT）從 TypeScript 原始碼打包成的 classic script（全域 `THREE_VRM`），因為開發環境沒有 npm registry／CDN。

輸入：
- `entry.ts`：`export * from '@pixiv/three-vrm';`
- `three-shim.js`：把 `import ... from 'three'` 轉到 `window.THREE`（由 `Object.keys(THREE)` 產生的具名 export）
- `gltf-shim.js`：GLTFLoader 相關型別的空 shim

做法（確切指令當時沒有存下來，以下是大致步驟）：
1. `git clone https://github.com/pixiv/three-vrm`（當時 commit 1b4fc0c）。
2. 用 esbuild 打包 `entry.ts`：把 `three` 指到 `three-shim.js`、three 的 GLTFLoader 相關 import 指到 `gltf-shim.js`，輸出 `iife`、全域名稱 `THREE_VRM`。
3. 只含 WebGL 版（不含 WebGPU／TSL 的 MToonNodeMaterial）。

產出與 `lib/three-vrm.bundle.js` 逐字相同（已比對 md5）。three.js 本身（`lib/three.bundle.js`、`lib/three.jsm.bundle.js`）是從 mrdoob/three.js（commit 1af6de5，r187dev）手動包成 classic script，沒有保留腳本。
