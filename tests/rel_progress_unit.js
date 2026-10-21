// 人物頁的進度條（D36；AA_126 4-1、AA_128 3-2：關係六階段，友情和戀愛分開，有進度條、不顯示數字）——不需要瀏覽器。
// 檢查 DATE.progress：友情往第 4 階、戀愛（七位）往第 5、6 階，提示寫還差哪一種；第 6 階以後是告白的條件（四次、心願）；交往中只寫交往中；男生朋友只有友情；
//       人物頁（game3d.js personHTML）接上 progHTML，條只用寬度、不印數字。
// 修改前：沒有 DATE.progress，全部 FAIL。用法：node tests/rel_progress_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/events.js','src/social3d.js','src/data/date_locations.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const has=typeof DATE!=='undefined'&&typeof DATE.progress==='function';
let G=null; const fresh=()=>{ G={day:40,hour:12,flags:{},events:{done:{},last:{},count:0},rel:{},social:null,dateLog:{}}; SOCIAL.bind(G); };
const set=(id,o)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:0,trust:0,comf:0,rom:0,npcRom:0},o); };
const P=id=>has?DATE.progress(G,id):null;
const H='heroine_02';
fresh(); set(H,{fam:10}); let p=P(H);
check('1. 不太認識（熟悉 10）：友情條一半、「再熟一點」；戀愛條空的、沒有提示',!!p&&Math.abs(p.fr.pct-0.5)<1e-9&&p.fr.hint==='再熟一點'&&p.rom&&p.rom.pct===0&&p.rom.hint==='',JSON.stringify(p));
set(H,{fam:45,trust:10}); p=P(H);
check('2. 有點熟（熟悉 45、信任 10）：差信任＝「再多信任一點」',!!p&&p.fr.hint==='再多信任一點'&&Math.abs(p.fr.pct-0.4)<1e-9,JSON.stringify(p));
set(H,{fam:50,trust:30,comf:10}); p=P(H);
check('3. 朋友（自在 10）：往好朋友差自在（暫代「相處再自在一點」）',!!p&&p.fr.hint===DATE.PROG_HINT.comf&&p.fr.pct<0.3,JSON.stringify(p));
set(H,{fam:50,trust:30,comf:10,npcRom:10}); p=P(H);
check('4. 朋友、她的戀愛 10：戀愛條 1/3、「她還沒有那樣看你」',!!p&&Math.abs(p.rom.pct-1/3)<1e-9&&p.rom.hint==='她還沒有那樣看你',JSON.stringify(p));
set(H,{fam:50,trust:30,comf:10,npcRom:35}); p=P(H);
check('5. 第 5 階但還不是好朋友：戀愛條最多一半、「先成為好朋友」（暫代）',!!p&&p.rom.pct<=0.5&&p.rom.hint===DATE.PROG_HINT.close,JSON.stringify(p));
set(H,{fam:70,trust:50,comf:45,npcRom:40,rom:10}); p=P(H);
check('6. 好朋友、第 5 階：往第 6 階差祐廷的戀愛（暫代「你這邊還沒想清楚」）；友情條滿、沒有提示',!!p&&p.fr.pct===1&&p.fr.hint===''&&p.rom.hint===DATE.PROG_HINT.rom,JSON.stringify(p));
set(H,{fam:70,trust:50,comf:45,npcRom:60,rom:35}); G.dateLog[H]={count:2,wishKnown:false,wish:false}; p=P(H);
check('7. 第 6 階、出去兩次：「再多一些兩個人出去的時間」（AA_128 3-2）',!!p&&p.rom.hint==='再多一些兩個人出去的時間'&&p.rom.pct<0.5,JSON.stringify(p));
G.dateLog[H]={count:4,wishKnown:false,wish:false}; p=P(H); const a=p&&p.rom.hint;
G.dateLog[H]={count:4,wishKnown:true,wish:false}; p=P(H); const b=p&&p.rom.hint, wn=DATE.wishName(G,H);
G.dateLog[H]={count:4,wishKnown:true,wish:true}; p=P(H); const c=p&&p.rom;
check('7b. 四次以後：還不知道心願＝「她好像有一個很想去的地方」；知道了還沒去＝「她提過想去〔她的心願地點〕」；都做到＝條滿、沒有提示',a==='她好像有一個很想去的地方'&&b==='她提過想去'+wn&&!!wn&&c&&c.pct===1&&c.hint==='',JSON.stringify({a,b,wn,c}));
G.flags['dating_'+H]=true; p=P(H);
check('8. 交往中：只回 {dating:true}（人物頁寫「交往中」）',!!p&&p.dating===true&&!p.fr);
fresh(); set('zhe',{fam:30,trust:30}); p=P('zhe');
check('9. 男生朋友（阿哲）：只有友情那一條',!!p&&!!p.fr&&p.rom===null,JSON.stringify(p));
{ const s=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), i=s.indexOf('function progHTML('), j=s.indexOf('\n',s.indexOf('\n',s.indexOf('\n',s.indexOf('\n',i)+1)+1)+1), f=s.slice(i,j), k=s.indexOf('function personHTML(');
  check('10. 人物頁接上進度條（personHTML 用 progHTML）；條只用寬度（width:%），不印數字；交往中寫「交往中」',i>=0&&s.slice(k,k+2000).includes('progHTML(id)')&&/width:'\+Math\.round/.test(f)&&!/pct\*100\)\+'%</.test(f)&&f.includes('交往中'),f.slice(0,200)); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
