/* SHOP-REAL-INSIDE 公館第一批（LAWWW2-C 11-12）：安泰藥局、汀州鮮果、榮恩典文具社——玻璃後面放走進去的那一顆室內模型；招牌「阿鳳麵店」改回「公館燒臘」。
   node tests/gg_real_inside_1112_unit.js */
const fs=require('fs'),path=require('path'),vm=require('vm'); const R=path.join(__dirname,'..'); let fail=0;
const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fail++; };
const src=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8'), st=fs.readFileSync(path.join(R,'tools/blender/env_second/wz_street.py'),'utf8');
const Z=new Function(fs.readFileSync(path.join(R,'src/data/tz_shops_layout.js'),'utf8')+';return TZ_SHOPS_LAYOUT;')();
const m=/const GG_SHOP_REAL=\(\(\)=>\{([\s\S]*?)\}\)\(\);/.exec(src); ok(!!m,'① zones3d.js 有 GG_SHOP_REAL'); const L=m?vm.runInNewContext('(()=>{'+m[1]+'})()'):[];
ok(L.length===3,'② 三間：'+L.map(q=>q.id+'→'+q.place).join('、'));
const CX={G04:-18.6,G08:19.6,G13:64.1}, KEY={G04:'antai',G08:'xianguo',G13:'rongendian'};
for(const q of L){ const T=Z[KEY[q.id]]||{};
  ok(T.zone===q.place&&T.asset===q.key&&T.w===q.w&&T.d===q.d&&T.h===q.h,'③ '+q.id+' 的地點、模型、寬深高和室內配置（TZ_SHOPS_LAYOUT.'+KEY[q.id]+'）一樣');
  ok(Math.abs(q.x-CX[q.id])<1e-6&&Math.abs(q.z-(22.02+q.d/2))<1e-6&&Math.abs(q.ry-Math.PI)<1e-9&&q.cz===22,'④ '+q.id+' 室內放在店面玻璃（z 22）後面、正面轉向街道、中心對那一棟');
  const i=st.indexOf("'"+q.id+"': dict("), g=st.slice(i,st.indexOf('\n',i)); ok(new RegExp('real=True, back='+(q.d+0.1).toFixed(1).replace('.','\\.')).test(g),'⑤ 街景腳本 '+q.id+'：real（不放照片卡）、一樓牆體退到室內後面'); }
ok(/shopInsideLit\(r,zone,GG_IN_PLACE\); shopInsideReal\(E,g,zone,GG_SHOP_REAL\);/.test(src),'⑥ 公館街景模型接上以後呼叫 shopInsideReal');
const glb=fs.readFileSync(path.join(R,'assets/models/env/second_ai/gongguan_shops.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString('utf8'));
const lit=String((J.nodes.find(n=>n.name==='NOSHADOW_xs_fronts_lit').extras||{}).xsShops||'').split(',');
ok(!lit.some(k=>/ggantai|ggfruit|ggrong/.test(k)),'⑦ 街景模型裡這三間沒有照片亮窗卡了（剩 '+lit.join('、')+'）');
const sf=J.nodes.find(n=>n.name==='SIGN_FACE_G00'); const ex=sf&&sf.extras||{};
ok(!!sf&&JSON.stringify(ex).indexOf('公館燒臘')>=0,'⑧ G00 的招牌是空白板面、字是「公館燒臘」（遊戲畫；PLACES 的店名）：'+JSON.stringify(ex).slice(0,120));
ok(!/阿鳳/.test(JSON.stringify(J.nodes.map(n=>[n.name,n.extras])))&&!/n='阿鳳麵店'|gg_afeng/.test(st),'⑨ 公館街景模型和腳本裡沒有「阿鳳」');
console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0);
