/* ===== 法律系同學二十位（pool）：共同做法＋第一批五位（AA_498，企劃線 33189103b；任務 NPC-STORY-1028、USER_WANTS X119）=====
   使用者 10-28 對 LAWWW-C：「全部留著，每個都補故事」「他們可以不能攻略 但有支線任務阿 例如請我幫忙什麼 邀請我去社團」；
   對 AA-C：「不要讓所有角色突然頻繁傳訊息」「不要強迫每個人都成為主角的好朋友」。資料（地點表、台詞）在 src/data/pool_story.js。
   第 2 節共同做法：
   2-1 每人固定一個樣子、固定在一個地方：CHARACTERS[pool_*].char3d.spec＝固定的路人底模（LAWWW2 的 char.npc_nf*／nm*，二十位不重複）＋現成的道具；
       spec.id 是人物 id（不是 'x'＋數字）＝不進「每換一次區域就輪換」的無名路人池（character3d.js C.anonPool）。底模還沒下載完：人先藏起來、按鈕也先拿掉（n.hidden），到了換上。
       無名路人分底模時跳過這一區有作息的同學的底模（anonPool.choose 包一層），已經分到的換掉（S.dedupe），旁邊不會有一模一樣的人。
       地點：每人照第 3 節的表（作息 daily_schedule＋必修課 poolClass），取代 story3d.js 原本「五組、每組取前幾位」（i%5 的 pick）。
   2-2 認識之前「和〈外觀描述〉說話」：SOCIAL.displayName 問 S.descNow（這個人現在這一筆作息的 desc）；認識以後「和〈名字〉說話」。
       人物頁：S.pageDesc（人物頁一句話；升到朋友＝personality）＋做過的事一行一行（S.deedsHTML）。「看過三次就進朋友頁」拿掉（game3d.js knownIds：說過話的才算）。
   2-3 第一次說話＝認識的那一場（第一批五位：S.meet；story3d.js talkCharacter 的 first）。第二～四批十五位（AA_499～501）也是 S.meet（版本 S.MEETV，src/pool_more3d.js）；
       沒有載入第二批以後的資料時照舊的自我介紹（拿掉沒有選項的「……你呢？」）。
   2-4 閒聊：每人 8～10 句照學期、熟悉度、做過的事解鎖，每句一次、一天一句；說完以後三句「之後的招呼」輪流（開學、期中、期末的短招呼照舊穿插：STORY.greetB）。
       記號和舊的三句同一個（G.social.small[id].once＝句子本身）：舊存檔說過的舊三句照算說過（2-10）。
   2-5 秘密（SHARED_SECRET）加三個選項，選了什麼記在各人的旗標（ZJW_HELP、YT_*、YS_*…），改他之後的一句話或一場戲。
   2-6 順手的事：照 sideq3d.js 的系統（SIDEQ.Q 登記；手機「今天」那一格；同時最多兩則 SIDEQ.MAX，和店員的一起算；婉拒、過期不扣數值）。
   2-7 聯絡方式只在各人節裡寫的那一場交換（多半是順手的事）；沒交換的人手機不送。頻率上限（劇情以外的私訊）：二十位加起來一週一則、同一個人一個月一則、考試週不送閒聊型的；
       劇情那幾則（各人的表）不算：S.chatOK／S.chat（閒聊型）、S.story（劇情）。第一批五位的訊息都是劇情的。
   2-8 關係：順手的事做完 熟悉＋6、信任＋6；他那條線的每一段（認識、秘密、線上的每一列）熟悉＋3、信任＋3；閒聊照舊 +2（SOCIAL.activity）。可以到「朋友」；不會有戀愛（npcRom 不加）。
   2-9 ev_pool_greet：「你確定在教室看過」只給在教室出現的人，其他人「在〈他的地點〉看過」（S.greetPlace）；pool_greeted 用完就清掉（events.js）。
   2-10 舊存檔：讀檔換名（S.migrate；game3d.js migrate 叫）；說過秘密的不重問、記成「沒選」；過去的場景不補（各訊息只在那一天前後一天內排）。
   第 9 節第 4 點的互動點：男一舍門廳「領包裹」、交誼廳的冰箱與桌上的紙條、霖澤館一樓「補給的桌子」、霖澤館穿堂的展覽（只有旁白）——都只有互動點，實體物件列給 LAWWW2。
   第二～四批（AA_499～501，十五位）：台詞在 src/data/pool_story_b2.js、b3.js、b4.js，各人的流程在 src/pool_more3d.js；用 POOL.extend 接進來（認識的那一場 MEETV、流程 FLOW、
   之後自己的手機、互動點、自動的場景、房間物品都從這裡的共用做法走）。這一份只補共用的掛勾（OWN＝有自己那一套的同學；extend、MEETV、AFTER_MEET、TALK_OTHER、AUTO、POP、ACTS、ANSWER）。
   測試：node tests/aa498_pool_unit.js、node tests/aa499_501_pool_unit.js */
'use strict';
const POOL=(function(){
  const S={};
  const D=typeof POOL_STORY!=='undefined'?POOL_STORY:{PEOPLE:{},LINES:{},RENAME:{},BATCH1:[]};
  const L=Object.assign({},D.LINES), Z='pool_7', Y='pool_4', C='pool_1', YS='pool_6', Q='pool_3';   /* 各批的台詞（第二批以後由 S.extend 加進來）*/
  const IDS=Object.keys(D.PEOPLE), B1=new Set(D.BATCH1||[]);
  const OWN=new Set(B1);   /* 有自己那一套（認識的那一場、流程、閒聊表）的同學：第一批＋S.extend 加進來的 */
  const PERS={};   /* personality 補表（AA_501 第 5 節第 5 點：第 3 節表上「之後的批次寫」的十五位）*/
  const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.IDS=IDS; S.BATCH1=D.BATCH1||[]; S.LINES=L; S.WHERE_MORE={};
  let GMr=null;
  S.bind=gm=>{ if(gm) GMr=gm; return GMr; };
  const curG=()=>(GMr&&GMr.G)||(typeof GAME!=='undefined'&&GAME&&GAME.G)||null;

  /* ---------- 小工具 ---------- */
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const dateOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d):{y:2026,m:1,d:1,wd:1,key:''};
  const md=d=>{ if(d==null) return ''; const q=dateOf(d); return q.m+'/'+q.d; };
  const wdTxt=d=>'日一二三四五六日'[dateOf(d).wd%7];
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const T_=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  const termDay=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(t,w,wd):null;
  /* 現在在第幾學期（寒暑假＝前一個學期之後，同 SIDEQ.termPos）*/
  S.termPos=function(G){ if(typeof CALENDAR==='undefined'||!CALENDAR.termDays) return {i:-1,brk:true,id:null};
    for(let i=TERMS.length-1;i>=0;i--){ const r=CALENDAR.termDays(TERMS[i]); if(r&&G.day>=r.from) return {i,brk:G.day>r.to,id:TERMS[i]}; } return {i:-1,brk:true,id:null}; };
  const ti=G=>S.termPos(G).i, tid=G=>S.termPos(G).id;
  const inTerm=(G,id)=>{ const t=T_(G); return !!t&&t.id===id; };
  const week=G=>{ const t=T_(G); return t?t.week:0; };
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const contact=(G,id)=>typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,id);
  const stageAt=(id,st)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const fam=id=>stageAt(id,'FAMILIAR');
  S.py=G=>typeof SOCIAL!=='undefined'&&SOCIAL.playerYear?SOCIAL.playerYear():1;
  /* 小工具給第二批以後用（src/pool_more3d.js）*/
  Object.assign(S,{law,DK,dateOf,md,wdTxt,hr,termOf:T_,termDay,ti,tid,inTerm,week,has,contact,stageAt,fam});
  /* 認識了沒（主要人物照各自的規則：阿哲、Alison＝STORY.knows；阿凱＝法律系一開始就認識；女主角舊的 met_ 旗標）*/
  S.met=function(G,id){ if(has(id,'FIRST_MET')) return true; if((id==='zhe'||id==='yu')&&typeof STORY!=='undefined'&&STORY.knows) return !!STORY.knows(id,G); if(id==='kai') return law(G);
    const F=(G&&G.flags)||{}; return !!(F['met_'+id]||(id==='heroine_01'&&F.met_an)||(id==='heroine_05'&&F.met_sis)); };
  S.rec=function(G){ if(!G.pool||typeof G.pool!=='object'||Array.isArray(G.pool)) G.pool={}; const R=G.pool; for(const k of ['deeds','did','seg','secret','mv']) if(!R[k]||typeof R[k]!=='object'||Array.isArray(R[k])) R[k]={}; if(!Array.isArray(R.chat)) R.chat=[]; R.v=1; return R; };   /* mv：認識的版本（第二批以後）；舊存檔沒有＝空的 */
  S.did=(G,k)=>S.rec(G).did[k]!=null;
  S.mark=(G,k)=>{ S.rec(G).did[k]=G.day; };
  const small=(G,id)=>{ const R=G.social.small||(G.social.small={}); return R[id]||(R[id]={day:0,used:[],last:null}); };
  S.small=small;
  /* 關係（2-8）：n＝熟悉、信任各加多少；不碰戀愛（rom、npcRom）*/
  S.bump=(id,n)=>{ if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(id,{fam:n,trust:n}); };
  /* 他那條線的一段：每一段只算一次（G.pool.seg[id][key]）*/
  S.seg=function(G,id,key){ const R=S.rec(G).seg, P=R[id]||(R[id]={}); if(P[key]!=null) return false; P[key]=G.day; S.bump(id,3); return true; };
  S.segSent=(G,id,key,tag)=>{ if(Array.isArray(G.msgs)&&G.msgs.some(m=>m&&m.tag===tag)) S.seg(G,id,key); };
  /* 人物頁「做過的事」一行一行（2-2）*/
  S.addDeed=function(G,id,t){ const R=S.rec(G).deeds, A=R[id]||(R[id]=[]); if(!A.includes(t)) A.push(t); };
  S.deeds=(G,id)=>((S.rec(G).deeds[id])||[]).slice();
  /* 這個人現在照作息在哪一筆（story3d.js schedEnt）／在不在這一區 */
  const ent=(G,id)=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return null; const e=STORY.schedEnt(c,G); return e&&e.zone===G.zone?e:null; };
  S.ent=ent;
  S.here=id=>{ const n=GMr&&GMr.npc&&GMr.npc[id]; return !!n&&!n.leaving; };
  const atBell=(G,id)=>{ const e=ent(G,id); return !!e&&e.seat==='bell'; };
  const atClass=(G,id)=>{ const e=ent(G,id); return !!e&&(e.act==='class'||!!e.door); };
  S.kaiHere=G=>!!(typeof STORY!=='undefined'&&STORY.kaiRoommate&&STORY.kaiRoommate(G));   /* 8-5：阿凱還住男一舍（大一同房；大二搬進 312 以後他住別棟，AA_374 第 1 項）*/
  const run=async(GM,id,lines)=>{ if(typeof EVENTS==='undefined'||!EVENTS.runLines) return; await EVENTS.runLines(lines,{id:'pool_'+id,participants:[id]}); };
  S.UI={picked:'領到了家齊媽媽寄的箱子。'};   /* 介面的字（不是台詞）*/

  /* ---------- 第 3 節：二十位的地點、樣子、一句話接到 CHARACTERS（載入時一次）---------- */
  S.apply=function(){ if(typeof CHARACTERS==='undefined') return 0; let n=0;
    for(const id of IDS){ const c=CHARACTERS[id], p=D.PEOPLE[id]; if(!c||!p) continue;
      c.daily_schedule=(S.WHERE_MORE[id]||[]).concat(p.where||[]).map(e=>Object.assign({},e)); if(p.cls) c.poolClass=Object.assign({},p.cls); else delete c.poolClass;   /* WHERE_MORE：各人那條線要的時段（第二批以後，src/pool_more3d.js；放前面）*/
      const pe=PERS[id]||p.personality;
      c.card=p.card||''; if(p.before) c.cardBefore=p.before; if(pe) c.personality=pe; c.poolPlace=p.place||'';   /* before：心事說出來以前人物頁用的中性一句（AA_498「實作時定的」第 4 點，照 AA_120）*/
      const ex=c.char3d&&c.char3d.extra!=null?c.char3d.extra:IDS.indexOf(id);
      const base=typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(ex+40):{sex:c.gender==='f'?'f':'m'};
      c.char3d={extra:ex,spec:Object.assign(base,{id,sex:c.gender==='f'?'f':'m',model:p.model,props:(p.props||[]).slice()})}; n++; }
    return n; };
  S.modelOf=id=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; return c&&c.char3d&&c.char3d.spec?c.char3d.spec.model:null; };
  /* 第二批以後（AA_499～501）：M＝{IDS, LINES, PERSONALITY?}（src/data/pool_story_b2.js…）；where＝{id:[作息…]}（各人那條線要的時段）。載入時一次（src/pool_more3d.js 叫）*/
  S.MORE=[];
  S.extend=function(M,where){ if(!M||!Array.isArray(M.IDS)||S.MORE.includes(M)) return false; S.MORE.push(M);
    for(const id of M.IDS) OWN.add(id); Object.assign(L,M.LINES||{}); if(M.PERSONALITY) Object.assign(PERS,M.PERSONALITY);
    if(where) for(const id in where) S.WHERE_MORE[id]=(S.WHERE_MORE[id]||[]).concat(where[id]);
    S.apply(); return true; };

  /* 必修課（story3d.js S.classmateClass 叫）：base＝那一堂的作息；靖雯第一排正中間、采潔第三排（霖澤館 201 有排）、郁婷上課前 10 分鐘在門口 */
  S.DOOR={classroom:[1.2,6.9,-1.2,0]};   /* 霖澤館 201 的後門口（門 (0,7.9)、玩家從 (0,7.4) 進來）：站在門邊、面向門 */
  S.classEnt=function(c,G,it,base){ const pc=c&&c.poolClass; if(!pc) return base; const z=base.zone; base.desc=pc.desc;
    if(pc.door){ const h=hr(G); if(h<it.t0-1/6) return null; if(h<it.t0) return S.DOOR[z]?Object.assign(base,{act:'linger',at:S.DOOR[z],from:it.t0-1/6,to:it.t0,door:true,label:'教室門口'}):null; }
    if(pc.seat&&z==='classroom') base.seat=pc.seat.slice(); return base; };

  /* 2-2 認識之前的外觀描述：這一筆作息的 desc（同一個人在兩個地方各有一句）；不在這一區＝null（SOCIAL 用 characters.js 的 descriptor）*/
  S.descNow=function(id,G){ G=G||curG(); if(!G||typeof CHARACTERS==='undefined'||!CHARACTERS[id]) return null;
    if(typeof HCIRCLE!=='undefined'&&HCIRCLE&&HCIRCLE.named&&HCIRCLE.named(G,id)) return CHARACTERS[id].name;   /* 女主角的圈子同框看過名牌（AA_528 1-3）：還沒認識也寫名字 */
    const n=GMr&&GMr.G===G&&GMr.npc&&GMr.npc[id]; if(n&&n.poolDesc) return n.poolDesc; const e=ent(G,id); return e&&e.desc||null; };
  /* 人物頁（2-2、2-8）：一句話；升到朋友（reveal FRIEND）＝personality（沒寫的照一句話）*/
  S.pageDesc=function(id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c) return ''; if(c.cardBefore&&!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(id,'SHARED_SECRET'))) return c.cardBefore; const fr=typeof SOCIAL!=='undefined'&&SOCIAL.reveal&&SOCIAL.reveal(id)==='FRIEND'; return fr&&c.personality?c.personality:(c.card||''); };
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  S.deedsHTML=function(id,G){ G=G||curG(); if(!G) return ''; const A=S.deeds(G,id); return A.length?'<div style="margin-top:2px">'+A.map(t=>'<div class="muted">· '+esc(t)+'</div>').join('')+'</div>':''; };

  /* ---------- 2-1 固定的樣子：模型下載完以前藏起來；按鈕；無名路人不拿同學的底模 ---------- */
  S._loading={}; S._failed={};
  S.afterSpawn=function(GM){ if(!GM||!GM.npc||!GM.G) return; const G=GM.G;
    for(const id in GM.npc){ if(!/^pool_/.test(id)) continue; const n=GM.npc[id]; if(!n||n.charId!==id) continue;
      if(!n._pool){ n._pool=true; const e=ent(G,id); n.poolDesc=e&&e.desc||null; if(e&&e.act==='linger'){ n.frozen=true; } if(typeof SOCIAL!=='undefined'&&SOCIAL.npcName){ n.name=SOCIAL.npcName(id); if(n.talk) n.talkLabel='和'+n.name+'說話'; } }   /* 站著的人不被 pairUp 帶走（固定在一個地方）*/
      S.modelWait(n,id); S.syncTalk(G,id,n);
      if(id==='pool_7'&&typeof CHAR!=='undefined'&&CHAR.setProp&&n.obj){ const e=ent(G,id), on=!!(e&&e.seat==='bell'); if(n._bench!==on){ n._bench=on; CHAR.setProp(n.obj,'thermos_bench',on); } } } };   /* 靖雯坐在傅鐘長椅（AA_498：「旁邊一個銀色的保溫瓶」）：保溫瓶放在身旁；上課、法服值班不放（NPC-POOL-ART-1028）*/
  S.modelWait=function(n,id){ if(typeof CHAR==='undefined'||!CHAR.isDegraded||!n.obj) return; const want=S.modelOf(id); if(!want) return;
    if(CHAR.isDegraded(n.obj)){
      if(S._failed[want]){ const u=n.obj.userData; u.wantModel=null; if(u.degradedHidden){ for(const ch of n.obj.children) ch.visible=true; u.degradedHidden=false; } n.hidden=false; n._poolWait=false; return; }   /* 下載失敗：用備用的人（同一個人的顏色），不要一直隱形 */
      n.hidden=true; n._poolWait=true;
      if(typeof ASSETS!=='undefined'&&ASSETS.loadOne&&!ASSETS.has(want)&&!S._loading[want]){ S._loading[want]=true; ASSETS.loadOne(want).catch(e=>{ S._failed[want]=true; console.warn('POOL model',want,e&&e.message); }).finally(()=>{ delete S._loading[want]; }); } }
    else if(n._poolWait){ n.hidden=false; n._poolWait=false; } };
  /* 還不能認識的地方（第一批：那裡沒有寫認識的那一場）先不給按鈕（不出一個按了沒反應的「說話」）；認識以後都可以說話 */
  S.syncTalk=function(G,id,n){ if(!OWN.has(id)) return; const ok=has(id,'FIRST_MET')||!!S.meetVersion(G,id);
    if(!ok&&n.talk){ n._poolTalk=n.talk; n.talk=null; n.talkLabel=null; }
    else if(ok&&!n.talk&&n._poolTalk){ n.talk=n._poolTalk; n._poolTalk=null; n.talkLabel='和'+(typeof SOCIAL!=='undefined'&&SOCIAL.npcName?SOCIAL.npcName(id):id)+'說話'; } };
  /* 這一區有作息的同學的底模（無名路人不拿）*/
  let classZones=null;   /* 必修課的教室在哪幾區（COURSES 的 required 課 → rooms 的 zone；第一次用到時算）*/
  const isClassZone=z=>{ if(!classZones){ classZones=new Set(['classroom']); try{ if(typeof COURSES!=='undefined'&&Array.isArray(COURSES.list)&&COURSES.rooms) for(const c of COURSES.list){ const r=c&&c.kind==='required'&&COURSES.rooms[c.room]; if(r&&r.zone) classZones.add(r.zone); } }catch(e){} } return classZones.has(z); };
  S.reserved=function(G){ G=G||curG(); const out=new Set(); if(!G||typeof CHARACTERS==='undefined') return out;
    for(const id of IDS){ const c=CHARACTERS[id], m=S.modelOf(id); if(!c||!m) continue; if((c.daily_schedule||[]).some(e=>e.zone===G.zone)||(c.poolClass&&isClassZone(G.zone))) out.add(m); } return out; };
  S.dedupe=function(GM){ if(!GM||!GM.E||typeof CHAR==='undefined'||!CHAR.anonKeyOf||!CHAR.reAnon||!CHAR.anonPool||!CHAR.anonPool.alt) return 0; const used=new Set(); for(const id in GM.npc) if(/^pool_/.test(id)){ const m=S.modelOf(id); if(m) used.add(m); } if(!used.size) return 0; let k=0;
    for(const x of GM.E.npcs||[]){ if(!x||!x.isExtra||!x.obj) continue; const key=CHAR.anonKeyOf(x.obj); if(!key||!used.has(key)) continue; const alt=CHAR.anonPool.alt(x.obj,used); if(!alt) continue; const nh=CHAR.reAnon(x.obj,alt); if(nh){ x.obj=nh; k++; } } return k; };
  S.wrapAnon=function(){ if(typeof CHAR==='undefined'||!CHAR.anonPool||CHAR.anonPool._poolKeep||typeof ASSETS==='undefined') return false; const P=CHAR.anonPool, ch0=P.choose;
    P.choose=function(id,sex){ if(P.pick[id]) return P.pick[id]; const res=S.reserved(); if(!res.size) return ch0.call(P,id,sex); const L0=P.cur.filter(k=>ASSETS.manifest[k]&&ASSETS.manifest[k].sex===sex&&!res.has(k)); if(!L0.length) return ch0.call(P,id,sex);
      let best=L0[0]; for(const k of L0) if((P.uses[k]|0)<(P.uses[best]|0)) best=k; P.uses[best]=(P.uses[best]|0)+1; P.pick[id]=best; return best; };
    P._poolKeep=true; return true; };

  /* ---------- 2-3 認識的那一場（第一批五位）---------- */
  /* 這一區、這個時間有沒有寫好的認識版本（沒有＝先不能說話）*/
  S.MEETV={};   /* 第二批以後：id → (G,e)⇒這一區、這個時間的認識版本（LINES[id] 的鍵）或 null（src/pool_more3d.js）*/
  S.meetVersion=function(G,id){ if(!OWN.has(id)) return null; const e=ent(G,id); if(!e) return null; const z=G.zone;
    if(typeof STORY!=='undefined'&&STORY.presence){ const pr=STORY.presence(id,G); if(pr&&pr.here===false) return null; }   /* 不在（畢業了、交換出國）＝不能認識（AA_528 1-1：他已經畢業的不能再認識）*/
    if(!B1.has(id)) return S.MEETV[id]?(S.MEETV[id](G,e)||null):null;
    if(id===Z){ if(e.seat==='bell') return 'meetBell'; if(e.act==='class'&&hr(G)>=12) return 'meetClass'; return null; }   /* 教室版「早安。……對，下午了。」：下午的課 */
    if(id===Y) return e.door&&(ti(G)>0||week(G)>=2)?'meet':null;   /* 教室門口（上課前、期中考前一週週三下課）。5-1 寫大一上第 2～4 週：第 1 週不演；第 5 週以後沒有別的認識版本，照同一場演（不然她整條線都沒了）*/
    if(id===C){ if(z==='bookstore') return 'meetBook'; if(e.act==='class'&&(ti(G)>0||week(G)>=6)) return 'meetClass'; return null; }   /* 6-6：大一上第 6 週起，必修課第三排 */
    if(id===YS) return z==='campus'&&!e.terms?'meet':null;   /* 椰林大道那一筆；「你是大一的吧？」「大三」＝祐廷大一（AA_528 1-1：大二起照樣可以認識，第一場照演；他畢業以後作息不在）*/
    if(id===Q) return z==='dorm_hall'?'meet':null;   /* 交誼廳；「學弟」「大三」＝祐廷大一（AA_528 1-1：大二起照樣可以認識）*/
    return null; };
  S.owns=id=>OWN.has(id);
  S.meet=async function(GM,who,id,n){ const G=GM.G; S.bind(GM); const v=S.meetVersion(G,id); const lines=v&&L[id]&&L[id][v]; if(!lines) return false;
    await run(GM,id,lines); if(!has(id,'FIRST_MET')&&typeof SOCIAL!=='undefined') SOCIAL.meet(id,G.zone); S.rec(G).mv[id]=v; S.afterMeet(G,id); small(G,id).day=G.day; return true; };   /* mv：用哪一個版本認識的（劉晏如的閒聊照這個，AA_500 2-2）*/
  S.AFTER_MEET={};   /* 第二批以後：認識以後各人要記的（G,id）；認識的那一場、女主角的圈子介紹（src/hcircle3d.js）都走這裡 */
  S.afterMeet=function(G,id){ S.seg(G,id,'meet');
    if(id===Y&&G.flags&&G.flags.YT_FEE_LATER&&S.rec(G).feeDay==null){ let d=G.day+1; while(dateOf(d).wd!==1) d++; S.rec(G).feeDay=d; }   /* 5-1「下禮拜給。」：下週一 21:00 她私訊 */
    if(S.AFTER_MEET[id]){ try{ S.AFTER_MEET[id](G,id); }catch(e){ console.warn('POOL.AFTER_MEET',id,e); } } };
  /* 林采潔 新生導覽版（lib_tour_y1s1）：導覽走完、還沒認識她＝那一場（2D）*/
  S.TOUR_EV={ id:'ev_pool_cj_tour', title:'推理小說那一排', participants:[C], noMeet:[C], location:'library', trigger:'manual', background:'blur', dialogue:L[C]?L[C].meetTour:[],
    after:G=>{ if(!has(C,'FIRST_MET')&&typeof SOCIAL!=='undefined') SOCIAL.meet(C,'library'); S.afterMeet(G,C); small(G,C).day=G.day; } };
  S.tourMeetDue=G=>law(G)&&!has(C,'FIRST_MET')&&typeof ACTIVITIES!=='undefined'&&!!ACTIVITIES.attended&&ACTIVITIES.attended(G,'lib_tour_y1s1',G.day);

  /* ---------- 2-4 閒聊 ---------- */
  const WHEN={
    met:()=>true, metAn:G=>S.met(G,'heroine_01'), metZhe:G=>S.met(G,'zhe'), metKai:G=>S.met(G,'kai'), metQJQ:G=>has(Q,'FIRST_MET'), metYS:G=>has(YS,'FIRST_MET'),
    Y1S1:G=>tid(G)==='Y1S1', Y1S2:G=>tid(G)==='Y1S2', Y2S1:G=>tid(G)==='Y2S1', Y2S2:G=>tid(G)==='Y2S2', Y3S1:G=>tid(G)==='Y3S1',
    'Y1S2+':G=>ti(G)>=1, 'Y2+':G=>ti(G)>=2, Y3:G=>/^Y3/.test(tid(G)||''), Y4:G=>/^Y4/.test(tid(G)||''),
    Y1S2noCourt:G=>tid(G)==='Y1S2'&&['declined','lapsed'].includes(S.qState(G,'PQ_ZJW')),
    Y3secret:G=>/^Y3/.test(tid(G)||'')&&has(Y,'SHARED_SECRET'), Y4metCJ:G=>/^Y4/.test(tid(G)||'')&&has(C,'FIRST_MET'), Y4metYT:G=>/^Y4/.test(tid(G)||'')&&has(Y,'FIRST_MET'),
    qjqNo:G=>S.qState(G,'PQ_QJQ')==='declined' };
  S.WHEN=WHEN;
  S.nextLine=function(G,id){ const r=small(G,id), once=r.once||{}; for(const e of ((L[id]&&L[id].talk)||[])){ if(once[e.t]||(e.old&&once[e.old])) continue;   /* old：稿改過的原句（舊存檔說過舊的那一句＝照算說過，第二批以後）*/ const w=e.when==='secret'?has(id,'SHARED_SECRET'):(WHEN[e.when]?WHEN[e.when](G):false); if(w) return e; } return null; };
  const sayAny=async(GM,who,t)=>{ if(/^（/.test(t)) await GM.say(null,t); else await GM.say(who,t,{expr:'smile'}); };
  S.smallTalk=async function(GM,who,id){ const G=GM.G, r=small(G,id), T=T_(G), tid0=T?T.id:'none', nm=typeof SOCIAL!=='undefined'?SOCIAL.displayName(id):id;
    const act=fresh=>{ if(typeof SOCIAL!=='undefined'&&SOCIAL.activity){ SOCIAL.activity(id,'chat'); if(fresh) SOCIAL.activity(id,'chatNew'); } };
    if(r.day===G.day){ const o=typeof STORY!=='undefined'&&STORY.greetB?STORY.greetB(G,id,r,nm,T,tid0):{narr:'（'+nm+'對你點點頭。）'}; if(o.say) await GM.say(who,o.say); else await GM.say(null,o.narr); act(false); return 'repeat'; }   /* 一天一句 */
    const e=S.nextLine(G,id); if(e){ r.used.push(e.t); r.last=e.t; r.day=G.day; (r.once||(r.once={}))[e.t]=true; await GM.say(who,e.t,{expr:'smile'}); act(true); return 'line'; }
    const o=typeof STORY!=='undefined'&&STORY.greetB?STORY.greetB(G,id,r,nm,T,tid0):null; r.day=G.day;   /* 開學、期中、期末的短招呼照舊穿插 */
    if(o&&o.say){ await GM.say(who,o.say); act(false); return 'period'; }
    const gL=(L[id]&&L[id].greet)||[]; if(gL.length){ const k=(r.g|0)%gL.length; r.g=(r.g|0)+1; await sayAny(GM,who,gL[k]); } else await GM.say(null,(o&&o.narr)||'（'+nm+'對你點點頭。）'); act(false); return 'greet'; };

  /* ---------- 2-5 秘密 ---------- */
  S.secretMark=function(G,id){ if(has(id,'SHARED_SECRET')||typeof SOCIAL==='undefined') return false; const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id];
    SOCIAL.remember(id,'SHARED_SECRET',(c&&c.facts&&c.facts[1])||''); SOCIAL.adjust(id,{fam:4,trust:4}); S.seg(G,id,'secret'); return true; };   /* 照舊：熟悉＋4、信任＋4（AA_120）；也是他那條線的一段（2-8）*/
  const secretScene=async(GM,id,lines)=>{ await run(GM,id,lines); S.secretMark(GM.G,id); small(GM.G,id).day=GM.G.day; };
  S.secretScene=secretScene;

  /* ---------- 2-6 順手的事（SIDEQ 登記）---------- */
  S.QUEST={ PQ_ZJW:{who:Z,title:'陪靖雯去旁聽'}, PQ_YT1:{who:Y,title:'黃郁婷：考前補給包'}, PQ_YT2:{who:Y,title:'黃郁婷：迎新報到桌'},
    PQ_CJ:{who:C,title:'林采潔：第三章'}, PQ_YS:{who:YS,title:'鄭元碩：法律系的一天'}, PQ_QJQ:{who:Q,title:'邱家齊：代收媽媽的箱子'} };
  const HINT={ PQ_ZJW:{court:r=>md(r.outDay)+'（'+wdTxt(r.outDay)+'）14:00 陪靖雯去臺北地方法院旁聽'}, PQ_YT1:{pack:()=>'今天 19:00～21:00 到萬才館一樓幫忙包考前補給包'},
    PQ_YT2:{desk:r=>md(r.outDay)+'（三）08:30 到霖澤館一樓的迎新報到桌'}, PQ_CJ:{read:()=>'在舊路書房或教室找采潔，讀她的第三章'},
    PQ_YS:{shoot:r=>md(r.outDay)+'（六）07:00 起當「法律系的一天」的主角'}, PQ_QJQ:{pick:r=>md(r.satDay)+'（六）10:00～18:00 到男一舍門廳領包裹',fridge:()=>'把箱子放進男一舍交誼廳的冰箱'} };
  S.hint=(id,r)=>{ const h=HINT[id]&&HINT[id][r.step]; return typeof h==='function'?h(r):(h||''); };
  S.HINT=HINT;   /* 第二批以後的順手的事在 src/pool_more3d.js 加進來（S.QUEST、S.HINT，再叫一次 S.register）*/
  S.qRec=(G,qid)=>typeof SIDEQ!=='undefined'&&SIDEQ.get?SIDEQ.get(G,qid):null;
  S.qState=(G,qid)=>{ const r=S.qRec(G,qid); return r?r.state:null; };
  S.canOpen=G=>typeof SIDEQ==='undefined'||!SIDEQ.openIds||SIDEQ.openIds(G).length<SIDEQ.MAX;   /* 同時最多兩則（店員的一起算）*/
  S.openQ=function(GM,qid,step,extra){ const G=GM.G; if(typeof SIDEQ==='undefined') return null; const r=SIDEQ.rec(G)[qid]=Object.assign({state:'open',step,day:G.day,term:SIDEQ.termKey(G)},extra||{}); if(GM.toast) GM.toast('📝 順手的事：'+S.QUEST[qid].title,2600); return r; };
  S.declineQ=(G,qid)=>{ if(typeof SIDEQ!=='undefined') SIDEQ.rec(G)[qid]={state:'declined',term:SIDEQ.termKey(G),day:G.day}; };
  S.finishQ=function(GM,qid,r,o){ if(typeof SIDEQ!=='undefined'&&SIDEQ.finish) SIDEQ.finish(GM,qid,r,o); else { r.state='done'; r.doneDay=GM.G.day; } S.bump(S.QUEST[qid].who,6); };   /* 做完：熟悉＋6、信任＋6（2-8）*/
  const lapseQ=qid=>G=>{ const r=S.qRec(G,qid); if(r&&r.state==='open'){ r.state='lapsed'; r.lapseDay=G.day; } };
  S.register=function(){ if(typeof SIDEQ==='undefined'||!SIDEQ.Q) return false; for(const qid in S.QUEST){ if(!SIDEQ.Q[qid]) SIDEQ.Q[qid]={shop:'pool:'+S.QUEST[qid].who,title:S.QUEST[qid].title,pool:S.QUEST[qid].who,avail:()=>false,accept:async()=>{}}; }
    if(!SIDEQ.hint._pool){ const h0=SIDEQ.hint; SIDEQ.hint=Object.assign((id,r)=>S.QUEST[id]?S.hint(id,r):h0(id,r),{_pool:true}); } return true; };
  /* 下一個下午沒課的平日 14:00（4-3 旁聽；放假法院沒開）。AA_498「實作時定的」第 3 點（56ed354e9）：原本「上午沒課」，大一下平日每天早上都有課找不到，改下午——
     13:30～16:30 沒有課（14:00 開庭、捷運 20 分鐘、旁聽兩小時；上午的課 12:10 下課不算）；找到這學期結束，找不到就不開口（S.FLOW 的條件）*/
  S.courtDay=function(G){ const T=T_(G), R=T&&typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays(T.id):null, last=R&&R.to!=null?R.to:G.day+60;
    for(let d=G.day+1;d<=last;d++){ const w=dateOf(d).wd; if(w<1||w>5||(typeof CALENDAR!=='undefined'&&CALENDAR.holiday(d))) continue; const items=typeof CLS!=='undefined'&&CLS.dayItems?CLS.dayItems(G,d):[]; if(items.some(it=>it.t0<16.5&&(it.t1==null?it.t0+2:it.t1)>13.5)) continue; return d; } return null; };
  S.nextSat=G=>{ let d=G.day+1; while(dateOf(d).wd!==6) d++; return d; };
  const plan=(G,o)=>typeof OUT!=='undefined'&&OUT.plan?OUT.plan(G,o):false;
  async function offer(GM,who,id,qid,o){ const G=GM.G, Lx=L[id]; await run(GM,id,Lx[o.ask]); if(o.afterAsk) o.afterAsk(GM); const k=await GM.choose(Lx[o.opts].map(t=>({t})));   /* afterAsk：開口那幾句裡就說了秘密的（AA_500 3-3、AA_501 1-3…）*/
    if(k===0){ if(o.yes) await run(GM,id,Lx[o.yes]); await o.accept(GM); } else { S.declineQ(G,qid); if(o.no) await run(GM,id,Lx[o.no]); if(o.declined) await o.declined(GM); }
    small(G,id).day=G.day; return k===0; }
  Object.assign(S,{run,plan,offer,lapseQ});
  /* 4-3 靖雯：陪她去旁聽 */
  S.acceptZjw=function(GM){ const G=GM.G; if(typeof INV!=='undefined') INV.addContact(G,Z); const d=S.courtDay(G); S.openQ(GM,'PQ_ZJW','court',{outDay:d,by:d});
    if(d!=null) plan(G,{id:'pool_court_'+d,ev:'ev_pool_zjw_court',day:d,h:14,late:0.5,place:'臺北地方法院',title:'陪靖雯去旁聽（臺北地方法院 14:00）',travel:'捷運 約 20 分鐘',travelH:1/3}); };
  S.COURT_EV={ id:'ev_pool_zjw_court', title:'陪靖雯去旁聽', participants:[Z], location:'any', trigger:'outing', background:'dark', hours:2, dialogue:L[Z]?L[Z].court:[],
    after:(G,GM)=>{ const r=S.qRec(G,'PQ_ZJW'); if(!r||r.state!=='open') return; S.secretMark(G,Z); S.addDeed(G,Z,L[Z].deedCourt); S.finishQ(GM&&GM.G===G?GM:{G},'PQ_ZJW',r,{away:true}); },
    outingMissed:lapseQ('PQ_ZJW') };
  /* 5-3 郁婷：考前補給包（期中考前一週的週三下課＝大一上第 7 週週三；當晚 19～21 萬才館一樓）*/
  S.yt1Day=()=>termDay('Y1S1',7,3);
  S.acceptYt1=GM=>{ S.openQ(GM,'PQ_YT1','pack',{packDay:GM.G.day,by:GM.G.day}); };
  S.PACK_EV={ id:'ev_pool_yt_pack', title:'考前補給包', participants:[Y], location:'wancai', trigger:'manual', background:'blur', dialogue:L[Y]?L[Y].pack:[],
    after:(G,GM)=>{ const r=S.qRec(G,'PQ_YT1'); if(!r||r.state!=='open') return; if(typeof INV!=='undefined') INV.addContact(G,Y); S.finishQ(GM&&GM.G===G?GM:{G},'PQ_YT1',r); } };
  S.packDue=GM=>{ const G=GM&&GM.G, r=G&&S.qRec(G,'PQ_YT1'); if(!r||r.state!=='open'||r.step!=='pack'||G.day!==r.packDay||G.zone!=='wancai') return false; const h=hr(G); return h>=19&&h<21; };
  /* 隔天霖澤館一樓：補給的桌子（幫了＝她塞一包；沒幫、過期＝阿哲在發）*/
  S.ytTableDue=G=>{ const r=S.qRec(G,'PQ_YT1'); if(!r||G.zone!=='linze') return false; const d0=r.packDay!=null?r.packDay:r.day; const st=r.state==='open'&&r.by!=null&&G.day>r.by?'lapsed':r.state; return G.day===d0+1&&['done','declined','lapsed'].includes(st); };   /* 答應了沒去、還沒被 SIDEQ.lapse 改成過期的：一樣算沒幫 */
  S.ytTableLine=G=>S.qState(G,'PQ_YT1')==='done'?L[Y].tableYes:L[Y].tableNo;
  /* 5-5 郁婷：迎新報到桌（大二上第 1 週週三 08:30，霖澤館一樓，2D）*/
  S.yt2Day=()=>termDay('Y2S1',1,3);
  S.acceptYt2=function(GM){ const G=GM.G, d=S.yt2Day(); S.openQ(GM,'PQ_YT2','desk',{outDay:d,by:d}); if(d!=null) plan(G,{id:'pool_yt_desk',ev:'ev_pool_yt_desk',day:d,h:8.5,late:0.5,place:'霖澤館一樓',title:'黃郁婷：迎新報到桌（霖澤館一樓 8:30）',travel:'走過去約 10 分鐘',travelH:0.25}); };
  S.DESK_EV={ id:'ev_pool_yt_desk', title:'迎新報到桌', participants:[Y], location:'any', trigger:'outing', background:'dark', hours:1.5, dialogue:L[Y]?L[Y].desk:[],
    after:(G,GM)=>{ const r=S.qRec(G,'PQ_YT2'); if(r&&r.state==='open') S.finishQ(GM&&GM.G===G?GM:{G},'PQ_YT2',r,{away:true}); }, outingMissed:lapseQ('PQ_YT2') };
  /* 6-3 采潔：第三章（大一下第 2～12 週，聽過她的秘密；在舊路書房或教室）*/
  S.cjOfferOK=G=>!S.qState(G,'PQ_CJ')&&inTerm(G,'Y1S2')&&week(G)>=2&&week(G)<=12&&has(C,'SHARED_SECRET')&&(G.zone==='bookstore'||atClass(G,C))&&S.canOpen(G);
  S.acceptCj=GM=>{ const G=GM.G; if(typeof INV!=='undefined') INV.addContact(G,C); const T=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y1S2'):null; S.openQ(GM,'PQ_CJ','read',{by:T?T.to:G.day+60}); };
  /* 7-3 元碩：法律系的一天（大二下第 4～10 週；下一個週六 07:00 起，2D 一天四段）*/
  S.acceptYs=function(GM){ const G=GM.G; if(typeof INV!=='undefined') INV.addContact(G,YS); const d=S.nextSat(G); S.openQ(GM,'PQ_YS','shoot',{outDay:d,by:d});
    plan(G,{id:'pool_ys_day_'+d,ev:'ev_pool_ys_day',day:d,h:7,late:1,place:'台大校園',title:'鄭元碩：法律系的一天（傅鐘 7:00）',travel:'走過去約 10 分鐘',travelH:0.25}); };
  S.DAY_EV={ id:'ev_pool_ys_day', title:'法律系的一天', participants:[YS], location:'any', trigger:'outing', background:'dark', hours:13, dialogue:L[YS]?L[YS].day:[],
    after:(G,GM)=>{ const r=S.qRec(G,'PQ_YS'); if(r&&r.state==='open') S.finishQ(GM&&GM.G===G?GM:{G},'PQ_YS',r,{away:true}); }, outingMissed:lapseQ('PQ_YS') };
  /* 8-3 家齊：代收媽媽的箱子（大一下第 4～10 週，交誼廳，週四晚上；週六 10～18 門廳領 → 交誼廳的冰箱）*/
  S.acceptQjq=function(GM){ const G=GM.G; if(typeof INV!=='undefined') INV.addContact(G,Q); const sat=G.day+(((6-dateOf(G.day).wd)+7)%7||7); S.openQ(GM,'PQ_QJQ','pick',{satDay:sat,by:sat}); };
  S.qjqPickDue=G=>{ const r=S.qRec(G,'PQ_QJQ'); if(!r||r.state!=='open'||r.step!=='pick'||G.day!==r.satDay||G.zone!=='dorm_hall') return false; const h=hr(G); return h>=10&&h<18; };
  S.qjqFridgeDue=G=>{ const r=S.qRec(G,'PQ_QJQ'); return !!r&&r.state==='open'&&r.step==='fridge'&&G.zone==='dorm_hall'; };
  S.qjqNoteDue=G=>{ const r=S.qRec(G,'PQ_QJQ'); return !!r&&r.state==='done'&&r.satDay!=null&&G.day===r.satDay+1&&hr(G)>=17&&G.zone==='dorm_hall'; };   /* 週日晚上，交誼廳桌上的紙條 */
  S.fridgeNoteDue=G=>G.zone==='dorm_hall'&&inTerm(G,'Y2S2')&&week(G)===16&&has(Q,'FIRST_MET');   /* 8-6 畢業那一週的冰箱 */

  /* ---------- 各人的流程（talkCharacter 說話：第一個成立的就演，演完這一次就結束；都不成立＝閒聊）---------- */
  const FLOW={
    [Z]:[
      async(GM,who)=>{ const G=GM.G; if(G.day!==DK('2029-06-02')||!atBell(G,Z)||S.did(G,'zjwLast')) return false;   /* 4-6 最後一場（畢業典禮早上，傅鐘）*/
        await run(GM,Z,L[Z].last); S.mark(G,'zjwLast'); S.seg(G,Z,'last'); small(G,Z).day=G.day; return true; },
      async(GM,who)=>{ const G=GM.G; if(has(Z,'SHARED_SECRET')||!atBell(G,Z)||!fam(Z)||small(G,Z).day===G.day) return false;   /* 沒去旁聽的：大一下第 12 週起，在傅鐘 */
        if(!(ti(G)>1||(tid(G)==='Y1S2'&&week(G)>=12))) return false; const st=S.qState(G,'PQ_ZJW'); if(st==='open'||st==='done') return false;
        await secretScene(GM,Z,L[Z].secret); return true; },
      async(GM,who)=>{ const G=GM.G; if(S.qState(G,'PQ_ZJW')||!inTerm(G,'Y1S2')||week(G)<3||week(G)>10||!fam(Z)||!atBell(G,Z)||hr(G)>=12||!S.canOpen(G)||S.courtDay(G)==null) return false;   /* 4-3：大一下第 3～10 週，平日早上在傅鐘（這學期還找得到上午沒課的平日）*/
        await offer(GM,who,Z,'PQ_ZJW',{ask:'ask',opts:'askOpts',yes:'askYes',no:'askNo',accept:S.acceptZjw}); return true; },
      async(GM,who)=>{ const G=GM.G; if(!inTerm(G,'Y3S1')||week(G)<10||contact(G,Z)||S.did(G,'zjwY3')||!atClass(G,Z)) return false;   /* 沒有聯絡方式：大三上那一題在必修課當面問 */
        await GM.say(who,L[Z].y3q); const O=L[Z].y3Opts, k=await GM.choose(O.map(o=>({t:'「'+o[0]+'」'}))); await GM.say(who,(O[k]||O[0])[1]); S.mark(G,'zjwY3'); S.seg(G,Z,'y3'); small(G,Z).day=G.day; return true; },
      async(GM,who)=>{ const G=GM.G; if(S.did(G,'zjwInvite')||ti(G)<2||(inTerm(G,'Y2S1')&&week(G)<3)||(typeof STORY!=='undefined'&&STORY.fafuMember&&STORY.fafuMember(G))||!fam(Z)||!atBell(G,Z)) return false;   /* 4-5：大二上第 3 週起，不是法服的 */
        await run(GM,Z,L[Z].invite); const k=await GM.choose(L[Z].inviteOpts.map(t=>({t}))); S.mark(G,'zjwInvite');
        if(k===0){ S.planWatch(G); S.seg(G,Z,'fafu'); } else await run(GM,Z,L[Z].inviteNo); small(G,Z).day=G.day; return true; } ],
    [Y]:[
      async(GM,who)=>{ const G=GM.G; if(S.qState(G,'PQ_YT1')||G.day!==S.yt1Day()||hr(G)<12+10/60||!atClass(G,Y)||!S.canOpen(G)) return false;   /* 5-3：大一上第 7 週週三下課，教室門口 */
        await offer(GM,who,Y,'PQ_YT1',{ask:'ask1',opts:'ask1Opts',no:'ask1No',accept:S.acceptYt1}); return true; },
      async(GM,who)=>{ const G=GM.G; if(has(Y,'SHARED_SECRET')||!fam(Y)||!atClass(G,Y)||small(G,Y).day===G.day) return false;   /* 5-4：大一下第 10 週起，教室門口 */
        if(!(ti(G)>1||(tid(G)==='Y1S2'&&week(G)>=10))) return false; await secretScene(GM,Y,L[Y].secret); return true; },
      async(GM,who)=>{ const G=GM.G; if(S.qState(G,'PQ_YT2')||!inTerm(G,'Y2S1')||week(G)!==1||G.zone!=='linze'||contact(G,Y)||!S.canOpen(G)) return false;   /* 5-5：沒有聯絡方式的，大二上第 1 週週一在霖澤館一樓當面問 */
        await GM.say(who,L[Y].ask2); const k=await GM.choose(L[Y].ask2Opts.map(t=>({t:'「'+t+'」'}))); if(k===0) S.acceptYt2(GM); else { S.declineQ(G,'PQ_YT2'); await GM.say(who,L[Y].ask2No); } small(G,Y).day=G.day; return true; } ],
    [C]:[
      async(GM,who)=>{ const G=GM.G; if(S.did(G,'cjBook')||!inTerm(G,'Y4S2')||week(G)!==15||G.zone!=='bookstore'||!fam(C)) return false;   /* 6-5 印好的書：大四下第 15 週，舊路書房 */
        await run(GM,C,L[C].book); S.mark(G,'cjBook'); G.flags.CJ_BOOK=true; S.seg(G,C,'book'); small(G,C).day=G.day; return true; },
      async(GM,who)=>{ const G=GM.G, r=S.qRec(G,'PQ_CJ'); if(!r||r.state!=='open'||r.step!=='read'||G.day<=r.day||!(G.zone==='bookstore'||atClass(G,C))) return false;   /* 6-3：下一次在舊路書房或教室說話＝讀完 */
        await run(GM,C,L[C].read); S.addDeed(G,C,L[C].deedRead); S.finishQ(GM,'PQ_CJ',r); small(G,C).day=G.day; return true; },
      async(GM,who)=>{ const G=GM.G; if(has(C,'SHARED_SECRET')||!fam(C)||small(G,C).day===G.day) return false; if(!(ti(G)>0||(tid(G)==='Y1S1'&&week(G)>=12))) return false;   /* 秘密：大一上第 12 週起 */
        await run(GM,C,L[C].secret); S.secretMark(G,C); const e=L[C].talk.find(x=>x.when==='secret'), r=small(G,C); (r.once||(r.once={}))[e.t]=true; r.used.push(e.t); r.last=e.t; r.day=G.day; await GM.say(who,e.t);   /* 不加選項，接「我寫的那篇卡在第三章」那句，再接 6-3 */
        if(S.cjOfferOK(G)) await offer(GM,who,C,'PQ_CJ',{ask:'ask',opts:'askOpts',yes:'askYes',no:'askNo',accept:S.acceptCj}); return true; },
      async(GM,who)=>{ const G=GM.G; if(!S.cjOfferOK(G)) return false; await offer(GM,who,C,'PQ_CJ',{ask:'ask',opts:'askOpts',yes:'askYes',no:'askNo',accept:S.acceptCj}); return true; } ],
    [YS]:[
      async(GM,who)=>{ const G=GM.G; if(has(YS,'SHARED_SECRET')||!fam(YS)||G.zone!=='campus'||!ent(G,YS)||small(G,YS).day===G.day) return false; if(!(ti(G)>1||(tid(G)==='Y1S2'&&week(G)>=8))) return false;   /* 秘密：大一下第 8 週起，椰林大道 */
        await secretScene(GM,YS,L[YS].secret); return true; },
      async(GM,who)=>{ const G=GM.G, e=ent(G,YS); if(S.qState(G,'PQ_YS')||!inTerm(G,'Y2S2')||week(G)<4||week(G)>10||!fam(YS)||!e||e.terms||!S.canOpen(G)) return false;   /* 7-3：大二下第 4～10 週，椰林大道 */
        await offer(GM,who,YS,'PQ_YS',{ask:'ask',opts:'askOpts',no:'askNo',accept:S.acceptYs}); return true; } ],
    [Q]:[
      async(GM,who)=>{ const G=GM.G; if(S.did(G,'qjqBye')||!inTerm(G,'Y2S2')||week(G)!==16||dateOf(G.day).wd!==7||G.zone!=='dorm_hall') return false;   /* 8-6：畢業那一週，他在場的話（那一週週日 21～23）*/
        await run(GM,Q,L[Q].bye); S.mark(G,'qjqBye'); S.seg(G,Q,'fridge'); small(G,Q).day=G.day; return true; },
      async(GM,who)=>{ const G=GM.G; if(has(Q,'SHARED_SECRET')||!fam(Q)||G.zone!=='dorm_hall'||small(G,Q).day===G.day) return false; if(!(ti(G)>0||(tid(G)==='Y1S1'&&week(G)>=10))) return false;   /* 秘密：大一上第 10 週起，交誼廳 */
        await secretScene(GM,Q,L[Q].secret); return true; },
      async(GM,who)=>{ const G=GM.G; if(S.qState(G,'PQ_QJQ')||!inTerm(G,'Y1S2')||week(G)<4||week(G)>10||dateOf(G.day).wd!==4||G.zone!=='dorm_hall'||!fam(Q)||!S.canOpen(G)) return false;   /* 8-3：大一下第 4～10 週，交誼廳，週四晚上 */
        await offer(GM,who,Q,'PQ_QJQ',{ask:'ask',opts:'askOpts',no:'askNo',accept:S.acceptQjq}); if(S.qState(G,'PQ_QJQ')==='declined') G.flags.QJQ_ASKED_YS=true; return true; } ] };
  S.FLOW=FLOW;
  /* 說過話以後（story3d.js talkCharacter：認識以後、閒聊之前問這裡）：第一批五位自己處理（場景或閒聊）＝true；其他十五位照舊＝false */
  S.TALK_OTHER=[];   /* 不是同學的人（例：柏翰）因為同學的事多一句閒聊：fn(GM,who,id,n)→true＝這一次說了（src/pool_more3d.js）*/
  S.talk=async function(GM,who,id,n){ if(!law(GM.G)) return false; S.bind(GM);
    if(!OWN.has(id)){ for(const f of S.TALK_OTHER){ try{ if(await f(GM,who,id,n)) return true; }catch(e){ console.warn('POOL.TALK_OTHER',e); } } return false; }
    for(const f of (FLOW[id]||[])){ if(await f(GM,who,n)) return true; } await S.smallTalk(GM,who,id); return true; };

  /* 4-5「好。」：下一個值班的週六 9:00 到萬才館一樓（在旁邊看法服值班，照現有的流程）*/
  S.planWatch=function(G){ const s=typeof STORY!=='undefined'&&STORY.fafuSat?STORY.fafuSat(G.day):null; if(!s) return false;
    return plan(G,{id:'pool_zjw_fafu_'+s.day,day:s.day,h:9,late:1,place:'萬才館一樓',title:'去看法服值班（萬才館一樓 9:00）',travel:'走過去約 10 分鐘',travelH:0.25,goto:{zone:'wancai',x:2.3,z:3.6,yaw:Math.PI}}); };
  /* 4-4 大二起：祐廷也是法服的＝「（值班表上，她的名字排在你下面那一週。）」（值班的週六，她在萬才館一樓的時候一次）*/
  S.DUTY_EV={ id:'ev_pool_zjw_duty', title:'值班表', participants:[], location:'wancai', trigger:'manual', background:'freeze', dialogue:[{speaker:null,text:L[Z]?L[Z].dutyList:''}],
    after:G=>{ S.mark(G,'zjwDuty'); S.seg(G,Z,'fafu'); } };
  S.dutyListDue=GM=>{ const G=GM.G; if(G.zone!=='wancai'||S.did(G,'zjwDuty')||typeof STORY==='undefined'||!STORY.fafuDuty||!STORY.fafuDuty(G)||!STORY.fafuMember||!STORY.fafuMember(G)) return false; const h=hr(G); return h>=9&&h<12&&S.here(Z)&&has(Z,'FIRST_MET'); };
  /* 8-5 文旦（2026-09-27 週日 21:30，交誼廳）*/
  S.POMELO_EV={ id:'ev_pool_qjq_pomelo', title:'文旦', participants:[Q], location:'dorm_hall', trigger:'manual', background:'blur', dialogue:L[Q]?L[Q].pomelo:[],
    after:G=>{ S.mark(G,'qjqPomelo'); S.seg(G,Q,'pomelo'); } };
  S.pomeloDue=GM=>{ const G=GM.G; if(G.zone!=='dorm_hall'||G.day!==DK('2026-09-27')||S.did(G,'qjqPomelo')||!has(Q,'FIRST_MET')||!S.here(Q)) return false; const h=hr(G); return h>=21.5&&h<23; };
  /* 7-4 展覽（大二下第 15 週，週一～週三，霖澤館一樓穿堂；只有旁白）*/
  S.expoDue=G=>{ const w=dateOf(G.day).wd; return G.zone==='campus'&&inTerm(G,'Y2S2')&&week(G)===15&&w>=1&&w<=3; };

  /* 劇情那一天才擺出來的實體物件（NPC-POOL-ART-1028，LAWWW2-C 2026-10-28）：GLB 載好才加進這一區、才擋導航（載不到就什麼都沒有，不會有看不見的牆）；
     換區域時跟著這一區一起丟掉（加在 zone.group 底下）。key＝ASSETS.manifest 的 bldg.*；(x, z, ry)＝擺放、lv＝哪一層的導航；w、d＝擋住的長寬（公尺，沿模型自己的 x、z）*/
  S.prop=function(E,key,x,z,ry,lv,w,d){ const zone=E&&E.zone; if(!zone||typeof ASSETS==='undefined'||!ASSETS.manifest[key]) return;
    ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true); r.name=key; r.position.set(x,0,z); r.rotation.y=ry||0;
      r.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); (zone.group||E.scene).add(r);
      const nav=E.levels?E.levels[lv|0]:E.nav; if(nav&&w&&d){ nav.blockRect(x,z,w,d,ry||0,0.05); nav._cm=null; } }).catch(e=>console.warn(key,e)); };
  /* ---------- 互動點（第 9 節第 4 點）：只有互動點，實體物件列給 LAWWW2 ---------- */
  S.populate=function(zoneId,GM){ S.bind(GM); const E=GM&&GM.E; if(!E||!Array.isArray(E.interactables)) return; const add=it=>E.interactables.push(it), g=()=>GM.G;
    if(zoneId==='dorm_hall'){
      add({x:-1.75,z:3.2,radius:1.1,prio:0.6,lv:0,label:'領包裹',poolAct:'qjqPick',get hidden(){ return !S.qjqPickDue(g()); }});   /* 舍監室窗口（門廳）*/
      add({x:7.3,z:6.7,radius:1.0,prio:0.4,lv:0,label:'把箱子放進交誼廳的冰箱',poolAct:'qjqFridge',get hidden(){ return !S.qjqFridgeDue(g()); }});   /* 交誼廳販賣機、飲水機那一角（冰箱的實體物件：LAWWW2）*/
      add({x:7.3,z:6.7,radius:1.0,prio:0.3,lv:0,label:'看交誼廳的冰箱',poolAct:'qjqFridgeNote',get hidden(){ return !S.fridgeNoteDue(g()); }});
      add({x:5.4,z:5.3,radius:0.9,prio:0.4,lv:0,label:'看桌上的紙條',poolAct:'qjqNote',get hidden(){ return !S.qjqNoteDue(g()); }}); }   /* 交誼廳的長桌 */
    if(zoneId==='linze'){ add({x:4.6,z:2.05,radius:1.4,lv:0,label:'看補給的桌子',poolAct:'ytTable',get hidden(){ return !S.ytTableDue(g()); }});   /* 霖澤館一樓入口內（補給的桌子：LAWWW2）*/
      if(S.ytTableDue(g())) S.prop(E,'bldg.linze_supply_table',4.6,1.05,0,0,1.9,0.7); }   /* 那一天才擺：玻璃電梯南邊，長邊沿 x（3.7～5.5）；發的人站電梯那一側、拿的人從南邊來，互動點在桌子南邊（原本 z 0.6 會被桌子蓋住）（NPC-POOL-ART-1028，LAWWW2-C）*/
    if(zoneId==='campus') add({x:33,z:-110,radius:2.2,lv:0,label:'看穿堂的照片',poolAct:'ysExpo',get hidden(){ return !S.expoDue(g()); }});   /* 霖澤館一樓的穿堂（地坪 0.9 m）*/
    for(const f of S.POP){ try{ f(zoneId,GM,add,g); }catch(e){ console.warn('POOL.POP',e); } }   /* 第二批以後的互動點（src/pool_more3d.js；按下去 S.ACTS[poolAct]）*/
    S.afterSpawn(GM); S.dedupe(GM); };
  S.POP=[]; S.ACTS={};
  S.interact=async function(it,GM){ const G=GM.G; S.bind(GM); GM.sceneBegin(); try{
      if(it.poolAct==='qjqPick'){ const r=S.qRec(G,'PQ_QJQ'); if(S.qjqPickDue(G)){ r.step='fridge'; r.picked=G.day; r.by=r.satDay+1; if(GM.toast) GM.toast(S.UI.picked,2600); } }
      else if(it.poolAct==='qjqFridge'){ const r=S.qRec(G,'PQ_QJQ'); if(S.qjqFridgeDue(G)){ G.flags.QJQ_HELP=true; S.addDeed(G,Q,L[Q].deedBox); S.finishQ(GM,'PQ_QJQ',r); } }
      else if(it.poolAct==='qjqFridgeNote'){ for(const t of L[Q].fridge) await GM.say(null,t); S.seg(G,Q,'fridge'); }
      else if(it.poolAct==='qjqNote'){ await GM.say(null,L[Q].note); S.mark(G,'qjqNote'); }
      else if(it.poolAct==='ytTable'){ await GM.say(null,S.ytTableLine(G)); S.mark(G,'ytTable'); }
      else if(it.poolAct==='ysExpo'){ await run(GM,YS,L[YS].expo); S.mark(G,'ysExpo'); S.seg(G,YS,'expo'); }
      else if(S.ACTS[it.poolAct]) await S.ACTS[it.poolAct](GM,it);
    } finally { GM.sceneEnd(); } return true; };

  /* ---------- 每 0.5 秒（STORY.TICKS）：樣子、按鈕、郁婷從門口進教室坐下、自動的場景 ---------- */
  S.doorToSeat=function(GM){ const G=GM.G, E=GM.E, n=GM.npc&&GM.npc[Y]; if(!n||G.zone!=='classroom'||n.seat||n.seatTarget||n.lingerGo||n.leaving||!E||!E.zone||!E.zone.seats||!E.moveTo) return false;
    const e=ent(G,Y); if(!e||e.act!=='class') return false; const busy=st=>st.taken||E.npcs.some(m=>m!==n&&(m.seat||m.seatTarget)&&Math.hypot((m.seat||m.seatTarget).x-st.x,(m.seat||m.seatTarget).z-st.z)<0.35)||(E.player&&E.player.seat&&Math.hypot(E.player.seat.x-st.x,E.player.seat.z-st.z)<0.35);
    const pref=e.seat?E.zone.seats.find(s=>s.row===e.seat[0]&&s.col===e.seat[1]):null; const st=(pref&&!busy(pref)&&pref)||E.zone.seats.slice().reverse().find(s=>!busy(s)); if(!st) return false;
    n.frozen=false; n.beh='idle'; n.waypoints=null; n.seatTarget=st; const sit=()=>{ n.seatTarget=null; if(busy(st)){ n.pose=n.idlePose='idle'; return; } if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose='sit'; };
    const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!E.moveTo(n,ap[0],ap[1],sit,st.lv|0)) sit(); return true; };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['pool3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.AUTO=[];   /* fn(GM)→要演的事件或 null（第二批以後）*/
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||!law(G)) return false; S.bind(GM); try{ S.afterSpawn(GM); S.doorToSeat(GM); }catch(e){ console.warn('POOL.afterSpawn',e); }
    if(busy||typeof EVENTS==='undefined'||!EVENTS.run||(GM.E&&GM.E.player&&GM.E.player.busy)) return false;
    let ev=null; if(S.packDue(GM)) ev=S.PACK_EV; else if(S.pomeloDue(GM)) ev=S.POMELO_EV; else if(S.dutyListDue(GM)) ev=S.DUTY_EV;
    else for(const f of S.AUTO){ try{ ev=f(GM)||null; }catch(e){ console.warn('POOL.AUTO',e); ev=null; } if(ev) break; }   /* 第二批以後的自動場景（src/pool_more3d.js）*/
    if(!ev) return false; busy=true; if(GM.sceneBegin) GM.sceneBegin(); Promise.resolve().then(()=>EVENTS.run(ev)).catch(e=>console.warn('POOL',e)).finally(()=>{ busy=false; if(GM.G===G){ if(GM.sceneEnd) GM.sceneEnd(); if(GM.autosave) GM.autosave(); } }); return true; };

  /* ---------- 2-7 手機 ---------- */
  const tz=(G,d)=>typeof STORY!=='undefined'&&STORY.tzOffset?(+STORY.tzOffset(G,d)||0):0;
  const loc=(G,d,h)=>{ const t=d*24+h+tz(G,d), dd=Math.floor(t/24); return {day:dd,h:t-dd*24}; };   /* 臺灣時間 → 玩家的當地時間（國外照時差）*/
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=(id,t)=>t&&typeof t==='object'?(t.n!=null?{th:'p:'+id,who:null,text:t.n}:Object.assign({th:'p:'+id,from:id},t)):({th:'p:'+id,from:id,text:t});   /* {text,fold}＝錄音、語音（點開看旁白）；{n}＝對話串裡的旁白（第二批以後）*/
  S.dm=dm;
  /* 劇情的訊息（各人的表，不算在上限裡）：d、h＝臺灣時間；那一天的前一天到後一天之間才排（過了就不補，2-10）；沒有聯絡方式不送（noContact：全班都會收到的那種）*/
  S.story=function(G,id,d,h,texts,tag,o){ o=o||{}; if(d==null||typeof PHONE==='undefined'||sent(G,tag)) return false; if(!o.noContact&&!contact(G,id)) return false; const l=loc(G,d,h); if(G.day<l.day-1||G.day>l.day+1) return false;
    const items=[].concat(texts).map(t=>dm(id,t)); if(o.ask) items[items.length-1].ask=o.ask; return PHONE.at(G,l.day,l.h,items,tag); };
  /* 劇情以外的私訊（閒聊型）的上限：有聯絡方式；二十位加起來七天內一則；同一個人三十天內一則；考試週（期中、期末）不送 */
  S.chatOK=function(G,id){ if(!/^pool_/.test(id)||!contact(G,id)) return false; const t=T_(G); if(t&&t.exam) return false; const A=S.rec(G).chat;
    if(A.some(x=>G.day-x.day<7)) return false; if(A.some(x=>x.id===id&&G.day-x.day<30)) return false; return true; };
  S.chat=function(G,id,texts,tag,h){ if(!S.chatOK(G,id)||typeof PHONE==='undefined'||sent(G,tag)) return false; const hh=h!=null?h:Math.min(23.5,hr(G)+0.5);
    if(!PHONE.at(G,G.day,hh,[].concat(texts).map(t=>dm(id,t)),tag)) return false; S.rec(G).chat.push({id,day:G.day,tag:tag||null}); return true; };
  S.ask=(id,opts)=>({id,opts:opts.map(o=>({t:o[0],say:[{from:o.from,text:o[1]}]}))});
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined'||typeof CALENDAR==='undefined') return; const F=G.flags||{}, R=S.rec(G);
    /* 黃郁婷 */
    if(F.YT_FEE_LATER&&R.feeDay!=null) S.story(G,Y,R.feeDay,21,L[Y].fee,'pool_yt_fee',{noContact:true,ask:{id:'pool_yt_fee',opts:[{t:L[Y].feeOpt,say:[{from:Y,text:L[Y].feeReply}]}]}});   /* 5-1 班費（全班都會收到的那種）*/
    { const d=termDay('Y2S1',1,1), d3=S.yt2Day(); if(d!=null&&!S.qState(G,'PQ_YT2')&&!R.did.yt2Ask&&contact(G,Y)&&S.canOpen(G)){   /* 5-5 前一週週日 21:00 */
        if(S.story(G,Y,d-1,21,L[Y].ask2,'pool_yt2_ask',{ask:{id:'pool_yt2_ask',until:d3!=null?d3*24+8:undefined,opts:[{t:L[Y].ask2Opts[0]},{t:L[Y].ask2Opts[1],say:[{from:Y,text:L[Y].ask2No}]}]}})) R.did.yt2Ask=G.day; } }
    S.story(G,Y,termDay('Y3S1',2,1),21,L[Y].y3,'pool_yt_y3'); S.segSent(G,Y,'y3','pool_yt_y3');
    { const pass=L[Y].pass.concat([F.YT_JUDGE?L[Y].passJudge:(F.YT_WHY?L[Y].passWhy:L[Y].passQuiet)]);   /* 5-6 司法特考放榜（2029 年 10 月）*/
      S.story(G,Y,DK('2029-10-19'),18,pass,'pool_yt_pass',{ask:{id:'pool_yt_pass',opts:L[Y].passOpts.map(o=>({t:o[0],say:[{from:Y,text:o[1]}]}))}}); S.segSent(G,Y,'pass','pool_yt_pass'); }
    /* 曾靖雯 */
    { const r=S.qRec(G,'PQ_ZJW'); if(r&&r.state==='open'&&r.step==='court'&&r.outDay!=null) S.story(G,Z,r.outDay-1,21,L[Z].courtEve,'pool_zjw_eve'); }
    S.story(G,Z,termDay('Y2S1',1,1),6.25,L[Z].fafuJoin,'pool_zjw_fafu'); S.segSent(G,Z,'fafuJoin','pool_zjw_fafu');
    S.story(G,Z,termDay('Y3S1',10,3),21,L[Z].y3q,'pool_zjw_y3',{ask:{id:'pool_zjw_y3',opts:L[Z].y3Opts.map(o=>({t:o[0],say:[{from:Z,text:o[1]}]}))}}); S.segSent(G,Z,'y3','pool_zjw_y3');
    { const gd=DK('2029-06-02'); if(gd!=null){ S.story(G,Z,gd-1,6+10/60,L[Z].gradEve,'pool_zjw_grad_eve'); S.segSent(G,Z,'gradEve','pool_zjw_grad_eve');
        if(!S.did(G,'zjwLast')&&(G.day>gd||(G.day===gd&&hr(G)>=7.5))) S.story(G,Z,gd,8,L[Z].gradMiss,'pool_zjw_grad_miss'); } }   /* 典禮當天沒去傅鐘：08:00 */
    { const ab=typeof STORY!=='undefined'&&STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null, RD=ab&&STORY.ROUTE_DATES&&STORY.ROUTE_DATES[ab];   /* 4-7 國外：出發後第三週的週一，她的早上六點（照時差）*/
      if(RD&&fam(Z)){ let d=DK(RD.dep); if(d!=null){ d+=14; while(dateOf(d).wd!==1) d++; if(STORY.abroad(Object.assign({},G,{day:d}))) S.story(G,Z,d,6,L[Z].abroad,'pool_zjw_abroad'); } }
      const dl=typeof PG!=='undefined'&&PG.delayed?PG.delayed(G):!!ab;   /* 延畢＝交換延畢（日本、美國路線）或大四下被當（FAIL_DELAY），同 src/postgrad3d.js 的 PG.delayed */
      if(dl&&CALENDAR.termDays){ const y5=CALENDAR.termDays('Y5S1'); if(y5) S.story(G,Z,y5.from,6.5,L[Z].y5,'pool_zjw_y5'); } }   /* 延畢：大五上第 1 週 06:30 */
    /* 林采潔 */
    if(fam(C)) S.story(G,C,DK('2027-04-15'),25.5,L[C].night,'pool_cj_night'); S.segSent(G,C,'night','pool_cj_night');   /* 大二某一晚 01:30（文學獎截稿前：大二下 4 月）*/
    { const a=F.CJ_ADVICE==='law'?L[C].award.law:(F.CJ_ADVICE==='motive'?L[C].award.motive:L[C].award.other);   /* 大二下 5 月，校內文學獎放榜 */
      S.story(G,C,DK('2027-05-21'),22,a,'pool_cj_award',{ask:{id:'pool_cj_award',opts:L[C].awardOpts.map(o=>({t:o[0],say:[{from:C,text:o[1]}]}))}}); S.segSent(G,C,'award','pool_cj_award'); }
    { const ab=typeof STORY!=='undefined'&&STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null, RD=ab&&STORY.ROUTE_DATES&&STORY.ROUTE_DATES[ab];   /* 大三下（祐廷在國外）：出發後三十天、她半夜傳 */
      if(RD){ const d=DK(RD.dep); if(d!=null&&STORY.abroad(Object.assign({},G,{day:d+30}))) S.story(G,C,d+30,23.5,L[C].abroad,'pool_cj_abroad',{ask:{id:'pool_cj_abroad',opts:[{t:L[C].abroadOpt,say:[{from:C,text:ab==='JP'?L[C].abroadJP:L[C].abroadUS}]}]}}); }
      S.segSent(G,C,'abroad','pool_cj_abroad'); }
    /* 鄭元碩（畢業以後各一則）*/
    { const v=(F.YS_GO||F.YS_REMEMBER)?L[YS].y3.go:(F.YS_SAFE?L[YS].y3.safe:L[YS].y3.none); S.story(G,YS,DK('2027-10-15'),20,v,'pool_ys_y3'); S.segSent(G,YS,'y3','pool_ys_y3');
      S.story(G,YS,DK('2029-04-16'),16+25/60,L[YS].y4,'pool_ys_y4'); S.segSent(G,YS,'y4','pool_ys_y4'); }
    /* 邱家齊 */
    { const r=S.qRec(G,'PQ_QJQ'); if(r&&r.satDay!=null){ if(r.picked!=null) S.story(G,Q,r.satDay,20,L[Q].sat,'pool_qjq_sat'); else if(r.state==='lapsed') S.story(G,Q,r.satDay+1,21,L[Q].back,'pool_qjq_back'); } }   /* 領到了＝週六 20:00；答應了沒領到＝週日 21:00 */
    { const d=DK('2026-09-27'); if(d!=null&&!S.did(G,'qjqPomelo')) S.story(G,Q,d-1,21,S.kaiHere(G)?L[Q].pomeloEve:L[Q].pomeloEveNoKai,'pool_qjq_pomelo'); }   /* 文旦前一天 21:00 */
    S.story(G,Q,DK('2027-09-15'),21,L[Q].moon,'pool_qjq_moon'); S.segSent(G,Q,'moon','pool_qjq_moon');   /* 祐廷大三上中秋 */
    { const T=CALENDAR.termDays('Y2S2'); if(T&&G.day>T.to&&!sent(G,'pool_qjq_tainan')&&Array.isArray(G.outings)&&G.outings.some(q=>q&&q.day===G.day&&q.state!=='missed'&&/台南/.test(String(q.place||'')+String(q.title||'')))) S.story(G,Q,G.day,7,L[Q].tainan,'pool_qjq_tainan'); } };   /* 之後真的人在台南（去台南找沛珊…）：當天 07:00 */
  /* 5-5 的私訊回了「好。」＝掛事、排報到桌；「那天早上我有課。」＝婉拒 */
  S.ANSWER={};   /* 第二批以後：手機回覆的 ask id → fn(G,m,o,k)（src/pool_more3d.js）*/
  S.onAnswer=function(G,m,o,k){ if(m&&m.ask&&S.ANSWER[m.ask.id]){ try{ S.ANSWER[m.ask.id](G,m,o,k); }catch(e){ console.warn('POOL.ANSWER',e); } return; }
    if(!m||!m.ask||m.ask.id!=='pool_yt2_ask'||S.qState(G,'PQ_YT2')) return; const gm={G,toast:typeof GAME!=='undefined'&&GAME&&GAME.toast?GAME.toast:null}; if(k===0) S.acceptYt2(gm); else S.declineQ(G,'PQ_YT2'); };

  /* ---------- 房間物品 ---------- */
  S.room=function(G,Lst){ const F=G.flags||{};
    if(F.QJQ_FISH&&!F.ROOM_Y2) Lst.push(['冰箱裡的虱目魚丸',L[Q].fish]);   /* 8-1：房間的冰箱多一包（搬到第二個房間以前）*/
    { const r=S.qRec(G,'PQ_YT1'); if(r&&r.state==='done'&&G.day>(r.doneDay!=null?r.doneDay:r.day)) Lst.push(['考前補給包的小卡',L[Y].card]); }   /* 5-3：隔天在霖澤館一樓拿到 */
    if(F.YS_REMEMBER) Lst.push(['元碩拍的背影',L[YS].photoLook]);   /* 7-2 秘密「你拍的那張背影，我記得。」*/
    if(F.CJ_BOOK) Lst.push(['采潔的《第三章》',F.CJ_ADVICE==='law'?L[C].bookLookLaw:L[C].bookLook]); };   /* 6-5 */

  /* ---------- 2-9 ev_pool_greet ---------- */
  S.greetTarget=function(G,GM){ GM=GM||GMr; if(!GM||!GM.npc) return null; for(const id in GM.npc){ if(/^pool_/.test(id)&&typeof SOCIAL!=='undefined'&&SOCIAL.reveal(id)==='RECOGNIZABLE'&&!(G.flags&&G.flags['greet_'+id])) return id; } return null; };
  S.greetPlace=function(G,GM){ const id=S.greetTarget(G,GM); const c=id&&typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c) return '教室'; if(c.poolClass) return '教室';   /* 在教室出現的人（必修課）：原句 */
    const e=ent(G,id); return (e&&e.greetAt)||c.poolPlace||'教室'; };   /* 表上的地點；有兩個地點的人照現在這一筆（邱家齊在校園＝總圖門口、馬佳蓉在社博＝社團博覽會）*/

  /* ---------- 2-10 舊存檔：讀檔換名、說過秘密的記成「沒選」---------- */
  S.renameText=function(t){ if(typeof t!=='string') return t; let s=t; for(const id in D.RENAME){ const [a,b]=D.RENAME[id]; if(s.indexOf(a)>=0) s=s.split(a).join(b); } for(const [a,b] of (Array.isArray(D.RENAME_MORE)?D.RENAME_MORE:[])){ if(s.indexOf(a)>=0) s=s.split(a).join(b); } return s; };   /* RENAME_MORE：同一個人改第二次名（AA_527 1-7 pool_19）*/
  S.migrate=function(s){ if(!s||typeof s!=='object') return 0; let n=0; const fx=(o,k)=>{ if(!o||typeof o!=='object') return; const v=o[k]; if(typeof v!=='string') return; const w=S.renameText(v); if(w!==v){ o[k]=w; n++; } };
    const msg=m=>{ if(!m||typeof m!=='object') return; fx(m,'text'); fx(m,'name'); if(m.ask&&Array.isArray(m.ask.opts)) for(const o of m.ask.opts){ fx(o,'t'); if(o&&Array.isArray(o.say)) for(const y of o.say) fx(y,'text'); } };
    if(Array.isArray(s.msgs)) s.msgs.forEach(msg); const P=s.phone; if(P&&typeof P==='object'){ if(Array.isArray(P.q)) for(const q of P.q){ msg(q); if(q&&Array.isArray(q.items)) q.items.forEach(msg); } if(P.groups&&typeof P.groups==='object') for(const k in P.groups) fx(P.groups[k],'name'); }
    if(Array.isArray(s.outings)) for(const q of s.outings) for(const k of ['title','place','back','verb','no']) fx(q,k);
    if(Array.isArray(s.invites)) for(const iv of s.invites) fx(iv,'label');
    const mem=s.social&&s.social.mem; if(mem&&typeof mem==='object') for(const id in mem) if(Array.isArray(mem[id])) for(const m of mem[id]) fx(m,'note');
    if(Array.isArray(s.memo)) for(const m of s.memo) fx(m,'t'); if(Array.isArray(s.notes)) for(const m of s.notes){ fx(m,'title'); fx(m,'body'); } fx(s,'goal');
    /* 說過秘密（舊的「其實……」）的第一批：不重問，選項記成「沒選」（後面照「沒選」那一版）*/
    if(mem&&typeof mem==='object'&&s.flags&&typeof s.flags==='object'){ if(!s.pool||typeof s.pool!=='object'||Array.isArray(s.pool)) s.pool={}; if(!s.pool.secret||typeof s.pool.secret!=='object') s.pool.secret={};
      for(const id of OWN){ const M=mem[id]; if(!Array.isArray(M)||!M.some(m=>m&&m.tag==='SHARED_SECRET')) continue;   /* 第一批＋第二批以後（S.extend）一樣：選項記成「沒選」*/ if(s.pool.secret[id]==null){ s.pool.secret[id]='none'; n++; } if(id===Z&&s.flags.ZJW_HELP==null){ s.flags.ZJW_HELP='none'; } } }
    return n; };

  /* ---------- 接線（載入時一次）---------- */
  S.apply();
  if(typeof STORY_EVENTS!=='undefined') for(const e of [S.COURT_EV,S.DESK_EV,S.DAY_EV,S.PACK_EV,S.POMELO_EV,S.TOUR_EV,S.DUTY_EV]) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  if(typeof OUT!=='undefined'&&OUT.BG&&!OUT.BG.court_hall) OUT.BG.court_hall={label:'臺北地方法院',image:null};   /* 4-3：背景還沒有圖＝深色底（MISSING_EXTERNAL_ART，BB 跟使用者要）*/
  S.register();
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)) PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAnswer(G,m,o,k));
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM));
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,Lst)=>S.room(G,Lst));
    if(STORY.populate&&!STORY._poolPopulate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ S.populate(zoneId,GM); }catch(e){ console.warn('POOL.populate',e); } return r; }; STORY._poolPopulate=true; }
    if(STORY.interact&&!STORY._poolInteract){ const o0=STORY.interact; STORY.interact=async function(it,GM){ if(it&&it.poolAct) return S.interact(it,GM); return o0.apply(this,arguments); }; STORY._poolInteract=true; } }
  /* 林采潔 新生導覽版：導覽走完（CLS.attendActivity）以後 */
  if(typeof CLS!=='undefined'&&CLS.attendActivity&&!CLS._poolTour){ const a0=CLS.attendActivity; CLS.attendActivity=Object.assign(async function(GM,a){ const r=await a0.apply(this,arguments);
      try{ if(a&&a.id==='lib_tour_y1s1'&&GM&&GM.G&&S.tourMeetDue(GM.G)&&typeof EVENTS!=='undefined'&&EVENTS.run){ S.bind(GM); await EVENTS.run(S.TOUR_EV); } }catch(e){ console.warn('POOL tour',e); } return r; },a0); CLS._poolTour=true; }   /* Object.assign(…,a0)：保留前面包過的記號（clubfair3d.js 的 _fair、fit3d.js 的 _fit）*/
  S.wrapAnon();
  return S;
})();
