/* SHOP-REAL-INSIDE 公館第一批（LAWWW2-C 11-12）：安泰藥局、汀州鮮果、榮恩典文具社——玻璃後面放走進去的那一顆室內模型；招牌「阿鳳麵店」改回「公館燒臘」。
   node tests/gg_real_inside_1112_unit.js */
const fs=require('fs'),path=require('path'),vm=require('vm'); const R=path.join(__dirname,'..'); let fail=0;
const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fail++; };
const src=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8'), st=fs.readFileSync(path.join(R,'tools/blender/env_second/wz_street.py'),'utf8');
const Z=new Function(fs.readFileSync(path.join(R,'src/data/tz_shops_layout.js'),'utf8')+';return TZ_SHOPS_LAYOUT;')();
const m=/const GG_SHOP_REAL=\(\(\)=>\{([\s\S]*?)\}\)\(\);/.exec(src); ok(!!m,'① zones3d.js 有 GG_SHOP_REAL'); const L=m?vm.runInNewContext('(()=>{'+m[1]+'})()'):[];
ok(L.length===13,'② 十三間（第一批三間＋第二批八間＋燒臘＋花序）：'+L.map(q=>q.id+'→'+q.place).join('、'));
const ld=(f,n)=>{ try{ return new Function(fs.readFileSync(path.join(R,'src/data',f),'utf8')+';return typeof '+n+'!=="undefined"?'+n+':null;')(); }catch(e){ return null; } };
const sh=o=>o&&(o.shop||o.corner||o.bike||o);
const LAY={G04:Z.antai,G08:Z.xianguo,G13:Z.rongendian,G01:ld('aoki_layout.js','AOKI_LAYOUT'),G02:ld('yejian_layout.js','YEJIAN_LAYOUT'),G03:sh(ld('cvs_layout.js','CVS_LAYOUT')),G05:sh(ld('yangyang_layout.js','YANGYANG_LAYOUT')),
  G06:sh(ld('bike_layout.js','BIKE_LAYOUT')),G07:ld('afar_layout.js','AFAR_LAYOUT'),G12:sh(ld('corner_layout.js','CORNER_LAYOUT')),G14:ld('daybreak_layout.js','DAYBREAK_LAYOUT'),G00:sh(ld('shaola_layout.js','SHAOLA_LAYOUT')),G11:(()=>{ const F=ld('flower_notes_layout.js','FLOWER_NOTES_LAYOUT'); return F?{w:F.W,d:F.D,h:F.roofY}:null; })()};   /* 花序兩層樓：高＝屋頂 7.6（前半挑高，整顆放）*/
/* 各棟中心：照 wz_street.py 的寬度算（−68 起，前八間各加 1.2） */
const CX=(()=>{ const i=st.indexOf("_SHOPS = [dict(n='公館燒臘'"), j=st.indexOf('_WALLC',i), ws=(st.slice(i,j).match(/w=(\d+)/g)||[]).map(t=>+t.slice(2)); let x=-68; const o={}; ws.forEach((w,k)=>{ const x1=x+w+((k<8&&k<ws.length-1)?1.2:0); o['G'+String(k).padStart(2,'0')]=(x+x1)/2; x=x1; }); return o; })();
const z3all=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8')+['bikeshop3d.js','flower_notes3d.js'].map(f=>{ try{ return fs.readFileSync(path.join(R,'src',f),'utf8'); }catch(e){ return ''; } }).join('');
const WBT=(()=>{ const m=/const WB=(\{[^}]*\});/.exec(src); return m?vm.runInNewContext('('+m[1]+')'):{}; })();
for(const q of L){ const T=LAY[q.id]||{};
  ok(T.w===q.w&&T.d===q.d&&T.h===q.h,'③ '+q.id+'（'+q.place+'）寬深高和室內配置一樣（'+q.w+'×'+q.d+'×'+q.h+'）');
  ok(z3all.indexOf("'"+q.key+"'")>=0&&(!T.asset||T.asset===q.key),'③b '+q.id+' 的室內模型鍵 '+q.key+' 有登錄');
  ok(Math.abs(q.x-CX[q.id])<0.051&&Math.abs(q.z-(22.02+q.d/2))<1e-6&&Math.abs(q.ry-Math.PI)<1e-9&&q.cz===22,'④ '+q.id+' 室內放在店面玻璃（z 22）後面、正面轉向街道、中心對那一棟（x '+q.x+'）');
  ok(Array.isArray(q.sx)&&q.sx[0]>=-q.w/2-1e-6&&q.sx[1]<=q.w/2+1e-6&&q.sx[1]-q.sx[0]>3,'④b '+q.id+' 鐵捲門只蓋門窗那一段（室內 x '+q.sx+'）');
  ok(q.kx>0.94&&q.kx<=1&&(q.w/2+0.2)*q.kx<=WBT[q.id]/2+1e-3,'④c '+q.id+' 室內連牆厚縮到這一棟的寬度裡（kx '+q.kx+'）：不會伸進隔壁店');
  const i=st.indexOf("'"+q.id+"': dict("), g=st.slice(i,st.indexOf('\n',i)); ok(new RegExp('real=True, back='+(q.d+0.1).toFixed(1).replace('.','\\.')).test(g),'⑤ 街景腳本 '+q.id+'：real（不放照片卡）、一樓牆體退到室內後面'); }
ok(/shopInsideLit\(r,zone,GG_IN_PLACE\); shopInsideReal\(E,g,zone,GG_SHOP_REAL\);/.test(src),'⑥ 公館街景模型接上以後呼叫 shopInsideReal');
const glb=fs.readFileSync(path.join(R,'assets/models/env/second_ai/gongguan_shops.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString('utf8'));
const lit=String((J.nodes.find(n=>n.name==='NOSHADOW_xs_fronts_lit').extras||{}).xsShops||'').split(',');
ok(!lit.some(k=>/ggantai|ggfruit|ggrong|ggtea|ggbook|ggbike|ggcorner/.test(k)),'⑦ 街景模型裡沒有照片亮窗卡了；還在亮窗表裡的（'+lit.join('、')+'）是會亮的招牌、菜單燈箱（日和、洋洋的燈箱招牌…），打烊照舊由 ggShopLit 關掉');
const sf=J.nodes.find(n=>n.name==='SIGN_FACE_G00'); const ex=sf&&sf.extras||{};
ok(!!sf&&JSON.stringify(ex).indexOf('公館燒臘')>=0,'⑧ G00 的招牌是空白板面、字是「公館燒臘」（遊戲畫；PLACES 的店名）：'+JSON.stringify(ex).slice(0,120));
ok(!/阿鳳/.test(JSON.stringify(J.nodes.map(n=>[n.name,n.extras])))&&!/n='阿鳳麵店'|gg_afeng/.test(st),'⑨ 公館街景模型和腳本裡沒有「阿鳳」');
console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0);
