// 分開以後一個學期（AA_434 第 4 節第 3 點，企劃線 434e6d6d7）：約人的幾條路讀 V6EX.cool（src/v6ex3d.js 算期間：分開那天起到下一個學期第 1 週）——不需要瀏覽器。
//   「她主動的邀約：這段期間她不主動約（約人系統裡她那一方的邀約不發）」「玩家約她：照朋友階段的回覆和答應機率，不另外扣」「到期以後：照朋友版恢復」；可昕照 AA_351（不在 V6EX.COOL_IDS）。
//   A src/invites3d.js：INV.offer（她那一方的邀約）不發；你約她＝地點的門檻（INV.decide）、AA_415 回覆的階段（INV.replyStage）、運動的 A／R 都照友情的階段（第 1～4 階）
//   B src/termend3d.js：心意的邀約不發（那一句也不傳）、她的朋友邀約也不發；你自己約她吃飯＝朋友的期末飯
//   C src/fest3d.js：FEST.level 照友情的階段——節日你約她要第 5／6 階＝不夠；語彤第 6 階的白色情人節中午那兩則不發
//   D 可昕不管、交往中不管；E 到期（下一個學期第 1 週）以後恢復
// 修改前（開發分支 4c97be3a1）：23 項裡 17 項 FAIL（A0～A4、B1～B3、C1、C2、E1 的冷卻；D 是因為沒有 INV.cool）。用法：node tests/v6_cool_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H, J=JSON.stringify;
const EXPORT=/^(MSG|MSG_POOL|MSG2_POOL|ZRUK|EXCH|R2Y4A|R2Y4A_EVENTS|CRACKTALK|CRACKTALK_LINES|Y34B|V6EX|V6EX_LINES|NEEDED_MSGS|FEST|FEST_DATA|FEST_EVENTS|INVITE_REPLIES)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.Z3={ZONES:{}};
const loadErr=[]; for(const f of ['src/data/invite_replies.js','src/data/fest_events.js','src/fest3d.js','src/data/needed_msgs.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/exchange3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js','src/y34b3d.js','src/data/v6ex_lines.js','src/v6ex3d.js']){ try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
const AN='heroine_01', YT='heroine_03', ZQ='heroine_04', KX='kexin';
const D=k=>STORY.dayOfKey(k);
const sec=(n,f)=>{ try{ f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const coolOf=id=>typeof INV!=='undefined'&&typeof INV.cool==='function'?INV.cool(H.G,id):null;   /* 修改前沒有 INV.cool＝null */
const setRel=(id,o)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:0,trust:0,comf:0,npcRom:0,rom:0},o); SOCIAL.remember(id,'FIRST_MET',''); };
const breakup=(key,h,id)=>{ const G=H.fresh(key,h||20,'dorm'); H.CLOSE(id); ROM.start(G,id); ROM.end(G,id,'apart_talk'); G.contacts=G.contacts||{}; G.contacts[id]=G.day-60; return G; };
/* 同一個存檔：拿掉冷卻＝照原本（對照組），做完放回去 */
const noCool=f=>{ const R=H.G.flags.V6EX, c=R&&R.cool; if(R) delete R.cool; try{ return f(); } finally { if(R&&c) R.cool=c; } };
const nextTerm=(key)=>{ for(let x=D(key);x<D(key)+400;x++){ const t=CALENDAR.termOf(x); if(t&&t.week===1&&x>D(key)) return x; } return null; };

check('0. 檔案載得到（V6EX、FEST、INVITE_REPLIES）',!loadErr.length&&typeof V6EX!=='undefined'&&!!V6EX.cool&&typeof FEST!=='undefined'&&!!FEST.level&&typeof INVITE_REPLIES!=='undefined',loadErr.join('；'));

/* ======================= A 約人系統 ======================= */
sec('A',()=>{
  breakup('2026-10-14',20,ZQ);
  check('A0. 子晴大二上 10/14 分開：V6EX.cool＝true，INV.cool 讀它',V6EX.cool(H.G,ZQ)===true&&coolOf(ZQ)===true,J([V6EX.cool(H.G,ZQ),coolOf(ZQ)]));
  /* 她那一方的邀約（INV.offer：給事件、她主動約用的介面）*/
  const n0=(H.G.invites||[]).length, iv=INV.offer(H.G,ZQ,'cafe',H.G.day+1,15);
  check('A1. 冷卻期間 INV.offer（她約你）不發：回 null、邀約清單沒有多、沒有她傳的訊息',iv==null&&(H.G.invites||[]).length===n0&&!H.msgs('p:'+ZQ).length,J([iv&&iv.id,(H.G.invites||[]).length-n0,H.msgs('p:'+ZQ)]));
  const iv2=noCool(()=>INV.offer(H.G,ZQ,'cafe',H.G.day+1,15));
  check('A1. 對照：沒有冷卻照常發',!!iv2&&iv2.by==='npc'&&iv2.who===ZQ);
  if(iv2) iv2.state='cancelled';
  /* 你約她：地點的門檻照友情的階段。戀愛數值高（SOCIAL.stage＝ROMANTIC_TENSION）、友情只到有點熟（信任 20 < 25）*/
  setRel(ZQ,{fam:55,trust:20,comf:0,rom:60,npcRom:50});
  check('A2. 前提：SOCIAL.stage＝ROMANTIC_TENSION、友情＝FAMILIAR',SOCIAL.stage(ZQ)==='ROMANTIC_TENSION'&&SOCIAL.friendLevel(ZQ)==='FAMILIAR',J([SOCIAL.stage(ZQ),SOCIAL.friendLevel(ZQ)]));
  check('A2. INV.stageOf：冷卻期間算到友情那一階（FAMILIAR），沒有冷卻照 SOCIAL.stage',typeof INV.stageOf==='function'&&INV.stageOf(H.G,ZQ)==='FAMILIAR'&&noCool(()=>INV.stageOf(H.G,ZQ))==='ROMANTIC_TENSION',typeof INV.stageOf==='function'?J([INV.stageOf(H.G,ZQ),noCool(()=>INV.stageOf(H.G,ZQ))]):'沒有 INV.stageOf');
  let slot=null; for(let d=H.G.day+1;d<H.G.day+8&&!slot;d++) for(let h=10;h<=19&&!slot;h++){ const r=noCool(()=>INV.decide(H.G,ZQ,'wenzhou',d,h)); if(r.res==='accept') slot={d,h}; }
  const rc=slot?INV.decide(H.G,ZQ,'wenzhou',slot.d,slot.h):null, rn=slot?noCool(()=>INV.decide(H.G,ZQ,'wenzhou',slot.d,slot.h)):null;
  check('A2. 約她去溫州街散步（門檻 FRIEND）：冷卻期間＝階段不到（why rel），選地點的說明照「還不太熟」那一類；沒有冷卻＝答應',!!slot&&rc.res==='decline'&&rc.why==='rel'&&rn.res==='accept'&&INV.placeWhy(H.G,ZQ,INV.place('wenzhou'))!==''&&noCool(()=>INV.placeWhy(H.G,ZQ,INV.place('wenzhou')))==='',J([slot,rc,rn]));
  let cs=null; for(let d=H.G.day+1;d<H.G.day+8&&!cs;d++) for(let h=10;h<=19&&!cs;h++){ if(noCool(()=>INV.decide(H.G,ZQ,'cafe',d,h)).res==='accept') cs={d,h}; }
  const rcafe=cs?INV.decide(H.G,ZQ,'cafe',cs.d,cs.h):null;
  check('A2. 友情夠的地方（Café，門檻 ACQUAINTANCE）同一個時間照常答應：不另外扣',!!rcafe&&rcafe.res==='accept',J([cs,rcafe]));
  /* AA_415 回覆的階段 */
  setRel(ZQ,{fam:65,trust:50,comf:45,npcRom:60,rom:35});
  const s6=[INV.replyStage(H.G,ZQ),noCool(()=>INV.replyStage(H.G,ZQ)),DATE.stageNum(ZQ)];
  check('A3. 第 6 階（好朋友＋戀愛）：冷卻期間 INV.replyStage＝4（好朋友），沒有冷卻＝6',J(s6)===J([4,6,6]),J(s6));
  setRel(ZQ,{fam:45,trust:30,comf:0,npcRom:35,rom:0});
  const s5=[INV.replyStage(H.G,ZQ),noCool(()=>INV.replyStage(H.G,ZQ)),DATE.stageNum(ZQ)];
  check('A3. 第 5 階（朋友＋她的戀愛 35）：冷卻期間＝3（朋友，不是直接壓到 4），沒有冷卻＝5',J(s5)===J([3,5,5]),J(s5));
  /* 回覆的句子：冷卻期間挑到的都是第 4 階以下有的列 */
  setRel(ZQ,{fam:65,trust:50,comf:45,npcRom:60,rom:35});
  const rows=(INVITE_REPLIES.people||{})[ZQ]||[], hi=rows.filter(r=>r.k==='acc'&&r.st[0]>=5).length, used=[];
  for(const pid of ['cafe','library','noodle','cafe','library','noodle']){ let s=null; for(let d=H.G.day+1;d<H.G.day+10&&!s;d++) for(let h=10;h<=19&&!s;h++){ if(INV.decide(H.G,ZQ,pid,d,h).res==='accept') s={d,h}; }
    if(!s) continue; const r=INV.personal(H.G,ZQ,INV.place(pid),s.d,s.h,{res:'accept'}); const row=r&&r.lines?INV.replyRow(ZQ,r.lines):null; used.push(row?row.st:null); }
  check('A4. 冷卻期間約第 6 階的子晴（Café、總圖、麵店各兩次）：答應的句子都是第 4 階以內的列（表上她有 '+hi+' 列第 5 階以上的答應）',used.length===6&&used.every(st=>!st||st[0]<=4),J(used));
});

/* ======================= B 學期末 ======================= */
sec('B',()=>{
  /* 子晴大一下 5/1 分開＝冷卻到大二上第 1 週；大一下學期末（6/11 起）心意條件都到齊 */
  const G=breakup('2026-05-01',20,ZQ); setRel(ZQ,{fam:70,trust:50,comf:45,npcRom:35,rom:0}); DATE.log(G,ZQ).count=4; DATE.log(G,ZQ).wish=true;
  G.day=D('2026-06-11'); G.hour=20; G.weekday=CALENDAR.dateOf(G.day).wd%7;
  const w=TERMEND.window(G);
  check('B0. 前提：大一下的學期末時段、還在冷卻（到 '+nextTerm('2026-06-11')+'）、分手一週以後可以重新開始',!!w&&w.id==='Y1S2'&&V6EX.cool(G,ZQ)&&ROM.canStart(G,ZQ),J([w&&w.id,V6EX.cool(G,ZQ),ROM.canStart(G,ZQ)]));
  const hc=TERMEND.heartWhy(G,ZQ,w), hn=noCool(()=>TERMEND.heartWhy(G,ZQ,w));
  check('B1. 心意的邀約：冷卻期間不發、那一句也不傳（false）；沒有冷卻＝發（true）',hc===false&&hn===true,J([hc,hn]));
  const P=TERMEND.plan(G,w);
  check('B1. 這學期的名單：她不在心意、不在朋友的邀約、沒有不發的那一句',!P.heart.includes(ZQ)&&!P.friend.includes(ZQ)&&!(P.nope&&P.nope[ZQ]),J(P));
  const fc=TERMEND.friendOk(G,ZQ,w), fn=noCool(()=>TERMEND.friendOk(G,ZQ,w));
  check('B2. 朋友的期末邀約（她那一方）：冷卻期間也不發；沒有冷卻照原本',fc===false&&fn===true,J([fc,fn]));
  const pi=TERMEND.playerInvite(G,ZQ,INV.place('noodle'),{day:G.day+1,h:19}), pn=noCool(()=>TERMEND.playerInvite(G,ZQ,INV.place('noodle'),{day:G.day+1,h:19}));
  check('B3. 你自己約她吃飯：冷卻期間＝朋友的期末飯（kind friend），沒有冷卻＝心意的期末飯',!!pi&&pi.kind==='friend'&&!!pn&&pn.kind==='heart',J([pi&&pi.kind,pn&&pn.kind]));
});

/* ======================= C 節日 ======================= */
sec('C',()=>{
  /* 語彤大二下 3/1 分開＝冷卻到大三上第 1 週；3/14 白色情人節 */
  const G=breakup('2027-03-01',20,YT); setRel(YT,{fam:65,trust:50,comf:45,npcRom:60,rom:35});
  const lc=FEST.level(G,YT), ln=noCool(()=>FEST.level(G,YT));
  check('C1. FEST.level：冷卻期間＝友情那一階（4），沒有冷卻＝6',lc===4&&ln===6,J([lc,ln]));
  check('C1. 白色情人節要第 6 階：冷卻期間 FEST.eligible＝false（你約她＝AA_415 的節日婉拒），沒有冷卻＝true',FEST.eligible(G,YT,'white',2027)===false&&noCool(()=>FEST.eligible(G,YT,'white',2027))===true);
  const noon=()=>{ G.day=D('2027-03-14'); G.hour=12.5; G.weekday=CALENDAR.dateOf(G.day).wd%7; FEST.phone(G); PHONE.tick(G); return H.msgs('p:'+YT); };
  const m1=noon();
  check('C2. 語彤第 6 階的白色情人節中午那兩則（她先傳）：冷卻期間不發',!m1.includes('這碗是你的。'),J(m1));
  const m2=noCool(()=>noon());
  check('C2. 對照：沒有冷卻照常傳「（照片：麵店今天的小菜）」「這碗是你的。」',m2.includes('這碗是你的。'),J(m2));
});

/* ======================= D 可昕、交往中 ======================= */
sec('D',()=>{
  breakup('2026-10-14',20,KX); setRel(KX,{fam:65,trust:50,comf:45,npcRom:60,rom:35});
  check('D1. 可昕分開以後不在冷卻（照 AA_351）：INV.cool false、回覆的階段照原本（分開以後最多第 4 階那一條）',coolOf(KX)===false&&INV.replyStage(H.G,KX)===4);
  const G=breakup('2026-10-14',20,ZQ); ROM.start(G,ZQ);   /* 一週內不能重新開始：直接設交往中 */ G.flags.dating_heroine_04=true; ROM.get(G,ZQ).status='dating';
  check('D2. 冷卻期間又在一起（交往中）＝不算冷卻：INV.cool false、FEST.level 7、INV.offer 照常',coolOf(ZQ)===false&&FEST.level(G,ZQ)===7&&!!INV.offer(G,ZQ,'cafe',G.day+1,15));
});

/* ======================= E 到期以後 ======================= */
sec('E',()=>{
  const G=breakup('2026-10-14',20,ZQ); setRel(ZQ,{fam:65,trust:50,comf:45,npcRom:60,rom:35}); const u=nextTerm('2026-10-14');
  G.day=u-1; const a=[coolOf(ZQ),INV.replyStage(G,ZQ),!!INV.offer(G,ZQ,'cafe',G.day+1,15)];
  G.day=u; G.weekday=CALENDAR.dateOf(u).wd%7; const b=[coolOf(ZQ),INV.replyStage(G,ZQ),!!INV.offer(G,ZQ,'cafe',G.day+1,15),FEST.level(G,ZQ)];
  check('E1. 下一個學期第 1 週的前一天還在冷卻（不發、第 4 階）；第 1 週那天恢復（發、第 6 階、節日 6）',J(a)===J([true,4,false])&&J(b)===J([false,6,true,6]),J([a,b]));
});

/* ======================= F 出遊約會（date3d.js DATE.canAskCore：LAWWW-B 10-24 補）======================= */
sec('F',()=>{ breakup('2026-10-14',20,ZQ); setRel(ZQ,{fam:45,trust:30,comf:0,rom:10,npcRom:40}); const sn=DATE.stageNum(ZQ);
  check('F1. 前提：戀愛階段 5、友情 FRIEND（第 3 階）',sn===5&&SOCIAL.friendLevel(ZQ)==='FRIEND',J([sn,SOCIAL.friendLevel(ZQ)]));
  check('F1. 冷卻期間 DATE.canAskCore 照朋友階段（不能兩個人出去）；沒有冷卻照原本可以',DATE.canAskCore(H.G,ZQ).ok===false&&noCool(()=>DATE.canAskCore(H.G,ZQ).ok)===true,J([DATE.canAskCore(H.G,ZQ),noCool(()=>DATE.canAskCore(H.G,ZQ))]));
});

H.done();
