/* SHOP-REAL-INSIDE 溫州街（LAWWW2-C 11-12）：日常失速、SUNNY SIDE、小路——玻璃後面放走進去的那一顆室內模型。
   node tests/wz_real_inside_1112_unit.js */
const fs=require('fs'),path=require('path'),vm=require('vm'); const R=path.join(__dirname,'..'); let fail=0;
const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fail++; };
const src=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8'), st=fs.readFileSync(path.join(R,'tools/blender/env_second/wz_street.py'),'utf8'), kit=fs.readFileSync(path.join(R,'tools/blender/env_second/wz_shopkit.py'),'utf8');
const WZL=new Function(fs.readFileSync(path.join(R,'src/data/wz_shops_layout.js'),'utf8')+';return WZ_SHOPS_LAYOUT;')();
const m=/const wzShopReal=\(\)=>\{([\s\S]*?return out; )\};/.exec(src); ok(!!m,'① zones3d.js 有 wzShopReal');
const L=m?vm.runInNewContext('(()=>{'+m[1]+'})()',{WZ_SHOPS_LAYOUT:WZL,Math,wzGlbKey:(k,l)=>'bldg.wz_'+k+'_interior_v'+(l.version|0)}):[];
ok(L.length===4&&L.map(q=>q.id).join()==='W2,B7,B3,A4','② 四間（林家乾麵 A4 朝北：ry π、z 5.92＋d/2）：'+L.map(q=>q.id+'→'+q.place).join('、'));
const W2=L[0]||{}, B7=L[1]||{}, B3=L[2]||{};
ok(W2.key==='bldg.wz_offbeat_interior'&&W2.x===-42.2&&W2.z===-13.5&&Math.abs(W2.ry-Math.PI/2)<1e-9&&W2.w===11&&W2.d===10,'③ 日常失速：室內原點 (−42.2,−13.5)、正面朝東（和街景腳本 W2 的對應一樣）');
ok(B7.place==='wz_brunch'&&B7.w===WZL.brunch.w&&B7.d===WZL.brunch.d&&Math.abs(B7.x-44.62)<1e-9&&Math.abs(B7.z-(-5.92-WZL.brunch.d/2))<1e-9&&B7.ry===0,'④ SUNNY SIDE：寬深照配置（'+B7.w+'×'+B7.d+'），正面貼在玻璃面 z −5.9 後面，右牆貼著東側落地窗（中心 x 44.62）');
ok(B3.place==='wz_teishoku'&&B3.w===WZL.teishoku.w&&B3.d===WZL.teishoku.d&&B3.x===-2.8&&B3.ry===0,'⑤ 小路：寬深照配置（'+B3.w+'×'+B3.d+'），在這一棟（x −9.6～4）正中間');
ok(/shopInsideLit\(root,zone,\{B7:'wz_brunch',B3:'wz_teishoku'\}\); shopInsideReal\(E,g,zone,wzShopReal\(\)\);/.test(src),'⑥ 溫州街街景模型接上以後呼叫 shopInsideReal');
ok(/OFFBEAT_XS = dict\(arcade=False, dep=0\.3, real=True,/.test(st)&&/OFFBEAT_XS\.get\('int3d'\) and not OFFBEAT_XS\.get\('real'\)/.test(st),'⑦ 街景腳本：日常失速 real、不再嵌烘光的店內');
ok(/'B7': dict\(real=dict\(x0=-2\.55, x1=3\.85, d=10\.0/.test(kit)&&/'B3': dict\(real=dict\(x0=-4\.0, x1=4\.0, d=8\.0/.test(kit)&&/if sf\.get\('real'\):/.test(kit),'⑧ 街景腳本：SUNNY SIDE、小路 real（不做簡化的淺店內；玻璃比室內寬的地方補實牆）');
ok(Math.abs((-2.55+3.85)/2-0.65)<1e-9&&Math.abs((3.85-(-2.55))-WZL.brunch.w)<1e-9&&Math.abs(8-WZL.teishoku.w)<1e-9,'⑨ 街景腳本挖開的範圍＝室內的寬（SUNNY SIDE −2.55～3.85＝6.4 m；小路 ±4＝8 m）');
const glb=fs.readFileSync(path.join(R,'assets/models/env/second_ai/wenzhou_street.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString('utf8')); const names=J.nodes.map(n=>n.name||'');
ok(!names.some(n=>/offbeat_storefront/.test(n))&&!names.includes('sk_in_B7')&&!names.includes('sk_in_B3'),'⑩ 街景模型裡沒有日常失速烘光的店內、沒有 SUNNY SIDE／小路的簡化店內');
ok(names.includes('sk_in_B2')||names.some(n=>/^sk_in_/.test(n)),'⑪ 其他店的簡化店內照舊（'+names.filter(n=>/^sk_in_/.test(n)).length+' 個）');
const hm=/const HIDE=(\/.*?\/i),/.exec(src); const HIDE=hm?vm.runInNewContext(hm[1]):/x^/;
ok(!HIDE.test('sunnyside_interior/sns_floor/')&&HIDE.test('a/WALL_front_sns_wall/')&&HIDE.test('a/sun_patch/')&&HIDE.test('a/WALL_right_VIEW_x/'),'⑫ 藏零件的規則不會把 sunnyside 整間藏掉（原本寫 /sun/）；正面牆、陽光斑、窗景卡照舊藏');
ok(/nx=Math\.sin\(s\.ry\|\|0\), nz=Math\.cos\(s\.ry\|\|0\)/.test(src),'⑬ 鐵捲門朝街的方向用室內的 ry（室內不在正中間也不會斜）');
const A4=L[3]||{}, LIN=(typeof LIN_LAYOUT!=='undefined'?LIN_LAYOUT:WZL.lin)||{};
ok(A4.place==='wz_lin'&&A4.w===LIN.w&&A4.d===LIN.d&&A4.x===36&&Math.abs(A4.z-(5.92+LIN.d/2))<1e-9&&Math.abs(A4.ry-Math.PI)<1e-9&&Math.abs((A4.x-LIN.front.door.x)-LIN.enterAt.x)<1e-9,'⑭ 林家乾麵：室內轉 180°貼在店面 z 5.9 後面，室內的門（本地 x +1）落在進店點 x 35');
ok(/'A4': dict\(real=dict\(x0=-3\.2, x1=3\.2, d=8\.0/.test(kit)&&!names.includes('sk_in_A4'),'⑮ 街景腳本：林家 real；街景模型裡沒有林家另外做的那一套簡化店內');
{ const SL=new Function(fs.readFileSync(path.join(R,'src/data/sunnyside_layout.js'),'utf8').replace(/^\s*(const|var|let)\s+SUNNYSIDE_LAYOUT/m,'var SUNNYSIDE_LAYOUT')+';return typeof SUNNYSIDE_LAYOUT!=="undefined"?SUNNYSIDE_LAYOUT:null;')()||WZL.brunch;
  const dm=/'B7': dict\(real=dict\([^)]*\)[^\n]*?door_x=(-?[\d.]+)/.exec(kit), dx=dm?+dm[1]:NaN, inDoor=B7.x+SL.front.door.x;
  ok(Math.abs((44+dx)-inDoor)<0.05&&Math.abs(SL.enterAt.x-inDoor)<0.05&&Math.abs(SL.exit.spawn.x-inDoor)<0.05&&Math.abs(WZL.brunch.enterAt.x-inDoor)<0.05,'⑯ WZ-SUNNY-DOOR-1112：SUNNY SIDE 店外的門（世界 x '+(44+dx)+'）＝室內的門（'+inDoor.toFixed(2)+'）；進店點、出店點跟著（'+SL.enterAt.x+'、'+SL.exit.spawn.x+'）'); }
console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0);
