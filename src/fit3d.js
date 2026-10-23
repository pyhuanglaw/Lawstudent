/* 健身與體態的其餘部分（D14-T10；AA_126 第 6 節；USER_WANTS D40）：體能本身、健身房、打羽球在 src/gym3d.js（G.daily.gym.fit，0～100）。這裡補：
   - 其他來源（6-1）：上一堂體育課 +1；騎腳踏車每 2 公里 +1（每週最多 +3）；系籃、登山社的活動 +2。
   - 效果（6-2）：有在運動／結實／經常鍛鍊＝走路 +4／+8／+12%、騎車 +5／+10／+15%（E.fitWalk、E.fitBike）；跑步不變。3D 體態等 LAWWW2 評估。
   - 朋友注意到（6-2）：每升一階，下一次見到阿哲他說一句（STORY.PRE_TALK）。其他人的句子、子晴可昕的戀愛加分（6-3，BB_124 第 7 節）等 AA 定稿。
   - 沒有運動不會掉（6-5）：辦過卡、連續 8 週沒有加體能的活動，起床以後旁白一句，一學期最多一次。 */
const FIT=(function(){
  const S={};
  const rec=G=>{ G.daily=G.daily||{}; const r=G.daily.gym=G.daily.gym||{}; if(!Array.isArray(r.seen)) r.seen=[]; return r; };
  const wkOf=G=>{ const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:((G.weekday|0)||7); return G.day-(wd-1); };
  S.STAGES=['普通','有在運動','結實','經常鍛鍊'];
  S.stageIx=f=>f>=75?3:(f>=50?2:(f>=25?1:0));
  S.WALK=[1,1.04,1.08,1.12]; S.BIKE=[1,1.05,1.10,1.15];
  S.LINES={ zhe:'你最近有在練喔？下次系籃缺人找你。', idle:'你很久沒去健身房了。卡還在錢包裡。' };   /* AA_126 6-2、6-5 */
  S.ACTS={dept_basketball:2,club_hiking:2};
  /* 加體能（gym3d.js 自己加的那兩種照舊在那裡；這裡記最後一次加的日子，給 8 週的提醒）*/
  S.add=function(G,n){ const r=rec(G); r.fit=Math.min(100,(r.fit|0)+n); r.fitDay=G.day; return r.fit; };
  S.pe=function(G,c){ if(!c||!/^pe_/.test(c.id)) return; S.add(G,1); };
  S.act=function(G,a){ const n=a&&S.ACTS[a.id]; if(n) S.add(G,n); };
  S.bike=function(G,d){ if(!(d>0)) return; const r=rec(G), wk=wkOf(G); if(r.bkWk!==wk){ r.bkWk=wk; r.bkN=0; } r.bkM=(+r.bkM||0)+d;
    while(r.bkM>=2000){ r.bkM-=2000; if((r.bkN|0)<3){ r.bkN=(r.bkN|0)+1; S.add(G,1); } } };
  /* 走路、騎車的加成：每 0.5 秒照存檔設（換存檔、讀檔都跟著）*/
  S.sync=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E) return false; const i=S.stageIx(rec(G).fit|0); E.fitWalk=S.WALK[i]; E.fitBike=S.BIKE[i]; return false; };
  /* 升階以後第一次見到阿哲 */
  S.preTalk=async function(GM,who,id){ if(id!=='zhe') return; const G=GM.G, r=rec(G), i=S.stageIx(r.fit|0); if(i<1||(r.zheSeen|0)>=i) return; r.zheSeen=i; await GM.say(who,S.LINES.zhe); };
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
  return S;
})();
if(typeof window!=='undefined') window.FIT=FIT;
