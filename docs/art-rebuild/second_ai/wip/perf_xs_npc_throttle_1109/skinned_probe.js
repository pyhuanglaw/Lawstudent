/* 找「frustumCulled 開著的蓋皮網格」（LAWWW2-B 11-09；大口 1F CPU trace 兩次 117 ms 卡頓＝projectObject → SkinnedMesh.computeBoundingSphere → applyBoneTransform 60～68 ms）。
   進到大口 1F，在 console 貼上：先列出場景裡 frustumCulled 開著的 SkinnedMesh，再包住 computeBoundingSphere 30 秒，記下誰被算了、花多久。 */
(async () => {
  const E = GAME.E, list = [];
  E.scene.traverse(o => { if (o.isSkinnedMesh && o.frustumCulled) { let p = o, path = []; while (p && path.length < 5) { path.push(p.name || p.type); p = p.parent; } list.push({ name: o.name, path: path.join(' < '), verts: o.geometry.attributes.position.count, bs: !!o.boundingSphere }); } });
  const P = THREE.SkinnedMesh.prototype, f0 = P.computeBoundingSphere, hits = [];
  P.computeBoundingSphere = function () { const t = performance.now(); const r = f0.apply(this, arguments); let p = this, path = []; while (p && path.length < 5) { path.push(p.name || p.type); p = p.parent; } hits.push({ name: this.name, path: path.join(' < '), ms: +(performance.now() - t).toFixed(1), verts: this.geometry.attributes.position.count, fc: this.frustumCulled }); return r; };
  await new Promise(r => setTimeout(r, 30000)); P.computeBoundingSphere = f0;
  console.table(list); console.table(hits); return { frustumCulledSkinned: list, computed: hits };
})()
