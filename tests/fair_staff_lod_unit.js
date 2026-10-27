// FAIR-STAFF-LOD-1027（LAWWW2-C 2026-10-27；LAWWW-C 22:24Z 照 FAIR-PERF-1027 的建議）：社博顧攤的人照距離藏——中畫質 35 m、高畫質 55 m、低畫質照一般路人 34 m。
//   量測（docs/art-rebuild/second_ai/test_shots/fair_perf_1027）：大道往西看中畫質三角形 +48%、模擬 fps −29%；35 m 內才畫：畫面裡顧攤的人 15→4、模擬 fps +27%。
//   ① 社博那天放的每一個顧攤的人都帶 lodLim（人流、平常的路人不帶）② engine3d.js NPC 距離 LOD 照 lodLim 取比較短的距離（一般路人照舊 34／60／95）。不需要瀏覽器。用法：node tests/fair_staff_lod_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H, J=JSON.stringify;
for(const f of ['src/data/club_fair_expo_layout.js','src/data/club_fair.js','src/clubfair3d.js']){ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (CLUB_FAIR_EXPO|CLUB_FAIR|CLUBFAIR)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const D=k=>STORY.dayOfKey(k);
const NEW={LAW_START_DAY:D('2025-08-29'),MAIN_D1:D('2025-09-04')};   /* 開學改 9/1 的新局：社博 9/6 */
const fakeE=lv=>({interactables:[],npcs:[],q:{level:lv},player:{obj:{position:{x:0,y:0,z:0}},lv:0},addNPC(n){ this.npcs.push(n); return n; }});
(async()=>{
  global.CHAR={setExpr(){},build:()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0}})};   /* 不需要真的人物模型 */
  for(const lv of ['high','medium','low']){ const G=H.fresh('2025-09-06',11,'campus',Object.assign({},NEW)), E=fakeE(lv); CLUBFAIR.populate('campus',{E,G,spawnExtra:()=>({fairCrowd:true})});
    const st=E.npcs.filter(n=>n.fairStaff), other=E.npcs.filter(n=>!n.fairStaff);
    check('① '+lv+'：社博那天每一個顧攤的人都帶 lodLim＝{low:34, medium:35, high:55}（'+st.length+' 人）',st.length>=20&&st.every(n=>n.lodLim&&n.lodLim.low===34&&n.lodLim.medium===35&&n.lodLim.high===55),J(st[0]&&st[0].lodLim));
    check('① '+lv+'：停在攤位前填表的人不帶 lodLim（照一般路人）',other.length>0&&other.every(n=>!n.lodLim),other.length+' 人'); }
  { const G=H.fresh('2025-09-08',11,'campus',Object.assign({},NEW)), E=fakeE('medium'); CLUBFAIR.populate('campus',{E,G,spawnExtra:()=>({})}); check('① 平常日沒有顧攤的人',!E.npcs.some(n=>n.fairStaff)); }
  /* ② 引擎：NPC 迴圈裡算距離 LOD 的那一段，拿出來用假的 n、E 算 */
  const eng=fs.readFileSync(path.join(H.ROOT,'src/engine3d.js'),'utf8'), m=eng.match(/const cd=Math\.hypot\(camera\.position\.x-o\.position\.x,camera\.position\.z-o\.position\.z\); (const lim0?=[^;]*;)[^\n]*?const vis=!n\.hidden&&\(cd<lim\|\|!n\.isExtra\)/);
  check('② engine3d.js：NPC 的距離 LOD 用 lim 判斷（cd<lim）',!!m);
  if(m){ const f=new Function('n','E','"use strict"; '+m[1]+' return lim;'); const L=CLUBFAIR.STAFF_LOD, q=level=>({q:{level}});
    const got={staff:['low','medium','high'].map(l=>f({lodLim:L},q(l))), crowd:['low','medium','high'].map(l=>f({},q(l)))};
    check('② 顧攤的人：低 34、中 35、高 55 m',J(got.staff)===J([34,35,55]),J(got.staff));
    check('② 一般路人照舊：低 34、中 60、高 95 m',J(got.crowd)===J([34,60,95]),J(got.crowd));
    check('② lodLim 只會縮短、不會加長（寫 200 也是照畫質上限）',f({lodLim:{medium:200}},q('medium'))===60); }
  H.done();
})();
