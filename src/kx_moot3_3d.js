/* ===== 可昕最後一場模擬法庭（大三上 2027-12-04 週六 14:00～16:30，政大；AA_514 第 1 節，企劃線 claude/magical-albattani-bk7b4n @ 964d01175；
   任務 KX-MOOT3-1028，HEROINE-LIFE-1028，USER_WANTS X122★）：接線 =====
   兌現「下次我去看。」。台詞在 src/data/kx_moot3_lines.js（KX_MOOT3_LINES，照稿不改字）。這個檔：
   - 誰有（S.cond）：AA_505 7-2（大二上輸的那晚，src/data/feed_y2s1.js 的 kx_moot）或 AA_506 7-2（大二下贏的那晚，feed_y2s2.js 的 kx_win）選過「下次我去看。」＝KX_WATCH
     （那兩題的選項 set；兩次都選也只記一次）。這一版以前就選過的舊存檔：那兩題原本就記的選項記號 KX_MOOT_DM／KX_WIN_DM＝'watch' 也算，補記 KX_WATCH（S.watch）。
     交往中、朋友都可以（FEED.stageOk 朋友：交往中，或 SOCIAL.friendLevel 朋友以上——同那兩則私訊的門檻）；分開以後的一學期不約（FEED.kxCool，照 AA_503 9-3）；有她的聯絡方式。
     11/28 21:00 那一刻判斷一次（G.flags.KX_MOOT3_ASK＝'sent'／'x:原因'；同 FEED 私訊「時間到了才判斷、判斷過不再判斷」）；12/4 12:00 以後才第一次讀到的舊存檔＝不約（'x:late'）。
   - 手機（STORY.PHONE_RULES，S.rule）：1-1 11/28（日）21:00 三則，回覆鍵「去。」「那天不行。」開到 12/4 12:00（ask.until）；
     「去。」＝KX_MOOT3_GO true、排出遊；「那天不行。」＝KX_MOOT3_GO false；沒回＝當作「那天不行。」（不另外傳）。
   - 出遊（OUT，1-2）：12/4（六）14:00 政大，開車約 40 分鐘（同大三其他去政大的出遊）、2.5 小時；過了 14:30 不能出發（S.LATE，同 K19 她的期末報告「坐最後一排」）；
     alarm：跳過時間、睡覺停在出發前。事件 ev_kexin_moot3：2D，底圖先用 classroom_small、地點字幕「政大・模擬法庭教室」（正式圖等 LAWWW2）；三選一；
     演完記 KX_MOOT3='came'、人物頁記憶 KX_MOOT3_CAME「她最後一場模擬法庭，你坐最後一排」。
   - 沒來（1-3）：回「那天不行。」、沒回、回了「去。」卻沒到（「不去了」、過了 14:30、出遊沒排到）＝12/4 21:30 她傳兩則（不用回），
     回了「去。」卻沒到的前面多「你說要來的。」；記 KX_MOOT3='missed'（21:30 那一刻記）。
   - 不撞：AA_507 避開的 12/3、12/5，12/4 空著；大三上臺灣、日本、美國三條路線都在臺灣（不換時差）。
   存檔：G.flags.KX_WATCH、KX_MOOT3_ASK、KX_MOOT3_GO、KX_MOOT3（came／missed）；記憶 KX_MOOT3_CAME（舊存檔沒有＝照上面判斷）。
   測試：node tests/aa514_kx_moot3_unit.js */
'use strict';
const KXMOOT3=(function(){
  const S={}, KX='kexin', L=typeof KX_MOOT3_LINES!=='undefined'?KX_MOOT3_LINES:null;
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const K=t=>({th:'p:'+KX,from:KX,text:t});
  S.DAYS={ask:'2027-11-28',day:'2027-12-04'};
  S.ASK_H=21; S.UNTIL_H=12; S.H=14; S.LATE=0.5; S.HOURS=2.5; S.MISS_H=21.5;
  S.ASK='kx_moot3_ask'; S.OUT_ID='kx_moot3'; S.EV='ev_kexin_moot3'; S.TAG_MISS='kx_moot3_missed'; S.MEM='KX_MOOT3_CAME';
  S.TITLE='最後一場模擬法庭'; S.OUT_TITLE='可昕的模擬法庭（政大）';   /* 系統字（稿沒寫）：事件開頭的字幕、筆記本；出遊「出發：」那一行 */

  /* ---------- 誰有 ---------- */
  /* 說過「下次我去看。」：KX_WATCH（那兩題的選項 set）；這一版以前就選過的舊存檔看那兩題的選項記號（FEED.dmItems 記 ask.flag＝選項的 k）*/
  S.watch=G=>{ const F=(G&&G.flags)||{}; return F.KX_WATCH===true||F.KX_MOOT_DM==='watch'||F.KX_WIN_DM==='watch'; };
  S.friend=G=>{ if(typeof FEED!=='undefined'&&FEED.stageOk) return FEED.stageOk(G,KX,'朋友');   /* 交往中也算 */
    if(G.flags&&G.flags['dating_'+KX]===true) return true; const f=typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(KX):null; return f==='FRIEND'||f==='CLOSE_FRIEND'; };
  S.cond=function(G,why){ const out=r=>why?{ok:r===true,why:r===true?'':r}:r===true;
    if(!law(G)) return out('不是法律系');
    if(!S.watch(G)) return out('沒說過「下次我去看。」');
    if(typeof INV!=='undefined'&&INV.hasContact&&!INV.hasContact(G,KX)) return out('沒有她的聯絡方式');
    if(typeof FEED!=='undefined'&&FEED.kxCool&&FEED.kxCool(G)) return out('分開以後的一學期');
    if(!S.friend(G)) return out('不到朋友，也沒有交往');
    return out(true); };

  /* ---------- 手機（1-1、1-3）＋排出遊（1-2）：STORY.PHONE_RULES ---------- */
  S.askItems=function(dM){ const M=L.ask.map(K);
    M[M.length-1].ask={id:S.ASK,until:T(dM,S.UNTIL_H),opts:[{t:L.yesT,say:[{from:KX,text:L.yes}],set:{KX_MOOT3_GO:true}},{t:L.noT,say:[{from:KX,text:L.no}],set:{KX_MOOT3_GO:false}}]};
    return M; };
  S.rule=function(G){ if(!law(G)||typeof PHONE==='undefined'||!L) return; const F=G.flags;
    if(F.KX_WATCH!==true&&S.watch(G)) F.KX_WATCH=true;   /* 舊存檔補記 */
    const dA=D(S.DAYS.ask), dM=D(S.DAYS.day); if(dA==null||dM==null) return; const t=now(G);
    if(t<T(dA,S.ASK_H)||G.day>dM+7) return;   /* 11/28 21:00 以前、12/11 以後沒有要做的（手機規則每一輪都跑）*/
    /* 1-1：11/28 21:00 判斷一次 */
    if(F.KX_MOOT3_ASK==null){
      if(F.KX_MOOT3!=null||sent(G,S.ASK)) F.KX_MOOT3_ASK='sent';
      else if(t>=T(dM,S.UNTIL_H)) F.KX_MOOT3_ASK='x:late';   /* 回覆鍵已經關了才第一次讀到（舊存檔）：不約 */
      else { const c=S.cond(G,true); if(!c.ok) F.KX_MOOT3_ASK='x:'+c.why; else { PHONE.at(G,dA,S.ASK_H,S.askItems(dM),S.ASK); F.KX_MOOT3_ASK='sent'; } } }
    if(F.KX_MOOT3_ASK!=='sent') return;
    /* 1-2：回了「去。」＝排 12/4 14:00 的出遊 */
    if(F.KX_MOOT3_GO===true&&F.KX_MOOT3==null&&typeof OUT!=='undefined'&&OUT.plan&&!OUT.get(G,S.OUT_ID)&&t<T(dM,S.H+S.LATE))
      OUT.plan(G,{id:S.OUT_ID,ev:S.EV,day:dM,h:S.H,late:S.LATE,place:'政大',title:S.OUT_TITLE,travel:'開車約 40 分鐘',travelH:2/3,hours:S.HOURS,alarm:true});
    /* 1-3：沒來＝12/4 21:30 */
    if(F.KX_MOOT3==null&&t>=T(dM,S.MISS_H)){ const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,S.OUT_ID):null;
      if(q&&(q.state==='done'||(q.state==='planned'&&q.arrived===true))) return;   /* 有去（came 由事件記）、還在演 */
      F.KX_MOOT3='missed'; PHONE.at(G,dM,S.MISS_H,(F.KX_MOOT3_GO===true?[L.noshow]:[]).concat(L.missed).map(K),S.TAG_MISS); } };

  /* ---------- 事件（1-2；trigger 'outing'，由上面排）---------- */
  const say=t=>/^（/.test(t)?{speaker:null,text:t}:{speaker:KX,expression:'neutral',text:t};
  S.FOOD_RE=/^（山下小吃街的麵店/;   /* AA_527 2-5：旁白對齊字幕（原本「政大後門的麵店」）*/ S.FOOD_SCENE='政大・山下的小吃街';   /* 選「要不要去吃東西？」以後的麵店那段：底圖 nccu_food（地點字幕同 kxdrift3d.js OD_SCENE.nccu）*/
  S.EVENT=!L?null:{ id:S.EV, title:S.TITLE, participants:[KX], location:'any', trigger:'outing', once:true, background:'dark', hours:S.HOURS,
    dialogue:[{scene:L.scene,bg:'classroom_small'}].concat(L.nar.map(say),L.saw.map(say),
      [{choice:L.opts.map((o,i)=>({text:o.t,goto:'km3_'+i}))}],
      ...L.opts.map((o,i)=>[{label:'km3_'+i}].concat(...o.r.map(t=>S.FOOD_RE.test(t)?[{scene:S.FOOD_SCENE,bg:'nccu_food'},say(t)]:[say(t)]),[{goto:'km3_end'}])),   /* 麵店那段換 nccu_food（AA_514 第 4 節第 2 點）*/
      [{label:'km3_end'}],L.close.map(say),
      [{set:{KX_MOOT3:'came'},mem:[{npc:KX,tag:S.MEM,note:''}]}]) };

  /* ---------- 掛上去 ---------- */
  if(S.EVENT&&typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e.id===S.EV)) STORY_EVENTS.push(S.EVENT);
  if(L&&typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL&&!SOCIAL.MEMORY_LABEL[S.MEM]) SOCIAL.MEMORY_LABEL[S.MEM]=L.mem;
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._kxMoot3){ STORY.PHONE_RULES.push(G=>S.rule(G)); STORY._kxMoot3=true; }
  return S;
})();
