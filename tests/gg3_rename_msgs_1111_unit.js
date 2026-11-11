// 舊存檔：手機訊息、筆記裡的「日日定食」換成「泰米村食」（BB 11-11 19:25 GG-SHOPS3 RENAME 2 FAIL；D141 畫面上有舊店名＝擋的那一類）——不需要瀏覽器（D131）。
// CC 雲端 b77af3a4f：舊存檔讀回後 G.outings、手機「今天」換了，但 G.msgs（Kevin 群組「學姊上榜聚餐！這週五七點，公館的日日定食。…」）和 G.notes.mx_fm1 的 body 還是舊字。
// 檢查（GG3.migrate，game3d.js 讀檔叫）：
//   1. G.msgs 每一則的字（含回覆選項的字）、還沒送到的 G.phone.q 都換；其他「定食」、不相干的訊息不動
//   2. 明軒清單筆記 mx_fm1（舊的寫「日日定食｜今日定食（只有午餐）　95…晚餐一百二」）整份換成現在的 STORY.MX_FM1（泰米村食那一列的菜、價錢也對）；別的筆記有舊店名只換店名
//   3. 換完記 flags.GG3_REN；再讀一次＝0、不重複；行程（outings）照舊換
//   4. 換完整份存檔（訊息、筆記、行程）沒有「日日定食」
// 修改前（4e5a9a47c）：第 1、2、3 項 FAIL。用法：node tests/gg3_rename_msgs_1111_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=H.ROOT, rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), J=JSON.stringify;
console.warn=()=>{};
for(const f of ['src/data/tz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/data/gg3_shops_lines.js','src/gg3shops3d.js']){
  let s=rd(f); s=s.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
check('0. 載得到 GG3.migrate、STORY.MX_FM1',typeof GG3!=='undefined'&&typeof GG3.migrate==='function'&&!!STORY.MX_FM1&&typeof STORY.MX_FM1.body==='string');
/* 舊的明軒清單筆記（4e5a9a47c 以前 story3d.js 的 S.MX_FM1.body：第三名是日日定食）*/
const OLDROWS=[['林家乾麵（溫州街）','小碗乾麵＋貢丸湯','100','飽足感除以價錢，第一名。沒有之一。'],['公館燒臘','叉燒飯','90','湯免費，這點加分。阿姨有時候多切一片叉燒，這個不能算進排名。'],
  ['日日定食','今日定食（只有午餐）','95','剛好卡在一百以內。晚餐一百二，不算。'],['洋洋鹹酥雞','自己夾','80 以內','技巧：豆干多夾，肉少夾。']];
const oldBody='按 CP 值排。不接受申訴。<br>'+OLDROWS.map((r,i)=>(i+1)+'. '+r[0]+'｜'+r[1]+'　'+r[2]+'<br>　'+r[3]).join('<br>')+'<br>'+STORY.MX_FM1.tail;
const save=()=>({flags:{},
  outings:[{id:'sis_m3_dinner',place:'公館的日日定食',title:'學姊上榜聚餐'}],
  msgs:[{th:'g:family',from:'classmate_kevin',text:'學姊上榜聚餐！這週五七點，公館的日日定食。這次我們請學姊',tag:'sisg_rank_dinner',ask:{id:'sisg_rank_dinner_q',opts:[{t:'去。'},{t:'公館的日日定食？好。'}]}},
    {th:'p:classmate_mingxuan',from:'classmate_mingxuan',text:'📝 公館一百元以內（明軒版）。按 CP 值排。不接受申訴。',tag:'mx_fm1'},
    {th:'p:x',from:'x',text:'今天吃雞腿定食。',tag:'other'}],
  phone:{q:[{day:9,h:21,m:{th:'g:family',text:'學姊上榜聚餐！下週五七點，公館的日日定食。全家族。'}}],groups:{}},
  notes:[{id:'mx_fm1',title:'公館一百元以內（明軒版）',body:oldBody,day:3},{id:'memo_x',title:'日日定食的收據',body:'公館・日日定食 95 元',day:4},{id:'law_1',title:'民法',body:'定食不是法律名詞。',day:5}]});
const s=save(), n=GG3.migrate(s);
// 1
check('1. Kevin 群組那則（含回覆選項）換成汀州路的泰米村食',s.msgs[0].text==='學姊上榜聚餐！這週五七點，汀州路的泰米村食。這次我們請學姊'&&s.msgs[0].ask.opts[1].t==='汀州路的泰米村食？好。'&&s.msgs[0].ask.opts[0].t==='去。'&&s.msgs[0].tag==='sisg_rank_dinner',J(s.msgs[0]));
check('1. 還沒送到的訊息（phone.q）也換；不相干的訊息（雞腿定食）不動',s.phone.q[0].m.text==='學姊上榜聚餐！下週五七點，汀州路的泰米村食。全家族。'&&s.msgs[2].text==='今天吃雞腿定食。'&&s.msgs[1].text==='📝 公館一百元以內（明軒版）。按 CP 值排。不接受申訴。',J([s.phone.q,s.msgs[1],s.msgs[2]]));
// 2
check('2. 明軒清單筆記整份換成現在的 STORY.MX_FM1（泰米村食那一列：午間打拋豬肉飯 95、晚上一百一）',s.notes[0].body===STORY.MX_FM1.body&&s.notes[0].title===STORY.MX_FM1.title&&s.notes[0].body.indexOf('泰米村食（汀州路）｜午間打拋豬肉飯（只有午餐）　95')>=0&&s.notes[0].day===3,J(s.notes[0]).slice(0,300));
check('2. 別的筆記有舊店名只換店名；沒有的不動',s.notes[1].title==='泰米村食的收據'&&s.notes[1].body==='汀州路・泰米村食 95 元'&&s.notes[2].body==='定食不是法律名詞。',J(s.notes.slice(1)));
// 3
check('3. 這次換了 7 處（行程 1、訊息 3、筆記 3）；記 flags.GG3_REN；再讀一次＝0',n===7&&s.flags.GG3_REN===true&&GG3.migrate(s)===0,J({n,f:s.flags}));
{ const t=save(); t.flags.GG3_REN=true; const m=GG3.migrate(t); check('3. 已經記過 GG3_REN＝訊息、筆記不再掃（行程照舊換）',m===1&&t.msgs[0].text.indexOf('日日定食')>=0&&t.outings[0].place==='汀州路的泰米村食',J({m})); }
{ const t=save(); delete t.flags; delete t.msgs; delete t.notes; delete t.phone; let ok=true; try{ GG3.migrate(t); GG3.migrate({}); GG3.migrate(null); }catch(e){ ok=false; } check('3. 存檔沒有 flags／msgs／notes／phone（很舊的存檔）不丟例外',ok&&t.outings[0].place==='汀州路的泰米村食'); }
// 4
check('4. 換完整份存檔（行程、訊息、還沒送到的、筆記）沒有「日日定食」',J(s).indexOf('日日定食')<0,J(s).match(/.{20}日日定食.{10}/));
check('4. game3d.js 讀檔照舊叫 GG3.migrate',/typeof GG3!=='undefined'&&GG3\.migrate\)\{ try\{ GG3\.migrate\(s\)/.test(rd('src/game3d.js')));
H.done();
