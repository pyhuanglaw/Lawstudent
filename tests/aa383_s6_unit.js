// AA_383 第 6 節（企劃線 67b7b2ca；任務 AA383-S6-SIS-FRIEND-1022；回 BB 10-22 05:02）：學姊升到朋友那三句——不需要瀏覽器。
//   BB 照玩家測：剛好在一盞（約她去喝茶）升到朋友，她先「（她把筆電闔上。）」，下一句又說「這裡不能讀書。」——說不通。
//   0 讀稿：兩個版本的三句都逐字在 AA_383 第 6 節
//   1 約出去、地點不是她讀書的地方（一盞、半熟、麵店、溫州街）：「（她把手機收進包包。）」「今天什麼都沒帶。難得。」「這一次我請你。」
//   2 Café、總圖約見面，和在 3D 裡直接找她說話（沒有見面地點）：照原本筆電那一版
//   3 真的在一盞見面（INV.meet）：升到朋友演的是第 1 項那一版；在 Café 見面是筆電那一版
// 修改前（開發分支 c89f17df）：第 1、3（一盞）項 FAIL。用法：node tests/aa383_s6_unit.js
const H=require('./pg_harness.js');
const cp=require('child_process');
const {check,GM,E}=H;
const J=JSON.stringify, ID='heroine_05';
const NEW=['（她把手機收進包包。）','「今天什麼都沒帶。難得。」','「這一次我請你。」'], OLD=['（她把筆電闔上。）','「今天寫完了，難得。」','「你要吃什麼？我請你。」'];
let doc=''; try{ doc=cp.execSync('git show 67b7b2ca:"docs/story_planning/AA_383_回BB_0400_五題_台詞與企劃對不上.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}
const sec=(doc.split('## 6.')[1]||'').split('\n## ')[0];
check('0. 讀稿：兩個版本的三句都逐字在 AA_383 第 6 節',sec.length>100&&NEW.every(t=>sec.includes(t))&&OLD.every(t=>sec.includes(t)),sec.slice(0,80));
const setup=()=>{ const G=H.fresh('2026-03-10',15,'campus',{met_sis:true,SIS_W1:true}); H.FRIEND(ID); G.social.relUp={}; return G; };
const up=ctx=>{ setup(); const U=SOCIAL.upLine(ID,ctx); return U?{stage:U.stage,l:U.l}:null; };
const r1=['teahouse','brunch','noodle','wenzhou'].map(p=>up({place:p,outing:true}));
check('1. 約在一盞、半熟、麵店、溫州街：升到朋友＝手機收進包包那一版',r1.every(u=>u&&u.stage==='FRIEND'&&J(u.l)===J(NEW)),J(r1));
const r2=[up({place:'cafe',outing:true}),up({place:'library',outing:true}),up()];
check('2. 約在 Café、總圖，和直接找她說話（沒有見面地點）：照原本筆電那一版',r2.every(u=>u&&u.stage==='FRIEND'&&J(u.l)===J(OLD)),J(r2));
(async()=>{
  const meetAt=async place=>{ const G=setup(); G.zone=INV.place(place).zone; const iv=INV.accept(G,ID,place,G.day,15,{by:'player'}); const n={id:ID,obj:{position:{x:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle'}; GM.npc={}; GM.npc[ID]=n; E.npcs=[n];
    H.said=[]; H.picks=[0,0,0,0]; await INV.meet(GM,iv,n); return H.said.map(s=>s.t); };
  const tea=await meetAt('teahouse'), cafe=await meetAt('cafe');
  check('3. 真的在一盞見面：演手機收進包包那一版，沒有筆電那一句',NEW.every(t=>tea.includes(t))&&!tea.includes(OLD[0]),J(tea.slice(0,6)));
  check('3. 在 Café 見面：照原本筆電那一版',OLD.every(t=>cafe.includes(t))&&!cafe.includes(NEW[0]),J(cafe.slice(0,6)));
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
