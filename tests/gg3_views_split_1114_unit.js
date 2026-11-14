// WINVIEW-MIRROR-TREE-1114 第二部分（LAWWW2-B 11-14）：公館安泰、汀州鮮果、榮恩典的窗景分兩層拍時，近景／遠景的分界不能切過行道樹。
// 第一次用 D＝9 m 拍（CC WINVIEW_GG3_1939_r3_remat）：近景層多出一小撮樹葉和一片圓形花台面、沒有樹幹（BB-B 11-14 判 FAIL：整棵樹和花台要放同一層）。
// 這支不開瀏覽器：讀 tools/shots/shop_views_layers.py 的 VIEWS 三列和 src/zones3d.js 公館行道樹的位置，算分界面離每一棵樹多遠。
const fs=require('fs'), path=require('path'); const R=path.join(__dirname,'..');
const py=fs.readFileSync(path.join(R,'tools/shots/shop_views_layers.py'),'utf8'), z3=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8');
let fail=0; const check=(n,ok,msg)=>{ console.log((ok?'PASS ':'FAIL ')+n+'　'+(msg||'')); if(!ok) fail++; };
const V={}; for(const k of ['gg_antai','gg_xianguo','gg_rongendian']){ const m=new RegExp("'"+k+"': \\('gongguan', \\[[^\\]]+\\], \\[([-\\d.]+), ([-\\d.]+), ([-\\d.]+)\\], \\[[^\\]]+\\], ([\\d.]+), ([\\d.]+)\\)").exec(py); if(m) V[k]={x:+m[1],y:+m[2],z:+m[3],D:+m[4],top:+m[5]}; }
check('1 三間都在 VIEWS（公館、鏡頭在店面玻璃內側 z 21.7）', Object.keys(V).length===3&&Object.values(V).every(v=>v.z===21.7), JSON.stringify(V));
const tm=/for\(const \[x,z\] of (\[\[[-\d.,\[\]]+\]\])\)\{ const t=TREE\(0\.95\); t\.name='gg_street_tree'/.exec(z3); const trees=tm?JSON.parse(tm[1]):[];
check('2 找得到公館人行道的行道樹位置（zones3d.js gg_street_tree）', trees.length>=4, JSON.stringify(trees));
const CROWN=3.2;   // 樹冠半徑（TREE(0.95)＝高約 6 m 的行道樹，樹冠最寬約 6 m；多留 0.2）
for(const [k,v] of Object.entries(V)){ const plane=v.z-v.D; const cut=trees.filter(([x,z])=>Math.abs(x-v.x)<20&&plane>z-CROWN&&plane<z+CROWN);
  check('3 '+k+'：分界面（z '+plane.toFixed(1)+'）沒有切過 20 m 內任何一棵行道樹的樹冠', cut.length===0, cut.length?('切到 '+JSON.stringify(cut)):'');
  check('4 '+k+'：騎樓前的機車（離鏡頭 2.5～5 m）整台在近景：D ≥ 5.5', v.D>=5.5, 'D='+v.D); }
console.log(fail?('FAILED '+fail):'ALL PASS'); process.exit(fail?1:0);
