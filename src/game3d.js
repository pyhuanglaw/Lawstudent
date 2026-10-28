/* ===== 遊戲層：狀態、時間、UI、互動、對話演出、鏡頭運鏡、存檔 ===== */
'use strict';
const GAME = (function(){
  const SAVE_VER=2; const KEY_AUTO='fatiao3d_auto', KEY_SLOT='fatiao3d_slot_', KEY_BACKUP='fatiao3d_backup', KEY_SET='fatiao3d_settings';
  const WEEK=['週日','週一','週二','週三','週四','週五','週六'];
  const $=id=>document.getElementById(id);
  let E=null; let G=null; let S={quality:'medium',joystick:true,volume:0.6,textSpeed:2,fps:false,guide:true};
  const GM={E:null,G:null,S,npc:{},extras:[],running:false,hourRate:1/150,lastAuto:0};
  // ---------- 狀態 ----------
  function defaults(name){ return {v:SAVE_VER,stage:'law',name:name||'祐廷',day:1,weekday:3,hour:21.2,energy:100,money:22000,zone:'dorm',pos:null,weather:'clear',flags:{dating_kexin:true,KX_DEC3_MIGRATED:true},rel:{an:6,zhe:12,sis:2,kai:8,yu:3},notes:[],memo:[],visited:{dorm:true},stats:{steps:0,classes:0,study:0},choices:{},social:null,events:null,legal:null,cg:{unlocked:[]},savedAt:0}; }
  function bindSystems(){ SOCIAL.bind(G); EVENTS.bind(GM); LEGAL.bind(G,GM); if(!G.cg) G.cg={unlocked:[]}; }
  GM.bindSystems=bindSystems;
  GM.defaults=defaults;
  // ---------- 小工具 ----------
  const sleep=ms=>new Promise(r=>setTimeout(r,GM.turbo?Math.min(ms,120):ms));
  GM.sleep=sleep;
  function fmtTime(h){ const hh=Math.floor(h%24), mm=Math.floor((h%1)*60); return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; }
  GM.fmtTime=fmtTime;
  /* 提示一次一則：前一則出現不到 1.5 秒又有新的，排在後面（原本直接蓋掉——BB 10-21 經濟系天天睡覺：12/13 生活費的提示 24 次有 1 次看不到，UI-MONEY-TOAST-ADV-1021）；
     同一句還在畫面上＝延長；同一句已經在排＝不重複；最多排三則 */
  const TQ=[]; let tCur='', tMin=0, tHide=null, tNext=null; const TOAST_MIN=1500;
  function toastShow(t,ms){ const el=$('toast'); if(!el) return; el.textContent=t; el.classList.remove('hide'); el.style.opacity=1; tCur=t; tMin=Date.now()+TOAST_MIN; clearTimeout(tHide);
    tHide=setTimeout(()=>{ el.style.opacity=0; setTimeout(()=>{ if(el.textContent===t&&tCur!==t) el.classList.add('hide'); },300); tCur=''; toastPump(); },ms||2200); }
  function toastPump(){ clearTimeout(tNext); tNext=null; if(!TQ.length) return; const w=tMin-Date.now(); if(tCur&&w>0){ tNext=setTimeout(toastPump,w); return; } const [t,ms]=TQ.shift(); toastShow(t,ms); }
  function toast(t,ms){ if(t===tCur){ toastShow(t,ms); return; } if(TQ.some(x=>x[0]===t)) return; if(tCur&&Date.now()<tMin){ TQ.push([t,ms]); if(TQ.length>3) TQ.shift(); toastPump(); return; } toastShow(t,ms); }
  toast.queue=()=>TQ.map(x=>x[0]);   /* 測試用 */
  GM.toast=toast; Object.defineProperty(GM,'S',{get:()=>S});   // 導航（guide3d.js）讀設定
  function setGoal(t,dest){ G.goal=t; G.goalDest=(dest!==undefined)?dest:(typeof GUIDE!=='undefined'?GUIDE.infer(t):null); $('goal').textContent='目標：'+t; }   /* 目的地（2026-10-11，src/guide3d.js）：沒給就從文字推算；null＝自由行動，不指路 */
  GM.setGoal=setGoal;
  function addNote(id,title,body){ if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); toast('📓 筆記：'+title); A3.blip('page'); return true; }
  GM.addNote=addNote; GM.hasNote=id=>!!G.notes.find(n=>n.id===id);
  function memo(text){ G.memo.push(text&&typeof text==='object'?Object.assign({day:G.day},text):{day:G.day,t:text}); }   /* 物件＝{t, named, who}：名字之後才知道的那一句（AA_372 第 4 項；顯示照 STORY.memoText）*/
  GM.memo=memo;
  /* 第一、二天的劇情（story3d.js）用舊版的 G.rel 加關係；新版的關係（SOCIAL）只在第一次綁定時從 G.rel 搬一次，之後加的都沒進去
     （2026-10-13 批次 3：第一天和阿哲吃麵 +3，第三天約他吃飯還是「認識」）→ 兩邊一起加（熟悉度 d、信任 0.6d，和搬家的換算一樣）*/
  function rel(id,d){ G.rel[id]=Math.max(0,Math.min(100,(G.rel[id]||0)+d)); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&G.social&&d){ SOCIAL.adjust(CID[id]||id,{fam:d,trust:Math.round(d*0.6)}); if(SOCIAL.feel) delete SOCIAL.feel[CID[id]||id]; }   /* 這裡自己有提示：對話結束的「熟了一點」不再重複 */ if(d>0) toast('❤ 和'+(NPCNAME[id]||id)+'的關係 +'+d); }
  GM.rel=rel;
  const NPCNAME={an:'小安',zhe:'阿哲',sis:'溫學姊',kai:'阿凱',yu:'Alison',prof:'周教授'}; GM.NPCNAME=NPCNAME;
  function energy(d){ if(G) G.energy=100; }   /* DL-02（AA_160 2-8，使用者 10-16「體力的設計都刪掉」）：體力拿掉了；保留函式名稱、不做事，G.energy 固定 100（存檔欄位留著，舊存檔照讀）*/
  GM.energy=energy;
  function money(d){ G.money+=d; updateHUD(); if(d<0) toast('💸 '+(-d)+' 元'); }
  GM.money=money;
  /* 演講、活動的出席（AA_110 5-2；src/data/activities.js 的 track）：玩家現在在哪一區、哪一間、有沒有坐著。自由行動時每 3 格、坐下的時候、每次時間跳動的前後各呼叫一次；
     hPrev：從那時起一直是這個狀態（座位上「坐一下」「讀書」跳過的時間＝一直坐在那裡）*/
  function actTrack(hPrev){ if(typeof ACTIVITIES==='undefined'||!ACTIVITIES.track||!ACTIVITIES.list.length||!E||!E.player||!G) return; const P=E.player, z=E.zone; const room=(P.seat&&P.seat.room)||(z&&z.roomAt?z.roomAt(P.obj.position.x,P.obj.position.z,P.lv|0):null); ACTIVITIES.track(G,G.zone,room,!!P.seat,hPrev); }
  GM.actTrack=actTrack;
  function advance(hours){ const h0=G.hour; actTrack(); G.hour+=hours; E.hour=G.hour; if(typeof STORY!=='undefined'&&STORY.routeWatch) STORY.routeWatch(G); E.applyTime(G.hour); updateHUD(); A3.setScene(G.zone,G.hour,G.weather); actTrack(h0); }   /* routeWatch：跳時間跨過交換志願表截止（2027-11-18 12:00）就照那一刻的交往狀態定（1A-02；上課坐著的時候 S.tick 不跑）*/
  /* 習慣記憶（AA_110 5-4）：玩家自己重複做的事，一天最多算一次（G.habits，存法在 src/events3d.js 的 X.habit）。事件條件 habit:{key,min,withinDays}（src/events3d.js；鍵的寫法見 docs/STORY_EVENT_SCHEMA.md）：
       place:區域:時段（morning／noon／afternoon／evening／night）、place:區域:with:人物（走進去時帶著的同伴）——走進一個區域時記（讀檔不算）；
       seat:區域:那一間或那一區（教室 101、窗邊 window…）、table:區域:桌子、seat:區域:with:人物（坐下時 2.5 m 內、同一層）——坐下時記；
       meal:店（麵店 noodle、兩點半 Café cafe、便利商店 cvs）、meal:店:with:人物——在店裡坐下時記。人物一律寫 character_id（heroine_01、zhe…）*/
  const habitSlot=h=>{ h=h%24; return h<5?'night':(h<11?'morning':(h<14?'noon':(h<17?'afternoon':(h<19?'evening':'night')))); };
  function habit(key){ if(typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit(key); }   /* 記一次：src/events3d.js 的 X.habit */
  const HABIT_FOOD={noodle:1,cafe:1,cvs:1};
  function companionsNear(x,z,lv){ const out=new Set(); const comp=G.flags&&G.flags.companion; if(comp) out.add(CID[comp]||comp);
    for(const n of E.npcs){ if(n.isExtra||!n.charId||(n.lv|0)!==(lv|0)) continue; if(Math.hypot(n.obj.position.x-x,n.obj.position.z-z)<=2.5) out.add(n.charId); } return [...out]; }
  function seatHabits(st){ if(!st) return; const z=G.zone, w=companionsNear(st.x,st.z,st.lv|0); habit('seat:'+z+':'+(st.room||st.kind||('@'+Math.round(st.x)+','+Math.round(st.z)))); if(st.table) habit('table:'+z+':'+st.table);
    for(const id of w) habit('seat:'+z+':with:'+id); if(HABIT_FOOD[z]){ habit('meal:'+z); for(const id of w) habit('meal:'+z+':with:'+id); } }
  GM.habit=habit; GM.habitSlot=habitSlot; GM.seatHabits=seatHabits;
  GM.advance=advance;
  // ---------- HUD ----------
  /* G.weekday 是快取：日期（G.day）才是準的。出遊跨日（outings3d.js）原本只改日期、沒改星期，之後每天睡覺照樣加一，星期就一直差一天（BUG-DATE-TIMETABLE-1020，X76）。
     讀檔（migrate）照行事曆重算；遊戲中每次更新 HUD（主迴圈每 30 格、每次跳時間）先對一次；沒有行事曆（測試）照舊 */
  function wdOfDay(day,fallback){ try{ if(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf&&typeof day==='number'){ const w=CALENDAR.dateOf(day).wd; if(typeof w==='number') return ((w%7)+7)%7; } }catch(e){} return fallback; }
  function syncWeekday(){ if(!G) return; const w=wdOfDay(G.day,G.weekday); if(w!==G.weekday){ console.warn('星期和日期對不上，照行事曆改：',G.weekday,'→',w); G.weekday=w; } }
  GM.syncWeekday=syncWeekday;
  const DEV_Q=typeof location!=='undefined'&&/[?&]dev\b/.test(location.search||''); let devCareerT=0;
  function devCareer(){ if(!DEV_Q||typeof STORY==='undefined'||!STORY.careerLean||typeof document==='undefined'||!document.body) return; const now=Date.now(); if(now-devCareerT<2000) return; devCareerT=now;   /* 1A-01 R4：職涯傾向只在 ?dev 看得到（玩家版不顯示）*/
    let d=document.getElementById('devCareer'); if(!d){ d=document.createElement('div'); d.id='devCareer'; d.style.cssText='position:fixed;left:6px;bottom:6px;z-index:9999;background:rgba(0,0,0,.6);color:#fff;font:11px monospace;padding:2px 6px;border-radius:4px;pointer-events:none'; document.body.appendChild(d); }
    const c=STORY.careerLean(G); d.textContent='career A'+c.A+' B'+c.B+' C'+c.C+' → '+c.top; }
  /* 劇情裡直接跳日期、時間（例：經濟系宿營 8/23 09:00 → 8/25 16:00 那一句「回到家，你倒在床上」）右上角要馬上跟上：
     原本只有每 30 幀才更新，手機慢的時候（或雲端測試 1～4 fps）會停在舊的日期好幾秒（BB218-P3-1021 ⑥）。只看「跳」：換日或差 0.25 小時以上；平常時間流動照舊 30 幀一次 */
  let hudDay=null, hudHr=null;
  function hudStale(){ return !!G&&(G.day!==hudDay||!(Math.abs(G.hour-hudHr)<0.25)); }
  let hudRwT='';
  function updateHUD(){ if(!G) return; hudDay=G.day; hudHr=G.hour; syncWeekday(); { const dd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day+Math.floor(G.hour/24)):null; $('clockT').textContent=(dd?dd.m+'/'+dd.d+' ':'')+WEEK[dd&&typeof dd.wd==='number'?((dd.wd%7)+7)%7:G.weekday]+' '+fmtTime(G.hour); }   /* 過了午夜（G.hour≥24）日期顯示隔天，星期也跟著顯示隔天（原本日期換了、星期還是前一天）*/   /* 日期（使用者 2026-10-15：遊戲裡就寫今天幾月幾號，不需要點開手機）*/ const zn=(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))?'臺北的家':(Z3.ZONES[G.zone]?Z3.ZONES[G.zone].name:G.zone); $('clockZ').textContent=zn;   /* 在臺北的家：右上角寫臺北的家（BB-C 10-18 BUG-HOME-HUDZONE）*/ $('clockW').textContent=G.weather==='rain'?'🌧':(G.weather==='cloudy'?'☁':(G.hour%24>=18.5||G.hour%24<5.5?'🌙':'☀')); { const mt='$'+G.money; $('money').textContent=mt; if(hudRwT!==mt){ const w=$('hudR').offsetWidth; if(w>0){ hudRwT=mt; $('ui').style.setProperty('--hudRw',w+'px'); } } } }   /* 直向「現在可以上課…」那一列的寬度照右邊金額、手機、選單那一組的實際寬度（index.html 的 --hudRw；BB 10-21 17:25 HUD 尾巴被金額蓋住）：金額變了才量 */
  GM.updateHUD=updateHUD;
  function fade(on){ const f=$('fade'); f.classList.toggle('on',on); return sleep(on?480:500); }
  GM.fade=fade;
  function letterbox(on){ const h=on?'8%':'0'; $('letterT').style.height=h; $('letterB').style.height=h; }
  GM.letterbox=letterbox;
  function titleCard(text,sub,ms){ const el=$('title3'); el.innerHTML=text+(sub?'<small>'+sub+'</small>':''); el.style.opacity=1; return sleep(ms||2200).then(()=>{ el.style.opacity=0; }); }
  GM.titleCard=titleCard;
  function hideHUD(on){ $('hud').style.opacity=on?0:1; for(const c of $('hudR').children){ if(c.id!=='quickPop') c.style.opacity=on?(c.id==='btnQuick'?0.55:0):1; }   /* 劇情中 💾 半透明留著（卡住時還找得到匯出，QUICK-SAVE-EXPORT-1027）*/ $('minimap').style.opacity=on?0:1; $('minimap').style.pointerEvents=on?'none':'auto'; $('ctlR').style.opacity=on?0:1; $('joy').style.opacity=(on||!S.joystick)?0:1; $('ctlR').style.pointerEvents=on?'none':'auto'; $('joy').style.pointerEvents=(on||!S.joystick)?'none':'auto'; }
  GM.hideHUD=hideHUD;
  // ---------- 對話 ----------
  const D={active:false,resolve:null,typing:false,full:'',shown:0,timer:0,busyDepth:0,busyWho:[],stale:false};
  GM.D=D;
  function subst(t){ return t.replace(/\{name\}/g,G.name); }
  const overFade=el=>{ el.style.zIndex=$('fade').classList.contains('on')?'10':''; };   /* 黑幕（#fade，z-index 9、會攔點擊）還開著就說話／出選項：對話框放到黑幕上面，不然玩家只看到全黑、點不下去（2026-10-17 經濟系 8/29 轉法律系卡死）。劇情本身照舊應該先拿掉黑幕，這裡只是保險 */
  /* 一句話還在等點擊、另一段的話蓋上來（STUCK-HARDEN-1027；BUG-AN-NOODLE-STUCK-1027 的保底）：D.resolve 只留得下一個，原本先開始的那一段永遠等不到＝停在那一句的畫面。
     改成同選單（X81 chooseStack）的做法：舊的那一句先收起來，新的那一段演完（劇情層數回到舊那一句那一層：sceneEnd；或點完一句、選完一個選項以後新的那一段沒有接著說）再放回去，玩家點了舊的那一段接著演；誰蓋的記在 D.coverWho */
  const sayStack=[];
  function say(who,text,opts){ opts=opts||{}; uncover(); if(typeof ADV!=='undefined'&&ADV.active&&ADV.narrate) ADV.narrate(!who);   /* 旁白：手機直向台上的人變暗（adv3d.js solo）*/
    const by=((new Error().stack||'').split('\n')[2]||'?').trim().replace(/^at /,'').slice(0,140);
    return new Promise(res=>{ if(D.active&&D.resolve){ sayStack.push({who:D.who,text:D.sayText,opts:D.sayOpts||{},res:D.resolve,depth:D.sayDepth|0,by:D.sayBy}); D.coverWho=by; console.warn('一句話還沒點，另一段的話蓋上來，演完會放回去',{under:D.sayBy,over:by}); }
      showLine(who,text,opts,res,false,by); }); }
  function showLine(who,text,opts,res,restored,by){ D.active=true; D.resolve=res; D.sayText=text; D.sayOpts=opts; D.sayDepth=D.busyDepth; D.sayBy=by; const box=$('dlg'); box.classList.remove('hide'); overFade(box); $('dlgName').textContent=who?(who.name||who):''; $('dlgName').style.display=who?'block':'none'; D.full=subst(text); D.shown=restored?D.full.length:0; D.typing=!restored; $('dlgText').textContent=restored?D.full:''; $('dlgNext').style.visibility=restored?'visible':'hidden'; const spd=S.textSpeed>=9?9999:(S.textSpeed===1?18:(S.textSpeed===2?32:60)); D.cps=spd; // 說話者姿態與表情
      if(who&&who.obj){ if(opts.expr) CHAR.setExpr(who.obj,opts.expr); if(who.pose!=='sit'&&who.pose!=='read'&&!opts.keepPose){ who.pose='talk'; who._talkPose=true; } if(E.player&&who.obj!==E.player.obj){ who.lookAt=E.player.obj.position; who._sayLook=true; } }
      if(opts.me&&E.player){ E.player.pose='talk'; }
      if(typeof ADV!=='undefined'&&ADV.active){ const EXPR={normal:'neutral',smile:'smile',laugh:'laugh',surprise:'surprised',worried:'sad',shy:'embarrassed'}; if(who&&who.charId) ADV.speaker(who.charId,opts.expression||(opts.expr?EXPR[opts.expr]:undefined));   /* opts.expression：立繪表情檔名（閒聊階梯的 e）*/ else ADV.speaker(who?'player':null); if(!restored) ADV.log(who?(who.name||''):'',D.full); }
      D.who=who; if(typeof ADV!=='undefined'&&ADV.active&&ADV.skip) setTimeout(()=>{ if(D.resolve===res){ D.typing=false; dlgAdvance(); } },40); }   /* 略過對話（ADV.skip）：一路翻到下一個選項；放回去的那一句（restored）已經整句顯示 */
  function sayRestore(){ if(D.active||chooseCur||!sayStack.length||sayStack[sayStack.length-1].depth<D.busyDepth) return; const q=sayStack.pop(); if(typeof ADV!=='undefined'&&ADV.active&&ADV.narrate) ADV.narrate(!q.who); showLine(q.who,q.text,q.opts,q.res,true,q.by); }
  const sayRestoreSoon=()=>{ if(sayStack.length) setTimeout(sayRestore,0); };   /* 點完一句、選完一個選項：等接著跑的那一段（microtask）先說下一句，沒有說才放回去 */
  GM.say=say;
  function dlgTick(dt){ if(!D.active||!D.typing) return; D.shown+=dt*D.cps; const n=Math.min(D.full.length,Math.floor(D.shown)); $('dlgText').textContent=D.full.slice(0,n); if(n>=D.full.length){ D.typing=false; $('dlgNext').style.visibility='visible'; } }
  function dlgAdvance(){ if(!D.active) return false; if(D.typing){ D.typing=false; $('dlgText').textContent=D.full; $('dlgNext').style.visibility='visible'; return true; } const r=D.resolve; D.resolve=null; D.active=false; D.endedAt=performance.now(); $('dlg').classList.add('hide'); const who=D.who; if(who&&who.obj&&who._talkPose){ who.pose=who.idlePose||'idle'; who._talkPose=false; } if(E.player&&E.player.pose==='talk') E.player.pose='idle'; A3.blip('page'); if(r) r(); sayRestoreSoon(); return true; }
  GM.dlgAdvance=dlgAdvance;
  // 選項出現時，把上一句對話（通常就是問題）留在畫面上，選項排在對話框上方
  /* 選單疊在另一個還沒選的選單上（X81 BUG-E37-MOVEIN-1020：使用者 v9.10.2 的 _stuck＝8/30 18:01 宿舍、bedScene 的選單沒結束、畫面上什麼都沒有——
     床邊選單還在等，另一段的選單把它蓋掉、選完就收起來，床邊那一段永遠等不到）：舊的先收起來，新的那一段演完（劇情層數回到舊選單那一層）再放回去；誰蓋的記在 D.coverWho（卡住紀錄看得到）*/
  let chooseCur=null; const chooseStack=[];
  function choose(options,opt){ uncover(); if(typeof ADV!=='undefined') ADV.skip=false;   /* 略過對話停在選項：玩家自己選 */
    const who=((new Error().stack||'').split('\n')[2]||'?').trim().replace(/^at /,'').slice(0,140);
    return new Promise(res=>{ if(chooseCur){ chooseStack.push(chooseCur); D.coverWho=who; console.warn('選單蓋在另一個還沒選的選單上，選完會放回去',{under:chooseCur.who,over:who}); }
      chooseCur={options,opt,res,who,depth:D.busyDepth}; renderChoose(chooseCur); }); }
  function chooseRestore(){ if(chooseCur||!chooseStack.length||chooseStack[chooseStack.length-1].depth<D.busyDepth) return; chooseCur=chooseStack.pop(); renderChoose(chooseCur); }
  GM.chooseReset=()=>{ chooseCur=null; chooseStack.length=0; D.coverWho=null; sayStack.length=0; };   /* 讀檔、新遊戲：還沒選的選單都不要了 */
  function renderChoose(c){ const {options,opt,res}=c;
    { const box=$('choices'); box.innerHTML=''; box.classList.remove('hide'); overFade(box); const dlg=$('dlg'); overFade(dlg); const keep=!(opt&&opt.menu)&&!!D.full&&!D.active&&(performance.now()-(D.endedAt||0))<1500; if(opt&&opt.menu&&!D.active){ dlg.classList.add('hide'); dlg.classList.remove('static'); }   /* 系統選單（家裡、快轉）：不留上一句（BB-C BB_218 第 4 節：媽媽「洗衣籃在後陽台」留在畫面上，橫向時蓋住第四個選項）*/
    if(keep){ dlg.classList.remove('hide'); $('dlgText').textContent=D.full; $('dlgNext').style.visibility='hidden'; dlg.classList.add('static'); box.style.bottom='calc(max(14px,env(safe-area-inset-bottom)) + '+(dlg.offsetHeight+22)+'px)'; box.style.maxHeight='calc(100% - 58px - env(safe-area-inset-top) - '+(dlg.offsetHeight+22)+'px)'; }   /* 上面留 58 px 給「紀錄」按鈕（BB_218：最上面一格壓到「紀錄」）*/
    const more=()=>box.classList.toggle('more',box.scrollTop+box.clientHeight<box.scrollHeight-4); box.onscroll=more;   /* 選單墊高到對話框上面時，最大高度也要扣掉墊高的部分（v9.7 回歸 flow_clubs C：橫向 844×390、社團博覽會 6 個選項，選單上緣在畫面外 76 px，第一個「吉他社」看不到也捲不到）；太長就在選單裡捲動 */
    const done=(i)=>{ box.classList.add('hide'); box.classList.remove('more'); box.onscroll=null; box.innerHTML=''; box.style.bottom=''; box.style.maxHeight=''; if(keep){ dlg.classList.add('hide'); dlg.classList.remove('static'); } A3.blip('ok'); if(chooseCur===c) chooseCur=null; res(i); chooseRestore(); sayRestoreSoon(); };
    options.forEach((o,i)=>{ if(o.hidden) return; const b=document.createElement('button'); b.innerHTML=subst(o.t)+(o.hint?'<div class="hint">'+o.hint+'</div>':''); if(o.dim) b.classList.add('dim'); b.onclick=()=>done(i); box.appendChild(b); }); box.scrollTop=0; requestAnimationFrame(()=>{ if(keep&&chooseCur===c&&box.scrollHeight>box.clientHeight+4){ dlg.classList.add('hide'); dlg.classList.remove('static'); box.style.bottom=''; box.style.maxHeight=''; } more(); }); } }   /* 留著上一句、選項又放不下（BB-B 10-23 SQ08：橫向、熟客店員先說一句再出六個選項，「不用了」在框外點不到）：收掉那一句，選單用整個高度（那一句在「紀錄」裡）*/   /* 放不下時底部淡出，提示下面還有（BB_218：五個只看得到三個、沒有捲動提示）*/
  GM.choose=choose;
  function caption(who,text,ms){ const el=$('caption'); el.innerHTML=(who?'<b>'+who+'</b>':'')+subst(text); el.classList.remove('hide'); el.style.opacity=1; clearTimeout(caption.t); caption.t=setTimeout(()=>{ el.style.opacity=0; setTimeout(()=>el.classList.add('hide'),300); },ms||3200); }
  GM.caption=caption;
  // 場景開始／結束：鎖住玩家
  function sceneBegin(opts){ if(D.busyDepth===0&&typeof SOCIAL!=='undefined'&&SOCIAL.feel){ SOCIAL.feel={}; SOCIAL.feelOn=true; }   /* 關係有前進的提示：這一段對話裡加的才算（SOCIAL.takeFeel）*/ D.busyDepth++; D.busyWho.push(((new Error().stack||'').split('\n')[2]||'?').trim().replace(/^at /,'').slice(0,140));   /* 誰開的這一段（BUG-BOWL-STUCK-1018：卡住時除錯面板看得到是哪一段沒有結束）*/ E.player.busy=true; E.player.path=null; E.player.target=null; hideHUD(true); $('interact').classList.add('hide'); if(opts&&opts.adv&&typeof ADV!=='undefined'){ ADV.begin({background:opts.background||'blur',right:opts.adv,left:opts.advLeft}); } }
  function sceneEnd(){ D.busyDepth=Math.max(0,D.busyDepth-1); D.busyWho.pop(); if(D.busyDepth===0) D.busyWho.length=0; chooseRestore(); sayRestore(); if(D.busyDepth===0){ if(typeof SOCIAL!=='undefined'&&SOCIAL.takeFeel){ SOCIAL.feelOn=false; const L=SOCIAL.takeFeel(2); if(L.length) setTimeout(()=>toast(L.join('　'),3200),350); } E.player.busy=false; hideHUD(false); E.endCinematic(); letterbox(false); if(E.player.pose==='talk') E.player.pose='idle'; for(const n of E.npcs){ if(n._sayLook){ if(n.lookAt===E.player.obj.position) n.lookAt=null; n._sayLook=false; } }   /* 講完話就不再一直盯著玩家轉頭（2026-10-11：室友講完話後頭一直跟著玩家轉）*/ if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); } }
  GM.sceneBegin=sceneBegin; GM.sceneEnd=sceneEnd;
  // ---------- 運鏡 ----------
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  function headOf(o){ return V(o.position.x,o.position.y+CHAR.headY(o),o.position.z); }   // 多樓層（v9.4）：加上人物所在的地板高度
  function fwd(o){ return V(Math.sin(o.rotation.y),0,Math.cos(o.rotation.y)); }
  function cine(kind,A,B,opt){ opt=opt||{}; A=A||E.player.obj; B=B||A; const ha=headOf(A), hb=headOf(B); const mid=ha.clone().add(hb).multiplyScalar(0.5); const dir=hb.clone().sub(ha); dir.y=0; const d=Math.max(0.01,dir.length()); dir.normalize(); const side=V(-dir.z,0,dir.x); if(opt.flip) side.negate(); let pos,look;
    if(kind==='ots'){ pos=ha.clone().addScaledVector(dir,-1.3).addScaledVector(side,0.7); pos.y=ha.y+0.25; look=hb.clone(); look.y-=0.02; if(E.indoor&&E.zone.bounds){ const b=E.zone.bounds; const alt=ha.clone().addScaledVector(dir,-1.05).addScaledVector(side,-0.55); alt.y=pos.y; const room=p=>Math.min(b.w/2-Math.abs(p.x),b.d/2-Math.abs(p.z)); if(room(alt)>room(pos)+0.3) pos=alt; } }
    else if(kind==='talk'){   /* 平常說話（2026-10-15 使用者：「跟人講話角度不要大轉，會 3D 暈」）：不切到兩人的正側面，鏡頭留在玩家背後偏一側（偏向現在鏡頭那一側），從跟隨鏡頭只轉一點點 */
      const cur=E.camera.position, s0=((cur.x-ha.x)*side.x+(cur.z-ha.z)*side.z)>=0?1:-1; pos=ha.clone().addScaledVector(dir,-2.3).addScaledVector(side,0.95*s0); pos.y=ha.y+0.5; look=ha.clone().lerp(hb,0.62); look.y=(ha.y+hb.y)/2-0.08; }
    else if(kind==='close'){ pos=hb.clone().addScaledVector(dir,-1.25).addScaledVector(side,0.25); pos.y=hb.y+0.06; look=hb.clone(); look.y-=0.04; }
    else if(kind==='two'){ const dist=Math.max(2.3,d*1.25); pos=mid.clone().addScaledVector(side,dist); pos.y=mid.y+0.12; look=mid.clone(); look.y-=0.12; if(E.indoor&&E.zone.bounds&&!opt.flip){ const b=E.zone.bounds; const alt=mid.clone().addScaledVector(side,-dist); const room=p=>Math.min(b.w/2-Math.abs(p.x),b.d/2-Math.abs(p.z)); if(room(alt)>room(pos)) pos=alt; } }
    else if(kind==='low'){ pos=mid.clone().addScaledVector(side,Math.max(2.2,d*1.3)).addScaledVector(dir,-0.6); pos.y=Math.min(A.position.y,B.position.y)+0.8; look=mid.clone(); look.y-=0.2; }
    else if(kind==='wide'){ pos=mid.clone().addScaledVector(side,6).addScaledVector(dir,-2); pos.y=mid.y+2.2; look=mid.clone(); }
    else if(kind==='front'){ const f=fwd(A); pos=ha.clone().addScaledVector(f,2.6); pos.y=ha.y+0.15; look=ha.clone(); look.y-=0.1; }
    else if(kind==='sky'){ const f=fwd(A); pos=ha.clone().addScaledVector(f,-2.5).addScaledVector(side,1); pos.y=ha.y+0.6; look=ha.clone().addScaledVector(f,6); look.y=ha.y+3; }
    if(opt.pos) pos=opt.pos; if(opt.look) look=opt.look; if(E.indoor&&E.zone.bounds){ const b=E.zone.bounds; pos.x=Math.max(-b.w/2+0.35,Math.min(b.w/2-0.35,pos.x)); pos.z=Math.max(-b.d/2+0.35,Math.min(b.d/2-0.35,pos.z)); const cb=E.zone.camBox; if(cb&&cb.x) pos.x=Math.max(cb.x[0],Math.min(cb.x[1],pos.x)); if(cb&&cb.z) pos.z=Math.max(cb.z[0],Math.min(cb.z[1],pos.z)); pos.y=Math.min(pos.y,(E.zone.camMaxY!==undefined?E.zone.camMaxY:3.0)+(E.levels?E.navOf(E.player.lv).y0:0)); }   /* 室內運鏡不超過天花板（階梯教室、多樓層：zone.camMaxY、加上所在樓層的地板高度）*/ E.cinematic(pos,look); if(opt.snap){ E.camera.position.copy(pos); E.cam.look=look.clone(); } }
  GM.cine=cine;
  // ---------- 移動輔助 ----------
  function walkTo(ent,x,z,opts){ opts=opts||{}; return new Promise(res=>{ if(GM.turbo){ E.placeAt(ent,x,z,opts.lv); ent.path=null; res(true); return; } ent.run=!!opts.run; let w=null; const finish=(v)=>{ if(w){ walks.delete(w); w=null; } res(v); };
    const ok=E.moveTo(ent,x,z,()=>finish(true),opts.lv); if(!ok){ E.placeAt(ent,x,z,opts.lv); finish(false); return; }
    w={ent,x,z,lv:opts.lv,ax:ent.obj.position.x,az:ent.obj.position.z,stall:0,total:0,finish}; walks.add(w); }); }   // opts.lv：目的地在哪一層（多樓層區域）
  /* 保險（v9.3 第二十五批）：劇情的自動走路如果被擋住（家具、比人窄的縫）——**遊戲時間**連續 4 秒沒有前進 0.25 m，或走超過 90 秒——就直接放到目的地，劇情不會永遠停住。
     用遊戲時間（主迴圈的 dt）算：淡入、暫停、切到背景時不算；手機掉幀時也不會誤判。這只是保險：GAME.walkFallbacks 記次數、console.warn 留紀錄，
     真實玩家流程測試要求次數是 0（路要真的走得通，tests/flow_class_real.py） */
  const walks=new Set();
  function updateWalks(dt){ for(const w of Array.from(walks)){ const p=w.ent.obj.position; w.total+=dt; if(Math.hypot(p.x-w.ax,p.z-w.az)>0.25){ w.ax=p.x; w.az=p.z; w.stall=0; } else w.stall+=dt;
      if(w.stall>4||w.total>90){ GM.walkFallbacks=(GM.walkFallbacks||0)+1; console.warn('walkTo 卡住 → 放到目的地',w.ent===E.player?'player':(w.ent.name||'npc'),[+p.x.toFixed(2),+p.z.toFixed(2)],'→',[w.x,w.z]); E.placeAt(w.ent,w.x,w.z,w.lv); w.ent.path=null; w.ent.onArrive=null; if(w.ent.pose==='walk'||w.ent.pose==='run') w.ent.pose=w.ent.idlePose||'idle'; w.finish(true); } } }
  GM.walkTo=walkTo;
  function face(ent,x,z){ const o=ent.obj||ent; o.rotation.y=Math.atan2(x-o.position.x,z-o.position.z); }
  GM.face=face;
  function sitAt(ent,seat){ const o=ent.obj; if(seat.lv!==undefined&&E.levels) E.setLv(ent,seat.lv); o.position.set(seat.x,0,seat.z); o.position.y=(seat.y!=null?seat.y:E.heightAt(seat.x,seat.z,ent.lv|0))+(seat.lift||0);   /* 多樓層：座位的高度（階梯教室每一排不一樣高）；lift＝比一般椅子高多少（吧檯高腳椅，QA-W1）*/ o.rotation.y=seat.yaw||0; o.userData.sitFeet=seat.y==null&&!seat.lift&&!seat.floor; o.userData.sitFloor=seat.floor||0;   /* floor＝坐墊高度：跪坐（茶屋的和室、緣側）*/ /* 坐在地面高度的椅子（長椅、Café）：小腿往前伸讓腳踩在地上（character3d.js 的 sitFeet）；階梯教室的座位不伸 */ ent.pose='sit'; ent.idlePose='sit'; ent.path=null; ent.frozen=true; ent.seat=seat; if(E.prePose) E.prePose(ent); }   /* 先套好坐姿（坐下前不會先站一幀）*/
  // 起身：放到椅子旁「半徑 0.3 也站得住」的位置（側邊 → 另一側 → 前方 → 後方，距離 0.75/1.0/1.3），都不行就找最近合法格；否則會發生「有走路動畫但走不動」
  function standUp(ent){ ent.pose='idle'; ent.idlePose='idle'; ent.frozen=false; const s=ent.seat; if(s){ const o=ent.obj; const yaw=s.yaw||0; const r=ent.radius||0.3; const ok=(x,z)=>!E.nav||E.canStand(x,z,r,ent.lv|0); const dirs=[[Math.cos(yaw),-Math.sin(yaw)],[-Math.cos(yaw),Math.sin(yaw)],[Math.sin(yaw),Math.cos(yaw)],[-Math.sin(yaw),-Math.cos(yaw)]]; let best=null; const sameFloor=(x,z)=>s.y==null||Math.abs(E.heightAt(x,z,ent.lv|0)-s.y)<=0.2;   /* 階梯教室：起身要站在同一排的平台上（不能站到前一排）*/
      { const bx=s.x-Math.sin(yaw)*0.6, bz=s.z-Math.cos(yaw)*0.6; if(s.y!=null&&ok(bx,bz)&&sameFloor(bx,bz)) best=[bx,bz]; }   /* 有高度的座位（階梯教室）：先試椅子後面 0.6 m（坐下時就是從那裡坐的）*/
      if(!best) for(const d of [0.75,1.0,1.3]){ for(const [dx,dz] of dirs){ const nx=s.x+dx*d, nz=s.z+dz*d; if(ok(nx,nz)&&sameFloor(nx,nz)){ best=[nx,nz]; break; } } if(best) break; } if(!best&&E.nav){ o.position.set(s.x,o.position.y,s.z); if(E.unstick(ent,12)) best=[o.position.x,o.position.z]; } if(!best) best=[s.x+Math.cos(yaw)*0.75,s.z-Math.sin(yaw)*0.75]; E.placeAt(ent,best[0],best[1]); } ent.seat=null; }
  GM.sitAt=sitAt; GM.standUp=standUp;
  // ---------- NPC ----------
  const CID={an:'heroine_01',sis:'heroine_05',prof:'prof_zhou'};   /* 舊的劇情 id → character_id（spawnNPC、習慣記憶）*/
  function spawnNPC(id,spec,x,z,opts){ opts=opts||{}; const o=CHAR.build(spec); o.position.set(x,0,z); o.rotation.y=opts.yaw||0; const n=E.addNPC(Object.assign({obj:o,lv:opts.lv|0,id,charId:opts.charId||CID[id]||id,name:spec.name||NPCNAME[id]||id,beh:opts.beh||'idle',waypoints:opts.waypoints,talk:opts.talk,talkLabel:opts.talkLabel,pockets:opts.pockets,walkSpeed:opts.walkSpeed,pauseAt:opts.pauseAt!==false,idlePose:'idle',greet:opts.greet!==undefined?opts.greet:!!(G&&(G.flags['met_'+id]||(STORY.people&&STORY.people[id]&&STORY.people[id].known)))},opts.extra||{})); if(opts.seat) sitAt(n,opts.seat); if(opts.pose){ n.pose=opts.pose; n.idlePose=opts.pose; if((n.pose==='sit'||n.pose==='read')&&E.prePose) E.prePose(n); } if(opts.expr) CHAR.setExpr(o,opts.expr); GM.npc[id]=n; return n; }
  GM.spawnNPC=spawnNPC;
  // 由 CHARACTERS 資料生成（3D 模型由 char3d 決定；未來換 GLB 只改資料）
  const ECON_BG=['npc_fangyt','heroine_02','heroine_04'];
  function spawnCharacter(id,x,z,opts){ opts=opts||{}; const c=CHARACTERS[id]; if(!c) return null; if(GM.npc[id]) return GM.npc[id]; let spec=null; if(c.char3d&&c.char3d.spec){ if(typeof c.char3d.spec==='string'){ const base=P3.CAST[c.char3d.spec]||(c.char3d.spec==='prof'?(c.id==='prof_zhou'?STORY.PROF:STORY.profSpec(c)):null); spec=base?Object.assign({},base):STORY.extraSpec(7); } else spec=Object.assign({},c.char3d.spec); } else if(c.char3d&&c.char3d.extra!==undefined){ spec=STORY.extraSpec(c.char3d.extra+40); } else spec=STORY.extraSpec(7); spec.name=c.name; if(c.char3d&&c.char3d.model) spec.model=c.char3d.model; if(c.char3d&&c.char3d.height) spec.height=c.char3d.height; else if(c.height_cm) spec.height=c.height_cm/100; const bgOnly=typeof STORY!=='undefined'&&STORY.isEcon&&STORY.isEcon(G)&&ECON_BG.includes(id)&&!opts.staff;   /* 經濟系那年芷若、子晴、方奕廷只當背景、不能搭話（AA-C 10-18，BB_104 §2-2；芷若在 Café 當店員照舊點餐）*/
    const n=spawnNPC(id,spec,x,z,Object.assign({charId:id,talk:bgOnly?null:(nn)=>STORY.talkCharacter(id,nn),talkLabel:bgOnly?null:'和'+SOCIAL.npcName(id)+'說話',greet:!bgOnly&&SOCIAL.stage(id)!=='STRANGER'},opts,bgOnly?{talk:null,talkLabel:null}:{})); n.name=SOCIAL.npcName(id); n.charId=id; n.tier=c.visual_tier; SOCIAL.noticed(id); return n; }
  GM.spawnCharacter=spawnCharacter;
  GM.despawnLater=function(n,sec){ setTimeout(()=>{ if(E.npcs.includes(n)){ E.removeNPC(n); for(const k in GM.npc) if(GM.npc[k]===n) delete GM.npc[k]; } },(sec||20)*1000); };
  function removeNPC(id){ const n=GM.npc[id]; if(n){ E.removeNPC(n); delete GM.npc[id]; } }
  GM.removeNPC=removeNPC;
  // 路人（含騎腳踏車）
  function spawnExtra(spec,route,opts){ opts=opts||{}; const o=CHAR.build(spec); if(opts.bike){ const b=W3.bike(['#3a6fb0','#8c3b47','#2f5d50','#e0b95b'][(Math.random()*4)|0]); b.position.set(0.55,0,0.1); o.add(b); } const n=E.addNPC({obj:o,name:'',beh:'route',waypoints:route,ri:(Math.random()*route.length)|0,walkSpeed:opts.bike?1.0:1.2+Math.random()*0.4,pauseAt:false,idlePose:'idle',isExtra:true}); const wp=route[n.ri]; E.placeAt(n,wp[0],wp[1],wp[2]); if(opts.pockets) n.pockets=true; return n; }   /* 多樓層：路線點可以是 [x,z,層] */
  GM.spawnExtra=spawnExtra;
  /* 路上騎腳踏車的人：和玩家同一套（bike3d.js 的 BIKE.rider：腳踩踏板、手握把手）。2026-10-11 使用者回報舊版是「坐姿的人＋腳踏車」一起平移、
     腳沒踩踏板，之後一直關著（story3d.js 的 riders：網址加 ?riders 才出現；新版看過畫面以後再打開）*/
  function spawnRider(spec,route,color){ if(typeof BIKE==='undefined'||!route||route.length<2) return null; const x=BIKE.rider(CHAR.build(spec),route,color,spec&&spec.height); E.scene.add(x.obj); E.addExtra(x); GM.extras.push(x); return x; }
  GM.spawnRider=spawnRider;
  // 正式人物模型晚到（手機網速慢、預載逾時）：已經用程序化備用人物（或借用路人底模）建立的主角、NPC、騎車的人，模型一到就原地換上。
  // 位置、朝向、姿勢、表情、坐的位子、劇情狀態都不變（只換 obj）。2026-10-10 線上實玩回報「人物又變得非常醜」的原因：逾時後整場都是備用人物
  /* 主要角色還在背景下載（boot）：開始、繼續、讀取前才等，用同一個載入畫面顯示進度；最多等 3 分鐘（和原本的上限相同），還沒到的之後原地換上 */
  /* 不准退化成醜模型（使用者 2026-10-17「不管怎麼樣都不能讓遊戲進入自動退化成醜的模型」）：所有人物（主要角色＋路人底模）都到齊才進遊戲，沒有時間上限；
     下載失敗會自動重試（ASSETS.ensure），畫面寫「網路不穩，重新下載中」，不會為了快一點就用備用人物進遊戲 */
  async function waitChars(){ if(GM.charsAll||!GM.charsAllP) return; const L=$('loading'), bar=$('bar').firstElementChild, msg=$('loadMsg'), g=GM.allChars||GM.mainChars||[]; const t0=performance.now();
    const show=()=>{ const n=g.filter(k=>ASSETS.has(k)).length; bar.style.width=Math.round(100*n/Math.max(1,g.length))+'%'; msg.textContent='載入人物 '+n+'／'+g.length+'（已下載 '+(ASSETS.bytes.done/1048576).toFixed(1)+' MB）'+(ASSETS.lastErr?'・網路不穩，重新下載中':(performance.now()-t0>20000?'・網路比較慢，還在下載':'')); };
    show(); L.classList.remove('hide'); const iv=setInterval(show,300); try{ await GM.charsAllP; } finally { clearInterval(iv); L.classList.add('hide'); } }
  GM.waitChars=waitChars;
  GM.UPG_EXTRA=1;
  GM.upgradeModels=function(){ if(!E||!E.player) return 0; let n=0;
    if(CHAR.needsUpgrade(E.player.obj)){ const old=E.player.obj, nh=CHAR.upgrade(old); if(nh){ E.player.obj=nh; GM.heroDriver=nh.userData.driver; for(const m of E.npcs) if(m.lookAt===old.position) m.lookAt=nh.position; n++; if(E.prePose) E.prePose(E.player); } }
    let ex=0;   /* 路人（isExtra、騎士）一次最多換 GM.UPG_EXTRA 個（每 1.5 秒叫一次）：新的路人底模到了，不要同一格全部換上（PERF-NPC-POOL-1022：那一格要建 VRM、傳貼圖、編 shader）；主角、有名字的人照舊馬上換 */
    for(const m of E.npcs){ if(m.isExtra&&ex>=GM.UPG_EXTRA) continue; if(CHAR.needsUpgrade(m.obj)){ const nh=CHAR.upgrade(m.obj); if(nh){ m.obj=nh; n++; if(m.isExtra) ex++; if(E.prePose) E.prePose(m); } } }   /* 新的骨架先套好姿勢（坐著的人不會先站一幀）*/
    for(const x of (GM.extras||[])){ if(ex>=GM.UPG_EXTRA) break; if(x.rider&&CHAR.needsUpgrade(x.rider)){ const nh=CHAR.upgrade(x.rider); if(nh){ x.rider=nh; n++; ex++; } } }
    if(n) console.info('upgraded character models:',n); return n; };
  /* 一模一樣的路人站在旁邊（BUG-NPC-DUP-1018）：4 m 內同一層有人用同一個路人底模，換成附近沒人用的（CHAR.reAnon）。換模型會閃一下：平常只換不在畫面裡的人，換區域的黑幕裡（all）全部換 */
  GM.dedupAnon=function(all){ if(!E||!CHAR.anonKeyOf||typeof THREE==='undefined') return 0; const L=E.npcs.filter(n=>n.isExtra&&n.obj&&CHAR.anonKeyOf(n.obj)); if(L.length<2) return 0;
    let fr=null; if(!all&&E.camera&&THREE.Frustum){ fr=new THREE.Frustum(); fr.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(E.camera.projectionMatrix,E.camera.matrixWorldInverse)); } const sph=fr?new THREE.Sphere(new THREE.Vector3(),1.1):null; let n=0;
    for(const a of L){ const pa=a.obj.position, ka=CHAR.anonKeyOf(a.obj); const near=L.filter(b=>b!==a&&(b.lv|0)===(a.lv|0)&&Math.hypot(b.obj.position.x-pa.x,b.obj.position.z-pa.z)<4); if(!near.some(b=>CHAR.anonKeyOf(b.obj)===ka)) continue;
      if(fr){ sph.center.set(pa.x,pa.y+0.9,pa.z); if(fr.intersectsSphere(sph)) continue; }
      const k=CHAR.anonPool.alt(a.obj,new Set(near.map(b=>CHAR.anonKeyOf(b.obj)).concat([ka]))); if(!k) continue; const nh=CHAR.reAnon(a.obj,k); if(nh){ a.obj=nh; if(E.prePose) E.prePose(a); n++; } }
    return n; };
  // ---------- 區域進入 ----------
  let entering=false;
  async function enter(zoneId,spawn,opts){ opts=opts||{}; if(entering) return; entering=true; GM.enterN=(GM.enterN|0)+1;   /* 第幾次換區域：home3d.js backdrop 用來分「剛出家門、3D 還是舊的」和「真的到了新的 3D 地點」*/ let z; try{ if(GM.liveMark) GM.liveMark(true); if(!opts.noFade) await fade(true); GM.npc={}; GM.extras=[]; if(W3.releaseViews) W3.releaseViews();   /* 窗景照片只留新區域要用的（v9.5 審查：16 張 1024×512 一直留著，iPhone 長時間玩可能被系統關掉分頁）*/ if(typeof BIKE!=='undefined'&&G) BIKE.beforeEnter(GM,zoneId,opts);   /* 腳踏車：要去的地方騎得到就一起過去，不行就停下（src/bike3d.js）*/ z=E.loadZone(Z3.ZONES[zoneId],spawn); G.zone=zoneId; G.visited[zoneId]=true; if(!opts.fromLoad){ habit('place:'+zoneId+':'+habitSlot(G.hour)); const comp=G.flags&&G.flags.companion; if(comp) habit('place:'+zoneId+':with:'+(CID[comp]||comp)); }   /* 習慣記憶（AA_110 5-4）*/ if(typeof EVENTS!=='undefined'&&EVENTS.zoneChanged) EVENTS.zoneChanged(zoneId);   /* 短篇事件「同一棟一次進入最多一個」的計數歸零（events3d.js 的 tier）*/ E.player.path=null; E.player.pose='idle'; E.player.frozen=false; E.player.seat=null; E.player.idlePose='idle'; if(STORY.populate) STORY.populate(zoneId,GM); if(typeof BIKE!=='undefined'&&G) BIKE.afterEnter(GM,zoneId); buildMinimap(); if(typeof GUIDE!=='undefined') GUIDE.zoneChanged(); if(opts.onLoaded) opts.onLoaded(z); updateHUD(); A3.setScene(zoneId,G.hour,G.weather); E.update(0.016); GM.dedupAnon(true); if(!opts.noFade&&Z3.prewarm) await Z3.prewarm(E,{cap:2000});   /* 畫面還是黑的：先接上已載過的正式模型、編 shader、傳貼圖，淡入才不會停住（PERF-ZONE-ENTER-1018，zones3d.js）*/ E.render(); if(!opts.noFade){ await fade(false); } if(Z3.warmup) Z3.warmup(E);   /* 淡入以後在背景把還沒編的 shader 編好（X79，zones3d.js）*/ } finally { entering=false; /* 區域建立失敗時錯誤照樣丟出去，但不能讓 entering 永遠是 true（之後就再也換不了區域）*/ } if(STORY.onEnter&&!opts.deferStory) STORY.onEnter(zoneId,GM,opts); if(!opts.noAutosave) autosave(); return z; }   /* deferStory／noAutosave：搭電梯換區域（總圖），走出車廂之後才觸發劇情、存檔 */
  GM.isEntering=()=>entering;
  GM.enter=enter;
  // ---------- 小地圖 ----------
  let mmImg=null;
  let mmImgs={};
  /* 室內也有小地圖（2026-10-14 使用者：「在室內就沒有地圖，看附近有沒有認識的人有點不方便」——原本室內整個藏起來）：畫人物所在那一層的平面（每一層各一張），放大一點 */
  function navImage(nav){ const c=document.createElement('canvas'); c.width=nav.cols; c.height=nav.rows; const x=c.getContext('2d'); const img=x.createImageData(nav.cols,nav.rows); for(let i=0;i<nav.cols*nav.rows;i++){ const b=nav.b[i]; img.data[i*4]=b?70:150; img.data[i*4+1]=b?80:170; img.data[i*4+2]=b?95:140; img.data[i*4+3]=b?200:120; } x.putImageData(img,0,0); return c; }
  function buildMinimap(){ const mm=$('minimap'); for(const c of new Set([mmImg].concat(Object.values(mmImgs)))) if(c){ c.width=0; c.height=0; }   /* 舊區域的小地圖 canvas 立刻釋放（iOS 2D canvas 總記憶體上限，BUG-MAPBLACK）*/ mmImgs={}; mmImg=null;
    if(E.indoor){ const L=E.levels||[E.nav]; if(!L[0]){ mm.style.display='none'; return; } mm.style.display='block'; L.forEach((nv,i)=>{ if(nv) mmImgs[i]=navImage(nv); }); mmImg=mmImgs[0]||null; return; }
    const nav=E.navOf?E.navOf(0):E.nav;   /* 戶外的多層區域（校園：萬才館陽台在第 1 層）畫地面那一層 */ if(!nav){ mm.style.display='none'; return; } mm.style.display='block'; mmImg=navImage(nav); }
  function drawMinimap(){ if(!mmImg) return; const mm=$('minimap'); const x=mm.getContext('2d'); x.clearRect(0,0,mm.width,mm.height); const nav=E.nav; const P=E.player.obj.position; const plv=E.player.lv|0, scale=E.indoor?4.5:2.2; const mImg=E.indoor?(mmImgs[plv]||mmImg):mmImg; const [cx,cz]=nav.toCell(P.x,P.z); x.save(); x.translate(mm.width/2,mm.height/2); x.rotate(E.cam.yaw);   /* 前方朝上：鏡頭在玩家 (sin yaw, cos yaw) 那一側，往前是 (-sin yaw,-cos yaw)，轉 yaw 剛好轉到正上方（v9.3 第二十五批修正：原本 π−yaw 正負號錯，鏡頭朝南／北時地圖整個顛倒，v7 就有）*/ x.drawImage(mImg,-cx*scale,-cz*scale,nav.cols*scale,nav.rows*scale); for(const n of E.npcs){ if(n.isExtra) continue; if(E.levels&&(n.lv|0)!==plv) continue;   /* 別層的人不畫（樓上樓下）*/
      const known=typeof SOCIAL!=='undefined'&&n.charId&&(SOCIAL.has(n.charId,'FIRST_MET')||(!/^heroine_0[1-5]$/.test(n.charId)&&SOCIAL.reveal&&SOCIAL.reveal(n.charId)!=='UNKNOWN'));   /* 認識的人黃色、還不認識的灰色 */
      const [nx,nz]=nav.toCell(n.obj.position.x,n.obj.position.z); x.fillStyle=known?'#e9b96a':'#9aa3ad'; x.beginPath(); x.arc((nx-cx)*scale,(nz-cz)*scale,known?3.2:2.4,0,7); x.fill(); } for(const it of E.interactables){ if(!it.exit) continue; const [nx,nz]=nav.toCell(it.x,it.z); x.fillStyle='#7fc4c9'; x.fillRect((nx-cx)*scale-2,(nz-cz)*scale-2,4,4); } { const bk=typeof BIKE!=='undefined'&&BIKE.parkedAt(G); if(bk&&bk.zone===G.zone){ const [bx,bz]=nav.toCell(bk.x,bk.z); x.fillStyle='#8fd18a'; x.beginPath(); x.arc((bx-cx)*scale,(bz-cz)*scale,3.5,0,7); x.fill(); } }   /* 自己停著的腳踏車（綠點）*/ if(typeof GUIDE!=='undefined') GUIDE.drawMini(x,nav,cx,cz,scale); x.restore(); const W=mm.width, H=mm.height, cy=E.cam.yaw;
    /* 北方標示：世界的北（-z）在地圖上的方向＝(sin yaw, -cos yaw) */ const nr=Math.min(W,H)/2-9; x.font='bold 11px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillStyle='rgba(20,24,30,0.7)'; x.strokeStyle='rgba(255,255,255,0.85)'; x.lineWidth=1; x.beginPath(); x.arc(W/2+Math.sin(cy)*nr,H/2-Math.cos(cy)*nr,7.5,0,7); x.fill(); x.stroke(); x.fillStyle='#ffffff'; x.fillText('北',W/2+Math.sin(cy)*nr,H/2-Math.cos(cy)*nr+0.5);   /* 白字、白框（X77：原本黃字，看起來像地圖邊上一個走不到的黃點；黃色只留給認識的人和目的地）*/
    /* 玩家箭頭：玩家面向 (sin ry, cos ry) 在地圖上＝(sin(ry-yaw), cos(ry-yaw)) */ const a=mmArrowAngle(); x.save(); x.translate(W/2,H/2); x.rotate(a); x.fillStyle='#fff'; x.strokeStyle='rgba(20,24,30,0.8)'; x.lineWidth=1.2; x.beginPath(); x.moveTo(0,-6.5); x.lineTo(4.5,4.5); x.lineTo(0,2.2); x.lineTo(-4.5,4.5); x.closePath(); x.fill(); x.stroke(); x.restore(); }
  function mmArrowAngle(){ const ry=E.player.obj.rotation.y, cy=E.cam.yaw; const fx=Math.sin(ry-cy), fy=Math.cos(ry-cy); return Math.atan2(fx,-fy); }   // 畫面角度：0＝上、順時針
  GM.minimapArrow=()=>{ const d=mmArrowAngle()*180/Math.PI; return (d+360)%360; };   // 測試用（tests/minimap_direction.py）
  // ---------- 互動 ----------
  let nearIt=null;
  function updateInteract(){ const btn=$('interact'); if(E.player.busy||D.active||menuOpen){ btn.classList.add('hide'); nearIt=null; return; } const it=E.nearestInteractable(); if(it&&it!==nearIt){ $('interactLabel').textContent=it.label||'互動'; } nearIt=it; btn.classList.toggle('hide',!it); }
  async function doInteract(){ updateInteract(); const it=nearIt; if(!it) return; if(E.player.riding&&typeof BIKE!=='undefined'&&!it.bike&&!it.look&&!(it.exit&&BIKE.ok(it.exit.to))) BIKE.dismount(GM);   /* 騎著車：說話、坐下、買東西、進建築之前先下車（看告示、騎出校門不用）*/ if(it.onInteract){ if(it.npc) foundPerson(it.npc); it.onInteract(it); return; } if(STORY.interact&&await STORY.interact(it,GM)) return; if(it.look){ if(it.flag&&G&&G.flags) G.flags[it.flag]=true; caption('',it.look,4600); return; }   /* flag：看過就記下（例：法律學院圖書館的指定參考書＝開學待辦的「教科書」，AA_110 6-4）*/ if(it.exit){ if(it.exit.locked){ toast(it.exit.locked); return; } if(typeof DOOR!=='undefined'){ const dp=DOOR.open(GM,it); if(dp) await dp; } await enter(it.exit.to,it.exit.spawn); return; }   /* DOOR：有門的出入口先推門（src/door3d.js，A21）*/ if(it.elevator){ await elevatorRide(it); return; } if(it.seat){ await seatMenu(it); return; } toast('（這裡現在沒有事可做）'); }
  GM.doInteract=doInteract; GM.updateInteract=updateInteract; GM.snapshot=snapshot;
  // 坐下前要先走到椅子旁邊：原本固定走到椅子正前方 0.5 m，但教室的椅子正前方就是桌子（人站不住）→ 走過去卡在桌邊（v9.3 第二十五批，線上回報「找不到地方坐下」）。
  // 改成在前、後、左、右挑「站得住、走得到、路最短」的點
  /* 前 0.8、後 0.9 是前四個都站不住時的備用（2026-10-13 批次 2：博雅 201 後面 0.6、0.9 都站得住，0.9 的路短 0.1 m 就選了它——離椅子 0.9 m，比「坐下」按鈕的範圍 0.8 m 還遠，
     走到那裡看不到按鈕）：備用的路要短 0.5 m 以上才選 */
  /* 坐下前站的位置：椅子前 0.5、後 0.6、兩側 0.55，再來後 0.7、0.75（2026-10-14 v9.6 回歸：社科院北側長桌後 0.6 那一點碰到椅背，原本直接跳到 0.9——比「坐下」按鈕的範圍 0.8 m 遠），最後才是前 0.8、後 0.9 */
  function seatApproach(seat){ const yaw=seat.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), P=E.player.obj.position; let best=null, bd=1e9;
    for(const [dx,dz,pen] of [...(seat.ap?[[seat.ap[0]-seat.x,seat.ap[1]-seat.z,-1]]:[]),   /* seat.ap：座位指定的走近點（Café 的沙發：前面是矮桌，從桌子的一端走近）*/
      [fx*0.5,fz*0.5,0],[-fx*0.6,-fz*0.6,0],[fz*0.55,-fx*0.55,0],[-fz*0.55,fx*0.55,0],[-fx*0.7,-fz*0.7,0.1],[-fx*0.75,-fz*0.75,0.2],[fx*0.8,fz*0.8,0.5],[-fx*0.9,-fz*0.9,0.5]]){ const x=seat.x+dx, z=seat.z+dz, slv=seat.lv!==undefined?seat.lv|0:(E.player.lv|0); if(E.canStand&&!E.canStand(x,z,0.3,slv)) continue; if(seat.y!=null&&Math.abs(E.heightAt(x,z,slv)-seat.y)>0.2) continue; /* 階梯教室：要站在座位那一排的平台上 */ const pth=E.nav?E.pathTo(P.x,P.z,E.player.lv|0,x,z,slv):[[x,z]]; if(!pth||!pth.length) continue; let L=0, px=P.x, pz=P.z; for(const q of pth){ L+=Math.hypot(q[0]-px,q[1]-pz); px=q[0]; pz=q[1]; } if(Math.hypot(px-x,pz-z)>0.6) continue; L+=pen; if(L<bd){ bd=L; best=[x,z]; } }
    return best||[seat.x+fx*0.5,seat.z+fz*0.5]; }
  GM.seatApproach=seatApproach;
  /* 點地面點在椅子上（那一點站不住、離座位 0.45 m 內、同一層）：改成走到那張椅子坐下前站的位置，到了就看得到「坐下」按鈕（engine3d.js 的 E.tapRedirect）。
     點的地方站得住就照舊走過去（只改「點到椅子、找路改去別的地方」的情況）*/
  function tapToSeat(x,z,lv){ if(!E||!E.canStand||E.canStand(x,z,0.3,lv|0)) return null; let best=null, bd=0.45; for(const it of (E.interactables||[])){ const st=it.seat; if(!st||it.hidden||((st.lv|0)!==(lv|0))) continue; const d=Math.hypot(st.x-x,st.z-z); if(d<bd){ bd=d; best=st; } }
    if(!best) return null; const ap=seatApproach(best); return ap?[ap[0],ap[1],best.lv!=null?best.lv|0:lv]:null; }
  GM.tapToSeat=tapToSeat;
  // 搭電梯（v9.4 多樓層，D36）：按按鈕 →（電梯不在這一層就先開過來）→ 門開 → 走進車廂 → 選樓層（整修中的樓層按不亮）→ 門關 → 車廂帶著人上下（看得到整個過程）→ 門開 → 走出來 → 門關
  async function elevatorRide(it){ const el=E.zone&&E.zone.elev; if(!el) return; const P=E.player, here=P.lv|0, base=el.base||1; let arrived=null; sceneBegin(); try{
      const track=(y)=>{ E.cinematic(V(el.cx-3.4,y+2.6,el.cz+4.2),V(el.cx,y+1.2,el.cz)); };
      track(el.y); if(el.lv!==here){ caption('','電梯從 '+(el.lv+base)+' 樓'+(el.lv>here?'下來':'上來')+'……',2200); await el.travel(here,null,track); }
      A3.blip&&A3.blip('ok'); await el.open(); await walkTo(P,el.cx,el.inZ,{lv:here}); face(P,el.cx,el.outZ); track(el.y);
      /* 樓層：f.lv＝這個區域的第幾層；f.zone＝別的區域（總圖：大廳 ⇄ 3F 閱覽區，f.lv 是那個區域的層）；STORY.elevatorLock 可以暫時不讓去某一層（劇情約好的地方）*/
      const cur=f=>!f.zone&&f.lv===here, lockOf=f=>(STORY.elevatorLock&&STORY.elevatorLock(f,GM))||null;
      const opts=el.floors.map(f=>{ const lk=f.open&&lockOf(f); return {t:f.label,hint:!f.open?(f.why||'整修中，暫停開放'):(lk?lk.hint:(cur(f)?'現在在這一層':'')),dim:!f.open||cur(f)||!!lk}; }); opts.push({t:'不搭了，出去'}); let i;
      for(;;){ i=await choose(opts); if(i<el.floors.length){ const f=el.floors[i]; if(!f.open){ toast(f.toast||'這一層整修中，按鈕按不亮'); continue; } const lk=lockOf(f); if(lk){ toast(lk.toast); continue; } if(cur(f)){ toast('你已經在這一層了'); continue; } } break; }
      const f=i<el.floors.length?el.floors[i]:null;
      if(f&&f.zone){ await el.close(); caption('','電梯往'+((f.num||0)>here+base?'上':'下')+'……',2000); await el.leave(f.num,P,track); arrived=f;
        /* 新區域建好、淡入之前就把運鏡放到新區域的電梯前（v9.5 審查：原本淡入那 0.5 秒鏡頭往舊區域座標的運鏡位置飛，掃過閱覽室天花板上方或大廳地板下面）*/
        const tr2=(y)=>{ const e2=E.zone&&E.zone.elev; if(e2) E.cinematic(V(e2.cx-3.4,y+2.6,e2.cz+4.2),V(e2.cx,y+1.2,e2.cz)); };
        await enter(f.zone,Object.assign({},f.spawn),{deferStory:true,noAutosave:true,onLoaded:()=>{ const e2=E.zone&&E.zone.elev; if(e2){ tr2(e2.y); E.snapCinematic(); } }});
        const e2=E.zone&&E.zone.elev; if(e2){ tr2(e2.y); face(P,e2.cx,e2.outZ); A3.blip&&A3.blip('ok'); await e2.open(); E.endCinematic(); await walkTo(P,e2.cx,e2.outZ,{lv:P.lv|0}); await e2.close(); } }
      else { if(f){ const to=f.lv; await el.close(); await el.travel(to,P,track); E.setLv(P,to); P.obj.position.y=el.y; A3.blip&&A3.blip('ok'); await el.open(); }
        E.endCinematic(); await walkTo(P,el.cx,el.outZ,{lv:P.lv|0}); await el.close(); }
    } finally { E.endCinematic(); sceneEnd(); }
    if(arrived){ autosave(); if(STORY.onEnter) STORY.onEnter(arrived.zone,GM,{}); } }
  GM.elevatorRide=elevatorRide;
  GM.seatMenu=(it,so)=>seatMenu(it,so);
  /* 有人坐了（使用者 2026-10-16：選坐下直接坐到別人身上）：長椅坐另一半（離中間 0.45 m），兩邊都有人或單人椅有人就不坐 */
  function freeSeat(st){ const occ=q=>E.npcs.some(n=>n.seat&&(n.seat.lv|0)===(q.lv|0)&&Math.hypot(n.seat.x-q.x,n.seat.z-q.z)<0.4)||E.npcs.some(n=>n.seatTarget&&Math.hypot(n.seatTarget.x-q.x,n.seatTarget.z-q.z)<0.4);
    if(!occ(st)) return st; if(!st.label) return null; const yaw=st.yaw||0, ax=Math.cos(yaw), az=-Math.sin(yaw);
    for(const d of [0.45,-0.45]){ const q=Object.assign({},st,{x:st.x+ax*d,z:st.z+az*d}); if(!occ(q)) return q; } return null; }
  GM.freeSeat=freeSeat;
  async function seatMenu(it,so){ so=so||{}; const P=E.player; const fs=freeSeat(it.seat); if(!fs){ toast(it.seat.label?'長椅坐滿了。':'有人坐了。',2200); return; } if(fs!==it.seat) it=Object.assign({},it,{seat:fs}); sceneBegin(); const ap=seatApproach(it.seat); await walkTo(P,ap[0],ap[1],{lv:it.seat.lv}); sitAt(P,it.seat); actTrack(); seatHabits(it.seat); if(typeof INV!=='undefined'&&INV.seatMeet){ sceneEnd(); let met=false; try{ met=await INV.seatMeet(GM,it.seat); } finally { sceneBegin(); } if(met){ standUp(P); sceneEnd(); return; } }   /* 約好一起來、她已經坐下：坐到她旁邊就開始（BUG-MEET-NOSEAT）*/ E.cam.distTarget=Math.min(E.cam.distTarget,4.2); await sleep(400); if(STORY.onSeat){ try{ await STORY.onSeat(GM,it.seat); }catch(e){ console.warn('STORY.onSeat',e); } }   /* 坐下就開始的事件（trigger:'seat'；例：v0 B2 博雅小桌子）*/ const cls=(typeof CLS!=='undefined')?CLS.seatClass(G,it.seat):null; const opts=[]; if(cls) opts.push({t:'上課：'+cls.c.name,hint:CLS.hhmm(cls.t0)+'–'+CLS.hhmm(cls.t1)+'　快轉到下課（點對話可以略過）'}); const act=!cls&&typeof ACTIVITIES!=='undefined'&&ACTIVITIES.atSeat?ACTIVITIES.atSeat(G,G.zone,it.seat&&it.seat.room):null; if(act) opts.push({t:(act.kind==='lecture'?'聽演講：':'參加：')+act.title,hint:CLS.hhmm(act.t0)+'–'+CLS.hhmm(act.t1)+'　快轉到結束'});   /* 演講、活動（AA_107 第 10-1 節第 5 項：坐下來聽才算到場）*/
    if(cls&&CLS.rememberSeat) CLS.rememberSeat(G,cls,it.seat);   /* 這門課的老位子（DL-01 1-3 第 5 點）*/
    opts.push({t:'坐一下，看看四周',hint:'時間 +20 分鐘'}); if(it.shop==='teahouse') opts.push({t:'讀書',teaNo:true});   /* 一盞不能自習（AA_164 2-3）*/ if(it.study||it.deskStudy){ const sp=CLS.slotPlan?CLS.slotPlan(G,1,'study'):{ok:true,hint:''}; opts.push({t:'讀書',hint:sp.ok?'選讀多久（1～3 小時只算一次）。'+sp.hint:sp.why,dim:!sp.ok});   /* 自習的長度選單（DL-03 2-3）*/ if(!sp.ok&&CLS.jumpTarget){ const pp=CLS.periodAt(G.hour%24); if((pp==='am'||pp==='pm')&&CLS.slotLeft(G,pp,'study')<=0){ const jt=CLS.jumpTarget(G,pp); if(jt>G.hour%24+0.05) opts.push({t:(pp==='am'?'待到中午':'待到晚上')+'（'+String(Math.floor(jt)).padStart(2,'0')+':'+String(Math.round(jt%1*60)).padStart(2,'0')+'）',hint:CLS.SLOT_NAME[pp]+'的次數用完了',jumpTo:jt,jumpWhy:CLS.SLOT_NAME[pp]+'的時間用完了'}); } }   /* 這個時段排滿了：直接到下一個時段（使用者 2026-10-16「下午還剩 0 次，就應該跳晚上」）*/ if(STORY.napOptions) for(const n of STORY.napOptions(G,1)) opts.push({t:'趴著睡一下：'+n.t.replace('小睡 ',''),hint:n.hint,nap:n.to}); }   /* 圖書館、自習區的桌上趴著睡（最多 1 小時，AA_110 6-5）*/ if(it.cafeTable){ const sp=CLS.slotPlan?CLS.slotPlan(G,1,'study'):{ok:true,hint:''}; opts.push({t:'點杯咖啡慢慢讀',hint:sp.ok?'120 元。'+sp.hint:sp.why,dim:!sp.ok}); } opts.push({t:'起身'}); const i=so.autoClass&&cls?0:await choose(opts); const o=opts[i].t;   /* 一鍵上課（DL-01）：坐下就直接上課，不用再選 */ if(opts[i].jumpTo){ sceneEnd(); try{ await CLS.skipTo(GM,opts[i].jumpTo,{why:opts[i].jumpWhy}); } finally { sceneBegin(); } } else if(opts[i].nap){ P.pose='read'; P.idlePose='read'; sceneEnd(); try{ await CLS.skipTo(GM,opts[i].nap,{nap:true}); } finally { sceneBegin(); } } else if(o.startsWith('上課：')){ P.pose='read'; P.idlePose='read'; await CLS.attend(GM,cls,{inScene:true}); } else if(act&&(o.startsWith('聽演講：')||o.startsWith('參加：'))){ P.pose='read'; P.idlePose='read'; await CLS.attendActivity(GM,act,{inScene:true}); } else if(opts[i].teaNo){ await say(null,'這裡不太適合攤開六法。'); } else if(o.startsWith('坐一下')){ P.pose='sit'; await sleep(600); advance(1/3); { const L=(G.zone==='campus'&&!E.indoor?['風從椰林大道那頭吹過來。']:[]).concat(['遠處有人在笑。','你看著來來去去的人，想著今天還要做什麼。']); caption('',L[(Math.random()*L.length)|0],2600); }   /* 「椰林大道的風」只在校園戶外（2026-10-18 使用者：不管坐哪個椅子都有這一句）*/ await sleep(1200); } else if(o.startsWith('讀書')||o.startsWith('點杯')){ const cafe=o.startsWith('點杯'); if(opts[i].dim) toast(opts[i].hint,3000); else if(cafe&&G.money<120) toast('錢不夠'); else { const L=CLS.chooseStudy?await CLS.chooseStudy(GM):{hours:1,uses:[]}; if(L){ if(cafe) money(-120); P.pose='read'; P.idlePose='read'; await studySession(cafe,L.hours); if(CLS.slotUse) CLS.slotUse(G,L.uses); if(CLS.queueJump) CLS.queueJump(G); } } }   /* 讀多久（DL-03）；讀完才扣次數；這個時段用完就排「到下一個時段」 */ standUp(P); sceneEnd(); }
  // 研究所準備：學姊給的文章要讀三次（讀書時可選），讀完進入 PREPARING
  async function gradReadingSession(){ const g=G.social.grad; g.prep=(g.prep||0)+1; const n=g.prep; if(n===1) await say(null,'你翻開學姊給的那篇文章。前十頁在講一個你以為自己懂的概念，讀到第三次才發現原來不懂。你照她說的，用鉛筆在旁邊寫「不同意」。');
    else if(n===2) await say(null,'第二次讀。中段的論證繞了一大圈，你開始看得出作者在哪裡「跳」過去。鉛筆字變多了。');
    else { await say(null,'第三次。你讀完最後一頁，合上文章，發現自己已經在想「如果是我會怎麼寫」。這大概就是學姊說的那個時刻。'); G.flags.grad_read_done=true; if(SOCIAL.GRAD.indexOf(g.interest)<SOCIAL.GRAD.indexOf('PREPARING')) SOCIAL.gradSet('PREPARING',g.field||'公法'); toast('研究所路線：開始準備'); GM.memo('讀完學姊給的文章'); } }
  /* 讀書一小時：學期間先選一科（CLS.studyPick，AA_104 4-3）。不管選哪一科，讀書會／上課卡住的題目照樣會在這時候想通（LEGAL.study，全遊戲只有這裡）、法條筆記照樣會記下來；
     研究所準備（學姊給的文章）在選單最上面（2026-10-13 審查第 4 項：選了科目之後原本直接結束，這些只剩「整理這週的筆記」走得到）*/
  const gradOpt=()=>'讀'+((typeof SOCIAL!=='undefined'&&SOCIAL.datingName&&SOCIAL.datingName('heroine_05'))||'學姊')+'給的那篇文章';   /* 交往中「讀書瑀給的那篇文章」（AA_411 第 1 節第 3 列；只改選項，讀的旁白照舊）*/
  async function studySession(cafe,hours){ const hrs=Math.max(0.5,+hours||1), HRS=hrs===1?'一小時':(hrs===2?'兩小時':(hrs===3?'三小時':Math.round(hrs*60)+' 分鐘')); const before=G.hour; let course=null, asked=false, gradPick=false;   /* hours：讀多久（DL-03：一段 1～3 小時只算一次自習；效果照每小時算）*/ const grad=!!(G.flags.grad_reading&&!G.flags.grad_read_done&&G.social);
    if(typeof CLS!=='undefined'&&typeof CALENDAR!=='undefined'){ try{ const r=await CLS.studyPick(GM,grad?[{t:gradOpt(),hint:'研究所準備（'+((G.social.grad.prep||0))+'/3）'}]:null); if(r){ asked=true; if(r.extra!==undefined) gradPick=true; else if(r.course) course=r.course; } }catch(e){ console.warn('studyPick',e); } }
    await fade(true); advance(hrs); G.stats.study+=Math.max(1,Math.round(hrs)); if(typeof STORY!=='undefined'&&STORY.onStudy){ try{ STORY.onStudy(GM,hrs); }catch(e){ console.warn('STORY.onStudy',e); } }   /* 經濟系重考期：在博雅讀滿兩小時＝讀書日（AA_154 A39）*/ if(course&&hrs>1&&typeof CLS!=='undefined'){ const R=CLS.rec(G); R.prep[course.id]=(R.prep[course.id]||0)+Math.round(hrs)-1; }   /* studyPick 已經加了第一個小時 */
    if(gradPick){ await fade(false); await gradReadingSession(); return; }
    if(course){ await fade(false); await say(null,'你讀了'+HRS+'的'+course.name+'——'+(CLS.topic(course,(CALENDAR.termOf(G.day)||{}).week)||'這週的進度')+'。'); }
    else if(grad&&!asked){ await fade(false); const k=await choose([{t:gradOpt(),hint:'研究所準備（'+((G.social.grad.prep||0))+'/3）'},{t:'讀這週的進度'}]); if(k===0){ await gradReadingSession(); return; } await fade(true); }
    const topics=STORY.studyTopics?STORY.studyTopics(GM):[]; const t=topics.find(x=>!GM.hasNote(x.id)); if(!course) await fade(false);
    /* 選了科目：只出那一科的東西（使用者 2026-10-15：「讀憲法為什麼會出現強行規定無效」——原本不管選什麼都接民總的 studyTopics、刑訴題庫的複習）。
       民總的 studyTopics 只在讀民法總則或沒選科目時；刑訴題庫（QBANK）的複習只在讀刑事訴訟法或沒選科目時 */
    const okTopic=!course||course.id==='civ_general', okLegal=!course||course.id==='crimpro';
    for(let k=0;k<Math.max(1,Math.floor(hrs));k++){   /* 每小時一份：筆記、讀書會卡住的題目（DL-03 2-3）；沒有新的就停 */
    const t=topics.find(x=>!GM.hasNote(x.id)); const studied=(okLegal&&typeof LEGAL!=='undefined'&&G.legal)?LEGAL.study():[];
    if(studied.length){ for(const q of studied){ await say(null,'你回頭看了讀書會／上課時卡住的地方：「'+q.q.replace(/。$/,'')+'」——'+(q.core?q.core:'答案是「'+(q.type==='tf'?q.answer:q.answer+'、'+q.options[q.answer])+'」')+'。這次應該懂了。'); } }
    else if(course&&CLS.studyTopic&&(()=>{ const st=CLS.studyTopic(G,course,id=>GM.hasNote(id)); if(st){ addNote(st.id,st.title,st.body); return st; } return null; })()){ const st=G.notes[G.notes.length-1]; await say(null,'你把〈'+st.title+'〉的筆記整理了一遍。'); }   /* 讀書主題照科目（AA_134 第 1 節）*/
    else if(course&&!(t&&okTopic)){ await say(null,'這週的進度都讀完了。'); break; }
    else if(t&&okTopic){ addNote(t.id,t.title,t.body); await say(null,t.read||('你花了一小時讀'+t.title+'。'+t.body)); }
    else if(!course){ await say(null,'你把這週的筆記重新整理了一遍。沒有新的東西，但腦袋清楚了一些。'); break; }
    else break;
    }
    }
  GM.studySession=studySession;
  // ---------- 存檔 ----------
  function snapshot(){ const P=E.player.obj.position; return Object.assign({},G,{pos:{x:+P.x.toFixed(2),z:+P.z.toFixed(2),yaw:+E.player.obj.rotation.y.toFixed(3),lv:E.player.lv|0,y:+P.y.toFixed(2)},hour:+G.hour.toFixed(3),savedAt:Date.now(),v:SAVE_VER}); }
  function validate(s){ if(!s||typeof s!=='object') return '不是有效的存檔物件'; if(typeof s.v!=='number') return '缺少版本欄位'; if(s.v>SAVE_VER) return '存檔來自較新的版本（v'+s.v+'），本版無法讀取'; if(typeof s.day!=='number'||typeof s.hour!=='number') return '日期／時間欄位損毀'; if(!Z3.ZONES[s.zone]) return '未知的地點：'+s.zone; if(!s.flags||typeof s.flags!=='object') return '旗標欄位損毀'; return null; }
  function migrate(s){ const d=defaults(s.name); s.energy=100;   /* DL-02：體力拿掉了，舊存檔的體力一律當 100 */ for(const k in d){ if(s[k]===undefined||s[k]===null) s[k]=d[k]; } for(const k in d.rel){ if(s.rel[k]===undefined) s.rel[k]=d.rel[k]; } if(s.v<2){ s.social=null; s.events=null; s.legal=null; }
    /* Café 點餐次數（BB_95 2-2，交接包 v1）：舊存檔點過但沒有計數＝當作點過一次（不然芷若會再自我介紹一次）；已經有計數的不動，讀幾次都一樣 */
    if(s.flags&&typeof s.flags==='object'&&s.flags.CAFE_VISITS==null&&s.events&&s.events.done&&s.events.done.ev_cafe_barista_zhiruo) s.flags.CAFE_VISITS=1;
    /* 杜可昕（交接包 v1，BB_95 第 0b 節）：大一上一開始所有玩家都和她交往中；舊存檔也是（現有程式沒有任何事件設過 dating_ 旗標，不會和別人衝突）。之後的分開事件把它設成 false，這裡就不再動 */
    if(s.flags&&typeof s.flags==='object'&&s.flags.dating_kexin===undefined) s.flags.dating_kexin=true;
    if(s.flags&&s.flags.dating_kexin){ if(!s.contacts||typeof s.contacts!=='object') s.contacts={}; if(s.contacts.kexin==null) s.contacts.kexin=0; }
    /* 可昕 12/3 改成「第一份報告交出去的晚上」（BB_95 9-6 改版，AA_140 G01）：舊存檔已經記的 KX_BDAY[1] 搬到 KX_DEC3[1]、清掉（大一的生日改在 4/24 記，不然 4/24 會被當成已經過了）；
       12/3 當天的暫存旗標一起改名。不在標題畫面寫存檔（這裡只改讀進來的物件）*/
    /* 只轉一次（AA_140 G46，2026-10-16 AA-B 驗收）：4/24 的生日（c7621be3）也用 KX_BDAY[1]／_VISIT／_MSG，原本每次讀檔都搬走＝4/24 去找她、讀一次檔就變成 none、還收到「我等了一天。」。
       轉過（KX_DEC3_MIGRATED）、已經有 KX_DEC3（之前讀檔轉過、或 12/3 直接記的）、4/24 的事件演過，都不轉；新遊戲的 defaults 一開始就有 KX_DEC3_MIGRATED */
    if(s.flags&&typeof s.flags==='object'&&!s.flags.KX_DEC3_MIGRATED&&s.flags.KX_DEC3==null&&!(s.events&&s.events.done&&s.events.done.ev_kexin_birthday_y1s2)){ const F=s.flags; if(F.KX_BDAY&&typeof F.KX_BDAY==='object'&&F.KX_BDAY[1]!=null){ F.KX_DEC3=Object.assign({},F.KX_DEC3||{}); if(F.KX_DEC3[1]==null) F.KX_DEC3[1]=F.KX_BDAY[1]; delete F.KX_BDAY[1]; if(!Object.keys(F.KX_BDAY).length) delete F.KX_BDAY; }
      if(F.KX_BDAY_VISIT){ F.KX_DEC3_VISIT=true; delete F.KX_BDAY_VISIT; } if(F.KX_BDAY_MSG){ F.KX_DEC3_MSG=true; delete F.KX_BDAY_MSG; } }
    if(s.flags&&typeof s.flags==='object') s.flags.KX_DEC3_MIGRATED=true;
    if(typeof STORY!=='undefined'&&STORY.lifeLineMigrate&&s.flags&&typeof s.flags==='object'){ try{ STORY.lifeLineMigrate(s); }catch(e){ console.warn('STORY.lifeLineMigrate',e); } }   /* LIFE-LINE（BB_188 A9-2）：舊的 E19／E21／E25 → KX_CAR；過了 10/17 車上的當作演過（先做，ROM.rec 接著補交往紀錄）*/
    if(typeof ROM!=='undefined'&&s.flags&&typeof s.flags==='object'){ try{ ROM.rec(s); }catch(e){ console.warn('ROM.rec',e); } }
    if(typeof DATE!=='undefined'){ try{ DATE.rec(s); }catch(e){ console.warn('DATE.rec',e); } }   /* 校外單獨約會（DATE-S1）：補 dateLog、trips、groupTrips（空的，不追溯以前的出遊，AA_128 1-3）*/   /* 多段感情（v6 S7）：補 ROMANCE_HISTORY、CLEANUP_DONE（有 dating_kexin 的補一筆）*/
    if(typeof STORY!=='undefined'&&STORY.routeWatch&&s.flags&&typeof s.flags==='object'){ try{ STORY.routeWatch(s); }catch(e){ console.warn('STORY.routeWatch',e); } }   /* 交換路線（1A-02，BB-C 10-20）：宿舍舊選單選過、還沒截止的（EXCH_APPLIED_DAY、沒有 EXCH_RULE）讀檔就清掉——讀進來坐著、在劇情裡 S.tick 不跑；已經過了截止、還沒有路線的照同一個規則補（在 ROM.rec 之後：routeFor 讀交往紀錄）*/
    if(typeof PG!=='undefined'&&PG.migrate&&s.flags&&typeof s.flags==='object'){ try{ PG.migrate(s); }catch(e){ console.warn('PG.migrate',e); } }   /* 交換延畢的國考報名（AA_357 1-6）：2029-05-10 被自動設成報名的清掉，2030-05-10 再問（src/postgrad3d.js）*/
    try{ if(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf&&typeof s.day==='number'){ const w=CALENDAR.dateOf(s.day).wd; if(typeof w==='number') s.weekday=((w%7)+7)%7; } }catch(e){}   /* 星期照行事曆重算（BUG-DATE-TIMETABLE-1020：使用者 10-20 的存檔 9/25 週四記成週五，課表、作息都差一天）*/
    if(typeof SOCIAL!=='undefined'&&SOCIAL.alisonSave){ try{ SOCIAL.alisonSave(s); }catch(e){ console.warn('SOCIAL.alisonSave',e); } }   /* AA380 改名 Alison（使用者 10-21 23:2x）：舊存檔裡存下的舊名（手機訊息、群組名、出遊標題、約的標籤、記憶備註、目標）換成 Alison；id yu 不變 */
    if(typeof POOL!=='undefined'&&POOL.migrate){ try{ POOL.migrate(s); }catch(e){ console.warn('POOL.migrate',e); } }
    if(typeof SUP497!=='undefined'&&SUP497.migrate){ try{ SUP497.migrate(s); }catch(e){ console.warn('SUP497.migrate',e); } }   /* AA_497 5-2、第 8 節第 5 點：家族的學妹統一叫佳穎（舊存檔存下的「家族的學妹」「學妹」「宜蓁」帳號名稱換字；姊姊宜蓁不動；同 Alison 改名的做法）*/   /* AA_498 第 1 節改名（撞到主要人物的六位）：舊存檔存下的舊名換新名；第一批五位說過秘密的記成「沒選」（2-10）*/
    s.v=SAVE_VER; return s; }
  function ls(){ try{ return window.localStorage; }catch(e){ return null; } }
  function write(key,obj){ const st=ls(); if(!st) return false; try{ st.setItem(key,JSON.stringify(obj)); return true; }catch(e){ return false; } }
  function read(key){ const st=ls(); if(!st) return null; try{ const t=st.getItem(key); return t?JSON.parse(t):null; }catch(e){ return null; } }
  function autosave(force){ if(!G||!E.player||(D.busyDepth>0&&!force)||GM.titleIdle) return;   /* force：劇情中途的存檔點（出遊到了那裡，outings3d.js）*/ /* 標題畫面（還沒開始或讀檔）不能自動存檔：否則會用空白的第一天蓋掉玩家真正的進度 */ write(KEY_AUTO,snapshot()); GM.lastAuto=performance.now(); }
  GM.autosave=autosave;
  /* 不可逆的轉換之前先備份（CLAUDE.md 存檔規則第 9 點；例：經濟系 8/31 換到法律系，AA_154 2-4b 第 4 點）：寫 fatiao3d_backup，另外寫一份之後不會被蓋掉的 fatiao3d_backup_<key> */
  GM.backupNow=function(label,key){ const s=snapshot(); s.backupLabel=label||''; const ok=write(KEY_BACKUP,s); if(key) write(KEY_BACKUP+'_'+key,s); return ok; };
  function saveSlot(i){ const prev=read(KEY_SLOT+i); if(prev) write(KEY_BACKUP,prev); const ok=write(KEY_SLOT+i,snapshot()); toast(ok?'已存到欄位 '+i:'存檔失敗（瀏覽器儲存不可用）'); renderSlots(); }
  /* 舊存檔的女主角初遇（AA_120 7-4 第 7 點，使用者 2026-10-13 批准）：舊版的一般自我介紹已經記了 FIRST_MET、她的相遇事件卻一次都沒播過——
     這筆 FIRST_MET 改標成「一般招呼」（GREETED），相遇事件就當還沒見過（不會永久錯過）；熟悉度、其他紀錄都不動。
     只動「除了這筆初遇什麼都還沒發生」的人（她的任何事件播過、或有別的記憶，就照舊）；以安（劇情裡認識）、溫學姊（talkSis）不在內。
     只做一次（social.fm120），改之前把讀進來的原始存檔備份到 fatiao3d_backup。
     D61（使用者 2026-10-14 同意放正式版，條件）：①遷移前先備份——另外寫一份這個存檔專用、之後不會被蓋掉的 fatiao3d_backup_fm120_<savedAt>，備份寫不進去就這次先不改；
     ②只改一般搭話留下的 FIRST_MET（連同同一次記下的 met_ 旗標：名單上的人和 FIRST_MET 一致）；③正式初遇事件播過的不動；④熟悉度等關係、事件紀錄、其他旗標都不動；
     ⑤改過一次就不再改（fm120）；⑥存檔資料壞掉（記憶不是物件、事件紀錄壞掉）不改也不丟例外——無法確定正式初遇有沒有發生過時一律不動。測試：tests/save_firstmet_unit.js */
  const MEET_EVENTS={heroine_02:['ev_cafe_barista_zhiruo','ev_zhiruo_ge_group'],heroine_03:['ev_library_door_phone','ev_rain_library_door'],heroine_04:['ev_ziqing_club']};
  function relabelFirstMet(s){ const so=s&&s.social; if(!so||typeof so!=='object'||!so.mem||typeof so.mem!=='object'||so.fm120) return [];
    const ev=s.events; if(!ev||typeof ev!=='object'||!ev.done||typeof ev.done!=='object'){ so.fm120=true; return []; }   /* 事件紀錄壞掉：不知道正式初遇有沒有播過，不動（⑥③）*/
    const done=ev.done, out=[];
    for(const id in MEET_EVENTS){ const M=so.mem[id]; if(!Array.isArray(M)||!M.some(m=>m&&m.tag==='FIRST_MET')) continue;
      if(MEET_EVENTS[id].some(e=>done[e])) continue; if(typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.some(e=>(e.participants||[]).includes(id)&&done[e.id])) continue;
      if(M.some(m=>!m||typeof m!=='object'||(m.tag!=='FIRST_MET'&&m.tag!=='ADJUST'))) continue;   /* 有別的記憶（壞掉的也算）：不動 */
      for(const m of M) if(m.tag==='FIRST_MET') m.tag='GREETED'; if(s.flags&&typeof s.flags==='object') delete s.flags['met_'+id]; out.push(id); }
    so.fm120=true; return out; }
  GM.relabelFirstMet=relabelFirstMet;
  /* 讀檔時做（applySave）：s＝migrate 過的存檔、raw＝讀進來的原始存檔；回傳要用的存檔（D61 ①：先備份；備份寫不進去就回傳沒改的 s，下次讀檔再試）*/
  function firstMetMigrate(s,raw){ const s2=JSON.parse(JSON.stringify(s)); if(!relabelFirstMet(s2).length) return s2;
    const bk=KEY_BACKUP+'_fm120_'+((raw&&raw.savedAt)||'unknown'); const ok=(!!read(bk)||write(bk,raw))&&write(KEY_BACKUP,raw);
    if(!ok){ console.warn('舊存檔初遇修正：備份寫不進去，這次先不改（下次讀檔再試）'); return s; } return s2; }
  GM.firstMetMigrate=firstMetMigrate;
  async function applySave(s){ const err=validate(s); if(err) throw new Error(err); const raw=s; s=migrate(JSON.parse(JSON.stringify(s)));
    s=firstMetMigrate(s,raw);   /* 舊存檔的女主角初遇：先備份再改（AA_120 7-4 第 7 點、D61）*/
    /* 換區域的淡出淡入還沒結束時 enter() 會直接略過：先等它結束再讀檔，否則存檔內容換掉了、人卻沒移過去（下次自動存檔會把這一區的座標記在另一區名下）*/
    for(let i=0;i<200&&entering;i++) await new Promise(r=>setTimeout(r,50)); if(entering) throw new Error('正在切換場景，請稍後再讀取');
    G=s; GM.G=G; bindSystems(); E.player.busy=false; E.endCinematic(); D.busyDepth=0; D.busyWho.length=0; GM.chooseReset(); if(typeof STORY!=='undefined'){ STORY._sleeping=false; STORY._resume=null; } D.stale=false; staleT=0; GM.titleIdle=false; hideHUD(false); GM.running=true; E.hour=G.hour; E.weather=G.weather; E.setWeather(G.weather); const sp=G.pos?{x:G.pos.x,z:G.pos.z,yaw:G.pos.yaw,lv:G.pos.lv|0}:undefined;   /* 多樓層（v9.4）：舊存檔沒有 lv＝一樓 */ await enter(G.zone,sp,{fromLoad:true}); setGoal(G.goal||'—',G.goalDest); updateHUD(); if(G.flags.companion==='an'&&STORY.resumeWalk) STORY.resumeWalk(GM); if(G.flags.CAMP_Y1_ON&&!G.flags.CAMP_Y1&&STORY.campY1) void STORY.campY1(GM,{resume:true}); else if(G.zone==='dorm'&&G.flags.LAW_MOVEIN_DAY!=null&&G.day===G.flags.LAW_MOVEIN_DAY&&!G.flags.KAI_MOVEIN&&STORY.lawMoveIn) void STORY.lawMoveIn(GM,{resume:true}); }   /* 宿營中途存的檔：從下一段接著演（CAMP-L1）*/
  GM.applySave=applySave;
  function exportText(){ return btoa(unescape(encodeURIComponent(JSON.stringify(snapshot())))); }
  function parseImport(t){ t=t.trim(); let obj=null; try{ obj=JSON.parse(t); }catch(e){ try{ obj=JSON.parse(decodeURIComponent(escape(atob(t)))); }catch(e2){ throw new Error('無法解析：不是 JSON 也不是匯出的文字格式'); } } const err=validate(obj); if(err) throw new Error(err); if(obj&&obj._stuck) delete obj._stuck; if(obj&&obj._busy) delete obj._busy; return obj; }
  GM.parseImport=parseImport; GM.exportText=exportText;
  const dayLab=d=>typeof SOCIAL!=='undefined'&&SOCIAL.dayLabel?SOCIAL.dayLabel(d):'第 '+d+' 天';   /* 筆記、日誌的日期（9/11），不是「第 -379 天」（經濟系那一年 day 是負的，2026-10-17 瀏覽器實測）*/
  function renderSlots(){ const box=$('saveSlots'); box.innerHTML=''; const auto=read(KEY_AUTO); const mk=(label,s,onSave,onLoad)=>{ const d=document.createElement('div'); d.className='item'; d.innerHTML='<b>'+label+'</b> '+(s?((typeof STORY!=='undefined'&&STORY.dayTitle?STORY.dayTitle(s):'第 '+s.day+' 天')+' '+fmtTime(s.hour)+' · '+((s.home&&s.home.at?'臺北的家':(Z3.ZONES[s.zone]?Z3.ZONES[s.zone].name:s.zone)))+' · '+s.name+'<div class="muted">'+new Date(s.savedAt).toLocaleString()+'</div>'):'<span class="muted">（空）</span>'); const row=document.createElement('div'); row.className='row2'; row.style.marginTop='8px'; if(onSave){ const b=document.createElement('button'); b.className='btn'; b.textContent='存檔'; b.onclick=onSave; row.appendChild(b); } if(s){ const b=document.createElement('button'); b.className='btn pri'; b.textContent='讀取'; b.onclick=onLoad; row.appendChild(b); } d.appendChild(row); box.appendChild(d); }; mk('自動存檔',auto,null,()=>loadFrom(auto)); for(let i=1;i<=3;i++){ const s=read(KEY_SLOT+i); mk('欄位 '+i,s,()=>saveSlot(i),()=>loadFrom(s)); } }
  async function loadFrom(s){ if(D.busyDepth>0&&!D.stale&&$('titleScreen').classList.contains('hide')){ toast('劇情還在進行，結束後再讀檔',3200); return; }   if(!$('titleScreen').classList.contains('hide')) await waitChars();   /* 從標題畫面讀檔：主要角色還在背景下載就先等（boot 的開遊戲加速）*/   /* 遊戲中劇情演到一半不能讀檔（讀了舊的劇情流程會接著演到新存檔）；標題畫面照常 */ try{ closeMenu(); $('titleScreen').classList.add('hide'); await applySave(s); toast('已讀取'); }catch(e){ toast('讀取失敗：'+e.message,3500); } }
  // ---------- 選單 ----------
  let menuOpen=false;
  function openMenu(tab){ if(tab==='people'||tab==='map'){ openPhone(tab==='people'?'friends':'places'); return; }   /* 2026-10-16 使用者：右上角手機和選單內容重複——人物併進手機「朋友」、地圖併進手機「地點」；選單只留筆記本、存檔、設定、說明 */
    menuOpen=true; E.paused=true; $('menu').classList.remove('hide'); renderNotes(); renderPeople(); renderLegal(); renderMap(); renderSlots(); if(tab) switchTab(tab); }
  function closeMenu(){ menuOpen=false; E.paused=false; $('menu').classList.add('hide'); }
  GM.openMenu=openMenu; GM.closeMenu=closeMenu;
  GM.saveMenu=()=>new Promise(res=>{ openMenu('save'); const iv=setInterval(()=>{ if(!menuOpen){ clearInterval(iv); res(); } },200); });   /* 在家的選單「存檔」：打開存檔分頁，關掉以後回到家裡的選單（home3d.js）*/
  GM.openMenu=t=>openMenu(t);
  function switchTab(t){ document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t)); document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x.id==='tab-'+t)); $('menuTitle').textContent={notes:'筆記本',people:'人物',legal:'法律',map:'地圖',save:'存檔',settings:'設定',help:'說明'}[t]; }
  const GRAD_LABEL={NONE:null,CURIOUS:'有點好奇',CONSIDERING:'認真考慮中',PREPARING:'準備中',APPLYING:'報名了',ADMITTED:'錄取'};
  function renderNotes(){ const box=$('notesList'); box.innerHTML='';
    // 研究所路線（不是按鈕，是你這一年累積下來的東西）
    if(G.social&&G.social.grad&&GRAD_LABEL[G.social.grad.interest]){ const g=G.social.grad; const d=document.createElement('div'); d.className='item'; const log=(g.log||[]).slice(-4).map(l=>'<div class="muted">· '+dayLab(l.day)+'：'+({event:'和人聊到研究所',study:'讀書會裡提到'}[l.reason]||l.reason)+'</div>').join(''); d.innerHTML='<b>法研所：'+GRAD_LABEL[g.interest]+(g.field?'（'+g.field+'）':'')+'</b>'+(G.flags.grad_reading?'<div>學姊給的文章：讀了 '+Math.min(3,g.prep||0)+'/3 次'+(G.flags.grad_read_done?'，讀完了':'')+'</div>':'')+log; box.appendChild(d); }
    /* 筆記的第一頁（AA_12 0-3 第 3 點）：祐廷自己的一行字，四年改寫四次，舊的劃掉。NOTE_PAGE1＝改寫到第幾次（沒有＝開學那一行）；第一次改寫在沛珊的三段論（BB_95 3-5）。措辭需法律審查（LEGAL_REVIEW_REQUIRED）*/
    { const P1=['遇到問題 → 找條文。','遇到問題 → 先問：誰、向誰、依據什麼、請求什麼。'], k=Math.min(P1.length-1,Math.max(0,G.flags.NOTE_PAGE1|0)); const d=document.createElement('div'); d.className='item'; d.innerHTML='<b>第一頁</b>'+P1.slice(0,k+1).map((t,i)=>i<k?'<div class="muted"><s>'+t+'</s></div>':'<div>'+t+'</div>').join(''); box.appendChild(d); }
    { const h=typeof EAT!=='undefined'&&EAT.notesHTML?EAT.notesHTML(G,dayLab):''; if(h){ const d=document.createElement('div'); d.className='item'; d.innerHTML=h; box.appendChild(d); } }   /* 吃過的（src/eat3d.js，AA_329 第 2 節）*/
    if(!G.notes.length&&!G.memo.length){ const m=document.createElement('div'); m.className='muted'; m.textContent='還沒有其他筆記。上課、讀書、和人聊天都會留下紀錄。'; box.appendChild(m); } for(const n of G.notes){ const d=document.createElement('div'); d.className='item'; d.innerHTML='<b>'+n.title+'</b><div>'+n.body+'</div><div class="muted">'+dayLab(n.day)+'</div>'; box.appendChild(d); } if(G.memo.length){ const d=document.createElement('div'); d.className='item'; d.innerHTML='<b>日誌</b>'+G.memo.slice(-8).map(m=>'<div>· '+dayLab(m.day)+'：'+(typeof STORY!=='undefined'&&STORY.memoText?STORY.memoText(G,m):m.t)+'</div>').join(''); box.appendChild(d); } }
  function knownIds(){ return Object.keys(CHARACTERS).filter(id=>{ const c=CHARACTERS[id]; if(c.social_layer==='B') return ['ACQUAINTANCE','FRIEND'].includes(SOCIAL.reveal(id));   /* 不熟的同學：說過話的才算（AA_498 2-2：「被生成 3 次以後外觀描述進朋友頁」拿掉）*/ return SOCIAL.has(id,'FIRST_MET')||G.flags['met_'+id]||(['zhe','kai','prof_zhou'].includes(id)&&(G.stage||'law')==='law')||!!(G.contacts&&G.contacts[id]!=null)||(id==='kexin'&&!!G.flags.dating_kexin); }); }   /* 阿哲、阿凱、周教授開場就熟只在法律系（經濟系那一年不列，BB-C 10-18 BUG-ECON-FRIENDS）。有聯絡方式的人也算認識：遠距女友可昕從開局就在交往、沒有「第一次見面」的紀錄（使用者 2026-10-16：朋友清單沒有可昕）*/
  GM.knownIds=knownIds;   // 認識的人（人物頁、大地圖的人物線索共用）
  function whereText(id){ const w=STORY.whereIs&&STORY.whereIs(GM,id); if(!w) return ''; if(w.away) return w.away; return (typeof PLACES!=='undefined'&&PLACES.names[w.zone]||w.zone)+(w.act?'（'+w.act+'，到 '+w.until+'）':''); }
  GM.whereText=whereText;
  /* 帶我去找某人（大地圖 👥、手機「朋友」的「帶我去」；2026-10-13 使用者：「說可以找朋友但朋友在哪啊」）：目標改成「去找…」，地圖畫路線、方向提示指過去
     （src/guide3d.js 的 target：d.npc 照他現在的作息決定往哪一區、在同一區就指到他身上）；跟他說上話後恢復原本的目標（story3d.js talkCharacter）*/
  function findPerson(id){ const w=STORY.whereIs&&STORY.whereIs(GM,id); const nm=(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(id):((CHARACTERS[id]||{}).name||id);
    if(!w||!w.zone){ toast(nm+(w&&w.away?'：'+w.away:'現在沒有固定的行程，不知道在哪'),3200); return false; }
    G.flags.findWho=id; setGoal('去找'+nm+'（'+whereText(id)+'）',{zone:w.zone,npc:id,name:'去找'+nm}); toast('目標：去找'+nm+'。地圖上有路線',2600); return true; }
  GM.findPerson=findPerson;
  /* 「帶我去」找到人了（和他說話）：恢復原本的目標（今天的課表；沒有課表系統就自由行動）*/
  function foundPerson(n){ const w=G.flags.findWho; if(!w||!n) return; if(n.charId!==w&&n.id!==w&&CID[n.id]!==w) return; G.flags.findWho=null; if(typeof CLS!=='undefined'&&CLS.setGoal&&typeof CALENDAR!=='undefined') CLS.setGoal(GM); else setGoal('自由行動',null); }
  GM.foundPerson=foundPerson;
  function renderPeople(){ const box=$('peopleList'); box.innerHTML=''; const ids=knownIds(); if(!ids.length){ box.innerHTML='<div class="muted">還沒認識任何人。</div>'; }
    const order={D:0,A:1,C:2,F:3,E:4,B:5}; ids.sort((a,b)=>(order[CHARACTERS[a].social_layer]??9)-(order[CHARACTERS[b].social_layer]??9)); for(const id of ids){ const c=CHARACTERS[id]; const d=document.createElement('div'); d.className='item'; const name=SOCIAL.displayName(id); const tag=SOCIAL.yearTag(id); const mems=SOCIAL.memories(id).slice(-5).map(m=>'<span class="muted">· 第 '+m.day+' 天 '+(SOCIAL.MEMORY_LABEL[m.tag]||m.tag)+((SOCIAL.noteShown?SOCIAL.noteShown(id,m):m.note)?'（'+(SOCIAL.noteShown?SOCIAL.noteShown(id,m):m.note)+'）':'')+'</span>').join('<br>'); const rv=SOCIAL.reveal(id); const poolPage=c.social_layer==='B'&&typeof POOL!=='undefined'&&!!POOL.pageDesc; const desc=poolPage?POOL.pageDesc(id):((c.social_layer==='B'&&rv!=='FRIEND')?(rv==='ACQUAINTANCE'?(c.facts?c.facts[0]:''):''):(c.personality||''));   /* 法律系同學二十位（AA_498 2-2、2-8）：人物頁一句話（升到朋友＝personality）＋做過的事一行一行 */ const wt=whereText(id); d.innerHTML='<b>'+name+'</b> <span class="muted">'+tag+'</span>'+(wt?'<div style="color:#ffd88a">現在大概在：'+wt+'</div>':'')+'<div>'+desc+'</div>'+(poolPage&&POOL.deedsHTML?POOL.deedsHTML(id,G):'')+'<div>'+SOCIAL.describe(id)+'</div>'+(mems?'<div style="margin-top:4px">'+mems+'</div>':''); box.appendChild(d); } }
  function renderLegal(){ const box=$('legalList'); if(!box) return; box.innerHTML=''; const add=(html,cls)=>{ const d=document.createElement('div'); d.className='item'+(cls?' '+cls:''); d.innerHTML=html; box.appendChild(d); };
    const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])), TN={Y1S1:'大一上',Y1S2:'大一下',Y2S1:'大二上',Y2S2:'大二下',Y3S1:'大三上',Y3S2:'大三下',Y4S1:'大四上',Y4S2:'大四下',Y0S1:'經濟系大一上',Y0S2:'經濟系大一下'};
    /* 使用者 2026-10-16 試玩：一開始就有刑訴三大類、而且只有刑訴——改成只列上過的課（CLS.legalCourses）；刑訴題庫（使用者提供的 Q001–Q084）只在讀書會、課堂真的遇到過以後才列 */
    const LC=typeof CLS!=='undefined'&&CLS.legalCourses?CLS.legalCourses(G):[]; let lastCur=null;
    for(const e of LC){ if(lastCur!==e.current){ lastCur=e.current; add('<b>'+(e.current?'這學期':'之前的學期')+'</b>','muted'); }
      add('<b>'+esc(e.c.name)+'</b><div class="muted">'+(TN[e.term]||e.term)+'・上過 '+e.topics.length+' 週</div>'+e.topics.map(t=>'<div>· 第 '+t.w+' 週　'+esc(t.title)+'</div>').join('')); }
    const sm=LEGAL.summary(); const met=Object.values(sm.bySec).some(b=>b.total-b.unseen>0);
    if(met){ add('<b>刑事訴訟法（讀書會、課堂遇到的題目）</b>','muted'); for(const sec in sm.bySec){ const b=sm.bySec[sec]; if(b.total-b.unseen<=0) continue; add('<b>刑事訴訟法・'+sec+'</b><div class="muted">聽過 '+b.seen+' · 混淆 '+b.confused+' · 學到 '+b.learned+' · 理解 '+b.understood+' · 熟練 '+b.mastered+'（遇到 '+(b.total-b.unseen)+' 個爭點）</div>'); } }
    if(sm.misc.length) add('<b>你容易混淆的地方</b>'+sm.misc.map(m=>'<div>· '+esc(m.label)+'（'+m.n+' 次）</div>').join(''));
    if(!LC.length&&!met) add('還沒上過課。上課、讀書會、和同學討論以後，學到的東西會記在這裡。','muted');
    else add('上課、讀書會、同學討論裡學到的會記在這裡；讀書可以把混淆的地方讀懂。','muted'); }
  function renderMap(){ const box=$('mapList'); box.innerHTML='';
    /* 快速前往（2026-10-11 使用者：走路太慢；大地圖的 🚶 也開這裡）：多了霖澤館、萬才館、總圖、Café、公館的店（有開放時間的地方關門時不能去，寫幾點開）。D54：時間依距離（CLS.travelMinutes）；「已知」的地方才能去（placeState 的 KNOWN0＋去過的店）*/
    if(typeof HOME!=='undefined'&&HOME.canGo&&HOME.canGo(G)&&!(HOME.at&&HOME.at(G))){ const d=document.createElement('div'); d.className='item row2'; d.style.justifyContent='space-between'; d.innerHTML='<span>回臺北的家</span>'; const b=document.createElement('button'); b.className='btn pri'; b.textContent='回家'; b.onclick=async()=>{ if(E.player.busy||GM.titleIdle){ toast('現在不能移動'); return; } closePhone(); if(menuOpen) closeMenu(); await HOME.go(GM); }; d.appendChild(b); box.appendChild(d); }   /* 住家裡（休學後、放假）出遊演完人在外面：手機也能直接回家（2026-10-18 BB-C：原本只能走到校門口或宿舍房間；HOME.go 自己有交通字卡、時間）*/
    const places=PLACE_LIST();   /* 手機「地點」與大地圖用同一份（D54）*/ for(const [z,label,sp] of places){ if(!Z3.ZONES[z]) continue; const d=document.createElement('div'); d.className='item row2'; d.style.justifyContent='space-between'; const st=placeState([z,label,sp]); const ok=st.known&&st.open&&!st.here; const mins=st.mins; const ht=typeof PLACES!=='undefined'&&PLACES.hours[z]?(PLACES.hours[z].rules?PLACES.todayText(z,G.day):(PLACES.hours[z].open!=null?PLACES.hours[z].text:'')):''; d.innerHTML='<span>'+label+(ht?' <span class="muted">'+ht+'</span>':'')+'</span>'; const b=document.createElement('button'); b.className='btn'+(ok?' pri':''); b.textContent=ok?'前往（約 '+mins+' 分鐘）':(!st.known?'還沒去過':(st.here?'你在這裡':'已閉館')); b.disabled=!st.known||st.here; b.onclick=async()=>{ await quickGo([z,label,sp]); }; d.appendChild(b); box.appendChild(d); } }
  // ---------- 設定 ----------
  function loadSettings(){ const s=read(KEY_SET); if(s) Object.assign(S,s); }
  function saveSettings(){ write(KEY_SET,S); }
  function applySettings(){ $('mdbg').style.display=(S.mdbg||/mdbg|debug/.test(location.search))?'block':'none'; if($('setMdbg')) $('setMdbg').checked=!!S.mdbg; if($('setGuide')) $('setGuide').checked=S.guide!==false; if($('setClassRemind')) $('setClassRemind').checked=S.classRemind!==false; if($('setWakeMenu')) $('setWakeMenu').checked=S.wakeMenu!==false; E.setQuality(S.quality); $('joy').style.display=S.joystick?'block':'none'; A3.setVolume(S.volume); $('fps').style.display=S.fps?'block':'none'; $('setQuality').value=S.quality; $('setJoy').checked=S.joystick; $('setVol').value=S.volume; $('setSpeed').value=S.textSpeed; $('setFps').checked=S.fps; $('setGlb').checked=S.glbChar!==false; }
  // ---------- 搖桿 ----------
  function setupJoystick(){ const joy=$('joy'); const knob=joy.firstElementChild; let pid=null, cx=0, cy=0; const R=44; joy.addEventListener('pointerdown',e=>{ if(E.player.busy) return; pid=e.pointerId; try{ joy.setPointerCapture(pid); }catch(err){} const r=joy.getBoundingClientRect(); cx=r.left+r.width/2; cy=r.top+r.height/2; move(e); }); const move=e=>{ if(e.pointerId!==pid) return; let dx=e.clientX-cx, dy=e.clientY-cy; const d=Math.hypot(dx,dy); const m=Math.min(1,d/R); if(d>0){ dx/=d; dy/=d; } knob.style.transform='translate('+(dx*m*R)+'px,'+(dy*m*R)+'px)'; E.input.joy.x=dx*m; E.input.joy.y=dy*m; E.input.joy.active=m>0.15; E.input.joy.run=m>0.92; }; joy.addEventListener('pointermove',move); const up=e=>{ if(e.pointerId!==pid) return; pid=null; knob.style.transform=''; E.input.joy.active=false; E.input.joy.x=0; E.input.joy.y=0; E.input.joy.run=false; }; joy.addEventListener('pointerup',up); joy.addEventListener('pointercancel',up); }
  // ---------- 主迴圈 ----------
  let last=0, fpsAcc=0, fpsN=0, stepAcc=0; GM.fps=0;
  // TEMP MOVEMENT DEBUG TELEMETRY（設定可開；?mdbg 也可）：找「input 不是 0、動畫在跑、但位置不動」的原因用
  const tele={lx:0,lz:0,lt:0}; function movementTelemetry(dt){ const P=E.player; if(!P) return; const o=P.obj.position; const now=performance.now(); const el=Math.max(0.001,(now-tele.lt)/1000); const vx=(o.x-tele.lx)/el, vz=(o.z-tele.lz)/el; tele.lx=o.x; tele.lz=o.z; tele.lt=now; const inp=E.input; const keys=Object.keys(inp.keys).filter(k=>inp.keys[k]).join(''); const model=P.obj.userData&&P.obj.userData.model; const locked=P.busy||D.active||menuOpen||E.cam.mode!=='follow'||(typeof EVENTS!=='undefined'&&!!EVENTS.running); const cs=E.canStand?E.canStand(o.x,o.z,P.radius||0.3):true; const sc=E.freeScore?E.freeScore(o.x,o.z,P.radius||0.3):5; const b=P.blockedAt; const sp=E.lastSpawn||{};
    $('mdbg').textContent='INPUT  joy=('+inp.joy.x.toFixed(2)+','+inp.joy.y.toFixed(2)+') active='+inp.joy.active+' run='+(inp.joy.run||inp.runToggle||!!P.runHold)+' keys='+(keys||'-')+'\nVEL    ('+vx.toFixed(2)+', 0, '+vz.toFixed(2)+') m/s  speed='+(P.speed||0).toFixed(2)+'\nPOS    controller ('+o.x.toFixed(2)+', '+o.y.toFixed(2)+', '+o.z.toFixed(2)+')\nVISUAL model local ('+(model?model.position.x.toFixed(2)+', '+model.position.y.toFixed(2)+', '+model.position.z.toFixed(2):'-')+') driver='+(P.obj.userData&&P.obj.userData.driver)+'\nLOCKED '+locked+'  busy='+P.busy+' dlg='+D.active+' menu='+menuOpen+' cam='+E.cam.mode+' event='+((typeof EVENTS!=='undefined'&&EVENTS.running)||'-')+' adv='+(typeof ADV!=='undefined'&&ADV.active)+'\nSCENE  depth='+D.busyDepth+(D.stale?' STALE':'')+' by='+(D.busyWho[D.busyWho.length-1]||'-')+'\nSTATE  pose='+P.pose+' seat='+(P.seat?'yes':'no')+' frozen='+!!P.frozen+' path='+(P.path?P.path.length:'-')+' zone='+G.zone+'\nCOLL   standable='+cs+' score='+sc+'/5'+(b?' BLOCKED→('+b.x.toFixed(2)+','+b.z.toFixed(2)+') slide='+b.slide:' none')+'\nSPAWN  '+(sp.zone||'-')+' ('+sp.x+', '+sp.z+')'+(sp.fixed&&(sp.fixed[0]!==sp.x||sp.fixed[1]!==sp.z)?' → moved to ('+sp.fixed[0]+','+sp.fixed[1]+')':'')+'\nFPS    '+GM.fps.toFixed(0); }
  /* 劇情鎖住、畫面上又什麼都沒在演（沒有對話、選項、事件、2D、手機、選單、淡入淡出、日期卡、劇情走路）超過 10 秒：
     讓選單打得開、可以讀檔或回標題，不會永遠卡死（BUG-BOWL-STUCK-1018，使用者 10-18 保齡球演完在宿舍卡住；D36「玩家一定能離開」）。
     不自己解鎖、不跳過劇情：只放開讀檔／回標題，並把是哪一段沒結束寫進 console 和除錯面板 */
  let staleT=0;
  function staleCheck(rdt){ const P=E.player; if(!P||GM.titleIdle||!(D.busyDepth>0||P.busy)){ staleT=0; if(D.stale) D.stale=false; return; }
    const tc=$('title3'), live=D.active||!$('choices').classList.contains('hide')||(typeof EVENTS!=='undefined'&&!!EVENTS.running)||(typeof BADCLIP!=='undefined'&&BADCLIP.busy)||phoneOpen||menuOpen||$('fade').classList.contains('on')||(tc&&+tc.style.opacity>0)||walks.size>0||!!(P.path&&P.path.length);
    if(live){ staleT=0; if(D.stale) D.stale=false; return; }
    /* 只剩 2D 畫面（ADV）開著、沒有對話、選項、事件……：原本一直算「還在演」，劇情停在一半（例：一句話被另一段蓋掉、那一段出錯沒收）就永遠不放開讀檔、也不記 _stuck（STUCK-HARDEN-1027）。
       ADV 自己沒有等點擊的東西（等點擊都是 say／choose），換圖、淡入是幾秒的事：只剩 ADV 開著放寬到 30 秒才算停住 */
    staleT+=Math.min(rdt,0.5); if(staleT<((typeof ADV!=='undefined'&&ADV.active)?30:10)||D.stale) return; D.stale=true;
    console.warn('劇情鎖住沒有結束（BUG-BOWL-STUCK-1018）',{depth:D.busyDepth,busy:P.busy,cam:E.cam.mode,by:D.busyWho.slice(),zone:G&&G.zone,day:G&&G.day,hour:G&&G.hour});
    stuckLog(true); hideHUD(false); toast('畫面好像停住了。可以打開選單讀檔，或回標題。',6000); }
  /* 卡住的紀錄（BUG-MOVEOUT-STUCK-1018、BUG-BOWL-STUCK-1018：瀏覽器照劇情重演都沒卡住，要使用者那一局的線索）：存在瀏覽器（最近 5 筆，讀檔也不會不見），
     「匯出存檔」的檔案多一欄 _stuck——使用者照常上傳存檔，就看得到是哪一段沒結束（D.busyWho）、在哪一天哪裡。不影響遊戲 */
  function stuckLog(add){ let L=[]; try{ L=JSON.parse(localStorage.getItem('fatiao3d_stuck')||'[]'); if(!Array.isArray(L)) L=[]; }catch(e){ L=[]; }
    if(add){ L.push({at:new Date().toISOString().slice(0,16),v:(($('verLabel')||{}).textContent||'').replace(/^版本\s*/,''),day:G&&G.day,hour:G&&+(+G.hour).toFixed(2),zone:G&&G.zone,depth:D.busyDepth,by:D.busyWho.slice(0,4),cover:D.coverWho||null,ff:typeof ECONFF!=='undefined'?!!ECONFF.busy:null,evr:typeof EVENTS!=='undefined'?EVENTS.running||null:null}); L=L.slice(-5); try{ localStorage.setItem('fatiao3d_stuck',JSON.stringify(L)); }catch(e){} }
    return L; }
  GM.stuckLog=stuckLog;
  function frame(now){ requestAnimationFrame(frame); if(!GM.running) return; const realDt=(now-last)/1000||0.016; let dt=Math.min(GM.turbo?0.3:0.1,realDt); last=now; if(E.paused||document.hidden) return; E.update(dt); if(typeof BIKE!=='undefined') BIKE.tick(GM,dt); updateWalks(dt); dlgTick(dt); staleCheck(realDt); if((GM._upT=(GM._upT||0)-realDt)<0){ GM._upT=1.5; GM.upgradeModels(); GM.dedupAnon(false); }
    // 時間流動（自由行動時）
    if(!E.player.busy&&!D.active){ G.hour+=dt*GM.hourRate; E.hour=G.hour; if(E.frame%3===0) actTrack(); }
    if(!GM.titleIdle&&STORY.routeWatch) STORY.routeWatch(G);   /* 交換路線（1A-02）：每一格都看，不管忙不忙——上課坐著、劇情裡、睡覺時 S.tick 不跑，時間跨過截止以後的第一格就照那一刻定（BB-C 10-20）*/
    if(!GM.titleIdle&&!entering&&!E.player.busy&&!D.active&&!STORY._sleeping&&STORY.leaveTouch) STORY.leaveTouch(GM);   /* 要走的人走到玩家身上（離出口 3.5 m 內、0.6 m 內）就先移除：每一格都看（BB-C 10-21：放在 S.tick 只有每 30 格一次，SwiftShader 0.8 fps 時要 37 秒，客人疊在玩家身上 24 秒）*/
    // 腳步聲
    const P=E.player; if(P.pose==='walk'||P.pose==='run'){ stepAcc+=dt*(P.pose==='run'?3.2:1.9); if(stepAcc>=1){ stepAcc=0; A3.step(P.pose==='run',E.indoor); G.stats.steps++; } if(G.stats.steps%400===0&&G.stats.steps>0) {} }
    if(E.frame%3===0&&$('mdbg').style.display!=='none') movementTelemetry(realDt*3);
    updateInteract(); if(typeof GUIDE!=='undefined') GUIDE.tick(realDt); if(E.frame%2===0) drawMinimap(); if(E.frame%30!==0&&hudStale()) updateHUD(); if(E.frame%30===0){ updateHUD(); if(typeof devCareer==='function') devCareer(); if(!entering){ if(STORY.tick) STORY.tick(GM,dt*30); if(typeof EVENTS!=='undefined'&&EVENTS.tick&&G.social) EVENTS.tick(dt*30); if(G.hour>=24+2.5&&!E.player.busy&&STORY.forceHome) STORY.forceHome(GM); } }   /* 換區域（含讀檔）的淡出淡入期間不判斷劇情：applySave 先換上存檔的 G 才 await enter，這段時間 G.zone 是新區域、玩家還站在舊位置——2026-10-17 回歸：讀檔回到霖澤館門口，小安追上來（離門 6 m 才觸發）在載入途中就開演 */
    if(E.frame%120===0) A3.setScene(G.zone,G.hour,G.weather);
    if(performance.now()-GM.lastAuto>45000) autosave();
    E.render(); fpsN++; fpsAcc+=realDt; if(fpsAcc>=1){ GM.fps=fpsN/fpsAcc; fpsN=0; fpsAcc=0; if(S.fps) $('fps').textContent=GM.fps.toFixed(0)+' fps · '+E.renderer.info.render.calls+' calls · '+E.renderer.info.render.triangles+' tris'; } }
  // ---------- 啟動 ----------
  // ---------- 手機（D54 的順序第 4 步：今天、課表；訊息、朋友之後）----------
  let phoneOpen=false, phoneTab='today';
  function renderPhone(){ if(!phoneOpen||typeof CLS==='undefined'||!G) return; const body=$('phoneBody'); const inTh=phoneTab==='msg'&&!!phoneThread, st0=body.scrollTop, atEnd=body.scrollHeight-body.scrollTop-body.clientHeight<80; body.innerHTML=phoneTab==='week'?CLS.weekHTML(G):(phoneTab==='feed'?(typeof FEED!=='undefined'?FEED.html(G):''):phoneTab==='places'?placesHTML():(phoneTab==='friends'?friendsHTML():(phoneTab==='events'?eventsHTML():(phoneTab==='msg'?msgHTML():(phoneTab==='album'?albumHTML():invTodayHTML()+todayActsHTML()+CLS.todayHTML(G))))));
    body.querySelectorAll('[data-gact]').forEach(b=>b.onclick=async()=>{ const a=PHONE.GROUP_ACTS&&PHONE.GROUP_ACTS[+b.dataset.gact]; if(!a) return; if(E.player.busy){ toast('現在不能約人'); return; } closePhone(); sceneBegin(); try{ await a.run(GM); } finally { sceneEnd(); } autosave(); openPhone('msg'); });   /* 群組裡的「約」*/
    body.querySelectorAll('[data-tact]').forEach(b=>b.onclick=async()=>{ const a=Array.isArray(PHONE.TODAY_ACTS)?PHONE.TODAY_ACTS[+b.dataset.tact]:null; if(!a||(a.show&&!a.show(G))||E.player.busy) return; closePhone(); sceneBegin(); try{ await a.run(GM); } finally { sceneEnd(); } autosave(); openPhone('today'); });   /* 「今天」頁別的模組放的按鈕（PHONE.TODAY_ACTS：{label, show(G), run(GM)}；例：分開以後一週內的「手機筆記寫一行」，src/v6ex3d.js）*/
    body.querySelectorAll('[data-inv]').forEach(b=>b.onclick=async()=>{ if(E.player.busy){ toast('現在不能約人'); return; } closePhone(); sceneBegin(); try{ await INV.flow(GM,b.dataset.inv,null,false); } finally { sceneEnd(); } openPhone('msg'); });   /* 手機約人（使用者第 3 點）*/
    body.querySelectorAll('[data-ans]').forEach(b=>b.onclick=()=>{ const [iv,a]=b.dataset.ans.split('|'); const r=a.startsWith('c:')?INV.answerChange(G,iv,a.slice(2)):INV.answer(G,iv,a); if(r&&r.res==='later'&&!r.noFlow){ const v=INV.byId(G,iv); if(v){ closePhone(); sceneBegin(); INV.flow(GM,v.who,null,false).finally(()=>{ sceneEnd(); openPhone('msg'); }); return; } } renderPhone(); });   /* 對方約你／改約的回覆（noFlow：她主動約你的那幾則選改天＝她 3 天後再約，不打開自己選時間，HEROINE-ASKS-1028）*/
    body.querySelectorAll('[data-skip]').forEach(b=>b.onclick=async()=>{ closePhone(); await CLS.skipTo(GM,+b.dataset.skip); });
    body.querySelectorAll('[data-vac13]').forEach(b=>b.onclick=async()=>{ if(E.player.busy){ toast('現在不能排'); return; } closePhone(); sceneBegin(); try{ if(typeof VAC!=='undefined') await VAC.plan13(GM); } finally { sceneEnd(); } autosave(); openPhone('events'); });   /* 出國旅遊（C13，AA_244）*/
    body.querySelectorAll('[data-vac]').forEach(b=>b.onclick=()=>{ if(typeof VAC!=='undefined'&&VAC.signup(G,b.dataset.vac,'yes')){ toast('報名了：已經排進行事曆',2600); autosave(); } renderPhone(); });   /* 假期活動報名（AA_199 3-2）*/
    body.querySelectorAll('[data-ask]').forEach(b=>b.onclick=()=>{ const t=b.dataset.ask, i=t.lastIndexOf('|'); const r=typeof PHONE!=='undefined'?PHONE.answer(G,t.slice(0,i),+t.slice(i+1)):null; if(r&&!phoneThread) phoneThread=PHONE.th(r.m); renderPhone(); phoneBadge(); autosave(); });   /* 回覆（交接包 v1）：回了之後打開那一段對話，看得到對方的回覆 */
    body.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{ phoneThread=b.dataset.th; renderPhone(); phoneBadge(); const pb=$('phoneBody'); if(pb) pb.scrollTop=pb.scrollHeight; });
    body.querySelectorAll('[data-msgto]').forEach(b=>b.onclick=()=>{ phoneMsgPick=b.dataset.msgto; phoneMsgShare=false; renderPhone(); });   /* 傳訊息：先選話題（SYS-PHONE-CHAT）*/
    body.querySelectorAll('[data-msgt]').forEach(b=>b.onclick=()=>{ const [pid,tp,sub]=b.dataset.msgt.split('|'); if(tp==='cancel'){ phoneMsgPick=null; phoneMsgShare=false; renderPhone(); return; } if(tp==='share'&&!sub){ phoneMsgShare=true; renderPhone(); return; }
      const r=MSG.send(G,pid,tp,sub); phoneMsgPick=null; phoneMsgShare=false; if(!r.ok) toast(r.why||'現在不能傳'); renderPhone(); phoneBadge(); const pb=$('phoneBody'); if(pb) pb.scrollTop=pb.scrollHeight; });
    body.querySelectorAll('[data-thback]').forEach(b=>b.onclick=()=>{ phoneThread=null; phoneMsgPick=null; phoneMsgShare=false; renderPhone(); const pb=$('phoneBody'); if(pb) pb.scrollTop=0; });
    body.querySelectorAll('[data-invgo]').forEach(b=>b.onclick=async()=>{ const iv=(G.invites||[]).find(x=>String(x.id)===b.dataset.invgo); if(iv&&typeof INV!=='undefined'&&INV.goNow) await INV.goNow(GM,iv); });
    body.querySelectorAll('[data-place]').forEach(b=>b.onclick=async()=>{ const pl=PLACE_LIST().find(q=>q[0]+'|'+q[1]===b.dataset.place); if(pl) await quickGo(pl); });
    body.querySelectorAll('[data-pmapsvg]').forEach(sv=>sv.onclick=e=>{ if(typeof PLACEMAP==='undefined') return; const r=sv.getBoundingClientRect(), V=PLACEMAP.VB; if(!r.width) return; const id=PLACEMAP.pick(V[0]+(e.clientX-r.left)/r.width*V[2],V[1]+(e.clientY-r.top)/r.height*V[3],sv.dataset.pmapsvg.split(',')); if(!id) return; phonePin=phonePin===id?null:id; renderPhone(); });   /* 地點地圖（src/placemap3d.js）：整張圖都可以點，選最近的圖釘（BB-B 10-23：圖釘太小、相鄰的會點錯）*/
    body.querySelectorAll('[data-find]').forEach(b=>b.onclick=()=>{ if(findPerson(b.dataset.find)) closePhone(); });
    body.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{ phonePerson=b.dataset.person; renderPhone(); const pb=$('phoneBody'); if(pb) pb.scrollTop=0; });
    if(inTh&&phoneTab==='msg'&&phoneThread) body.scrollTop=atEnd?body.scrollHeight:st0;   /* 對話裡重畫（回覆、新訊息）：本來在最下面就留在最下面，往上看舊訊息就不動（PHONE-LINE-UI-1018）*/
    body.querySelectorAll('[data-personback]').forEach(b=>b.onclick=()=>{ phonePerson=null; renderPhone(); });
    body.querySelectorAll('[data-bigmap]').forEach(b=>b.onclick=()=>{ closePhone(); if(typeof GUIDE!=='undefined') GUIDE.openMap(); });
    body.querySelectorAll('[data-y5go]').forEach(b=>b.onclick=async()=>{ if(E.player.busy){ closePhone(); if(menuOpen) closeMenu(); toast('現在不能移動'); return; } closePhone(); if(menuOpen) closeMenu(); if(typeof Y5!=='undefined'&&Y5.goClass) await Y5.goClass(GM,b.dataset.y5go); });   /* 大五上（交換延畢）美國路線的補修：一鍵上課（AA_357 1-1，src/y5s1_3d.js）*/
    body.querySelectorAll('[data-gohome]').forEach(b=>b.onclick=async()=>{ if(E.player.busy||GM.titleIdle){ toast('現在不能移動'); return; } closePhone(); if(menuOpen) closeMenu(); await HOME.go(GM); });   /* 手機「地點」的「回臺北的家」（BB-C 10-18 DORM-AFTER-MOVEOUT：退宿以後人在外面，地點最上面要有回家）*/
    body.querySelectorAll('[data-msg]').forEach(b=>b.onclick=()=>{ phoneTab='msg'; phoneThread='p:'+b.dataset.msg; renderPhone(); phoneBadge(); const pb=$('phoneBody'); if(pb) pb.scrollTop=pb.scrollHeight; });
    document.querySelectorAll('#phoneTabs button').forEach(b=>b.classList.toggle('on',b.dataset.ptab===phoneTab));
    body.querySelectorAll('[data-fd]').forEach(b=>b.onclick=()=>{ const t=b.dataset.fd, i=t.lastIndexOf('|'); if(typeof FEED!=='undefined'&&FEED.respond(G,t.slice(0,i),t.slice(i+1))){ phoneBadge(); autosave(); } renderPhone(); });   /* 動態的回應：按愛心／留言／私訊問一句（src/feed3d.js，AA_503 第 1 節）*/
    { const fb=document.querySelector('#phoneTabs [data-ptab="feed"]'); if(fb) fb.classList.toggle('dot',typeof FEED!=='undefined'&&FEED.newCount(G)>0); }   /* 新的動態：只在「動態」頁籤亮一個小點（不跳通知、不算未讀）*/
    body.querySelectorAll('[data-go]').forEach(b=>b.onclick=async()=>{ const it=CLS.dayItems(G).find(q=>q.key===b.dataset.go); if(!it) return; if(E.player.busy){ closePhone(); if(menuOpen) closeMenu(); toast(document.getElementById('choices')&&!document.getElementById('choices').classList.contains('hide')?'先選完畫面上的選項':'現在不能移動'); return; } closePhone(); if(menuOpen) closeMenu(); await CLS.goClass(GM,it); });   /* 正在選選項（例：下課選單）時按「直接去上課」：收起手機，讓選項露出來（2026-10-17 瀏覽器實測：手機蓋住選項，看起來像卡住）*/ }   /* DL-01（AA_160 1-1）：「直接去上課」走 CLS.goClass（照路程、出門時間、選位子；2026-10-13 起建築裡的教室也可以）*/
  /* 快速前往（D54 ①）：主要地點從第一天就知道（第 1 天是開學第三週）；依距離花遊戲時間（CLS.travelMinutes）；關門的地方寫幾點開 */
  function PLACE_LIST(){ if(typeof EXCH!=='undefined'&&EXCH.inUS&&EXCH.inUS(G)) return EXCH.places(); if(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G)) return []; const moved=typeof HOME!=='undefined'&&HOME.baseMode&&HOME.baseMode(G), jpOut=(typeof JP!=='undefined'&&JP.movedOut&&JP.movedOut(G))||(typeof HOME!=='undefined'&&!!HOME.movedOut&&HOME.movedOut(G)); return PLACES.quickList().filter(p=>p&&Z3.ZONES[p[0]]&&!(moved&&NTU_ZONES.includes(p[0]))&&!(jpOut&&(p[0]==='dorm'||p[0]==='dorm_hall'))); }   /* HOME.movedOut：畢業後宿舍期滿退宿（AA_357 1-5）＝地點也沒有宿舍 */   /* 人在日本（src/jp3d.js，AA_341 J-S10）：臺灣的地點都不能快速前往；日本路線 2/20 退宿以後：宿舍不在清單上 */   /* 經濟系退宿以後（HOME.baseMode，休學在家到 8/29）：快速前往沒有宿舍、也沒有台大校園裡的地方（2026-10-18 使用者：「我都休學退宿了還是能去宿舍」「一個休學的人根本不會想再踏入台大」「重考中不要讓我去台大」「尤其可昕也休學，之後更不應該」）；公館、溫州街照舊；回家在清單最上面「回臺北的家」*/
  const NTU_ZONES=['campus','classroom','linze','wancai','library_hall','library','lawlib','soclib','boya','putong','gongtong','dorm','dorm_hall'];   /* 在美國：只有公寓、社區（src/exchange3d.js）*/   /* 清單在 src/data/places.js（tests/quick_travel_unit.js 逐一檢查落點站得住、走得出去）*/
  function placeState(pl){ const [z,,sp]=pl; const known=!!(PLACES.known0[z]||(G.visited&&G.visited[z])); const open=typeof PLACES==='undefined'||PLACES.isOpen(z,G.hour,G.day); const mins=typeof CLS!=='undefined'?CLS.travelMinutes(G,G.zone,z,E.player.obj.position,sp):15; const here=G.zone===z&&((z!=='campus'&&z!=='gongguan')||mins===0);   /* 校園、公館有好幾個落點：照距離，遠的那一個不算「你在這裡」*/
    const bike=!!E.player.riding, m=bike&&mins>0?Math.max(5,Math.round(mins/3.5/5)*5):mins;   /* 騎著腳踏車：大約是走路的 3.5 倍快（2026-10-15 調快；原本 2.5）（最少 5 分鐘）；進室內的地方車停在那棟的門外（bike3d.js）*/
    return {known,open,here,mins:m,bike}; }
  async function quickGo(pl,o){ const [z,label,sp]=pl; const st=placeState(pl); if(E.player.busy||GM.titleIdle){ toast('現在不能移動'); return; } if(!st.known&&!(o&&o.force)){   /* o.force：約好的地方（INV.goNow，UX-INV-GO-1023）沒去過也可以直接過去 */ toast('還沒去過'+label+'。自己走去一次之後，就可以直接前往。',4000); return; } if(!st.open){ toast(typeof PLACES!=='undefined'?PLACES.closedText(z,G.hour,G.day):'已閉館',4500); return; } if(st.here){ toast(z==='campus'?'你就在這附近':'你已經在'+label+'了'); return; }
    closePhone(); if(menuOpen) closeMenu(); if(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.leave) ACTIVITIES.leave(G);   /* 活動中快速前往＝中途離開（AA_110 5-2）*/
    advance(st.mins/60); await enter(z,sp||undefined); toast((st.bike?'騎了 ':'走了 ')+st.mins+' 分鐘到'+label,2600); }
  GM.quickGo=quickGo;
  /* 相簿（Life Album，AA_128 5-1；AA_185 2-5）：自由出行拍的照片（G.places.photos）、校外約會的拍照位置（G.album：底圖加她的人物圖層；合照要第 6 階或交往中）、解鎖的 CG（G.cg.unlocked）。照時間排，新的在前 */
  function albumHTML(){ const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]), BG=typeof OUT!=='undefined'&&OUT.BG?OUT.BG:{}, img=k=>(BG[k]||{}).image||'', items=[];
    const when=(d,h)=>{ if(typeof CALENDAR==='undefined') return ''; const x=CALENDAR.dateOf(d); return x.y+'/'+x.m+'/'+x.d; };
    const ft=typeof FREE_TRIPS!=='undefined'?FREE_TRIPS.spots||[]:[]; for(const ph of ((G.places||{}).photos||[])){ const sp=ft.find(s=>s.id===ph.spot)||{}; items.push({t:ph.day*24+(ph.h||0),bg:img(sp.bg),cap:(sp.name||ph.spot)+'・'+when(ph.day)}); }
    for(const a of (G.album||[])){ if(a.kind!=='date') continue; const L=typeof DATE!=='undefined'&&DATE.loc?DATE.loc(a.loc)||{}:{}, key=Object.keys(BG).find(k=>k.startsWith(String(a.loc||'').toLowerCase()+'_base')), pf=typeof PORTRAIT_FILES!=='undefined'&&PORTRAIT_FILES[a.who]&&PORTRAIT_FILES[a.who].campus?'assets/portraits/'+a.who+'/campus/neutral.webp':'';
      items.push({t:a.day*24+(a.h||0),bg:key?img(key):'',fg:pf,cap:(L.name||a.loc)+'・'+(typeof SOCIAL!=='undefined'?SOCIAL.displayName(a.who):a.who)+(a.both?'（合照）':'')+'・'+when(a.day)}); }
    for(const a of (G.album||[])){ if(a.kind!=='memory') continue; items.push({t:a.day*24+(a.h||0),bg:a.bg?'assets/bg/'+a.bg+'.webp':'',cap:(a.title||'')+'・'+when(a.day)}); }   /* 劇情收進相簿的一頁（STORY.albumMemory；例：學姊 A5-1 的「高二的校慶」「筆記本那一頁」）：bg 空白＝還沒有圖（筆記本的號碼不能看得清楚，先不放圖）*/
    const cg=typeof CG_REGISTRY!=='undefined'?(((G.cg||{}).unlocked)||[]).filter(id=>CG_REGISTRY[id]):[];
    if(!items.length&&!cg.length) return '<div class="item muted">還沒有照片。自由出行可以拍一張，和她出去的時候也可以在拍照的地方拍。</div>';
    items.sort((a,b)=>b.t-a.t); let h='';
    if(items.length) h+='<div class="item"><div class="albGrid">'+items.map(x=>'<div class="alb" style="background-image:url('+esc(x.bg)+')">'+(x.fg?'<img src="'+esc(x.fg)+'" alt="">':'')+'<div class="cap">'+esc(x.cap)+'</div></div>').join('')+'</div></div>';
    if(cg.length) h+='<div class="item"><div class="muted">CG</div><div class="albGrid">'+cg.map(id=>'<div class="alb" style="background-image:url('+esc(CG_REGISTRY[id].file)+')"><div class="cap">'+esc(CG_REGISTRY[id].title||'')+'</div></div>').join('')+'</div></div>';
    return h; }
  function placesHTML(){ const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]); let h='<div class="item"><button class="btn pri" data-bigmap="1">打開整張地圖（也可以點右上角的小地圖）</button></div><div class="item muted">知道的地方可以直接過去，依距離花時間；想看看路上的人和風景，也可以自己走。</div>';   /* 選單「地圖」併進來（2026-10-16）*/
    if(typeof HOME!=='undefined'&&HOME.canGo&&HOME.canGo(G)&&!(HOME.at&&HOME.at(G))) h+='<div class="item phrow"><div>回臺北的家<div class="muted">'+(HOME.baseMode&&HOME.baseMode(G)?'捷運＋公車 約 30 分鐘':'捷運＋公車 約 40 分鐘')+'</div></div><button class="btn pri" data-gohome="1">回家</button></div>';
    if(typeof PLACEMAP!=='undefined'){ const hrs=z=>typeof PLACES!=='undefined'&&PLACES.hours[z]?(PLACES.hours[z].rules?PLACES.todayText(z,G.day):(PLACES.hours[z].open!=null?PLACES.hours[z].text:'')):''; const p=E.player&&E.player.obj&&E.player.obj.position; const mh=PLACEMAP.html(PLACE_LIST(),placeState,phonePin,{zone:G.zone,x:p?p.x:null,z:p?p.z:null},hrs); if(mh) h+=mh+'<div class="item muted">全部地點</div>'; }   /* 地圖（UX-PHONE-MAP-1023，src/placemap3d.js）：點圖釘＝下面列出那裡的地點 */
    for(const pl of PLACE_LIST()){ const st=placeState(pl); const ht=typeof PLACES!=='undefined'&&PLACES.hours[pl[0]]?(PLACES.hours[pl[0]].rules?PLACES.todayText(pl[0],G.day):(PLACES.hours[pl[0]].open!=null?PLACES.hours[pl[0]].text:'')):'';
      h+='<div class="item phrow"><div>'+esc(pl[1])+'<div class="muted">'+(!st.known?'還沒去過':(st.here?'你在這裡':'約 '+st.mins+' 分鐘'+(st.bike?'（騎車）':'')))+(ht?'・'+esc(ht):'')+'</div></div>'+(st.here||!st.known?'':'<button class="btn'+(st.open?' pri':'')+'" data-place="'+esc(pl[0]+'|'+pl[1])+'">'+(st.open?'前往':'已閉館')+'</button>')+'</div>'; }   /* 已閉館的按鈕按了會說幾點開、可以改去哪裡 */
    return h; }
  /* 手機「活動」（D55，使用者 2026-10-13「手機查詢：朋友位置、課表、活動」）：這幾天的演講與活動（src/data/activities.js：活動已經排進去了，AA_355 第 3 節）。
     地點有快速前往的，旁邊有「前往」（照樣花時間、照開放時間） */
  function eventsHTML(){ const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]); const up=typeof ACTIVITIES!=='undefined'?ACTIVITIES.upcoming(G,7):[];
    const vac=typeof VAC!=='undefined'&&VAC.html?VAC.html(G):'';   /* 假期行事曆（AA_199 3-2）：報名了的、還可以報名的 */
    if(!up.length) return vac+'<div class="item muted">目前沒有公告的演講或活動。看到海報、公告欄的活動，會列在這裡。</div>';
    const W=['日','一','二','三','四','五','六'], PL=PLACE_LIST(); let h=vac;
    for(const {a,k} of up){ const d=CALENDAR.dateOf(G.day+k); const when=(k===0?'今天':k===1?'明天':d.m+'/'+d.d+'（'+W[d.wd%7]+'）')+' '+ACTIVITIES.hhmm(a.t0)+'–'+ACTIVITIES.hhmm(a.t1);
      const where=a.roomName||(PLACES.names&&PLACES.names[a.zone])||''; const pl=PL.find(q=>q[0]===a.zone)||PL.find(q=>q[0]==='campus'&&q[1]===(PLACES.names&&PLACES.names[a.zone]));
      h+='<div class="item phrow"><div>'+esc(a.title)+'<div class="muted">'+esc(when)+(where?'・'+esc(where):'')+'</div></div>'+(pl&&!(k===0&&G.hour%24>=a.t1)?'<button class="btn" data-place="'+esc(pl[0]+'|'+pl[1])+'">前往</button>':'')+'</div>'; }
    return h; }
  /* 校園裡的人：照作息的位置（linger 的 at、傅鐘的長椅）挑最近的校園快速地點；不知道確切位置就用第一個（霖澤館前），到了再用「帶我去」 */
  function campusPlaceFor(id,PL){ const C=PL.filter(q=>q[0]==='campus'); if(!C.length) return null; const ent=STORY.schedEnt?STORY.schedEnt(CHARACTERS[id],G):null; let xy=null;
    if(ent&&ent.at) xy=[ent.at[0],ent.at[1]]; else if(ent&&ent.seat==='bell') xy=[-30,20.94]; if(!xy) return C[0];
    let best=C[0], bd=1e9; for(const q of C){ const sp=q[2]; if(!sp) continue; const d=Math.hypot(sp.x-xy[0],sp.z-xy[1]); if(d<bd){ bd=d; best=q; } } return best; }
  /* 手機「朋友」裡點「資料」：原本選單「人物」頁的內容（科系年級、現在大概在哪、介紹、關係、最近的記憶）——2026-10-16 選單「人物」併進來 */
  let phonePerson=null, phonePin=null;   /* phonePin：手機「地點」地圖選中的圖釘（UX-PHONE-MAP-1023）*/
  /* 人物頁的進度條（D36；DATE.progress）：不顯示數字，條下面一句寫還差哪一種；交往中只寫「交往中」*/
  function progHTML(id){ if(typeof DATE==='undefined'||!DATE.progress) return ''; const p=DATE.progress(G,id); if(!p) return ''; if(p.dating) return '<div style="color:#ffd88a">交往中</div>';
    const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
    const row=(lab,b)=>b?'<div class="relbar" data-bar="'+lab+'" style="margin-top:6px"><span class="muted" style="font-size:12px">'+lab+'</span><div style="height:6px;background:rgba(255,255,255,.14);border-radius:3px;margin-top:2px"><div style="height:100%;width:'+Math.round(Math.max(0,Math.min(1,b.pct))*100)+'%;background:#e9b96a;border-radius:3px"></div></div>'+(b.hint?'<div class="muted" style="font-size:12px">'+esc(b.hint)+'</div>':'')+'</div>':'';
    return row('友情',p.fr)+row('戀愛',p.rom); }
  function personHTML(id){ const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]); const c=CHARACTERS[id]; if(!c) return ''; const name=SOCIAL.displayName(id);
    const tag=SOCIAL.yearTag(id); const rv=SOCIAL.reveal(id);
    const desc=(c.social_layer==='B'&&rv!=='FRIEND')?(rv==='ACQUAINTANCE'?(c.facts?c.facts[0]:''):''):(c.personality||''); const wt=whereText(id);
    const hist=typeof DATE!=='undefined'&&DATE.historyText?DATE.historyText(G,id):[];   /* 一起去過的地方（DATE-S1；date3d.js historyText：一次約會一行）*/
    const mems=SOCIAL.memories(id).slice(-5).map(m=>'<div class="muted">· '+(SOCIAL.dayLabel?SOCIAL.dayLabel(m.day):'第 '+m.day+' 天')+' '+esc(SOCIAL.MEMORY_LABEL[m.tag]||m.tag)+((SOCIAL.noteShown?SOCIAL.noteShown(id,m):m.note)?'（'+esc(SOCIAL.noteShown?SOCIAL.noteShown(id,m):m.note)+'）':'')+'</div>').join('');
    return '<div class="item phrow"><button class="btn" data-personback="1">‹ 朋友</button><b>'+esc(name)+'</b></div><div class="item"><span class="muted">'+esc(tag)+'</span>'+(wt?'<div style="color:#ffd88a">現在大概在：'+esc(wt)+'</div>':'')+'<div>'+esc(desc)+'</div><div>'+SOCIAL.describe(id)+'</div>'+progHTML(id)+(hist.length?'<div style="margin-top:4px"><span class="muted">一起去過的地方</span>'+hist.map(x=>'<div class="muted">· '+esc(x)+'</div>').join('')+'</div>':'')+(mems?'<div style="margin-top:4px">'+mems+'</div>':'')+'</div>'; }
  /* 手機「朋友」（D54 ④：手機資訊是協助找人，不是任務標記）：認識的人現在大概在哪（照作息，和大地圖的人物線索同一份）；在別的地方的，可以快速前往那個地方（照樣花時間）*/
  function friendsHTML(){ const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]); const ids=knownIds(); const PL=PLACE_LIST();
    if(!ids.length) return '<div class="item muted">還沒有認識的人。</div>'; if(phonePerson&&ids.includes(phonePerson)) return personHTML(phonePerson);
    let h='<div class="item muted">大家照自己的作息在校園裡生活；這裡寫的是「大概在哪」，去了不一定剛好遇到。</div>';
    for(const id of ids){ const w=STORY.whereIs&&STORY.whereIs(GM,id); const nm=(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(id):((CHARACTERS[id]||{}).name||id);
      const pl=w&&w.zone&&w.zone!==G.zone?(w.zone==='campus'?campusPlaceFor(id,PL):PL.find(q=>q[0]===w.zone)):null; const st=pl?placeState(pl):null;   /* 校園裡的人也可以「過去」：到離他最近的校園地點（使用者 2026-10-15：有的可以直接過去、有的只能導航）*/
      const msg=typeof INV!=='undefined'&&INV.hasContact(G,id)?'<button class="btn" data-msg="'+esc(id)+'">訊息</button>':'';   /* 有聯絡方式＝可以直接傳訊息（約人和訊息放在一起：使用者 2026-10-15）*/
      const why=typeof INV!=='undefined'&&INV.whyNot?INV.whyNot(G,id):'';   /* 約不了的原因（AA_125 第 1 節：只打過招呼、沒有聯絡方式、已經約好了、不在學校）*/
      const canInv=typeof INV!=='undefined'&&!why&&INV.hasContact(G,id)&&INV.canInvite(G,id);   /* 有聯絡方式的才能用手機約（使用者第 2 點：認識的朋友才有聯絡方式）*/
      h+='<div class="item phrow"><div>'+esc(nm)+'<div class="muted">'+(w?esc(whereText(id))+(w.zone===G.zone?'・就在這裡':''):'現在沒有固定的行程')+'</div></div><div class="row2" style="gap:6px">'+(pl&&st&&st.known?'<button class="btn" data-place="'+esc(pl[0]+'|'+pl[1])+'">過去（約 '+st.mins+' 分鐘）</button>':'')+(w&&w.zone&&!w.away?'<button class="btn" data-find="'+esc(id)+'">帶我去</button>':'')+'<button class="btn" data-person="'+esc(id)+'">資料</button>'+msg+(canInv?'<button class="btn pri" data-inv="'+esc(id)+'">約</button>':(why?'<span class="muted" style="font-size:12px;align-self:center">'+esc(why)+'</span>':''))+'</div></div>'; }
    return h; }
  /* 手機「訊息」（D54 ⑥）：約人、對方的回答、沒赴約……最新的在上面；對方約你、改約的有回覆的按鈕（src/invites3d.js）*/
  /* 手機「訊息」（交接包 v1：群組、置頂、可以回的訊息，src/phone3d.js）：最上面是「待回覆」（邀約、可以回的訊息）、對話串（點了看整段，群組的置頂在最上面），下面照舊是最近的訊息 */
  let phoneThread=null, phoneMsgPick=null, phoneMsgShare=false;
  const escH=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  const msgWhen=m=>(m.day===G.day?'今天':(m.day===G.day-1?'昨天':(CALENDAR.dateOf(m.day).m+'/'+CALENDAR.dateOf(m.day).d)))+' '+INV.hhmm(m.h);
  const askBtns=m=>'<div class="row2" style="gap:6px;margin-top:6px;flex-wrap:wrap">'+m.ask.opts.map((o,k)=>{ const blk=typeof PHONE!=='undefined'&&PHONE.optBlocked&&PHONE.optBlocked(G,o); return '<button class="btn'+(k===0&&!blk?' pri':'')+'"'+(blk?' disabled style="opacity:.5"':'')+' data-ask="'+escH(m.ask.id+'|'+k)+'">'+escH(o.t)+(blk&&o.need.why?'（'+escH(o.need.why)+'）':'')+(o.hint?'<div style="font-size:12px;opacity:.75;line-height:1.3;margin-top:2px">'+escH(o.hint)+'</div>':'')+'</button>'; }).join('')+'</div>';   /* o.hint：選項旁邊的小字（同對話選項的 hint；例：學姊第十二批撞期「那天晚上也是公法讀書會」，AA_490）；字色跟著按鈕（pri 是亮底深字）*/
  /* 訊息帶的照片是一張 CG（m.cg，phone3d.js；例：CG-2b Alison 在公法讀書會群組傳的白板，AA_343 E2）：在文字下面顯示，白邊像手機照片 */
  const msgPhoto=m=>m&&m.cg&&typeof CG_REGISTRY!=='undefined'&&CG_REGISTRY[m.cg]?'<div style="margin-top:6px"><img src="'+escH(CG_REGISTRY[m.cg].file)+'" alt="" style="display:block;width:100%;max-width:300px;border:4px solid #fff;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>':'';
  const sysT=m=>typeof PHONE!=='undefined'&&PHONE.th(m)==='sys'&&typeof SOCIAL!=='undefined'&&SOCIAL.shuyuT?SOCIAL.shuyuT(m.text):m.text;   /* 手機系統提醒：交往中學姊→書瑀（AA_411 第 2 節）*/
  const msgLine=m=>{ if(typeof PHONE==='undefined'||!m.th) return escH(sysT(m)); const g=m.th.startsWith('g:'), w=PHONE.who(m); return (g?'<span class="muted">【'+escH(PHONE.title(G,m.th))+'】</span>':'')+(w?'<b>'+escH(w)+'</b>：':'')+escH(sysT(m)); };
  function threadHTML(th){ PHONE.markSeen(G,th); const L=PHONE.thread(G,th), g=th.startsWith('g:')||th==='sys';   /* 通知（sys）也寫是誰傳的：新聞、張教授（信）（颱風假 T1b）；沒有寄件人的系統訊息照舊只有內容 */
    const pid=th.startsWith('p:')?th.slice(2):null, why=pid&&typeof INV!=='undefined'&&INV.whyNot?INV.whyNot(G,pid):'x', canInv=!!pid&&!why&&INV.hasContact(G,pid)&&INV.canInvite(G,pid);   /* 一對一的對話裡也可以約（約人和訊息放在一起：使用者 2026-10-15）*/
    const mo=pid&&typeof MSG!=='undefined'?MSG.open(G,pid):null, msgBtn=mo&&mo.ok?(MSG.sentToday(G,pid)?'<span class="muted" style="font-size:12px;align-self:center">今天傳過了</span>':'<button class="btn" data-msgto="'+escH(pid)+'">傳訊息</button>'):(mo&&mo.show&&mo.why?'<span class="muted" style="font-size:12px;align-self:center">'+escH(mo.why)+'</span>':'');   /* 經濟系重考期可昕住在家裡：「她就在家裡。直接去講。」（AA_301）*/   /* 玩家主動傳訊息（SYS-PHONE-CHAT，src/msg3d.js）*/
    const gAct=th.startsWith('g:')&&Array.isArray(PHONE.GROUP_ACTS)?PHONE.GROUP_ACTS.findIndex(a=>a.th===th&&a.show(G)):-1;   /* 群組裡的「約」（PHONE.GROUP_ACTS：{th, label, show(G), run(GM)}；麵店團的早午餐，src/wzlines3d.js）*/
    let h='<div class="item phrow thHead"><button class="btn" data-thback="1">‹ 訊息</button><b>'+escH(PHONE.title(G,th))+'</b>'+msgBtn+(canInv?'<button class="btn pri" data-inv="'+escH(pid)+'">約</button>':'')+(gAct>=0?'<button class="btn pri" data-gact="'+gAct+'">'+escH(PHONE.GROUP_ACTS[gAct].label)+'</button>':'')+'</div>';
    if(mo&&mo.ok&&phoneMsgPick===pid&&!MSG.sentToday(G,pid)){ const tp=MSG.topics(G,pid); h+='<div class="item"><div class="muted">傳什麼？</div><div class="row2" style="gap:6px;flex-wrap:wrap;margin-top:6px">'+(phoneMsgShare?MSG.PHOTOS.map(q=>'<button class="btn" data-msgt="'+escH(pid+'|share|'+q.k)+'">'+escH(q.t)+'</button>').join(''):tp.map(q=>'<button class="btn" data-msgt="'+escH(pid+'|'+q.k)+'">'+escH(q.t)+'</button>').join(''))+'<button class="btn" data-msgt="'+escH(pid+'|cancel')+'">取消</button></div></div>'; }
    for(const m of L.filter(q=>q.pin)) h+='<div class="item pin"><div class="muted">（置頂）'+msgWhen(m)+'</div>'+(PHONE.who(m)?'<b>'+escH(PHONE.who(m))+'</b>：':'')+escH(sysT(m))+'</div>';
    for(const m of L.filter(q=>!q.pin)) h+='<div class="item'+(m.from==='player'?' me':' them')+'"><div class="muted">'+msgWhen(m)+(m.fd&&typeof FEED!=='undefined'?FEED.refLabel(G,m):'')+'</div>'+(g&&m.from!=='player'&&PHONE.who(m)?'<b>'+escH(PHONE.who(m))+'</b>：':'')+(m.fold&&m.fold.length?'<details class="fold"><summary>'+escH(sysT(m))+(m.play?'（點開聽）':'……（點開看全文）')+'</summary>'+m.fold.map(escH).join('<br>')+'</details>':escH(sysT(m)))+msgPhoto(m)+((PHONE.askOpen?PHONE.askOpen(G,m):(m.ask&&m.ans==null))?(needHint(m)+askBtns(m)):'')+(m.iv?ivBtns(m):'')+'</div>';   /* fold：長的訊息折起來（W3b 學姊的長回覆）；ivBtns：別人約你、改約的按鈕（LINE 式列表以後也在這裡回）*/
    return h; }
  /* 別人約你、改約的回覆按鈕（D54 ⑥，src/invites3d.js）：只放在那一個邀約最新的那一則 */
  const ivLatest=m=>{ if(!m.iv) return false; for(let i=G.msgs.length-1;i>=0;i--) if(G.msgs[i].iv===m.iv) return G.msgs[i]===m; return false; };
  const ivBtns=m=>{ const iv=m.iv&&ivLatest(m)?INV.byId(G,m.iv):null; if(!iv) return ''; if(iv.state==='offered') return '<div class="row2" style="gap:6px;margin-top:6px"><button class="btn pri" data-ans="'+iv.id+'|yes">答應</button><button class="btn" data-ans="'+iv.id+'|later">改天</button><button class="btn" data-ans="'+iv.id+'|no">不了</button></div>'; if(iv.state==='changed') return '<div class="row2" style="gap:6px;margin-top:6px"><button class="btn pri" data-ans="'+iv.id+'|c:ok">'+(iv.to?'好':'好，下次')+'</button><button class="btn" data-ans="'+iv.id+'|c:next">那就下次</button><button class="btn" data-ans="'+iv.id+'|c:alone">沒關係，我自己去</button></div>'; return ''; };
  /* 手機「訊息」像 LINE（PHONE-LINE-UI-1018，使用者 2026-10-18 15:0x：「參考 line 每個人物的對話框點進去才看得到……最新的訊息在上面」）：
     一個人／一個群組／通知一列（頭像字、名字、那個人最新的一句、時間、未讀、待回覆），最新的對話在最上面；點進去從最新的一句開始（捲到最下面），往上拉才看到之前的；回覆、約你、改約都在那個人的對話裡回。
     使用者 22:4x 選 B：自動跳出來先停在這個列表。原本列表上面的「待回覆」區塊、下面混在一起的「最近的訊息」都拿掉 */
  const needHint=m=>{ const g=m.ask&&m.ask.grp; if(!g||!/^need_/.test(g)||typeof PHONE==='undefined') return ''; const left=2-PHONE.grpUsed(G,g); return '<div class="muted" style="margin-top:4px">這週的訊息。這週你回得了兩個人。'+(left<2?'（還可以回 '+left+' 個）':'')+'</div>'; };   /* 主線 4「這週的訊息」：四則裡回得了兩則（AA_179 第 1 節）*/
  /* 列表的頭像：一對一的對話用那個人的立繪（ADV.resolve 的第一張，裁上面的臉放進圓形）；沒有立繪的人、群組、通知照舊用字 */
  const chatPic=th=>{ if(!th||!th.startsWith('p:')||typeof ADV==='undefined'||!ADV.resolve) return null; try{ const r=ADV.resolve(th.slice(2),undefined,'neutral'); return r&&r.chain&&r.chain[0]||null; }catch(e){ return null; } };
  const chatHue=s=>{ let x=0; for(const c of s) x=(x*31+c.charCodeAt(0))>>>0; return x%360; };
  const chatWhen=m=>m.day===G.day?INV.hhmm(m.h):(m.day===G.day-1?'昨天':(CALENDAR.dateOf(m.day).m+'/'+CALENDAR.dateOf(m.day).d));
  const chatLast=t=>{ const m=t.last, w=m.from==='player'?'你':((t.th.startsWith('g:')||t.th==='sys')?PHONE.who(m):''); return (w?w+'：':'')+String(sysT(m)||''); };
  function msgHTML(){ if(typeof INV==='undefined') return ''; INV.rec(G); if(phoneThread&&typeof PHONE!=='undefined') return threadHTML(phoneThread);
    let h='';
    if(typeof PHONE!=='undefined'){ const ivTh=new Set(G.msgs.filter(m=>m.iv&&ivBtns(m)).map(m=>PHONE.th(m)));   /* 別人約你、改約還沒回：那一列也標「待回覆」*/
      const ths=PHONE.threads(G,{sys:true}); if(!ths.length) return h+'<div class="item muted">還沒有訊息。</div>';
      h+='<div class="chatList">'+ths.map(t=>{ const a=t.th==='sys'?'通':(t.th.startsWith('g:')?'群':String(t.title||'？').slice(0,1)), ask=t.pending||ivTh.has(t.th), pf=chatPic(t.th);
        return '<button class="chatRow" data-th="'+escH(t.th)+'">'+(pf?'<span class="chatAv pic" style="background-color:hsl('+chatHue(t.th)+',30%,34%);background-image:url(\''+escH(pf)+'\')"></span>':'<span class="chatAv" style="background:hsl('+chatHue(t.th)+',36%,40%)">'+escH(a)+'</span>')+'<span class="chatMid"><b>'+escH(t.title)+'</b><span class="chatLast">'+escH(chatLast(t))+'</span></span><span class="chatRt"><span class="muted">'+chatWhen(t.last)+'</span>'+(t.unread?'<span class="chatBadge">'+t.unread+'</span>':'')+(ask?'<span class="chatAsk">待回覆</span>':'')+'</span></button>'; }).join('')+'</div>'; }
    h+='<div class="item muted" style="margin-top:8px">有聯絡方式的朋友，在「朋友」按「約」就可以約；當面遇到也可以約。</div>';
    return h; }
  function todayActsHTML(){ const A=typeof PHONE!=='undefined'&&Array.isArray(PHONE.TODAY_ACTS)?PHONE.TODAY_ACTS:[]; const h=A.map((a,i)=>{ let ok=false; try{ ok=!!a&&(!a.show||a.show(G)); }catch(e){ ok=false; } return ok?'<button class="btn" data-tact="'+i+'">'+escH(a.label)+'</button>':''; }).join(''); return h?'<div class="item"><div class="row2" style="gap:6px;flex-wrap:wrap">'+h+'</div></div>':''; }
  function invTodayHTML(){ if(typeof INV==='undefined') return ''; const L=INV.todayLines(G); if(!L.length) return ''; const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
    const go=INV.canGo?(G.invites||[]).filter(iv=>(iv.state==='accepted'||iv.state==='going')&&iv.day===G.day).sort((a,b)=>a.h-b.h).map(iv=>INV.canGo(G,iv)?iv.id:null):[];   /* 和 todayLines 同一個順序；「前往」＝直接到約好的地方（UX-INV-GO-1023）*/
    return '<div class="item"><b>今天約好的</b>'+L.map((t,i)=>go[i]!=null?'<div class="phrow"><div>'+esc(t)+'</div><button class="btn pri" data-invgo="'+esc(go[i])+'">前往</button></div>':'<div>'+esc(t)+'</div>').join('')+'</div>'; }
  function openPhone(tab,th){ if(!G||GM.titleIdle) return; if(menuOpen) closeMenu(); phoneOpen=true; if(tab) phoneTab=tab; phoneThread=th||null; phonePerson=null; E.paused=true; $('phone').classList.remove('hide'); renderPhone(); phoneBadge(); { const pb=$('phoneBody'); if(pb) pb.scrollTop=th?pb.scrollHeight:0; } }   /* 直接打開某一段對話（自動跳出來的訊息）：捲到最新那一則（使用者 10-18：「還要往下滑，新的在最下面」）；打開列表：回到最上面（待回覆、最新的在最上面——BB 10-22 13:4x：列表留著上一次看對話捲到最下面的位置，大三暑假、大四寒假自動打開時看不到最上面那則待回覆）*/
  let phoneWaiters=[];
  /* 對話、選項出來的時候，手機、筆記本開著就先收起來（BB-C BB_218：起床約 4 秒後才出「早安。今天的課：」，玩家先打開手機，對話就壓在手機下面；
     2026-10-17 經濟系 9/11 下課選單同樣被手機蓋住）。一定要回的訊息（ask.must）還沒回時不收。不跑 afterPhoneClose（那是玩家自己看完手機的旁白）*/
  function uncover(){ if(menuOpen) closeMenu(); if(phoneOpen&&!(G&&typeof PHONE!=='undefined'&&PHONE.mustOpen&&PHONE.mustOpen(G,phoneThread||undefined))){ phoneOpen=false; phoneThread=null; $('phone').classList.add('hide'); E.paused=false; phoneBadge(); const w=phoneWaiters; phoneWaiters=[]; for(const f of w) f(); } }
  function closePhone(){ if($('btnPhoneClose')) $('btnPhoneClose').textContent='收起來'; phoneOpen=false; phoneThread=null; $('phone').classList.add('hide'); E.paused=false; phoneBadge(); const w=phoneWaiters; phoneWaiters=[]; for(const f of w) f(); if(typeof STORY!=='undefined'&&STORY.afterPhoneClose&&!D.active) STORY.afterPhoneClose(GM).catch(e=>console.warn('afterPhoneClose',e)); }   /* 看完手機以後的旁白（學姊 A5-1 B：按讚、加好友）*/
  GM.openPhone=openPhone; GM.closePhone=closePhone;
  /* 劇情打開手機的某一段對話（第一天可昕的訊息）：玩家關掉手機才繼續 */
  GM.phoneThread=(th,o)=>new Promise(res=>{ phoneWaiters.push(res); openPhone('msg',o&&o.skip?null:th);   /* o.skip（事件接事件跳的途中）：先停在對話列表、最新的在最上面（使用者 22:4x 選 B）*/ if(o&&o.skip&&$('btnPhoneClose')) $('btnPhoneClose').textContent='跳過'; });   /* o.skip：事件接事件跳的途中打開的，「收起來」寫「跳過」（AA_300 第 6 節）*/
  /* 手機按鈕上的未讀數字（別人傳來、還沒打開那一段對話看過的）*/
  function phoneBadge(){ const el=$('phoneBadge'); if(!el||typeof PHONE==='undefined'||!G) return; const n=PHONE.unread(G); el.textContent=n>9?'9+':String(n); el.classList.toggle('hide',!n); }
  GM.phoneBadge=phoneBadge;
  GM.phoneIsOpen=()=>!!phoneOpen;
  /* 快速存檔、匯出（使用者 2026-10-27「可以有快速存檔按鍵嗎」「快速匯出」，QUICK-SAVE-EXPORT-1027）：右上 💾 一按打開兩個按鈕。
     存檔＝自動存檔那一格（讀取選單的「自動存檔」）；劇情進行中不存——存在劇情中途，讀回來會從中途重演（AN-MEAL-STUCK-1027 就是這樣），請玩家按匯出。
     匯出＝和「選單 → 存檔 → 匯出 → 下載」同一個檔（含 _stuck、_busy），任何時候都能按：卡住時回報用。 */
  function quickSave(){ if(!G||!E.player||GM.titleIdle) return false;
    if(D.busyDepth>0){ toast('劇情進行中，結束後再存。卡住的話按「匯出存檔檔案」傳給開發。',3800); return false; }
    autosave(); const dd=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day):null, h=((G.hour%24)+24)%24, p2=n=>String(n).padStart(2,'0');
    toast('已存檔'+(dd?'：'+dd.m+'/'+dd.d+' '+p2(Math.floor(h))+':'+p2(Math.floor((h%1)*60)):''),2400); return true; }
  GM.quickSave=quickSave;
  function bindUI(){ $('btnMenu').onclick=()=>{ if(menuOpen) closeMenu(); else openMenu('notes'); }; $('btnClose').onclick=closeMenu; document.querySelectorAll('#menu .tabs button').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
    const userClosePhone=()=>{ if(G&&PHONE.mustOpen&&PHONE.mustOpen(G,phoneThread||undefined)){ toast('先回覆。'); return; } closePhone(); };   /* 一定要回的訊息（ask.must）沒回之前，玩家按關閉不會關 */
    if($('btnPhone')){ $('btnPhone').onclick=()=>{ if(phoneOpen) userClosePhone(); else openPhone(); }; $('btnPhoneClose').onclick=userClosePhone; document.querySelectorAll('#phoneTabs button').forEach(b=>b.onclick=()=>{ if(b.disabled) return; phoneTab=b.dataset.ptab; phoneThread=null; phonePerson=null; renderPhone(); const pb=$('phoneBody'); if(pb) pb.scrollTop=0; }); if($('nextClass')) $('nextClass').onclick=()=>openPhone('today'); } $('interact').onclick=()=>doInteract(); $('btnRun').onclick=()=>{ E.player.runHold=!E.player.runHold; E.input.runToggle=E.player.runHold; $('btnRun').classList.toggle('on',E.player.runHold); }; $('btnCenter').onclick=()=>E.recenter(); if(typeof BIKE!=='undefined') BIKE.bindUI(GM);
    $('dlg').addEventListener('pointerup',e=>{ e.stopPropagation(); dlgAdvance(); }); addEventListener('keydown',e=>{ if(e.key===' '||e.key==='Enter'){ if(dlgAdvance()) e.preventDefault(); else if(nearIt&&!menuOpen) doInteract(); } if(e.key==='Escape'){ if(menuOpen) closeMenu(); else if(!D.active) openMenu('notes'); } });
    E.onTap=(tp)=>{ if(D.active){ dlgAdvance(); return true; } return false; }; E.tapRedirect=tapToSeat;
    E.rideMode=n=>typeof STORY!=='undefined'&&STORY.rideMode?STORY.rideMode(n):'ride'; E.onRide=(n,on)=>{ if(typeof STORY!=='undefined'&&STORY.onRide) STORY.onRide(GM,n,on); };   /* 載妹墊（AA_137 第 5 節）*/
    E.onGreet=(n)=>{ if(!D.active&&!E.player.busy) caption('',n.name+'朝你揮了揮手。',1800); };
    $('setQuality').onchange=e=>{ S.quality=e.target.value; saveSettings(); applySettings(); }; $('setJoy').onchange=e=>{ S.joystick=e.target.checked; saveSettings(); applySettings(); }; if($('setWakeMenu')) $('setWakeMenu').onchange=e=>{ S.wakeMenu=e.target.checked; saveSettings(); }; if($('setClassRemind')) $('setClassRemind').onchange=e=>{ S.classRemind=e.target.checked; saveSettings(); }; if($('setGuide')) $('setGuide').onchange=e=>{ S.guide=e.target.checked; saveSettings(); if(typeof GUIDE!=='undefined') GUIDE.zoneChanged(); }; if($('btnBigMap')) $('btnBigMap').onclick=()=>{ closeMenu(); if(typeof GUIDE!=='undefined') GUIDE.openMap(); }; $('setVol').oninput=e=>{ S.volume=parseFloat(e.target.value); saveSettings(); A3.setVolume(S.volume); }; $('setSpeed').onchange=e=>{ S.textSpeed=parseInt(e.target.value); saveSettings(); }; $('setFps').onchange=e=>{ S.fps=e.target.checked; saveSettings(); applySettings(); }; $('setMdbg').onchange=e=>{ S.mdbg=e.target.checked; saveSettings(); applySettings(); }; $('setGlb').onchange=e=>{ S.glbChar=e.target.checked; CHAR.useModels=S.glbChar; saveSettings(); toast('下次載入時生效'); };
    $('btnTitle').onclick=()=>{ if(D.busyDepth>0&&!D.stale){ toast('劇情還在進行，結束後再回標題',3200); return; }   /* 和 loadFrom 一樣：劇情演到一半回標題再讀檔，舊的劇情流程會接著演到新存檔 */ autosave(); closeMenu(); if(GM.liveMark) GM.liveMark(false); $('titleScreen').classList.remove('hide'); GM.running=false; };
    $('btnExport').onclick=()=>{ $('importBox').classList.add('hide'); $('exportBox').classList.remove('hide'); $('exportText').value=exportText(); };
    $('btnCopy').onclick=async()=>{ const t=$('exportText'); try{ await navigator.clipboard.writeText(t.value); toast('已複製到剪貼簿'); }catch(e){ t.focus(); t.select(); toast('請手動長按複製'); } };
    const downloadSave=async()=>{ const sl=stuckLog(), snap=snapshot(); if(D.busyDepth>0) snap._busy={depth:D.busyDepth,by:D.busyWho.slice(),dlg:!!D.active,stale:!!D.stale};   /* _busy：匯出那一刻還在跑的劇情（卡住時按匯出＝看得到是哪一段，QUICK-SAVE-EXPORT-1027；讀檔時拿掉）*/ const text=JSON.stringify(sl.length?Object.assign(snap,{_stuck:sl}):snap,null,1);   /* _stuck：卡住的紀錄（stuckLog），給開發看；讀檔時拿掉 */ const fname='fatiao3d_save_day'+G.day+'.json'; // claude.ai artifact 環境：透過 downloads 能力存檔
      try{ if(window.claude&&typeof window.claude.use==='function'){ const dl=await window.claude.use('downloads'); if(dl){ try{ const r=await dl.save({filename:fname,data:text}); toast(r&&r.status==='saved'?'已儲存檔案':'已送出'); }catch(err){ if(err&&err.code==='declined') toast('已取消下載'); else toast('無法下載（'+((err&&err.code)||'unavailable')+'），請改用複製文字',3500); } return; } } }catch(e){}
      try{ const blob=new Blob([text],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1000); toast('若沒有下載，請改用複製文字'); }catch(e){ toast('此環境無法下載，請複製文字'); } };
    $('btnDownload').onclick=downloadSave; GM.quickExport=downloadSave;
    $('btnQuick').onclick=ev=>{ ev.stopPropagation(); $('quickPop').classList.toggle('hide'); };
    $('btnQuickSave').onclick=ev=>{ ev.stopPropagation(); $('quickPop').classList.add('hide'); quickSave(); };
    $('btnQuickExport').onclick=ev=>{ ev.stopPropagation(); $('quickPop').classList.add('hide'); downloadSave(); };
    for(const id of ['btnQuick','quickPop']) $(id).addEventListener('pointerup',ev=>ev.stopPropagation());   /* 劇情對話中按 💾 不要順便翻下一句 */
    $('btnImport').onclick=()=>{ $('exportBox').classList.add('hide'); $('importBox').classList.remove('hide'); $('importMsg').textContent=''; };
    $('importFile').onchange=e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ $('importText').value=r.result; }; r.readAsText(f); };
    $('btnImportGo').onclick=async()=>{ try{ const obj=parseImport($('importText').value); const cur=read(KEY_AUTO); if(cur) write(KEY_BACKUP,cur); write(KEY_AUTO,obj); $('importMsg').textContent='匯入成功，已備份原本進度。'; await loadFrom(obj); }catch(err){ $('importMsg').textContent='匯入失敗：'+err.message; } };
    $('btnNew').onclick=async()=>{ A3.start(); await waitChars(); const name=($('nameInput').value||'祐廷').trim().slice(0,6); G=defaults(name); GM.G=G; bindSystems(); $('titleScreen').classList.add('hide'); GM.running=true; await STORY.newGame(GM); };
    /* 開局二選一（2026-10-18 使用者：「下一個版本開始就可以選擇要不要玩經濟系前傳，也可以選直接玩法律系」）：btnNew＝經濟系前傳（原本的預設）、btnNewLaw＝直接法律系大一（回顧 → 8/22 宿營 → 搬宿舍）*/
    if($('btnNewLaw')) $('btnNewLaw').onclick=async()=>{ A3.start(); await waitChars(); const name=($('nameInput').value||'祐廷').trim().slice(0,6); G=defaults(name); GM.G=G; bindSystems(); $('titleScreen').classList.add('hide'); GM.running=true; await STORY.newGame(GM,{law:true}); };
    if($('btnNewEcon')){ if(/[?&]y0\b/.test(location.search)) $('btnNewEcon').classList.remove('hide');   /* 經濟系開局（交接包 v0）：v0 做完以前只在網址 ?y0 出現（D81：開局照舊）*/
      $('btnNewEcon').onclick=async()=>{ A3.start(); await waitChars(); const name=($('nameInput').value||'祐廷').trim().slice(0,6); G=defaults(name); GM.G=G; bindSystems(); $('titleScreen').classList.add('hide'); GM.running=true; await STORY.newGameEcon(GM); }; }
    $('btnContinue').onclick=async()=>{ A3.start(); const s=read(KEY_AUTO); if(!s){ toast('沒有自動存檔'); return; } await waitChars(); GM.running=true; await loadFrom(s); };
    $('btnLoadMenu').onclick=()=>{ A3.start(); if(!G){ G=defaults(); GM.G=G; } openMenu('save'); };
    $('rotate').onclick=()=>$('rotate').classList.remove('want');
    document.addEventListener('visibilitychange',()=>{ if(document.hidden){ autosave(); if(A3.ctx) A3.ctx.suspend(); last=0; } else { if(A3.ctx&&A3.started) A3.ctx.resume(); last=performance.now(); } });
    addEventListener('pointerdown',()=>{ if(!A3.started) A3.start(); },{once:false}); }
  // ?dev／?debug：正式人物模型載入失敗、或 NPC 退回程序化 placeholder 時，畫面上列出來（玩家版不顯示）
  function devAssetReport(){ if(!/[?&](dev|debug|mdbg)\b/.test(location.search)) return; let d=document.getElementById('devErr'); const errs=[].concat(ASSETS.errors||[],(ASSETS.timedOut||[]).map(k=>k+': preload timeout'),CHAR.failures||[]); const ph=E&&E.npcs?E.npcs.filter(n=>n.obj.userData.driver==='proc').length+((E.player&&E.player.obj.userData.driver==='proc')?1:0):0; let ex=[]; try{ if(/[?&]dev\b/.test(location.search)&&typeof CLS!=='undefined'&&CLS.examShort&&GM.G&&GM.G.flags) ex=CLS.examShort(GM.G); }catch(e){ ex=[]; if(!GM._exShortWarn){ GM._exShortWarn=1; console.warn('dev exam list',e); } } if(!errs.length&&!ph&&!ex.length){ if(d) d.remove(); return; } if(!d){ d=document.createElement('div'); d.id='devErr'; d.style.cssText='position:fixed;left:8px;bottom:160px;z-index:30;max-width:70vw;font:11px/1.35 monospace;color:#ffd0c8;background:rgba(80,0,0,.72);padding:6px 8px;border-radius:8px;white-space:pre-wrap;pointer-events:none'; document.body.appendChild(d); } d.textContent=(errs.length||ph?'MODEL LOAD ERRORS（dev）\n'+[...new Set(errs)].slice(0,8).join('\n')+(ph?'\nplaceholder（程序化）人物：'+ph:''):'')+(ex.length?((errs.length||ph)?'\n':'')+'EXAM_BANK_INSUFFICIENT（dev，這學期不開考）\n'+ex.map(e=>e.name+' '+e.n+'／5').join('、'):''); }
  GM.devAssetReport=devAssetReport;
  /* 遊戲中被重新載入（使用者 2026-10-14 iPhone 試玩 v9.6：「有時候換地點或按到什麼，會跳出跑到進入遊戲的畫面，顯示請把手機轉為橫向，還好可以按讀取存檔繼續玩，但有點煩」
     ＝手機記憶體不夠時系統把分頁重新整理）：玩的時候在 sessionStorage 記一個標記（同一個分頁重新整理還在，關掉分頁就沒有），回標題時拿掉。
     開機時有標記＋有自動存檔＝剛剛在玩的時候被重新載入：不蓋「請把手機轉成橫向」、標題寫明「按『繼續』從自動存檔接著玩」；不自動跳進遊戲（測試和玩家都可能是自己重新整理）*/
  const LIVE='fatiao3d_live', ss=()=>{ try{ return window.sessionStorage||null; }catch(e){ return null; } };
  GM.liveMark=function(on){ const S=ss(); if(!S) return; try{ if(on) S.setItem(LIVE,'1'); else S.removeItem(LIVE); }catch(e){} };
  GM.reloadedMidGame=function(get){ try{ return (get||(k=>{ const S=ss(); return S?S.getItem(k):null; }))(LIVE)==='1'; }catch(e){ return false; } };
  GM.boot=async function(){ try{ const bar=$('bar').firstElementChild; const msg=$('loadMsg'); msg.textContent='初始化 3D…'; bar.style.width='15%'; await sleep(30); E=E3.init($('c'),{quality:'medium'}); GM.E=E; E.renderSkip=()=>typeof ADV!=='undefined'&&ADV.active&&!!ADV.root&&/\b(dark|image|cg)\b/.test(ADV.root.className);   /* 全畫面 2D 蓋住 3D 時不畫 3D（出遊、CG）*/ if(/lowres/.test(location.search)) E.q.forcePR=0.4; GM.turbo=/turbo/.test(location.search); loadSettings(); bar.style.width='40%'; msg.textContent='建立人物…'; await sleep(30); msg.textContent='載入資產…'; /* 人物模型（約 35 MB）分三批、依序下載，主要人物到齊才進標題畫面（2026-10-10：原本全部同時下載、各等 30 秒，手機網速慢時主角與 NPC 全部變成程序化備用人物）：①動畫＋主角 ②主要角色（五位女主角、阿哲）③路人底模；每批最多等 3 分鐘，還沒到的之後到了會原地換上（upgradeModels）。其他環境資產照舊 */ { const M=ASSETS.manifest, keys=Object.keys(M).filter(k=>!M[k].lazy), isChar=k=>M[k].type==='vrm'||k==='char.mixamo_clips'; const g1=['char.mixamo_clips','char.yuting'].filter(k=>keys.includes(k)), g2=keys.filter(k=>isChar(k)&&!M[k].ambient&&!g1.includes(k)), g3=keys.filter(k=>isChar(k)&&M[k].ambient), env=keys.filter(k=>!isChar(k)); const mb=()=>(ASSETS.bytes.done/1048576).toFixed(1)+' MB'; let stage=''; const tick=setInterval(()=>{ msg.textContent=stage+'（已下載 '+mb()+'）'; },500); /* 不准退化成醜模型（使用者 2026-10-17）：主角、動作、環境小物用 ASSETS.ensure 一定載到（沒有時間上限、失敗自動重試；網路不穩時文字會說在重試），不再「逾時就先用備用人物」 */
        let envErr=null; const envP=ASSETS.ensure(env,(d,t,err)=>{ envErr=err; if(stage.startsWith('載入場景小物')) stage='載入場景小物'+(err?'：網路不穩，重新下載中':''); });   /* 場景小物（街道道具、樹）重抓時也寫出來（QA-HANDOFF-B1：原本只有人物會寫）*/ const run=async(g,label,lo,hi)=>{ stage=label; await ASSETS.ensure(g,(d,t,err)=>{ bar.style.width=(lo+(t?d/t:1)*(hi-lo))+'%'; stage=label+(err?'：網路不穩，重新下載中':''); }); }; await run(g1,'載入主角與動作',40,66); stage='載入場景小物'+(envErr?'：網路不穩，重新下載中':''); await envP; clearInterval(tick); msg.textContent='載入完成（'+mb()+'）';
        /* 開遊戲加速（使用者 2026-10-16：「光打開遊戲超過 20 秒」）：主要角色（約 31 MB）、路人（約 11 MB）改在背景下載——主角＋動作（約 4 MB）、環境小物到了就出標題畫面；
           按「開始」「繼續」「讀取」時主要角色還沒到才等（waitChars，同一個載入畫面）；路人不等（晚到的照舊原地換上，upgradeModels）。順序照舊：主要角色先、路人後 */
        GM.mainChars=g2; GM.allChars=g2.concat(g3); GM.charsMain=!g2.length; GM.charsAll=false; GM.charsMainP=ASSETS.ensure(g2).then(()=>{ GM.charsMain=true; }); GM.charsAllP=GM.charsMainP.then(()=>ASSETS.ensure(g3)).then(()=>{ GM.charsAll=true; }); } if(ASSETS.errors.length) console.error('assets failed:',ASSETS.errors); devAssetReport(); setInterval(devAssetReport,4000);
      CHAR.useModels=(S.glbChar!==false); const heroSpec=Object.assign({},P3.CAST.hero_m,{model:S.glbChar!==false?'char.yuting':null,height:1.75}); /* 主角祐廷：VRoid CC0 改作（char.yuting）；載入失敗時退回程序化 placeholder，並在 ?dev 顯示錯誤 */ const hero=CHAR.build(heroSpec); E.setPlayer(hero); E.player.pocketsIdle=true; GM.heroDriver=hero.userData.driver; bar.style.width='72%'; msg.textContent='準備世界…'; await sleep(30); bindUI(); setupJoystick(); applySettings(); if(typeof GUIDE!=='undefined') GUIDE.init(GM); G=defaults(); GM.G=G; bindSystems(); G.hour=17.55; E.hour=17.55; G.weekday=4; E.loadZone(Z3.ZONES.campus,{x:-40,z:-5,yaw:-Math.PI/2}); if(STORY.populate) STORY.populate('campus',GM); // 標題畫面背景：黃昏的椰林大道
      bar.style.width='100%'; await sleep(200); $('loading').classList.add('hide'); $('rotate').classList.add('want');   /* 直向的「請把手機轉成橫向」載入完才出：原本一開始就蓋在載入畫面上，進度條幾乎看不見、像當機（使用者 2026-10-16 iPhone 直向截圖）*/ const hasAuto=!!read(KEY_AUTO); $('btnContinue').style.display=hasAuto?'block':'none'; if(hasAuto&&GM.reloadedMidGame()){ $('rotate').classList.remove('want'); const n=$('resumeNote'); if(n){ n.textContent='剛剛遊戲重新載入了（手機記憶體不夠時，系統會重新整理頁面）。按「繼續」從自動存檔接著玩。'; n.classList.remove('hide'); } $('btnContinue').classList.add('pri'); GM.liveMark(false); } GM.running=true; hideHUD(true); requestAnimationFrame(t=>{ last=t; frame(t); }); // 標題畫面用電影鏡頭
      E.player.busy=true; cine('sky',E.player.obj,null,{snap:true}); GM.titleIdle=true; }catch(e){ $('loadMsg').textContent='載入失敗：'+e.message; $('btnRetry').classList.remove('hide'); $('btnRetry').onclick=()=>location.reload(); console.error(e); } };
  return GM;
})();
