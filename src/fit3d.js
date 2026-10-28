/* 健身與體態的其餘部分（D14-T10；AA_126 第 6 節；USER_WANTS D40）：體能本身、健身房、打羽球在 src/gym3d.js（G.daily.gym.fit，0～100）。這裡補：
   - 其他來源（6-1）：上一堂體育課 +1；騎腳踏車每 2 公里 +1（每週最多 +3）；系籃、登山社的活動 +2。
   - 效果（6-2）：有在運動／結實／經常鍛鍊＝走路 +4／+8／+12%、騎車 +5／+10／+15%（E.fitWalk、E.fitBike）；跑步不變。3D 體態等 LAWWW2 評估。
   - 朋友注意到（6-2）：每升一階，下一次見面說一句（阿哲 S.LINES.zhe；其他十位 AA_417 第 2 節 S.NOTICE）；子晴、可昕升階的那一句＋她的戀愛 +4（AA_417 第 1 節 S.UP）。
     見面＝說話（STORY.PRE_TALK）；學姊走 SISY23.preTalk；可昕多半在出遊（OUT.BEFORE）。一起運動的約會（第 3 節，羽球、晨跑）等邀約的程式改完再接。
   - 沒有運動不會掉（6-5）：辦過卡、連續 8 週沒有加體能的活動，起床以後旁白一句，一學期最多一次。 */
const FIT=(function(){
  const S={};
  const rec=G=>{ G.daily=G.daily||{}; const r=G.daily.gym=G.daily.gym||{}; if(!Array.isArray(r.seen)) r.seen=[]; return r; };
  const wkOf=G=>{ const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:((G.weekday|0)||7); return G.day-(wd-1); };
  S.STAGES=['普通','有在運動','結實','經常鍛鍊'];
  S.stageIx=f=>f>=75?3:(f>=50?2:(f>=25?1:0));
  S.WALK=[1,1.04,1.08,1.12]; S.BIKE=[1,1.05,1.10,1.15];
  S.LINES={ zhe:'你最近有在練喔？下次系籃缺人找你。', idle:'你很久沒去健身房了。卡還在錢包裡。' };   /* AA_126 6-2、6-5 */
  /* AA_417（企劃線 99710a90，AA-B 定稿）第 1 節：子晴、可昕升階的那一句（她的戀愛 +4，每一階一次）；[誰,句子]，誰 null＝旁白 */
  S.UP={ heroine_04:{1:[['heroine_04','你每天去，不管別人看不看。……我做不到。']],2:[['heroine_04','你的手臂。……我沒有在看。']],3:[['heroine_04','你練了一年。我的遊戲也做了一年。'],[null,'（她把筆電闔上。）'],['heroine_04','……我們都還在做。']]},
    kexin:{1:[['kexin','你爬上來沒有喘。……你每天都去？']],2:[['kexin','政大的階梯，你今天一口氣上來。我數了，你一次都沒停。']],3:[['kexin','下個月去爬那條比較陡的。路線我查好了。']]} };
  /* 第 2 節：其他人注意到（不加戀愛）：升到有在運動、結實＝一般那一句；升到經常鍛鍊＝右邊那一句（阿哲照 S.LINES.zhe）*/
  S.NOTICE={ heroine_01:{n:[['heroine_01','你最近下課都往新體育館走。……我只是看到了。']],x:[['heroine_01','你搬讀書會的資料，一次搬兩箱。'],['heroine_01','……以前你要搬兩趟。']]},
    heroine_03:{n:[['heroine_03','阿姨說你最近都吃兩碗。']],x:[['heroine_03','……你的手臂。'],[null,'（她說完就去收碗了。）']]},
    heroine_02:{n:[['heroine_02','你最近點的都是無糖。……你在練？']],x:[['heroine_02','你的襯衫小了。……還是你變大了。']]},
    heroine_05:{n:[['heroine_05','你運動的時間有排進去。很好。']],x:[['heroine_05','你比大一的時候有精神。……這句是稱讚。']]},
    classmate_peishan:{n:[['classmate_peishan','人為什麼要練肌肉？我不是質疑，我真的想知道。']],x:[['classmate_peishan','你上樓梯的聲音變輕了。……我只是觀察。']]},
    classmate_bohan:{n:[['classmate_bohan','你一週去幾次？我在想要不要把運動排進時間表。']],x:[['classmate_bohan','你去健身房的時間，比我念刑法的時間多。'],['classmate_bohan','……我要調一下時間表。']]},
    yu:{n:[['yu','欸你最近有在練喔！！阿哲說他也要去。……他不會去。']],x:[['yu','欸營隊缺體育股長！！你來！']]},
    kai:{n:[['kai','你最近一直出門。健身房？好喔。宵夜還是有你的份。']],x:[['kai','你的泡麵評分變少了。……我有點寂寞。']]},
    classmate_mingxuan:{n:[['classmate_mingxuan','健身房？學校的？學生月票很便宜吧？CP 值很高。']],x:[['classmate_mingxuan','系籃缺人。你不要拒絕。']]},   /* AA_497 4-6：當面的「哈哈」拿掉（口氣表：「哈哈」只在訊息裡）*/
    npc_fangyt:{n:[['npc_fangyt','體能好了。下次帶你走比較難的那條。']],x:[['npc_fangyt','你可以走那條稜線了。……那條我只帶過兩個人。']]} };
  /* GYM-NOTICE-1027（AA_485 第 1 節，企劃線 5aaa71d6a；使用者 10-27「健身房的時間是什麼意思 健身房都不能用?」）：體能也可能是體育課、系籃、登山、羽球、騎車來的，
     沒有健身房會員證（G.daily.gym.card，gym3d.js 辦卡那一天）的玩家，朋友只看得到「他最近在動」——下面這幾句換掉；有會員證照上面那張表。只列有換的那一階 */
  S.NOTICE_NOCARD={ classmate_bohan:{x:[['classmate_bohan','你運動的時間，比我念刑法的時間多。'],['classmate_bohan','……我要調一下時間表。']]},
    kai:{n:[['kai','你最近一直出門。去運動？好喔。宵夜還是有你的份。']]},
    classmate_mingxuan:{n:[['classmate_mingxuan','最近有在動喔？學校的球場不用錢吧？CP 值最高。']]},   /* AA_497 4-6：當面的「哈哈」拿掉 */
    heroine_01:{n:[['heroine_01','你最近走路變快了。……我只是看到了。']]},
    classmate_peishan:{n:[['classmate_peishan','人為什麼要自己去流汗？我不是質疑，我真的想知道。']]} };
  S.noticeLines=function(G,id,i){ const N=S.NOTICE[id]; if(!N) return null; const k=i>=3?'x':'n', alt=!rec(G).card&&S.NOTICE_NOCARD[id]; return (alt&&alt[k])||N[k]; };
  S.ACTS={dept_basketball:2,club_hiking:2};
  /* 加體能（gym3d.js 自己加的那兩種照舊在那裡；這裡記最後一次加的日子，給 8 週的提醒）*/
  S.add=function(G,n){ const r=rec(G); r.fit=Math.min(100,(r.fit|0)+n); r.fitDay=G.day; return r.fit; };
  S.pe=function(G,c){ if(!c||!/^pe_/.test(c.id)) return; S.add(G,1); };
  S.act=function(G,a){ const n=a&&S.ACTS[a.id]; if(n) S.add(G,n); };
  S.bike=function(G,d){ if(!(d>0)) return; const r=rec(G), wk=wkOf(G); if(r.bkWk!==wk){ r.bkWk=wk; r.bkN=0; } r.bkM=(+r.bkM||0)+d;
    while(r.bkM>=2000){ r.bkM-=2000; if((r.bkN|0)<3){ r.bkN=(r.bkN|0)+1; S.add(G,1); } } };
  /* 走路、騎車的加成：每 0.5 秒照存檔設（換存檔、讀檔都跟著）*/
  /* 3D 體態第一階段（FIT-3D-BODY-1027，LAWWW2-C；USER_WANTS D40）：姿勢——有在運動以上站、走的時候挺胸、肩膀往後、下巴微收，越高階越明顯；不改身體形狀（第二階段要問使用者）。
     只有祐廷（E.player）；character3d.js animateVRM 的 u.posture 疊在動作上（坐、騎車、羽球、開門的時候不加）。角度：骨頭的 Euler（x、z 乘 sx，和 SIT_VRM 同一套）*/
  const PB={Spine1:[-0.035,0,0],Spine2:[-0.02,0,0],Neck:[0.03,0,0],LeftShoulder:[0,0.06,0],RightShoulder:[0,-0.06,0]};
  const scaleP=k=>{ const o={}; for(const n in PB) o[n]=PB[n].map(v=>+(v*k).toFixed(4)); return o; };
  S.POSTURE=[null,scaleP(1),scaleP(1.8),scaleP(2.8)];   /* 經常鍛鍊：肩膀往後約 4 cm、頭往後約 4 cm（瀏覽器量的，test_shots/fit_posture_1027）*/
  S.sync=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E) return false; const i=S.stageIx(rec(G).fit|0); E.fitWalk=S.WALK[i]; E.fitBike=S.BIKE[i];
    const P=E.player, u=P&&P.obj&&P.obj.userData; if(u) u.posture=S.POSTURE[i]; return false; };
  /* 升階以後第一次見到阿哲 */
  S.preTalk=async function(GM,who,id){ const G=GM.G, r=rec(G), i=S.stageIx(r.fit|0); if(i<1) return;
    if(id==='zhe'){ if((r.zheSeen|0)>=i) return; r.zheSeen=i; await GM.say(who,S.LINES.zhe); return; }
    const seen=r.fitSeen&&typeof r.fitSeen==='object'?r.fitSeen:(r.fitSeen={}), s0=seen[id]|0; if(s0>=i) return;
    if(S.UP[id]){ seen[id]=i; await S.play(GM,who,S.UP[id][i]); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(id,{npcRom:4*(i-s0)},'fit'); return; }   /* 跳過一階也照階數加 */
    if(S.NOTICE[id]){ seen[id]=i; await S.play(GM,who,S.noticeLines(G,id,i)); } };
  S.play=async function(GM,who,L){ for(const [w,t] of (L||[])){ if(!w) await GM.say(null,t); else await GM.say(who&&who.charId===w?who:{name:typeof SOCIAL!=='undefined'?(SOCIAL.npcName?SOCIAL.npcName(w):SOCIAL.displayName(w)):w,charId:w},t); } };
  /* 學姊說話走 talkSis（SISY23.preTalk 鏈）、可昕多半在出遊見面（OUT.BEFORE：她在場的出遊，事件開始以前）*/
  S.sisPre=async function(GM){ const nm=typeof SOCIAL!=='undefined'?(SOCIAL.npcName?SOCIAL.npcName('heroine_05'):'學姊'):'學姊'; await S.preTalk(GM,{name:nm,charId:'heroine_05'},'heroine_05'); return false; };
  S.outingPre=async function(GM,q,ev){ if(!ev||!(ev.participants||[]).includes('kexin')||ev.kxAway) return; const nm=typeof SOCIAL!=='undefined'?SOCIAL.displayName('kexin'):'可昕'; await S.preTalk(GM,{name:nm,charId:'kexin'},'kexin'); };
  /* 8 週沒運動：起床以後（宿舍或家裡、07:00～11:00、空下來的時候）一句，一學期一次 */
  S.idleDue=function(G){ const r=rec(G); if(!r.card) return false; const last=r.fitDay!=null?r.fitDay:(typeof r.card==='number'?r.card:null);   /* card＝辦卡那一天 */ if(last==null||G.day-last<56) return false;
    const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, tid=t?t.id:'break'; if(r.idleT===tid) return false; const h=G.hour%24; return h>=7&&h<11&&(G.zone==='dorm'||G.zone==='dorm_hall'||(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))); };
  let busy=false;
  S.tick=function(GM){ S.sync(GM); const G=GM&&GM.G; if(busy||!G||!S.idleDue(G)) return false; if(GM.D&&GM.D.active) return false; if(typeof EVENTS!=='undefined'&&EVENTS.running) return false;
    const r=rec(G), t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; r.idleT=t?t.id:'break'; busy=true;
    (async()=>{ try{ GM.sceneBegin(); try{ await GM.say(null,S.LINES.idle); } finally { GM.sceneEnd(); } } catch(e){ console.warn('FIT.idle',e); } finally { busy=false; } })(); return true; };
  /* 掛勾：體育課（CLS.attend 上完）、活動（CLS.attendActivity）、騎車（bike3d.js 每一格的距離）*/
  if(typeof CLS!=='undefined'){
    if(CLS.attend&&!CLS.attend._fit){ const a0=CLS.attend; CLS.attend=Object.assign(async function(GM,it){ const R=CLS.rec(GM.G), was=!!R.done[it.key]; const r=await a0.apply(this,arguments); try{ if(!was&&R.done[it.key]) S.pe(GM.G,it.c); }catch(e){ console.warn('FIT.pe',e); } return r; },a0,{_fit:true}); }
    if(CLS.attendActivity&&!CLS.attendActivity._fit){ const b0=CLS.attendActivity; CLS.attendActivity=Object.assign(async function(GM,a){ const r=await b0.apply(this,arguments); try{ if(r) S.act(GM.G,a); }catch(e){ console.warn('FIT.act',e); } return r; },b0,{_fit:true}); } }
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(S.tick); if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push(S.preTalk); }
  if(typeof OUT!=='undefined'&&Array.isArray(OUT.BEFORE)) OUT.BEFORE.push(S.outingPre);
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._fit){ const p0=SISY23.preTalk;
    SISY23.preTalk=Object.assign(async function(GM){ const r=await p0.apply(this,arguments); if(!r) await S.sisPre(GM); return r; },p0,{_fit:true}); }
  return S;
})();
if(typeof window!=='undefined') window.FIT=FIT;
