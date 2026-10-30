// AA_489 第 1、2 節（AA-C 2026-10-27，企劃線 c4bcf86f6；句子照抄）——不需要瀏覽器。
//   1. ev_sis_club_expo：學姊現在一直站在法服的帳篷前面（CLUBFAIR-REAL-1027），「從帳篷後面走出來」的兩句換掉
//   2. 社博那天學姊的手機地點：「椰林大道（社團博覽會，法服的攤位，到下午四點）」（characters.js 社博那一筆的 label＝STORY.whereIs 顯示的字）
// 修改前（e6d44be02）：兩項都 FAIL。用法：node tests/aa489_lines_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const EV=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8'), CH=fs.readFileSync(path.join(ROOT,'src/data/characters.js'),'utf8');
const i0=EV.indexOf("id:'ev_sis_club_expo'"), sis=i0<0?'':EV.slice(i0,EV.indexOf("{ id:'",i0+10));
check('1. 還沒見過：「（帳篷前面站著一個綁馬尾的人，手上拿著一疊傳單。你認得她——家族群組大頭貼上那個學姊。）」',sis.includes("text:'（帳篷前面站著一個綁馬尾的人，手上拿著一疊傳單。你認得她——家族群組大頭貼上那個學姊。）'"));
check('1. 見過：「（站在帳篷前面那個綁馬尾的人轉過來，看到你。）」',sis.includes("{label:'main'},{speaker:null,text:'（站在帳篷前面那個綁馬尾的人轉過來，看到你。）'}"));
check('1. 不再有「帳篷後面走出來」',!!sis&&!/帳篷後面走出來/.test(sis));
check('2. 社博那天學姊的手機地點',/label:'椰影大道（社團博覽會，法服的攤位，到下午四點）',[^\n]*|daily_schedule:\[\{[^\n]*activity:'club_expo_y1s1'[^\n]*label:'椰影大道（社團博覽會，法服的攤位，到下午四點）'/.test(CH));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
