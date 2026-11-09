/* PERF-XS-NPC-1108 第二步 (D)＋(C) 探針（LAWWW2-B 11-09；LAWWW-B 17:21 決定順序 D → C → A）。進到要量的店、站好以後在 console 貼上整段，大約 35 秒。
   (D) 卡頓：大口 1F CPU trace 兩次 117 ms＝projectObject → SkinnedMesh.computeBoundingSphere（frustumCulled 開著的蓋皮網格第一次被畫，逐頂點套骨頭）。
       ① 列出場景裡 frustumCulled 開著的 SkinnedMesh；② 30 秒內包住 SkinnedMesh.prototype.computeBoundingSphere，記下誰被算、花幾 ms、往上 6 層的名字。
   (C) 每幀換 program：大口 1F getProgram＋getParameters 9.6%（好拍 1.3%）。包住 renderer.renderBufferDirect（renderObject 用 _this.renderBufferDirect 呼叫），
       畫之前照 three.js setProgram 的條件比對 material 的 properties，記下「這一次會換 program 的原因」，照材質名字統計（每秒幾次）：
       version（material.version 變了：needsUpdate）、skinning、instancing、morphTargets、morphTargetsCount、morphNormals、vertexAlphas、vertexTangents、fog、
       另外記 program 真的換了（畫完 currentProgram 和畫之前不一樣）的次數、lightsStateVersion 變了的次數。主畫面、影子都算（影子用的是 depth 材質，名字會不一樣）。 */
(async () => {
  const E = GAME.E, R = E.renderer, S = E.scene, path = o => { const a = []; let p = o; while (p && a.length < 6) { a.push(p.name || p.type); p = p.parent; } return a.join(' < '); };
  const fcSkinned = []; S.traverse(o => { if (o.isSkinnedMesh && o.frustumCulled) fcSkinned.push({ name: o.name, path: path(o), verts: o.geometry.attributes.position.count, visible: o.visible, hasSphere: !!o.boundingSphere }); });
  const SP = THREE.SkinnedMesh.prototype, cbs0 = SP.computeBoundingSphere, cbs = [];
  SP.computeBoundingSphere = function () { const t = performance.now(), r = cbs0.apply(this, arguments); cbs.push({ name: this.name, path: path(this), ms: +(performance.now() - t).toFixed(1), verts: this.geometry.attributes.position.count, frustumCulled: this.frustumCulled }); return r; };
  const rbd0 = R.renderBufferDirect, cnt = {}, add = (m, k) => { const n = (m && m.name) || '(no name)', c = cnt[n] || (cnt[n] = { draws: 0 }); c[k] = (c[k] || 0) + 1; };
  let frames = 0; const fr = () => { frames++; if (on) requestAnimationFrame(fr); }; let on = true; requestAnimationFrame(fr);
  R.renderBufferDirect = function (camera, scene, geometry, material, object, group) {
    try { const mp = R.properties.get(material); add(material, 'draws');
      if (mp.currentProgram) {
        if (material.version !== mp.__version) add(material, 'version');
        else {
          if (!!object.isSkinnedMesh !== !!mp.skinning) add(material, 'skinning');
          if (!!object.isInstancedMesh !== !!mp.instancing) add(material, 'instancing');
          const ma = geometry.morphAttributes || {}, mAttr = ma.position || ma.normal || ma.color, mc = mAttr ? mAttr.length : 0;
          if (!!ma.position !== !!mp.morphTargets) add(material, 'morphTargets');
          if (mc !== mp.morphTargetsCount) add(material, 'morphTargetsCount');
          if (!!ma.normal !== !!mp.morphNormals) add(material, 'morphNormals');
          const va = material.vertexColors === true && !!geometry.attributes.color && geometry.attributes.color.itemSize === 4; if (va !== !!mp.vertexAlphas) add(material, 'vertexAlphas');
          const vt = !!geometry.attributes.tangent && (!!material.normalMap || material.anisotropy > 0); if (vt !== !!mp.vertexTangents) add(material, 'vertexTangents');
          if (material.fog === true && mp.fog !== scene.fog) add(material, 'fog');
        } }
      const p0 = mp.currentProgram, l0 = mp.lightsStateVersion, r = rbd0.apply(this, arguments);
      if (mp.currentProgram !== p0) add(material, 'programChanged'); if (mp.lightsStateVersion !== l0) add(material, 'lightsStateVersion');
      return r; } catch (e) { R.renderBufferDirect = rbd0; throw e; } };
  const t0 = performance.now(); await new Promise(r => setTimeout(r, 30000)); on = false;
  R.renderBufferDirect = rbd0; SP.computeBoundingSphere = cbs0; const sec = (performance.now() - t0) / 1000;
  const rows = Object.entries(cnt).map(([name, c]) => Object.assign({ name }, ...Object.entries(c).map(([k, v]) => ({ [k]: +(v / sec).toFixed(1) })))).filter(r => Object.keys(r).length > 2).sort((a, b) => (b.programChanged || 0) + (b.version || 0) - (a.programChanged || 0) - (a.version || 0));
  const out = { zone: E.zone && E.zone.id, sec: +sec.toFixed(1), frames, fps: +(frames / sec).toFixed(1), npc: (E.npcs || []).length, frustumCulledSkinned: fcSkinned, computeBoundingSphere: cbs, programReasonsPerSec: rows.slice(0, 30) };
  console.table(fcSkinned); console.table(cbs); console.table(out.programReasonsPerSec); return out;
})()
