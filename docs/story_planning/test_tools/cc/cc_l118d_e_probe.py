"""CC（帳號 A）11-11：L118D_E——118 巷「課後午餐邀約」瀏覽器探針（BB：E 午餐邀約十項照規格逐項）。
規格：docs/handoff/user_specs/L118_LUNCH_1111.md（使用者原文）第十二節十項特別測試＋第十節快速略過。程式 src/l118_lunch3d.js（檔頭規則）、資料 src/data/l118_lunch.js、
  下課選單 src/classes3d.js CLS.afterMenu（一開頭叫 LUNCH118.afterClass）、店 src/lane118.js、src/data/lane118_shops.js、src/data/l118_shop_layouts.js；玩家主動約 src/invites3d.js、src/data/invites.js。
BB 原文：「E 午餐邀約十項照規格逐項；『好，走。』快速略過第一次不能有、看過一次才出現；進店同桌（辛亥韓食舊室內只有兩張高腳椅：記四人時是併桌還是退回 2D）。」
  另外（屬於邀約的）：「交往中約午餐義大麵屋不列公休的週一；約飲料店的見面點在店門口。」
Windows＋GPU（PC runner）≠ iPhone；雲端 SwiftShader 只做探針自檢。不用 ?turbo（網址有就拿掉）、不瞬移；讀檔、設好友值只當前置（log 印 [前置／捷徑]）。觸控一律 CDP（playlib.touch_tap）。
探針包了 GAME.say／choose／money／enter／caption 和 LUNCH118.afterClass／plan／settle／seatParty、CLS.goClass／attend／afterMenu／slotFill 只為了記錄（照樣呼叫原本的），不改內容。

【捷徑】觸發是機率（S.rnd＝G.day＋鹽）：先用 LUNCH118.plan（不改存檔；在目前存檔的複本上把日子改成候選日、那一堂記成上過、時間＝下課）找出「會邀」的日子，當前置。
  實際那一天照真實流程跑：讀檔到那天上課前 15 分鐘、在那間教室 →【真的點】手機「今天」那一堂的「直接去上課」→ 上課（對話框右上「略過 »」是玩家看得到的鍵，有就按，沒有就點對話；
  課堂裡的選單選第一項）→ 下課 → 邀約那一句 → 選項照文字點（觸控）→ 進店（3D：GM.enter l118_<id>）→ 午餐對話點完 → 下課選單（記選項；選「先自由活動」）。
  那一天下課演了課後劇情（afterClass 事件，規則＝那天不邀）＝前置不符，換下一個候選日（最多 RETRY 次，預設 2）。
【前置】好友值：讀檔後用 SOCIAL.meet／SOCIAL.rel 設（REL=FRI 預設：熟悉 50、信任 35、自在 20＝FRIEND 級距 3；ACQ/FAM/CLO 可選），GAME.snapshot() 再讀一次。
PARTS（逗號分隔；預設全部；括號是 PC 預估分鐘）：
  MAIN   （E3 E4 E5 E6 E9，約 8）第一次邀約：找「會邀、同行 ≥2 人、不是辛亥韓食」的日子（優先 3 位同行＝四人）→ 照上面流程接受 → 進店截圖（每人座位、桌號）→ 結算。
         判定：③ 同一天只有一場（afterClass 有邀的只有一次、邀約選單只出一次；下課選單沒有第二次邀約）④ 含玩家 ≤4 人 ⑤ 錢只扣一次、＝玩家那一樣的菜單價（LANE118_SHOPS）
         ⑥ G.slots 前後一樣（沒有 slotFill／slotUse）、下午那一堂沒被跳過（note 沒有 skip、下課選單有「直接去下一堂」或那一堂還沒上）⑨ 重新整理 → 標題「繼續（自動存檔）」→ 同一天：inv.day／done＝今天、
         【捷徑】再叫一次 LUNCH118.afterClass（＝下課選單那一個掛勾）不邀、錢不變。另外「好，走。」（直接到吃完）第一次不能出現。
  SKIP   （E8＋快速略過，約 11）第一天完整吃一次（記選單：不能有略過）→【前置】同一份進度跳到下一個「會邀、可以略過」的日子 → 選單要有略過（兩次選單的按鈕文字並列）→ 選略過：
         錢只扣一次＝那一份、同行每人熟悉度＝settle 回報的點數（每週上限 6）、inv.done＝今天、seen 不變、n+1、沒有進店（沒有 GAME.enter l118_）、skipLine 那一句；重新整理 → 繼續：錢、熟悉度不再變。
  DECL   （E7，約 9）第一天婉拒（錢、熟悉度都不變；decl[他]=1、別人不變；他回一句）→【前置】跳到下一個「別人發起」的日子 → 接受：decl[那個人]=0、decl[第一天的人] 還是 1。
  TABLE  （同桌，約 7）辛亥韓食（tea，舊室內只有兩張高腳椅）四人（玩家＋3）那一天：接受 → 進店 → 每人座位、是否同一桌、有沒有人沒位子、是不是退回 2D（ADV／區域不在）。
  E1     （約 5）週二上午大一國文（博思，不是法律系館）照真實流程上完：沒有邀約、inv.day 沒記；【函式】週四下午民總（法律系館、下午）LUNCH118.lawAm＝false。
  E2     （約 5）一個都不認識（新開局旗標 LAW_START_DAY／MAIN_D1、不認識阿哲、沒有 FIRST_MET）上週三刑總：沒有邀約、plan＝nobody、inv.day＝今天、hit＝false。
  E10    （約 3）店門口一個人點餐照常：讀檔在 118牛排（l118_dian）店裡 → 走到點餐的地方（觸控點地）→ 按互動鍵 → 點第一樣 → 只扣那一樣的錢。舊存檔另有 C 探針。
  DATE   （約 4）交往中（dating_heroine_01）週五手機「朋友」→ 以安「約」→ 吃飯…→ 去義大麵屋吃午餐：時間清單、「其他日子…」裡的週一（義大麵屋週一公休）不能約成；週二照常。
         判定＝週一沒有可選的時間（列出來但灰掉也記下來，BB 看「不列」的字面）；選了灰掉的會說原因、不排進邀約。
  DRINK  （約 4）手機約以安「散步…」→ 喝不喝咖啡（drink_a，外帶店）今天 14:00：答應 →【前置】13:47 讀到 118 巷 → 她站的地方＝店門口（meetAt：店面外 1.6 m、店面中間；不是巷口落點）；果茶社（drink_b）同樣記 meetAt。
  STORYBURST（約 6；不在預設裡，BB 06:13）一般劇情對話的連點：網址加 ?tapguard；找會邀的日子照真實流程上課 → 同學開口邀約那一句一出來，在對話框中央用觸控連點 BURSTN 下（預設 20）、
         每 BURSTMS ms（預設 150）一路點到選項出現。判：選項沒有被點掉（期間沒有 pick、選單還在）；每一下記 pointerdown 點到的元素、按鈕字、距選單出現幾 ms。之後照字選「接受」走完。
別名：E3,E4,E5,E6,E9→MAIN；E7→DECL；E8→SKIP。
舊版（D34）：779ddd650 沒有 LUNCH118（午餐邀約系統整個沒有）：MAIN／SKIP／DECL／TABLE 會 FAIL「沒有午餐系統」（只做這一項就收）；E1／E2 舊版本來就不會邀（PASS 不代表什麼，只當對照）；
  DATE：779ddd650 的義大麵屋是週三休、days=[1,2,4,5]＝當時週一可以約（那時候是對的）；真正的對照是合併前一個 f247bc77f（店資料已改週一休、days 還是 [1,2,4,5]＝週一約得成＝FAIL）。
  DRINK：779ddd650 沒有 drink_a／drink_b 的地點（FAIL：地點不在）。
環境變數：LW_TESTS SHA PARTS REL RETRY BURSTN BURSTMS EVQUIET（1＝上課那天也關條件事件）ORIENT（land 預設／port）D0 D1（找日子的範圍，預設大一上第 6～92 天）WHO（DATE／DRINK 的人，預設 heroine_01）
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=MAIN,SKIP python3 cc_l118d_e_probe.py <url>/index.html <out>
每項一行 PASS／FAIL，最後 ALL PASS 或 FAILED；exit 0／1。"""
import os, sys, json, asyncio, time, copy, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
URL = URL.replace('?turbo&', '?').replace('&turbo', '').replace('?turbo', '')
os.makedirs(OUT, exist_ok=True)
ENV = os.environ.get
SHA = (ENV('SHA') or '')[:9]
ALIAS = {'E3': 'MAIN', 'E4': 'MAIN', 'E5': 'MAIN', 'E6': 'MAIN', 'E9': 'MAIN', 'E7': 'DECL', 'E8': 'SKIP'}
PARTS = []
for _p in (ENV('PARTS') or 'MAIN,SKIP,DECL,TABLE,E1,E2,E10,DATE,DRINK').split(','):
    _p = ALIAS.get(_p.strip().upper(), _p.strip().upper())
    if _p and _p not in PARTS: PARTS.append(_p)
REL = (ENV('REL') or 'FRI').upper()
RETRY = int(ENV('RETRY') or 2)
EVQUIET = ENV('EVQUIET') == '1'
LAND = (ENV('ORIENT') or 'land') != 'port'
D0, D1 = int(ENV('D0') or 6), int(ENV('D1') or 92)
WHO = ENV('WHO') or 'heroine_01'
R = L.Run('l118d_e', OUT)
J = lambda o: json.dumps(o, ensure_ascii=False, default=str)
SHOTN = [0]
LV = {'ACQ': [10, 0, 0], 'FAM': [30, 10, 10], 'FRI': [50, 35, 20], 'CLO': [70, 55, 50]}
AFTER = ('先自由活動', '直接去下一堂', '先去吃飯', '下一堂不去', '在附近讀書')


async def shot(pg, label):
    SHOTN[0] += 1; p = os.path.join(OUT, 'l118e_%03d_%s.png' % (SHOTN[0], label))
    try: await pg.screenshot(path=p)
    except Exception as e: R.note('截圖失敗 %s：%r' % (label, e))
    return os.path.basename(p)


# ---------- 前置存檔 ----------
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False, 'YT_MET_JOB': True}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore', 'classroom', 'dorm', 'dorm_hall', 'lane118', 'boya', 'gongtong', 'putong')


def mkstate(d, h, zone, flags=None, drop=()):
    f = dict(BASEF, **(flags or {}))
    for k in drop: f.pop(k, None)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': f}
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}}
    return st


# ---------- 記錄鉤子（只記、照樣呼叫原本的）----------
HOOK = r"""(()=>{ if(window.__LE&&window.__LE.g===GAME) return {again:true}; const W=window.__LE={g:GAME,log:[],mute:false};
  const now=()=>Math.round(performance.now());
  const st=()=>{ try{ const G=GAME.G; return {h:+(+G.hour).toFixed(3),d:G.day,z:G.zone,m:G.money}; }catch(e){ return {}; } };
  const push=o=>{ if(W.mute&&/^lunch\./.test(o.k)) return o; const e=Object.assign({t:now()},st(),o); W.log.push(e); if(W.log.length>8000) W.log.splice(0,3000); return e; };
  const sumP=P=>{ if(!P) return null; if(P.no) return {no:P.no,el:P.el||null,top:P.top||null,p:P.p||null,who:P.who||null,shop:P.shop||null};
    return {who:P.who,mates:P.mates,party:P.party,shop:P.shop,shopName:P.shopName,item:P.item,price:P.price,poor:!!P.poor,grp:P.grp&&P.grp.id,sp:P.sp?{id:P.sp.id,kind:P.sp.kind,first:!!P.sp.first}:null,el:P.el,top:P.top,p:P.p,h0:P.h0,hA:P.hA,hEnd:P.hEnd,lim:P.lim}; };
  W.sumP=sumP; W.push=push;
  const wrap=(o,fn,pre,post)=>{ const f0=o&&o[fn]; if(typeof f0!=='function') return false; o[fn]=function(){ let e=null; try{ e=pre?pre.apply(null,arguments):null; }catch(x){}
      const r=f0.apply(this,arguments); if(post){ if(r&&typeof r.then==='function') r.then(v=>{ try{ post(e,v); }catch(x){} },err=>{ push({k:'reject',fn,err:String(err)}); }); else { try{ post(e,r); }catch(x){} } } return r; }; return true; };
  const ok={};
  ok.say=wrap(GAME,'say',(w,t)=>push({k:'say',who:w?(w.name||String(w)):null,cid:w&&w.charId||null,text:String(t)}));
  ok.choose=wrap(GAME,'choose',o=>{ W.menuT=now(); W.menuOpts=(o||[]).map(x=>x&&(x.t||x.text)); return push({k:'choose',opts:W.menuOpts,dims:(o||[]).map(x=>!!(x&&x.dim)),hints:(o||[]).map(x=>(x&&x.hint)||'')}); },(e,i)=>{ const t=now(); push({k:'pick',i,txt:e&&e.opts?e.opts[i]:null,dt:W.menuT!=null?t-W.menuT:null}); W.menuT=null; W.menuOpts=null; });
  document.addEventListener('pointerdown',ev=>{ const el=ev.target, b=el&&el.closest?el.closest('#choices button'):null;
    push({k:'down',x:Math.round(ev.clientX),y:Math.round(ev.clientY),tgt:el?(el.id||(el.className&&String(el.className).slice(0,30))||el.tagName):null,btn:b?((b.firstChild&&b.firstChild.nodeType===3)?b.firstChild.textContent:(b.textContent||'')).trim().slice(0,30):null,sinceMenu:W.menuT!=null?now()-W.menuT:null,menu:W.menuOpts?W.menuOpts.slice(0,4):null}); },true);
  W.guard={tapTooSoon:typeof GAME.tapTooSoon==='function',webdriver:!!navigator.webdriver,q:location.search};
  ok.money=wrap(GAME,'money',(v,why)=>push({k:'money',v:+v,why:why||''}));
  ok.enter=wrap(GAME,'enter',z=>push({k:'enter',to:String(z)}),e=>push({k:'entered',to:e&&e.to}));
  ok.caption=wrap(GAME,'caption',(w,t)=>push({k:'cap',text:String(t==null?'':t)}));
  ok.toast=wrap(GAME,'toast',t=>push({k:'toast',text:String(t)}));
  if(typeof LUNCH118!=='undefined'){ const Lm=LUNCH118;
    ok.after=wrap(Lm,'afterClass',(GM,key,a)=>push({k:'lunch.after',key,ev:!!(a&&a.ev),inv0:JSON.parse(JSON.stringify((GM.G.l118&&GM.G.l118.inv)||null))}),(e,v)=>push({k:'lunch.afterEnd',key:e&&e.key,ret:v===undefined?null:v}));
    ok.plan=wrap(Lm,'plan',null,(e,Pl)=>push({k:'lunch.plan',P:sumP(Pl)}));
    ok.settle=wrap(Lm,'settle',(GM,Pl,o)=>push({k:'lunch.settle',skip:!!(o&&o.skip),sp:o&&o.sp?o.sp.id:null}),(e,out)=>push({k:'lunch.settled',out:out?{price:out.price,item:out.item,pts:out.pts}:null}));
    ok.seat=wrap(Lm,'seatParty',null,(e,n)=>push({k:'lunch.seated',n}));
    ok.stage=wrap(Lm,'stage3d',null,(e,v)=>push({k:'lunch.stage3d',v}));
    ok.quick=wrap(Lm,'quick',()=>push({k:'lunch.quick'}));
    ok.show=wrap(Lm,'show',()=>push({k:'lunch.show'})); }
  if(typeof CLS!=='undefined') for(const fn of ['goClass','attend','afterMenu','lunchBreak','slotFill','slotUse']) ok[fn]=wrap(CLS,fn,(GM,a)=>push({k:'cls',fn,key:a&&a.key?a.key:(typeof a==='string'?a:null)}),(e,v)=>push({k:'clsEnd',fn,ret:(v===undefined||typeof v==='object')?null:v}));
  return ok; })()"""
LOGN = "((window.__LE&&window.__LE.log)||[]).length"
LOGS = "(n=>((window.__LE&&window.__LE.log)||[]).slice(n))"
HAS = "typeof LUNCH118!=='undefined'&&typeof L118_LUNCH_DATA!=='undefined'"
DATA = "(()=>{ const d=L118_LUNCH_DATA; return {opts:d.options, who:Object.keys(d.who), names:Object.fromEntries(Object.keys(d.who).map(k=>[k,d.who[k].name])), skipLine:d.skipLine, window:d.window}; })()"
SETREL = r"""(([ids,v])=>{ const G=GAME.G; G.contacts=G.contacts||{}; const out={}; for(const id of ids){ SOCIAL.meet(id,'CC 探針前置'); const r=SOCIAL.rel(id); r.fam=v[0]; r.trust=v[1]; r.comf=v[2]; G.contacts[id]=G.contacts[id]!=null?G.contacts[id]:G.day; out[id]=SOCIAL.stage(id); } return out; })"""
STATE = r"""(ids=>{ const G=GAME.G, I=(G.l118&&G.l118.inv)||null, R=CLS.rec(G), c=o=>o==null?null:JSON.parse(JSON.stringify(o)); const fam={};
  for(const id of ids){ const r=G.social&&G.social.rel&&G.social.rel[id]; fam[id]=r?{fam:r.fam,trust:r.trust,comf:r.comf,stage:SOCIAL.stage(id)}:null; }
  return {day:G.day,h:+(+G.hour).toFixed(3),zone:G.zone,money:G.money,fam,inv:c(I),slots:c(G.slots),done:c(R.done||{}),skipNotes:Object.keys(R.note||{}).filter(k=>/skip/.test(k)),
    l118:G.l118?{last:c(G.l118.last),ate:c(G.l118.ate),d:c(G.l118.d||null),n:c(G.l118.n||null)}:null,doneToday:typeof LUNCH118!=='undefined'?LUNCH118.doneToday(G):null}; })"""
FIND = r"""(([d0,d1])=>{ if(typeof LUNCH118==='undefined') return null; const W=window.__LE; if(W) W.mute=true; const out=[]; const base=JSON.stringify(GAME.G);
  try{ for(let d=d0; d<=d1; d++){ const c=CALENDAR.dateOf(d), wd=c.wd===7?0:c.wd; if(wd<1||wd>5) continue; if(CALENDAR.holiday&&CALENDAR.holiday(d)) continue;
      const G2=JSON.parse(base); G2.day=d; G2.weekday=wd; G2.hour=8; let its=[]; try{ its=CLS.dayItems(G2); }catch(e){ continue; }
      const it=its.find(q=>LUNCH118.lawAm(G2,q)); if(!it) continue;
      G2.hour=it.t1; G2.zone=(it.room&&it.room.zone)||G2.zone; G2.pos=null; CLS.rec(G2).done[it.key]=1;
      let Pl=null; try{ Pl=LUNCH118.plan({G:G2,E:null,D:GAME.D,npc:{}},it); }catch(e){ Pl={no:'err:'+e}; }
      const T=CALENDAR.termOf(d), sk=Pl&&!Pl.no?LUNCH118.canSkip(Object.assign({},G2,{l118:Object.assign({},G2.l118||{},{inv:Object.assign({},(G2.l118||{}).inv||{},{seen:Math.max(1,((G2.l118||{}).inv||{}).seen|0)})})}),Pl):null;
      out.push({d,key:c.key,wd,term:T&&T.id,week:T&&T.week,ik:it.key,c:it.c.name,cid:it.c.id,t0:+it.t0.toFixed(3),t1:+it.t1.toFixed(3),zone:it.room.zone,P:W?W.sumP(Pl):null,skipOk:sk}); } }
  finally{ if(W) W.mute=false; }
  return out; })"""
NONLAW = r"""(([d0,d1,blk])=>{ for(let d=d0; d<=d1; d++){ const c=CALENDAR.dateOf(d), wd=c.wd===7?0:c.wd; if(wd<1||wd>5) continue; if(CALENDAR.holiday&&CALENDAR.holiday(d)) continue;
    const G2=JSON.parse(JSON.stringify(GAME.G)); G2.day=d; G2.weekday=wd; let its=[]; try{ its=CLS.dayItems(G2); }catch(e){ continue; }
    const it=its.find(q=>q.slot&&q.slot.block===blk&&q.room&&q.room.zone&&!q.room.door&&!q.room.offsite&&!q.exam);
    const law=it&&['linze','wancai'].includes(it.room.via||(it.room.zone==='classroom'?'linze':it.room.zone)), LA=it&&typeof LUNCH118!=='undefined'?LUNCH118.lawAm(G2,it):null;
    if(it&&(blk==='am'?!law:law)){ const T=CALENDAR.termOf(d); return {d,key:c.key,wd,term:T&&T.id,week:T&&T.week,ik:it.key,c:it.c.name,cid:it.c.id,t0:+it.t0.toFixed(3),t1:+it.t1.toFixed(3),zone:it.room.zone,via:it.room.via||null,law,lawAm:LA}; } }
  return null; })"""
PREDEV = r"""(k=>{ const G=GAME.G, R=CLS.rec(G), it=CLS.dayItems(G).find(q=>q.key===k); if(!it) return {err:'那一堂不在今天的課表'}; const h=G.hour, dn=R.done[k]; let ev=null;
  try{ G.hour=it.t1; R.done[k]=1; const e=CLS.afterClassFirst(CLS.afterClassOk(it)); ev=e?e.id:null; }catch(x){ ev='err:'+x; } finally{ G.hour=h; if(dn==null) delete R.done[k]; else R.done[k]=dn; } return {ev}; })"""
SEATS = r"""(([shop,party])=>{ const E=GAME.E, G=GAME.G, Ly=typeof L118_SHOP_LAYOUTS!=='undefined'?L118_SHOP_LAYOUTS[shop]:null;
  const tk=s=>{ if(!s||!Ly||!Array.isArray(Ly.seats)) return null; const q=Ly.seats.find(x=>Math.abs(x.x-s.x)<0.05&&Math.abs(x.z-s.z)<0.05); return q?{table:Array.isArray(q.table)?q.table.join(','):null,lift:!!q.lift}:null; };
  const pos=o=>o&&o.obj?{x:+o.obj.position.x.toFixed(2),z:+o.obj.position.z.toFixed(2)}:null, sp=s=>s?{x:+s.x.toFixed(2),z:+s.z.toFixed(2),t:tk(s)}:null;
  const Pp=E.player, me={seat:sp(Pp.seat),pos:pos(Pp),pose:Pp.pose||null}, ppl={};
  for(const id of party){ const n=(GAME.npc&&GAME.npc[id])||(E.npcs||[]).find(m=>m.charId===id); ppl[id]=n?{seat:sp(n.seat),pos:pos(n),pose:n.pose||null,hidden:!!n.hidden,inZone:(E.npcs||[]).includes(n),dMe:pos(n)&&pos(Pp)?+Math.hypot(pos(n).x-pos(Pp).x,pos(n).z-pos(Pp).z).toFixed(2):null}:null; }
  return {zone:G.zone,adv:typeof ADV!=='undefined'&&!!ADV.active,seats:(E.zone&&E.zone.seats||[]).length,layoutSeats:Ly&&Ly.seats?Ly.seats.length:null,me,ppl}; })"""
UI = r"""(()=>{ const D=GAME.D||{}, E=GAME.E, Pp=E.player, ch=document.getElementById('choices'), fd=document.getElementById('fade'), dl=document.getElementById('dlg'), sk=document.getElementById('dlgSkip');
  const btns=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')]:[];
  return {dlg:!!D.active, txt:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgText')||{}).textContent||'').trim():'', name:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgName')||{}).textContent||'').trim():'',
    heads:btns.map(b=>((b.firstChild&&b.firstChild.nodeType===3)?b.firstChild.textContent:(b.textContent||'')).trim()), full:btns.map(b=>(b.textContent||'').trim()), dims:btns.map(b=>b.classList.contains('dim')||!!b.disabled),
    skipBtn:!!sk&&sk.style.display!=='none'&&!!sk.offsetParent, busy:!!Pp.busy, fade:!!(fd&&fd.classList.contains('on')), phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), paused:!!E.paused,
    adv:typeof ADV!=='undefined'&&!!ADV.active, zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3), day:GAME.G.day, money:GAME.G.money}; })()"""


async def hook(pg):
    await P.init(pg); return await pg.evaluate(HOOK)


async def logn(pg): return await pg.evaluate(LOGN)
async def logs(pg, n0): return await pg.evaluate(LOGS, n0)
async def ui(pg): return await pg.evaluate(UI)


def print_log(tag, lg):
    """逐字：說話（GAME.say 的原文，不受打字機影響）、選單（每一顆的字、灰掉、說明）、選了哪一個、錢、換區、午餐系統的每一步"""
    for e in lg:
        k = e['k']; at = '[第%s天 %s %s]' % (e.get('d'), e.get('h'), e.get('z'))
        if k == 'say': R.note('%s %s 說 %s：%s' % (tag, at, e.get('who') or '（旁白）', e['text']))
        elif k == 'choose': R.note('%s %s 選單 %s' % (tag, at, J([(o, '灰' if dm else '', hn) if (dm or hn) else o for o, dm, hn in zip(e['opts'], e['dims'], e['hints'])])))
        elif k == 'pick': R.note('%s %s   → 選了 #%s %s' % (tag, at, e.get('i'), e.get('txt')))
        elif k == 'money': R.note('%s %s 錢 %+d（%s）' % (tag, at, e['v'], e.get('why')))
        elif k in ('enter', 'entered'): R.note('%s %s %s %s' % (tag, at, k, e.get('to')))
        elif k == 'cap': R.note('%s %s 字幕：%s' % (tag, at, e['text']))
        elif k == 'toast': R.note('%s %s 提示：%s' % (tag, at, e['text']))
        elif k.startswith('lunch.'): R.note('%s %s %s %s' % (tag, at, k, J({x: y for x, y in e.items() if x not in ('k', 't', 'h', 'd', 'z', 'm')})))
        elif k == 'cls' and e.get('fn') in ('slotFill', 'slotUse', 'goClass', 'attend', 'afterMenu'): R.note('%s %s CLS.%s(%s)' % (tag, at, e['fn'], e.get('key')))
        elif k == 'reject': R.note('%s %s 例外（promise reject）%s：%s' % (tag, at, e.get('fn'), e.get('err')))


async def boot(p, tag, url=None):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=LAND)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    await pg.goto(url or URL); ok = await L.wait_loaded(pg); R.check('%s：遊戲載入' % tag, ok)
    await pg.evaluate("localStorage.clear()"); await hook(pg)
    return b, pg, cdp, errs


async def load(pg, cdp, st, why, quiet=None):
    q = EVQUIET if quiet is None else quiet
    R.setup(why + ('（條件事件關著）' if q else '（條件事件開著，只關「要回覆的訊息自動打開手機」）'))
    await L.load_state(pg, st, quiet_events=q, quiet_phone=True)
    await pg.wait_for_timeout(4500)
    try: await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp)
    except Exception: pass
    await pg.evaluate("(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending) CLS.clearPending(); })()")
    await hook(pg)


async def base_snap(pg, cdp, tag, when, h, zone, rel=None, ids=None, flags=None, drop=(), quiet=None):
    """【前置】最小存檔＋好友值（SOCIAL API）→ GAME.snapshot() 回傳"""
    d = await P.day_of(pg, when)
    await load(pg, cdp, mkstate(d, h, zone, flags, drop), '%s：最小存檔 %s（第 %d 天）%.2f %s' % (tag, d['key'], d['d'], h, zone), quiet)
    if rel and ids:
        st = await pg.evaluate(SETREL, [ids, LV[rel]])
        R.setup('%s：好友值 %s（熟悉 %d、信任 %d、自在 %d）：%s' % (tag, rel, LV[rel][0], LV[rel][1], LV[rel][2], J(st)))
    return await pg.evaluate("()=>GAME.snapshot()"), d


async def tap_head(pg, cdp, text, exact=True):
    s = await ui(pg)
    for k, t in enumerate(s['heads']):
        if (t == text) if exact else (text in t):
            await P.tap_choice(pg, cdp, k); return t
    return None


async def find(pg, why, d0=None, d1=None):
    rows = await pg.evaluate(FIND, [d0 if d0 is not None else D0, d1 if d1 is not None else D1]) or []
    R.setup('【捷徑】%s：LUNCH118.plan 在存檔複本上試第 %s～%s 天的法律系館上午課（不改存檔）' % (why, d0 if d0 is not None else D0, d1 if d1 is not None else D1))
    for r in rows:
        Pl = r['P'] or {}
        R.note('  候選 %s（第 %d 天 %s 第 %s 週 週%s）%s %s～%s：%s' % (r['key'], r['d'], r['term'], r['week'], r['wd'], r['c'], r['t0'], r['t1'],
               ('不邀：' + Pl['no']) if Pl.get('no') else '%s 約去 %s（%s），同行 %s，玩家 %s %s 元，特殊 %s，可略過 %s' % (Pl['who'], Pl['shopName'], Pl['shop'], J(Pl['mates']), Pl['item'], Pl['price'], J(Pl['sp']), r['skipOk'])))
    return rows


# ---------- 一天：照真實流程上那一堂 → 邀約 → 選 ----------
async def lunch_day(pg, cdp, tag, snap, cand, action, ids, after_pick='先自由活動', quiet=None, burst=None):
    """action：'accept'／'skip'／'decline'／None（不該有邀約）。回傳紀錄 dict；那天下課演了課後劇情＝{'ev':id}（前置不符）"""
    st = copy.deepcopy(snap); st = st.get('G', st)
    for k in ('_stuck', '_busy'): st.pop(k, None)
    st.update(day=cand['d'], weekday=cand['wd'], hour=round(cand['t0'] - 0.25, 3), zone=cand['zone'], pos=None)
    st['invites'] = [v for v in st.get('invites', []) if v.get('state') not in ('going', 'accepted')]
    await load(pg, cdp, st, '%s：同一份進度讀到 %s（第 %d 天）%.2f、在那一堂的教室區域 %s' % (tag, cand['key'], cand['d'], st['hour'], cand['zone']), quiet)
    rec = {'cand': cand, 'action': action}
    pe = await pg.evaluate(PREDEV, cand['ik']); rec['predev'] = pe
    R.note('%s：那一堂下課會不會演課後劇情（CLS.afterClassFirst，暫時把時間設成下課算完就還原）：%s' % (tag, J(pe)))
    if pe.get('ev') and not str(pe['ev']).startswith('err'):
        rec['ev'] = pe['ev']; return rec
    n0 = await logn(pg); rec['n0'] = n0
    rec['s_pre'] = await pg.evaluate(STATE, ids)
    # 手機「今天」→ 直接去上課
    await P.phone_tab(pg, cdp, 'today')
    sel = '#phoneBody [data-go="%s"]' % cand['ik']
    if await pg.evaluate("s=>!!document.querySelector(s)", sel):
        await shot(pg, '%s_phone_today' % tag)
        await L.tap(pg, cdp, sel); R.note('%s：真的點手機「今天」%s 那一列的「直接去上課」' % (tag, cand['c']))
    else:
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
        R.note('%s：手機「今天」沒有 %s 的「直接去上課」（%s）' % (tag, cand['key'], txt.replace('\n', ' ｜ ')[:300]))
        await L.close_panels(pg, cdp)
        R.setup('%s：【捷徑】CLS.goClass(GAME, 那一堂)＝手機「今天」直接去上課的同一個函式' % tag)
        await pg.evaluate("(k=>{ const it=CLS.dayItems(GAME.G).find(q=>q.key===k); if(it) void CLS.goClass(GAME,it); })(%s)" % J(cand['ik']))
    await pg.wait_for_timeout(1200)
    OPT = rec['opts_data'] = await pg.evaluate(DATA) if await pg.evaluate(HAS) else {'opts': {}}
    o = OPT['opts'] or {}
    inv_heads = [x for x in (o.get('accept'), o.get('decline'), o.get('skip')) if x]
    # 第一段：上課到邀約選單（或沒有邀約＝下課選單／今天的課上完了）
    t0 = time.time(); idle = None; skips = 0; stage = None; inclass_shot = False
    while time.time() - t0 < 900:
        s = await ui(pg)
        if s['phone'] and not s['heads']: await L.phone_away(pg, cdp, tries=1); await L.close_panels(pg, cdp); continue
        if burst and 'burst' not in rec and s['dlg'] and not s['heads']:
            lgb = await logs(pg, n0); ia = next((i for i, e in enumerate(lgb) if e['k'] == 'lunch.after' and not e.get('ev')), None)
            if ia is not None and any(e['k'] == 'say' for e in lgb[ia:]):
                rec['burst'] = await do_burst(pg, cdp, tag, burst); continue
        if s['heads']:
            idle = None; await pg.wait_for_timeout(600); s = await ui(pg)
            if not s['heads']: continue
            if any(h in inv_heads for h in s['heads']): stage = 'invite'; break
            if any(h.startswith(AFTER) for h in s['heads']): stage = 'after'; break
            R.note('%s：上課中的選單 %s → 第一項' % (tag, J(s['heads']))); await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(900); continue
        lg = await logs(pg, n0)
        if s['dlg']:
            idle = None
            if not inclass_shot and any(e['k'] == 'cls' and e['fn'] == 'attend' for e in lg): inclass_shot = True; await shot(pg, '%s_inclass' % tag)
            if s['skipBtn']: skips += 1; await L.tap(pg, cdp, '#dlgSkip'); await pg.wait_for_timeout(700); continue
            await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        if s['busy'] or s['fade'] or s['paused']: idle = None; await pg.wait_for_timeout(300); continue
        done = await pg.evaluate("k=>!!CLS.rec(GAME.G).done[k]", cand['ik'])
        idle = idle or time.time()
        if done and any(e['k'] in ('lunch.afterEnd', 'clsEnd') and (e['k'] == 'lunch.afterEnd' or e.get('fn') == 'afterMenu') for e in lg) and time.time() - idle > 6: stage = 'idle'; break
        if done and time.time() - idle > 25: stage = 'idle'; break
        await pg.wait_for_timeout(300)
    rec['class_sec'] = round(time.time() - t0, 1); rec['skips'] = skips; rec['stage1'] = stage
    R.note('%s：上課到%s花了 %.0f 秒（按了「略過 »」%d 次）' % (tag, {'invite': '邀約選單', 'after': '下課選單（沒有邀約）', 'idle': '空下來（沒有邀約、沒有下課選單）'}.get(stage, '逾時'), rec['class_sec'], skips))
    rec['done'] = await pg.evaluate("k=>!!CLS.rec(GAME.G).done[k]", cand['ik'])
    lg = await logs(pg, n0)
    rec['ev_run'] = [e for e in lg if e['k'] == 'lunch.after']
    if any(e.get('ev') for e in rec['ev_run']):
        rec['ev'] = 'afterClass 事件（a.ev）'; print_log(tag, lg); return rec
    if stage == 'invite':
        s = await ui(pg); rec['menu'] = s['heads']; rec['menu_full'] = s['full']; rec['menu_dims'] = s['dims']
        rec['s_menu'] = await pg.evaluate(STATE, ids); rec['n_menu'] = await logn(pg)
        rec['menu_shot'] = await shot(pg, '%s_invite_menu' % tag)
        want = {'accept': o.get('accept'), 'skip': o.get('skip'), 'decline': o.get('decline')}.get(action)
        if not want: want = o.get('decline')
        await pg.wait_for_timeout(500)
        got = await tap_head(pg, cdp, want, exact=True); rec['tapped'] = got
        R.note('%s：邀約選單 %s → 點「%s」（%s）' % (tag, J(s['heads']), want, '點到了' if got else '畫面上沒有這一顆'))
        # 第二段：接受／略過／婉拒之後到下課選單（或空下來）
        t1 = time.time(); idle = None; seat_done = False; after_menu = None
        while time.time() - t1 < 600:
            s = await ui(pg)
            if s['phone'] and not s['heads']: await L.phone_away(pg, cdp, tries=1); await L.close_panels(pg, cdp); continue
            if s['zone'].startswith('l118_') and not seat_done and not s['fade'] and (s['dlg'] or s['heads']):
                seat_done = True; await pg.wait_for_timeout(800)
                Pl = next((e['P'] for e in await logs(pg, n0) if e['k'] == 'lunch.plan' and e['P'] and not e['P'].get('no')), None)
                rec['seats'] = await pg.evaluate(SEATS, [s['zone'][5:], (Pl or {}).get('party') or []]); rec['seat_shot'] = await shot(pg, '%s_in_shop' % tag)
                R.note('%s：進店（%s）座位：%s' % (tag, s['zone'], J(rec['seats'])))
            if s['heads']:
                idle = None; await pg.wait_for_timeout(600); s = await ui(pg)
                if not s['heads']: continue
                if any(h in inv_heads for h in s['heads']): rec['second_invite'] = s['heads']; R.note('%s：又出了一次邀約選單 %s' % (tag, J(s['heads'])))
                if any(h.startswith(AFTER) for h in s['heads']):
                    after_menu = {'heads': s['heads'], 'full': s['full'], 'dims': s['dims']}; await shot(pg, '%s_after_menu' % tag); break
                R.note('%s：午餐途中的選單 %s → 第一項' % (tag, J(s['heads']))); await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(900); continue
            if s['dlg']: idle = None; await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
            if s['busy'] or s['fade'] or s['paused']: idle = None; await pg.wait_for_timeout(300); continue
            idle = idle or time.time(); lg = await logs(pg, n0)
            if any(e['k'] == 'lunch.afterEnd' for e in lg) and time.time() - idle > 8: break
            await pg.wait_for_timeout(300)
        rec['after_menu'] = after_menu; rec['s_post'] = await pg.evaluate(STATE, ids); rec['post_shot'] = await shot(pg, '%s_after_lunch' % tag)
        if after_menu:
            await pg.wait_for_timeout(400); got = await tap_head(pg, cdp, after_pick, exact=True) or await tap_head(pg, cdp, after_pick, exact=False)
            R.note('%s：下課選單 %s → %s' % (tag, J(after_menu['heads']), got or '（沒有「%s」）' % after_pick)); await pg.wait_for_timeout(2500)
    elif stage == 'after':
        s = await ui(pg); rec['after_menu'] = {'heads': s['heads'], 'full': s['full'], 'dims': s['dims']}; await shot(pg, '%s_after_menu' % tag)
        rec['s_post'] = await pg.evaluate(STATE, ids)
        await pg.wait_for_timeout(400); got = await tap_head(pg, cdp, after_pick, exact=True) or await tap_head(pg, cdp, after_pick, exact=False)
        R.note('%s：下課選單 %s → %s' % (tag, J(s['heads']), got)); await pg.wait_for_timeout(2500)
    else:
        rec['s_post'] = await pg.evaluate(STATE, ids)
    rec['log'] = lg = await logs(pg, n0)
    print_log(tag, lg)
    rec['plan'] = next((e['P'] for e in lg if e['k'] == 'lunch.plan'), None)
    rec['inv_menus'] = [e for e in lg if e['k'] == 'choose' and any(x in inv_heads for x in (e['opts'] or []))]
    rec['settles'] = [e for e in lg if e['k'] == 'lunch.settled']
    return rec


async def do_burst(pg, cdp, tag, nb):
    """邀約那一句一出來（對話框上）就用觸控連點對話框中央：每 ms 毫秒一下、共 n 下。回傳每一下的紀錄（pointerdown 點到什麼、距選單出現幾 ms）與期間有沒有 pick"""
    n, ms = nb
    c = await L.center_of(pg, '#dlg')
    s0 = await ui(pg); R.note('%s：STORYBURST 開始：對話框中央 %s；畫面上那一句（打字中）「%s」' % (tag, J(c), s0['txt']))
    await shot(pg, '%s_burst_start' % tag)
    nl = await logn(pg); t0 = time.time(); sent = []
    for i in range(n):
        await L.touch_tap(cdp, c[0], c[1]); sent.append(round((time.time() - t0) * 1000))
        rest = t0 + (i + 1) * ms / 1000.0 - time.time()
        if rest > 0: await asyncio.sleep(rest)
    await pg.wait_for_timeout(900)
    lg = await logs(pg, nl); s1 = await ui(pg); await shot(pg, '%s_burst_end' % tag)
    downs = [{'btn': e.get('btn'), 'tgt': e.get('tgt'), 'sinceMenu': e.get('sinceMenu'), 'menu': e.get('menu')} for e in lg if e['k'] == 'down']
    picks = [e for e in lg if e['k'] == 'pick']; menus = [e['opts'] for e in lg if e['k'] == 'choose']
    for k, dn in enumerate(downs): R.note('%s：  第 %d 下（送出於 %s ms）點到 %s%s；距選單出現 %s' % (tag, k + 1, sent[k] if k < len(sent) else '?', dn['tgt'], ('，按鈕「%s」' % dn['btn']) if dn['btn'] else '', ('%s ms' % dn['sinceMenu']) if dn['sinceMenu'] is not None else '（選單還沒出）'))
    R.note('%s：STORYBURST 送了 %d 下（實際間隔 %s ms）、收到 pointerdown %d 下；期間出的選單 %s；pick %s；結束時畫面上的選項 %s' % (tag, n, J([b - a for a, b in zip(sent, sent[1:])][:6]), len(downs), J(menus), J(picks), J(s1['heads'])))
    return {'sent': sent, 'downs': downs, 'picks': picks, 'menus': menus, 'heads_after': s1['heads']}


async def run_with_retry(pg, cdp, tag, snap, cands, action, ids, **kw):
    for i, c in enumerate(cands[:RETRY + 1]):
        r = await lunch_day(pg, cdp, '%s_%s' % (tag, c['key']), snap, c, action, ids, **kw)
        if r.get('ev'):
            R.note('%s：%s 那一堂下課有課後劇情 %s（規則：那天不邀）＝前置不符，換下一個候選日' % (tag, c['key'], r['ev'])); continue
        return r
    return None


def menu_money(rec):
    lg = rec.get('log') or []; n = rec.get('n_menu', 0) - rec.get('n0', 0)
    return [e['v'] for e in lg[max(0, n):] if e['k'] == 'money']


def fam_delta(a, b, ids):
    return {i: ((b['fam'].get(i) or {}).get('fam', 0) or 0) - ((a['fam'].get(i) or {}).get('fam', 0) or 0) for i in ids}


async def reload_continue(pg, cdp, tag):
    """重新整理 → 標題畫面「繼續（自動存檔）」（玩家看得到的鍵）"""
    await pg.reload(); ok = await L.wait_loaded(pg)
    await pg.wait_for_timeout(1500)
    vis = await pg.evaluate("(()=>{ const b=document.getElementById('btnContinue'); return !!b&&!!b.offsetParent; })()")
    R.check('%s：重新整理後標題畫面有「繼續（自動存檔）」' % tag, ok and vis)
    await L.tap(pg, cdp, '#btnContinue'); await pg.wait_for_timeout(6000)
    try: await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp)
    except Exception: pass
    await hook(pg)
    for _ in range(30):
        s = await ui(pg)
        if not (s['dlg'] or s['heads'] or s['fade']): break
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)


def no_errs(tag, errs):
    R.check('%s：沒有 JS 例外（pageerror）' % tag, not errs, J(errs[:3]))


async def need_lunch(pg, tag):
    has = await pg.evaluate(HAS)
    return R.check('%s：遊戲有午餐邀約系統（LUNCH118＋L118_LUNCH_DATA）' % tag, has, '' if has else '舊版沒有（D34 對照：這一段在舊版本來就做不了）')


# ---------- PARTS ----------
async def part_main(p):
    b, pg, cdp, errs = await boot(p, 'MAIN')
    try:
        if not await need_lunch(pg, 'MAIN'): return
        D = await pg.evaluate(DATA); ids = D['who']; o = D['opts']
        snap, _ = await base_snap(pg, cdp, 'MAIN', '2025-09-21', 20.0, 'dorm', REL, ids)
        rows = await find(pg, 'MAIN 找「會邀、同行 ≥2 人、不是辛亥韓食」的日子')
        hits = [r for r in rows if r['P'] and not r['P'].get('no')]
        c3 = [r for r in hits if len(r['P']['party']) == 3 and r['P']['shop'] != 'tea']
        c2 = [r for r in hits if len(r['P']['party']) >= 2 and r['P']['shop'] != 'tea']
        cands = c3 + [r for r in c2 if r not in c3] + [r for r in hits if r not in c2]
        if not R.check('MAIN：找得到會邀的日子', bool(cands), '%d 天裡 %d 天會邀' % (len(rows), len(hits))): return
        rec = await run_with_retry(pg, cdp, 'MAIN', snap, cands, 'accept', ids)
        if not R.check('MAIN：有一天照真實流程跑到邀約（不是課後劇情日）', bool(rec)): return
        c = rec['cand']; Pl = rec.get('plan') or {}
        R.check('MAIN：下課後出了邀約選單（stage=%s）' % rec.get('stage1'), rec.get('stage1') == 'invite', J(rec.get('menu')))
        R.check('MAIN：實際的邀約＝前置找的那一場（發起人、店、同行）', bool(Pl) and Pl.get('who') == c['P']['who'] and Pl.get('shop') == c['P']['shop'] and Pl.get('party') == c['P']['party'], J({'預期': c['P'], '實際': Pl}))
        if rec.get('stage1') != 'invite': return
        R.check('MAIN 快速略過：第一次參加，選單沒有「%s」' % o.get('skip'), o.get('skip') not in rec['menu'], J(rec['menu']))
        R.check('MAIN：選單只有接受／婉拒（不選餐廳）＝%s' % J([o.get('accept'), o.get('decline')]), rec['menu'] == [o.get('accept'), o.get('decline')], J(rec['menu']))
        inv_say = [e for e in rec['log'] if e['k'] == 'say' and e.get('cid') == Pl.get('who')]
        R.check('MAIN：邀約是 NPC 先開口（%s 說了一句才出選單）' % Pl.get('who'), bool(inv_say) and bool(rec['inv_menus']) and inv_say[0]['t'] < rec['inv_menus'][0]['t'], J(inv_say[:1]))
        # ③
        afters = [e for e in rec['log'] if e['k'] == 'lunch.afterEnd']
        R.check('MAIN ③：這一天 LUNCH118.afterClass 只判一次、邀約選單只出一次（同堂認識 %d 人）' % len(Pl.get('el') or []), len(afters) == 1 and len(rec['inv_menus']) == 1 and not rec.get('second_invite'),
                J({'afterClass': [(e.get('key'), e.get('ret')) for e in afters], '邀約選單': len(rec['inv_menus']), 'el': Pl.get('el')}))
        I = (rec['s_post'] or {}).get('inv') or {}
        R.check('MAIN ③：inv.day＝今天、hit＝true、done＝今天', I.get('day') == c['d'] and I.get('hit') is True and I.get('done') == c['d'], J(I))
        am = rec.get('after_menu') or {}
        R.check('MAIN ③：吃完以後的下課選單沒有第二次邀約、也不再出「先去吃飯，再去下一堂」', not any(h in (o.get('accept'), o.get('decline')) for h in am.get('heads', [])) and not any(h.startswith('先去吃飯') for h in am.get('heads', [])), J(am.get('heads')))
        # ④
        R.check('MAIN ④：含玩家 %d 人（≤4）' % (len(Pl.get('party') or []) + 1), 1 <= len(Pl.get('party') or []) <= 3, J(Pl.get('party')))
        se = rec.get('seats') or {}
        R.note('MAIN ④：店裡看到的人 %s' % J(se.get('ppl')))
        # ⑤
        mm = menu_money(rec); shopmenu = await pg.evaluate("s=>{ const x=L118.shop(s); return x?x.menu:null; }", Pl.get('shop'))
        mp = next((m[1] for m in (shopmenu or []) if m[0] == Pl.get('item')), None)
        dm = rec['s_post']['money'] - rec['s_menu']['money']
        R.check('MAIN ⑤：只扣玩家自己那一份：GAME.money 只叫一次 %s、＝菜單上「%s」的 %s 元（不是 ×%d 人）；錢 %d → %d' % (J(mm), Pl.get('item'), mp, len(Pl.get('party') or []) + 1, rec['s_menu']['money'], rec['s_post']['money']),
                mm == [-mp] and dm == -mp and mp is not None and mp == Pl.get('price'), J({'money': mm, 'diff': dm, 'menu': shopmenu}))
        # 熟悉度
        fd = fam_delta(rec['s_menu'], rec['s_post'], ids); pts = ((rec['settles'] or [{}])[0].get('out') or {}).get('pts') or {}
        R.check('MAIN：熟悉度只加同行的人、＝settle 回報的點數（%s）；沒同行的不變' % J(pts), all(fd[i] == pts.get(i, 0) for i in ids), J(fd))
        R.check('MAIN：結算只一次（LUNCH118.settle 回報 %d 次）' % len(rec['settles']), len(rec['settles']) == 1, J(rec['settles']))
        # ⑥
        lg2 = rec['log'][max(0, rec['n_menu'] - rec['n0']):]
        sl = [e for e in lg2 if e['k'] == 'cls' and e['fn'] in ('slotFill', 'slotUse')]
        R.check('MAIN ⑥：不占行動格：G.slots 邀約選單時 %s → 吃完 %s 一樣、這段沒有 slotFill／slotUse' % (J(rec['s_menu']['slots']), J(rec['s_post']['slots'])),
                rec['s_menu']['slots'] == rec['s_post']['slots'] and not sl, J(sl))
        nx = [h for h in am.get('heads', []) if h.startswith('直接去下一堂')]
        R.check('MAIN ⑥：下午的課沒被跳過（note 沒有 skip：%s；下課選單 %s）' % (J(rec['s_post']['skipNotes']), J(am.get('heads'))), not rec['s_post']['skipNotes'] and (bool(nx) or not am), J(am))
        R.note('MAIN ⑥：時間 邀約 %.3f → 吃完 %.3f（計畫 hEnd %s、下一件事最晚 %s）' % (rec['s_menu']['h'], rec['s_post']['h'], Pl.get('hEnd'), Pl.get('lim')))
        # ⑨
        snapA = await pg.evaluate(STATE, ids)
        await reload_continue(pg, cdp, 'MAIN ⑨')
        snapB = await pg.evaluate(STATE, ids)
        R.note('MAIN ⑨：讀回來 第 %s 天 %.3f %s 錢 %s inv %s' % (snapB['day'], snapB['h'], snapB['zone'], snapB['money'], J(snapB['inv'])))
        R.check('MAIN ⑨：讀回來是同一天、inv.day／done＝今天（自動存檔有午餐的紀錄）', snapB['day'] == c['d'] and (snapB['inv'] or {}).get('day') == c['d'] and (snapB['inv'] or {}).get('done') == c['d'], J(snapB['inv']))
        n1 = await logn(pg)
        R.setup('MAIN ⑨：【捷徑】再叫一次 LUNCH118.afterClass(GAME, %s)＝下課選單一開頭那個掛勾（同一天讀檔以後再判一次）' % c['ik'])
        await pg.evaluate("(k=>{ void LUNCH118.afterClass(GAME,k,{}); })(%s)" % J(c['ik'])); await pg.wait_for_timeout(4000)
        s = await ui(pg); lg3 = await logs(pg, n1)
        ret = [e.get('ret') for e in lg3 if e['k'] == 'lunch.afterEnd']
        R.check('MAIN ⑨：存讀檔後同一天不再邀（afterClass 回 false、沒有選單、錢 %s → %s）' % (snapA['money'], snapB['money']), ret == [False] and not s['heads'] and not any(e['k'] == 'choose' for e in lg3) and snapB['money'] == snapA['money'], J({'ret': ret, 'heads': s['heads']}))
        if s['heads']: await shot(pg, 'MAIN9_unexpected_menu')
        no_errs('MAIN', errs)
    finally:
        await b.close()


async def part_skip(p):
    b, pg, cdp, errs = await boot(p, 'SKIP')
    try:
        if not await need_lunch(pg, 'SKIP'): return
        D = await pg.evaluate(DATA); ids = D['who']; o = D['opts']
        snap, _ = await base_snap(pg, cdp, 'SKIP', '2025-09-21', 20.0, 'dorm', REL, ids)
        rows = await find(pg, 'SKIP 第一天：找會邀的日子')
        hits = [r for r in rows if r['P'] and not r['P'].get('no') and not r['P'].get('poor')]
        if not R.check('SKIP：找得到會邀的日子', bool(hits)): return
        r1 = await run_with_retry(pg, cdp, 'SKIP1', snap, hits, 'accept', ids)
        if not R.check('SKIP 第一天：照真實流程跑到邀約', bool(r1) and r1.get('stage1') == 'invite', J(r1 and r1.get('stage1'))): return
        R.check('SKIP 第一天：選單沒有「%s」（第一次參加）' % o.get('skip'), o.get('skip') not in r1['menu'], J(r1['menu']))
        I1 = r1['s_post']['inv'] or {}
        R.check('SKIP 第一天：完整看過一次（inv.seen＝1、done＝今天、有進店或 2D）', I1.get('seen') == 1 and I1.get('done') == r1['cand']['d'], J(I1))
        snap2 = await pg.evaluate("()=>GAME.snapshot()")
        rows2 = await find(pg, 'SKIP 第二天：第一天以後的進度上找「會邀、可以略過」的日子', r1['cand']['d'] + 1, D1)
        hits2 = [r for r in rows2 if r['P'] and not r['P'].get('no') and r.get('skipOk') and not r['P'].get('poor')]
        if not R.check('SKIP：找得到第二個會邀、可略過的日子', bool(hits2)): return
        r2 = await run_with_retry(pg, cdp, 'SKIP2', snap2, hits2, 'skip', ids)
        if not R.check('SKIP 第二天：照真實流程跑到邀約', bool(r2) and r2.get('stage1') == 'invite', J(r2 and r2.get('stage1'))): return
        R.note('SKIP：兩次邀約選單的按鈕文字：第一次 %s ｜ 看過一次以後 %s' % (J(r1['menu']), J(r2['menu'])))
        R.check('SKIP：看過一次以後選單有「%s」（資料 options.skip）' % o.get('skip'), o.get('skip') in r2['menu'], J(r2['menu']))
        R.check('SKIP：真的點到快速略過', r2.get('tapped') == o.get('skip'), J(r2.get('tapped')))
        Pl = r2.get('plan') or {}; mm = menu_money(r2); dm = r2['s_post']['money'] - r2['s_menu']['money']
        R.check('SKIP ⑧：錢只扣一次＝玩家那一份 %s 元（GAME.money %s；錢 %d → %d）' % (Pl.get('price'), J(mm), r2['s_menu']['money'], r2['s_post']['money']), mm == [-Pl.get('price')] and dm == -Pl.get('price'), J(mm))
        st = r2['settles']; pts = ((st or [{}])[0].get('out') or {}).get('pts') or {}; fd = fam_delta(r2['s_menu'], r2['s_post'], ids)
        R.check('SKIP ⑧：結算一次（settle %d 次、skip=true）' % len(st), len(st) == 1 and any(e['k'] == 'lunch.settle' and e['skip'] for e in r2['log']), J(st))
        R.check('SKIP ⑧：同行每人熟悉度＝settle 的點數 %s（每週上限 6）、別人不變' % J(pts), all(fd[i] == pts.get(i, 0) for i in ids) and all(pts.get(i, 0) > 0 for i in Pl.get('party') or []), J(fd))
        I2 = r2['s_post']['inv'] or {}
        R.check('SKIP ⑧：inv.done＝今天、seen 還是 1（略過不算看過）、n＝2', I2.get('done') == r2['cand']['d'] and I2.get('seen') == 1 and I2.get('n') == 2, J(I2))
        R.check('SKIP：略過不換場景（沒有 GAME.enter l118_）', not any(e['k'] == 'enter' and str(e.get('to', '')).startswith('l118_') for e in r2['log']), J([e.get('to') for e in r2['log'] if e['k'] == 'enter']))
        exp = None
        if D.get('skipLine') and Pl:
            exp = D['skipLine'].replace('{同行}', '、'.join(D['names'].get(i, i) for i in Pl['party'])).replace('{店名}', Pl['shopName']).replace('{品名}', Pl['item']).replace('{金額}', str(Pl['price']))
        says = [e['text'] for e in r2['log'] if e['k'] == 'say']
        R.check('SKIP：顯示 skipLine 那一句（%s）' % exp, exp is None or exp in says, J(says[-4:]))
        am = r2.get('after_menu') or {}
        R.check('SKIP：略過以後下課選單沒有「先去吃飯」', not any(h.startswith('先去吃飯') for h in am.get('heads', [])), J(am.get('heads')))
        a = await pg.evaluate(STATE, ids)
        await reload_continue(pg, cdp, 'SKIP ⑧')
        bb = await pg.evaluate(STATE, ids)
        R.check('SKIP ⑧：重新整理、繼續以後錢、熟悉度不再變（不重複結算）', a['money'] == bb['money'] and all((a['fam'].get(i) or {}).get('fam') == (bb['fam'].get(i) or {}).get('fam') for i in ids) and (bb['inv'] or {}).get('n') == 2, J({'前': [a['money'], a['inv']], '後': [bb['money'], bb['inv']]}))
        no_errs('SKIP', errs)
    finally:
        await b.close()


async def part_decl(p):
    b, pg, cdp, errs = await boot(p, 'DECL')
    try:
        if not await need_lunch(pg, 'DECL'): return
        D = await pg.evaluate(DATA); ids = D['who']; o = D['opts']
        snap, _ = await base_snap(pg, cdp, 'DECL', '2025-09-21', 20.0, 'dorm', REL, ids)
        rows = await find(pg, 'DECL 第一天：找會邀的日子')
        hits = [r for r in rows if r['P'] and not r['P'].get('no') and not r['P'].get('poor')]
        if not R.check('DECL：找得到會邀的日子', bool(hits)): return
        r1 = await run_with_retry(pg, cdp, 'DECL1', snap, hits, 'decline', ids)
        if not R.check('DECL 第一天：照真實流程跑到邀約', bool(r1) and r1.get('stage1') == 'invite', J(r1 and r1.get('stage1'))): return
        X = (r1.get('plan') or {}).get('who'); I1 = r1['s_post']['inv'] or {}
        R.check('DECL 第一天：點了「%s」' % o.get('decline'), r1.get('tapped') == o.get('decline'))
        R.check('DECL 第一天：錢不變、誰的熟悉度都不變', r1['s_post']['money'] == r1['s_menu']['money'] and all(v == 0 for v in fam_delta(r1['s_menu'], r1['s_post'], ids).values()), J(fam_delta(r1['s_menu'], r1['s_post'], ids)))
        R.check('DECL ⑦：decl[%s]＝1、其他人都沒有（0）' % X, (I1.get('decl') or {}).get(X) == 1 and all(((I1.get('decl') or {}).get(i) or 0) == 0 for i in ids if i != X), J(I1.get('decl')))
        t_m = r1['inv_menus'][0]['t'] if r1['inv_menus'] else 0
        dl = [e['text'] for e in r1['log'] if e['k'] == 'say' and e.get('cid') == X and e['t'] > t_m]
        R.check('DECL 第一天：%s 回了一句（婉拒回覆）' % X, bool(dl), J(dl))
        am = r1.get('after_menu') or {}
        R.note('DECL 第一天：婉拒後的下課選單 %s（沒吃＝「先去吃飯」照常可以有）' % J(am.get('heads')))
        R.check('DECL 第一天：inv.done 沒有記（沒吃）', I1.get('done') != r1['cand']['d'], J(I1))
        snap2 = await pg.evaluate("()=>GAME.snapshot()")
        rows2 = await find(pg, 'DECL 第二天：找「別人發起」的日子', r1['cand']['d'] + 1, D1)
        hits2 = [r for r in rows2 if r['P'] and not r['P'].get('no') and r['P'].get('who') != X and not r['P'].get('poor')]
        R.note('DECL：第二天以後 %s 發起的日子 %s' % (X, J([r['key'] for r in rows2 if r['P'] and r['P'].get('who') == X])))
        if not R.check('DECL：找得到別人發起的日子', bool(hits2)): return
        r2 = await run_with_retry(pg, cdp, 'DECL2', snap2, hits2, 'accept', ids)
        if not R.check('DECL 第二天：照真實流程跑到邀約', bool(r2) and r2.get('stage1') == 'invite'): return
        Y = (r2.get('plan') or {}).get('who'); I2 = r2['s_post']['inv'] or {}
        R.check('DECL ⑦：接受 %s 以後 decl[%s]＝0、decl[%s] 還是 1（只影響對應的人）' % (Y, Y, X), ((I2.get('decl') or {}).get(Y) or 0) == 0 and (I2.get('decl') or {}).get(X) == 1 and Y != X, J(I2.get('decl')))
        no_errs('DECL', errs)
    finally:
        await b.close()


async def part_table(p):
    b, pg, cdp, errs = await boot(p, 'TABLE')
    try:
        if not await need_lunch(pg, 'TABLE'): return
        D = await pg.evaluate(DATA); ids = D['who']
        snap, _ = await base_snap(pg, cdp, 'TABLE', '2025-09-21', 20.0, 'dorm', REL, ids)
        rows = await find(pg, 'TABLE 找辛亥韓食（tea）的日子（優先四人）')
        tea = [r for r in rows if r['P'] and not r['P'].get('no') and r['P'].get('shop') == 'tea']
        cands = [r for r in tea if len(r['P']['party']) == 3] + [r for r in tea if len(r['P']['party']) != 3]
        lay = await pg.evaluate("(()=>{ const L=typeof L118_SHOP_LAYOUTS!=='undefined'?L118_SHOP_LAYOUTS.tea:null; return L?{seats:L.seats.map(s=>[s.x,s.z,s.table,!!s.lift]),name:L.name||null}:null; })()")
        zt = await pg.evaluate("!!(typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES.l118_tea)")
        R.note('TABLE：辛亥韓食室內配置 %s；區域 l118_tea 存在＝%s' % (J(lay), zt))
        if not R.check('TABLE：找得到約去辛亥韓食的日子', bool(cands), '%d 天' % len(rows)): return
        rec = await run_with_retry(pg, cdp, 'TABLE', snap, cands, 'accept', ids)
        if not R.check('TABLE：照真實流程跑到邀約', bool(rec) and rec.get('stage1') == 'invite'): return
        Pl = rec.get('plan') or {}; se = rec.get('seats') or {}; party = Pl.get('party') or []
        st3 = next((e.get('v') for e in rec['log'] if e['k'] == 'lunch.stage3d'), None); sn = next((e.get('n') for e in rec['log'] if e['k'] == 'lunch.seated'), None)
        adv = any(e['k'] == 'cap' and e['text'] == Pl.get('shopName') for e in rec['log']) or bool(se.get('adv'))
        R.note('TABLE：含玩家 %d 人；stage3d=%s（false＝深色底 2D）；seatParty 坐下的同行 %s 人；進店時座位 %s' % (len(party) + 1, st3, sn, J(se)))
        ppl = se.get('ppl') or {}; seated = [i for i in party if (ppl.get(i) or {}).get('seat')]
        tabs = set()
        for sp_ in [(se.get('me') or {}).get('seat')] + [ppl[i]['seat'] for i in seated]:
            if sp_: tabs.add(((sp_.get('t') or {}).get('table')) or ('座位 %s,%s' % (sp_['x'], sp_['z'])))
        kind = '2D（深色底）' if (st3 is False or adv) else ('全部坐下：同一桌' if len(seated) == len(party) and len(tabs) == 1 else ('全部坐下：併桌（%d 張）' % len(tabs) if len(seated) == len(party) else '3D 但有 %d 位同行沒位子' % (len(party) - len(seated))))
        R.note('TABLE：結果＝%s（桌號 %s）' % (kind, J(sorted(tabs))))
        R.check('TABLE：四人去辛亥韓食（舊室內 %s 個位子）每一位同行都有位子、或明確退回 2D（實際：%s）' % (len((lay or {}).get('seats') or []), kind), kind.startswith('2D') or len(seated) == len(party), J({'seated': seated, 'party': party, 'ppl': ppl}))
        R.check('TABLE：玩家自己坐下了（3D 時）', kind.startswith('2D') or bool((se.get('me') or {}).get('seat')), J(se.get('me')))
        mm = menu_money(rec)
        R.check('TABLE：錢只扣玩家那一份 %s 元（%s）' % (Pl.get('price'), J(mm)), mm == [-Pl.get('price')] if Pl.get('price') else False)
        no_errs('TABLE', errs)
    finally:
        await b.close()


async def part_e1(p):
    b, pg, cdp, errs = await boot(p, 'E1')
    try:
        has = await pg.evaluate(HAS)
        ids = (await pg.evaluate(DATA))['who'] if has else ['heroine_01', 'zhe', 'yu', 'classmate_bohan', 'classmate_peishan', 'classmate_mingxuan', 'classmate_xinci']
        snap, _ = await base_snap(pg, cdp, 'E1', '2025-09-21', 20.0, 'dorm', REL, ids)
        if not has: R.note('E1：這一版沒有 LUNCH118（舊版）：只看上完非法律系館的課以後沒有邀約（對照用）')
        c = await pg.evaluate(NONLAW, [D0 + 7, D1, 'am'])
        if not R.check('E1：找得到上午不在法律系館的課（%s）' % J(c), bool(c)): return
        rec = await lunch_day(pg, cdp, 'E1_%s' % c['key'], snap, c, None, ids)
        R.check('E1 ①：%s（%s）上完了' % (c['c'], c['zone']), rec.get('done'), J(rec.get('stage1')))
        R.check('E1 ①：沒有邀約（沒有接受／婉拒選單、afterClass 回 false）', not rec.get('inv_menus') and rec.get('stage1') != 'invite' and all(e.get('ret') is False for e in rec['log'] if e['k'] == 'lunch.afterEnd'), J(rec.get('after_menu')))
        I = (rec['s_post'] or {}).get('inv') or {}
        R.check('E1 ①：inv.day 沒有記成今天（不是法律系館的課＝不判）', I.get('day') != c['d'], J(I))
        if has:
            pm = await pg.evaluate(NONLAW, [D0, D1, 'pm1'])
            R.note('E1：【函式】法律系館的下午第一堂（%s %s %s～%s %s）LUNCH118.lawAm＝%s（下午的課不判）' % (pm and pm['key'], pm and pm['c'], pm and pm['t0'], pm and pm['t1'], pm and pm['zone'], pm and pm['lawAm']))
            R.check('E1 ①：【函式】法律系館的下午課 lawAm＝false', bool(pm) and pm['lawAm'] is False, J(pm))
        no_errs('E1', errs)
    finally:
        await b.close()


async def part_e2(p):
    b, pg, cdp, errs = await boot(p, 'E2')
    try:
        has = await pg.evaluate(HAS)
        ids = (await pg.evaluate(DATA))['who'] if has else []
        R.setup('E2：新開局旗標 LAW_START_DAY=-18、MAIN_D1=-13（開學 9/1 的局：阿哲要初遇才認識）、拿掉 MET_ZHE／met_an／metAn；沒有任何 FIRST_MET')
        snap, _ = await base_snap(pg, cdp, 'E2', '2025-09-21', 20.0, 'dorm', None, None, flags={'LAW_START_DAY': -18, 'MAIN_D1': -13}, drop=('MET_ZHE', 'met_an', 'metAn'), quiet=True)
        if not has:
            R.note('E2：這一版沒有 LUNCH118（舊版）：不做'); R.check('E2：遊戲有午餐邀約系統', False, '舊版沒有（D34）'); return
        kn = await pg.evaluate("ids=>ids.filter(id=>STORY.knows(id,GAME.G))", ids)
        R.check('E2：前置後一個都不認識（STORY.knows）', not kn, J(kn))
        rows = await find(pg, 'E2 找法律系館上午課的日子')
        if not R.check('E2：有法律系館上午課的日子', bool(rows)): return
        c = rows[0]
        rec = await lunch_day(pg, cdp, 'E2_%s' % c['key'], snap, c, None, ids, quiet=True)
        Pl = rec.get('plan') or {}
        R.check('E2 ②：%s 上完了' % c['c'], rec.get('done'))
        R.check('E2 ②：沒有邀約（沒有接受／婉拒選單）', not rec.get('inv_menus') and rec.get('stage1') != 'invite', J(rec.get('after_menu')))
        R.check('E2 ②：LUNCH118.plan＝nobody（同堂沒有認識的人）', Pl.get('no') == 'nobody', J(Pl))
        I = (rec['s_post'] or {}).get('inv') or {}
        R.check('E2 ②：inv.day＝今天（判過了）、hit＝false', I.get('day') == c['d'] and I.get('hit') is False, J(I))
        kn2 = await pg.evaluate("ids=>ids.filter(id=>STORY.knows(id,GAME.G))", ids)
        R.note('E2：下課以後認識的人 %s（上課途中有沒有劇情讓人認識）' % J(kn2))
        no_errs('E2', errs)
    finally:
        await b.close()


async def part_e10(p):
    b, pg, cdp, errs = await boot(p, 'E10')
    try:
        shop = 'dian'
        d = await P.day_of(pg, '2025-10-01')
        info = await pg.evaluate("s=>{ const x=L118.shop(s); return x?{name:x.name,menu:x.menu,hours:x.hours,open:L118.isOpen(s,Object.assign({},GAME.G,{day:%d,weekday:%d,hour:12.67}))}:null; }" % (d['d'], d['wd']), shop)
        R.note('E10：%s 的資料 %s' % (shop, J(info)))
        await load(pg, cdp, mkstate(d, 12 + 40 / 60, 'l118_' + shop), 'E10：最小存檔 %s（週三）12:40 在 %s 店裡（l118_%s 的落點）' % (d['key'], (info or {}).get('name'), shop), quiet=True)
        it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>q.shop118&&!q.hidden); return i?{x:i.x,z:i.z,label:i.label,shop:i.shop118}:null; })()")
        if not R.check('E10：店裡有點餐的互動點（%s）' % J(it), bool(it)): return
        m0 = await pg.evaluate("GAME.G.money"); l0 = await pg.evaluate("JSON.stringify(GAME.G.l118||null)"); n0 = await logn(pg)
        await L.go_to(pg, cdp, R, it['x'], it['z'], 1.0, '點餐的地方', max_s=200)
        lab = await pg.evaluate("(()=>{ const e=document.getElementById('interact'); return e&&!e.classList.contains('hide')?((document.getElementById('interactLabel')||{}).textContent||''):''; })()")
        R.check('E10：走到了，互動鍵寫「%s」' % lab, lab == it['label'], J(lab))
        await shot(pg, 'E10_counter'); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        t0 = time.time(); picked = None; idle = None
        while time.time() - t0 < 180:
            s = await ui(pg)
            if s['heads']:
                idle = None; await pg.wait_for_timeout(600); s = await ui(pg)
                if not s['heads']: continue
                k = next((i for i, h in enumerate(s['full']) if '元' in h and not s['dims'][i]), None)
                if k is None: k = 0
                picked = s['heads'][k]; R.note('E10：選單 %s → %s' % (J(s['full']), picked)); await shot(pg, 'E10_menu'); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
            if s['dlg']: idle = None; await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
            if s['busy'] or s['fade']: idle = None; await pg.wait_for_timeout(300); continue
            idle = idle or time.time()
            if picked and time.time() - idle > 4: break
            await pg.wait_for_timeout(300)
        lg = await logs(pg, n0); print_log('E10', lg)
        m1 = await pg.evaluate("GAME.G.money"); l1 = await pg.evaluate("JSON.stringify(GAME.G.l118||null)")
        mm = [e['v'] for e in lg if e['k'] == 'money']
        price = next((m[1] for m in (info or {}).get('menu') or [] if picked and picked.startswith(m[0])), None)
        R.check('E10 ⑩：一個人點餐照常：選了「%s」、GAME.money 只叫一次 %s＝那一樣 %s 元；錢 %d → %d' % (picked, J(mm), price, m0, m1), bool(picked) and price is not None and mm == [-price] and m1 == m0 - price, J(mm))
        R.note('E10：G.l118 前 %s ｜ 後 %s' % (l0[:300], l1[:300]))
        R.check('E10 ⑩：點餐沒有觸發午餐邀約（沒有 LUNCH118.afterClass／plan）', not any(e['k'].startswith('lunch.') for e in lg))
        no_errs('E10', errs)
    finally:
        await b.close()


async def phone_invite(pg, cdp, who, tag):
    """手機「朋友」→ 那個人的「約」（data-inv）。回傳有沒有打開"""
    await P.phone_tab(pg, cdp, 'friends')
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    sel = '#phoneBody [data-inv="%s"]' % who
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel):
        R.note('%s：手機「朋友」沒有 %s 的「約」：%s' % (tag, who, (await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"))[:300].replace('\n', ' ｜ '))); return False
    await shot(pg, '%s_friends' % tag); await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500); return True


async def wait_menu(pg, cdp, max_s=30, tag=''):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await ui(pg)
        if s['heads']: await pg.wait_for_timeout(600); return await ui(pg)
        if s['dlg']: await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(300)
    return await ui(pg)


async def settle_ui(pg, cdp, max_s=40):
    t0 = time.time(); idle = None
    while time.time() - t0 < max_s:
        s = await ui(pg)
        if s['heads']: return s
        if s['dlg']: idle = None; await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        idle = idle or time.time()
        if time.time() - idle > 3: return s
        await pg.wait_for_timeout(300)
    return await ui(pg)


def rows_of(s):
    return [{'t': h, 'full': f, 'dim': d} for h, f, d in zip(s['heads'], s['full'], s['dims'])]


async def part_date(p):
    b, pg, cdp, errs = await boot(p, 'DATE')
    try:
        info = await pg.evaluate("(()=>{ const P=(INVITE_DATA.places||[]).find(q=>q.id==='pasta118'); const s=typeof L118!=='undefined'?L118.shop('pasta'):null; return {place:P?{days:P.days,hours:P.hours,times:P.times,off:P.off||null,windows:P.windows||null,name:P.name,verb:P.verb}:null,shop:s?{name:s.name,hours:s.hours}:null}; })()")
        R.note('DATE：義大麵屋的邀約地點 %s；店家資料 %s' % (J(info['place']), J(info['shop'])))
        closed = ((info.get('shop') or {}).get('hours') or {}).get('closed') or []
        R.check('DATE：店家資料義大麵屋週一公休（closed 有 1）', 1 in closed, J(closed))
        R.check('DATE：【資料】邀約地點 pasta118 的 days 不含週一（%s）' % J((info.get('place') or {}).get('days')), bool(info.get('place')) and 1 not in (info['place'].get('days') or [1]))
        snap, d = await base_snap(pg, cdp, 'DATE', '2025-10-31', 10.0, 'dorm', 'FRI', [WHO], flags={'dating_' + WHO: True}, quiet=True)
        await load(pg, cdp, snap, 'DATE：交往中（dating_%s）、有聯絡方式，同一天（%s 週五）10:00 宿舍' % (WHO, d['key']), quiet=True)
        n0 = await logn(pg)
        if not R.check('DATE：手機「朋友」有 %s 的「約」' % WHO, await phone_invite(pg, cdp, WHO, 'DATE')): return
        s = await wait_menu(pg, cdp); R.note('DATE：約她去哪 %s' % J(s['full']))
        if not any('義大麵屋' in h for h in s['heads']):
            if not await tap_head(pg, cdp, '吃飯', exact=False):
                R.check('DATE：有「吃飯…」那一類', False, J(s['heads'])); return
            s = await wait_menu(pg, cdp); R.note('DATE：吃飯那一層 %s' % J(s['full']))
        if not await tap_head(pg, cdp, '義大麵屋', exact=False):
            R.check('DATE：吃飯那一層有義大麵屋（交往中、法律系）', False, J(s['heads'])); return
        s = await wait_menu(pg, cdp); T = rows_of(s); await shot(pg, 'DATE_times')
        R.note('DATE：時間清單 %s' % J(T))
        tom = next((r for r in T if r['t'].startswith('明天')), None)
        R.check('DATE：「明天」（週六）義大麵屋不能約（約午餐只有平日）', tom is None or tom['dim'], J(tom))
        if not await tap_head(pg, cdp, '其他日子…', exact=True):
            R.check('DATE：有「其他日子…」', False, J(s['heads'])); return
        s = await wait_menu(pg, cdp); days = rows_of(s); await shot(pg, 'DATE_days')
        R.note('DATE：其他日子 %s' % J(days))
        mon = [r for r in days if '（週一）' in r['t']]
        R.note('DATE：週一在日子清單裡＝%s（BB 原文「不列」：列出來＝記下來給 BB 看）' % ('列出來了' if mon else '沒有列'))
        mon_ok = None
        if mon:
            await tap_head(pg, cdp, mon[0]['t']); s = await wait_menu(pg, cdp); mt = rows_of(s); await shot(pg, 'DATE_monday_times')
            R.note('DATE：%s 的時間 %s' % (mon[0]['t'], J(mt)))
            live = [r for r in mt if not r['dim'] and r['t'] != '換一天']
            mon_ok = not live
            R.check('DATE：週一（%s）沒有可選的時間（全部灰掉）' % mon[0]['t'], mon_ok, J(live))
            if mt and mt[0]['t'] != '換一天':
                await tap_head(pg, cdp, mt[0]['t']); s = await settle_ui(pg, cdp)
                lg = await logs(pg, n0); R.note('DATE：點灰掉的 %s 以後說：%s' % (mt[0]['t'], J([e['text'] for e in lg if e['k'] == 'say'][-2:])))
            s = await wait_menu(pg, cdp)
            if not await tap_head(pg, cdp, '換一天'): R.note('DATE：沒有「換一天」：%s' % J(s['heads']))
            s = await wait_menu(pg, cdp); days = rows_of(s)
        else:
            R.check('DATE：週一沒有列在日子清單', True)
        tue = next((r for r in days if '（週二）' in r['t']), None)
        if tue:
            await tap_head(pg, cdp, tue['t']); s = await wait_menu(pg, cdp); tt = rows_of(s); R.note('DATE：%s 的時間 %s' % (tue['t'], J(tt)))
            R.check('DATE：週二（%s）12:10 可以選（對照）' % tue['t'], any(not r['dim'] and r['t'] != '換一天' for r in tt), J(tt))
            live = next((r for r in tt if not r['dim'] and r['t'] != '換一天'), None)
            if live:
                await tap_head(pg, cdp, live['t']); s = await settle_ui(pg, cdp, 60)
                if s['heads']: R.note('DATE：之後的選單 %s → 最後一個' % J(s['heads'])); await P.tap_choice(pg, cdp, len(s['heads']) - 1); await settle_ui(pg, cdp)
        lg = await logs(pg, n0); print_log('DATE', lg)
        ivs = await pg.evaluate("w=>(GAME.G.invites||[]).filter(v=>v.who===w&&v.place==='pasta118').map(v=>({day:v.day,h:v.h,state:v.state,wd:(CALENDAR.dateOf(v.day).wd%7),key:CALENDAR.dateOf(v.day).key}))", WHO)
        R.note('DATE：G.invites 裡的義大麵屋 %s' % J(ivs))
        R.check('DATE：沒有排進週一的義大麵屋', not any(v['wd'] == 1 for v in ivs), J(ivs))
        await L.close_panels(pg, cdp)
        no_errs('DATE', errs)
    finally:
        await b.close()


async def part_drink(p):
    b, pg, cdp, errs = await boot(p, 'DRINK')
    try:
        mp = await pg.evaluate(r"""(()=>{ const L=typeof LANE118_LAYOUT!=='undefined'?LANE118_LAYOUT:null; const o={};
          for(const k of ['drink_a','drink_b']){ const P=(INVITE_DATA.places||[]).find(q=>q.id==='l118_'+k), q=L&&L.shops?L.shops.find(x=>x.id===k):null, s=typeof L118!=='undefined'?L118.shop(k):null;
            o[k]={place:P?{zone:P.zone,name:P.name,verb:P.verb,kind:P.kind,minStage:P.minStage,times:P.times,meetAt:P.meetAt||null}:null,layout:q?{side:q.side,z0:q.z0,z1:q.z1}:null,facade:L?L.facade:null,shop:s?s.name:null}; }
          return o; })()""")
        R.note('DRINK：兩間外帶店的邀約地點 %s' % J(mp))
        for k in ('drink_a', 'drink_b'):
            x = mp[k]; pl = x.get('place')
            if not R.check('DRINK：%s（%s）有邀約地點 l118_%s' % (k, x.get('shop'), k), bool(pl)): continue
            lay = x.get('layout') or {}; fa = x.get('facade') or {}
            exp = None
            if lay and fa: exp = [round(fa['west'] + 1.6 if lay['side'] == 'W' else fa['east'] - 1.6, 2), (lay['z0'] + lay['z1']) / 2]
            ma = pl.get('meetAt')
            R.check('DRINK：%s 見面點＝店門口（區域 lane118、meetAt %s ≈ 店面外 1.6 m、店面中間 %s）' % (k, J(ma), J(exp)), pl.get('zone') == 'lane118' and bool(ma) and bool(exp) and abs(ma[0] - exp[0]) < 0.05 and abs(ma[1] - exp[1]) < 0.05)
        if not (mp['drink_a'].get('place')): return
        snap, d = await base_snap(pg, cdp, 'DRINK', '2025-10-31', 11.0, 'dorm', 'FRI', [WHO], quiet=True)
        await load(pg, cdp, snap, 'DRINK：%s 朋友級距、有聯絡方式，%s（週五）11:00 宿舍' % (WHO, d['key']), quiet=True)
        n0 = await logn(pg); iv = None
        for attempt in range(3):
            if not await phone_invite(pg, cdp, WHO, 'DRINK%d' % attempt): break
            s = await wait_menu(pg, cdp); R.note('DRINK：約她去哪 %s' % J(s['full']))
            if not await tap_head(pg, cdp, '散步', exact=False): R.check('DRINK：有「散步」那一類', False, J(s['heads'])); break
            s = await wait_menu(pg, cdp); R.note('DRINK：散步那一層 %s' % J(s['full']))
            if not await tap_head(pg, cdp, mp['drink_a']['place']['verb'], exact=True) and not await tap_head(pg, cdp, mp['drink_a']['shop'] or '喝不喝', exact=False):
                R.check('DRINK：散步那一層有 %s' % mp['drink_a']['place']['verb'], False, J(s['heads'])); break
            s = await wait_menu(pg, cdp); T = rows_of(s); R.note('DRINK：時間 %s' % J(T)); await shot(pg, 'DRINK_times')
            live = [r for r in T if not r['dim'] and r['t'].startswith('今天')]
            if attempt >= len(live): R.note('DRINK：今天沒有第 %d 個能選的時間' % (attempt + 1)); await tap_head(pg, cdp, '算了'); break
            await tap_head(pg, cdp, live[attempt]['t']); s = await settle_ui(pg, cdp, 60)
            if s['heads']: R.note('DRINK：之後的選單 %s → 最後一個（不改時間）' % J(s['heads'])); await P.tap_choice(pg, cdp, len(s['heads']) - 1); await settle_ui(pg, cdp)
            ivs = await pg.evaluate("w=>(GAME.G.invites||[]).filter(v=>v.who===w&&v.place==='l118_drink_a'&&v.state==='accepted').map(v=>({id:v.id,day:v.day,h:v.h,zone:v.zone}))", WHO)
            if ivs: iv = ivs[0]; break
        lg = await logs(pg, n0); print_log('DRINK', lg)
        await L.close_panels(pg, cdp)
        if not R.check('DRINK：約成了（%s）' % J(iv), bool(iv)): return
        snap2 = await pg.evaluate("()=>GAME.snapshot()"); snap2 = snap2.get('G', snap2)
        snap2.update(hour=round(iv['h'] - 13 / 60, 3), zone='lane118', pos=None)
        await load(pg, cdp, snap2, 'DRINK：同一份進度 %.2f 讀到 118 巷（lane118 的落點；不是走過去）' % snap2['hour'], quiet=True)
        await P.init(pg)
        ma = mp['drink_a']['place']['meetAt']; sp = await pg.evaluate("(()=>{ const s=GAME.E.zone&&GAME.E.zone.spawn; return s?[s.x,s.z]:null; })()")
        t0 = time.time(); w = None; best = None
        while time.time() - t0 < 150:
            w = await P.who(pg, WHO)
            if w and not w['hidden']:
                dd = math.hypot(w['x'] - ma[0], w['z'] - ma[1]); best = dd if best is None else min(best, dd)
                if dd < 1.5 and time.time() - t0 > 10: break
            await pg.wait_for_timeout(1500)
        await shot(pg, 'DRINK_meet')
        R.note('DRINK：%s 在 %s；見面點 %s；巷子落點 %s；最近距離 %s' % (WHO, J(w), J(ma), J(sp), best and round(best, 2)))
        R.check('DRINK：她在喝不喝咖啡店門口等（離 meetAt ≤1.5 m）', best is not None and best <= 1.5, J(w))
        if sp: R.note('DRINK：見面點離巷子落點 %.1f m（不是在落點等）' % math.hypot(ma[0] - sp[0], ma[1] - sp[1]))
        no_errs('DRINK', errs)
    finally:
        await b.close()


def guard_url(u):
    return u if 'tapguard' in u else u + ('&' if '?' in u else '?') + 'tapguard'


async def part_storyburst(p):
    n, ms = int(ENV('BURSTN') or 20), int(ENV('BURSTMS') or 150)
    b, pg, cdp, errs = await boot(p, 'STORYBURST', guard_url(URL))
    try:
        gd = await pg.evaluate("window.__LE&&window.__LE.guard")
        R.note('STORYBURST：網址加 ?tapguard（webdriver 下才啟用選單防連點）：%s；連點 %d 下、每 %d ms' % (J(gd), n, ms))
        if not await need_lunch(pg, 'STORYBURST'): return
        D = await pg.evaluate(DATA); ids = D['who']; o = D['opts']
        snap, _ = await base_snap(pg, cdp, 'STORYBURST', '2025-09-21', 20.0, 'dorm', REL, ids)
        rows = await find(pg, 'STORYBURST 找會邀的日子')
        hits = [r for r in rows if r['P'] and not r['P'].get('no') and not r['P'].get('poor')]
        if not R.check('STORYBURST：找得到會邀的日子', bool(hits)): return
        rec = await run_with_retry(pg, cdp, 'BURST', snap, hits, 'accept', ids, burst=(n, ms))
        if not R.check('STORYBURST：照真實流程跑到邀約', bool(rec) and rec.get('stage1') == 'invite', J(rec and rec.get('stage1'))): return
        bu = rec.get('burst')
        if not R.check('STORYBURST：邀約那一句一出來就開始連點（有連點紀錄）', bool(bu)): return
        R.check('STORYBURST：連點期間邀約選單出來了（一路點到選項出現）', bool(bu['menus']) or any(d['sinceMenu'] is not None for d in bu['downs']), J(bu['menus']))
        R.check('STORYBURST：選項沒有被連點點掉（期間沒有任何 pick；結束時選單還在）', not bu['picks'] and any(h in (o.get('accept'), o.get('decline')) for h in bu['heads_after']), J({'picks': bu['picks'], 'heads': bu['heads_after']}))
        hit_btn = [d for d in bu['downs'] if d['btn']]
        R.note('STORYBURST：連點落在選項按鈕上的有 %d 下（%s）' % (len(hit_btn), J([(d['btn'], d['sinceMenu']) for d in hit_btn])))
        R.check('STORYBURST：連點以後照字選「%s」照常繼續（%s）' % (o.get('accept'), J(rec.get('tapped'))), rec.get('tapped') == o.get('accept') and len(rec['settles']) == 1, J(rec['settles']))
        no_errs('STORYBURST', errs)
    finally:
        await b.close()


FN = {'STORYBURST': part_storyburst, 'MAIN': part_main, 'SKIP': part_skip, 'DECL': part_decl, 'TABLE': part_table, 'E1': part_e1, 'E2': part_e2, 'E10': part_e10, 'DATE': part_date, 'DRINK': part_drink}


async def main():
    real = os.popen('git -C "%s" rev-parse --short=9 HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or 'tests', '..')).read().strip()
    print('CC L118D_E（118 巷課後午餐邀約）：SHA=%s worktree=%s；PARTS=%s；REL=%s；%s；Playwright 手機模擬 ≠ iPhone' % (SHA or '?', real or '?', ','.join(PARTS), REL, '橫向' if LAND else '直向'), flush=True)
    async with async_playwright() as p:
        for part in PARTS:
            if part not in FN: R.note('不認得的 PART：%s' % part); continue
            print('== %s' % part, flush=True); t0 = time.time()
            try: await FN[part](p)
            except Exception as e:
                import traceback; traceback.print_exc(); R.check('%s：沒有例外' % part, False, repr(e)[:300])
            R.note('%s 花了 %.1f 分鐘' % (part, (time.time() - t0) / 60))
    sys.exit(R.finish())


asyncio.run(main())
