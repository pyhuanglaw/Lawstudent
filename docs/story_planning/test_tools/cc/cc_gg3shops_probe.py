"""CC（帳號 A）11-11：GG3SHOPS——公館三間＋汀州路三間店的店內互動（GG-SHOPS3-SYS-1110／GG-SHOPS3-STORY-1110；BB／LAWWW 交辦）。Playwright 手機模擬（844×390 觸控）≠ iPhone。
受測：開發分支 7d9d7942544e37ada7ec9cb7e658332b5fd570cb（含 5c5d21e854 合併 GG-SHOPS3、666a1546e8 打烊統一 AA_700「我們今天要打烊了。」、泰米 14:00 午休「我們要午休了，五點再開喔。」）。
對照的程式：src/gg3shops3d.js（GG3：進門句、各店互動、打烊 closeOut、關門 door、約去泰米 registerInvite）、src/data/gg3_shops_lines.js（GG3_LINES，台詞全部以這份為準）、
  src/tz_shops3d.js＋src/data/tz_shops_layout.js（區域、出生點 spawn、出口「離開○○」→ out、座位 seats、互動點 points）、src/data/places.js（營業時間）、src/invites3d.js（約、前往、見面）。
六間（PARTS 用短 id；也認區域 id）：
  antai       安泰藥局（公館騎樓「進入安泰藥局」，gg_antai）：藥師櫃台一句、看貨架買 OK 繃 45、量血壓、看藥品櫃、坐下（血壓計前的椅子）
  xianguo     汀州鮮果（公館「進入汀州鮮果」，gg_xianguo）：秤重結帳買橘子 60、挑水果／切好的水果盒／看紙箱；配置沒有座位（只記，不判）
  rongendian  榮恩典文具社（公館「進入榮恩典文具社」，gg_rongendian）：結帳 上課…→原子筆 15、看筆／畫材／筆記本／畫架；配置沒有座位（只記）
  taimi       泰米村食（汀州路「進泰米村食」，tz_taimi）：點餐 打拋豬（午間 95）＋辣度「正常」→ 點好了 → 坐下吃 30 分鐘；看菜單／廚房／照片；坐下（兩人桌／四人桌那一句）
  xile        洗樂洗衣坊（汀州路「進洗樂洗衣坊」，tz_xile）：洗衣機 只洗 60＋在這裡等（坐塑膠椅）、兌幣機買洗衣精 10、看烘衣機／折衣桌／使用說明；坐著等
  yindehao    印得好（汀州路「進印得好」，tz_yindehao）：櫃台 印講義 30、看自助影印／價目表／裝訂樣本／自助列印電腦；用電腦（圓凳）
  每一間：【前置／捷徑】讀檔到店門外（配置 out）、營業中 → 搖桿走到店門（互動鍵是「進入○○／進○○」才算到）→ 按 → 店裡出生點、站得住 → 進門那一句（一天第一次，稿上 door 其中一句）
          → 看（每個 look 點，稿上那一句）→ 錢不夠先試一次（SHORT=0 不試；【前置／捷徑】把錢改少）：不扣錢、稿上那一句或「錢不夠」→ 錢改回來 → 正式點一次：
          扣的錢＝標價（GAME.money 的呼叫加起來）、錢不會變負、台詞照稿、toast「買了○○」→ 坐一次再起身（遊戲內部的坐下選單照按鈕字選「起身」）→ 走到「離開○○」按 → 回到街上配置 out 那一點、站得住、搖桿推得動。
          店裡每一句 GAME.say 都要是那一間 GG3_LINES 裡的字（不能有別的、不能有 {name}／undefined／暫定字）；沒有 JS 例外。
  CLOSE       ①印得好 22:00 打烊：21:45 讀檔門外 → 走進去 →【捷徑】時間撥到 21:58 → 店員「我們今天要打烊了。」→ 被請到門外 out、站得住、走得動 → 再按店門＝門口那一句（sign）＋開放時間 toast、不會進去
              ②泰米 14:00 午休：13:45 → 走進去 →【捷徑】13:58 → 老闆娘「我們要午休了，五點再開喔。」（不是打烊那句）→ 門外 → 再按店門＝休息的木牌那一句（rest）＋toast（CLOSE_WHICH=close,noon 可只跑一個）
  TAIMI_INVITE  手機「朋友」→ 她的「約」→ 吃飯 →「去泰米村食吃飯」→ 今天 HH:MM → 她答應（稿上 invite.acc 她那一句）→ 手機「今天」按「前往」→ 到泰米村食 → 兩個人坐下、見面演完
              （預設＝吃飯第 1 場那一段，坐下那幾句要出現；泰米村食自己的開場句 seatOpen 這時不演＝遊戲照第 N 場，只記）；進店不說進門句（今天約在這裡）；演完走「離開泰米村食」回汀州路。
  RENAME      （BB 加）日日定食改成泰米村食（AA_742 第 ③ 節；644eeb7d71、8bdaf14a3d）：
              ①【靜態】頁面載入的每一支 src/*.js（去掉註解）只有 gg3shops3d.js 的遷移表 S.RENAME 還寫著「日日定食」；原本三處（sis_grad3d.js 大一上榜聚餐：場景標題、Kevin 群組訊息、行程地點；
                story3d.js 明軒「公館一百元以內」清單；story3d.js 大二上榜聚餐：Kevin 訊息、行程地點）現在都是泰米村食的字；
              ② 頁面資料：STORY.MX_FM1 清單、約人的地點（INVITE_DATA.places）、店名（PLACES.names、Z3.ZONES）、公館／汀州路的互動鍵字、畫面上的字都沒有「日日定食」；
                【捷徑】GAME.addNote 加明軒那份清單、打開筆記本：看到「泰米村食（汀州路）」；
              ③ 舊存檔：【前置／捷徑】在遊戲裡做一份「舊版本會存成的樣子」（G.outings 兩筆今天的上榜聚餐「公館・日日定食」「公館的日日定食」＋一筆做過的；
                RENAME_FULL＝1（預設）再加 7d9d 以前就收到的 Kevin 群組訊息、明軒清單的筆記本那一則，都是舊字）→ GAME.snapshot → GAME.applySave 讀回來（＝讀舊存檔，會跑 migrate）
                → G.outings 的地點、標題換成泰米村食（AA_742 ③ 的範圍）、手機「今天」顯示泰米村食、整個 G 和畫面（手機今天／訊息／筆記本）沒有「日日定食」（BB 的標準；不在遷移範圍的欄位會列出來）
  TAIMI_INVITE_SO  同上，但【前置／捷徑】把她今天的吃飯場次記成算過（ACTN.eat.last＝今天）→ 坐下以後要演泰米村食的開場句（seatOpen 兩則之一）
走路：一律搖桿（CDP 觸控按 #joy；照 E.pathTo 前方 1.2 m 推），每推一下之前看狀態：互動鍵是要的字＝到了；出現對話／選單／手機＝停下來交回主迴圈處理（乙 5、13）。
選單：照字選（GAME.choose 的掛勾看得到選項字）；掛勾抓不到的遊戲內部選單（坐下選單）照按鈕字選，並記一行「遊戲內部選單」；沒進展每 30 秒記一次狀態＋截圖（乙 4）。
環境變數：PARTS（預設六間＋CLOSE＋TAIMI_INVITE＋RENAME）、SHA、DAY（預設 2025-10-08 週三；避開 10-06 中秋、10-10 國慶、10-13 颱風）、SHORT（預設 1）、LOOKS（預設 1）、SIT（預設 1）、H_<短 id>（各店時間）、
  CLOSE_WHICH（close,noon）、RENAME_FULL（1）、TAIMI_WHO（逗號分隔，依序試）、ANTAI_ITEM、FRUIT_ITEM、RONG_ITEM。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=antai,taimi,CLOSE python3 cc_gg3shops_probe.py <url> <out>（URL 不加 ?turbo）
      python3 cc_gg3shops_probe.py --node-check　＝把這支裡每一段 JS 常數抽出來跑 node --check（不開瀏覽器）"""
import os, sys, json, asyncio, time, math, re, subprocess, tempfile
LWT = os.environ.get('LW_TESTS') or 'tests'
sys.path.insert(0, LWT); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
J = lambda o: json.dumps(o, ensure_ascii=False)

# ---------------------------------------------------------------- 設定
SHOP_IDS = ['antai', 'xianguo', 'rongendian', 'taimi', 'xile', 'yindehao']
ZONE_OF = {'antai': 'gg_antai', 'xianguo': 'gg_xianguo', 'rongendian': 'gg_rongendian', 'taimi': 'tz_taimi', 'xile': 'tz_xile', 'yindehao': 'tz_yindehao'}
SID_OF = {v: k for k, v in ZONE_OF.items()}
DAY = os.environ.get('DAY') or '2025-10-08'
H_DEF = {'antai': 11.0, 'xianguo': 11.0, 'rongendian': 11.0, 'taimi': 12.0, 'xile': 11.0, 'yindehao': 11.0}   # 都在營業時間裡（places.js：泰米 11–14 午間打拋 95）
MONEY0 = 1000
SHORT = os.environ.get('SHORT', '1') != '0'
LOOKS = os.environ.get('LOOKS', '1') != '0'
SIT = os.environ.get('SIT', '1') != '0'
ANTAI_ITEM = os.environ.get('ANTAI_ITEM') or 'OK 繃（一盒）'
FRUIT_ITEM = os.environ.get('FRUIT_ITEM') or '橘子（一斤）'   # 60＝不是 5 結尾（5 結尾遊戲會少算 5 元「算你整數」，另外的規則）
RONG_ITEM = os.environ.get('RONG_ITEM') or '原子筆（一枝）'
CLOSE_WHICH = [x for x in (os.environ.get('CLOSE_WHICH') or 'close,noon').split(',') if x]
TAIMI_WHO = [x for x in (os.environ.get('TAIMI_WHO') or 'heroine_01,heroine_02,heroine_03,classmate_peishan,heroine_05,heroine_04').split(',') if x]
INV_DAYS = [DAY, '2025-10-18', '2025-10-25', '2025-11-01', '2025-10-09', '2025-10-15', '2025-11-08']
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'KX_DEC3_MIGRATED': True, 'YT_JOB_V': 1, 'NAMECARD_V': 1, 'FAFU_PURE': 1, 'FAFU_STORY_SEEN': 0}   # 同 cc_act_probe.py load_day（不加 dating_*）
REL3 = dict(fam=46, trust=30, comf=26, npcRom=8)   # DATE.stageNum 第 3 階（cc_act_probe.py REL；泰米「有點熟以上」minStage FAMILIAR）
EXIT_WORDS = ('不用了', '算了', '返回', '下次再說', '換一天', '起身')
BAD = re.compile(r'\{[A-Za-z_]+\}|undefined|NaN|null|TODO|FIXME|PLACEHOLDER|暫定|佔位|\?\?\?')

# ---------------------------------------------------------------- 頁面上的 JS（只記不改的掛勾；查詢）
HOOK_JS = r"""(()=>{ if(!window.__GGH){ window.__GGH=1; window.__GE=[];
  const G=()=>GAME.G, push=o=>{ try{ o.i=window.__GE.length; o.h=+(+G().hour).toFixed(3); o.z=G().zone; window.__GE.push(o); }catch(e){} };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',who:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ const rec={k:'ch',opts:(o||[]).map(x=>typeof x==='string'?x:((x&&x.t)||'')),hints:(o||[]).map(x=>(x&&x.hint)?String(x.hint):''),dim:(o||[]).map(x=>!!(x&&x.dim)),pick:null}; push(rec);
    const p=c0.apply(this,arguments); try{ Promise.resolve(p).then(k=>{ rec.pick=(k==null?-1:k); }); }catch(e){} return p; };
  const m0=GAME.money; GAME.money=function(d,why){ const b=G().money; const r=m0.apply(this,arguments); push({k:'money',d:+d,why:why==null?null:String(why),before:b,after:G().money}); return r; };
  const t0=GAME.toast; GAME.toast=function(t){ push({k:'toast',t:String(t==null?'':t)}); return t0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(a,b){ push({k:'cap',t:String(b==null?a:b)}); return p0.apply(this,arguments); }; }
  const tb=document.getElementById('toast'); if(tb) new MutationObserver(()=>{ const x=(tb.innerText||'').trim(); const L=window.__GE; let last=null; for(let i=L.length-1;i>=0;i--) if(L[i].k==='toastDom'){ last=L[i]; break; } if(x&&(!last||last.t!==x)) push({k:'toastDom',t:x}); }).observe(tb,{childList:true,subtree:true,characterData:true});
  window.addEventListener('error',e=>push({k:'err',t:String(e.message)}));
  window.addEventListener('unhandledrejection',e=>push({k:'err',t:String(e.reason&&e.reason.stack||e.reason).slice(0,300)}));
  const ce=console.error.bind(console); console.error=(...a)=>{ push({k:'cerr',t:a.map(x=>String(x&&x.stack||x)).join(' ').slice(0,300)}); return ce(...a); };
  const cw=console.warn.bind(console); console.warn=(...a)=>{ const s=a.map(x=>String(x&&x.stack||x)).join(' ').slice(0,300); if(/GG3|EAT\.|INV\.|STORY\.onSeat/.test(s)) push({k:'cwarn',t:s}); return cw(...a); };
 } return window.__GE.length; })()"""

EV_JS = r"""(i=>(window.__GE||[]).slice(i))"""

ST_JS = r"""(()=>{ const D=GAME.D||{}, ch=document.getElementById('choices'), tx=document.getElementById('dlgText'), nm=document.getElementById('dlgName'), ph=document.getElementById('phone'), it=document.getElementById('interact'), f=document.getElementById('fade');
  const B=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null):[];
  const E=window.__GE||[]; let last=null; for(let i=E.length-1;i>=0;i--) if(E[i].k==='ch'){ last=E[i]; break; }
  const EE=GAME.E, P=EE&&EE.player, o=P&&P.obj.position;
  return {dlg:!!D.active, typing:!!D.typing, full:String(D.full||''), shown:(tx&&tx.textContent)||'', name:(nm&&nm.style.display!=='none'&&nm.textContent)||'',
    nb:B.length, btn:B.map(b=>(b.innerText||'').trim().replace(/\s*\n\s*/g,' ')), ch:last&&last.pick==null?{i:last.i,opts:last.opts,dim:last.dim}:null,
    phone:!!(ph&&!ph.classList.contains('hide')), zone:GAME.G.zone, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(3), money:GAME.G.money,
    busy:!!(P&&P.busy), seat:!!(P&&P.seat), seatT:P&&P.seat?(P.seat.table||null):null, seatXZ:P&&P.seat?[+(+P.seat.x).toFixed(2),+(+P.seat.z).toFixed(2)]:null,
    x:o?+o.x.toFixed(2):null, z:o?+o.z.toFixed(2):null, lv:P?(P.lv|0):0, stand:EE&&EE.canStand&&o?!!EE.canStand(o.x,o.z,0.3,P.lv|0):null,
    ent:!!(GAME.isEntering&&GAME.isEntering()), fade:!!(f&&f.classList.contains('on')), paused:!!(EE&&EE.paused),
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,30):'', fb:GAME.walkFallbacks|0}; })()"""

DATA_JS = r"""(()=>{ const ids=['antai','xianguo','rongendian','taimi','xile','yindehao']; const lay={};
  for(const id of ids){ const L=(typeof TZ_SHOPS_LAYOUT!=='undefined'&&TZ_SHOPS_LAYOUT)?TZ_SHOPS_LAYOUT[id]:null; if(!L) continue;
    lay[id]={zone:L.zone,name:L.name,spawn:L.spawn,exit:L.exit,out:L.out,outZone:L.outZone,door:L.door||null,seats:(L.seats||[]).map(s=>({id:s.id,table:s.table,x:s.x,z:s.z,label:s.label||'坐下'})),
      tables:(L.tables||[]).map(t=>({id:t.id,kind:t.kind})),points:(L.points||[]).map(p=>({id:p.id,label:p.label,kind:p.kind,x:p.x,z:p.z,r:p.r}))}; }
  const zs=['gg_antai','gg_xianguo','gg_rongendian','tz_taimi','tz_xile','tz_yindehao'];
  return {lines:typeof GG3_LINES!=='undefined'?GG3_LINES:null, lay, hasGG3:typeof GG3!=='undefined', zonesOk:zs.map(z=>[z,!!(typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[z]&&Z3.ZONES[z]._gg3)]),
    hours:Object.fromEntries(zs.map(z=>[z,(typeof PLACES!=='undefined'&&PLACES.hours&&PLACES.hours[z])?PLACES.hours[z].text:null]))}; })()"""

LAYOUT_OUT_JS = r"""(id=>{ const L=TZ_SHOPS_LAYOUT[id]; return L?{out:L.out,door:L.door||null}:null; })"""

ITS_JS = r"""(()=>(GAME.E.interactables||[]).map((i,k)=>({k,label:typeof i.label==='function'?String(i.label()):String(i.label||''),x:+(+i.x).toFixed(2),z:+(+i.z).toFixed(2),r:i.radius||1,kind:i.kind||null,pt:i.tzPoint||null,seatId:i.tzSeat||null,
  seat:i.seat?{x:+(+i.seat.x).toFixed(2),z:+(+i.seat.z).toFixed(2),table:i.seat.table||null}:null,to:i.exit?i.exit.to:null,spawn:i.exit&&i.exit.spawn?i.exit.spawn:null,hidden:!!i.hidden,gg3:i.gg3||null,look:i.look||null})))()"""

CAL_JS = r"""(k=>{ const d=STORY.dayOfKey(k); const x=CALENDAR.dateOf(d), t=CALENDAR.termOf?CALENDAR.termOf(d):null; return {k,d,wd:((x.wd%7)+7)%7,hol:!!(CALENDAR.holiday&&CALENDAR.holiday(d)),typh:!!(CALENDAR.typhoon&&CALENDAR.typhoon(d)),term:t?t.id:null,week:t?t.week:null,exam:t?(t.exam||null):null}; })"""

OPEN_JS = r"""(k=>{ const G=GAME.G; return {open:PLACES.isOpen(k,G.hour,G.day), win:PLACES.windowsOf?PLACES.windowsOf(k,G.day):null, today:PLACES.todayText?PLACES.todayText(k,G.day):null, typh:!!(PLACES.typhoonClosed&&PLACES.typhoonClosed(k,G.day)), closed:PLACES.closedText?PLACES.closedText(k,G.hour,G.day):null}; })"""

EXPECT_JS = r"""(k=>{ const G=GAME.G, T=GG3_LINES[k], out={}; const h=((+G.hour%24)+24)%24;
  if(k==='gg_antai'){ const X=T.talk, m=GG3.month(G); const sp=[].concat(h>=21?X.night:[],GG3.examWeek(G)?X.exam:[],[11,12,1,2].includes(m)?X.cold:[]); const seen=(G.flags&&G.flags.GG3_SEEN)||{};
    const tk=G.flags&&G.flags.GG3_TALK; out.talk=(tk&&tk.d===G.day&&typeof tk.t==='string')?[tk.t]:(sp.length?sp:X.normal.concat(typeof seen.gg_antai==='number'&&seen.gg_antai<G.day?X.again:[])); out.goods=GG3.antaiGoods(G).map(g=>({n:g.n,p:g.p,look:g.look})); }
  if(k==='gg_xianguo'||k==='gg_rongendian'){ const r=(G.flags&&G.flags.GG3_SIT)||{}; const s=r[k]===G.day?null:GG3.sitDue(G,k); out.sit=s; out.sitLine=s?T.sit[s].line:null; }
  if(k==='gg_xianguo') out.items=GG3.fruitItems(G).map(q=>({n:q.n,p:q.p,base:q.g.n,look:q.g.look,cut:T.cut.items.includes(q.g.n)}));
  if(k==='tz_yindehao') out.menu=GG3.yinMenu(G).map(m=>({t:m.t,p:m.p,min:m.min,sub:!!m.sub,when:m.when||null}));
  if(k==='tz_taimi') out.menu=T.menu.map(it=>({n:it.n,p:GG3.taimiPrice(it,G),lunch:GG3.lunchNow(it,G)}));
  out.month=GG3.month(G); out.examWeek=GG3.examWeek(G); out.finalsNear=GG3.finalsNear(G); out.year=GG3.year(G); out.termWeek=GG3.termWeek(G); out.preExam=GG3.preExam(G);
  return out; })"""

RONG_AFTER_JS = r"""(n=>GG3.rongAfter([n]))"""
TAIMI_FILTER_JS = r"""(names=>{ const T=GG3_LINES.tz_taimi; return {after:T.after.filter(a=>GG3.needs(a[1],names)), eat:T.eat.filter(t=>GG3.needs(t,names)&&Object.keys(GG3.TAIMI_KEY).some(n=>t.includes(GG3.TAIMI_KEY[n])))}; })"""

AHEAD_JS = r"""(a=>{ const E=GAME.E,P=E.player,o=P.obj.position; const r=E.pathTo?E.pathTo(o.x,o.z,P.lv|0,a[0],a[1],P.lv|0):null; if(!r||!r.length) return null; let ax=o.x,az=o.z,acc=0;
  for(const q0 of r){ const q=Array.isArray(q0)?q0:[q0.x,q0.z]; const Lq=Math.hypot(q[0]-ax,q[1]-az); if(acc+Lq>=1.2){ const f=(1.2-acc)/Math.max(Lq,1e-6); return [ax+(q[0]-ax)*f,az+(q[1]-az)*f]; } acc+=Lq; ax=q[0]; az=q[1]; } return [ax,az]; })"""

PATHDIAG_JS = r"""(a=>{ const E=GAME.E,P=E.player,o=P.obj.position; const r=E.pathTo?E.pathTo(o.x,o.z,P.lv|0,a[0],a[1],P.lv|0):null;
  return {from:[+o.x.toFixed(2),+o.z.toFixed(2)], n:r?r.length:null, pts:r?r.slice(0,8).map(p=>Array.isArray(p)?[+(+p[0]).toFixed(2),+(+p[1]).toFixed(2)]:[+(+p.x).toFixed(2),+(+p.z).toFixed(2)]):null, standTarget:E.canStand?!!E.canStand(a[0],a[1],0.3,P.lv|0):null}; })"""

HIT_JS = r"""(s=>{ const e=document.querySelector(s); if(!e) return {hit:false,top:null}; const r=e.getBoundingClientRect(); const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {hit:!!h&&(h===e||e.contains(h)), top:h?(h.id||String(h.className).slice(0,40)||h.tagName):null}; })"""

OCC_JS = r"""(a=>(GAME.E.npcs||[]).some(n=>n&&((n.seat&&Math.hypot(n.seat.x-a[0],n.seat.z-a[1])<0.4)||(n.seatTarget&&Math.hypot(n.seatTarget.x-a[0],n.seatTarget.z-a[1])<0.4))))"""

IDLE_JS = r"""(()=>{ const E=GAME.E, P=E.player, D=GAME.D||{}; const L=window.__GE||[]; let last=null; for(let i=L.length-1;i>=0;i--) if(L[i].k==='say'){ last=L[i]; break; }
  return {me:{x:+P.obj.position.x.toFixed(2),z:+P.obj.position.z.toFixed(2),busy:!!P.busy,seat:!!P.seat,pose:P.pose||null}, depth:D.busyDepth|0, by:(D.busyWho||[]).slice(-3), dlg:!!D.active,
    ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, paused:!!E.paused, fade:!!(document.getElementById('fade')&&document.getElementById('fade').classList.contains('on')), zone:GAME.G.zone, hour:+(+GAME.G.hour).toFixed(2),
    top:(()=>{ const e=document.elementFromPoint(innerWidth/2,innerHeight*0.8); return e?(e.id||String(e.className).slice(0,40)||e.tagName):null; })(), last, errs:L.filter(e=>/err|warn/.test(e.k)).slice(-4)}; })()"""

SET_HOUR_JS = r"""(h=>{ GAME.G.hour=h; return +(+GAME.G.hour).toFixed(3); })"""
SET_MONEY_JS = r"""(m=>{ GAME.G.money=m; return GAME.G.money; })"""

# 約去泰米（照 cc_act_probe.py 的 SETUP_JS／TIMES_JS／IV_JS／NPC_JS 縮短）
SETUP_INV_JS = r"""(q=>{ const G=GAME.G, F=G.flags||(G.flags={}); const out={notes:[]};
  G.contacts=G.contacts||{}; out.hadContact=G.contacts[q.who]!=null; if(!out.hadContact) G.contacts[q.who]=1; G.money=Math.max(G.money|0,3000); G.invites=[]; G.weather='clear';
  for(const k of Object.keys(F)) if(k.indexOf('dating_')===0&&F[k]){ delete F[k]; out.notes.push('拿掉 '+k); }
  Object.assign(SOCIAL.rel(q.who), q.rel);
  if(typeof ARCS!=='undefined'&&ARCS.rec){ const r=ARCS.rec(G,q.who); r.last=G.day; out.notes.push('ARCS 她的故事線今天已演過一拍（中途不換成故事線）'); }
  let ups=0; if(SOCIAL.upLine&&SOCIAL.markUp){ for(let i=0;i<10;i++){ const U=SOCIAL.upLine(q.who,{place:'tz_taimi',outing:true}); if(!U) break; SOCIAL.markUp(q.who,U.k); ups++; } } out.ups=ups;
  if(q.so){ const A=F.ACTN&&typeof F.ACTN==='object'?F.ACTN:(F.ACTN={}); const RA=A.eat&&typeof A.eat==='object'?A.eat:(A.eat={}); const r=RA[q.who]&&typeof RA[q.who]==='object'?RA[q.who]:{n:0,k:1,last:null,rot:-1}; r.last=G.day; RA[q.who]=r; out.notes.push('ACTN.eat 今天已算過（演泰米的開場句 seatOpen）'); }
  out.stage=typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(q.who):null; out.canInvite=INV.canInvite(G,q.who); out.whyNot=INV.whyNot?INV.whyNot(G,q.who):'';
  const P=INV.place('tz_taimi'); out.place=P?{id:P.id,verb:P.verb,name:P.name,minStage:P.minStage,cats:INV.catsOf?INV.catsOf(P):null}:null; out.placeWhy=P&&INV.placeWhy?(INV.placeWhy(G,q.who,P)||''):'';
  out.ax=(()=>{ try{ const a=typeof STUDYN!=='undefined'&&STUDYN.act?STUDYN.act('eat').pick(G,q.who):null; return a?JSON.parse(JSON.stringify(a)):null; }catch(e){ return {err:String(e)}; } })();
  return out; })"""

TIMES_JS = r"""(q=>{ const G=GAME.G, P=INV.place(q.pid); if(!P) return {err:'沒有地點'}; const T=INV.timeOptions(G,false,P,q.who), out=[];
  for(const x of T){ if(x.day!==G.day||x.dim||x.now){ out.push({t:x.t,skip:x.dim?'灰':(x.now?'現在':'不是今天')}); continue; }
    let r=null; try{ r=INV.personal(G,q.who,P,x.day,x.h,INV.decide(G,q.who,P.id,x.day,x.h)); }catch(e){ r={res:'err',why:String(e)}; }
    let te=null; try{ te=typeof TERMEND!=='undefined'&&TERMEND.playerInvite?TERMEND.playerInvite(G,q.who,P,{day:x.day,h:x.h}):null; }catch(e){ te={err:String(e)}; }
    out.push({t:x.t,h:x.h,res:r&&r.res,why:r&&r.why||null,te:!!te,lines:r&&r.lines||null}); }
  return out; })"""

IV_JS = r"""(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v?{id:v.id,st:v.state,ph:(v.lead&&v.lead.ph)||null,place:v.place,zone:v.zone,h:v.h,mid:!!v.mid,gz:GAME.G.zone}:null; })"""
IV_FIND_JS = r"""(q=>{ const L=(GAME.G.invites||[]).filter(v=>v.who===q.w&&v.place===q.p&&v.day===GAME.G.day&&v.state==='accepted'); const v=L[L.length-1]; return v?{id:v.id,h:v.h,zone:v.zone||null}:null; })"""
NPC_JS = r"""(w=>{ const n=(GAME.npc&&GAME.npc[w])||(GAME.E.npcs||[]).find(q=>q.id===w||q.charId===w); return n&&n.obj?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0,seat:!!n.seat}:null; })"""
ACTN_JS = r"""(w=>{ const F=GAME.G.flags||{}; const r=((F.ACTN||{}).eat||{})[w]; return r?JSON.parse(JSON.stringify(r)):null; })"""
TODAY_TXT_JS = r"""(()=>((document.getElementById('phoneBody')||{}).innerText||'').trim())()"""

# RENAME（日日定食 → 泰米村食）
OLD = '日日定食'
SRC_SCAN_JS = r"""(async()=>{ const out=[], srcs=[...document.scripts].map(x=>x.src).filter(u=>/\/src\//.test(u));
  for(const u of srcs){ let t=''; try{ t=await (await fetch(u)).text(); }catch(e){ out.push({f:u,err:String(e)}); continue; }
    if(t.indexOf('日日定食')<0) continue; const code=t.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' ')); const L=code.split('\n');
    L.forEach((ln,i)=>{ const c=ln.replace(/(^|[^:'"\\])\/\/.*$/,'$1'); if(c.indexOf('日日定食')>=0) out.push({f:u.split('?')[0].replace(/^.*\/src\//,'src/'),line:i+1,code:c.trim().slice(0,220)}); }); }
  return {n:srcs.length,hits:out}; })()"""
SRC_HAS_JS = r"""(async q=>{ const u=[...document.scripts].map(x=>x.src).find(x=>x.split('?')[0].endsWith(q.f)); if(!u) return {err:'沒有載入 '+q.f};
  const t=await (await fetch(u)).text(); const code=t.replace(/\/\*[\s\S]*?\*\//g,''); return {has:q.needles.map(n=>code.indexOf(n)>=0)}; })"""
RENAME_DATA_JS = r"""(()=>{ const old='日日定食', P=(typeof INVITE_DATA!=='undefined'&&INVITE_DATA.places)||[]; const tz=P.find(p=>p&&p.id==='tz_taimi');
  const M=typeof STORY!=='undefined'?STORY.MX_FM1:null; const zn=typeof Z3!=='undefined'&&Z3.ZONES?Object.values(Z3.ZONES).map(z=>z&&z.name).filter(Boolean):[];
  const pn=typeof PLACES!=='undefined'&&PLACES.names?Object.values(PLACES.names):[];
  return {mx:M?{body:M.body,rows:M.rows.map(r=>r[0])}:null, tz:tz?{name:tz.name,verb:tz.verb}:null, placesOld:P.filter(p=>p&&JSON.stringify([p.name,p.verb,p.verbStudy||'']).indexOf(old)>=0).map(p=>p.id),
    zonesOld:zn.filter(n=>n.indexOf(old)>=0), namesOld:pn.filter(n=>String(n).indexOf(old)>=0), gg3:typeof GG3!=='undefined'?{rename:GG3.RENAME,eatShop:GG3.EAT_SHOP}:null}; })()"""
LABELS_OLD_JS = r"""(()=>{ const old='日日定食'; const its=(GAME.E.interactables||[]).map(i=>[typeof i.label==='function'?String(i.label()):String(i.label||''),String(i.look||'')]);
  return {n:its.length, old:its.filter(x=>(x[0]+x[1]).indexOf(old)>=0), taimi:its.filter(x=>(x[0]+x[1]).indexOf('泰米村食')>=0).map(x=>x[0]), body:(document.body.innerText||'').indexOf(old)>=0}; })()"""
OLD_BODY_JS = r"""(()=>{ const M=STORY.MX_FM1; const rows=M.rows.map(r=>r[0].indexOf('泰米村食')===0?['日日定食','今日定食（只有午餐）','95','剛好卡在一百以內。晚餐一百二，不算。']:r);
  return '按 CP 值排。不接受申訴。<br>'+rows.map((r,i)=>(i+1)+'. '+r[0]+'｜'+r[1]+'　'+r[2]+'<br>　'+r[3]).join('<br>')+'<br>'+M.tail; })()"""
BUILD_OLD_JS = r"""(q=>{ const G=GAME.G, d=G.day; const R=OUT.rec(G); R.length=0;
  R.push({id:'sisg_rank_dinner',ev:'ev_sis_results_dinner_y1',day:d,h:19,late:0.25,place:'公館・日日定食',title:'學姊上榜聚餐（公館・日日定食）',travel:'走過去約 15 分鐘',travelH:0.25,alarm:true,state:'planned'});
  R.push({id:'sis_m3_dinner',ev:'ev_sis_results_dinner',day:d,h:20,late:0.25,place:'公館的日日定食',title:'學姊上榜聚餐',travel:'走過去約 10 分鐘',travelH:1/6,state:'planned'});
  R.push({id:'cc_old_lunch',ev:null,day:d-3,h:12,late:0.25,place:'日日定食',title:'午餐（日日定食）',state:'done'});
  if(q.full){ PHONE.postAt(G,{th:'g:family_law',from:'kevin',name:'Kevin',text:'學姊上榜聚餐！這週五七點，公館的日日定食。這次我們請學姊',tag:'cc_old_kevin'},d-1,21);
    if(GAME.addNote) GAME.addNote('mx_fm1',STORY.MX_FM1.title,q.body);
    /* BB 19:30（35c4b140c 遷移 G.phone.q）：還沒送到的訊息（含回覆選項）也放一則舊字 */
    if(PHONE.at) PHONE.at(G,d+1,21,[{th:'g:family_law',from:'kevin',name:'Kevin',text:'明天七點，公館的日日定食，別遲到。',ask:{id:'cc_old_ask',opts:[{t:'好，日日定食見。'},{t:'我可能晚一點到日日定食。',post:'我可能晚一點到日日定食。'}]}}],'cc_old_q'); }
  const snap=JSON.parse(JSON.stringify(GAME.snapshot())); window.__ccOld=snap; const t=JSON.stringify(snap); return {n:t.split('日日定食').length-1, outs:snap.outings.length}; })"""
APPLY_OLD_JS = r"""(async()=>{ await GAME.applySave(JSON.parse(JSON.stringify(window.__ccOld))); return true; })()"""
G_OLD_JS = r"""(()=>{ const old='日日定食', hits=[]; const walk=(o,p)=>{ if(hits.length>40) return; if(typeof o==='string'){ if(o.indexOf(old)>=0) hits.push([p,o.slice(0,90)]); return; } if(!o||typeof o!=='object') return; for(const k of Object.keys(o)) walk(o[k],p+'.'+k); };
  walk(GAME.G,'G'); const outs=(GAME.G.outings||[]).map(q=>({id:q.id,place:q.place,title:q.title,state:q.state})); return {hits,outs}; })()"""
PANEL_TXT_JS = r"""(id=>((document.getElementById(id)||{}).innerText||'').trim())"""

ALL_JS = [HOOK_JS, EV_JS, ST_JS, DATA_JS, LAYOUT_OUT_JS, ITS_JS, CAL_JS, OPEN_JS, EXPECT_JS, RONG_AFTER_JS, TAIMI_FILTER_JS, AHEAD_JS, PATHDIAG_JS, HIT_JS, OCC_JS, IDLE_JS,
          SET_HOUR_JS, SET_MONEY_JS, SETUP_INV_JS, TIMES_JS, IV_JS, IV_FIND_JS, NPC_JS, ACTN_JS, TODAY_TXT_JS,
          SRC_SCAN_JS, SRC_HAS_JS, RENAME_DATA_JS, LABELS_OLD_JS, OLD_BODY_JS, BUILD_OLD_JS, APPLY_OLD_JS, G_OLD_JS, PANEL_TXT_JS]   # node --check 用


def node_check():
    bad = 0
    for k, js in enumerate(ALL_JS):
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
            f.write('const __cc%d = %s;\n' % (k, js)); p = f.name
        r = subprocess.run(['node', '--check', p], capture_output=True, text=True); os.unlink(p)
        print(('PASS' if r.returncode == 0 else 'FAIL') + ' node --check JS 常數 #%d %s' % (k, (r.stderr.strip().splitlines() or [''])[-1][:200]))
        bad += r.returncode != 0
    print('ALL PASS' if not bad else 'FAILED %d' % bad)
    return 1 if bad else 0


if len(sys.argv) > 1 and sys.argv[1] == '--node-check':
    sys.exit(node_check())

import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
R = L.Run('gg3shops', OUT); D.setup(R, OUT)
SHA = os.environ.get('SHA') or '?'
_P = [p.strip() for p in (os.environ.get('PARTS') or ','.join(SHOP_IDS + ['CLOSE', 'TAIMI_INVITE', 'RENAME'])).split(',') if p.strip()]
PARTS = [SID_OF.get(p, p) if p in SID_OF else (p.lower() if p.lower() in SHOP_IDS else p.upper()) for p in _P]
DATA = {}; CAL = {}
LOGF = open(os.path.join(OUT, 'gg3shops_lines.txt'), 'a', encoding='utf-8')


def log(s):
    print(s, flush=True); LOGF.write(s + '\n'); LOGF.flush()


def flat(o, acc=None):
    """GG3_LINES 那一間裡所有的字（店裡每一句 GAME.say 都要在這裡面）"""
    acc = set() if acc is None else acc
    if isinstance(o, str): acc.add(o)
    elif isinstance(o, dict):
        for v in o.values(): flat(v, acc)
    elif isinstance(o, list):
        for v in o: flat(v, acc)
    return acc


def fname(t):
    return re.sub(r'\W+', '_', t).strip('_')[:40]


def pair(l):
    """稿的一句 [說話的人, 字] → (說話的人 or '', 字)"""
    return ((l[0] or ''), l[1]) if isinstance(l, list) else ('', l)


# ---------------------------------------------------------------- 狀態、觸控
async def st(pg):
    return await pg.evaluate(ST_JS)


async def mark(pg):
    return await pg.evaluate(HOOK_JS)


async def evs(pg, i0):
    E = await pg.evaluate(EV_JS, i0)
    return {'says': [((e.get('who') or ''), e.get('t', '')) for e in E if e.get('k') == 'say'], 'money': [e for e in E if e.get('k') == 'money'],
            'toasts': [e.get('t', '') for e in E if e.get('k') in ('toast', 'toastDom')], 'chs': [e for e in E if e.get('k') == 'ch'],
            'caps': [e.get('t', '') for e in E if e.get('k') == 'cap'], 'errs': [e for e in E if e.get('k') in ('err', 'cerr', 'cwarn')], 'all': E}


class Menu:
    """選單剛出來 350 ms 內的點擊會被吃掉（game3d tapTooSoon）：同一組選項看到 ≥ 650 ms 才點；點了 2.5 秒還在＝再點一次（cc_act_probe.py）"""
    def __init__(self): self.key = None; self.t0 = 0; self.tapped = 0

    async def ready(self, s):
        k = (s['ch'] or {}).get('i') if s['ch'] else tuple(s['btn'])
        if k != self.key: self.key = k; self.t0 = time.time(); self.tapped = 0; return False
        if self.tapped and time.time() - self.tapped < 2.5: return False
        return time.time() - self.t0 >= 0.65


async def close_phone(pg, cdp):
    for _ in range(3):
        if not await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"): return True
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phone button')].find(x=>x.textContent.trim()==='收起來'); if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        else: await L.tap(pg, cdp, '#btnPhoneClose')
        await pg.wait_for_timeout(700)
    return not await pg.evaluate("!document.getElementById('phone').classList.contains('hide')")


async def tap_btn(pg, cdp, i):
    """先確認手指底下就是那顆鈕（被手機、面板蓋住就先收起來），再按（乙 4）"""
    HIT = "(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent!==null)[i]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; const h=document.elementFromPoint(x,y); return {c:[x,y],hit:!!h&&(h===b||b.contains(h)),top:h?(h.id||String(h.className).slice(0,30)):null}; })"
    q = await pg.evaluate(HIT, i)
    if not q: return False
    if not q['hit']:
        R.note('選項 #%d 被 %s 蓋住：先收手機、面板' % (i, q['top']))
        await close_phone(pg, cdp); await L.close_panels(pg, cdp); await pg.wait_for_timeout(600)
        q = await pg.evaluate(HIT, i)
        if not q: return False
    await L.touch_tap(cdp, q['c'][0], q['c'][1]); return True


async def tap_dlg(pg, cdp, s):
    """打字機：打完才翻頁（cc_act_probe.py）"""
    if s['typing'] and s['shown'] != s['full']:
        await pg.wait_for_timeout(300); s2 = await st(pg)
        if s2['typing'] and s2['shown'] != s2['full']:
            await pg.wait_for_timeout(1700); s2 = await st(pg)
            if s2['typing'] and s2['shown'] != s2['full']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400)
    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450)


def dom_index(s, opts, k):
    """掛勾的選項 k → 畫面上第幾顆鈕（按鈕字＝選項字＋提示）"""
    bt = s['btn']
    if len(bt) == len(opts) and (not opts[k] or bt[k].startswith(opts[k][:4])): return k
    return next((j for j, b in enumerate(bt) if opts[k] and b.startswith(opts[k])), None)


def hooked_ok(s):
    """掛勾抓到的選單＝畫面上這一組（不是早就結束的舊選單）"""
    ch = s['ch']
    if not ch: return False
    o = ch['opts']
    return len(o) == len(s['btn']) and all((not o[j]) or s['btn'][j].startswith(o[j][:4]) for j in range(len(o)))


async def run_scene(pg, cdp, tag, plan=None, internal=None, max_s=240, start_wait=2.5, quiet=1.6, shot_seat=None):
    """把正在演的這一段演完：對話點掉；GAME.choose 的選單照 plan（依序的判斷式）選字，plan 用完或對不上＝選離開類；
    遊戲內部選單（坐下選單，掛勾抓不到）照按鈕字選 internal（預設「起身」），記一行；沒進展每 30 秒記狀態＋截圖。回傳 {picks, seat, timeout, plan_left}"""
    plan = list(plan or []); internal = internal or ('起身', '站起')
    menu = Menu(); t0 = time.time(); q0 = None; idle_t = time.time(); idle_n = 0; seat = None; picks = []; same = [None, 0]; shot_done = False
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['seat'] and seat is None: seat = {'table': s['seatT'], 'xz': s['seatXZ'], 'at': [s['x'], s['z']], 'h': s['hour']}
        if s['phone'] and not s['nb']:
            log('    [收手機]'); await close_phone(pg, cdp); continue
        if s['nb'] and hooked_ok(s):
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            opts = s['ch']['opts']; k = None; why = '照計畫'
            if plan:
                k = next((i for i, o in enumerate(opts) if plan[0](o)), None)
                if k is not None: plan.pop(0)
            if k is None:
                k = next((i for i, o in enumerate(opts) if any(o.startswith(w) for w in EXIT_WORDS)), len(opts) - 1); why = '計畫外的選單：選離開類'
            di = dom_index(s, opts, k)
            sig = (tuple(opts), k); same = [sig, same[1] + 1] if same[0] == sig else [sig, 1]
            if same[1] > 5 or di is None:
                await R.shot(pg, 'gg3_%s_stuckopt' % fname(tag)); R.check('%s 選項「%s」按得下去' % (tag, opts[k]), False, J(s['btn'])); return {'picks': picks, 'seat': seat, 'timeout': True, 'plan_left': len(plan)}
            log('    [選項] %s → %s（%s）' % ('｜'.join(opts), opts[k], why)); picks.append(opts[k])
            await tap_btn(pg, cdp, di); menu.tapped = time.time(); q0 = None; idle_t = time.time(); await pg.wait_for_timeout(900); continue
        if s['nb']:   # 掛勾抓不到的遊戲內部選單（seatMenu：坐一下／起身）——照按鈕字選（乙 4、13）
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            bt = s['btn']
            if s['seat'] and shot_seat and not shot_done: shot_done = True; await R.shot(pg, shot_seat)
            k = next((i for i, t in enumerate(bt) if any(t.startswith(w) for w in internal)), None)
            if k is None: k = next((i for i, t in enumerate(bt) if any(w in t for w in EXIT_WORDS)), len(bt) - 1)
            sig = (('int',) + tuple(bt), k); same = [sig, same[1] + 1] if same[0] == sig else [sig, 1]
            if same[1] > 5:
                await R.shot(pg, 'gg3_%s_stuckint' % fname(tag)); R.check('%s 遊戲內部選單「%s」按得下去' % (tag, bt[k]), False, J(bt)); return {'picks': picks, 'seat': seat, 'timeout': True, 'plan_left': len(plan)}
            log('    [選項（遊戲內部選單）] %s → %s' % ('｜'.join(bt), bt[k])); picks.append('內部:' + bt[k])
            await tap_btn(pg, cdp, k); menu.tapped = time.time(); q0 = None; idle_t = time.time(); await pg.wait_for_timeout(1200); continue
        if s['dlg']:
            await tap_dlg(pg, cdp, s); q0 = None; idle_t = time.time(); continue
        if s['busy'] or s['fade'] or s['ent'] or s['paused']:
            q0 = None
            if time.time() - idle_t > 30:
                idle_t = time.time(); idle_n += 1; dg = await pg.evaluate(IDLE_JS)
                log('    [等待 %d] %s 狀態 %s；%s' % (idle_n, tag, J({k_: s.get(k_) for k_ in ('zone', 'hour', 'busy', 'fade', 'ent', 'paused', 'nb', 'interact')}), J(dg)))
                if idle_n <= 3: await R.shot(pg, 'gg3_%s_idle%d' % (fname(tag), idle_n))
            await pg.wait_for_timeout(400); continue
        if q0 is None: q0 = time.time()
        if time.time() - q0 >= quiet and time.time() - t0 >= start_wait: return {'picks': picks, 'seat': seat, 'timeout': False, 'plan_left': len(plan)}
        await pg.wait_for_timeout(300)
    dg = await pg.evaluate(IDLE_JS); log('    [逾時] %s %d 秒：%s' % (tag, max_s, J(dg))); await R.shot(pg, 'gg3_%s_timeout' % fname(tag))
    R.check('%s 這一段 %d 秒內演完' % (tag, max_s), False, J(dg))
    return {'picks': picks, 'seat': seat, 'timeout': True, 'plan_left': len(plan)}


# ---------------------------------------------------------------- 走路（搖桿）
async def walk(pg, cdp, tag, tx, tz, want=None, near=0.45, max_s=45):
    """真的搖桿（CDP 觸控 #joy），照 E.pathTo 前方 1.2 m 推（cc_l118a_probe.py joy_walk）。每推一下之前先看：互動鍵是 want＝到了（乙 5）；
    對話／選單／手機出現＝停下來交回主迴圈（'stop'，乙 13）。回傳 (結果 'ok'|'near'|'stop'|'fail', 狀態, 卡住紀錄)"""
    t0 = time.time(); last = (time.time(), None); stuck = []
    while time.time() - t0 < max_s:
        s = await st(pg)
        if want and s['interact'].startswith(want): return 'ok', s, stuck
        if s['dlg'] or s['nb'] or s['phone']: return 'stop', s, stuck
        if s['busy'] or s['ent'] or s['fade']: await pg.wait_for_timeout(400); continue
        d = math.hypot(tx - s['x'], tz - s['z'])
        if not want and d < near: return 'ok', s, stuck
        if want and d < 0.15: return 'near', s, stuck
        if last[1] is None or math.hypot(s['x'] - last[1][0], s['z'] - last[1][1]) > 0.25: last = (time.time(), (s['x'], s['z']))
        elif time.time() - last[0] > 4:
            stuck.append([s['x'], s['z']]); R.note('%s 搖桿卡住：停在 (%.2f,%.2f)，目標 (%.2f,%.2f)' % (tag, s['x'], s['z'], tx, tz))
            await L.joystick(pg, cdp, 35 * (1 if len(stuck) % 2 else -1), 0, 500); last = (time.time(), None)
            if len(stuck) >= 4: break
            continue
        g = await pg.evaluate(AHEAD_JS, [tx, tz])
        gx, gz = g or [tx, tz]; dd = math.hypot(gx - s['x'], gz - s['z']) or 0.01
        yaw = await pg.evaluate("GAME.E.cam.yaw"); fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
        vx, vz = (gx - s['x']) / dd, (gz - s['z']) / dd; sx, sy = vx * rx + vz * rz, -(vx * fx + vz * fz); mm = math.hypot(sx, sy) or 1
        mag = 45 if d > 2.0 else max(16, 45 * d / 2.0)
        await L.joystick(pg, cdp, sx / mm * mag, sy / mm * mag, 450 if d > 2.0 else 250)
    s = await st(pg); pd = await pg.evaluate(PATHDIAG_JS, [tx, tz])
    R.note('%s 搖桿 %d 秒沒到 (%.2f,%.2f)：停在 (%.2f,%.2f)、互動鍵「%s」；E.pathTo %s' % (tag, max_s, tx, tz, s['x'], s['z'], s['interact'], J(pd)))
    return 'fail', s, stuck


async def find_it(pg, pred):
    return next((i for i in await pg.evaluate(ITS_JS) if not i['hidden'] and pred(i)), None)


async def reach(pg, cdp, tag, it, label=None):
    """走到互動點：到了＝互動鍵出現它的字（不是離座標多近，乙 5）。先試範圍中間附近站得住的點，再試四周；途中有劇情先演完再走"""
    label = label or it['label']
    s = await st(pg)
    if s['interact'].startswith(label): return True, s
    cands = []
    c0 = await D.standable_near(pg, it['x'], it['z'], max(0.3, it['r'] * 0.55), 0)
    if c0: cands.append((c0['x'], c0['z']))
    for ang in (0, 90, 180, 270, 45, 135, 225, 315):
        cx = it['x'] + it['r'] * 0.45 * math.sin(math.radians(ang)); cz = it['z'] + it['r'] * 0.45 * math.cos(math.radians(ang))
        q = await D.standable_near(pg, cx, cz, 0.25, 0)
        if q and all(math.hypot(q['x'] - a, q['z'] - b) > 0.2 for a, b in cands): cands.append((q['x'], q['z']))
    tried = []
    for (x, z) in cands[:6]:
        r = 'fail'
        for _ in range(4):
            r, s, stuck = await walk(pg, cdp, '%s 走到「%s」' % (tag, label), x, z, want=label)
            if r == 'stop':
                log('    [走路中斷] %s 走到「%s」途中出現對話／選單：先演完' % (tag, label)); await run_scene(pg, cdp, tag + '（走路途中）'); continue
            break
        s = await D.settle(pg)
        tried.append([s['x'], s['z'], s['interact'], r])
        if s['interact'].startswith(label): return True, s
    R.note('%s「%s」(%.2f,%.2f) r %.1f 試過的站點（座標、互動鍵、結果）：%s' % (tag, label, it['x'], it['z'], it['r'], J(tried)))
    await R.shot(pg, 'gg3_noreach_%s' % re.sub(r'\W+', '_', label)[:20])
    return False, s


async def tap_interact(pg, cdp, tag, label):
    s = await D.settle(pg)
    for _ in range(6):
        if s['interact'].startswith(label): break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    if not R.check('%s 互動鍵是「%s」' % (tag, label), s['interact'].startswith(label), J({k: s[k] for k in ('x', 'z', 'interact')})): return False
    h = await pg.evaluate(HIT_JS, '#interact')
    if not h['hit']:
        R.note('%s 互動鍵被 %s 蓋住：先收面板' % (tag, h['top'])); await D.shot(pg, 'gg3_interact_covered', judge_black=False); await close_phone(pg, cdp); await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#interact'); return True


async def wait_zone(pg, cdp, want, secs=60):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await st(pg)
        if s['zone'] == want and not s['ent'] and not s['fade']: return round(time.time() - t0, 1), s
        await pg.wait_for_timeout(300)
    return None, await st(pg)


async def wait_dlg(pg, secs=12):
    """等進門那一句出來（STORY.TICKS 每 0.5 秒；黑幕退了才會說）"""
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await st(pg)
        if s['dlg'] or s['nb']: return True
        await pg.wait_for_timeout(400)
    return False


# ---------------------------------------------------------------- 讀檔（前置）
async def load(pg, cdp, zone, h, x=None, z=None, yaw=0.0, money=MONEY0, day=None, why=''):
    c = CAL if day is None else await pg.evaluate(CAL_JS, day)
    st0 = {'zone': zone, 'hour': h, 'day': c['d'], 'weekday': c['wd'], 'weather': 'clear', 'money': money, 'invites': [], 'flags': dict(BASE_FLAGS)}
    if x is not None: st0['pos'] = {'x': x, 'z': z, 'yaw': yaw, 'lv': 0}
    try: await L.load_state(pg, st0, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, st0, quiet_events=True)
    await pg.wait_for_timeout(5000); await close_phone(pg, cdp); await L.close_panels(pg, cdp)
    await mark(pg)
    R.setup('【前置／捷徑】讀檔（GAME.applySave；關條件事件、手機自動打開）到 %s %s（星期 %d）%05.2f%s、錢 %d、晴天、沒有邀約、GG3 旗標全清（今天還沒進過）%s' %
            (zone, c['k'], c['wd'], h, '' if x is None else ' (%.2f,%.2f)' % (x, z), money, why))
    for _ in range(30):
        s = await st(pg)
        if not s['fade'] and not s['ent'] and not s['paused']: break
        await pg.wait_for_timeout(500)
    return await st(pg)


async def set_money(pg, m, tag, why):
    v = await pg.evaluate(SET_MONEY_JS, m); R.setup('%s【前置／捷徑】錢改成 %d（%s）' % (tag, v, why)); return v


# ---------------------------------------------------------------- 檢查
def bad_texts(texts):
    return [t for t in texts if t and BAD.search(t)]


def seq_in(says, exp):
    """exp：[(說話的人 或 None＝不管, [可以的字...])]，照順序出現在 says 裡（中間可以夾別的）；回傳 (成立, 對到的位置)"""
    i = 0; at = []
    for who, ts in exp:
        while i < len(says) and not ((who is None or says[i][0] == who) and says[i][1] in ts): i += 1
        if i >= len(says): return False, at
        at.append(i); i += 1
    return True, at


def check_lines_known(tag, says, k):
    allowed = flat(DATA['lines'].get(k) or {})
    extra = [s for s in says if s[1] not in allowed]
    R.check('%s 店裡每一句 GAME.say 都是 GG3_LINES.%s 裡的字（%d 句）' % (tag, k, len(says)), not extra, J(extra[:4]))


def check_money(tag, ev, m0, m1, price, what):
    ds = [e['d'] for e in ev['money']]
    R.check('%s %s：扣 %d 元（GAME.money 呼叫 %s；錢 %s → %s）、不是負數' % (tag, what, price, J(ds), m0, m1), sum(ds) == -price and m1 == m0 - price and m1 >= 0, J(ev['money']))


def check_short(tag, ev, m0, m1, what):
    ds = [e['d'] for e in ev['money']]
    R.check('%s 錢不夠 %s：沒有扣錢（GAME.money 呼叫 %s；錢 %s → %s）、不是負數' % (tag, what, J(ds), m0, m1), not ds and m1 == m0 and m1 >= 0, J(ev['money']))


def check_clean(tag, ev, extra_texts=()):
    texts = [s[1] for s in ev['says']] + ev['toasts'] + ev['caps'] + [o for c in ev['chs'] for o in c.get('opts', [])] + [h for c in ev['chs'] for h in c.get('hints', [])] + list(extra_texts)
    b = bad_texts(texts)
    R.check('%s 畫面上的字沒有 {name}／undefined／null／暫定字（台詞、選項、提示、toast 共 %d 則）' % (tag, len(texts)), not b, J(b[:4]))
    R.check('%s 沒有 JS 錯誤（window error、console.error、GG3／EAT／INV 的 warn）' % tag, not ev['errs'], J(ev['errs'][:3]))


def log_ev(tag, ev):
    for w, t in ev['says']: log('    [說] %s：%s' % (w or '（旁白）', t))
    if ev['money']: log('    [錢] %s' % J([[e['d'], e['why'], e['before'], e['after']] for e in ev['money']]))
    if ev['toasts']: log('    [toast] %s' % J(ev['toasts']))
    if ev['caps']: log('    [字幕] %s' % J(ev['caps']))


# ---------------------------------------------------------------- 店門、店裡
async def enter_shop(pg, cdp, sid, tag):
    """店門外 → 搖桿走到「進入○○／進○○」→ 按 → 店裡出生點、站得住 → 進門那一句（一天第一次）"""
    zn = ZONE_OF[sid]; Ly = DATA['lay'][sid]; T = DATA['lines'][zn]
    door = await find_it(pg, lambda i: i['to'] == zn)
    if not R.check('%s 街上有往 %s 的店門（%s）' % (tag, zn, door and door['label']), bool(door) and door['label'].startswith('進'), J(door)): return False
    ok, s = await reach(pg, cdp, tag, door)
    if not R.check('%s 搖桿走到店門、互動鍵是「%s」' % (tag, door['label']), ok, J({k: s.get(k) for k in ('x', 'z', 'interact')})): return False
    i0 = await mark(pg); fb0 = s['fb']
    if not await tap_interact(pg, cdp, tag, door['label']): return False
    t, s = await wait_zone(pg, cdp, zn)
    await pg.wait_for_timeout(1200); s = await st(pg)
    d = math.hypot(s['x'] - Ly['spawn']['x'], s['z'] - Ly['spawn']['z'])
    if not R.check('%s 進店：區域 %s（%s 秒）、站在出生點 (%.2f,%.2f) 旁 %.2f m（≤0.5）、站得住' % (tag, zn, t, Ly['spawn']['x'], Ly['spawn']['z'], d), s['zone'] == zn and d <= 0.5 and s['stand'] is not False, J(s)): return False
    got = await wait_dlg(pg, 25)
    if not got: R.note('%s 進店 25 秒沒有對話出現（進門句要等 STORY.TICKS、黑幕退了）' % tag)
    await run_scene(pg, cdp, tag + ' 進門', start_wait=1.0)
    ev = await evs(pg, i0); log_ev(tag + ' 進門', ev)
    door_l = [pair(x) for x in T.get('door') or []]
    R.check('%s 進門那一句（一天第一次）是稿上 door 其中一句：%s' % (tag, J(ev['says'][:1])), len(ev['says']) >= 1 and ev['says'][0] in door_l, J({'got': ev['says'], 'door': door_l}))
    R.check('%s 進門只說一句' % tag, len(ev['says']) == 1, J(ev['says']))
    check_clean(tag + ' 進門', ev)
    R.check('%s 進店沒有被放到目的地（walkFallbacks 沒增加）' % tag, (await st(pg))['fb'] == fb0, '')
    await D.shot(pg, 'gg3_%s_entered' % sid)
    return True


async def leave_shop(pg, cdp, sid, tag):
    """走到「離開○○」→ 按 → 回到街上配置 out 那一點、站得住、搖桿推得動"""
    Ly = DATA['lay'][sid]; OZ = Ly['outZone']
    ex = await find_it(pg, lambda i: i['to'] == OZ and i['label'].startswith('離開'))
    if not R.check('%s 店裡有「離開…」回 %s' % (tag, OZ), bool(ex), ''): return False
    lo = await pg.evaluate(LAYOUT_OUT_JS, sid); want = (lo or {}).get('out') or Ly['out']
    ok, s = await reach(pg, cdp, tag, ex)
    if not R.check('%s 搖桿走到出口、互動鍵是「%s」' % (tag, ex['label']), ok, J({k: s.get(k) for k in ('x', 'z', 'interact')})): return False
    fb0 = s['fb']
    if not await tap_interact(pg, cdp, tag, ex['label']): return False
    t, s = await wait_zone(pg, cdp, OZ); await pg.wait_for_timeout(1500); s = await st(pg)
    d = math.hypot(s['x'] - want['x'], s['z'] - want['z']); dsp = math.hypot(s['x'] - ex['spawn']['x'], s['z'] - ex['spawn']['z']) if ex.get('spawn') else None
    R.check('%s 出店：回到 %s（%s 秒）、站在門外 out (%.2f,%.2f) 旁 %.2f m（≤0.8；出口的 spawn 差 %s）、站得住' % (tag, OZ, t, want['x'], want['z'], d, dsp), s['zone'] == OZ and d <= 0.8 and s['stand'] is not False, J(s))
    mv = await D.pushable(pg, cdp)
    R.check('%s 出來以後搖桿推得動（%.2f m）' % (tag, mv), mv >= 0.3, '')
    R.check('%s walkFallbacks 沒增加' % tag, (await st(pg))['fb'] == fb0, '')
    await D.shot(pg, 'gg3_%s_out' % sid, judge_black=False)
    return True


async def point(pg, cdp, tag, label, plan=None, internal=None, max_s=240, shot_seat=None, it=None):
    """走到互動點（互動鍵＝label；it 沒給＝第一個字是 label 開頭的）→ 按 → 演完；回傳 {ev, res, m0, m1, h0, h1, s1} 或 None"""
    it = it or await find_it(pg, lambda i: i['label'].startswith(label))
    if not R.check('%s 店裡有「%s」' % (tag, label), bool(it), J([i['label'] for i in await pg.evaluate(ITS_JS) if not i['hidden']])): return None
    ok, s = await reach(pg, cdp, tag, it, label)
    if not R.check('%s 搖桿走到「%s」（互動鍵出現它的字）' % (tag, label), ok, J({k: s.get(k) for k in ('x', 'z', 'interact')})): return None
    s0 = await st(pg); i0 = await mark(pg)
    if not await tap_interact(pg, cdp, tag, label): return None
    res = await run_scene(pg, cdp, '%s「%s」' % (tag, label), plan=plan, internal=internal, max_s=max_s, shot_seat=shot_seat)
    s1 = await st(pg); ev = await evs(pg, i0); log_ev('%s「%s」' % (tag, label), ev)
    if res['plan_left']: R.check('%s「%s」選單照計畫選完（還剩 %d 步沒對到；實際選了 %s）' % (tag, label, res['plan_left'], J(res['picks'])), False, J([c.get('opts') for c in ev['chs']]))
    return {'ev': ev, 'res': res, 'm0': s0['money'], 'm1': s1['money'], 'h0': s0['hour'], 'h1': s1['hour'], 's1': s1}


async def looks(pg, cdp, sid, tag):
    zn = ZONE_OF[sid]; T = DATA['lines'][zn]; LK = T.get('look') or {}
    pts = [p for p in DATA['lay'][sid]['points'] if p['kind'] in LK]
    R.note('%s 看的點（配置 points 裡 kind 在 GG3_LINES.look 的）：%s' % (tag, J([[p['label'], p['kind']] for p in pts])))
    for p in pts:
        r = await point(pg, cdp, tag + ' 看', p['label'], it=await find_it(pg, lambda i, p=p: i['pt'] == p['id']))
        if not r: continue
        says = r['ev']['says']; want = LK[p['kind']]
        R.check('%s 看「%s」：一句旁白、是稿上 look.%s 的那一句（不是暫時的「（%s）」）' % (tag, p['label'], p['kind'], DATA['lay'][sid]['name']),
                len(says) == 1 and says[0][0] == '' and says[0][1] in want and says[0][1] != '（%s）' % DATA['lay'][sid]['name'], J({'got': says, 'want': want}))
        R.check('%s 看「%s」：不扣錢' % (tag, p['label']), not r['ev']['money'], '')
        check_clean('%s 看「%s」' % (tag, p['label']), r['ev'])


async def sit_once(pg, cdp, sid, tag):
    """坐一次：走到座位按鈕（坐下／坐著等／用電腦）→ 按 → player.seat → 遊戲內部選單選「起身」→ 站得住、推得動。泰米：坐下那一句照桌子（兩人桌／四人桌）"""
    zn = ZONE_OF[sid]; Ly = DATA['lay'][sid]; T = DATA['lines'][zn]
    if not Ly['seats']:
        R.note('%s 【對照／觀察】配置 seats 是空的（%s 沒有座位）：這一間沒有「坐一次」可測' % (tag, Ly['name'])); return
    its = [i for i in await pg.evaluate(ITS_JS) if not i['hidden'] and i['seatId']]
    me = await st(pg); its.sort(key=lambda i: math.hypot(i['x'] - me['x'], i['z'] - me['z']))
    tried = 0
    for it in its:
        if await pg.evaluate(OCC_JS, [it['seat']['x'], it['seat']['z']]): R.note('%s 座位 %s 有人坐／有人正走過去：換一張' % (tag, it['seatId'])); continue
        tried += 1
        if tried > 3: break
        r = await point(pg, cdp, tag + ' 坐 ' + it['seatId'], it['label'], shot_seat='gg3_%s_sit' % sid, it=it)
        if not r: continue
        seat = r['res']['seat']
        R.check('%s 按「%s」坐下了（player.seat：%s）' % (tag, it['label'], J(seat)), bool(seat), '')
        if not seat: continue
        says = r['ev']['says']
        if zn == 'tz_taimi':
            m = re.search(r'_t(\d+)$', str(seat.get('table') or '')); kind = None
            if m: kind = next((t['kind'] for t in Ly['tables'] if t['id'] == int(m.group(1))), None)
            want = (T.get('seat') or {}).get(kind)
            R.check('%s 泰米坐下那一句照桌子（%s → %s）：%s' % (tag, seat.get('table'), kind, want), bool(want) and ('', want) in says, J(says))
        check_lines_known(tag + ' 坐', says, zn)
        check_clean(tag + ' 坐', r['ev'])
        c = await st(pg); mv = await D.pushable(pg, cdp)
        R.check('%s 起身：不是坐著、站得住、搖桿推得動 %.2f m（≥0.3）' % (tag, mv), not c['seat'] and c['stand'] is not False and mv >= 0.3, J({k: c[k] for k in ('x', 'z', 'seat', 'stand')}))
        return
    R.check('%s 找得到一張沒人坐、坐得下的座位' % tag, False, J([[i['seatId'], i['label']] for i in its]))


# ---------------------------------------------------------------- 各店的「點一次」
def eq(t): return lambda o: o == t
def sw(t): return lambda o: o.startswith(t)


async def order_antai(pg, cdp, tag):
    zn = 'gg_antai'; T = DATA['lines'][zn]; X = await pg.evaluate(EXPECT_JS, zn)
    R.note('%s 這一刻的情況：%s' % (tag, J({k: X.get(k) for k in ('month', 'examWeek', 'talk')})))
    r = await point(pg, cdp, tag + ' 櫃台', '藥師櫃台')
    if r:
        says = r['ev']['says']
        R.check('%s 藥師櫃台：藥師一句、是這個時候該挑的那幾句之一' % tag, len(says) == 1 and says[0][0] == T['who'] and says[0][1] in X['talk'], J({'got': says, 'want': X['talk']}))
        check_clean(tag + ' 櫃台', r['ev'])
    g = next((q for q in X['goods'] if q['n'] == ANTAI_ITEM), None)
    if not R.check('%s 貨架上有「%s」' % (tag, ANTAI_ITEM), bool(g), J(X['goods'])): return
    plan = lambda: [eq(g['n']), eq('買')]
    if SHORT:
        await set_money(pg, g['p'] - 15, tag, '錢不夠：%s %d 元' % (g['n'], g['p']))
        r = await point(pg, cdp, tag + ' 錢不夠', '看貨架', plan=plan())
        if r:
            check_short(tag, r['ev'], r['m0'], r['m1'], g['n'])
            R.check('%s 錢不夠：看的那一句照稿、toast「錢不夠」' % tag, ('', g['look']) in r['ev']['says'] and any('錢不夠' in t for t in r['ev']['toasts']), J({'says': r['ev']['says'], 'toasts': r['ev']['toasts']}))
            check_clean(tag + ' 錢不夠', r['ev'])
        await set_money(pg, MONEY0, tag, '錢改回來')
    r = await point(pg, cdp, tag + ' 買', '看貨架', plan=plan())
    if r:
        ev = r['ev']; check_money(tag, ev, r['m0'], r['m1'], g['p'], '買「%s」' % g['n'])
        R.check('%s 選單的「%s」提示是「%d 元」' % (tag, g['n'], g['p']), any(g['n'] in c['opts'] and c['hints'][c['opts'].index(g['n'])] == '%d 元' % g['p'] for c in ev['chs']), J([[c['opts'], c['hints']] for c in ev['chs']][:2]))
        R.check('%s 買：看的那一句（%s）＋toast「買了%s」' % (tag, g['look'], g['n']), ev['says'] == [('', g['look'])] and any(t.startswith('買了' + g['n']) for t in ev['toasts']), J({'says': ev['says'], 'toasts': ev['toasts']}))
        check_clean(tag + ' 買', ev)
    r = await point(pg, cdp, tag + ' 量血壓', '量血壓')
    if r:
        B = T['bp']; ev = r['ev']
        R.check('%s 量血壓：兩句旁白照稿（說明→量完）' % tag, ev['says'] == [('', B['look']), ('', B['done'])], J(ev['says']))
        R.note('%s 量血壓時坐到血壓計前的椅子：%s' % (tag, J(r['res']['seat'])))
        check_clean(tag + ' 量血壓', ev)


async def order_xianguo(pg, cdp, tag):
    zn = 'gg_xianguo'; T = DATA['lines'][zn]; X = await pg.evaluate(EXPECT_JS, zn)
    q = next((x for x in X['items'] if x['n'] == FRUIT_ITEM), None)
    R.note('%s 這一刻的情況：情境 %s；品項 %s' % (tag, J(X.get('sit')), J(X['items'])))
    if not R.check('%s 選單有「%s」' % (tag, FRUIT_ITEM), bool(q), ''): return
    sitp = [pair(X['sitLine'])] if X.get('sitLine') else []
    ask = (T['who'], T['ask'])
    plan = lambda: [eq(q['n'])] + ([eq('不用切')] if q['cut'] else [])
    if SHORT:
        await set_money(pg, q['p'] - 10, tag, '錢不夠：%s %d 元' % (q['n'], q['p']))
        r = await point(pg, cdp, tag + ' 錢不夠', '秤重結帳', plan=plan())
        if r:
            ev = r['ev']; check_short(tag, ev, r['m0'], r['m1'], q['n'])
            ok, at = seq_in(ev['says'], [(w, [t]) for w, t in sitp] + [(ask[0], [ask[1]]), ('', [q['look']]), (T['who'], [T['short']])])
            R.check('%s 錢不夠：%s「要什麼？」→ 看的那一句 → 老闆「%s」（照稿；那天第一次有情境就先說）' % (tag, '情境 → ' if sitp else '', T['short']), ok, J(ev['says']))
            check_lines_known(tag + ' 錢不夠', ev['says'], zn); check_clean(tag + ' 錢不夠', ev)
        await set_money(pg, MONEY0, tag, '錢改回來')
    r = await point(pg, cdp, tag + ' 買', '秤重結帳', plan=plan())
    if r:
        ev = r['ev']; five = q['p'] % 10 == 5; pay = q['p'] - 5 if five else q['p']
        check_money(tag, ev, r['m0'], r['m1'], pay, '買「%s」（標價 %d%s）' % (q['n'], q['p'], '，5 結尾少算 5 元' if five else ''))
        afters = [pair(a) for a in T['after'] if (a[2] == 'five') == five]
        ok, at = seq_in(ev['says'], [(ask[0], [ask[1]]), ('', [q['look']])])
        R.check('%s 買：老闆「要什麼？」→ 看的那一句 → 買了一句（%s）＋toast「買了%s」' % (tag, '一定是算你整數' if five else '不是算你整數那句', q['n']),
                ok and len(ev['says']) >= at[-1] + 2 and ev['says'][at[-1] + 1] in afters and any(t.startswith('買了' + q['n']) for t in ev['toasts']), J({'says': ev['says'], 'afters': afters, 'toasts': ev['toasts']}))
        check_lines_known(tag + ' 買', ev['says'], zn); check_clean(tag + ' 買', ev)


async def order_rong(pg, cdp, tag):
    zn = 'gg_rongendian'; T = DATA['lines'][zn]; X = await pg.evaluate(EXPECT_JS, zn)
    g = next((x for x in T['goods'] if x['n'] == RONG_ITEM), None)
    if not R.check('%s 貨有「%s」' % (tag, RONG_ITEM), bool(g), ''): return
    R.note('%s 這一刻的情況：情境 %s（學期第 %s 週、考前一週 %s、%s 月）' % (tag, J(X.get('sit')), X.get('termWeek'), X.get('preExam'), X.get('month')))
    sitp = [pair(X['sitLine'])] if X.get('sitLine') else []
    plan0 = [sw(g['cat']), sw(g['n'] + '　')]
    if SHORT:
        await set_money(pg, g['p'] - 10, tag, '錢不夠：%s %d 元' % (g['n'], g['p']))
        r = await point(pg, cdp, tag + ' 錢不夠', '結帳', plan=plan0 + [eq(T['short']['opt'])])
        if r:
            ev = r['ev']; check_short(tag, ev, r['m0'], r['m1'], g['n'])
            ok, at = seq_in(ev['says'], [(w, [t]) for w, t in sitp] + [(T['who'], [T['short']['line']])])
            R.check('%s 錢不夠：%s老闆「%s」＋只有「%s」可以選（不賒帳）' % (tag, '情境 → ' if sitp else '', T['short']['line'], T['short']['opt']),
                    ok and any(c['opts'] == [T['short']['opt']] for c in ev['chs']), J({'says': ev['says'], 'chs': [c['opts'] for c in ev['chs']]}))
            check_lines_known(tag + ' 錢不夠', ev['says'], zn); check_clean(tag + ' 錢不夠', ev)
            sitp = []   # 情境一天一次：之後不再說
        await set_money(pg, MONEY0, tag, '錢改回來')
    r = await point(pg, cdp, tag + ' 買', '結帳', plan=plan0)
    if r:
        ev = r['ev']; check_money(tag, ev, r['m0'], r['m1'], g['p'], '買「%s」' % g['n'])
        afters = [pair(a) for a in await pg.evaluate(RONG_AFTER_JS, g['n'])]
        shown = [o for c in ev['chs'] for o in c['opts'] if o.startswith(g['n'])]
        R.check('%s 選單上寫「%s　%d 元」' % (tag, g['n'], g['p']), '%s　%d 元' % (g['n'], g['p']) in shown, J(shown))
        ok, at = seq_in(ev['says'], [(w, [t]) for w, t in sitp] + [(None, [a[1] for a in afters])])
        R.check('%s 買：買了一句是買這一樣該說的（%s）＋toast「買了%s」' % (tag, J(afters), g['n']), ok and any(t.startswith('買了' + g['n']) for t in ev['toasts']), J({'says': ev['says'], 'toasts': ev['toasts']}))
        R.check('%s 沒有買筆記本卻說「筆記本買這個牌子對」' % tag, not any('筆記本買這個牌子' in s[1] for s in ev['says']) or '筆記本' in g['n'], J(ev['says']))
        check_lines_known(tag + ' 買', ev['says'], zn); check_clean(tag + ' 買', ev)


async def order_xile(pg, cdp, tag):
    zn = 'tz_xile'; T = DATA['lines'][zn]; W = T['wash']; m = W['menu'][0]
    plan = lambda: [eq(m['t']), eq(W['stay'])]
    if SHORT:
        await set_money(pg, m['p'] - 30, tag, '錢不夠：%s' % m['t'])
        r = await point(pg, cdp, tag + ' 錢不夠', '洗衣機', plan=[eq(m['t'])])
        if r:
            ev = r['ev']; check_short(tag, ev, r['m0'], r['m1'], m['t'])
            R.check('%s 錢不夠：toast「錢不夠」、沒有說話' % tag, any('錢不夠' in t for t in ev['toasts']) and not ev['says'], J({'says': ev['says'], 'toasts': ev['toasts']}))
            check_clean(tag + ' 錢不夠', ev)
        await set_money(pg, MONEY0, tag, '錢改回來')
    r = await point(pg, cdp, tag + ' 洗', '洗衣機', plan=plan(), max_s=300)
    if r:
        ev = r['ev']; check_money(tag, ev, r['m0'], r['m1'], m['p'], m['t'])
        R.check('%s 在這裡等：坐到塑膠椅上（player.seat：%s）' % (tag, J(r['res']['seat'])), bool(r['res']['seat']), '')
        R.check('%s 在這裡等：等的時候一句旁白（稿上 wait 其中一句）' % tag, len(ev['says']) == 1 and ev['says'][0][0] == '' and ev['says'][0][1] in T['wait'], J(ev['says']))
        dh = (r['h1'] - r['h0']) * 60
        R.check('%s 等完時間過了 %.0f 分鐘（≥%d）、已經站起來' % (tag, dh, m['min']), dh >= m['min'] - 0.5 and not r['s1']['seat'], J({'h0': r['h0'], 'h1': r['h1']}))
        check_clean(tag + ' 洗', ev)
    it = T['soap']['items'][0]
    r = await point(pg, cdp, tag + ' 洗衣精', '兌幣機', plan=[eq(it['n'])])
    if r:
        ev = r['ev']; check_money(tag, ev, r['m0'], r['m1'], it['p'], '買%s' % it['n'])
        want = (T['soap'].get('narrBy') or {}).get(it['n']) or T['soap']['narr']
        R.check('%s 買%s：一句旁白照稿' % (tag, it['n']), ev['says'] == [('', want)], J(ev['says']))
        check_clean(tag + ' 洗衣精', ev)


async def order_yin(pg, cdp, tag):
    zn = 'tz_yindehao'; T = DATA['lines'][zn]; X = await pg.evaluate(EXPECT_JS, zn)
    R.note('%s 這一刻的選單：%s（期末前後 %s、第 %s 年）' % (tag, J(X['menu']), X.get('finalsNear'), X.get('year')))
    m = next((x for x in X['menu'] if x['t'] == '印講義'), None)
    if not R.check('%s 櫃台選單有「印講義」' % tag, bool(m), J(X['menu'])): return
    if SHORT:
        await set_money(pg, m['p'] - 20, tag, '錢不夠：印講義 %d 元' % m['p'])
        r = await point(pg, cdp, tag + ' 錢不夠', '櫃台', plan=[eq(m['t'])])
        if r:
            ev = r['ev']; check_short(tag, ev, r['m0'], r['m1'], m['t'])
            R.check('%s 錢不夠：店員「%s」' % (tag, T['short']), ev['says'] == [(T['who'], T['short'])], J(ev['says']))
            check_clean(tag + ' 錢不夠', ev)
        await set_money(pg, MONEY0, tag, '錢改回來')
    r = await point(pg, cdp, tag + ' 印', '櫃台', plan=[eq(m['t'])])
    if r:
        ev = r['ev']; check_money(tag, ev, r['m0'], r['m1'], m['p'], m['t'])
        afters = [pair(a) for a in T['after'] if '十分鐘' not in a[1] or m['min'] == 10]
        dh = (r['h1'] - r['h0']) * 60
        R.check('%s 印講義：點完一句（稿上 after，十分鐘那句只在十分鐘的）、時間過了 %.0f 分鐘（≥%d）' % (tag, dh, m['min']), len(ev['says']) == 1 and ev['says'][0] in afters and dh >= m['min'] - 0.5, J({'says': ev['says'], 'afters': afters}))
        check_clean(tag + ' 印', ev)


async def order_taimi(pg, cdp, tag):
    zn = 'tz_taimi'; T = DATA['lines'][zn]; X = await pg.evaluate(EXPECT_JS, zn)
    main = next((x for x in X['menu'] if x['n'] == '打拋豬肉飯'), None)
    R.note('%s 這一刻的菜單價錢：%s' % (tag, J(X['menu'])))
    if not R.check('%s 菜單有打拋豬肉飯' % tag, bool(main), ''): return
    SP = T['spicy']; ask = (T['who'], T['ask'])
    if SHORT:
        await set_money(pg, main['p'] - 20, tag, '錢不夠：打拋豬肉飯 %d 元' % main['p'])
        r = await point(pg, cdp, tag + ' 錢不夠', '點餐', plan=[sw('打拋豬肉飯　'), eq(SP['opts'][0]), eq('點好了')])
        if r:
            ev = r['ev']; check_short(tag, ev, r['m0'], r['m1'], '打拋豬肉飯')
            if main['lunch']: R.check('%s 錢不夠（中午）：toast「錢不夠」、老闆娘不說「打拋豬中午比較便宜」' % tag, any('錢不夠' in t for t in ev['toasts']) and (T['who'], T['short']['line']) not in ev['says'], J({'says': ev['says'], 'toasts': ev['toasts']}))
            else: R.check('%s 錢不夠（不是中午）：老闆娘「%s」' % (tag, T['short']['line']), (T['who'], T['short']['line']) in ev['says'], J(ev['says']))
            check_lines_known(tag + ' 錢不夠', ev['says'], zn); check_clean(tag + ' 錢不夠', ev)
        await set_money(pg, MONEY0, tag, '錢改回來')
    r = await point(pg, cdp, tag + ' 點餐', '點餐', plan=[sw('打拋豬肉飯　'), eq(SP['more']['opt']), eq('點好了')], max_s=300)
    if not r: return
    ev = r['ev']; check_money(tag, ev, r['m0'], r['m1'], main['p'], '打拋豬肉飯（%s %d 元）' % ('午間' if main['lunch'] else '平常', main['p']))
    shown = [o for c in ev['chs'] for o in c['opts'] if o.startswith('打拋豬肉飯')]
    R.check('%s 菜單上打拋豬寫「打拋豬肉飯　%d 元」' % (tag, main['p']), '打拋豬肉飯　%d 元' % main['p'] in shown, J(shown))
    F = await pg.evaluate(TAIMI_FILTER_JS, ['打拋豬肉飯'])
    ok, at = seq_in(ev['says'], [(ask[0], [ask[1]]), (T['who'], [SP['ask']]), (T['who'], [SP['more']['line']]), (None, [a[1] for a in F['after']])])
    R.check('%s 點餐照稿：「要吃什麼？」→「辣度？」→ 選正常多一句「%s」→ 點完一句（照點的菜：%s）' % (tag, SP['more']['line'], J([a[1][:10] for a in F['after']])), ok, J(ev['says']))
    seat = r['res']['seat']
    R.check('%s 點完坐到空位吃（player.seat：%s）' % (tag, J(seat)), bool(seat), '')
    if seat:
        m = re.search(r'_t(\d+)$', str(seat.get('table') or '')); kind = next((t['kind'] for t in DATA['lay']['taimi']['tables'] if m and t['id'] == int(m.group(1))), None)
        want = (T.get('seat') or {}).get(kind)
        R.check('%s 坐下那一句照桌子（%s → %s）' % (tag, seat.get('table'), kind), bool(want) and ('', want) in ev['says'], J(ev['says']))
    R.check('%s 吃的旁白照點的菜（%s）' % (tag, J(F['eat'])), any(('', t) in ev['says'] for t in F['eat']) if F['eat'] else True, J(ev['says']))
    dh = (r['h1'] - r['h0']) * 60
    R.check('%s 吃了 30 分鐘（時間過了 %.0f 分鐘）、已經站起來' % (tag, dh), dh >= 29.5 and not r['s1']['seat'], J({'h0': r['h0'], 'h1': r['h1']}))
    R.check('%s 吃過的登記（toast「📓 吃過的：汀州路・泰米村食　打拋豬肉飯」）' % tag, any('吃過的' in t and '泰米村食' in t and '打拋豬肉飯' in t for t in ev['toasts']), J(ev['toasts']))
    check_lines_known(tag + ' 點餐', ev['says'], zn); check_clean(tag + ' 點餐', ev)


ORDER = {'antai': order_antai, 'xianguo': order_xianguo, 'rongendian': order_rong, 'xile': order_xile, 'yindehao': order_yin, 'taimi': order_taimi}


async def part_shop(pg, cdp, sid):
    zn = ZONE_OF[sid]; Ly = DATA['lay'][sid]; h = float(os.environ.get('H_' + sid.upper()) or H_DEF[sid]); tag = '[%s %s]' % (sid, Ly['name'])
    await load(pg, cdp, Ly['outZone'], h, Ly['out']['x'], Ly['out']['z'], Ly['out'].get('yaw', 0.0), why='（%s 門外＝配置 out）' % Ly['name'])
    op = await pg.evaluate(OPEN_JS, zn)
    if not R.check('%s 前置：%05.2f 營業中（%s；今天 %s）' % (tag, h, DATA['hours'].get(zn), op['today']), op['open'], J(op)): return
    i_all = await mark(pg)
    if not await enter_shop(pg, cdp, sid, tag): return
    if LOOKS: await looks(pg, cdp, sid, tag)
    await ORDER[sid](pg, cdp, tag)
    if SIT: await sit_once(pg, cdp, sid, tag)
    s = await st(pg); R.check('%s 錢沒有變負的（現在 %s）' % (tag, s['money']), s['money'] >= 0, '')
    ev = await evs(pg, i_all)
    check_lines_known(tag + ' 整趟', [x for x in ev['says']], zn)
    await leave_shop(pg, cdp, sid, tag)


# ---------------------------------------------------------------- 打烊、午休
async def close_case(pg, cdp, sid, h0, h_set, tag, noon=False):
    zn = ZONE_OF[sid]; Ly = DATA['lay'][sid]; T = DATA['lines'][zn]; OZ = Ly['outZone']
    await load(pg, cdp, OZ, h0, Ly['out']['x'], Ly['out']['z'], Ly['out'].get('yaw', 0.0), why='（%s 門外，快%s）' % (Ly['name'], '午休' if noon else '打烊'))
    op = await pg.evaluate(OPEN_JS, zn)
    if not R.check('%s 前置：%05.2f 還開著（%s）' % (tag, h0, op['today']), op['open'], J(op)): return
    if not await enter_shop(pg, cdp, sid, tag): return
    v = await pg.evaluate(SET_HOUR_JS, h_set)
    R.setup('%s【捷徑】人在店裡，時間撥到 %.3f（%s 前約 %d 遊戲分鐘；遊戲時間自己走到那一刻，STORY.TICKS 請人出來）' % (tag, v, '14:00' if noon else '打烊', round((math.ceil(h_set) - h_set) * 60)))
    i0 = await mark(pg); t0 = time.time(); nudged = False; idle_t = time.time(); idle_n = 0
    while time.time() - t0 < 240:
        s = await st(pg)
        if s['zone'] == OZ and not s['ent'] and not s['fade'] and not s['dlg'] and not s['busy']: break
        if s['dlg']: await tap_dlg(pg, cdp, s); continue
        if s['nb']: await run_scene(pg, cdp, tag + ' 打烊途中'); continue
        if not nudged and time.time() - t0 > 120 and s['zone'] == zn and s['hour'] < math.ceil(h_set) - 1e-3:
            nudged = True; v = await pg.evaluate(SET_HOUR_JS, math.ceil(h_set)); R.setup('%s【捷徑】等了 120 秒遊戲時間還沒到（%.3f）：撥到 %.2f' % (tag, s['hour'], v))
        if time.time() - idle_t > 30:
            idle_t = time.time(); idle_n += 1; dg = await pg.evaluate(IDLE_JS); log('    [等待打烊 %d] %s' % (idle_n, J(dg)))
            if idle_n <= 2: await R.shot(pg, 'gg3_close_%s_idle%d' % (sid, idle_n))
        await pg.wait_for_timeout(400)
    await pg.wait_for_timeout(1500); s = await st(pg); ev = await evs(pg, i0); log_ev(tag, ev)
    want = (T['who'], T['closeNoon'] if noon else T['close'])
    R.check('%s %s：%s「%s」（照稿，只說一次）' % (tag, '14:00 午休' if noon else '打烊', want[0], want[1]), ev['says'].count(want) == 1, J(ev['says']))
    if noon: R.check('%s 14:00 不是說打烊那句「%s」' % (tag, T['close']), (T['who'], T['close']) not in ev['says'], J(ev['says']))
    lo = await pg.evaluate(LAYOUT_OUT_JS, sid); out = (lo or {}).get('out') or Ly['out']
    d = math.hypot(s['x'] - out['x'], s['z'] - out['z'])
    R.check('%s 被請到門外：%s、站在 out (%.2f,%.2f) 旁 %.2f m（≤0.8）、站得住、不是坐著' % (tag, OZ, out['x'], out['z'], d), s['zone'] == OZ and d <= 0.8 and s['stand'] is not False and not s['seat'], J(s))
    check_clean(tag + ' 打烊', ev)
    mv = await D.pushable(pg, cdp); R.check('%s 出來以後還走得動（搖桿推 %.2f m）' % (tag, mv), mv >= 0.3, '')
    await D.shot(pg, 'gg3_close_%s_out' % sid, judge_black=False)
    # 關門以後再按店門
    door = await find_it(pg, lambda i: i['to'] == zn)
    if not R.check('%s 關門以後街上還有店門' % tag, bool(door), ''): return
    ok, s = await reach(pg, cdp, tag + ' 關門後', door)
    if not R.check('%s 關門以後搖桿走到店門（互動鍵「%s」）' % (tag, door['label']), ok, J({k: s.get(k) for k in ('x', 'z', 'interact')})): return
    exp = await pg.evaluate(OPEN_JS, zn); i1 = await mark(pg)
    if not await tap_interact(pg, cdp, tag + ' 關門後', door['label']): return
    await run_scene(pg, cdp, tag + ' 關門後按店門', start_wait=3.0)
    s = await st(pg); ev = await evs(pg, i1); log_ev(tag + ' 關門後', ev)
    line = T['rest'] if noon else T['sign']
    R.check('%s 關門以後按店門：門口那一句（%s）照稿' % (tag, 'rest' if noon else 'sign'), ev['says'] == [('', line)], J(ev['says']))
    R.check('%s 關門以後按店門：toast 開放時間（PLACES.closedText「%s」）' % (tag, exp['closed']), bool(exp['closed']) and any(exp['closed'] in t or t in exp['closed'] for t in ev['toasts']), J(ev['toasts']))
    R.check('%s 關門以後按店門：沒有進去（還在 %s）' % (tag, OZ), s['zone'] == OZ, J(s))
    check_clean(tag + ' 關門後', ev)
    mv = await D.pushable(pg, cdp); R.check('%s 按完還走得動（%.2f m）' % (tag, mv), mv >= 0.3, '')


async def part_close(pg, cdp):
    if 'close' in CLOSE_WHICH: await close_case(pg, cdp, 'yindehao', 21.75, 21.966, '[CLOSE 印得好 22:00]')
    if 'noon' in CLOSE_WHICH: await close_case(pg, cdp, 'taimi', 13.75, 13.966, '[CLOSE 泰米 14:00 午休]', noon=True)


# ---------------------------------------------------------------- 約去泰米
async def phone(pg, cdp, tab):
    if not (await st(pg))['phone']:
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(900)


async def tap_sel(pg, cdp, sel):
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })", sel)
    if not ok: return False
    await pg.wait_for_timeout(500)
    return await L.tap(pg, cdp, sel)


async def wait_menu(pg, cdp, secs=20):
    menu = Menu(); t0 = time.time()
    while time.time() - t0 < secs:
        s = await st(pg)
        if s['nb'] and hooked_ok(s):
            if await menu.ready(s): return s, menu
            await pg.wait_for_timeout(150); continue
        if s['dlg']: await tap_dlg(pg, cdp, s); continue
        await pg.wait_for_timeout(300)
    return None, menu


async def tap_text(pg, cdp, pred, why):
    s, menu = await wait_menu(pg, cdp)
    if not s: return None, None
    opts = s['ch']['opts']; k = next((i for i, o in enumerate(opts) if pred(o)), None)
    if k is None: return None, opts
    log('    [選項] %s → %s（%s）' % ('｜'.join(opts), opts[k], why))
    await tap_btn(pg, cdp, dom_index(s, opts, k)); await pg.wait_for_timeout(900)
    return opts[k], opts


async def pick_inv(pg, cdp, so):
    """日子 × 人：她會答應、今天的泰米時段（只讀的查詢）；每個被跳過的都記原因（乙 3）"""
    tried = []
    for key in INV_DAYS:
        c = await pg.evaluate(CAL_JS, key)
        if c['hol'] or c['typh'] or c['wd'] == 1 or c['exam']: tried.append([key, '假日／颱風／週一公休／考試週']); continue
        for who in TAIMI_WHO:
            await load(pg, cdp, 'dorm', 10.0, day=key, why='（約去泰米：選日子、選人；宿舍）')
            stp = await pg.evaluate(SETUP_INV_JS, {'who': who, 'rel': REL3, 'so': so})
            tm = await pg.evaluate(TIMES_JS, {'who': who, 'pid': 'tz_taimi'})
            hs = [x for x in (tm if isinstance(tm, list) else []) if x.get('res') == 'accept' and not x.get('te')]
            if not stp.get('canInvite') or stp.get('placeWhy') or not hs:
                tried.append([key, who, stp.get('whyNot') or stp.get('placeWhy') or 'canInvite=%s' % stp.get('canInvite'), [[x.get('t'), x.get('res') or x.get('skip'), x.get('why')] for x in (tm if isinstance(tm, list) else [tm])][:6]]); continue
            log('  選日子／人（只讀的查詢；試過 %s）' % J(tried))
            return {'key': key, 'who': who, 'setup': stp, 'time': hs[0], 'cal': c}
    log('  試過 %s' % J(tried)); return None


async def part_taimi_invite(pg, cdp, so=False):
    tag = '[TAIMI_INVITE%s]' % ('_SO' if so else '')
    pk = await pick_inv(pg, cdp, so)
    if not R.check('%s 前置：找得到她會答應的日子和時段（泰米 午餐 11:30～13:30、晚餐 17:30～20:00、週一不排）' % tag, bool(pk), ''): return
    who = pk['who']; T = DATA['lines']['tz_taimi']; P = pk['setup']['place']; tm = pk['time']
    R.setup('%s【前置／捷徑】%s %s：她的聯絡方式（原本%s）、關係改成第 3 階 %s、拿掉 dating_*、升階門檻台詞記成說過 %d 句、%s；第 %s 階' %
            (tag, pk['key'], who, '有' if pk['setup'].get('hadContact') else '沒有', J(REL3), pk['setup'].get('ups') or 0, '；'.join(pk['setup'].get('notes') or []), pk['setup'].get('stage')))
    R.note('%s 地點 %s；她答應的時段 %s；這一次的吃飯場次（STUDYN.act(eat).pick）%s' % (tag, J(P), J(tm), J(pk['setup'].get('ax'))[:400]))
    acc_want = (T['invite']['acc'] or {}).get(who) or T['invite']['acc0']
    i0 = await mark(pg)
    await phone(pg, cdp, 'friends')
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    if not R.check('%s 手機「朋友」有 %s 的「約」' % (tag, who), await tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who), (await pg.evaluate(TODAY_TXT_JS))[:300]):
        await close_phone(pg, cdp); return
    log('    [按] 手機「朋友」→「約」%s' % who); await pg.wait_for_timeout(1200)
    got = None; opts = None
    for _ in range(4):
        got, opts = await tap_text(pg, cdp, lambda o: o == P['verb'] or o.startswith('吃飯'), '類別／地點')
        if got is None or got == P['verb']: break
    if not R.check('%s 邀約選單選到「%s」' % (tag, P['verb']), got == P['verb'], J(opts)): await close_phone(pg, cdp); return
    got, opts = await tap_text(pg, cdp, lambda o: o == tm['t'], '時間')
    if not R.check('%s 時間選單有「%s」' % (tag, tm['t']), got == tm['t'], J(opts)): await close_phone(pg, cdp); return
    t0 = time.time(); menu = Menu()
    while time.time() - t0 < 25:
        s = await st(pg)
        if s['nb'] and hooked_ok(s):
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            o = s['ch']['opts']; k = next((i for i, x in enumerate(o) if x.startswith('好，就')), 0)
            log('    [選項] %s → %s（她的回答）' % ('｜'.join(o), o[k])); await tap_btn(pg, cdp, dom_index(s, o, k)); menu.tapped = time.time(); await pg.wait_for_timeout(900); continue
        if s['dlg']: await tap_dlg(pg, cdp, s); continue
        if time.time() - t0 > 4: break
        await pg.wait_for_timeout(400)
    await close_phone(pg, cdp)
    ev = await evs(pg, i0); log_ev(tag + ' 約', ev)
    R.check('%s 她答應的那一句＝稿上 invite.acc（%s）「%s」' % (tag, who if who in (T['invite']['acc'] or {}) else '一般 acc0', acc_want), any(x[1] == acc_want for x in ev['says']), J(ev['says']))
    check_clean(tag + ' 約', ev)
    iv = await pg.evaluate(IV_FIND_JS, {'w': who, 'p': 'tz_taimi'})
    if not R.check('%s 約好了一筆（G.invites：泰米村食 %s）' % (tag, iv and iv.get('h')), bool(iv), ''): return
    actn0 = await pg.evaluate(ACTN_JS, who)
    # 赴約：手機「今天」→「前往」（INV.goNow：等到該出發、快速前往到泰米村食；兩個人都在＝自動開始）
    i1 = await mark(pg)
    await phone(pg, cdp, 'today')
    if not R.check('%s 手機「今天」有「前往」' % tag, await tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % iv['id']), (await pg.evaluate(TODAY_TXT_JS))[:300]):
        await close_phone(pg, cdp); return
    log('    [按] 手機「今天」前往'); await pg.wait_for_timeout(1500)
    menu = Menu(); t0 = time.time(); walked = 0; done_t = None; zt = [None, 0]; idle_t = time.time(); idle_n = 0; zones = []; same = [None, 0]; seat_seen = False; path = []
    while time.time() - t0 < 900:
        s = await st(pg)
        if s['seat']: seat_seen = True
        if s['zone'] != zt[0]: zt = [s['zone'], time.time()]; zones.append(s['zone']); log('    [區域] %s（%.2f）' % (s['zone'], s['hour']))
        v = await pg.evaluate(IV_JS, iv['id'])
        if v and v['st'] in ('done', 'missed', 'cancelled') and not v['mid'] and not s['dlg'] and not s['nb'] and not s['busy']:
            if done_t is None: done_t = time.time()
            if time.time() - done_t > 2.5: break
            await pg.wait_for_timeout(500); continue
        done_t = None
        if s['phone'] and not s['nb']: await close_phone(pg, cdp); continue
        if s['nb'] and hooked_ok(s):
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            o = s['ch']['opts']; dm = s['ch']['dim']
            k = next((i for i, x in enumerate(o) if x.startswith('直接過去')), None)
            if k is None: k = next((i for i, x in enumerate(o) if not dm[i] and not any(w in x for w in EXIT_WORDS)), 0)
            sig = (tuple(o), s['zone']); same = [sig, same[1] + 1] if same[0] == sig else [sig, 1]
            if same[1] > 6: await R.shot(pg, 'gg3_inv_stuckopt'); R.check('%s 選項「%s」按得下去' % (tag, o[k]), False, ''); return
            log('    [選項] %s → %s' % ('｜'.join(o), o[k])); await tap_btn(pg, cdp, dom_index(s, o, k)); menu.tapped = time.time(); idle_t = time.time(); await pg.wait_for_timeout(900); continue
        if s['nb']:
            bt = s['btn']; k = next((i for i, t in enumerate(bt) if any(t.startswith(w) for w in ('起身', '算了', '返回'))), len(bt) - 1)
            log('    [選項（遊戲內部選單）] %s → %s' % ('｜'.join(bt), bt[k])); await tap_btn(pg, cdp, k); idle_t = time.time(); await pg.wait_for_timeout(1500); continue
        if s['dlg']: await tap_dlg(pg, cdp, s); idle_t = time.time(); continue
        if v and v['st'] == 'accepted' and not s['busy'] and v['zone'] == s['zone'] and walked < 6 and time.time() - zt[1] > 25:   # 進那一區 25 秒還沒開始（雲端 11-11 r2：到的時間剛好是約好的前 15 分鐘，INV.autoStart 要 h≥iv.h−0.25，遊戲時間要再走一點）：走到她旁邊（6 秒一段，乙 13）
            n = await pg.evaluate(NPC_JS, who)
            if n:
                walked += 1; path.append('走到她旁邊'); log('    [走過去] 她在 (%.2f,%.2f)' % (n['x'], n['z']))
                r_, s3, _ = await walk(pg, cdp, tag + ' 走到她旁邊', n['x'], n['z'], near=1.6, max_s=6)
                s3 = await st(pg)
                if r_ != 'stop' and s3['interact'] and (s3['interact'].startswith('坐') or '說話' in s3['interact']):
                    log('    [按互動鍵] %s' % s3['interact']); path.append('按「%s」' % s3['interact']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
                continue
        if time.time() - idle_t > 30:
            idle_t = time.time(); idle_n += 1; dg = await pg.evaluate(IDLE_JS)
            log('    [等待 %d] 狀態 %s；邀約 %s；%s' % (idle_n, J({k_: s.get(k_) for k_ in ('zone', 'hour', 'busy', 'dlg', 'nb', 'phone', 'interact')}), J(v), J(dg)))
            if idle_n <= 3: await R.shot(pg, 'gg3_inv_idle%d' % idle_n)
        await pg.wait_for_timeout(500)
    v = await pg.evaluate(IV_JS, iv['id']); s = await st(pg); ev = await evs(pg, i1); log_ev(tag + ' 見面', ev)
    R.note('%s 走的路：%s' % (tag, '到了以後自動開始（沒有走過去、沒有按坐下）' if not path else '到了沒有馬上開始，探針走過去：' + '→'.join(path)))
    meet = [e for e in ev['all'] if e.get('k') == 'say' and e.get('z') == 'tz_taimi']
    R.check('%s 「前往」到了泰米村食、見面演完（邀約 %s；走過的區域 %s）' % (tag, v and v['st'], J(zones)), bool(v) and v['st'] == 'done' and 'tz_taimi' in zones, J(v))
    R.check('%s 見面時兩個人有坐下（玩家 player.seat 出現過）' % tag, seat_seen, '')
    door_t = [pair(x)[1] for x in T.get('door') or []]
    R.check('%s 今天約在這裡：進店不說進門句' % tag, not any(e['t'] in door_t for e in meet), J([e['t'] for e in meet][:4]))
    if so:
        R.check('%s 坐下以後演泰米村食的開場句（seatOpen 兩則之一）' % tag, any(e['t'] in T['invite']['seatOpen'] for e in meet), J([e['t'] for e in meet][:6]))
    else:
        ax = pk['setup'].get('ax') or {}; seat_l = [x if isinstance(x, str) else (x.get('t') or x.get('me') or '') for x in (ax.get('seat') or [])]
        if seat_l and not ax.get('generic'):
            R.check('%s 吃飯第 %s 場：坐下那幾句有出現（%s）' % (tag, ax.get('k'), J(seat_l)), all(any(t and t in e['t'] for e in meet) for t in seat_l), J([e['t'] for e in meet][:8]))
            R.note('%s 【對照／觀察】泰米開場句 seatOpen %s：這一次 %s（遊戲照第 N 場，第 N 場有自己的坐下時不演 seatOpen：invites3d.js S.meet「o.sat&&!AX」）' % (tag, '出現' if any(e['t'] in T['invite']['seatOpen'] for e in meet) else '沒出現', '第 %s 場' % ax.get('k')))
        else:
            R.note('%s 【對照／觀察】這一次沒有第 N 場（%s）：坐下開場句 %s' % (tag, J(ax)[:200], J([e['t'] for e in meet if e['t'] in T['invite']['seatOpen']])))
        actn1 = await pg.evaluate(ACTN_JS, who)
        R.note('%s 吃飯場次紀錄 ACTN.eat.%s：%s → %s' % (tag, who, J(actn0), J(actn1)))
    check_clean(tag + ' 見面', ev)
    await D.shot(pg, 'gg3_inv_end', judge_black=False)
    if s['zone'] == 'tz_taimi':
        R.check('%s 演完站得住、不是坐著' % tag, s['stand'] is not False and not s['seat'], J(s))
        await leave_shop(pg, cdp, 'taimi', tag)


# ---------------------------------------------------------------- 日日定食 → 泰米村食
RENAME_PLACES = [   # AA_742 第 ③ 節原本寫「日日定食」的三處（c170218dd 對照 644eeb7d71）：檔案、現在該有的字
    ('src/sis_grad3d.js', '大一上榜聚餐（場景標題、Kevin 群組訊息、行程地點與標題）', ["scene:'汀州路・泰米村食'", '這週五七點，汀州路的泰米村食', "place:'汀州路・泰米村食'", "title:'學姊上榜聚餐（汀州路・泰米村食）'"]),
    ('src/story3d.js', '明軒「公館一百元以內」清單', ["'泰米村食（汀州路）','午間打拋豬肉飯（只有午餐）','95'"]),
    ('src/story3d.js', '大二上榜聚餐（Kevin 訊息、行程地點）', ['下週五七點，汀州路的泰米村食', "'汀州路的泰米村食'"]),
]
RENAME_ALLOWED = ('src/gg3shops3d.js',)   # 舊存檔遷移表 S.RENAME（要認得舊字才換得掉）


async def phone_text(pg, cdp, tab):
    await phone(pg, cdp, tab); await pg.wait_for_timeout(800)
    t = await pg.evaluate(PANEL_TXT_JS, 'phoneBody'); await close_phone(pg, cdp); return t


async def notes_text(pg, cdp):
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#menu .tabs button[data-tab="notes"]'); await pg.wait_for_timeout(900)
    t = await pg.evaluate(PANEL_TXT_JS, 'notesList'); await D.shot(pg, 'gg3_rename_notes', judge_black=False)
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(500); return t


async def part_rename(pg, cdp):
    tag = '[RENAME]'
    sc = await pg.evaluate(SRC_SCAN_JS)
    bad = [h for h in sc['hits'] if h.get('f') not in RENAME_ALLOWED]
    R.note('%s 【靜態】頁面載入的 %d 支 src/*.js 去掉註解以後還寫著「日日定食」的：%s' % (tag, sc['n'], J(sc['hits'])))
    R.check('%s 【靜態】程式（去掉註解）只有舊存檔遷移表（%s）還寫著「日日定食」' % (tag, '、'.join(RENAME_ALLOWED)), not bad and sc['n'] > 0, J(bad[:5]))
    for f, what, needles in RENAME_PLACES:
        r = await pg.evaluate(SRC_HAS_JS, {'f': f, 'needles': needles})
        R.check('%s 【靜態】%s %s 現在是泰米村食：%s' % (tag, f, what, J(needles)), bool(r.get('has')) and all(r['has']), J(r))
    d = await pg.evaluate(RENAME_DATA_JS)
    R.note('%s 頁面資料：%s' % (tag, J({k: d.get(k) for k in ('tz', 'placesOld', 'zonesOld', 'namesOld', 'gg3')})))
    mx = d.get('mx') or {}
    R.check('%s 明軒清單（STORY.MX_FM1）第 3 家是「泰米村食（汀州路）」、內文沒有日日定食' % tag, '泰米村食（汀州路）' in (mx.get('rows') or []) and OLD not in (mx.get('body') or OLD), J(mx.get('rows')))
    R.check('%s 約人的地點：泰米村食（%s）在清單裡、沒有任何地點寫日日定食' % (tag, J(d.get('tz'))), bool(d.get('tz')) and d['tz']['name'] == '泰米村食' and not d['placesOld'], J(d.get('placesOld')))
    R.check('%s 店名（PLACES.names、Z3.ZONES 的名字）沒有日日定食' % tag, not d['zonesOld'] and not d['namesOld'], J([d['zonesOld'], d['namesOld']]))
    for zone, x, z in (('gongguan', 37.1, 17.5), ('tingzhou', 0.0, 0.0)):
        await load(pg, cdp, zone, 12.0, x, z, why='（RENAME：看街上的互動鍵、店名）')
        lb = await pg.evaluate(LABELS_OLD_JS)
        R.check('%s %s 的 %d 個互動點（字、look）和畫面上的字沒有日日定食（有泰米村食的：%s）' % (tag, zone, lb['n'], J(lb['taimi'])), not lb['old'] and not lb['body'], J(lb['old']))
    # 筆記本：明軒清單（【捷徑】直接加筆記，看筆記本畫面上的字）
    await load(pg, cdp, 'dorm', 15.0, why='（RENAME：筆記本、舊存檔）')
    await pg.evaluate("(()=>{ if(GAME.addNote) GAME.addNote('mx_fm1',STORY.MX_FM1.title,STORY.MX_FM1.body); return true; })()")
    R.setup('%s【捷徑】GAME.addNote 加明軒「公館一百元以內」那一則（正常是明軒傳訊息以後才加；這裡只看筆記本畫面上的字）' % tag)
    nt = await notes_text(pg, cdp)
    R.check('%s 筆記本畫面：明軒清單有「泰米村食（汀州路）」、沒有日日定食' % tag, '泰米村食（汀州路）' in nt and OLD not in nt, nt[:300])
    # 舊存檔
    full = os.environ.get('RENAME_FULL', '1') != '0'
    for variant in (['outings', 'full'] if full else ['outings']):
        vt = '%s 舊存檔（%s）' % (tag, '行程＋舊訊息＋舊筆記' if variant == 'full' else '只有行程')
        await load(pg, cdp, 'dorm', 15.0, why='（RENAME：做一份舊存檔的底）')
        body = await pg.evaluate(OLD_BODY_JS)
        b0 = await pg.evaluate(BUILD_OLD_JS, {'full': variant == 'full', 'body': body})
        R.setup('%s【前置／捷徑】在遊戲裡寫成舊版本會存的樣子：G.outings 三筆（今天 19:00「公館・日日定食」、20:00「公館的日日定食」、三天前做過的「日日定食」）%s → GAME.snapshot（裡面「日日定食」%d 處）' %
                (vt, '＋7d9d 以前收到的 Kevin 群組訊息（PHONE.postAt，舊字）＋明軒清單筆記（舊字）' if variant == 'full' else '', b0['n']))
        if not R.check('%s 前置：做出來的舊存檔裡真的有「日日定食」' % vt, b0['n'] >= 3, J(b0)): continue
        await pg.evaluate(APPLY_OLD_JS); await pg.wait_for_timeout(4000); await close_phone(pg, cdp); await L.close_panels(pg, cdp); await mark(pg)
        R.setup('%s【前置／捷徑】GAME.applySave 讀回這份舊存檔（跟從選單讀檔一樣會跑 validate＋migrate）' % vt)
        g = await pg.evaluate(G_OLD_JS)
        outs = {q['id']: q for q in g['outs']}
        want = {'sisg_rank_dinner': ('汀州路・泰米村食', '學姊上榜聚餐（汀州路・泰米村食）'), 'sis_m3_dinner': ('汀州路的泰米村食', '學姊上榜聚餐'), 'cc_old_lunch': ('泰米村食', '午餐（泰米村食）')}
        R.check('%s 讀檔以後 G.outings 的地點、標題都換成泰米村食（AA_742 ③：公館・→汀州路・、公館的→汀州路的、其餘→泰米村食）' % vt,
                all(outs.get(k) and (outs[k]['place'], outs[k]['title']) == v for k, v in want.items()), J(g['outs']))
        pt = await phone_text(pg, cdp, 'today')
        R.check('%s 手機「今天」：今天的行程寫泰米村食、沒有日日定食' % vt, '泰米村食' in pt and OLD not in pt, pt[:400])
        R.note('%s 讀檔以後 G 裡還有「日日定食」的欄位：%s' % (vt, J(g['hits'])))
        R.check('%s 讀檔以後整個 G 沒有「日日定食」（BB 的標準；GG3.migrate 只換 G.outings 的 place／title）' % vt, not g['hits'], J(g['hits'][:6]))
        if variant == 'full':
            mt = await phone_text(pg, cdp, 'msg')
            nt = await notes_text(pg, cdp)
            R.check('%s 畫面：手機「訊息」列表、筆記本沒有日日定食' % vt, OLD not in mt and OLD not in nt, J({'msg': mt[:200], 'notes': nt[:300]}))
            # BB 19:30：明軒清單 mx_fm1 要整份換成現行 STORY.MX_FM1（不是只換店名＝「泰米村食賣今日定食」）
            mx = await pg.evaluate("(()=>{ const n=(GAME.G.notes||[]).find(x=>x&&x.id==='mx_fm1'); const M=STORY.MX_FM1; return {has:!!n, title:n&&n.title, body:n&&n.body, wt:M.title, wb:M.body}; })()")
            R.check('%s 明軒清單筆記 mx_fm1 讀檔後＝現行 STORY.MX_FM1（標題、內容一字不差）' % vt, mx['has'] and mx['title'] == mx['wt'] and mx['body'] == mx['wb'], J({'title': mx['title'], 'body': (mx['body'] or '')[:300]}))
            bad = [ln for ln in (mx['body'] or '').split('<br>') if '泰米村食' in ln and '今日定食' in ln]
            R.check('%s 明軒清單沒有「泰米村食｜今日定食」這種只換店名的列' % vt, not bad, J(bad))
            q = await pg.evaluate("(()=>{ const P=GAME.G.phone||{}; return (P.q||[]).filter(x=>x&&x.tag==='cc_old_q').map(x=>JSON.stringify(x.items)); })()")
            R.note('%s 還沒送到的那一則（G.phone.q cc_old_q）讀檔後：%s' % (vt, J(q)))
            R.check('%s 還沒送到的訊息（含回覆選項）也換成泰米村食' % vt, bool(q) and all(OLD not in x and '泰米村食' in x for x in q), J(q))
        await D.shot(pg, 'gg3_rename_%s' % variant, judge_black=False)


# ---------------------------------------------------------------- 主程式
async def static_checks(pg):
    d = await pg.evaluate(DATA_JS); DATA.update(d)
    R.check('頁面有 GG3、GG3_LINES、六間配置', d['hasGG3'] and bool(d['lines']) and len(d['lay']) == 6, J(list(d['lay'].keys())))
    R.check('六個區域的 build 都包上 GG3（Z3.ZONES[*]._gg3）', all(x[1] for x in d['zonesOk']), J(d['zonesOk']))
    R.note('營業時間（places.js）：%s' % J(d['hours']))
    Lx = d['lines'] or {}
    five = ['gg_antai', 'gg_xianguo', 'gg_rongendian', 'tz_taimi', 'tz_yindehao']
    R.check('打烊統一 AA_700「我們今天要打烊了。」（五間；洗樂 24 小時沒有）', all((Lx.get(k) or {}).get('close') == '我們今天要打烊了。' for k in five) and not (Lx.get('tz_xile') or {}).get('close'), J({k: (Lx.get(k) or {}).get('close') for k in five + ['tz_xile']}))
    R.check('泰米 14:00 午休那一句「我們要午休了，五點再開喔。」（666a1546e8）', (Lx.get('tz_taimi') or {}).get('closeNoon') == '我們要午休了，五點再開喔。', J((Lx.get('tz_taimi') or {}).get('closeNoon')))
    p = os.path.abspath(os.path.join(LWT, '..', 'src', 'data', 'gg3_shops_lines.js'))
    try:
        js = "const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(process.argv[1],'utf8')+';globalThis.__X=GG3_LINES;',c);process.stdout.write(JSON.stringify(c.__X));"
        disk = json.loads(subprocess.check_output(['node', '-e', js, p], text=True, stderr=subprocess.DEVNULL))
        R.check('頁面上的 GG3_LINES＝受測樹的 src/data/gg3_shops_lines.js（%s）' % p, disk == Lx, '')
    except Exception as e:
        R.note('讀不到受測樹的 %s（%s）：改比頁面上的 GG3_LINES（之後的逐句比對都用頁面資料）' % (p, repr(e)[:120]))
    b = bad_texts(sorted(flat(Lx)))
    R.check('GG3_LINES 裡沒有 {name}／undefined／暫定字', not b, J(b[:4]))


async def main():
    print('CC GG3SHOPS：PARTS %s；SHA %s；DAY %s；SHORT %s LOOKS %s SIT %s；Playwright 手機模擬 ≠ iPhone' % (','.join(PARTS), SHA, DAY, SHORT, LOOKS, SIT), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return R.finish()
        await pg.evaluate("(()=>{ try{ localStorage.clear(); }catch(e){} if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; })()")
        ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]")
        await mark(pg)
        CAL.update(await pg.evaluate(CAL_JS, DAY))
        R.note('版本字樣 %s；日期 %s：%s（wd 3＝星期三）' % (ver, DAY, J(CAL)))
        if CAL.get('hol') or CAL.get('typh'): R.check('前置：%s 不是假日、不是颱風假' % DAY, False, J(CAL))
        await static_checks(pg)
        for part in PARTS:
            print('== %s' % part, flush=True); t0 = time.time()
            try:
                if part in SHOP_IDS:
                    if part in DATA['lay']: await part_shop(pg, cdp, part)
                    else: R.check('[%s] 頁面有這一間的配置' % part, False, '')
                elif part == 'CLOSE': await part_close(pg, cdp)
                elif part == 'TAIMI_INVITE': await part_taimi_invite(pg, cdp, False)
                elif part == 'TAIMI_INVITE_SO': await part_taimi_invite(pg, cdp, True)
                elif part == 'RENAME': await part_rename(pg, cdp)
                else: R.check('[%s] 認得這個 PART' % part, False, '')
            except Exception:
                import traceback
                R.check('[%s] 探針沒有例外' % part, False, traceback.format_exc()[-900:])
                try: await R.shot(pg, 'gg3_%s_exception' % part)
                except Exception: pass
            R.note('[%s] 用了 %.0f 秒' % (part, time.time() - t0))
        R.check('沒有 JS 例外（pageerror）', not errs, J(errs[:3]))
        await b.close()
    return R.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
