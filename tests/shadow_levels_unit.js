// 多樓層：玩家這一層以上的樓層不投影子（LAWWW2-B 2026-10-24 巡場景第 7 區）——不需要瀏覽器。
//   坐在普通 101、博雅一樓的教室裡，鏡頭比二樓地板低，updateLevelVis 讓二樓整層顯示（看得到天花板，是故意的）；
//   二樓的桌椅因此也進了陰影貼圖，室內的太陽沒有被樓板擋住，影子打在一樓的牆上（一片片放大的桌椅影子）。
//   1. engine3d.js 有 shadowLevels，E.init 建好 renderer 以後包住 renderer.shadowMap；
//   2. 陰影那一輪：玩家這一層（zone.displayLv）和下面的層照畫，上面的層藏起來；畫完還原（本來就藏著的不會被打開）；
//   3. 玩家在二樓：二樓照畫，三樓藏起來；
//   3b. 坐在階梯教室的後排（displayLv 已經算成二樓，導航還是一樓）：二樓照樣藏起來（博雅一樓）；沒有玩家時用 displayLv；
//   4. 原本的 render 丟出錯誤也會還原；參數、回傳值原樣傳過去；
//   5. 沒有 levelGroups 的區域、還沒有區域：照原本的畫。
// 修改前 1 FAIL（沒有 shadowLevels）。用法：node tests/shadow_levels_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
const m=src.match(/function shadowLevels\(SM\)\{[\s\S]*?finally\{ for\(const g of hid\) g\.visible=true; \} \}; \}/);
check('1. engine3d.js 有 shadowLevels，E.init 包住 renderer.shadowMap', !!m&&/renderer\.shadowMap\.type=THREE\.PCFShadowMap; shadowLevels\(renderer\.shadowMap\);/.test(src));
if(m){
  const ctx={E:{zone:null}}; vm.createContext(ctx); vm.runInContext(m[0]+'\nthis.shadowLevels=shadowLevels;',ctx);
  const mk=(vis,dl,plv)=>{ ctx.E.player=plv===undefined?{lv:dl}:(plv===null?null:{lv:plv}); return {levelGroups:vis.map(v=>({group:{visible:v}})),displayLv:dl}; };
  const seen=[]; let ret=null, args=null;
  const SM={render(...a){ args=a; const z=ctx.E.zone; seen.push(z&&z.levelGroups?z.levelGroups.map(l=>l.group.visible):null); return 'r'; }};
  ctx.shadowLevels(SM);
  { ctx.E.zone=mk([true,true,false],0); seen.length=0; ret=SM.render(1,'scene','cam');
    check('2. 人在一樓：陰影那一輪只畫一樓（二樓藏起來）', JSON.stringify(seen[0])==='[true,false,false]', JSON.stringify(seen[0]));
    check('2. 畫完還原：二樓照舊顯示、本來就藏著的三樓照舊藏著', JSON.stringify(ctx.E.zone.levelGroups.map(l=>l.group.visible))==='[true,true,false]');
    check('4. 參數、回傳值原樣傳過去', ret==='r'&&JSON.stringify(args)==='[1,"scene","cam"]'); }
  { ctx.E.zone=mk([true,true,true],1); seen.length=0; SM.render();
    check('3. 人在二樓：一樓、二樓照畫，三樓藏起來', JSON.stringify(seen[0])==='[true,true,false]', JSON.stringify(seen[0]));
    check('3. 畫完還原', ctx.E.zone.levelGroups.every(l=>l.group.visible)); }
  { ctx.E.zone=mk([true,true,true],1,0); seen.length=0; SM.render();
    check('3b. 坐在階梯教室後排（displayLv 1、導航 lv 0）：二樓照樣藏起來', JSON.stringify(seen[0])==='[true,false,false]', JSON.stringify(seen[0]));
    ctx.E.zone=mk([true,true,true],1,null); seen.length=0; SM.render();
    check('3b. 沒有玩家：用 displayLv（一樓、二樓照畫，三樓藏起來）', JSON.stringify(seen[0])==='[true,true,false]', JSON.stringify(seen[0])); }
  { const SM2={render(){ throw new Error('boom'); }}; ctx.shadowLevels(SM2); ctx.E.zone=mk([true,true],0); let threw=false;
    try{ SM2.render(); }catch(e){ threw=e.message==='boom'; }
    check('4. 原本的 render 丟出錯誤：錯誤照樣丟出去、樓層照樣還原', threw&&ctx.E.zone.levelGroups[1].group.visible===true); }
  { ctx.E.zone={}; seen.length=0; let ok=true; try{ SM.render(); }catch(e){ ok=false; } ctx.E.zone=null; try{ SM.render(); }catch(e){ ok=false; }
    check('5. 沒有 levelGroups、還沒有區域：照原本的畫', ok&&seen.length===2); }
}
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
