// 女主角主動傳來的訊息可以用選項回（MSG-REPLY-1107，USER_WANTS X262；台詞 AA_709 bc0e755be）——不需要瀏覽器（D131）。
// 使用者 11-07 試玩：「至少他們傳給我 可以給我選項回覆 依照選項增加或降低好感」「芯慈 我又不能回 他問我 我睡了嗎」
// 檢查：
//   0. src/data/msg_replies.js 和 AA_709@bc0e755be 一致（import_msg_replies.py --check）
//   1. 芯慈「你睡了嗎」那一串：最後一則「當我沒說」送出時掛上三個選項；回了＝祐廷那一句、她接著回、好感照稿；回過就不能再回
//   2. 一樣的字、別人傳的（或群組）不掛；本來就有選項的訊息不動；別的訊息不掛
//   3. 一天半以後選項收起來（沒回不扣分）
// 修改前 1～3 FAIL（沒有 MSGR）。用法：node tests/msg_reply_unit.js
const H=require('./pg_harness.js');
const {check}=H;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
const ok1=loadG('src/data/msg_replies.js',['MSG_REPLIES']), ok2=loadG('src/msgreply3d.js',['MSGR']);
const J=JSON.stringify;
{ let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_msg_replies.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
  check('0. src/data/msg_replies.js 和 AA_709@bc0e755be 一致（import_msg_replies.py --check）',ok1&&ok2&&ok,out.trim().slice(0,200)); }
if(ok2){
  const G=H.fresh('2025-10-20',23.5,'dorm'); const id='classmate_xinci', E=MSG_REPLIES.people[id][0];
  for(const t of ['你睡了嗎','沒睡也不用回','我在追的那部劇，這集太扯了']) PHONE.post(G,{th:'p:'+id,from:id,text:t});
  const m=PHONE.post(G,{th:'p:'+id,from:id,text:'當我沒說'});
  check('1. 芯慈「當我沒說」送出：掛上 AA_709 的三個選項',!!m.ask&&J(m.ask.opts.map(o=>o.t))===J(E.opts.map(o=>o.t))&&PHONE.askOpen(G,m),J(m.ask));
  const r0=Object.assign({},SOCIAL.rel(id)); const r=PHONE.answer(G,m.ask.id,1); const r1=SOCIAL.rel(id), o=E.opts[1];
  const th=G.msgs.filter(x=>x.th==='p:'+id).map(x=>(x.from==='player'?'我：':'')+x.text);
  check('1. 回第 2 個：祐廷那一句貼上去、她接著回（逐字）',!!r&&th.includes('我：'+o.t)&&o.say.every(t=>th.includes(t)),J(th));
  check('1. 好感照稿（'+J(o.rel)+'）',Object.keys(o.rel).every(k=>((r1[k]||0)-(r0[k]||0))===o.rel[k]),J({r0,r1}));
  check('1. 回過就不能再回',!PHONE.askOpen(G,m)&&PHONE.answer(G,m.ask.id,0)===null);
  const g=PHONE.post(G,{th:'p:heroine_01',from:'heroine_01',text:'當我沒說'}), g2=PHONE.post(G,{th:'g:law1',from:id,text:'當我沒說'}), g3=PHONE.post(G,{th:'p:'+id,from:id,text:'晚安'});
  check('2. 一樣的字別人傳的、在群組、別的訊息：不掛',!g.ask&&!g2.ask&&!g3.ask,J([g.ask,g2.ask,g3.ask]));
  const pre=PHONE.post(G,{th:'p:'+id,from:id,text:'當我沒說',ask:{opts:[{t:'原本的'}]}}); check('2. 本來就有選項的不動',pre.ask.opts.length===1&&pre.ask.opts[0].t==='原本的');
  const G2=H.fresh('2025-10-21',23.5,'dorm'); const m2=PHONE.post(G2,{th:'p:'+id,from:id,text:'當我沒說'}); G2.day+=2;
  check('3. 一天半以後沒回：選項收起來、好感不變',!!m2.ask&&!PHONE.askOpen(G2,m2)&&(SOCIAL.rel(id).comf|0)===0,J(m2.ask&&m2.ask.until));
  const all=Object.entries(MSG_REPLIES.people).every(([k,L])=>L.every(e=>e.opts.length>=2&&e.opts.every(q=>q.t&&Array.isArray(q.say))));
  check('0. 七個人 21 串，每串 2～4 個選項',all&&Object.values(MSG_REPLIES.people).reduce((a,L)=>a+L.length,0)>=20);
}
H.done();
