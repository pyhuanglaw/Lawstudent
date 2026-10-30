/* CHAR-WHOIS-1030（AA_543 企劃線 d483ecbbf；使用者 2026-10-30 X145「我甚至玩這麼久搞不清楚阿哲是誰」）：手機人物頁的「你們」那一段——他是誰、怎麼認識、之後發生的事。
   畫面在 game3d.js 的 personHTML（「現在大概在」和個性中間），一行一句、前面加「· 」。
   - 每一行有條件：條件成立才顯示，沒發生的不先寫（第 0 節）。
   - 順序：①他是誰 ②怎麼認識 ③之後發生的事（照時間排）。同一件事有新的說法就換掉舊的（rep：這一行顯示時，拿掉 rep 列的那幾行）。
   - 一個人最多 6 行；超過的話第 ③ 類從最舊的拿掉。
   - 字一字照稿；群組名照 AA_542（STORY.ndlGroupName，法一吃飯……）。
   名單：法律系 阿哲、Alison、柏翰、芯慈、明軒、宥辰、阿凱；經濟系那年 阿勳、品妤、韋綸、唐睿；其他 方奕廷、黃筱涵（七位女主角、宋家豪、Kevin 不做，第 0 節）。
   個性那一行（characters.js personality）8 人改字在 characters.js；Alison 照進度換段在 S.desc（1-2）。 */
'use strict';
const WHOIS=(()=>{
  const S={};
  const F=G=>(G&&G.flags)||{};
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]!=null);
  const mem=(G,npc,tag)=>!!(G&&G.social&&G.social.mem&&(G.social.mem[npc]||[]).some(m=>m.tag===tag));
  const got=(G,tag)=>!!G&&((G.msgs||[]).some(m=>m&&m.tag===tag)||(typeof PHONE!=='undefined'&&PHONE.rec?(PHONE.rec(G).cut||[]).includes(tag):false));   /* 收過（已經送到手機；刪掉的舊訊息記在 cut）——排在之後還沒送到的不算 */
  const heard=(G,npc,t)=>{ const r=G&&G.social&&G.social.small&&G.social.small[npc]; return !!(r&&r.once&&r.once[t]!=null); };   /* 閒聊 once 那一句說過了（story3d.js 閒聊：r.once[key]） */
  const camp=(G,id)=>typeof STORY!=='undefined'&&!!STORY.metAtCamp&&STORY.metAtCamp(G,id);
  const since=(G,v)=>v!=null&&v!==false&&(typeof v!=='number'||G.day>=v);   /* 旗標記的是那一天（ROOM_Y2 搬進 312 那天…）：到了那天才算 */
  const fromKey=(G,k)=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null; return d!=null&&G.day>=d; };
  const year=G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; const m=t&&/^Y(\d)/.exec(t.id); return m?+m[1]:null; };
  S.helpers={done,mem,got,heard,camp,since,fromKey,year};

  /* 一列：{c:1|2|3, id, if:G=>bool, t:字串或 G=>字串, rep:[被換掉的 id]} */
  const R={};
  S.R=R;

  /* 第 0 節：條件成立的列 → 拿掉被換掉的 → 超過 6 行從第 ③ 類最舊的拿掉 */
  S.MAX=6;
  S.lines=function(G,id){ const rows=R[id]; if(!G||!rows) return [];
    let on=rows.filter(r=>{ try{ return !r.if||!!r.if(G); }catch(e){ return false; } });
    const gone=new Set(); for(const r of on) for(const x of (r.rep||[])) gone.add(x);
    on=on.filter(r=>!gone.has(r.id));
    while(on.length>S.MAX){ const i=on.findIndex(r=>r.c===3); if(i<0) break; on.splice(i,1); }
    return on.slice(0,S.MAX).map(r=>{ try{ return typeof r.t==='function'?r.t(G):r.t; }catch(e){ return ''; } }).filter(Boolean); };

  /* 個性那一行照進度換（1-2 Alison）；其他人照 characters.js */
  S.DESC={};
  S.desc=function(G,id,base){ const f=S.DESC[id]; if(!f||!G) return base; try{ const v=f(G,base); return v==null?base:v; }catch(e){ return base; } };
  return S;
})();
