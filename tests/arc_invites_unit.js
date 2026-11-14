// 故事線的「下次帶你去」變成真的約（AA_716 026a2dd34；STUDY-DATE-PROGRESS-1107、USER_WANTS X263）——不需要瀏覽器（D131）。
// 使用者 11-07 05:1x 對 BB-B：「他有他的故事……有人想健身、有人想旅遊」
// 檢查：
//   0 匯入一致（import_arc_invites.py --check）；7 個約都有 STORY_EVENTS 的 outing 事件
//   1 語彤第 7 拍演完 → 第 2 天 21:00 她傳訊息（最後一則可以回）；回「好」＝排進這個週六 14:00 淡水；by（YT_PL_NO_WAIT）開頭換句；演完記旗標、校外約會 +1（D13 是她的心願）
//   2 回「下週」＝排下週六；回「我想一下」＝不排，之後見面的中途她說一次 noPlan、只說一次
//   3 一直沒回：過了回覆期限她回 skip 那一句、不排
//   4 沛珊：寒暑假前 3 天傳；選晚一班＝@late 的句子、不出 @early；不去＝那個週六她傳照片
//   5 可昕木柵：@fit／@unfit 照體能；可昕外套：錢夠扣襯衫錢
//   6 學姊騎車（當天 21:30 傳、22:00）：拍演得太晚（22:30）＝改成隔天
//   7 舊存檔（沒有 ARCINV、ARC_INVITE）不丟例外、不傳
// 修改前全部 FAIL（沒有 ARCINV）。用法：node tests/arc_invites_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG('src/data/heroine_arcs.js',['HEROINE_ARCS']); loadG('src/data/arc_rot.js',['ARC_ROT']); loadG('src/arcs3d.js',['ARCS']);
const ok1=loadG('src/data/arc_invites.js',['ARC_INV']), ok2=loadG('src/arcinv3d.js',['ARCINV']);
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.outings=[]; return G; };
const dk=k=>STORY.dayOfKey(k), wd=d=>CALENDAR.dateOf(d).wd;
const beat=(G,id,n,day)=>{ const I=G.flags.ARC_INVITE||(G.flags.ARC_INVITE={}); (I[id]||(I[id]={}))[n]=day; };
const at=(G,d,h)=>{ G.day=d; G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); ARCINV.tick(G); };
const msgOf=(G,key)=>PHONE.byAsk(G,'arcinv:'+key);
const goOut=async(G,key,picks)=>{ const q=OUT.get(G,'arcinv_'+key.replace(':','_')); H.said=[]; H.picks=picks||[]; if(!q) return null; G.day=q.day; G.hour=q.h-(q.travelH||0)-0.1; await OUT.go(GM,q); return q; };
(async()=>{
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_arc_invites.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. src/data/arc_invites.js 和 AA_716@026a2dd34 一致（import_arc_invites.py --check）',ok1&&ok2&&ok,out.trim().slice(0,200));
    check('0. 6 個約都有 outing 事件（可昕 kexin:4：CANON-NO-ECON-1112 第三批：這一項拿掉）',ok2&&ARC_INV.list.length===6&&!ARC_INV.list.some(e=>e.key==='kexin:4')&&ARC_INV.list.every(e=>STORY_EVENTS.some(x=>x.id===ARCINV.evId(e.key)&&x.trigger==='outing')),J(ok1&&ARC_INV.list.map(e=>e.key))); }
  { const ids=[]; for(const e of ARC_INV.list){ if(e.bg[1]) ids.push(e.bg[1]); for(const x of e.bgAt) if(x[2]) ids.push(x[2]); } const miss=ids.filter(id=>!(OUT.BG[id]&&OUT.BG[id].image&&fs.existsSync(path.join(H.ROOT,OUT.BG[id].image))));
    check('0. 每一場的背景（含中途換的）都在 OUT.BG、圖檔存在；子晴健身房＝gym_b1_fitness（LAWWW2 AA716-GYM-BG）',!miss.length&&ARC_INV.list.find(e=>e.key==='heroine_04:3').bg[1]==='gym_b1_fitness',J(miss)); }
  if(!ok2){ H.done(); return; }
  const YT='heroine_03', KYT='heroine_03:7', EY=ARCINV.get(KYT);
  /* 1 */
  { const G=fresh('2026-04-13',15,'cafe'); const bd=G.day; beat(G,YT,7,bd); ARCS.rec(G,YT).ans.YT_PL_NO_WAIT={opt:0,day:bd};
    at(G,bd+1,22); const m0=msgOf(G,KYT); at(G,bd+2,21.1); const m=msgOf(G,KYT);
    check('1. 語彤第 7 拍演完：隔天還沒傳、第 2 天 21:00 傳，最後一則有三個回覆',!m0&&m&&m.ask.opts.length===3&&EY.msgs.every(t=>(PHONE.rec(G),G.msgs||[]).some(x=>x.text===t)),J({m0:!!m0,m:m&&m.ask}));
    const r0=Object.assign({},SOCIAL.rel(YT)); PHONE.answer(G,m.ask.id,0); const q=OUT.get(G,'arcinv_heroine_03_7'); const sat=q&&q.day;
    check('1. 回「好。我會到。」：排進這個週六 14:00（'+(sat!=null?CALENDAR.dateOf(sat).key:'')+'）淡水、自在 +2',q&&wd(sat)===6&&sat>bd+2&&sat<=bd+9&&q.h===14&&q.place===EY.place&&SOCIAL.rel(YT).comf-r0.comf===2,J({q,rel:[r0.comf,SOCIAL.rel(YT).comf]}));
    const c0=DATE.log(G,YT).count; await goOut(G,KYT); const got=H.said.map(s=>s.t);
    check('1. 那天演淡水：YT_PL_NO_WAIT＝開頭換成「這次是我等你。」、不說原本的開頭；最後一句照稿',got.includes('這次是我等你。')&&!got.includes('你沒有遲到。')&&got.includes('下次換你，帶我去一個地方。'),J(got.slice(0,4)));
    check('1. 演完：記 YT_ARC_TAMSUI、校外約會 +1、心願（D13）',G.flags.YT_ARC_TAMSUI!=null&&DATE.log(G,YT).count===c0+1&&ARCINV.rec(G)[KYT].st==='done'&&(DATE.log(G,YT).byLoc.D13|0)>=1,J({f:G.flags.YT_ARC_TAMSUI,c:[c0,DATE.log(G,YT).count],L:DATE.log(G,YT)})); }
  /* 2 */
  { const G=fresh('2026-04-13',15,'cafe'); const bd=G.day; beat(G,YT,7,bd); at(G,bd+2,21.1); const m=msgOf(G,KYT); PHONE.answer(G,m.ask.id,1); const q=OUT.get(G,'arcinv_heroine_03_7');
    const G2=fresh('2026-04-13',15,'cafe'); beat(G2,YT,7,G2.day); at(G2,G2.day+2,21.1); PHONE.answer(G2,msgOf(G2,KYT).ask.id,0); const q2=OUT.get(G2,'arcinv_heroine_03_7');
    check('2. 回「這週不行，下週六可以嗎？」：排下週六（比回「好」晚 7 天）',q&&q2&&q.day===q2.day+7&&wd(q.day)===6,J([q&&q.day,q2&&q2.day]));
    const G3=fresh('2026-04-13',15,'cafe'); beat(G3,YT,7,G3.day); at(G3,G3.day+2,21.1); PHONE.answer(G3,msgOf(G3,KYT).ask.id,2);
    const p1=ARCS.rotPick(G3,YT,{}); ARCS.rotDone(G3,YT,p1); const p2=ARCS.rotPick(G3,YT,{});
    check('2. 回「我想一下」：不排；之後見面的中途說一次 noPlan（「那扇窗，我自己回去看過了。」）、下一次不再說',!OUT.get(G3,'arcinv_heroine_03_7')&&p1&&p1.lines[0]===EY.noPlan[0]&&!(p2&&p2.np),J({p1,p2})); }
  /* 3 */
  { const G=fresh('2026-04-13',15,'cafe'); const bd=G.day; beat(G,YT,7,bd); at(G,bd+2,21.1); const r=ARCINV.rec(G)[KYT]; const U=r.until; at(G,Math.floor(U/24)+1,U%24); 
    check('3. 一直沒回：過了期限她回「沒關係。窗戶不會跑掉。」、不排、回不了',r.st==='skip'&&(PHONE.rec(G),G.msgs||[]).some(x=>x.text===EY.skip[0])&&!OUT.get(G,'arcinv_heroine_03_7')&&!PHONE.askOpen(G,msgOf(G,KYT)),J({st:r.st,U})); }
  /* 3b 過去式的 skip（UX-WEEKEND-ASK-EXPIRE-1108，AA-B 11-08 09:39）：沛珊 6、可昕 4、可昕 6 沒回＝那個約好的日子（sc.this）的那個時間才傳，文字不動；以前不在手機裡 */
  { const D_=ARCINV.data?ARCINV.data():null; const E_=k=>(typeof ARC_INVITES!=='undefined'?(ARC_INVITES.list||ARC_INVITES):[]).find?((ARC_INVITES.list||ARC_INVITES).find(e=>e.key===k)):null;
    const bad=[];
    for(const [who,n,k,h] of [['classmate_peishan',6,'classmate_peishan:6',7.5],['kexin',6,'kexin:6',17.5]]   /* 可昕 4：CANON-NO-ECON-1112 第三批：這一項拿掉 */){
      const G=fresh('2026-04-13',15,'cafe'); const bd=G.day; beat(G,who,n,bd); at(G,bd+2,21.1); const r=ARCINV.rec(G)[k]; if(!r||r.st!=='offer'){ bad.push(k+' 沒有邀約 '+J(r&&r.st)); continue; }
      const U=r.until, th=r.sc.this, e=ARCINV.get(k), first=e.skip[0]; at(G,Math.floor(U/24),U%24+0.1); const has=()=>(G.msgs||[]).some(x=>x.text===first);
      const before=has(); if(th.d*24+h>U+0.2){ at(G,th.d,h-0.2); } const before2=has(); at(G,th.d,h+0.1); const after=has(); const m=(G.msgs||[]).find(x=>x.text===first);
      if(!(r.st==='skip'&&!before&&!before2&&after&&m&&m.day===th.d&&m.h>=h-1e-6&&m.h<h+0.25)) bad.push(k+' '+J({st:r.st,before,before2,after,m:m&&[m.day,m.h],th:[th.d,h],U})); }
    check('3b. 沛珊 6（07:30）、可昕 4（18:00）、可昕 6（17:30）：沒回的那一句在約好的那一天那個時間才傳（之前不在手機裡），文字不動',!bad.length,bad.join('；')); }
  /* 4 沛珊 */
  { const PS='classmate_peishan', K='classmate_peishan:6', EP=ARCINV.get(K); const G=fresh('2026-05-20',15,'cafe'); const bd=G.day; beat(G,PS,6,bd);
    ARCINV.tick(G); const r=ARCINV.rec(G)[K]; const B=ARCINV.breakStart(bd);
    check('4. 沛珊：訊息排在暑假開始前 3 天 21:00；約暑假第一個週六 05:30、晚一班 08:00',r&&r.sc&&r.sc.offer.d===B-3&&r.sc.offer.h===21&&wd(r.sc.this.d)===6&&r.sc.this.d>=B&&r.sc.this.d<B+7&&r.sc.this.h===5.5&&r.sc.late.h===8,J({sc:r&&r.sc,B:CALENDAR.dateOf(B).key}));
    at(G,B-3,21.2); const m=msgOf(G,K); PHONE.answer(G,m.ask.id,1); await goOut(G,K); const got=H.said.map(s=>s.t);
    check('4. 選晚一班：演 @late（「……藍色的也很好看。」）、不演 @early；@ 標記不會出現在畫面上',got.includes('……藍色的也很好看。')&&!got.includes('動畫沒有騙我。')&&!got.some(t=>t.indexOf('@')>=0),J(got));
    const G2=fresh('2026-05-20',15,'cafe'); beat(G2,PS,6,G2.day); ARCINV.tick(G2); const r2=ARCINV.rec(G2)[K]; at(G2,r2.sc.offer.d,21.2); PHONE.answer(G2,msgOf(G2,K).ask.id,2); at(G2,r2.sc.this.d,8);
    check('4. 不去：那個週六早上她傳照片（📷），見面的中途不說',(PHONE.rec(G2),G2.msgs||[]).some(x=>x.text===EP.noPlan[0]&&x.day===r2.sc.this.d)&&!ARCINV.np(G2,PS),J((PHONE.rec(G2),G2.msgs||[]).slice(-2)));
    const G3=fresh('2026-11-20',15,'cafe'); beat(G3,PS,6,G3.day); ARCINV.tick(G3); const r3=ARCINV.rec(G3)[K];
    check('4. 寒假在她消失期裡（2026-11-20 演完）：改成最近的週六（12/18 以前）',r3&&r3.sc&&r3.sc.this.d<dk('2026-12-18')&&wd(r3.sc.this.d)===6&&r3.sc.offer.d===G3.day+1,J(r3&&r3.sc)); }
  /* 5 可昕 */
  { const KX='kexin';
    check('5. 可昕第 4 拍的約（CANON-NO-ECON-1112 第三批：這一項拿掉）',!ARCINV.get('kexin:4'));
    const G=fresh('2026-04-13',15,'cafe'); G.money=2000; beat(G,KX,6,G.day); at(G,G.day,21.1); PHONE.answer(G,msgOf(G,'kexin:6').ask.id,0); await goOut(G,'kexin:6');
    check('5. 可昕外套：錢夠＝扣襯衫 590 元、記 KX_ARC_COAT',G.money===1410&&G.flags.KX_ARC_COAT!=null,J({m:G.money})); }
  /* 6 學姊騎車 */
  { const SIS='heroine_05', K='heroine_05:3'; const G=fresh('2026-04-13',22.5,'library_hall'); beat(G,SIS,3,G.day); at(G,G.day,22.5); const r=ARCINV.rec(G)[K];
    check('6. 學姊騎車：拍演得太晚（22:30，原本約 22:00）＝「這次」改成隔天 22:00',r&&r.sc.this.d===G.day+1&&r.sc.this.h===22&&msgOf(G,K),J(r&&r.sc)); }
  /* 8 演完人在哪（BB-B 11-07 P2：學姊騎車演完回到已經閉館的總圖大廳）*/
  { const spawns=[]; const E0=GM.enter; GM.enter=async(z,sp)=>{ spawns.push([z,sp]); return E0(z,sp); };
    const SIS='heroine_05', K='heroine_05:3'; const G=fresh('2026-04-13',21.6,'library_hall'); beat(G,SIS,3,G.day); at(G,G.day,21.6); PHONE.answer(G,msgOf(G,K).ask.id,0); await goOut(G,K);
    const s1=spawns.slice(-1)[0]||[]; spawns.length=0;
    check('8. 學姊騎車演完：人在校園映月湖邊（不在已經閉館的總圖大廳），地點字幕「映月湖。」',s1[0]==='campus'&&s1[1]&&Math.abs(s1[1].x+38)<0.01&&Math.abs(s1[1].z+98.4)<0.01&&G.zone==='campus',J(s1));
    const G2=fresh('2026-04-13',15,'cafe'); beat(G2,'heroine_03',7,G2.day); at(G2,G2.day+2,21.1); PHONE.answer(G2,msgOf(G2,'heroine_03:7').ask.id,0); await goOut(G2,'heroine_03:7'); const s2=spawns.slice(-1)[0]||[]; spawns.length=0;
    check('8. 淡水那一場（遠的）演完：回宿舍',s2[0]==='dorm',J(s2));
    const G3=fresh('2026-04-13',15,'cafe'); G3.money=2000; beat(G3,'kexin',6,G3.day); at(G3,G3.day,21.1); PHONE.answer(G3,msgOf(G3,'kexin:6').ask.id,0); await goOut(G3,'kexin:6'); const s3=spawns.slice(-1)[0]||[];
    check('8. 可昕買外套演完：在公館商圈',s3[0]==='gongguan',J(s3)); GM.enter=E0; }
  /* 7 */
  { const G=fresh('2026-04-13',15,'cafe'); delete G.flags.ARCINV; delete G.flags.ARC_INVITE; let err=null; try{ ARCINV.tick(G); STORY.phoneRules(GM); }catch(e){ err=e; }
    check('7. 舊存檔（沒有 ARCINV、ARC_INVITE）：不丟例外、不傳',!err&&!(PHONE.rec(G),G.msgs||[]).some(m=>m.ask&&/^arcinv:/.test(m.ask.id)),String(err)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
