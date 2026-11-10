// 女主角主動傳來的訊息可以用選項回（MSG-REPLY-1107，USER_WANTS X262；台詞 AA_709 c8cceccf9）——不需要瀏覽器（D131）。
// 使用者 11-07 試玩：「至少他們傳給我 可以給我選項回覆 依照選項增加或降低好感」「芯慈 我又不能回 他問我 我睡了嗎」
// 檢查：
//   0. src/data/msg_replies.js 和 AA_709@1e9257401 一致（import_msg_replies.py --check）
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
  check('0. src/data/msg_replies.js 和 AA_709@1e9257401 一致（import_msg_replies.py --check）',ok1&&ok2&&ok,out.trim().slice(0,200)); }
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
  check('0. 每串 2～4 個選項、至少 30 串',all&&Object.values(MSG_REPLIES.people).reduce((a,L)=>a+L.length,0)>=30);
}
if(ok2){
  /* 4 AA 新寫的五串（new）：那一週的週三照時間排進手機、只排一次；要聯絡方式、條件 */
  const NEW=[]; for(const [id,L] of Object.entries(MSG_REPLIES.people)) L.forEach((e,i)=>{ if(e.new) NEW.push({id,i,e}); });
  check('4. AA 新寫的五串都在（new）',NEW.length===5,J(NEW.map(x=>x.id)));
  const kx=NEW.find(x=>x.id==='kexin'&&x.e.new.week===9); const d=MSGR.newDay(kx.e.new);
  { const G=H.fresh('2025-10-27',9,'dorm'); G.day=d; G.contacts={kexin:1}; G.phone=null; MSGR.tick({G}); const q=(G.phone&&G.phone.q)||[];
    check('4. 可昕「被叫妹妹」：那一週（Y1S1 第 9 週）週三排進手機（PHONE.at，tag 一次）、時間照稿',q.some(x=>x.tag==='r709new:kexin:'+kx.i&&x.day===d&&Math.abs(x.h-kx.e.new.h)<0.01),J(q.slice(-1)));
    const n0=q.length; MSGR.tick({G}); check('4. 再跑一次 tick 不重複排',((G.phone&&G.phone.q)||[]).length===n0); }
  { const y=NEW.find(x=>x.id==='heroine_03'); const run=(contact,met)=>{ const G=H.fresh('2026-03-23',9,'dorm'); G.day=MSGR.newDay(y.e.new); G.contacts=contact?{heroine_03:1}:{}; G.flags.YT_MET_JOB=met?true:undefined; if(!met) delete G.flags.YT_MET_JOB; MSGR.tick({G}); return ((G.phone&&G.phone.q)||[]).some(x=>x.tag==='r709new:heroine_03:'+y.i); };
    const a1=run(false,true), a2=run(true,false), a3=run(true,true);
    check('4. 語彤「捷運蘭花」：沒有聯絡方式不排、還沒在一盞認識（YT_MET_JOB）不排、兩個都有才排',!a1&&!a2&&a3,J({noContact:a1,notMet:a2,ok:a3})); }
  const sis=NEW.find(x=>x.id==='heroine_05'&&x.e.new.cond==='stage:3');
  { const G=H.fresh('2026-04-20',9,'dorm'); G.day=MSGR.newDay(sis.e.new); G.contacts={heroine_05:1}; MSGR.tick({G}); const no=!((G.phone&&G.phone.q)||[]).some(x=>(x.tag||'').indexOf('heroine_05')>0);
    H.CLOSE('heroine_05'); MSGR.tick({G}); const yes=((G.phone&&G.phone.q)||[]).some(x=>x.tag==='r709new:heroine_05:'+sis.i);
    check('4. 學姊「奶奶貼圖」要階段 ≥3：不到不排、到了排',no&&yes,J({no,yes})); }
  /* 5 芯慈「過了吧？」那一串：不再寫死祐廷的回覆，改成三個選項 */
  { const src=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'); const X=MSG_REPLIES.people.classmate_xinci.find(e=>e.text==='過了吧？……我的筆記功不可沒。');
    check('5. 芯慈「過了吧？」：story3d.js 不再寫死「請妳吃飯。」，AA_709 第三批三個選項（第一個＝原本那句）',!/text:'請妳吃飯。'/.test(src)&&X&&X.opts.length===3&&X.opts[0].t==='過了。請妳吃飯。',J(X&&X.opts.map(o=>o.t))); }
  /* 6 選項講了自己的事（tell）：記 YT_TOLD；收到那一串記 set */
  { let hit=null; for(const [id,L] of Object.entries(MSG_REPLIES.people)) L.forEach((e,i)=>{ const k=e.opts.findIndex(o=>o.tell); if(k>=0&&!hit&&!e.new) hit={id,e,k}; });
    if(hit){ const G=H.fresh('2025-12-20',22,'dorm'); const m=PHONE.post(G,{th:'p:'+hit.id,from:hit.id,text:hit.e.text}); PHONE.answer(G,m.ask.id,hit.k);
      check('6. 回覆講了自己的事（'+hit.e.opts[hit.k].tell+'）：記 YT_TOLD（和故事線同一份）',!!(G.flags.YT_TOLD&&G.flags.YT_TOLD[hit.e.opts[hit.k].tell]&&G.flags.YT_TOLD[hit.e.opts[hit.k].tell][hit.id]!=null),J(G.flags.YT_TOLD)); }
    else check('6. （稿裡沒有 tell，略過）',true);
    let hs=null; for(const [id,L] of Object.entries(MSG_REPLIES.people)) L.forEach(e=>{ if(e.set&&!hs&&!e.new) hs={id,e}; });
    if(hs){ const G=H.fresh('2026-01-20',22,'dorm'); PHONE.post(G,{th:'p:'+hs.id,from:hs.id,text:hs.e.text}); check('6. 收到「'+hs.e.text.slice(0,12)+'」那一串：記 '+hs.e.set,G.flags[hs.e.set]!=null); } }
}
H.done();
