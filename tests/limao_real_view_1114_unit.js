// LIMAO-REAL-VIEW-1114（LAWWW2-C 2026-11-14）：禮貌生財從巷 A 看進去是立體的店內（店面標準 §12 第 1 點「從店外往裡看是立體的店內，視角移動會跟著變，不貼一張圖」）。
// 原本：街景模型 tingzhou_street.glb 在格子窗、開著的木門後面各貼一張圖（wz_street.py TZ_ARC limao 的 limao_win、limao_door），走近也是平的。
// 現在：和汀州路那七間、溫特寶邸同一套——玻璃後面放走進去的那一顆室內 tz_limao_interior.glb（Z3.shopInsideReal）。
// 檢查：①wz_street.py limao real=True（不放兩張圖）、一樓量體只留室內兩邊和天花板上面 ②S.shopReal() 有禮貌生財、位置／轉向對 ③室內的門窗對得上街景的門窗、鐵捲門蓋得住
//       ④室內模型的正面牆會被 shopInsideReal 藏起來（dir＝[0,0,−1]），不會和街景的窗格疊兩層 ⑤街景模型裡沒有那兩張圖（重建過）
const fs=require('fs'), path=require('path'), vm=require('vm'); const R=path.join(__dirname,'..');
let fails=0; const ok=(c,m,x)=>{ console.log((c?'PASS ':'FAIL ')+m+(x?'　'+x:'')); if(!c) fails++; };
function glb(p){ const b=fs.readFileSync(p); const n=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+n).toString()); }
const st=fs.readFileSync(path.join(R,'tools/blender/env_second/wz_street.py'),'utf8');
const lm=/'limao': dict\(([^\n]*)/.exec(st); const head=lm?lm[1]:'';
ok(/real=True/.test(head)&&/back=7\.0/.test(head)&&/real_w=5\.0/.test(head),'① wz_street.py：禮貌生財 real=True（窗、門後面不放圖）、牆挖到這一棟的後面（back 7）、室內寬 5.0',head.slice(0,80));
ok(/elif spec\.get\('xs', \{\}\)\.get\('real_w'\):/.test(st),'① wz_street.py：一樓量體只留室內兩邊＋室內天花板上面那一段（real_w 那一支）');
// ② S.shopReal（照 tz_wente_interior_1112_unit 的做法：vm 載入兩份配置，抽出 S.REAL_* 和 shopReal 的函式本體）
const tz=fs.readFileSync(path.join(R,'src/tingzhou3d.js'),'utf8'); const c3={Math,console,ASSETS:{manifest:{}}}; vm.createContext(c3);
for(const f of ['tingzhou_layout.js','tz_shops_layout.js']) vm.runInContext(fs.readFileSync(path.join(R,'src/data',f),'utf8').replace(/^const /mg,'var '),c3);
const m1=/S\.REAL_DEP=(\{[^}]*\});/.exec(tz), m3=/S\.REAL_SX=(\{[^}]*\});/.exec(tz), m4=/S\.REAL_VIEW=(\{[^\n]*\}\});/.exec(tz), m2=/S\.shopReal=function\(\)\{([\s\S]*?)return out; \};/.exec(tz);
let list=[]; try{ list=vm.runInContext('(function(){ const S={REAL_DEP:'+m1[1]+',REAL_SX:'+m3[1]+',REAL_VIEW:'+m4[1]+'}; '+m2[1]+' return out; })()',c3); }catch(e){ console.log('  （抽 shopReal 失敗：'+e.message+'）'); }
const T=vm.runInContext('TINGZHOU_LAYOUT',c3), Z=vm.runInContext('TZ_SHOPS_LAYOUT',c3), LM=T.limao, LL=Z.limao, s=list.find(q=>q.id==='limao');
ok(!!s&&s.key==='bldg.tz_limao_interior'&&s.place==='tz_limao','② S.shopReal() 有禮貌生財（室內模型 bldg.tz_limao_interior、營業時間看 tz_limao）',s?s.key+' '+s.place:'沒有');
const gz=LM.z+LM.dep, cx=(LM.x0+LM.x1)/2;
ok(!!s&&Math.abs(s.ry-Math.PI)<1e-6&&Math.abs(s.cz-gz)<0.01&&Math.abs(s.cx-cx)<0.01,'② 店面朝巷子（−z，轉 π）、玻璃線 z＝'+gz.toFixed(2),s?('ry '+s.ry.toFixed(3)+' cz '+s.cz+' cx '+s.cx):'');
// 室內座標 (lx,lz) → 這一區：x＝s.x−lx、z＝s.z−lz（轉 π）
const W=(lx,lz)=>s?[s.x-lx,s.z-lz]:[NaN,NaN];
ok(!!s&&Math.abs(W(0,LL.d/2)[1]-(gz+0.02))<0.005,'② 室內正面（z＝d/2）在玻璃後面 2 cm',s?String(W(0,LL.d/2)[1].toFixed(3)):'');
ok(!!s&&Math.abs(s.ex-LL.w/2)<0.01&&s.ez===0,'② 離店多遠沿著店面量（ex＝寬的一半、ez＝0；店面是 x 方向）');
// ③ 門窗對得上
const card=(k)=>{ const m=new RegExp("\\('"+k+"', (-?[\\d.]+), (-?[\\d.]+)").exec(st); return m?[+m[1],+m[2]]:null; };
const cw=card('limao_win'), cd=card('limao_door'), F=LL.front||{};
const bx=v=>cx-v;   // 街景這一棟也轉 π：本地 x → 這一區 x＝中心−x
const dW=F.door?[W(F.door[1],0)[0],W(F.door[0],0)[0]]:null, cW=cd?[bx(cd[1]),bx(cd[0])]:null;
ok(!!dW&&!!cW&&dW[0]>=cW[0]-0.01&&dW[1]<=cW[1]+0.01,'③ 室內的門洞（'+(dW?dW.map(v=>v.toFixed(2)).join('～'):'?')+'）在街景的門洞（'+(cW?cW.map(v=>v.toFixed(2)).join('～'):'?')+'）裡面');
ok(!!dW&&LM.door.x>=dW[0]&&LM.door.x<=dW[1],'③ 門的互動點 x '+LM.door.x+' 在室內的門洞裡（走進去的地方看得到門裡面）');
const wW=F.windows&&F.windows[0]?[W(F.windows[0][1],0)[0],W(F.windows[0][0],0)[0]]:null, cwW=cw?[bx(cw[1]),bx(cw[0])]:null;
ok(!!wW&&!!cwW&&Math.min(wW[1],cwW[1])-Math.max(wW[0],cwW[0])>1.6,'③ 室內的窗和街景的格子窗重疊 1.6 m 以上',wW&&cwW?(wW.map(v=>v.toFixed(2)).join('～')+' / '+cwW.map(v=>v.toFixed(2)).join('～')):'');
const lf=/'limao': dict\([\s\S]*?leaves=\[\((-?[\d.]+),/.exec(st), hinge=lf?+lf[1]:NaN;
ok(!!s&&!!cw&&!!cd&&s.sx[0]-0.1<=Math.min(cw[0],cd[0])&&s.sx[1]+0.1>=Math.max(cw[1],cd[1])-0.05&&s.sh>=2.7,'③ 打烊的鐵捲門（含兩邊 0.1 m 軌道）蓋住窗＋門那一段（'+(s?s.sx.join('～'):'?')+'、高 '+(s?s.sh:'?')+'）');
ok(!!s&&isFinite(hinge)&&s.sx[1]+0.1<hinge-0.01,'③ 鐵捲門右邊的軌道（'+(s?(s.sx[1]+0.1).toFixed(2):'?')+'）停在往外開的門扇門軸（'+hinge+'）前面，不穿過門扇');
const bdx=[cx-(LL.w/2+0.2),cx+(LL.w/2+0.2)];
ok(bdx[0]>LM.x0&&bdx[1]<LM.x1,'③ 室內（含牆）在這一棟的寬度裡（'+bdx.map(v=>v.toFixed(2)).join('～')+' ⊂ '+LM.x0+'～'+LM.x1+'）');
// ④ 室內的正面牆有 dir＝[0,0,−1]（shopInsideReal 會藏）；藏完以後正面沒有別的零件凸到玻璃外
const IP=path.join(R,LL.glb); if(!fs.existsSync(IP)) ok(false,'④ '+LL.glb+' 存在'); else {
  const j=glb(IP); const front=j.nodes.filter(n=>/^WALL_S/.test(n.name||'')), bad=front.filter(n=>!(n.extras&&Array.isArray(n.extras.dir)&&n.extras.dir[2]<-0.9));
  ok(front.length>=1&&bad.length===0,'④ 室內正面牆 '+front.length+' 個零件都標 dir＝[0,0,−1]（shopInsideReal 藏起來，窗格只看到街景那一層）',bad.map(n=>n.name).join(','));
  let over=[]; for(const n of j.nodes){ if(n.mesh===undefined||/^WALL_S/.test(n.name||'')) continue; for(const p of j.meshes[n.mesh].primitives){ const a=j.accessors[p.attributes.POSITION], tz_=(n.translation||[0,0,0])[2]; if(a.max[2]+tz_>LL.d/2+0.02) over.push(n.name+' '+(a.max[2]+tz_).toFixed(2)); } }
  ok(over.length===0,'④ 其他零件都在室內正面（z ≤ d/2）後面——不會穿出玻璃到騎樓',over.slice(0,4).join('；'));
}
// ⑤ 街景模型重建過：玻璃後面 0.8 m（z＝玻璃線＋0.8）那兩張圖和窗洞內牆不在了——圖是合併在 wz_in_tiles_tingzhou 的，名字找不到，直接看頂點
//    （改之前這一格有 112 個頂點：圖 20、窗洞內牆 84、夜裡的亮光片 8）
{ const b=fs.readFileSync(path.join(R,'assets/models/env/second_ai/tingzhou_street.glb')); const n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n)), bin=b.slice(20+n+8); const zc=gz+0.8, hit={};
  for(const nd of j.nodes){ if(nd.mesh===undefined) continue; const t=nd.translation||[0,0,0], sc=nd.scale||[1,1,1]; if(nd.rotation&&Math.abs(nd.rotation[3])<0.9999) continue;
    for(const pr of j.meshes[nd.mesh].primitives){ const a=j.accessors[pr.attributes.POSITION], bv=j.bufferViews[a.bufferView], off=(bv.byteOffset||0)+(a.byteOffset||0), stv=bv.byteStride||12;
      for(let i=0;i<a.count;i++){ const x=bin.readFloatLE(off+i*stv)*sc[0]+t[0], y=bin.readFloatLE(off+i*stv+4)*sc[1]+t[1], z=bin.readFloatLE(off+i*stv+8)*sc[2]+t[2];
        if(Math.abs(z-zc)<0.03&&x>LM.x0+0.9&&x<LM.x1-0.3&&y>-0.05&&y<2.8) hit[nd.name]=(hit[nd.name]||0)+1; } } }
  ok(Object.keys(hit).length===0,'⑤ tingzhou_street.glb：禮貌生財窗、門後面 0.8 m 沒有圖、沒有窗洞內牆（重建過）',JSON.stringify(hit)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
