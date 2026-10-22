// AA_313 6-5 的程式項目（第 8、10、11 點）——不需要瀏覽器。
//   8. 學姊交往以後：聯絡人名稱是「書瑀」，手機上她的訊息也顯示「書瑀」（存的 name 是「溫學姊」也一樣）；沒交往照舊；
//      Café 的小交流「今天寫了兩份考古題。」大二起（她念碩士）換「今天改了兩段論文。」。
//   10. 法服的「研究所學姊」名字框＝「雅筑學姊」（AA-C 35933478）。
//   11. 沛珊：ev_peishan_split 兩句對調（先說分開了），和 ev_peishan_bohan_split 互斥（同一件事只聽一次）。
// 修改前 8、11 FAIL。用法：node tests/aa313_s65_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|SOCIAL|CALENDAR|PHONE|REL_LINES|STORY_EVENTS|SMALLTALK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/rel_lines.js','src/social3d.js','src/phone3d.js','src/data/events.js']) load(f);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const G={day:400,hour:10,flags:{},social:null,msgs:[],phone:{groups:{},seen:{},q:[],n:0}}; SOCIAL.bind(G);
const m={th:'g:family_law',from:'heroine_05',name:'溫學姊',text:'學弟好。'};
check('8. 沒交往：聯絡人名稱照關係、訊息照存的名字「溫學姊」', SOCIAL.contactName('heroine_05')!=='書瑀'&&PHONE.who(m)==='溫學姊', SOCIAL.contactName('heroine_05')+' / '+PHONE.who(m));
G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true;   /* 開始交往那天記（romance3d.js ROM.start；never_set_flags_unit 第 5 節）：datingName 讀它 */
check('8. 交往中：聯絡人名稱「書瑀」、她的訊息也顯示「書瑀」', SOCIAL.contactName('heroine_05')==='書瑀'&&PHONE.who(m)==='書瑀', SOCIAL.contactName('heroine_05')+' / '+PHONE.who(m));
delete G.flags.dating_heroine_05; G.flags.romance={heroine_05:{status:'dating'}};
check('8. 新的感情紀錄（romance.status＝dating）也算', PHONE.who(m)==='書瑀');
G.flags.romance={heroine_05:{status:'ex'}};
check('8. 分手以後回到「溫學姊」', PHONE.who(m)==='溫學姊');
{ const sm=REL_LINES.heroine_05.cafe.small.find(q=>q.l[0]==='「今天寫了兩份考古題。」'); const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
  check('8. Café 小交流：大二起換「今天改了兩段論文。」', !!sm&&sm.lGrad&&sm.lGrad[0]==='「今天改了兩段論文。」'&&/it\.lGrad&&T&&!\/\^Y1\/\.test\(T\.id\)\?it\.lGrad:it\.l/.test(st)); }
{ const a=STORY_EVENTS.find(e=>e.id==='ev_peishan_split'), b=STORY_EVENTS.find(e=>e.id==='ev_peishan_bohan_split'); const t=a.dialogue.filter(l=>l.text).map(l=>l.text);
  check('11. 沛珊 ev_peishan_split：先「我們上週分開了。我自己說的。」再說原因', t[0]==='我們上週分開了。我自己說的。'&&t[1]==='柏翰說他不懂。……他沒有錯。我們想要的東西不一樣。', JSON.stringify(t));
  check('11. 同一件事只聽一次（AA_374 第 18 項起合併成 ev_peishan_split）：ev_peishan_split 不演給演過 ev_peishan_bohan_split 的舊存檔；ev_peishan_bohan_split 不再演', (a.prereq.notEvents||[]).includes('ev_peishan_bohan_split')&&typeof b.prereq.custom==='function'&&b.prereq.custom({flags:{},events:{done:{}}})===false); }
{ const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
  check('10. 法服的「研究所學姊」名字框改「雅筑學姊」（AA-C 35933478；不會被當成溫書瑀）', !/研究所學姊/.test(st)&&/S\.FAFU_OPEN=\[\['雅筑學姊','今天兩桌。你跟我。'\]/.test(st)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
