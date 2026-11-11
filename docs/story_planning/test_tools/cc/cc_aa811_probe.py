"""CC（帳號 A）11-11：AA_811（學姊合歡山北峰 ev_sis_hehuan、子晴語音十則 ZQ_VOICE_MEMO）的瀏覽器探針。判定歸 BB；Playwright 手機模擬（844×390 觸控）≠ iPhone。
遊戲：b77af3a4fe6d348ae58337a1ce708442ef9ef458（合併 18d0d5f26b、接線 d0dccf5911、Node 單元 070f6c6ebe tests/aa811_hehuan_voice_1111_unit.js 78 項、b77af3a4fe 第九則回覆選項的引號）。
規則照 src/aa811_3d.js：
  ① 合歡山北峰：約她的清單「這個時候才有」那一類（INV.WHEN_X；那一類只有一項時直接列在第一層）；SIS_HEHUAN 有、還沒去過（SIS_HEHUAN_WENT）；
     明天起 7 天內、2029-06-15～2029-10-31 的週六週日、那天沒有別的事；出遊 04:00（03:15～03:30 問「出發」）→ 2D → 22:00「回到臺北。」；
     該問「出發」的時候在下雨＝取消（missed、rained、toast「下雨了，和{學姊}去合歡山北峰的行程取消。」）、之後還可以再約。
     「兩版」照程式：dating（當天和她交往中）／friend（其他）——{if:'dating'}／{if:'friend'} 各四句。HEHUAN_A＝friend 版、HEHUAN_B＝dating 版，各跑一次。
  ② 子晴語音：D0＝「🎤 第一天。」那則送到的那一天；回第三天那則（「（回一則語音）…」）＝ZQ_VOICE_MEMO、一次排好十則（第 N 天＝D0＋N−1、不數了＝D0＋36、22:00～23:40）；
     只有第九則（上架）可以回，兩個選項照 AA811_LINES.zq_voice.reply9。語音寫成字（沒有播放鍵：程式註解「語音寫成字」），「播放」＝手機那一段看得到那一則。
PARTS（逗號分隔；預設全部）：
  HEHUAN_A    朋友版（沒交往）：【前置／捷徑】畢業後最小存檔（cc_aa593_sis_probe 的 base_pg）＋學姊熟（CLOSE）、有聯絡方式、SIS_HEHUAN＝2029-01-20；
              讀檔到候選日 15:00（依序試 HH_DATES，挑「合歡山北峰」能約、學姊可以約的那一天；跳過的記原因）。讀檔時手機一起打開（等同按手機鍵：畢業後篇站著 2 秒就會跳到下一件事）。
              玩家的路：手機「朋友」→ 學姊那一列「約」→ 清單（照字）「合歡山北峰」（或「這個時候才有…」→「合歡山北峰」）→ 選日子（第一個）→ 她答應「好。四點的客運。」（手機）→「約好了：…」；
              之後站著不動，讓畢業後篇自己跳到出發（03:15）→ 選單「出發：…合歡山北峰」→ 2D 照稿 → 選項照字 → 22:00「回到臺北。」。
  HEHUAN_B    交往版：同上，另外【前置】ROM.start（dating_heroine_05）；選項不同（泡麵／不說話：同一趟戀愛最多 +2）。
  HEHUAN_NEG  不出現／取消（NEG_CASES，預設 noflag,early,late,rain）：
              noflag＝沒有 SIS_HEHUAN（同一個候選日）；early＝2029-06-08（五）：7 天內只有 6/9、6/10 週末（還沒 6/15）和 6/15（週五，在窗內但不是週末）；
              late＝2029-10-28（日）：7 天內的週末（11/3、11/4）已經過了 10/31。這三個都打開「約」的清單看（第一層和每一類的小項都沒有「合歡山北峰」）→「算了」。
              rain＝照玩家約好（同 A 的路）→【捷徑】存檔照抄、只改成出發那天 03:00、天氣 rain（畢業後篇跳日子會把天氣設成 clear，雨天只能捷徑）→ 站著不動 →
              不問「出發」、記 missed／rained、toast 照字；之後再打開「約」的清單，「合歡山北峰」還在（之後還可以再約）。
  VOICE       【前置／捷徑】畢業後最小存檔 2029-09-10 21:00、子晴 FRIEND、有聯絡方式；看完《m2909a》散場那一段跳過：直接叫遊戲的 MOVIES.later（with.later 排三則）＋MOVIES.markSeen。
              之後站著不動（畢業後篇自己跳到每一則訊息；手機自己打開列表）→ 列表點子晴那一段看 → 第三天那則照字回「（回一則語音）…」→ 十則照時間送到 → 第九則照字回（VOICE_REPLY，預設 0）。
              VOICE_CASES（預設 new）：new＝上面那一條；old＝舊存檔（ZQ_VOICE_MEMO 已經有、還沒排）讀檔以後手機規則補排十則（只看排程，選擇性）。
共通：畫面上沒有 {name}／undefined／NaN／TODO／PLACEHOLDER；沒有 JS 例外（pageerror）；演完以後推得動（或在家＝遊戲還在往下走）；等待中每 30 秒沒有新動作記一次狀態＋截圖（每段最多 6 張）；
每段最後印「走的路」。從不呼叫 EVENTS.run。
環境變數：PARTS、SHA、TAG、HH_DATES（2029-09-11,2029-09-18,2029-10-09,2029-06-12）、NEG_CASES、VOICE_CASES、VOICE_REPLY（0／1）、MAXS（等待上限倍數，預設 1）
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=HEHUAN_NEG,VOICE python3 cc_aa811_probe.py <url>/index.html <out>（URL 不加 ?turbo）"""
import os, sys, json, asyncio, time, re
LWT = os.environ.get('LW_TESTS') or 'tests'
sys.path.insert(0, LWT)
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
TAG = os.environ.get('TAG') or (SHA[:9] if SHA else 'x')
MAXS = float(os.environ.get('MAXS') or 1)
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('aa811_' + TAG, OUT)
LOGF = open(os.path.join(OUT, 'aa811_lines_%s.txt' % TAG), 'a', encoding='utf-8')
ALL_PARTS = ['HEHUAN_A', 'HEHUAN_B', 'HEHUAN_NEG', 'VOICE']
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or ','.join(ALL_PARTS)).split(',') if p.strip()]
ENVL = lambda k, d: [x.strip() for x in (os.environ.get(k) or d).split(',') if x.strip()]
PNAME = '祐廷'
SIS, ZQ = 'heroine_05', 'heroine_04'
PREFER = ('先起床', '出發', '直接過去', '起身')
EXIT_WORDS = ('不去了', '算了', '返回', '下次再說', '換一天', '晚一點')
BAD_RX = re.compile(r'\{name\}|\{[A-Za-z_]+\}|undefined|NaN|TODO|PLACEHOLDER|MISSING_')
# 照 Node 單元（070f6c6ebe）與稿（企劃線 fb1256280）；遊戲資料 AA811_LINES 另外從頁面讀，兩邊對一次
HH_T = '合歡山北峰'
HH_ACCEPT = '好。四點的客運。'
HH_HINT_EXP = '04:00 出發・22:00 回到臺北'
HH_BACK = '回到臺北。'
HH_FROM, HH_TO = '2029-06-15', '2029-10-31'
PICKS = {'friend': ['「水，還有一件外套。」', '「恭喜妳寫完。」'], 'dating': ['「泡麵。」', '（不說話，跟她一起看雲）']}
FX_EXP = {'friend': {'npcRom': 1, 'fam': 3}, 'dating': {'npcRom': 2, 'fam': 0}}   # 單元第 4 節：外套 love1 fr1＋恭喜 fr2＝戀愛 1、熟悉 3；泡麵 love2＋不說話 love2＝戀愛最多 +2
ZQ_THIRD = '（回一則語音）「第三天。來不及的話，哪一塊可以先砍？」'   # src/data/movie_plots.js m2909a with.heroine_04 choice[0]
ZQ_REP9_EXP = [['（回語音）「恭喜。開門那個聲音我聽到了。」', ['你下載了', '……你是第四十一個']], ['「恭喜！」', ['嗯。謝謝']]]   # b77af3a4fe 修了引號以後的字
REL_CLOSE = {'fam': 65, 'trust': 50, 'comf': 45}
REL_FRIEND = {'fam': 60, 'trust': 45, 'comf': 40}


def log(s):
    print(s, flush=True); LOGF.write(s + '\n'); LOGF.flush()


# ---------------------------------------------------------------- 頁面上的 JS（只記不改的掛勾；查詢；前置）
HOOK_JS = r"""(()=>{ if(!window.__AAH){ window.__AAH=1; window.__AE=[];
  const G=()=>GAME.G, n=()=>window.__AE.length, now=()=>Date.now(), pos=()=>({d:G().day,h:+(+G().hour).toFixed(3),z:G().zone});
  const push=o=>{ try{ window.__AE.push(Object.assign(o,{i:n(),ms:now()},pos())); }catch(e){} };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',who:(w&&w.name)||(typeof w==='string'?w:''),cid:(w&&w.charId)||'',t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o,op){ const L=(o||[]).filter(x=>!(x&&x.hidden)); const rec={k:'ch',opts:L.map(x=>typeof x==='string'?x:String((x&&x.t)||'')),hints:L.map(x=>String((x&&x.hint)||'')),dims:L.map(x=>!!(x&&x.dim)),subs:L.map(x=>x&&Array.isArray(x.sub)?x.sub.map(String):null),pick:null}; push(rec);
    const p=c0.apply(this,arguments); try{ Promise.resolve(p).then(k=>{ rec.pick=k; }); }catch(e){} return p; };
  if(GAME.toast){ const t0=GAME.toast; GAME.toast=function(t){ push({k:'toast',t:String(t)}); return t0.apply(this,arguments); }; }
  if(GAME.caption){ const cp=GAME.caption; GAME.caption=function(a,b){ push({k:'cap',t:String(b==null?'':b),who:String(a==null?'':a)}); return cp.apply(this,arguments); }; }
  if(GAME.titleCard){ const tc=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',t:String(a)+'｜'+String(b==null?'':b)}); return tc.apply(this,arguments); }; }
  if(GAME.openPhone){ const op=GAME.openPhone; GAME.openPhone=function(tab,th){ push({k:'phone',tab:tab||null,th:th||null,by:'GAME.openPhone'}); return op.apply(this,arguments); }; }
  if(GAME.phoneThread){ const pt=GAME.phoneThread; GAME.phoneThread=function(th,o){ push({k:'phone',tab:'msg',th:th||null,by:'GAME.phoneThread'}); return pt.apply(this,arguments); }; }
  if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ try{ push({k:'adj',id:String(id),dl:JSON.parse(JSON.stringify(d||{}))}); }catch(e){} return a0.apply(this,arguments); }; }
  window.__ccCons=[]; for(const k of ['warn','error']){ const o=console[k].bind(console); console[k]=(...a)=>{ try{ window.__ccCons.push(k+': '+a.map(x=>String(x&&x.stack||x)).join(' ').slice(0,240)); if(window.__ccCons.length>200) window.__ccCons.shift(); }catch(e){} return o(...a); }; }
 } return true; })()"""

RESET_JS = r"""(()=>{ window.__AE=[]; window.__ccCons=[]; return Date.now(); })()"""

EV_JS = r"""(i=>(window.__AE||[]).slice(i))"""

ST_JS = r"""(()=>{ const G=GAME.G, E=GAME.E, P=E&&E.player, D=GAME.D||{}, $=id=>document.getElementById(id);
  const vis=e=>!!e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none';
  const ft=b=>String((b.firstChild&&b.firstChild.nodeType===3?b.firstChild.nodeValue:b.textContent)||'').trim();
  const ch=$('choices'); const B=vis(ch)?[...ch.querySelectorAll('button')].filter(b=>(b.getClientRects().length>0&&getComputedStyle(b).visibility!=='hidden')):[];
  const A=window.__AE||[]; let last=null; for(let i=A.length-1;i>=0;i--) if(A[i].k==='ch'){ last=A[i]; break; }
  const ph=$('phone'), pb=$('phoneBody'), po=vis(ph);
  const asks=po&&pb?[...pb.querySelectorAll('[data-ask]')].filter(b=>(b.getClientRects().length>0&&getComputedStyle(b).visibility!=='hidden')).map(b=>({v:b.dataset.ask,t:ft(b),dis:!!b.disabled})):[];
  const ths=po&&pb?[...pb.querySelectorAll('.chatList [data-th]')].map(b=>({th:b.dataset.th,t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,80)})):[];
  const tb=document.querySelector('#phoneTabs button.on'); const it=$('interact'), tx=$('dlgText'), nm=$('dlgName');
  return {dlg:!!D.active, typing:!!D.typing, full:String(D.full||''), shown:(tx&&tx.textContent)||'', name:(nm&&nm.style.display!=='none'&&nm.textContent)||'',
    nb:B.length, btn:B.map(ft), ch:last&&last.pick==null?{i:last.i,opts:last.opts,hints:last.hints,subs:last.subs}:null,
    phone:po, inTh:po&&!!pb&&!!pb.querySelector('[data-thback]'), asks, ths, tab:tb&&tb.dataset?tb.dataset.ptab:null,
    zone:G.zone, day:G.day, key:CALENDAR.dateOf(G.day).key, hour:+(+G.hour).toFixed(3), busy:!!(P&&P.busy), seat:!!(P&&P.seat),
    home:typeof HOME!=='undefined'&&!!HOME.at&&!!HOME.at(G), ev:(typeof EVENTS!=='undefined'&&EVENTS.running)?String(EVENTS.running.id||EVENTS.running):null,
    depth:D.busyDepth|0, paused:!!(E&&E.paused), interact:vis(it)?(it.textContent||'').trim().slice(0,30):''}; })()"""

WATCH_JS = r"""(q=>{ const G=GAME.G, F=G.flags||{}, th=m=>(typeof PHONE!=='undefined'&&PHONE.th)?PHONE.th(m):(m.th||'');
  const o={key:CALENDAR.dateOf(G.day).key, day:G.day, hour:+(+G.hour).toFixed(3), zone:G.zone, flags:{}, msgs:[], outs:[], q:[]};
  for(const k of q.fl||[]) o.flags[k]=F[k]===undefined?null:F[k];
  const rx=q.rx?new RegExp(q.rx):null;
  for(const m of (G.msgs||[])){ const t=th(m); if((q.tags||[]).includes(m.tag)||(q.ths||[]).includes(t)||(rx&&rx.test(String(m.tag||''))))
    o.msgs.push({tag:m.tag||null, th:t, from:m.from||null, text:String(m.text||''), day:m.day, h:m.h, ask:m.ask?{id:m.ask.id, opts:(m.ask.opts||[]).map(x=>String(x.t))}:null, ans:m.ans==null?null:m.ans}); }
  if(rx&&typeof PHONE!=='undefined'&&PHONE.rec) for(const x of PHONE.rec(G).q) if(rx.test(String(x.tag||''))) o.q.push({tag:x.tag, day:x.day, h:x.h, n:(x.items||[]).length, text:String(((x.items||[])[0]||{}).text||''), th:String(((x.items||[])[0]||{}).th||''), from:String(((x.items||[])[0]||{}).from||''), ask:((x.items||[])[0]||{}).ask?{id:x.items[0].ask.id, opts:(x.items[0].ask.opts||[]).map(y=>String(y.t)), fx:(x.items[0].ask.opts||[]).map(y=>y.fx||null)}:null});
  if(q.ev&&typeof OUT!=='undefined'&&OUT.rec) for(const x of OUT.rec(G)) if(x&&x.ev===q.ev) o.outs.push({id:x.id, day:x.day, key:CALENDAR.dateOf(x.day).key, h:x.h, state:x.state, noRain:!!x.noRain, dawn:!!x.dawn, rained:!!x.rained, late:x.late, travelH:x.travelH, title:x.title, who:x.who, back:x.back});
  return o; })"""

IDLE_JS = r"""(()=>{ const E=GAME.E, P=E&&E.player, D=GAME.D||{}, G=GAME.G, f2=v=>v==null?null:+(+v).toFixed(2);
  const top=(()=>{ const e=document.elementFromPoint(innerWidth/2, innerHeight*0.8); return e?(e.id||String(e.className).slice(0,40)||e.tagName):null; })();
  const A=window.__AE||[]; let ls=null; for(let i=A.length-1;i>=0;i--) if(A[i].k==='say'){ ls=A[i]; break; }
  let ns=null; try{ const t=typeof PG!=='undefined'&&PG.nextStop?PG.nextStop(G):null; if(t!=null){ const d=Math.floor(t/24); ns=CALENDAR.dateOf(d).key+' '+f2(t-d*24); } }catch(e){ ns=String(e); }
  return {key:CALENDAR.dateOf(G.day).key, hour:f2(G.hour), zone:G.zone, weather:G.weather, me:P?{x:f2(P.obj.position.x), z:f2(P.obj.position.z), busy:!!P.busy, seat:!!P.seat}:null,
    depth:D.busyDepth|0, by:(D.busyWho||[]).slice(-3), dlg:!!D.active, ev:(typeof EVENTS!=='undefined'&&EVENTS.running)?String(EVENTS.running.id||EVENTS.running):null,
    adv:typeof ADV!=='undefined'&&!!ADV.active, paused:!!(E&&E.paused), home:typeof HOME!=='undefined'&&!!HOME.at&&!!HOME.at(G),
    pg:typeof PG!=='undefined'&&PG.on?!!PG.on(G):null, pgBusy:typeof PG!=='undefined'?!!PG.busy:null, next:ns,
    pend:(typeof PHONE!=='undefined'&&PHONE.pending)?PHONE.pending(G).map(m=>(PHONE.th(m)||'')+'｜'+String(m.text||'').slice(0,20)):null,
    outs:(typeof OUT!=='undefined'&&OUT.rec)?OUT.rec(G).filter(q=>q&&q.state==='planned').map(q=>q.id+'@'+CALENDAR.dateOf(q.day).key+' '+q.h):null,
    phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), top, lastSay:ls?{t:String(ls.t).slice(0,40), who:ls.who, h:ls.h}:null, cons:(window.__ccCons||[]).slice(-5)}; })()"""

DKS_JS = r"""(ks=>{ const o={}; for(const k of ks){ const d=STORY.dayOfKey(k); o[k]=d==null?null:{d, wd:((CALENDAR.dateOf(d).wd%7)+7)%7}; } return o; })"""

# 讀檔（遊戲自己的 GAME.applySave）；a.phone＝讀完馬上打開手機（等同按手機鍵；手機開著遊戲暫停，畢業後篇不會「站著 2 秒就跳」）
LOAD_JS = r"""(async a=>{ const st=a.st; const s=GAME.defaults(st.name||'祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want');
  await GAME.applySave(s); if(a.phone&&GAME.openPhone) GAME.openPhone(a.tab||null); return {key:CALENDAR.dateOf(GAME.G.day).key, hour:+(+GAME.G.hour).toFixed(3), weather:GAME.G.weather}; })"""

SNAP_JS = r"""(()=>JSON.parse(JSON.stringify(GAME.snapshot())))()"""

PBODY_JS = r"""(()=>((document.getElementById('phoneBody')||{}).innerText||''))()"""

# 前置（讀檔以後馬上做；之後 GAME.snapshot 再讀一次，讓整個存檔一次到位）
SETUP_JS = r"""(q=>{ const G=GAME.G, F=G.flags||(G.flags={}), out={notes:[]}; G.contacts=G.contacts||{};
  for(const id of q.meet||[]){ try{ if(SOCIAL.meet) SOCIAL.meet(id,G.zone); if(SOCIAL.has&&!SOCIAL.has(id,'FIRST_MET')&&SOCIAL.remember) SOCIAL.remember(id,'FIRST_MET',''); const r=SOCIAL.rel(id); const rl=(q.rel||{})[id]||{}; for(const k in rl) r[k]=Math.max(r[k]||0,rl[k]); G.contacts[id]=G.day-300; F['met_'+id]=true; }catch(e){ out.notes.push('meet '+id+'：'+e); } }
  for(const id of q.dating||[]){ let ok=false; try{ if(typeof ROM!=='undefined'&&ROM.start) ok=!!ROM.start(G,id); }catch(e){ out.notes.push('ROM.start '+id+'：'+e); } if(!ok){ F['dating_'+id]=true; out.notes.push('ROM.start '+id+' 沒成功：只設 dating_ 旗標'); } }
  Object.assign(F, q.flags||{}); for(const k of q.unflags||[]) delete F[k];
  if(q.msgs) G.msgs=(G.msgs||[]).concat(q.msgs);
  if(q.movie){ try{ const x=MOVIES.withOf(q.movie.film,q.movie.who); out.later=x?!!MOVIES.later(G,q.movie.who,q.movie.film,x):'withOf null'; MOVIES.markSeen(G,q.movie.who,q.movie.film); MOVIES.markSeen(G,'me',q.movie.film); }catch(e){ out.notes.push('MOVIES.later：'+e); } }
  out.stage={}; for(const id of (q.meet||[])){ try{ out.stage[id]=SOCIAL.stage?SOCIAL.stage(id):null; }catch(e){} }
  out.dating=Object.keys(F).filter(k=>k.indexOf('dating_')===0&&F[k]);
  return out; })"""

LINES_JS = r"""(()=>({L:typeof AA811_LINES!=='undefined'?AA811_LINES:null, HH:typeof AA811!=='undefined'?AA811.HH:null, hint:typeof AA811!=='undefined'?AA811.HH_HINT:null, rain:typeof AA811!=='undefined'?AA811.HH_RAIN:null,
  zq:typeof AA811!=='undefined'?{off:AA811.ZQ.off,h:AA811.ZQ.h,first:AA811.ZQ.first}:null, when:typeof INV!=='undefined'?INV.WHEN_LABEL:null,
  first3:(()=>{ try{ const x=MOVIES.withOf('m2909a','heroine_04'); return x?{lines:x.lines, choice:(x.choice||[]).map(c=>c.t)}:null; }catch(e){ return String(e); } })(),
  sisName:SOCIAL.displayName('heroine_05'), zqName:SOCIAL.displayName('heroine_04'), evReg:typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.some(e=>e&&e.id==='ev_sis_hehuan')}))()"""

# 合歡山北峰：遊戲現在怎麼判（只讀）＋探針自己照日曆算的「應該列的日子」（不靠 AA811 的函式）
HH_INFO_JS = r"""(q=>{ const G=GAME.G, id='heroine_05', F=G.flags||{}, o={};
  o.key=CALENDAR.dateOf(G.day).key; o.hour=+(+G.hour).toFixed(2); o.weather=G.weather; o.pg=typeof PG!=='undefined'&&PG.on?!!PG.on(G):null;
  o.SIS_HEHUAN=F.SIS_HEHUAN===undefined?null:F.SIS_HEHUAN; o.WENT=F.SIS_HEHUAN_WENT===undefined?null:F.SIS_HEHUAN_WENT; o.dating=!!F.dating_heroine_05;
  try{ o.whyNot=INV.whyNot(G,id); o.canInv=!!INV.canInvite(G,id); o.contact=!!INV.hasContact(G,id); }catch(e){ o.invErr=String(e); }
  try{ const p=STORY.presence?STORY.presence(id,G):null; o.pres=p?{here:!!p.here,kind:p.kind||null}:null; }catch(e){ o.pres=String(e); }
  try{ o.stage=SOCIAL.stage(id); }catch(e){}
  try{ o.offer=AA811.hhOffer(G,id); o.days=AA811.hhDays(G).map(d=>CALENDAR.dateOf(d).key); o.cand=AA811.hhCand(G).map(d=>({key:CALENDAR.dateOf(d).key,busy:AA811.hhBusy(G,d)})); }catch(e){ o.aaErr=String(e); }
  o.exp=[]; for(let d=G.day+1;d<=G.day+7;d++){ const x=CALENDAR.dateOf(d), wd=((x.wd%7)+7)%7; if(x.key>=q.from&&x.key<=q.to&&(wd===0||wd===6)) o.exp.push({d, key:x.key, wd, label:DATE.dayLabel(G,d)}); }
  try{ o.trips=(G.trips||[]).filter(t=>t&&t.who===id).map(t=>({locs:t.locs,counted:!!t.counted,day:t.day})); }catch(e){}
  try{ const r=SOCIAL.rel(id); o.rel={npcRom:r.npcRom||0,fam:r.fam||0,trust:r.trust||0,comf:r.comf||0}; }catch(e){}
  return o; })"""

THREAD_JS = r"""(th=>(GAME.G.msgs||[]).filter(m=>PHONE.th(m)===th).map(m=>({d:CALENDAR.dateOf(m.day).key, day:m.day, h:+(+m.h||0).toFixed(3), from:m.from||m.who||'', text:String(m.text||''), tag:m.tag||null, ask:m.ask?{id:m.ask.id, opts:(m.ask.opts||[]).map(o=>o.t)}:null, ans:m.ans!=null?m.ans:null})))"""

PEND_JS = r"""(th=>(typeof PHONE!=='undefined'&&PHONE.pending?PHONE.pending(GAME.G):[]).filter(m=>!th||PHONE.th(m)===th).map(m=>({tag:m.tag||null,text:String(m.text||'').slice(0,40),ask:m.ask?m.ask.id:null})))"""

ALL_JS = [HOOK_JS, RESET_JS, EV_JS, ST_JS, WATCH_JS, IDLE_JS, DKS_JS, LOAD_JS, SNAP_JS, PBODY_JS, SETUP_JS, LINES_JS, HH_INFO_JS, THREAD_JS, PEND_JS]   # node --check 用


# ---------------------------------------------------------------- 小工具
async def st(pg):
    return await pg.evaluate(ST_JS)


async def evs(pg, i=0):
    return await pg.evaluate(EV_JS, i)


def says_of(E):
    return [e for e in E if e.get('k') == 'say']


def role_of(e):
    if not e.get('who') and not e.get('cid'): return 'narr'
    if not e.get('cid') and e.get('who') == PNAME: return 'player'
    return e.get('cid') or e.get('who')


def find_seq(ss, exp, start=0):
    """exp＝[(說話人, 字)] 照順序在 ss 裡找（中間可以夾別的句子）；回傳 (缺的, 說話人錯的, 位置)"""
    miss, bad, at = [], [], []; j = start
    for r, t in exp:
        k = next((i for i in range(j, len(ss)) if ss[i]['t'] == t), None)
        if k is None: miss.append(t); continue
        at.append(k); j = k + 1
        if role_of(ss[k]) != r: bad.append([t, ss[k].get('who'), ss[k].get('cid')])
    return miss, bad, at


class Menu:
    """選單剛出來的點擊可能被吃掉：同一組選項看到 ≥ 650 ms 才點；點了 2.5 秒還在＝再點一次"""
    def __init__(self): self.key = None; self.t0 = 0; self.tapped = 0

    async def ready(self, s):
        k = (s['ch'] or {}).get('i') if s['ch'] else tuple(s['btn'])
        if k != self.key: self.key = k; self.t0 = time.time(); self.tapped = 0; return False
        if self.tapped and time.time() - self.tapped < 2.5: return False
        return time.time() - self.t0 >= 0.65


class Ctx:
    def __init__(self, tag):
        self.tag = tag; self.path = []; self.pick = None; self.phone_ask = None; self.answer_others = True; self.want_th = None
        self.cur_th = None; self.opened = {}; self.answered = []; self.phone_texts = []; self.shots = 0; self.idle_n = 0; self.menus = []
        self.err0 = 0; self.seen_n = {}


async def close_phone(pg, cdp):
    for _ in range(3):
        if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): return True
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800)
    return not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())")


async def open_tab(pg, cdp, tab):
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(1000)


async def open_thread(pg, cdp, th):
    """玩家的路：手機 →「訊息」→ 點那一段對話；回傳 (點到沒有, 那一段的文字)"""
    await open_tab(pg, cdp, 'msg')
    ok = await L.tap(pg, cdp, '#phoneBody .chatList [data-th=%s]' % J(th))
    await pg.wait_for_timeout(1200)
    return ok, await pg.evaluate(PBODY_JS)


async def tap_choice(pg, cdp, k):
    HIT = "(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent!==null)[i]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; const h=document.elementFromPoint(x,y); return {c:[x,y],hit:!!h&&(h===b||b.contains(h)),top:h?(h.id||String(h.className).slice(0,30)):null}; })"
    q = await pg.evaluate(HIT, k)
    if not q: return False
    if not q['hit']:
        log('    [被蓋住] 選項底下最上層是 %s，先收手機／面板' % q.get('top'))
        await close_phone(pg, cdp); await L.close_panels(pg, cdp); await pg.wait_for_timeout(600)
        q = await pg.evaluate(HIT, k)
        if not q: return False
    await L.touch_tap(cdp, q['c'][0], q['c'][1]); return True


async def tap_dlg(pg, cdp, s):
    if s['typing'] and s['shown'] != s['full']:
        await pg.wait_for_timeout(700)
        s2 = await st(pg)
        if s2['typing'] and s2['shown'] != s2['full']: await pg.wait_for_timeout(1500)
    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450)


def default_pick(opts):
    for w in PREFER:
        k = next((i for i, o in enumerate(opts) if o.startswith(w)), None)
        if k is not None: return k
    k = next((i for i, o in enumerate(opts) if not any(x in o for x in EXIT_WORDS)), None)
    return 0 if k is None else k


async def idle_diag(pg, P, why):
    P.idle_n += 1
    d = await pg.evaluate(IDLE_JS); s = await st(pg)
    log('    [等待 %d｜%s] %s；畫面 %s' % (P.idle_n, why, J(d), J({k: s.get(k) for k in ('dlg', 'nb', 'btn', 'phone', 'inTh', 'interact')})))
    if P.shots < 6:
        P.shots += 1; await R.shot(pg, '%s_idle%d' % (P.tag, P.idle_n))


async def handle_phone(pg, cdp, P, s):
    """手機開著：在對話裡＝記下畫面上的字；有要回的照字選（P.phone_ask；別人的待回覆選第一個）；
    在列表＝P.want_th 那一段有新訊息就點進去看；別人的待回覆點進去；都沒有就收起來（畢業後篇跳日子打開的列表，收起來的鍵寫「跳過」）"""
    if s['inTh']:
        body = await pg.evaluate(PBODY_JS); P.phone_texts.append([P.cur_th, body])
        asks = [a for a in s['asks'] if not a['dis']]
        if asks:
            th_real = await pg.evaluate("(v=>{ const m=PHONE.byAsk(GAME.G,String(v).split('|')[0]); return m?PHONE.th(m):null; })", asks[0]['v'])
            if th_real and th_real != P.cur_th:   # 遊戲自己打開某一段（D103 phoneAuto）：探針不知道是哪一段，照待回覆那一則的 ask 查
                log('    [手機] 現在這一段＝%s（照 ask %s 查；探針記的是 %s）' % (th_real, asks[0]['v'], P.cur_th)); P.cur_th = th_real
            k = P.phone_ask(P.cur_th, [a['t'] for a in asks]) if P.phone_ask else None
            why = '照字選'
            if k is None and P.answer_others and P.cur_th != P.want_th: k = 0; why = '別人的待回覆：選第一個'
            if k is not None:
                log('    [手機回覆] %s：%s → %s（%s）' % (P.cur_th, '｜'.join(a['t'] for a in asks), asks[k]['t'], why))
                P.answered.append([P.cur_th, asks[k]['t'], (await st(pg))['key']])
                await L.tap(pg, cdp, '#phoneBody [data-ask=%s]' % J(asks[k]['v'])); await pg.wait_for_timeout(1800)
                P.phone_texts.append([P.cur_th, await pg.evaluate(PBODY_JS)])
                return True
            log('    [手機] %s 有要回的、但沒有要選的字：%s（不回）' % (P.cur_th, J([a['t'] for a in asks])))
        await close_phone(pg, cdp); P.cur_th = None; return True
    if s['tab'] not in (None, 'msg'):
        await close_phone(pg, cdp); return True
    have = [t['th'] for t in s['ths']]
    if P.want_th and P.want_th in have:
        n = await pg.evaluate("(th=>(GAME.G.msgs||[]).filter(m=>PHONE.th(m)===th).length)", P.want_th)
        if n > P.seen_n.get(P.want_th, 0):
            P.seen_n[P.want_th] = n; P.cur_th = P.want_th
            log('    [手機] 列表 → 點「%s」（那一段 %d 則）' % (P.want_th, n))
            await L.tap(pg, cdp, '#phoneBody .chatList [data-th=%s]' % J(P.want_th)); await pg.wait_for_timeout(1300); return True
    if P.answer_others:
        for t in s['ths']:
            if '待回覆' in t['t'] and P.opened.get(t['th'], 0) < 2 and t['th'] != P.want_th:
                P.opened[t['th']] = P.opened.get(t['th'], 0) + 1; P.cur_th = t['th']
                log('    [手機] 列表 → 待回覆「%s」（%s）' % (t['th'], t['t'][:40]))
                await L.tap(pg, cdp, '#phoneBody .chatList [data-th=%s]' % J(t['th'])); await pg.wait_for_timeout(1300); return True
    log('    [手機] 收起來／跳過（列表：%s）' % J([t['t'][:24] for t in s['ths'][:4]]))
    await close_phone(pg, cdp); P.cur_th = None; return True


async def drive(pg, cdp, P, until, max_s, wq, label):
    """像玩家一樣過：點對話、選項照字選、手機照 handle_phone；until(w, s) 成立就停。每 30 秒沒有新動作記一次狀態＋截圖。
    什麼都沒有的時候站著不動（不推搖桿）：畢業後篇站著 2 秒就跳到下一件事（postgrad3d.js S.tick）"""
    t0 = time.time(); last_act = time.time(); menu = Menu(); same = [None, 0]; n_ev = None; max_s = max_s * MAXS
    w = None; s = None
    while time.time() - t0 < max_s:
        s = await st(pg); w = await pg.evaluate(WATCH_JS, wq)
        if until(w, s): return w, s, True
        ne = await pg.evaluate("(window.__AE||[]).length")
        if ne != n_ev: n_ev = ne; last_act = time.time()
        if s['phone']:
            await handle_phone(pg, cdp, P, s); last_act = time.time(); continue
        if s['nb']:
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            opts = s['btn']; hints = []; subs = []
            if s['ch'] and len(s['ch'].get('opts') or []) == len(opts):
                hints = s['ch'].get('hints') or []; subs = s['ch'].get('subs') or []
            k = P.pick(opts, hints, subs) if P.pick else None
            if k is None: k = default_pick(opts)
            P.menus.append({'opts': opts, 'hints': hints, 'subs': subs, 'pick': opts[k], 'key': s['key'], 'h': s['hour'], 'internal': s['ch'] is None})
            log('    [選項%s] %s → %s' % ('（遊戲內部選單）' if s['ch'] is None else '', '｜'.join(opts), opts[k]))
            sig = (tuple(opts), s['zone'], round(s['hour'], 2))
            same = [sig, same[1] + 1] if same[0] == sig else [sig, 1]
            if same[1] > 6:
                await R.shot(pg, '%s_stuckopt' % P.tag); R.check('[%s] 選項「%s」按得下去' % (P.tag, opts[k]), False, J(s)); return w, s, False
            await tap_choice(pg, cdp, k); menu.tapped = time.time(); last_act = time.time(); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            await tap_dlg(pg, cdp, s); last_act = time.time(); continue
        if time.time() - last_act > 30:
            last_act = time.time(); await idle_diag(pg, P, label)
        await pg.wait_for_timeout(400)
    log('    [逾時] %s：%.0f 秒' % (label, max_s))
    await idle_diag(pg, P, label + '（逾時）')
    return w, s, False


async def dks(pg, keys):
    return await pg.evaluate(DKS_JS, keys)


def base_pg(dk, key, h, zone='campus', extra=None):
    """畢業後最小存檔（cc_aa593_sis_probe.py base_pg）：GRADUATED、GRAD_DONE、PG.done.grad、典禮那幾場 done；6/28 以前不設 MOVED_OUT／HOME_AFTER"""
    F = {'KX_DEC3_MIGRATED': True, 'GRADUATED': dk['2029-06-02']['d'], 'GRAD_DONE': True, 'PG': {'done': {'grad': 1}}, 'Y4_PATH': 'other', 'PACKED_Y4': dk['2029-06-01']['d'],
         'introDone': True, 'campusIntro': True, 'classDone': True}
    if key >= '2029-06-28': F.update({'MOVED_OUT': dk['2029-06-28']['d'], 'HOME_AFTER': 'home'})
    F.update(extra or {})
    d = dk[key]
    return {'v': 2, 'stage': 'law', 'name': PNAME, 'day': d['d'], 'weekday': d['wd'], 'hour': h, 'energy': 100, 'money': 22000, 'zone': zone,
            'pos': {'x': -34, 'z': 12.5, 'yaw': 3.14159, 'lv': 0}, 'weather': 'clear', 'flags': F,
            'events': {'done': {'ev_grad_family': 1, 'ev_grad_lunch': 1, 'ev_grad_envelope': 1, 'ev_move_out_y4': 1}, 'last': {}, 'count': 0}}


async def load(pg, st0, setup=None, phone=True, tab=None):
    """讀檔（GAME.applySave）→ 前置 → GAME.snapshot 再讀一次（整份一次到位）。phone：兩次讀檔都馬上打開手機（遊戲暫停，不會先跳日子）；
    快照的日期時間和要的不一樣（讀檔途中跳了）＝改回要的，記一行"""
    r1 = await pg.evaluate(LOAD_JS, {'st': st0, 'phone': phone, 'tab': tab}); await pg.wait_for_timeout(1200)
    out = None
    if setup:
        out = await pg.evaluate(SETUP_JS, setup)
        snap = await pg.evaluate(SNAP_JS)
        if snap.get('day') != st0['day'] or abs((snap.get('hour') or 0) - st0['hour']) > 0.02:
            log('    [讀檔] 快照的時間 %s %s ≠ 要的 %s %s（讀檔途中時間走了）：改回要的' % (snap.get('day'), snap.get('hour'), st0['day'], st0['hour']))
            snap['day'] = st0['day']; snap['weekday'] = st0['weekday']; snap['hour'] = st0['hour']
        r1 = await pg.evaluate(LOAD_JS, {'st': snap, 'phone': phone, 'tab': tab})
    await pg.wait_for_timeout(2500)
    await pg.evaluate(HOOK_JS)
    return out, r1


async def begin(pg, P):
    await pg.evaluate(HOOK_JS); await pg.evaluate(RESET_JS)
    P.err0 = len(ERRS)


async def pushable(pg, cdp):
    """推得動：搖桿推 ≥0.3 m。畢業後篇跳日子途中（淡出、字卡）推不動：最多 30 秒內再試"""
    t0 = time.time()
    while time.time() - t0 < 30 * MAXS:
        s = await st(pg)
        if s['phone']: await close_phone(pg, cdp)
        if s['dlg'] or s['nb']: return None
        for dx, dy in ((0, -60), (60, 0), (-60, 0), (0, 60)):
            moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2)
            if moved >= 0.3: return round(moved, 2)
        await pg.wait_for_timeout(1500)
    return 0.0


async def finish(pg, cdp, P):
    """共通：畫面字、JS 例外、之後能不能動（在家＝遊戲還在往下走）"""
    E = await evs(pg)
    texts = [e.get('t', '') for e in E if e.get('k') in ('say', 'toast', 'card', 'cap')] + [o for e in E if e.get('k') == 'ch' for o in (e.get('opts') or []) + (e.get('hints') or [])] + [t for _, t in P.phone_texts]
    bad = sorted(set(m.group(0) for t in texts for m in BAD_RX.finditer(str(t))))
    R.check('[%s] 畫面上沒有 {name}／undefined／NaN／TODO／PLACEHOLDER（台詞 %d、選項、toast、字幕、手機 %d 段）' % (P.tag, len(says_of(E)), len(P.phone_texts)), not bad, J([t[:60] for t in texts if BAD_RX.search(str(t))][:5]))
    er = ERRS[P.err0:]
    R.check('[%s] 沒有 JS 例外（pageerror）' % P.tag, not er, J(er[:3]))
    cons = await pg.evaluate("(window.__ccCons||[]).filter(x=>x.indexOf('error')===0).slice(-5)")
    if cons: R.note('[%s] console.error（只記）：%s' % (P.tag, J(cons)))
    await close_phone(pg, cdp)
    s = await st(pg)
    # BB 20:02（N1_AA811 HEHUAN_A「推得動」FAIL＝TEST_BUG）：畢業後篇在家的選單（home3d.js S.loop）在畫面上＝遊戲在等你選，不推搖桿；
    # 記選項、照字選第一個能選的，看時間（key／hour）或畫面（選單換了、對話、手機）有沒有往前走（真實 60 秒上限，雲端 1 fps 約 5 秒遊戲時間）
    BTN = "(()=>[...document.querySelectorAll('#choices button')].filter(b=>(b.getClientRects().length>0&&getComputedStyle(b).visibility!=='hidden')&&!b.disabled).map(b=>{ const r=b.getBoundingClientRect(); return {t:(b.textContent||'').trim(), x:r.left+r.width/2, y:r.top+r.height/2}; }))()"
    btn = await pg.evaluate(BTN)
    for _ in range(24):   # N1_AA811_A（ab28）：演完那一刻還沒進 home、選單晚幾秒才出（S.loop）——推搖桿之前先等最多 12 秒，看選單或 home 有沒有出來
        if btn or s['home'] or s['dlg']: break
        await pg.wait_for_timeout(500); s = await st(pg); btn = await pg.evaluate(BTN)
    if btn:
        k0 = (s['key'], s['hour']); m0 = [x['t'] for x in btn]
        R.note('[%s] 演完以後畫面上是選單（在家 %s）：%s → 照字選第一個「%s」，不推搖桿' % (P.tag, s.get('home'), J(m0), m0[0]))
        await L.touch_tap(cdp, btn[0]['x'], btn[0]['y'])
        t0 = time.time(); moved = None
        while time.time() - t0 < 60:
            await pg.wait_for_timeout(500)
            s2 = await st(pg)
            m2 = await pg.evaluate("(()=>[...document.querySelectorAll('#choices button')].filter(b=>(b.getClientRects().length>0&&getComputedStyle(b).visibility!=='hidden')).map(b=>(b.textContent||'').trim()))()")
            if (s2['key'], s2['hour']) != k0 or m2 != m0 or s2['dlg'] or s2['phone']:
                moved = J({'key': s2.get('key'), 'hour': s2.get('hour'), 'menu': m2[:6], 'dlg': s2.get('dlg'), 'phone': s2.get('phone')}); break
        R.check('[%s] 演完以後沒有卡住（選單選了「%s」以後時間或畫面往前走）' % (P.tag, m0[0]), moved is not None, moved or J(await pg.evaluate(IDLE_JS)))
    elif s['home']:
        k0 = (s['key'], s['hour']); t0 = time.time(); moved = None
        while time.time() - t0 < 60 * MAXS:
            s2 = await st(pg)
            if (s2['key'], s2['hour']) != k0 or s2['dlg'] or s2['nb'] or s2['phone']: moved = J({k: s2.get(k) for k in ('key', 'hour', 'dlg', 'nb', 'phone', 'zone')}); break
            await pg.wait_for_timeout(500)
        R.check('[%s] 演完以後沒有卡住（在家：60 秒內時間有往下走、或有下一段對話／選單／手機）' % P.tag, moved is not None, J(await pg.evaluate(IDLE_JS)))
    else:
        mv = await pushable(pg, cdp)
        if mv is None:
            R.note('[%s] 演完以後下一段劇情接著開始：不推搖桿，記狀態 %s' % (P.tag, J(await pg.evaluate(IDLE_JS))))
        else:
            s = await st(pg)
            R.check('[%s] 演完以後推得動（搖桿 ≥0.3 m；%s %s %.2f）' % (P.tag, s['zone'], s['key'], s['hour']), mv >= 0.3, J({'moved': mv, 'idle': await pg.evaluate(IDLE_JS)}))
    R.note('[%s] 走的路：%s' % (P.tag, '；'.join(P.path) or '（沒有記）'))
    if P.menus: log('  [%s] 選過的選單：%s' % (P.tag, J([[m['opts'], m['pick'], m['key'], m['h']] for m in P.menus][-14:])))
    log('  [%s] 台詞（%d 句）：' % (P.tag, len(says_of(E))))
    for x in says_of(E): log('    [說] %s %s｜%s｜%s' % (x.get('d'), x.get('h'), role_of(x), x['t']))


# ---------------------------------------------------------------- 合歡山北峰
LINES = {}


async def lines(pg):
    if not LINES:
        LINES.update(await pg.evaluate(LINES_JS))
        hh = (LINES.get('L') or {}).get('hehuan') or {}
        R.check('資料：AA811_LINES 讀得到、ev_sis_hehuan 登記在 STORY_EVENTS', bool(hh) and bool(LINES.get('evReg')), J({'L': bool(LINES.get('L')), 'ev': LINES.get('evReg')}))
        R.check('資料：標題「%s」、她答應那一句「%s」、清單小字「%s」（和單元／稿一樣）' % (HH_T, HH_ACCEPT, HH_HINT_EXP),
                hh.get('title') == HH_T and hh.get('accept') == HH_ACCEPT and LINES.get('hint') == HH_HINT_EXP, J([hh.get('title'), hh.get('accept'), LINES.get('hint')]))
        R.note('資料：HH＝%s；「這個時候才有」＝%s；學姊顯示名＝%s；子晴＝%s' % (J(LINES.get('HH')), LINES.get('when'), LINES.get('sisName'), LINES.get('zqName')))
    return LINES


def hh_expect(L_, ver, picks):
    """照遊戲資料 AA811_LINES.hehuan.dialogue 排出這一版應該演的句子（說話人, 字）、兩組選項、另一版的句子"""
    dlg = ((L_.get('L') or {}).get('hehuan') or {}).get('dialogue') or []
    seq, chs, other, k = [], [], [], 0
    for x in dlg:
        if x.get('set'): continue
        if x.get('if'):
            ln = x.get('line') or {}
            (seq if x['if'] == ver else other).append((ln.get('speaker') or 'narr', ln.get('text')))
            continue
        if isinstance(x.get('choice'), list):
            opts = [c.get('t') for c in x['choice']]; chs.append(opts)
            want = picks[k] if k < len(picks) else None; k += 1
            c = next((c for c in x['choice'] if c.get('t') == want), None)
            if c: seq += [(s.get('speaker') or 'narr', s.get('text')) for s in (c.get('say') or [])]
            continue
        seq.append((x.get('speaker') or 'narr', x.get('text')))
    script = set(t for _, t in seq + other)
    for x in dlg:
        for c in (x.get('choice') or []):
            for s in (c.get('say') or []): script.add(s.get('text'))
    return seq, chs, other, script


async def hh_load(pg, P, key, h, sis_flag=True, dating=False, phone=True, why=''):
    keys = sorted(set(['2029-01-20', '2029-06-01', '2029-06-02', '2029-06-28', key]))
    dk = await dks(pg, keys)
    fl = {'met_sis': True}
    if sis_flag: fl['SIS_HEHUAN'] = dk['2029-01-20']['d']
    st0 = base_pg(dk, key, h, extra=fl)
    rel = dict(REL_CLOSE); rel.update({'npcRom': 60, 'rom': 40} if dating else {'npcRom': 10})
    setup = {'meet': [SIS], 'rel': {SIS: rel}, 'dating': [SIS] if dating else [], 'unflags': [] if sis_flag else ['SIS_HEHUAN', 'SIS_HEHUAN_WENT']}
    out, r1 = await load(pg, st0, setup, phone=phone, tab='friends' if phone else None)
    info = await pg.evaluate(HH_INFO_JS, {'from': HH_FROM, 'to': HH_TO})
    R.setup('[%s]【前置／捷徑】讀檔（GAME.applySave）到 %s %.2f 校園（畢業後最小存檔：GRADUATED、GRAD_DONE、PG.done.grad）；學姊 FIRST_MET、rel %s、有聯絡方式%s；%s；%s讀完%s；前置結果 %s；讀完 %s；狀態 %s' % (
        P.tag, key, h, J(rel), '、ROM.start（交往中）' if dating else '（沒在交往）', 'SIS_HEHUAN＝2029-01-20（《m2901b》學姊那一題答應）' if sis_flag else '沒有 SIS_HEHUAN（電影那一題沒答應）',
        why + '；' if why else '', '馬上打開手機「朋友」（等同按手機鍵）' if phone else '不碰手機', J(out), J(r1), J(info)))
    return info


async def tap_invite(pg, cdp, P, who=SIS):
    """玩家的路：手機「朋友」→ 那一列「約」。回傳 True＝按到"""
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(1000)
    sel = '#phoneBody [data-inv=%s]' % J(who)
    has = await pg.evaluate("(s=>!!document.querySelector(s))", sel)
    if not has:
        row = await pg.evaluate("(id=>{ const b=document.querySelector('#phoneBody [data-person=\"'+id+'\"]'); const r=b&&b.closest('.phrow'); return r?(r.innerText||'').replace(/\\s+/g,' ').slice(0,160):null; })", who)
        R.check('[%s] 手機「朋友」學姊那一列有「約」' % P.tag, False, '那一列：%s' % row)
        await R.shot(pg, '%s_noinv' % P.tag); return False
    ok = await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
    R.check('[%s] 手機「朋友」→ 學姊那一列「約」按得到' % P.tag, ok, '')
    return ok


def find_hh(opts, subs):
    """第一層：直接列的「合歡山北峰」，或某一類（「這個時候才有…」）的小項有它"""
    if HH_T in opts: return opts.index(HH_T), 'direct'
    for i, sb in enumerate(subs or []):
        if sb and HH_T in sb: return i, 'cat:' + opts[i]
    return None, None


async def book(pg, cdp, P, day_idx=0):
    """照玩家約：清單（照字）→ 選日子 → 她答應 →「約好了」。回傳 step（每一層看到什麼）"""
    step = {'menus': []}

    def pick(o, h, sb):
        step['menus'].append({'opts': o, 'hints': h, 'subs': sb})
        if step.get('picked') and 'day' not in step and o and o[-1] == '算了' and len(o) >= 2 and HH_T not in o:   # 選了「合歡山北峰」以後的下一個選單＝選日子
            step['day'] = {'opts': o, 'hints': h, 'pick': o[min(day_idx, len(o) - 2)]}; return min(day_idx, len(o) - 2)
        k, how = find_hh(o, sb)
        if k is not None:
            if how == 'direct': step['item'] = {'hint': h[k] if k < len(h) else None, 'top': 'top' not in step}; step['picked'] = True
            step.setdefault('top', {'opts': o, 'how': how}); step.setdefault('how', how)
            return k
        if 'top' not in step:
            step['top'] = {'opts': o, 'subs': sb, 'how': None}
            log('    [約] 第一層沒有「%s」：%s；小項 %s → 算了' % (HH_T, J(o), J(sb)))
            return o.index('算了') if '算了' in o else len(o) - 1
        return None
    P.pick = pick
    if not await tap_invite(pg, cdp, P): return step
    P.path.append('手機「朋友」→ 學姊「約」→ 清單照字選「%s」→ 選日子 → 她答應' % HH_T)
    w, s, ok = await drive(pg, cdp, P, lambda w, s: (('top' in step and step.get('how') is None) or any(q['state'] == 'planned' for q in w['outs'])) and not s['dlg'] and not s['nb'], 180,
                           {'ev': 'ev_sis_hehuan'}, '約學姊去合歡山北峰')
    step['w'] = w
    await close_phone(pg, cdp)
    return step


async def part_hh(pg, cdp, ver):
    P = Ctx('HEHUAN_' + ('A' if ver == 'friend' else 'B')); await begin(pg, P)
    L_ = await lines(pg); dating = ver == 'dating'
    chosen = None; tried = []
    for key in ENVL('HH_DATES', '2029-09-11,2029-09-18,2029-10-09,2029-06-12'):
        info = await hh_load(pg, P, key, 15.0, sis_flag=True, dating=dating, why='候選日 %s' % key)
        o = info.get('offer') or {}
        ok = info.get('pg') and info.get('whyNot') == '' and info.get('canInv') and o and not o.get('dim') and info.get('days') and info.get('dating') == dating
        if ok: chosen = (key, info); break
        tried.append([key, J({k: info.get(k) for k in ('pg', 'whyNot', 'canInv', 'pres', 'offer', 'cand', 'dating')})])
        await close_phone(pg, cdp)
    if tried: R.note('[%s] 跳過的候選日：%s' % (P.tag, J(tried)))
    if not R.check('[%s] 前置：找到學姊可以約、「合歡山北峰」能約（畢業後篇、%s）的日子' % (P.tag, '交往中' if dating else '沒在交往'), bool(chosen), J(tried)):
        await finish(pg, cdp, P); return
    key, info = chosen
    exp = info['exp']
    R.note('[%s] 用 %s；探針照日曆算「應該列的日子」（7 天內、6/15～10/31、週六日）＝%s；遊戲 hhDays＝%s；候選＝%s' % (P.tag, key, J([e['key'] for e in exp]), J(info.get('days')), J(info.get('cand'))))
    await pg.evaluate(RESET_JS)
    step = await book(pg, cdp, P, 0)
    E = await evs(pg); ss = says_of(E)
    R.check('[%s] 約的清單有「%s」（%s）' % (P.tag, HH_T, step.get('how')), step.get('how') is not None, J(step.get('top')))
    if step.get('how', '') and step['how'].startswith('cat:'):
        R.check('[%s] 那一類＝「%s…」' % (P.tag, LINES.get('when') or '這個時候才有'), step['how'] == 'cat:%s…' % (LINES.get('when') or '這個時候才有'), step['how'])
    hint = next((m['hints'][m['opts'].index(HH_T)] for m in step['menus'] if HH_T in m['opts'] and len(m['hints']) == len(m['opts'])), None)
    R.check('[%s] 「%s」的小字＝「%s」' % (P.tag, HH_T, HH_HINT_EXP), hint == HH_HINT_EXP, J(hint))
    dm = step.get('day') or {}
    want = [e['label'] for e in exp if e['key'] in (info.get('days') or [])] + ['算了']
    R.check('[%s] 選日子的小字都是「%s」' % (P.tag, HH_HINT_EXP), bool(dm.get('hints')) and all(x == HH_HINT_EXP for x in dm['hints'][:-1]), J(dm.get('hints')))
    R.check('[%s] 遊戲列的日子（hhDays）都在探針照日曆算的週末裡' % P.tag, set(info.get('days') or []) <= set(e['key'] for e in exp), J({'game': info.get('days'), 'exp': [e['key'] for e in exp]}))
    R.check('[%s] 選日子：只列 7 天內 6/15～10/31 的週六、週日（%s）＋算了' % (P.tag, '、'.join(e['key'] for e in exp)), dm.get('opts') == want and all(e['wd'] in (0, 6) for e in exp), J({'畫面': dm.get('opts'), '應該': want}))
    if not dm: await finish(pg, cdp, P); return
    k_acc = next((i for i, x in enumerate(ss) if x['t'] == HH_ACCEPT), None)
    R.check('[%s] 她答應「%s」（手機：說話人寫「（手機）」）' % (P.tag, HH_ACCEPT), k_acc is not None and ss[k_acc].get('cid') == SIS and '（手機）' in str(ss[k_acc].get('who')), J([[x.get('who'), x['t']] for x in ss[-6:]]))
    th = await pg.evaluate(THREAD_JS, 'p:' + SIS)
    R.check('[%s] 她答應那一句寫進手機和她的對話串' % P.tag, any(m['text'] == HH_ACCEPT and m['from'] == SIS for m in th), J([m['text'] for m in th[-4:]]))
    w = step.get('w') or {}
    q = next((x for x in w.get('outs', []) if x['state'] == 'planned'), None)
    day_key = next((e['key'] for e in exp if e['label'] == dm.get('pick')), None)
    R.check('[%s] 排成出遊：%s 04:00、noRain、dawn、late −0.5、travelH 0.5、回到臺北' % (P.tag, day_key), bool(q) and q['key'] == day_key and q['h'] == 4 and q['noRain'] and q['dawn'] and q['late'] == -0.5 and q['travelH'] == 0.5 and q['back'] == HH_BACK and q['who'] == SIS, J(q))
    lab = (dm.get('pick') or '').strip()
    R.check('[%s] 系統字「約好了：%s 04:00，%s。」' % (P.tag, lab, HH_T), any(x['t'] == '約好了：%s 04:00，%s。' % (lab, HH_T) for x in ss), J([x['t'] for x in ss[-4:]]))
    if not q: await finish(pg, cdp, P); return
    i_after = await pg.evaluate("(window.__AE||[]).length")
    # ---- 出發那一天：站著不動，讓畢業後篇自己跳到 03:15 問「出發」
    seq, chs, other, script = hh_expect(L_, ver, PICKS[ver])
    picks = list(PICKS[ver]); seen_out = {}

    def pick2(o, h, sb):
        hhout = next((i for i, x in enumerate(o) if x.startswith('出發') and HH_T in x), None)
        if hhout is not None:
            seen_out.setdefault('opts', o); return hhout
        if picks and picks[0] in o: return o.index(picks.pop(0))
        return None
    P.pick = pick2; P.answer_others = True
    P.path.append('之後站著不動：畢業後篇自己跳到出發那天 03:15 → 選單「出發：…%s」→ 出發 → 2D → 選項照字（%s）' % (HH_T, '／'.join(PICKS[ver])))
    w2, s2, ok2 = await drive(pg, cdp, P, lambda w, s: any(x['state'] in ('done', 'missed') for x in w['outs']) and not s['dlg'] and not s['nb'], 1500,
                              {'ev': 'ev_sis_hehuan', 'fl': ['SIS_HEHUAN_WENT']}, '等出發、演合歡山北峰')
    for _ in range(40):   # aa811_r1：state 先變 done，「回到臺北。」字幕在 fade、advance 之後才出（outings3d.js）——先等字幕（最多 20 秒）再收事件（CC_02 乙 6）
        if any(e.get('k') in ('cap', 'say') and e.get('t') == HH_BACK for e in (await evs(pg))[i_after:]): break
        await pg.wait_for_timeout(500)
    E2 = (await evs(pg))[i_after:]; ss2 = says_of(E2)
    qq = next((x for x in (w2 or {}).get('outs', [])), None)
    R.check('[%s] 出遊演完（state done，沒有被記成 missed）' % P.tag, bool(qq) and qq['state'] == 'done', J(qq))
    ch_out = next((e for e in E2 if e.get('k') == 'ch' and any(o.startswith('出發') and HH_T in o for o in e.get('opts') or [])), None)
    R.check('[%s] 出發那天 03:15～03:30 跳出「出發：…%s」' % (P.tag, HH_T), bool(ch_out) and ch_out.get('d') == q['day'] and 3.25 - 0.02 <= (ch_out.get('h') or 0) <= 3.5 + 0.02,
            J(ch_out and {k: ch_out.get(k) for k in ('opts', 'hints', 'd', 'h')}))
    miss, bad, at = find_seq(ss2, seq)
    R.check('[%s] %s版：句子照資料的順序（%d 句）、說話人對' % (P.tag, ver, len(seq)), not miss and not bad, J({'缺': miss[:4], '說話人錯': bad[:4]}))
    oth = [t for _, t in other if any(x['t'] == t for x in ss2)]
    R.check('[%s] 另一版的句子一句都沒有' % P.tag, not oth, J(oth))
    if at:
        seg = ss2[at[0]:at[-1] + 1]
        extra = [x['t'] for x in seg if x['t'] not in script]
        R.check('[%s] 演出來的每一句都在資料裡（沒有多的）' % P.tag, not extra, J(extra[:5]))
    chm = [e for e in E2 if e.get('k') == 'ch' and e.get('opts') in chs]
    R.check('[%s] 兩組選項照資料（%s）' % (P.tag, ' ／ '.join('｜'.join(c) for c in chs)), [e.get('opts') for e in chm] == chs, J([e.get('opts') for e in E2 if e.get('k') == 'ch']))
    R.check('[%s] 選了 %s' % (P.tag, J(PICKS[ver])), [e['opts'][e['pick']] if e.get('pick') is not None else None for e in chm] == PICKS[ver], J([[e.get('opts'), e.get('pick')] for e in chm]))
    cap = [e for e in E2 if e.get('k') in ('cap', 'say') and e.get('t') == HH_BACK]
    R.check('[%s] 22:00「%s」（出發那天）' % (P.tag, HH_BACK), bool(cap) and cap[-1].get('d') == q['day'] and abs((cap[-1].get('h') or 0) - 22) < 0.1, J([{k: c.get(k) for k in ('k', 'd', 'h', 't')} for c in cap]))
    if at:
        i0, i1 = ss2[at[0]]['i'], ss2[at[-1]]['i']
        adj = [e for e in E2 if e.get('k') == 'adj' and e.get('id') == SIS and i0 <= e['i'] <= i1]
        sm = {k: sum(int((e.get('dl') or {}).get(k) or 0) for e in adj) for k in ('npcRom', 'fam', 'trust', 'comf')}
        R.check('[%s] 選項的效果（SOCIAL.adjust 加總）：戀愛 %d、熟悉 %d（單元第 4 節）' % (P.tag, FX_EXP[ver]['npcRom'], FX_EXP[ver]['fam']), sm['npcRom'] == FX_EXP[ver]['npcRom'] and sm['fam'] == FX_EXP[ver]['fam'], J({'sum': sm, 'adj': [e.get('dl') for e in adj]}))
    info2 = await pg.evaluate(HH_INFO_JS, {'from': HH_FROM, 'to': HH_TO})
    R.check('[%s] 演完：SIS_HEHUAN_WENT、記一次校外約會（G.trips 合歡山北峰）、約的清單不再有它（hhOffer null）' % P.tag,
            info2.get('WENT') is True and any((t.get('locs') or [None])[0] == HH_T and t.get('counted') for t in info2.get('trips') or []) and info2.get('offer') is None, J({k: info2.get(k) for k in ('WENT', 'trips', 'offer')}))
    if ss2 and ver == 'dating':
        R.note('[%s] 交往中：出發選單的字＝%s（OUT.tt：學姊→書瑀）' % (P.tag, J(seen_out.get('opts'))))
    await finish(pg, cdp, P)


async def neg_absent(pg, cdp, P, key, sis_flag, label):
    info = await hh_load(pg, P, key, 15.0, sis_flag=sis_flag, why=label)
    R.note('[%s] 遊戲判：offer %s；cand %s；探針照日曆算的週末 %s；whyNot %r' % (P.tag, J(info.get('offer')), J(info.get('cand')), J([e['key'] for e in info.get('exp') or []]), info.get('whyNot')))
    if not R.check('[%s] 前置：學姊可以約（「約」按鈕在、畢業後篇）' % P.tag, info.get('whyNot') == '' and info.get('canInv') and info.get('pg'), J({k: info.get(k) for k in ('whyNot', 'canInv', 'pg', 'pres')})):
        await close_phone(pg, cdp); return
    await pg.evaluate(RESET_JS)
    step = await book(pg, cdp, P)
    top = step.get('top') or {}
    R.check('[%s] %s：約的清單第一層沒有「%s」、每一類的小項也沒有' % (P.tag, label, HH_T), bool(top) and step.get('how') is None and HH_T not in (top.get('opts') or []) and not any(sb and HH_T in sb for sb in top.get('subs') or []),
            J({'第一層': top.get('opts'), '小項': top.get('subs')}))
    w = await pg.evaluate(WATCH_JS, {'ev': 'ev_sis_hehuan'})
    R.check('[%s] 沒有排出合歡山北峰的出遊' % P.tag, not w['outs'], J(w['outs']))
    await close_phone(pg, cdp)


async def part_neg(pg, cdp):
    base_key = ENVL('HH_DATES', '2029-09-11')[0]
    for case in ENVL('NEG_CASES', 'noflag,early,late,rain'):
        P = Ctx('HEHUAN_NEG_' + case); await begin(pg, P)
        try:
            await lines(pg)
            if case == 'noflag':
                P.path.append('手機「朋友」→ 學姊「約」→ 看清單 → 算了')
                await neg_absent(pg, cdp, P, base_key, False, '沒有 SIS_HEHUAN（%s）' % base_key)
            elif case == 'early':
                P.path.append('手機「朋友」→ 學姊「約」→ 看清單 → 算了')
                await neg_absent(pg, cdp, P, '2029-06-08', True, '2029-06-08（五）：7 天內 6/9、6/10 是 6/15 以前，6/15 在窗內但是週五')
            elif case == 'late':
                P.path.append('手機「朋友」→ 學姊「約」→ 看清單 → 算了')
                await neg_absent(pg, cdp, P, '2029-10-28', True, '2029-10-28（日）：7 天內的週末 11/3、11/4 已經過了 10/31')
            elif case == 'rain':
                await neg_rain(pg, cdp, P, base_key)
            else:
                R.check('[%s] NEG_CASES 認得「%s」' % (P.tag, case), False, 'noflag,early,late,rain'); continue
            await finish(pg, cdp, P)
        except Exception as e:
            await R.shot(pg, '%s_exc' % P.tag)
            R.check('[%s] 沒有中斷' % P.tag, False, repr(e)[:300])


async def neg_rain(pg, cdp, P, key):
    info = await hh_load(pg, P, key, 15.0, sis_flag=True, why='下雨取消')
    if not R.check('[%s] 前置：「合歡山北峰」能約' % P.tag, bool(info.get('offer')) and not (info.get('offer') or {}).get('dim') and info.get('whyNot') == '', J({k: info.get(k) for k in ('offer', 'whyNot', 'cand')})):
        return
    step = await book(pg, cdp, P, 0)
    w = step.get('w') or {}
    q = next((x for x in w.get('outs', []) if x['state'] == 'planned'), None)
    if not R.check('[%s] 前置：照玩家約好了（出遊 planned）' % P.tag, bool(q), J(w.get('outs'))): return
    # 【捷徑】出發那天 03:00、下雨
    snap = await pg.evaluate(SNAP_JS)
    dk = await dks(pg, [q['key']])
    snap['day'] = q['day']; snap['weekday'] = dk[q['key']]['wd']; snap['hour'] = 3.0; snap['weather'] = 'rain'
    R.setup('[%s]【捷徑】約好以後存檔照抄（GAME.snapshot），只改成出發那天 %s 03:00、天氣 rain 再讀檔（畢業後篇跳日子時天氣一律設 clear（postgrad3d.js setT），自然下不了雨）' % (P.tag, q['key']))
    P.path.append('約好 → 捷徑：存檔改到出發那天 03:00、下雨 → 站著不動')
    r1 = await pg.evaluate(LOAD_JS, {'st': snap, 'phone': False}); await pg.wait_for_timeout(1500); await pg.evaluate(HOOK_JS)
    R.note('[%s] 讀完：%s' % (P.tag, J(r1)))
    i0 = await pg.evaluate("(window.__AE||[]).length")
    P.pick = lambda o, h, sb: None
    w2, s2, ok2 = await drive(pg, cdp, P, lambda w, s: any(x['state'] != 'planned' for x in w['outs']) or w['hour'] >= 4.6 or w['day'] > q['day'], 600, {'ev': 'ev_sis_hehuan'}, '下雨的出發時間')
    E = (await evs(pg))[i0:]
    qq = next((x for x in (w2 or {}).get('outs', [])), None)
    R.check('[%s] 下雨：記成 missed、rained' % P.tag, bool(qq) and qq['state'] == 'missed' and qq['rained'], J(qq))
    asked = [e for e in E if e.get('k') == 'ch' and any(HH_T in o for o in e.get('opts') or [])]
    R.check('[%s] 下雨：不問「出發」' % P.tag, not asked, J([e.get('opts') for e in asked]))
    first = (((LINES.get('L') or {}).get('hehuan') or {}).get('dialogue') or [{}])[0].get('text')
    R.check('[%s] 下雨：沒有演（第一句「%s」沒有出現）' % (P.tag, (first or '')[:16]), not any(e.get('k') == 'say' and e.get('t') == first for e in E), '')
    sis_now = await pg.evaluate("SOCIAL.displayName('heroine_05')")   # 讀檔以後才算名字（開頁時還沒認識，是「不認識的女生」：aa811_r1 rain 的 TEST_BUG）
    want = (LINES.get('rain') or '').replace('{who}', sis_now or '')
    tt = [e.get('t') for e in E if e.get('k') == 'toast']
    R.check('[%s] 一行系統字「%s」' % (P.tag, want), bool(want) and want in tt and want == '下雨了，和%s去合歡山北峰的行程取消。' % (sis_now or ''), J(tt))
    info2 = await pg.evaluate(HH_INFO_JS, {'from': HH_FROM, 'to': HH_TO})
    R.note('[%s] 取消以後遊戲判：%s' % (P.tag, J({k: info2.get(k) for k in ('key', 'hour', 'offer', 'days', 'WENT', 'whyNot')})))
    # 之後還可以再約：照玩家再打開「約」的清單看（只看、算了）
    step2 = {}

    def pk(o, h, sb):
        if 'top' not in step2:
            k, how = find_hh(o, sb); step2['top'] = {'opts': o, 'subs': sb, 'how': how}
            return o.index('算了') if '算了' in o else len(o) - 1
        return None
    P.pick = pk
    P.path.append('取消以後再打開手機「朋友」→ 學姊「約」→ 看清單 → 算了')
    if await tap_invite(pg, cdp, P):
        await drive(pg, cdp, P, lambda w, s: 'top' in step2 and not s['dlg'] and not s['nb'], 120, {}, '再約一次（看清單）')
    t2 = step2.get('top') or {}
    R.check('[%s] 之後還可以再約：清單裡還有「%s」、沒有 SIS_HEHUAN_WENT' % (P.tag, HH_T), t2.get('how') is not None and info2.get('WENT') is None,
            J({'清單': t2, 'WENT': info2.get('WENT'), 'offer': info2.get('offer')}))
    await close_phone(pg, cdp)


# ---------------------------------------------------------------- 子晴語音
CN = {'一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10}


def cn_num(s):
    if len(s) == 1: return CN.get(s, 0)
    if s[0] == '十': return 10 + CN.get(s[1], 0)
    return CN.get(s[0], 0) * 10 + (CN.get(s[2], 0) if len(s) > 2 else 0)


def zq_offsets(msgs):
    """稿上的「第 N 天」→ D0＋N−1；「不數了」＝D0＋36（單元第 6 節同一個算法；探針自己從字算，不讀 AA811.ZQ.off）"""
    out = []
    for t in msgs:
        m = re.search(r'第(.+?)天', t)
        out.append(cn_num(m.group(1)) - 1 if m else 36)
    return out


async def part_voice(pg, cdp):
    for case in ENVL('VOICE_CASES', 'new'):
        P = Ctx('VOICE_' + case); await begin(pg, P)
        try:
            L_ = await lines(pg)
            zv = (L_.get('L') or {}).get('zq_voice') or {}
            msgs = zv.get('msgs') or []; rep = ((zv.get('reply9') or {}).get('opts')) or []
            OFF = zq_offsets(msgs)
            R.check('[%s] 資料：十則、第九則兩個回覆（字和單元一樣：%s）' % (P.tag, J([r[0] for r in ZQ_REP9_EXP])),
                    len(msgs) == 10 and [o.get('t') for o in rep] == [r[0] for r in ZQ_REP9_EXP] and [o.get('say') for o in rep] == [r[1] for r in ZQ_REP9_EXP], J({'n': len(msgs), 'rep': rep}))
            R.check('[%s] 資料：第 N 天→D0＋N−1（探針從字算）＝AA811.ZQ.off' % P.tag, OFF == ((L_.get('zq') or {}).get('off')), J({'字算': OFF, 'code': (L_.get('zq') or {}).get('off')}))
            if case == 'new': await voice_new(pg, cdp, P, L_, msgs, rep, OFF)
            elif case == 'old': await voice_old(pg, cdp, P, msgs, OFF)
            else:
                R.check('[%s] VOICE_CASES 認得「%s」' % (P.tag, case), False, 'new,old'); continue
            await finish(pg, cdp, P)
        except Exception as e:
            await R.shot(pg, '%s_exc' % P.tag)
            R.check('[%s] 沒有中斷' % P.tag, False, repr(e)[:300])


async def zq_load(pg, P, key, h, extra_flags=None, movie=True, msgs=None, phone=True, why=''):
    keys = sorted(set(['2029-06-01', '2029-06-02', '2029-06-28', key]))
    dk = await dks(pg, keys)
    st0 = base_pg(dk, key, h, extra=dict(extra_flags or {}))
    setup = {'meet': [ZQ], 'rel': {ZQ: REL_FRIEND}, 'movie': {'film': 'm2909a', 'who': ZQ} if movie else None, 'msgs': msgs}
    out, r1 = await load(pg, st0, setup, phone=phone, tab='msg' if phone else None)
    R.setup('[%s]【前置／捷徑】讀檔（GAME.applySave）到 %s %.2f 校園（畢業後最小存檔）；子晴 FIRST_MET、rel %s、有聯絡方式；%s；%s；讀完%s；前置結果 %s；讀完 %s' % (
        P.tag, key, h, J(REL_FRIEND), '【捷徑】看完《m2909a》散場那一段跳過：叫遊戲的 MOVIES.later（with.later 照稿排三則）＋MOVIES.markSeen' if movie else '不排電影那三則', why,
        '馬上打開手機（等同按手機鍵）' if phone else '不碰手機', J(out), J(r1)))
    return dk, out


async def voice_new(pg, cdp, P, L_, msgs, rep, OFF):
    vr = int(os.environ.get('VOICE_REPLY') or 0)
    dk, out = await zq_load(pg, P, '2029-09-10', 21.0, why='')
    w0 = await pg.evaluate(WATCH_JS, {'rx': '^mv745_m2909a_heroine_04_|^zqvoice_', 'fl': ['ZQ_VOICE_D0', 'ZQ_VOICE_Q', 'ZQ_VOICE_MEMO']})
    R.check('[%s] 前置：電影那三則排進手機（mv745_m2909a_heroine_04_0～2）、還沒有語音十則' % P.tag, len([x for x in w0['q'] if x['tag'].startswith('mv745_')]) == 3 and not any(x['tag'].startswith('zqvoice_') for x in w0['q']),
            J(w0['q']))
    f3 = L_.get('first3') or {}
    R.check('[%s] 前置：第三天那則的回覆選項有「%s」' % (P.tag, ZQ_THIRD), ZQ_THIRD in (f3.get('choice') or []), J(f3.get('choice')))
    await close_phone(pg, cdp)
    await pg.evaluate(RESET_JS)
    th = 'p:' + ZQ; rep_t = rep[vr]['t'] if vr < len(rep) else None
    P.want_th = th; P.answer_others = True
    P.phone_ask = lambda t, o: (next((i for i, x in enumerate(o) if x in (ZQ_THIRD, rep_t)), None) if t == th else None)
    P.pick = lambda o, h, sb: None
    P.path.append('站著不動：畢業後篇自己跳到每一則訊息、手機自己打開列表 → 點子晴那一段看 → 第三天那則照字回「%s」' % ZQ_THIRD)
    # 第一段：第三天那則回了 → 十則排好
    w1, s1, ok1 = await drive(pg, cdp, P, lambda w, s: w['flags'].get('ZQ_VOICE_Q') is not None and not s['phone'], 900,
                              {'rx': '^mv745_m2909a_heroine_04_|^zqvoice_', 'fl': ['ZQ_VOICE_D0', 'ZQ_VOICE_Q', 'ZQ_VOICE_MEMO']}, '電影那三則、回第三天那則')
    w1 = w1 or {'flags': {}, 'msgs': [], 'q': []}
    m0 = next((m for m in w1['msgs'] if m['tag'] == 'mv745_m2909a_heroine_04_0'), None)
    D0 = (w1['flags'] or {}).get('ZQ_VOICE_D0')
    R.check('[%s] D0＝「第一天」那則送到的那一天（ZQ_VOICE_D0 記了）' % P.tag, bool(m0) and D0 == m0['day'], J({'D0': D0, 'm0': m0}))
    a3 = next((a for a in P.answered if a[0] == th and a[1] == ZQ_THIRD), None)
    R.check('[%s] 照玩家在手機回了第三天那則「%s」' % (P.tag, ZQ_THIRD), bool(a3), J(P.answered))
    R.check('[%s] 回了以後：ZQ_VOICE_MEMO、ZQ_VOICE_Q＝D0' % P.tag, (w1['flags'] or {}).get('ZQ_VOICE_MEMO') is not None and (w1['flags'] or {}).get('ZQ_VOICE_Q') == D0 and D0 is not None, J(w1['flags']))
    Q = sorted([x for x in w1['q'] if x['tag'].startswith('zqvoice_')] + [dict(m, n=1) for m in w1['msgs'] if (m['tag'] or '').startswith('zqvoice_')], key=lambda x: x['day'] * 24 + x['h'])
    R.check('[%s] 一次排好十則（tag zqvoice_1～10、照順序）' % P.tag, [x['tag'] for x in Q] == ['zqvoice_%d' % (i + 1) for i in range(10)], J([x['tag'] for x in Q]))
    if D0 is not None and len(Q) == 10:
        R.check('[%s] 十則的日子＝D0＋N−1（不數了＝D0＋36）：%s' % (P.tag, J(OFF)), [x['day'] - D0 for x in Q] == OFF, J([x['day'] - D0 for x in Q]))
        R.check('[%s] 時間都在 22:00～23:40' % P.tag, all(22 - 0.006 <= x['h'] <= 23 + 40 / 60 + 0.006 for x in Q), J([x['h'] for x in Q]))
    if not ok1:
        R.check('[%s] 第一段（回第三天那則）有走完' % P.tag, False, '前一步沒成功，後面的十則跳過'); return
    # 第二段：十則照時間送到、第九則照字回
    P.path.append('之後站著不動：十則照時間送到（手機自己打開列表 → 點子晴那一段看）→ 第九則照字回「%s」' % rep_t)
    rep_say = rep[vr].get('say') if vr < len(rep) else []

    def done2(w, s):
        got = [m for m in w['msgs'] if (m['tag'] or '').startswith('zqvoice_')]
        m9 = next((m for m in got if m['tag'] == 'zqvoice_9'), None)
        return len(got) == 10 and bool(m9) and m9['ans'] is not None and not s['phone'] and not s['dlg'] and not s['nb']
    w2, s2, ok2 = await drive(pg, cdp, P, done2, 2400, {'rx': '^zqvoice_', 'ths': [th], 'fl': ['ZQ_VOICE_D0', 'ZQ_VOICE_Q']}, '語音十則')
    w2 = w2 or {'msgs': []}
    await pg.wait_for_timeout(2500)
    thr = await pg.evaluate(THREAD_JS, th)
    got = sorted([m for m in thr if (m['tag'] or '').startswith('zqvoice_')], key=lambda m: m['day'] * 24 + m['h'])
    R.check('[%s] 十則都送到（%d）、字照資料、照順序' % (P.tag, len(got)), [m['text'] for m in got] == msgs, J([[m['tag'], m['text'][:12]] for m in got]))
    if D0 is not None and got:
        R.check('[%s] 送到的日子＝D0＋N−1（%s）、22:00～23:40' % (P.tag, J(OFF)), [m['day'] - D0 for m in got] == OFF and all(22 - 0.006 <= m['h'] <= 23 + 40 / 60 + 0.006 for m in got), J([[m['day'] - D0, m['h']] for m in got]))
        R.check('[%s] 私訊（p:%s、她傳的）' % (P.tag, ZQ), all(m['from'] == ZQ for m in got), J([m['from'] for m in got]))
    asks = [m for m in got if m.get('ask')]
    R.check('[%s] 只有第九則可以回（ask zqvoice_9）、兩個選項照資料' % P.tag, [m['tag'] for m in asks] == ['zqvoice_9'] and asks[0]['ask']['opts'] == [o.get('t') for o in rep], J([[m['tag'], m.get('ask')] for m in asks]))
    a9 = next((a for a in P.answered if a[0] == th and a[1] == rep_t), None)
    R.check('[%s] 照玩家在手機回第九則「%s」' % (P.tag, rep_t), bool(a9), J(P.answered))
    k9 = next((i for i, m in enumerate(thr) if m['tag'] == 'zqvoice_9'), None)
    after = thr[k9 + 1:] if k9 is not None else []
    mine = [m['text'] for m in after if m['from'] in ('player', PNAME, '')]
    hers = [m['text'] for m in after if m['from'] == ZQ and not (m['tag'] or '').startswith('zqvoice_')]
    R.check('[%s] 第九則回了：貼出「%s」、她回 %s（照資料）' % (P.tag, rep_t, J(rep_say)), rep_t in mine and hers[:len(rep_say)] == rep_say, J({'我': mine[:3], '她': hers[:4], 'after': [[m['from'], m['text'][:20]] for m in after[:6]]}))
    pend = await pg.evaluate(PEND_JS, th)
    R.check('[%s] 回完以後子晴那一段沒有待回覆（其他九則本來就不能回）' % P.tag, not pend, J(pend))
    # 畫面：子晴那一段看得到每一則（手機自己打開時看過的＋最後探針照玩家打開一次）
    ok, body = await open_thread(pg, cdp, th); P.phone_texts.append([th, body]); await R.shot(pg, '%s_thread' % P.tag)
    seen = '\n'.join(b for t, b in P.phone_texts if t == th)
    miss = [t for t in msgs if t not in seen]
    R.check('[%s] 手機畫面上子晴那一段看得到十則（「播放」＝看得到那一則：語音寫成字，沒有播放鍵）' % P.tag, ok and not miss, J({'沒看到': miss}))
    au = await pg.evaluate("(()=>document.querySelectorAll('#phoneBody audio,#phoneBody [data-play]').length)()")
    R.note('[%s] 對照：子晴那一段的 audio／播放鍵數量＝%s（程式：語音寫成字；規格寫「播放」，遊戲沒有播放鍵）' % (P.tag, au))
    await close_phone(pg, cdp)


async def voice_old(pg, cdp, P, msgs, OFF):
    dk = await dks(pg, ['2029-09-20'])
    d = dk['2029-09-20']['d']; D0 = d - 3
    first = await pg.evaluate("(()=>{ try{ return MOVIES.withOf('m2909a','heroine_04').lines[0]; }catch(e){ return null; } })()")
    msgs0 = [{'day': D0, 'h': 22, 'th': 'p:' + ZQ, 'from': ZQ, 'text': first, 'tag': 'mv745_m2909a_heroine_04_0'}]
    await zq_load(pg, P, '2029-09-20', 15.0, extra_flags={'ZQ_VOICE_MEMO': D0 + 2}, movie=False, msgs=msgs0, phone=False,
                  why='舊存檔：「第一天」那則 D0＝%d（9/17）、ZQ_VOICE_MEMO＝D0＋2、沒有 ZQ_VOICE_D0／ZQ_VOICE_Q（AA_811 以前的存檔）' % D0)
    P.path.append('讀檔以後不動：手機規則（STORY.PHONE_RULES）補排')
    P.pick = lambda o, h, sb: None
    w, s, ok = await drive(pg, cdp, P, lambda w, s: w['flags'].get('ZQ_VOICE_Q') is not None, 120, {'rx': '^zqvoice_', 'fl': ['ZQ_VOICE_D0', 'ZQ_VOICE_Q', 'ZQ_VOICE_MEMO']}, '舊存檔補排')
    w = w or {'flags': {}, 'q': [], 'msgs': []}
    Q = sorted(w['q'] + w['msgs'], key=lambda x: x['day'] * 24 + x['h'])
    R.check('[%s] 舊存檔：補排十則、ZQ_VOICE_Q＝D0（第一天那則的日子）' % P.tag, w['flags'].get('ZQ_VOICE_Q') == D0 and [x['tag'] for x in Q] == ['zqvoice_%d' % (i + 1) for i in range(10)], J({'flags': w['flags'], 'tags': [x['tag'] for x in Q]}))
    if len(Q) == 10:
        R.check('[%s] 舊存檔：日子＝D0＋N−1（都在之後）' % P.tag, [x['day'] - D0 for x in Q] == OFF, J([x['day'] - D0 for x in Q]))
    snap = await pg.evaluate(SNAP_JS)
    await pg.evaluate(LOAD_JS, {'st': snap, 'phone': True}); await pg.wait_for_timeout(2500); await pg.evaluate(HOOK_JS)
    w2 = await pg.evaluate(WATCH_JS, {'rx': '^zqvoice_'})
    R.check('[%s] 存檔來回讀一次：不重排（還是十則）' % P.tag, len(w2['q']) + len(w2['msgs']) == 10, J([x['tag'] for x in w2['q'] + w2['msgs']]))
    await close_phone(pg, cdp)


PART_FN = {'HEHUAN_A': lambda pg, cdp: part_hh(pg, cdp, 'friend'), 'HEHUAN_B': lambda pg, cdp: part_hh(pg, cdp, 'dating'), 'HEHUAN_NEG': part_neg, 'VOICE': part_voice}
ERRS = []


async def main():
    real = os.popen('git -C "%s" rev-parse HEAD 2>/dev/null' % os.path.abspath(os.path.join(LWT, '..'))).read().strip()
    log('CC AA_811（合歡山北峰、子晴語音）：worktree %s；SHA（env）%s；PARTS %s；Playwright（844×390 觸控）≠ iPhone' % (real or '?', SHA or '?', ','.join(PARTS)))
    if SHA and real and real != SHA: R.note('注意：worktree HEAD %s ≠ 環境變數 SHA %s' % (real, SHA))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        global ERRS
        ERRS = errs
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(R.finish())
        await pg.evaluate(HOOK_JS)
        for part in PARTS:
            fn = PART_FN.get(part)
            if not fn: R.check('PARTS 有「%s」' % part, False, J(ALL_PARTS)); continue
            log('==== %s ====' % part); t0 = time.time()
            try:
                await fn(pg, cdp)
            except Exception as e:
                await R.shot(pg, '%s_exc' % part)
                R.check('[%s] 沒有中斷' % part, False, repr(e)[:400])
            log('==== %s 結束（%.0f 秒）====' % (part, time.time() - t0))
        await b.close()
    sys.exit(R.finish())

if __name__ == '__main__':
    asyncio.run(main())
