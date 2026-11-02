// 學姊（heroine_05）稱呼規則窮舉：5 種關係狀態 × 每一個用到稱呼的字串。用法：node sis_name_audit.js <worktree>
'use strict';
const path=require('path'), fs=require('fs');
const WT=path.resolve(process.argv[2]);
const H=require(path.join(WT,'tests/pg_harness.js'));
const load=f=>{ let src=fs.readFileSync(path.join(WT,f),'utf8'); src=src.replace(/^const (FAV)\s*=/mg,'globalThis.$1='); require('vm').runInThisContext(src,{filename:f}); };
load('src/foodfav3d.js');
const S5='heroine_05', NAME='祐廷';
const STATES=['沒見過','認識沒交往','交往中','分手','挽回中'];
function setState(st){
  const G=H.fresh('2026-10-14',12,'campus',st==='挽回中'?{US2:'repair',MET_LONG:true}:{}); G.name=NAME; G.contacts=G.contacts||{}; G.msgs=G.msgs||[];
  if(st==='沒見過') return G;
  H.CLOSE(S5); SOCIAL.meet&&SOCIAL.meet(S5,'campus'); H.CLOSE('heroine_01'); SOCIAL.meet&&SOCIAL.meet('heroine_01','campus');
  if(st==='認識沒交往') return G;
  G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true; const r=ROM.get(G,S5); r.status='dating';
  if(st==='交往中') return G;
  ROM.end(G,S5,'apart_talk'); return G;
}
const rows=[]; const add=(item,st,str,exp,where)=>rows.push({item,st,str,exp,where});
// gradOpt：直接取 game3d.js 那一行的運算式
const gsrc=fs.readFileSync(path.join(WT,'src/game3d.js'),'utf8'); const gl=gsrc.split('\n').findIndex(l=>/const gradOpt=/.test(l));
const gradOpt=eval('('+gsrc.split('\n')[gl].match(/const gradOpt=(\(\)=>[^;]*);/)[1]+')');
// 她的台詞裡含 {name} 的句子（階梯、rel_lines、邀約）
const nameLines=[]; const walk=(o,p)=>{ if(typeof o==='string'){ if(o.includes('{name}')) nameLines.push([p,o]); return; } if(o&&typeof o==='object') for(const k of Object.keys(o)) walk(o[k],p+'.'+k); };
for(const t of Object.keys(LADDER.byTerm||{})) if(LADDER.byTerm[t][S5]) walk(LADDER.byTerm[t][S5],'LADDER.byTerm.'+t+'.'+S5);
if(REL_LINES[S5]) walk(REL_LINES[S5],'REL_LINES.'+S5); if(INVITE_DATA.people[S5]) walk(INVITE_DATA.people[S5],'INVITE_DATA.people.'+S5);
if(INVITE_DATA.lawlibLines&&INVITE_DATA.lawlibLines[S5]) walk(INVITE_DATA.lawlibLines[S5],'INVITE_DATA.lawlibLines.'+S5);
const subst=t=>t.replace(/\{name\}/g,NAME);   // game3d.js:90 / events3d.js:97 的做法
(async()=>{
for(const st of STATES){ const G=setState(st); const dating=st==='交往中';
  add('displayName',st,SOCIAL.displayName(S5),st==='沒見過'?'不露名字':'溫書瑀','social3d.js:80');
  add('npcName',st,SOCIAL.npcName(S5),st==='沒見過'?'不露名字':'溫書瑀','social3d.js:161');
  add('datingName',st,String(SOCIAL.datingName(S5)),dating?'溫書瑀':'null','social3d.js:168');
  add('contactName',st,String(SOCIAL.contactName(S5)),dating?'貝貝':'非「貝貝」','social3d.js:170');
  add('gradOpt 選項',st,gradOpt(),dating?'讀她給的那篇文章':'讀學姊給的那篇文章','game3d.js:'+(gl+1));
  { H.opts=[]; H.picks=[1]; await FAV.pick(H.GM,S5); add('FAV.pick 選項',st,(H.opts[0]||[])[0],dating?'也幫她點一杯':'也幫學姊點一杯','foodfav3d.js:60'); }
  { SOCIAL.feel={}; SOCIAL.feelStage={}; SOCIAL.capNotes=[]; SOCIAL.feel[S5]={fam:2}; const a=SOCIAL.takeFeel(3); add('takeFeel 只有她',st,a.join('|')||'(無)',st==='沒見過'?'(無)':(dating?'和她熟了一點。':'和溫學姊?熟了一點'),'social3d.js:28');
    SOCIAL.feel={}; SOCIAL.feelStage={}; SOCIAL.feel[S5]={fam:2}; SOCIAL.feel.heroine_01={fam:1}; const b=SOCIAL.takeFeel(3); add('takeFeel 有別人',st,b.join('|')||'(無)',dating?'含「和溫書瑀熟了一點。」、無「和她」':'無「和她」','social3d.js:28'); SOCIAL.feel={}; }
  { const m0=STORY.rideMode,i0=STORY.rideInfo; STORY.rideMode=()=>'walk'; STORY.rideInfo=()=>({mode:'walk'}); const sis={charId:S5,beh:'follow'},an={charId:'heroine_01',beh:'follow'};
    add('rideBlock 只有她',st,STORY.rideBlock({G,E:{npcs:[sis]}},sis),dating?'（她說她走路就好。）':'（<displayName>說她走路就好。）','story3d.js:837');
    add('rideBlock 有別人',st,STORY.rideBlock({G,E:{npcs:[sis,an]}},sis),'（<displayName>說她走路就好。）','story3d.js:838'); STORY.rideMode=m0; STORY.rideInfo=i0; }
  for(const t of ['和溫學姊吃飯','和學姊去溫州街','直屬學姊的訊息','登山社的學姊','溫書瑀學姊','學姊溫書瑀','溫學姊（溫書瑀）'])
    add('shuyuT('+t+')',st,SOCIAL.shuyuT(t),'—','social3d.js:164');
  try{ const g=STORY.ladGreet&&STORY.ladGreet(G,S5); if(g) add('ladGreet（10/14 學期）',st,subst(g),'—','story3d ladGreet'); }catch(e){}
  for(const [p,t] of nameLines) add('{name}句 '+p,st,subst(t),dating?'含「林祐廷」（AA_584 §9-3）':'含「祐廷」、無「林」','data');
}
// 交往中的招呼（Y4S1，第 72 列那一格）
{ const G=H.fresh('2029-09-20',15,'campus'); G.name=NAME; H.CLOSE(S5); SOCIAL.meet(S5,'campus'); H.date(S5); G.flags.CALLED_SHUYU=true; let g=null; try{ g=STORY.ladGreet(G,S5);}catch(e){ g='ERR '+e.message; }
  add('ladGreet Y4S1 交往中（第 72 列）',`交往中`,g?subst(g):'(無)','林祐廷。……沒事。叫一下。','ladder.js:3 Y4S1 greet.when[5]'); }
// 判定
const DUP=/林林|溫溫|學姊學姊|書瑀書瑀|溫書瑀溫書瑀|貝貝貝貝|她她/;
const viol=[];
for(const r of rows){ const s=String(r.str); const bad=[];
  if(DUP.test(s)) bad.push('(b) 重複字');
  if(r.st==='沒見過'&&/溫|書瑀|貝貝/.test(s)&&!/^shuyuT/.test(r.item)) bad.push('(d) 沒見過露名字');
  if(/林祐廷/.test(s)&&r.st!=='交往中') bad.push('(a) 非交往中用了林{name}');
  if(r.item.startsWith('{name}句')&&r.st==='交往中'&&!/林祐廷/.test(s)) bad.push('(a) 交往中沒換成林{name}');
  if(r.item.startsWith('ladGreet Y4S1')&&s!==r.exp) bad.push('(a) 第72列');
  if(/^(gradOpt|FAV)/.test(r.item)&&s!==r.exp) bad.push('(c) 選項');
  if(r.item==='takeFeel 只有她'&&r.st==='交往中'&&s!=='和她熟了一點。') bad.push('(c) 提示');
  if(r.item==='takeFeel 有別人'&&/和她/.test(s)) bad.push('(c) 有別人卻用她');
  if(/^rideBlock/.test(r.item)){ const e=r.exp.replace('<displayName>',SOCIAL.displayName(S5)); /* displayName 在這裡是最後一個狀態的；改比對「她說」*/ if(r.item==='rideBlock 只有她'&&r.st==='交往中'?s!=='（她說她走路就好。）':/^（她說/.test(s)) bad.push('(c) 旁白'); }
  if(r.item==='datingName'&&s!==r.exp) bad.push('(a) datingName');
  if(r.item==='contactName'&&(r.st==='交往中'?s!=='貝貝':s==='貝貝')) bad.push('(a) contactName');
  if(bad.length) viol.push(Object.assign({bad},r)); }
fs.writeFileSync(path.join(__dirname,'out_rows.json'),JSON.stringify(rows,null,1));
const items=new Set(rows.map(r=>r.item.replace(/^shuyuT.*/,'shuyuT')));
console.log('rows',rows.length,'items',new Set(rows.map(r=>r.item)).size,'nameLines',nameLines.length);
for(const v of viol) console.log('VIOL',v.bad.join(','),'|',v.item,'|',v.st,'|',v.str,'| 預期',v.exp,'|',v.where);
console.log('viol',viol.length); process.exit(0);
})();
