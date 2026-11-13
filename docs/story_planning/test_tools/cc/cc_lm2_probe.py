"""CC（帳號 A）11-11：LM2 禮貌生財上師對話（X332 LIMAO-SHOP-1110；BB 00:21；開發分支 e8918a013＝新、11161c101＝舊：只有店面、沒有對話，預期 FAIL）。
Windows＋GPU（PC runner）≠ iPhone；雲端 SwiftShader 只做探針自檢，結果不算判定。判定 BB 下，探針只 R.check／R.note 照實記；有法律名詞的句子不判，逐句記。
對照的程式（e8918a013）：src/limao3d.js（LM：算命桌 S.attachStreet 第 159 行、S.table 第 125 行、抽組 S.pick 第 118 行、serious 第 117／134 行、教授偶遇 S.profDue 第 91 行、
  身分揭曉 S.revealOpen／hintDue／askDue 第 92～94 行、入口 A 事件 S.eventA 第 165 行、入口 B S.studyDoor 第 141 行、書房 S.decorate 第 146 行、說話的人 S.who 第 106 行、ADV 模糊背景 S.begin 第 111 行）、
  src/data/limao.js（AA_750 @227db1c9e 匯入）、src/data/tingzhou_layout.js limao（table.at (28.3,3.3) r1.0、door (27.4,4.75) r0.9、19:00～23:30）、
  src/data/tz_shops_layout.js limao（室內：書房的門 (1.0,−0.65)、study.points、partition z −1.2；離開 (0.9,4.6)）、src/tz_shops3d.js（setStudy、STUDY_* 節點）。
稿：DRAFT_DIR（預設 fixtures/lm2）/AA_750_limao.json＝企劃線 804f55bb3（BB 01:02：遊戲 93f731790 起已重匯、內容一樣；受測 f8ff49f43 以後）。舊的 227db1c9e 另存 AA_750_limao_227db1c9e.json。
共用：每一次互動前後印 錢／各科成績（G.courses.grades）／每個人的關係（G.rel、G.social.rel）／戀愛（G.flags.romance）／全部旗標的差異；說的每一句由 GAME.say 的包裝記（說話的人、畫面上的名字、字、ADV 模式），
  「探針包了 GAME.say／choose／caption 只為了記錄，不改內容」。時間判斷一律用「按下去那一刻的 G.hour」（PC 上遊戲鐘約 0.45 分／秒，一直在走）。
【前置／捷徑】（log 都印 [前置／捷徑]）：讀檔到汀州路巷 A 某日某時（L.load_state＝遊戲自己的 applySave；flags 用 GAME.defaults() 的再加減）；跳日、跳回 19:30（保留當時整個 G）；
  有／沒有交往對象（dating_kexin true／false）、朋友以上的女生（SOCIAL.rel('heroine_01') fam 50／trust 30；沒有＝女生 fam 降到 15）、分手（ROM.end(G,'kexin')）、落榜（GRAD_EXAM_RESULT='fail'）、
  LM_MET／LM_PROF 預先寫進 flags（REVEAL、SERIOUS 用）。走路、按算命桌、選選項、點對話都是 CDP 觸控（L.go_to／L.tap）。
PARTS：
  FIRST   大一上 19:30：走到算命桌 → 按 → 初次見面逐句對稿（first）、名字、從第一句到結束多久（探針點的速度）；LM_MET＝那一天；再按 → 五項選單（對稿 menu）→ 離開＝不說話、時間沒跳 15 分鐘。
  MENU    認識過的大一上：四類各選一次（句子屬於那一類）、每次結束能動（busy、ADV 收掉、按鈕回來）、選單每次都是五項。
  POOL    POOLSET（預設 C,B,A）：C＝沒交往、沒有朋友以上的女生：四類各問四次；B＝沒交往、有朋友以上的女生：問感情四次；A＝交往中：問感情四次。每次逐句對稿、認出是哪一組、
          是不是在「稿的 when × 當時狀態」可以出的組裡、同一類不連續同一組。超過 23:00 就【捷徑】跳回 19:30（保留 G；LM 的抽組紀錄在記憶體，不受影響）。
  FLAGS   day46 使用者存檔（OLDSAVE，有成績、關係、交往）【捷徑】搬到汀州路 19:30：先量「不互動、等 20 秒」的差（雜訊底線），再 初次見面＋四類各一次，每次前後全差異；
          其他都不能動（R.check）；整段多出的 LM_ 旗標只能是稿的四個（R.check；limao3d.js 第 21 行寫明會多記 LM_HINT、LM_SER——要 BB 判）。
  PROF    ①大一上、前一天認識：按 → 選單（不演）②大一下當天第一次認識：初次見面 → 再按＝選單（認識那天不演）③【捷徑】隔天 20:00：按 → prof 逐句對稿、吳教授的名字＝人物資料（prof_wu）、
          立繪、有沒有 3D 人物；LM_PROF ④再按＝選單（只演一次）。
  REVEAL  ①大一下（還不能揭曉）進店：店裡三個看的點、書房的門逐句記（不能先洩漏：記有沒有「刑法」「吳」）；SNAP 從前半往書房各角度＋屋頂俯視、遊戲鏡頭 8 個方向；STUDY_* 節點顯示狀態；
          點書房地板、搖桿往裡推＝進不去。②大四（LM_MET、LM_PROF）進店按書房的門＝入口 B 兩句（對稿 entryB）、LM_HINT；再按＝門上的字 → 出店 → 算命桌選單六項、最上面＝稿 talk 第一句 →
          選它＝talk 從第二句逐句對稿、LM_KNOWN＋LM_STUDY → 再進店：書房開著、走進去、四個看的點逐句對稿（study_room.look）、走出書房、出店、推得動。
  REVEALA 大四（LM_MET、LM_PROF）條件事件開著：校園萬才館門口 → 真的走進萬才館（法律系館）→ 入口 A 事件逐句對稿（entryA；有沒有標題卡）、LM_HINT；【捷徑】回汀州路 20:00 → 選單六項 → 選揭曉那一句（talk）。
  HOURS   18:45 讀檔站到桌前：每 0.5 秒記按鈕，記「算命桌」出現那一刻的 G.hour；19:00 以前按＝沒有選單；23:20 讀檔：先按一次（選單）、等它消失記 G.hour、之後按＝沒有選單；02:00 按＝沒有選單。
          收攤的三次（19:00 前、23:30 後、凌晨）：按鈕要是「看算命桌」、按下去念稿 closed「收攤」那一句（逐字、旁白沒有名字）（BB 01:02；f8ff49f43 起）。「店開著、他不在」照舊不測。
  UI      ①橫向 844×390：初次見面每句截圖＋DOM（名字、字有沒有被擋、有沒有被切、ADV 模式）②直向 390×844：再一類的句子同樣截圖 ③算命桌按鈕 → 店門之間每 0.3 m：按鈕寫什麼、按下去是哪一個
          ④上師沒有 3D 人物：上師座位附近的 NPC、LM.masterNpc、拍桌子（SNAP＋遊戲畫面）。
  SERIOUS ①交往中 →【捷徑】ROM.end 分手：選「聊聊天」→ 應該先演 lv4；之後問感情兩次、聊天一次（不能再出 lv4）②大四下【捷徑】研究所落榜：選「問學業與考試」→ 應該先演 lf5；之後兩次。逐句記。
  SAVE    ①線上版（LIVE，預設 GitHub Pages；標題要是 v9.10.24）讀 day46 存檔放到公館往汀州路的巷口 19:20，用線上版自己的 GAME.snapshot() 做一份「v9.10.24 的存檔」→ 回測試版讀它（條件事件開著）
          → 真的走公館 → 汀州路 → 算命桌 → 初次見面、沒有 JS 例外。（線上連不到＝改用 day46 原檔，照實寫）②剛演完讀 fatiao3d_auto 有沒有 LM_MET；進店再出來（換區域）再讀一次；
          重新整理 → 標題「繼續（自動存檔）」→ LM_MET 還在、算命桌是選單不是初次見面。
  SAVEDAY day46 原檔（沒有 LM_*、條件事件開著）：宿舍 22:00 睡到隔天早上（真的走到床、按「睡覺」）→ 這一天沒有上師的句子、沒有 LM_ 旗標；汀州路 20:30 從算命桌前走過去不按＝不會自己演；
          大四沒認識上師的人走進萬才館＝不出入口 A。
  ENTRYCLASS 入口 A（走進法律系館B＝萬才館的一次性事件）撞到上課（BB 01:02，只記不判）：找大四上、教室在法律系館B（room.zone／via＝wancai）有課的那一天；
          【前置】條件事件開著、LM_MET＋LM_PROF，站在萬才館一樓入口前，時間＝上課前 ENTRYMIN 分鐘（預設 5）→ 照玩家走進去 → 有沒有被拉進入口 A、演多久（遊戲時間、實際秒數）、
          演完那一刻那堂課的狀態（CLS.status、遲到幾分鐘、isLate／isLateAbsent）→ 照玩家走去那間教室按下去 → 記 G.courses 的 done／late／abs；
          對照：同一天沒有課的時間（第一堂課前 3 小時以上或最後一堂下課後）再讀一次、走進去，記同樣的東西。
  GRAD    畢業後的存檔（fixtures/heavy_save_m5.json：CC 11-02 匯出的 m5 重度玩家存檔，2029-06-30，有 GRADUATED、FAIL_DELAY…；GRADSAVE 可換）【捷徑】搬到汀州路 20:00：
          記學年（STORY.termAt）、畢業／延畢／落榜相關旗標；按算命桌（有初次見面就先演完）→ 問「人生方向」四次，記抽到哪幾組（「大四」那組 lf3 有沒有出，只記）。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=FIRST,… [POOLSET=C|B,A] [DRAFT_DIR=fixtures/lm2] [OLDSAVE=…] [LIVE=<線上網址>] python3 cc_lm2_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64, math, re
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = (os.environ.get('PARTS') or 'FIRST,MENU,POOL,FLAGS,PROF,REVEAL,HOURS,UI,SERIOUS,SAVE').split(',')
POOLSET = (os.environ.get('POOLSET') or 'C,B,A').split(',')
SHA = (os.environ.get('SHA') or '')[:9]
DRAFT_DIR = os.path.join(HERE, os.environ.get('DRAFT_DIR') or os.path.join('fixtures', 'lm2'))
GRADSAVE = os.environ.get('GRADSAVE') or os.path.join(HERE, 'fixtures', 'heavy_save_m5.json')
ENTRYMIN = float(os.environ.get('ENTRYMIN') or 5)
OLDSAVE = os.environ.get('OLDSAVE') or os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
LIVE = os.environ.get('LIVE') or 'https://pyhuanglaw.github.io/Lawstudent/'
R = L.Run('lm2', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DR = json.load(open(os.path.join(DRAFT_DIR, 'AA_750_limao.json'), encoding='utf-8'))
FOUR = ('LM_MET', 'LM_PROF', 'LM_KNOWN', 'LM_STUDY')
CATS = [('chat', '聊聊天'), ('study', '問學業與考試'), ('love', '問感情'), ('life', '問人生方向')]
TABLE0 = {'x': 28.3, 'z': 3.3, 'r': 1.0}; DOOR0 = {'x': 27.4, 'z': 4.75, 'r': 0.9}   # 配置讀不到時（舊版也有這兩個）
LANE = (27.0, -0.5)   # 巷 A，禮貌生財前面（讀檔站的地方）

# ---------- 稿 ----------
SPK = ('yt', 'ms', 'wu', 'narr')


def dl(lines):
    out = []
    for l in lines:
        k = next(k for k in l if k in SPK); out.append((k, l[k]))
    return out


SEC = {'first': dl(DR['first']['lines']), 'prof': dl(DR['prof']['lines']), 'entryA': dl(DR['reveal']['entryA']['lines']), 'entryB': dl(DR['reveal']['entryB']['lines']), 'talk': dl(DR['reveal']['talk']['lines'])}
POOLG = {}
for _k, _gs in DR['pool'].items():
    if not isinstance(_gs, list): continue   # pool.seriousNote 是說明字串
    for _g in _gs: POOLG[_g['id']] = {'cat': _k, 'when': _g.get('when'), 'serious': bool(_g.get('serious')), 'lines': dl(_g['lines'])}
LOOKS = {q['at']: q['narr'] for q in DR['study_room']['look']}
MENU = list(DR['menu'])
TALK0 = SEC['talk'][0][1]

# ---------- 遊戲裡讀的東西 ----------
HOOK = r"""(()=>{ if(window.__lmHook===GAME) return 'already'; window.__lmHook=GAME; window.__LMLOG=window.__LMLOG||[]; const G=GAME, s0=G.say, c0=G.choose, k0=G.caption;
  const advst=()=>{ try{ if(typeof ADV==='undefined'||!ADV.root) return null; const sl=id=>{ const e=document.getElementById(id); if(!e) return null; const im=e.querySelector('img'); return {show:e.classList.contains('show'), src:im?(im.getAttribute('src')||'').slice(-60):null}; }; return {active:!!ADV.active, mode:ADV.root.className, L:sl('advL'), R:sl('advR')}; }catch(e){ return null; } };
  G.say=function(who,text,opts){ const p=s0.apply(this,arguments); try{ const n=document.getElementById('dlgName'); window.__LMLOG.push({k:'say', t:+performance.now().toFixed(0), gh:+(+G.G.hour).toFixed(3), who:who?(who.name||String(who)):null, cid:(who&&who.charId)||null, obj:!!(who&&who.obj),
      text:String(text), full:(G.D&&G.D.full)||null, shown:n?(n.style.display==='none'?'':(n.textContent||'')):null, me:!!(opts&&opts.me), adv:advst()}); }catch(e){} return p; };
  G.choose=function(opts){ try{ window.__LMLOG.push({k:'choose', t:+performance.now().toFixed(0), gh:+(+G.G.hour).toFixed(3), opts:(opts||[]).map(o=>o&&o.t)}); }catch(e){} return c0.apply(this,arguments); };
  G.caption=function(who,text,ms){ try{ window.__LMLOG.push({k:'cap', t:+performance.now().toFixed(0), gh:+(+G.G.hour).toFixed(3), who:who||'', text:String(text)}); }catch(e){} return k0.apply(this,arguments); };
  return 'installed'; })()"""
LOGN = "((window.__LMLOG||[]).length)"
LOGS = "(n=>(window.__LMLOG||[]).slice(n))"
ADVST = r"""(()=>{ if(typeof ADV==='undefined'||!ADV.root) return null; const sl=id=>{ const e=document.getElementById(id); if(!e) return null; const im=e.querySelector('img'); return {show:e.classList.contains('show'), src:im?(im.getAttribute('src')||'').slice(-60):null}; }; return {active:!!ADV.active, mode:ADV.root.className, L:sl('advL'), R:sl('advR')}; })()"""
DRV = r"""(()=>{ const D=GAME.D||{}, E=GAME.E, ch=document.getElementById('choices'), it=document.getElementById('interact'), fd=document.getElementById('fade');
  const txt=b=>((b.firstChild&&b.firstChild.nodeType===3)?b.firstChild.textContent:(b.textContent||'')).trim();
  const choices=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(txt):[];
  return {dlg:!!D.active, typing:!!D.typing, choices, busy:!!E.player.busy, depth:GAME.sceneDepth?GAME.sceneDepth():null, adv:typeof ADV!=='undefined'&&!!ADV.active, zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3),
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,24):'', fade:!!(fd&&fd.classList.contains('on')),
    paused:!!E.paused, phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())}; })()"""
SNAPG = r"""(()=>{ const G=GAME.G, c=o=>o==null?null:JSON.parse(JSON.stringify(o)); const F=c(G.flags)||{}; const rom=F.romance||null; delete F.romance;
  return {day:G.day, hour:+(+G.hour).toFixed(3), money:G.money, grades:c(G.courses&&G.courses.grades), rel:c(G.rel), social:c(G.social&&G.social.rel), romance:rom, flags:F}; })()"""
FACTS = r"""(()=>{ const G=GAME.G, F=G.flags||{}; let term=null; try{ term=STORY.termAt?STORY.termAt(G.day):null; }catch(e){}
  const partners=Object.keys(F).filter(k=>/^dating_/.test(k)&&F[k]===true).map(k=>k.slice(7));
  const girls=[]; try{ const i0=SOCIAL.STAGES.indexOf('FRIEND'); for(const id in ((G.social&&G.social.rel)||{})){ const c=CHARACTERS[id]; if(!c||c.gender!=='f') continue; const st=SOCIAL.stage(id); if(SOCIAL.STAGES.indexOf(st)>=i0) girls.push(id+':'+st); } }catch(e){}
  const lm=typeof LM!=='undefined'?LM:null, f=(n)=>{ try{ return lm&&lm[n]?!!lm[n](G):null; }catch(e){ return 'ERR'; } };
  const lmf={}; for(const k in F) if(/^LM_/.test(k)) lmf[k]=F[k];
  let dk=null; try{ dk=CALENDAR.dateOf(G.day).key; }catch(e){}
  return {day:G.day, date:dk, hour:+(+G.hour).toFixed(3), stage:G.stage, term, weather:G.weather, partners, girls, lm:lmf, finalsNext:f('finalsNext'), failedLast:f('failedLast'), flunked:f('flunked'), brokeRecent:f('brokeRecent'),
    lmLoaded:!!lm, typhoon:f('typhoon')}; })()"""
LAYJS = "(()=>{ const T=typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT:null, S=typeof TZ_SHOPS_LAYOUT!=='undefined'?TZ_SHOPS_LAYOUT:null; return {street:T&&T.limao||null, room:S&&S.limao||null}; })()"
DAYS = r"""(spec=>{ const out={}; for(const [k,re,wk] of spec){ for(let d=-420; d<2600; d++){ let t=null, id=null; try{ t=CALENDAR.termOf(d); id=(typeof STORY!=='undefined'&&STORY.termAt)?STORY.termAt(d):(t&&t.id); }catch(e){}
    if(!id||!new RegExp(re).test(id)||!t||t.week!==wk) continue; try{ if(CALENDAR.typhoon&&CALENDAR.typhoon(d)) continue; if(CALENDAR.typhoon&&CALENDAR.typhoon(d+1)) continue; }catch(e){}
    let dk=null; try{ dk=CALENDAR.dateOf(d).key; }catch(e){} out[k]={day:d, id, week:t.week, date:dk}; break; } } return out; })"""
ITS = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.2,to:i.exit?i.exit.to:null,look:i.look||null,tzd:i.tzsDoor||(i.tzLimaoDoor?'limao':null),tzp:i.tzPoint||null,lm:!!i.lmTable,lmAdded:!!i.lmAdded,lv:i.lv|0})))()"
ME = "(()=>{ const E=GAME.E, P=E.player, p=P.obj.position; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3), x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv:P.lv|0, stand:E.canStand?!!E.canStand(p.x,p.z,0.3,P.lv|0):null, busy:!!P.busy, fb:GAME.walkFallbacks|0}; })()"
STANDNEAR = r"""(e=>{ const E=GAME.E; let best=null; for(let r=0; r<=e.r+1e-6; r+=0.05) for(let a=0; a<360; a+=10){ const x=e.x+r*Math.sin(a*Math.PI/180), z=e.z+r*Math.cos(a*Math.PI/180); if(!E.canStand(x,z,0.3,0)) continue; return {x:+x.toFixed(2), z:+z.toFixed(2), d:+r.toFixed(2)}; } return best; })"""
WDOORS = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden&&i.exit&&i.exit.to==='wancai'&&(i.lv|0)===0).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1,lv:0,to:'wancai'})))()"
WFRONT = r"""(d=>{ const E=GAME.E, R=Math.PI/180; for(const r of [2.5,3,2,3.5,4,5]) for(let a=0;a<360;a+=15){ const x=d.x+r*Math.sin(a*R), z=d.z+r*Math.cos(a*R); if(!E.canStand(x,z,0.3,0)) continue;
    let ok=true; for(let t=0.6;t<r;t+=0.2){ if(!E.canStand(d.x+t*Math.sin(a*R),d.z+t*Math.cos(a*R),0.3,0)){ ok=false; break; } } if(ok) return {x:+x.toFixed(2), z:+z.toFixed(2), r, a}; } return null; })"""
STUDYVIS = r"""(()=>{ const z=GAME.E.zone||{}; const N={lid:[],door:[],study:[]}; GAME.E.scene.traverse(o=>{ const n=o.name||''; if(n.indexOf('STUDY_')!==0) return; const k=n.indexOf('STUDY_LID')===0?'lid':(n.indexOf('STUDY_DOOR')===0?'door':'study'); N[k].push(!!o.visible); });
  const cnt=a=>({n:a.length, vis:a.filter(Boolean).length}); return {zone:GAME.G.zone, studyOpen:!!z.studyOpen, formal:!!z.formal, lid:cnt(N.lid), door:cnt(N.door), study:cnt(N.study)}; })()"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||50, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const z=E.zone, P=E.player&&E.player.obj; if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  const vis=P?P.visible:null; if(P) P.visible=false;
  try{ r.render(E.scene,cam); const k=document.createElement('canvas'); k.width=a.tw; k.height=Math.round(a.tw*c.height/c.width); const g=k.getContext('2d'); g.drawImage(c,0,0,k.width,k.height);
    g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(0,0,k.width,20); g.fillStyle='#fff'; g.font='14px sans-serif'; g.fillText(a.label,5,15); return k.toDataURL('image/jpeg',0.86); }
  finally { if(P) P.visible=vis; if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } } })"""
DLGBOX = r"""(()=>{ const box=document.getElementById('dlg'), t=document.getElementById('dlgText'), n=document.getElementById('dlgName'); if(!box||box.classList.contains('hide')) return null;
  const rb=box.getBoundingClientRect(), rt=t.getBoundingClientRect(); const pts=[[0.5,0.5],[0.08,0.3],[0.92,0.3],[0.08,0.8],[0.92,0.8]].map(([fx,fy])=>{ const x=rt.left+rt.width*fx, y=rt.top+Math.min(rt.height,40)*fy; const e=document.elementFromPoint(x,y); return {x:Math.round(x), y:Math.round(y), hit:e?(e.id||e.className||e.tagName):null, inside:!!e&&(e===box||box.contains(e))}; });
  return {box:[Math.round(rb.left),Math.round(rb.top),Math.round(rb.width),Math.round(rb.height)], vw:innerWidth, vh:innerHeight, inView:rb.left>=-1&&rb.top>=-1&&rb.right<=innerWidth+1&&rb.bottom<=innerHeight+1,
    clipped:t.scrollHeight>t.clientHeight+2||t.scrollWidth>t.clientWidth+2, name:n?(n.style.display==='none'?'':(n.textContent||'')):null, text:(t.textContent||''), pts, body:document.body.className}; })()"""
NPCNEAR = r"""(p=>(GAME.E.npcs||[]).filter(n=>n&&n.obj).map(n=>({id:n.charId||n.id||null, name:n.name||null, x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), d:+Math.hypot(n.obj.position.x-p.x,n.obj.position.z-p.z).toFixed(2), vis:!!n.obj.visible, extra:!!n.isExtra})).filter(q=>q.d<p.r).sort((a,b)=>a.d-b.d))"""


def save_img(u, fn):
    if u: open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


def hhmm(h):
    h = h % 24; return '%02d:%02d' % (int(h), int(round((h % 1) * 60)) % 60)


# ---------- 讀檔、狀態 ----------
DEFFLAGS = None
DAYS_FOUND = {}
QUIET_USED = [False]   # 前面讀檔關過條件事件（playlib 會把 EVENTS.onEnter／tick 換掉，同一頁回不來）
WSPOT = {}             # 萬才館一樓入口（從遊戲讀）和門前站得住的點


async def hook(pg):
    return await pg.evaluate(HOOK)


async def ld(pg, cdp, st, why, quiet=True, wait=6000):
    """【前置／捷徑】讀檔（遊戲自己的 applySave）。quiet＝關條件事件；不 quiet 也關「訊息自動打開手機」"""
    if quiet: QUIET_USED[0] = True
    elif QUIET_USED[0]:   # 這一段要條件事件：重新載入頁面（前面的讀檔把條件事件關掉了）
        R.note('（前面關過條件事件，重新載入頁面再讀檔）'); await pg.goto(URL); await L.wait_loaded(pg); await hook(pg); QUIET_USED[0] = False
    R.setup('%s（%s）' % (why, '條件事件關著' if quiet else '條件事件開著、只關手機自動打開'))
    try:
        await L.load_state(pg, st, quiet_events=quiet, quiet_phone=not quiet)
    except TypeError:
        await L.load_state(pg, st, quiet_events=quiet)
    await pg.wait_for_timeout(wait); await L.close_panels(pg, cdp); await hook(pg)
    return await pg.evaluate(ME)


async def mk(pg, day, hour, zone='tingzhou', x=None, z=None, flags=None, drop=(), extra=None):
    global DEFFLAGS
    if DEFFLAGS is None: DEFFLAGS = await pg.evaluate("JSON.parse(JSON.stringify(GAME.defaults('祐廷').flags))")
    F = dict(DEFFLAGS); F.update(flags or {})
    for k in drop: F.pop(k, None)
    st = {'stage': 'law', 'zone': zone, 'day': day, 'hour': hour, 'weather': 'clear', 'flags': F}
    if x is not None: st['pos'] = {'x': x, 'z': z, 'yaw': 0.0, 'lv': 0}
    if extra: st.update(extra)
    return st


async def rewind(pg, cdp, hour, why, day=None, zone='tingzhou', pos=LANE, quiet=True):
    """【前置／捷徑】保留當時整個 G，只改時間（日期）、位置"""
    st = await pg.evaluate("JSON.parse(JSON.stringify(GAME.snapshot?GAME.snapshot():GAME.G))")
    st['hour'] = hour; st['zone'] = zone; st['pos'] = {'x': pos[0], 'z': pos[1], 'yaw': 0.0, 'lv': 0}
    if day is not None: st['day'] = day
    return await ld(pg, cdp, st, '%s：保留整個 G，改成第 %s 天 %s、%s (%.1f,%.1f)' % (why, st['day'], hhmm(hour), zone, pos[0], pos[1]), quiet=quiet)


async def days(pg):
    global DAYS_FOUND
    if not DAYS_FOUND:
        DAYS_FOUND = await pg.evaluate(DAYS, [['Y1S1', '^Y1S1', 6], ['Y1S2', '^Y1S2', 5], ['Y2S1', '^Y2S1', 6], ['Y4S1', '^Y4S1', 5], ['Y4S2', '^Y4S2', 6]])
        R.note('[DAYS] 用的日子（不是颱風假、隔天也不是）：%s' % J(DAYS_FOUND))
    return DAYS_FOUND


async def lay(pg):
    y = await pg.evaluate(LAYJS); s = (y or {}).get('street') or {}
    return (s.get('table') or {}).get('at') or TABLE0, s.get('door') or DOOR0, y


async def facts(pg, tag):
    f = await pg.evaluate(FACTS); R.note('%s 狀態：%s' % (tag, J(f))); return f


# ---------- 對話 ----------
def gdiff(a, b):
    out = []
    if a['money'] != b['money']: out.append(('money', a['money'], b['money']))
    for k in ('grades', 'rel', 'romance'):
        if json.dumps(a[k], sort_keys=True) != json.dumps(b[k], sort_keys=True): out.append((k, a[k], b[k]))
    sa, sb = a['social'] or {}, b['social'] or {}
    for cid in sorted(set(sa) | set(sb)):
        ra, rb = sa.get(cid) or {}, sb.get(cid) or {}
        for f in sorted(set(ra) | set(rb)):
            if json.dumps(ra.get(f), sort_keys=True) != json.dumps(rb.get(f), sort_keys=True): out.append(('social.%s.%s' % (cid, f), ra.get(f), rb.get(f)))
    fa, fb = a['flags'], b['flags']
    for k in sorted(set(fa) | set(fb)):
        if json.dumps(fa.get(k), sort_keys=True) != json.dumps(fb.get(k), sort_keys=True): out.append(('flags.' + k, fa.get(k, '（沒有）'), fb.get(k, '（沒有）')))
    return out


LM_SEEN = set()
# CC 11-11 03:0x（LM2_N4 r1）：SERIOUS 第一次按算命桌被吳教授撞見（prof，條件：有 LM_MET、沒有 LM_PROF、大一下以後）先搶走——稿沒寫 prof 和 serious 誰先；
# SERPROF=1：前置加 LM_PROF（已經撞見過），讓第一次就是 serious，驗「不管選哪一類都先演這一組」用聊聊天／問學業與考試
SERP = {'LM_PROF': True} if os.environ.get('SERPROF') == '1' else {}


def judge_diff(tag, df):
    lm = [d for d in df if d[0].startswith('flags.LM_')]
    # CC 11-11 03:0x（LM2_N6 r1）：遊戲通用的「見過／說過話」記帳（social3d.js S.noticed：seen++；S.talkedTo：talked++、fam 不到 5 補到 5）不算關係變動——
    # 合成存檔沒有教授的 rel 紀錄，第一次說話會從 None 建出整筆。只放過 seen、talked 往上加，和 None→新建時的 0／fam 5；其他欄位變了照舊 FAIL
    def _book(d):
        f = d[0].rsplit('.', 1)[-1]
        if d[0].startswith('flags.met_'): return d[1] in (None, 'None', '（沒有）') and d[2] is True   # S.meet 第一次見面記 met_<id>（r2 CC 03:2x）
        if not d[0].startswith('social.'): return False
        if f in ('seen', 'talked'): return (d[1] in (None, 'None') and isinstance(d[2], int)) or (isinstance(d[1], int) and isinstance(d[2], int) and d[2] >= d[1])
        if d[1] in (None, 'None'): return d[2] == 0 or (f == 'fam' and d[2] == 5)
        return False
    book = [d for d in df if _book(d)]
    if book: R.note('%s 通用記帳（見過／說過話，不算關係變動）：%s' % (tag, J([(d[0], d[1], d[2]) for d in book])))
    other = [d for d in df if not d[0].startswith('flags.LM_') and not _book(d)]
    for d in lm: LM_SEEN.add(d[0][6:])
    R.note('%s 前後差異：LM_ %s；其他 %s' % (tag, J(lm), J([(d[0], str(d[1])[:80], str(d[2])[:80]) for d in other]) if other else '沒有'))
    R.check('%s 錢、成績、關係、戀愛、LM_ 以外的旗標都沒動' % tag, not other, J([d[0] for d in other]))


async def drive(pg, cdp, pick=None, max_s=120, on_line=None, since=None):
    """點對話、選選項直到這一段結束（不是對話、沒選項、不 busy、段落深度 0 連 3 次）。pick(opts)->index（None＝最後一個）。回傳 [(畫面上的選項)]"""
    t0 = time.time(); idle = 0; menus = []; seen = since if since is not None else await pg.evaluate(LOGN)
    await pg.wait_for_timeout(400)
    while time.time() - t0 < max_s:
        q = await pg.evaluate(DRV)
        if on_line:
            n = await pg.evaluate(LOGN)
            if n > seen:
                for e in await pg.evaluate(LOGS, seen):
                    if e['k'] == 'say': await on_line(e)
                seen = n
        if q['phone']: await L.phone_away(pg, cdp); continue
        if q['choices']:
            menus.append(q['choices']); k = pick(q['choices']) if pick else None
            if k is None or k < 0 or k >= len(q['choices']): k = len(q['choices']) - 1
            await L.tap(pg, cdp, '#choices button:nth-of-type(%d)' % (k + 1)); await pg.wait_for_timeout(700); idle = 0; continue
        if q['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(380); idle = 0; continue
        if not q['busy'] and not q['fade'] and (q['depth'] in (0, None)):
            idle += 1
            if idle >= 3: break
        else: idle = 0
        await pg.wait_for_timeout(330)
    return menus


def by_text(t):
    return lambda opts: next((i for i, o in enumerate(opts) if o == t or o.startswith(t)), None)


NAMES = {}


async def names(pg):
    if not NAMES:
        n = await pg.evaluate("(()=>{ let wu=null; try{ wu=SOCIAL.displayName?SOCIAL.displayName('prof_wu'):null; }catch(e){} const c=typeof CHARACTERS!=='undefined'&&CHARACTERS.prof_wu||{}; return {yt:(GAME.G&&GAME.G.name)||'祐廷', wu:wu||c.name||null, wuName:c.name||null, wuFull:c.fullname||null}; })()")
        NAMES.update({'yt': n['yt'], 'ms': '上師', 'wu': n['wu'], 'narr': '', 'wuName': n['wuName'], 'wuFull': n['wuFull']})
        R.note('[名字] 對照：祐廷＝%s、上師＝上師（稿：他的名字不出現）、吳教授＝SOCIAL.displayName(prof_wu)「%s」（CHARACTERS.prof_wu.name「%s」）、旁白＝不顯示名字' % (n['yt'], n['wu'], n['wuName']))
    return NAMES


def says(log):
    return [e for e in log if e['k'] == 'say']


def identify(lines):
    t = [e['full'] or e['text'] for e in lines]
    for k, ls in SEC.items():
        if t == [x[1] for x in ls]: return k
        if k == 'talk' and t == [x[1] for x in ls[1:]]: return 'talk(2-)'
    for gid, g in POOLG.items():
        if t == [x[1] for x in g['lines']]: return gid
    return None


def cmp_lines(tag, want, got):
    """逐句並排：稿（說話的人、字）vs 遊戲（畫面上的名字、字）；回傳 [不一樣的句號]"""
    bad = []
    for i in range(max(len(want), len(got))):
        w = want[i] if i < len(want) else None; g = got[i] if i < len(got) else None
        gt = (g['full'] or g['text']) if g else None; gn = g['shown'] if g else None
        en = NAMES.get(w[0]) if w else None
        ok = bool(w and g and gt == w[1] and (gn or '') == (en or ''))
        if not ok: bad.append(i)
        R.note('%s #%d %s 稿［%s］「%s」｜遊戲［%s］「%s」%s' % (tag, i + 1, 'OK' if ok else '差', w and w[0], w and w[1], gn, gt, '' if not g else ('（ADV %s）' % ((g.get('adv') or {}).get('mode')))))
    return bad


async def table_press(pg, cdp, tag, pick=None, on_line=None, need_label=True):
    """站在算命桌前按：記按鈕、按下去的每一句、選單、前後差異、時間"""
    s = await D.settle(pg)
    if need_label and s['interact'] != '算命桌':
        R.note('%s 按鈕是「%s」不是「算命桌」：%s' % (tag, s['interact'], J({k: s[k] for k in ('x', 'z', 'hour')})))
        return None
    a = await pg.evaluate(SNAPG); n0 = await pg.evaluate(LOGN); h0 = (await pg.evaluate(DRV))['h']; t0 = time.time()
    await L.tap(pg, cdp, '#interact')
    menus = await drive(pg, cdp, pick=pick, on_line=on_line, since=n0)
    t1 = time.time(); b = await pg.evaluate(SNAPG); log = await pg.evaluate(LOGS, n0); q = await pg.evaluate(DRV)
    S_ = says(log); ch = [e['opts'] for e in log if e['k'] == 'choose']
    secs = round((S_[-1]['t'] - S_[0]['t']) / 1000.0, 1) if len(S_) > 1 else 0.0
    r = {'btn': s['interact'], 'h0': h0, 'h1': b['hour'], 'lines': S_, 'menus': ch, 'shown_menus': menus, 'id': identify(S_) if S_ else None, 'diff': gdiff(a, b), 'secs': secs, 'wall': round(t1 - t0, 1), 'after': q, 'caps': [e for e in log if e['k'] == 'cap']}
    R.note('%s 按「%s」（%s）→ %d 句、選單 %s、認出＝%s；時間 %s → %s；第一句到最後一句 %.1f 秒（探針點的速度）、整段 %.1f 秒；結束後 %s' % (
        tag, s['interact'], hhmm(h0), len(S_), J(ch), r['id'], hhmm(h0), hhmm(b['hour']), secs, r['wall'], J({k: q[k] for k in ('busy', 'adv', 'interact', 'depth')})))
    judge_diff(tag, r['diff'])
    return r


async def to_table(pg, cdp, tag, max_s=150):
    at, _, _ = await lay(pg)
    ok = await L.go_to(pg, cdp, R, at['x'], at['z'], 0.45, '%s 算命桌' % tag, max_s=max_s)
    s = await D.settle(pg)
    for _ in range(6):
        if s['interact']: break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    R.note('%s 走到算命桌前 (%.2f,%.2f) %s：按鈕「%s」' % (tag, s['x'], s['z'], hhmm(s['hour']), s['interact']))
    return ok, s


async def walk_exit(pg, cdp, tag, to, label0):
    exs = [i for i in await pg.evaluate(ITS) if i['to'] == to]
    if not exs: R.check('%s 有往 %s 的出口' % (tag, to), False, ''); return None
    ex = exs[0]
    if label0 and not ex['label'].startswith(label0): R.note('%s 出口字是「%s」' % (tag, ex['label']))
    await L.go_to(pg, cdp, R, ex['x'], ex['z'], min(0.6, ex['r'] * 0.6), '%s %s' % (tag, ex['label']), max_s=120)
    s = await D.settle(pg)
    for _ in range(6):
        if s['interact'].startswith(ex['label'][:4]): break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    await L.tap(pg, cdp, '#interact')
    for _ in range(120):
        q = await pg.evaluate(DRV)
        if q['zone'] == to and not q['fade'] and not q['busy']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(300)
    await pg.wait_for_timeout(1500); await hook(pg)
    me = await pg.evaluate(ME); R.note('%s 按「%s」→ %s' % (tag, s['interact'], J(me)))
    return me


async def enter_shop(pg, cdp, tag):
    d = next((i for i in await pg.evaluate(ITS) if i.get('tzd') == 'limao'), None)
    if not R.check('%s 巷子裡有禮貌生財的門' % tag, bool(d), ''): return None
    await L.go_to(pg, cdp, R, d['x'], d['z'], 0.6, '%s 店門' % tag, max_s=120)
    s = await D.settle(pg)
    for _ in range(6):
        if s['interact'].startswith('進'): break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    R.note('%s 店門口按鈕「%s」' % (tag, s['interact']))
    if not s['interact'].startswith('進禮貌生財'):   # 站在算命桌和門中間，最近的是桌子：往門再靠一點
        await L.go_to(pg, cdp, R, d['x'], d['z'] + 0.3, 0.3, '%s 店門（再靠近）' % tag, max_s=60); s = await D.settle(pg)
    await L.tap(pg, cdp, '#interact')
    for _ in range(120):
        q = await pg.evaluate(DRV)
        if q['zone'] == 'tz_limao' and not q['fade'] and not q['busy']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(300)
    await pg.wait_for_timeout(2500); await hook(pg)
    me = await pg.evaluate(ME)
    R.check('%s 進到店裡（tz_limao）、站得住' % tag, me['zone'] == 'tz_limao' and me['stand'] is not False, J(me))
    return me if me['zone'] == 'tz_limao' else None


async def look_point(pg, cdp, tag, it):
    """走到店裡一個點、按：記按鈕、字幕或旁白"""
    ok = await L.go_to(pg, cdp, R, it['x'], it['z'], min(0.5, it['r'] * 0.6), '%s %s' % (tag, it['label']), max_s=90)
    s = await D.settle(pg)
    for _ in range(6):
        if s['interact']: break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    await pg.evaluate("(()=>{ window.__lmDom=[]; for(const id of ['caption','toast']){ const t=document.getElementById(id); if(!t||t.__lmObs) continue; t.__lmObs=1; new MutationObserver(()=>{ const x=(t.innerText||'').trim(); if(x&&window.__lmDom) window.__lmDom.push(id+'：'+x); }).observe(t,{childList:true,subtree:true,characterData:true}); } })()")
    n0 = await pg.evaluate(LOGN); await L.tap(pg, cdp, '#interact'); await drive(pg, cdp, max_s=40); await pg.wait_for_timeout(600)
    log = await pg.evaluate(LOGS, n0); S_ = says(log); caps = [e['text'] for e in log if e['k'] == 'cap']
    for x in await pg.evaluate("window.__lmDom||[]"):   # 不經過 GAME.caption 的字（場景的「看」）：畫面上 #caption／#toast 出現的字
        if x not in caps: caps.append(x)
    R.note('%s 「%s」走到 %s、按鈕「%s」→ 旁白 %s；字幕 %s' % (tag, it['label'], ok, s['interact'], J([(e['shown'], e['full'] or e['text']) for e in S_]), J(caps)))
    return {'btn': s['interact'], 'lines': S_, 'caps': caps, 'ok': ok}


# ---------- PARTS ----------
async def part_first(pg, cdp):
    dd = await days(pg); d = dd['Y1S1']['day']; await names(pg)
    await ld(pg, cdp, await mk(pg, d, 19.5, 'tingzhou', *LANE, flags={'dating_kexin': False}), '【前置／捷徑】讀檔：大一上 %s 19:30 汀州路巷 A 禮貌生財前面，沒有 LM_*' % dd['Y1S1']['date'])
    at, door, y = await lay(pg)
    R.note('[FIRST] 配置：%s' % J(y and y.get('street') and {k: y['street'].get(k) for k in ('from', 'to', 'door', 'table')}))
    await facts(pg, '[FIRST]')
    ok, s = await to_table(pg, cdp, '[FIRST]')
    if not R.check('[FIRST] 算命桌前有「算命桌」按鈕（%s）' % hhmm(s['hour']), s['interact'] == '算命桌', J({k: s[k] for k in ('x', 'z', 'interact')})): return
    await pg.screenshot(path=os.path.join(OUT, 'lm2_first_before.jpg'), type='jpeg', quality=75)
    r = await table_press(pg, cdp, '[FIRST 第一次]', pick=by_text('離開'))
    if not r: return
    bad = cmp_lines('[FIRST 初次見面]', SEC['first'], r['lines'])
    R.check('[FIRST] 初次見面 %d 句逐句照稿（說話的人、字）、沒出選單' % len(SEC['first']), not bad and not r['menus'], '差 #%s' % J([i + 1 for i in bad]))
    R.note('[FIRST] 初次見面：%d 句、%d 字；第一句到最後一句 %.1f 秒、按下去到能動 %.1f 秒（探針每句點兩下、約 0.4 秒一下；玩家看的速度另計）' % (len(r['lines']), sum(len(e['full'] or e['text']) for e in r['lines']), r['secs'], r['wall']))
    F = (await pg.evaluate(SNAPG))['flags']
    R.check('[FIRST] LM_MET＝這一天（%d）' % d, F.get('LM_MET') == d, J(F.get('LM_MET')))
    R.note('[FIRST] 時間 %s → %s（含遊戲鐘自己走的；程式 S.HRS＝0.25）' % (hhmm(r['h0']), hhmm(r['h1'])))
    await pg.wait_for_timeout(800)
    r2 = await table_press(pg, cdp, '[FIRST 第二次]', pick=by_text('離開'))
    if not r2: R.check('[FIRST] 第二次按得到「算命桌」', False, ''); return
    m = r2['menus'][0] if r2['menus'] else None
    R.note('[FIRST] 第二次的選單（遊戲）%s｜稿 %s；畫面上的按鈕 %s' % (J(m), J(MENU), J(r2['shown_menus'])))
    R.check('[FIRST] 第二次＝五項選單，和稿一樣（聊聊天／問學業與考試／問感情／問人生方向／離開）', m == MENU, J(m))
    R.check('[FIRST] 選「離開」＝不說話、時間沒有跳 15 分鐘（%s → %s）' % (hhmm(r2['h0']), hhmm(r2['h1'])), not r2['lines'] and (r2['h1'] - r2['h0']) < 0.2, J([e['full'] for e in r2['lines']]))
    R.check('[FIRST] 結束後能動（不 busy、ADV 收掉、按鈕回到「算命桌」）', not r2['after']['busy'] and not r2['after']['adv'] and r2['after']['interact'] == '算命桌', J(r2['after']))


async def part_menu(pg, cdp):
    dd = await days(pg); d = dd['Y1S1']['day']; await names(pg)
    await ld(pg, cdp, await mk(pg, d, 19.5, 'tingzhou', *LANE, flags={'dating_kexin': False, 'LM_MET': d - 1}), '【前置／捷徑】讀檔：大一上 %s 19:30、LM_MET＝前一天（認識過）' % dd['Y1S1']['date'])
    await facts(pg, '[MENU]')
    ok, s = await to_table(pg, cdp, '[MENU]')
    if not R.check('[MENU] 有「算命桌」', s['interact'] == '算命桌', s['interact']): return
    for key, t in CATS:
        r = await table_press(pg, cdp, '[MENU %s]' % t, pick=by_text(t))
        if not r: R.check('[MENU %s] 按得到' % t, False, ''); continue
        m = r['menus'][0] if r['menus'] else None
        R.check('[MENU %s] 選單五項和稿一樣' % t, m == MENU, J(m))
        g = POOLG.get(r['id'] or '')
        R.check('[MENU %s] 演的是「%s」那一類的一組（認出 %s）、逐句照稿' % (t, key, r['id']), bool(g) and g['cat'] == key, J([e['full'] for e in r['lines']])[:300])
        if g: cmp_lines('[MENU %s %s]' % (t, r['id']), g['lines'], r['lines'])
        a = r['after']; R.check('[MENU %s] 結束後能動（不 busy、ADV 收掉、按鈕回到「算命桌」）' % t, not a['busy'] and not a['adv'] and a['interact'] == '算命桌', J(a))
        R.note('[MENU %s] 時間 %s → %s' % (t, hhmm(r['h0']), hhmm(r['h1'])))


def eligible(cat, f):
    year = int(f['term'][1]) if f.get('term') and re.match(r'^Y\d', f['term']) else 0
    W = {'期末考前一週': f.get('finalsNext'), '上學期有科目被當': f.get('failedLast'), '沒有交往對象': not f['partners'], '有朋友以上的女生、沒有交往對象': (not f['partners']) and bool(f['girls']),
         '交往中': bool(f['partners']), '最近分手（現有的分手旗標，三十天內）': f.get('brokeRecent'), '大三以後': year >= 3, '大四': year == 4, '落榜以後（國考或研究所，現有的結果旗標）': f.get('flunked'),
         '下雨天': f.get('weather') in ('rain', 'typhoon'), '有 LM_KNOWN': bool((f.get('lm') or {}).get('LM_KNOWN'))}
    out, unk = [], []
    for gid, g in POOLG.items():
        if g['cat'] != cat or g['serious']: continue
        if not g['when']: out.append(gid); continue
        if g['when'] not in W: unk.append(gid); continue
        if W[g['when']]: out.append(gid)
    return out, unk


async def pool_run(pg, cdp, tag, cats, n=4):
    f = await facts(pg, tag); seq = {}
    for key, t in cats:
        el, unk = eligible(key, f)
        R.note('%s %s：照稿的 when＋現在的狀態，可以出的組 %s%s' % (tag, t, J(el), ('；稿的 when 探針對不到 %s' % J(unk)) if unk else ''))
        got = []
        for i in range(n):
            h = (await pg.evaluate(DRV))['h']
            if h >= 23.0 or h < 19.0:
                await rewind(pg, cdp, 19.5, '【捷徑】快收攤了，跳回 19:30'); await to_table(pg, cdp, tag)
            r = await table_press(pg, cdp, '%s %s 第 %d 次' % (tag, t, i + 1), pick=by_text(t))
            if not r: R.check('%s %s 第 %d 次按得到' % (tag, t, i + 1), False, ''); await to_table(pg, cdp, tag); continue
            gid = r['id']; g = POOLG.get(gid or '')
            if g: cmp_lines('%s %s 第 %d 次 %s' % (tag, t, i + 1, gid), g['lines'], r['lines'])
            else:
                for e in r['lines']: R.note('%s %s 第 %d 次 認不出的句子［%s］「%s」' % (tag, t, i + 1, e['shown'], e['full']))
            R.check('%s %s 第 %d 次：%s 是這一類、照稿、在可以出的組裡 %s' % (tag, t, i + 1, gid, J(el)), bool(g) and g['cat'] == key and gid in el, J([e['full'] for e in r['lines']])[:200])
            got.append(gid)
        seq[key] = got
        rep = [i for i in range(1, len(got)) if got[i] and got[i] == got[i - 1]]
        R.check('%s %s 四次 %s：同一類沒有連續抽到同一組' % (tag, t, J(got)), not rep or len(el) < 2, J(rep))
        R.note('%s %s 四次裡出現 %d 種（可以出的 %d 種）' % (tag, t, len(set(x for x in got if x)), len(el)))
    return seq


async def part_pool(pg, cdp):
    dd = await days(pg); d = dd['Y1S1']['day']; await names(pg)
    for v in POOLSET:
        if v == 'C':
            await ld(pg, cdp, await mk(pg, d, 19.5, 'tingzhou', *LANE, flags={'dating_kexin': False, 'LM_MET': d - 1}), '【前置／捷徑】POOL C：大一上 %s 19:30、LM_MET 前一天、dating_kexin false（沒有交往）' % dd['Y1S1']['date'])
            low = await pg.evaluate("(()=>{ const out=[]; const i0=SOCIAL.STAGES.indexOf('FRIEND'); for(const id in GAME.G.social.rel){ const c=CHARACTERS[id]; if(!c||c.gender!=='f') continue; if(SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=i0){ const r=SOCIAL.rel(id); out.push([id,r.fam,r.trust]); r.fam=15; } } return out; })()")
            R.setup('POOL C：朋友以上的女生 fam 降到 15：%s' % J(low))
            cats = CATS
        elif v == 'B':
            await ld(pg, cdp, await mk(pg, d, 19.5, 'tingzhou', *LANE, flags={'dating_kexin': False, 'LM_MET': d - 1}), '【前置／捷徑】POOL B：大一上 19:30、LM_MET 前一天、沒有交往')
            fr = await pg.evaluate("(()=>{ const r=SOCIAL.rel('heroine_01'); r.fam=Math.max(r.fam,50); r.trust=Math.max(r.trust,30); return [r.fam,r.trust,SOCIAL.stage('heroine_01')]; })()")
            R.setup('POOL B：以安（heroine_01）fam／trust 調到 FRIEND：%s' % J(fr))
            cats = [c for c in CATS if c[0] == 'love']
        else:
            await ld(pg, cdp, await mk(pg, d, 19.5, 'tingzhou', *LANE, flags={'dating_kexin': True, 'LM_MET': d - 1}), '【前置／捷徑】POOL A：大一上 19:30、LM_MET 前一天、交往中（dating_kexin true＝遊戲預設）')
            cats = [c for c in CATS if c[0] == 'love']
        f = await facts(pg, '[POOL %s]' % v)
        want = {'C': (not f['partners'] and not f['girls']), 'B': (not f['partners'] and bool(f['girls'])), 'A': bool(f['partners'])}[v]
        R.check('[POOL %s] 前置成立（%s）' % (v, {'C': '沒交往、沒有朋友以上的女生', 'B': '沒交往、有朋友以上的女生', 'A': '交往中'}[v]), want, J({k: f[k] for k in ('partners', 'girls')}))
        ok, s = await to_table(pg, cdp, '[POOL %s]' % v)
        if not R.check('[POOL %s] 有「算命桌」' % v, s['interact'] == '算命桌', s['interact']): continue
        await pool_run(pg, cdp, '[POOL %s]' % v, cats)


async def part_flags(pg, cdp):
    await names(pg)
    st = json.load(open(OLDSAVE, encoding='utf-8'))
    st['zone'] = 'tingzhou'; st['pos'] = {'x': LANE[0], 'z': LANE[1], 'yaw': 0.0, 'lv': 0}; st['hour'] = 19.5; st['invites'] = []
    await ld(pg, cdp, st, '【前置／捷徑】day46 使用者存檔（%s）只改 zone／pos／hour：汀州路巷 A 19:30' % os.path.basename(OLDSAVE))
    await facts(pg, '[FLAGS]')
    a = await pg.evaluate(SNAPG); await pg.wait_for_timeout(20000); b = await pg.evaluate(SNAPG)
    R.note('[FLAGS] 雜訊底線（沒有互動、站著等 20 秒）的差異：%s' % J([(x[0], str(x[1])[:60], str(x[2])[:60]) for x in gdiff(a, b)]))
    LM_SEEN.clear()
    ok, s = await to_table(pg, cdp, '[FLAGS]')
    if not R.check('[FLAGS] 有「算命桌」', s['interact'] == '算命桌', s['interact']): return
    r = await table_press(pg, cdp, '[FLAGS 初次見面]', pick=by_text('離開'))
    if r: R.check('[FLAGS] day46 存檔第一次＝初次見面', r['id'] == 'first', r['id'])
    for key, t in CATS:
        r = await table_press(pg, cdp, '[FLAGS %s]' % t, pick=by_text(t))
        if not r: await to_table(pg, cdp, '[FLAGS]')
    R.note('[FLAGS] 整段多出／改過的 LM_ 旗標：%s' % J(sorted(LM_SEEN)))
    R.note('[FLAGS] 多出的 LM_ 旗標：%s（稿的四個＝%s；多的照實記，BB 01:02：報 LAWWW、不算 FAIL）' % (J(sorted(LM_SEEN)), '／'.join(FOUR)))
    R.check('[FLAGS] 多出的旗標都是 LM_ 開頭（BB 01:02）', all(str(k).startswith('LM_') for k in LM_SEEN), J(sorted(LM_SEEN)))


async def part_prof(pg, cdp):
    dd = await days(pg); await names(pg); LM_SEEN.clear()
    d1 = dd['Y1S1']['day']
    await ld(pg, cdp, await mk(pg, d1, 20.0, 'tingzhou', *LANE, flags={'dating_kexin': False, 'LM_MET': d1 - 1}), '【前置／捷徑】PROF ①：大一上 %s 20:00、LM_MET＝前一天' % dd['Y1S1']['date'])
    await facts(pg, '[PROF ①]'); await to_table(pg, cdp, '[PROF ①]')
    r = await table_press(pg, cdp, '[PROF ① 大一上]', pick=by_text('離開'))
    R.check('[PROF ①] 大一上：不演教授偶遇（出選單）', bool(r) and r['id'] != 'prof' and bool(r['menus']), J(r and r['id']))
    d2 = dd['Y1S2']['day']
    await ld(pg, cdp, await mk(pg, d2, 19.5, 'tingzhou', *LANE, flags={'dating_kexin': False}), '【前置／捷徑】PROF ②：大一下 %s 19:30、還沒認識' % dd['Y1S2']['date'])
    await facts(pg, '[PROF ②]'); await to_table(pg, cdp, '[PROF ②]')
    r = await table_press(pg, cdp, '[PROF ② 第一次]', pick=by_text('離開'))
    R.check('[PROF ②] 大一下第一次＝初次見面（不是教授偶遇）', bool(r) and r['id'] == 'first', J(r and r['id']))
    r = await table_press(pg, cdp, '[PROF ② 認識當天再按]', pick=by_text('離開'))
    R.check('[PROF ②] 認識的那一天再按＝選單（不演教授偶遇）', bool(r) and r['id'] != 'prof' and bool(r['menus']), J(r and r['id']))
    await rewind(pg, cdp, 20.0, '【捷徑】PROF ③：跳到隔天', day=d2 + 1)
    await facts(pg, '[PROF ③]'); await to_table(pg, cdp, '[PROF ③]')
    npc0 = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.prof_wu; return n&&n.obj?{x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), zone:GAME.G.zone}:null; })()")
    adv_wu = []

    async def on_line(e):
        if e['who'] and e['cid'] == 'prof_wu':
            await pg.wait_for_timeout(450); adv_wu.append(await pg.evaluate(ADVST))
            if len(adv_wu) == 1: await pg.screenshot(path=os.path.join(OUT, 'lm2_prof_wu_line.jpg'), type='jpeg', quality=80)
    r = await table_press(pg, cdp, '[PROF ③ 隔天]', pick=by_text('離開'), on_line=on_line)
    if not R.check('[PROF ③] 隔天按＝教授偶遇（prof）', bool(r) and r['id'] == 'prof', J(r and r['id'])):
        if r:
            for e in r['lines']: R.note('[PROF ③] 句子［%s］「%s」' % (e['shown'], e['full']))
    if r:
        bad = cmp_lines('[PROF ③ prof]', SEC['prof'], r['lines'])
        R.check('[PROF ③] prof %d 句逐句照稿（說話的人、字）、沒出選單' % len(SEC['prof']), not bad and not r['menus'], '差 #%s' % J([i + 1 for i in bad]))
        wu = [e for e in r['lines'] if e['cid'] == 'prof_wu' or (e['shown'] and e['shown'] == NAMES['wu'])]
        R.note('[PROF ③] 吳教授的句子：%s' % J([(e['shown'], e['cid'], e['obj'], e['full']) for e in wu]))
        R.check('[PROF ③] 吳教授說的話＝遊戲本來的吳教授（charId prof_wu、畫面名字「%s」）' % NAMES['wu'], bool(wu) and all(e['cid'] == 'prof_wu' and e['shown'] == NAMES['wu'] for e in wu), J([(e['shown'], e['cid']) for e in wu]))
        R.note('[PROF ③] 吳教授說話時的立繪（ADV）：%s；3D 人物：說話者有 obj＝%s；GAME.npc.prof_wu 在這一區＝%s' % (J(adv_wu), J([e['obj'] for e in wu]), J(npc0)))
    F = (await pg.evaluate(SNAPG))['flags']
    R.check('[PROF ③] LM_PROF 記上', F.get('LM_PROF') is True, J(F.get('LM_PROF')))
    r = await table_press(pg, cdp, '[PROF ④ 再按]', pick=by_text('離開'))
    R.check('[PROF ④] 只演一次：再按＝選單', bool(r) and r['id'] != 'prof' and bool(r['menus']), J(r and r['id']))
    R.note('[PROF] 整段多出／改過的 LM_ 旗標：%s' % J(sorted(LM_SEEN)))


async def room_shots(pg, tag, pre):
    V = [('門口往書房', (0.9, 1.6, 3.8), (0.6, 1.2, -3.0), 55), ('隔牆前往書房門', (0.9, 1.6, 0.6), (1.0, 1.2, -3.0), 50), ('書房門縫近拍', (1.0, 1.5, -0.35), (1.0, 1.2, -3.5), 60),
         ('天花板下越過隔牆', (1.8, 2.9, -0.9), (-1.0, 0.6, -3.8), 60), ('西側越過隔牆', (-1.6, 2.6, -0.8), (0.8, 0.5, -3.8), 60), ('正上方俯視（屋頂外）', (0.0, 9.0, -2.6), (0.0, 0.0, -3.1), 45),
         ('斜上方（屋頂外）', (4.0, 6.0, 1.0), (0.0, 1.0, -3.1), 45)]
    for lab, frm, to, fov in V:
        save_img(await pg.evaluate(SNAP, {'from': list(frm), 'at': list(to), 'fov': fov, 'tw': 640, 'label': '%s %s' % (pre, lab)}), 'lm2_%s_%s.jpg' % (pre, lab))
    R.note('%s SNAP %d 張（lm2_%s_*.jpg）' % (tag, len(V), pre))


async def cam_ring(pg, tag, pre):
    """遊戲鏡頭轉 8 個方向（只轉鏡頭）"""
    out = []
    for k in range(8):
        yaw = k * math.pi / 4
        await pg.evaluate("(y=>{ GAME.E.cam.yaw=y; })(%s)" % yaw); await pg.wait_for_timeout(900)
        real = await pg.evaluate("+GAME.E.cam.yaw.toFixed(3)")
        await pg.screenshot(path=os.path.join(OUT, 'lm2_%s_cam%d.jpg' % (pre, k)), type='jpeg', quality=72); out.append(real)
    R.note('%s 遊戲鏡頭 8 個方向（設 E.cam.yaw，實際 %s）：lm2_%s_cam0～7.jpg' % (tag, J(out), pre))


async def part_reveal(pg, cdp):
    dd = await days(pg); await names(pg); LM_SEEN.clear()
    _, _, y = await lay(pg); room = (y or {}).get('room') or {}
    # ① 還不能揭曉（大一下、認識過、沒有 LM_PROF）
    d = dd['Y1S2']['day']
    await ld(pg, cdp, await mk(pg, d, 20.0, 'tingzhou', 27.4, 2.8, flags={'dating_kexin': False, 'LM_MET': d - 1}), '【前置／捷徑】REVEAL ①：大一下 %s 20:00、LM_MET 前一天、沒有 LM_PROF，禮貌生財門口' % dd['Y1S2']['date'])
    await facts(pg, '[REVEAL ①]')
    if not await enter_shop(pg, cdp, '[REVEAL ①]'): return
    await pg.wait_for_timeout(2500)
    sv = await pg.evaluate(STUDYVIS); R.note('[REVEAL ①] 書房模型狀態：%s' % J(sv))
    R.check('[REVEAL ①] 還沒解鎖：書房鎖著（studyOpen false）、STUDY_* 都不顯示、屋頂蓋（STUDY_LID）顯示%s' % ('' if sv['formal'] else '（正式模型沒載入：只看 studyOpen）'),
            not sv['studyOpen'] and (not sv['formal'] or (sv['study']['vis'] == 0 and sv['lid']['vis'] == sv['lid']['n'] and sv['lid']['n'] > 0)), J(sv))
    its = await pg.evaluate(ITS); R.note('[REVEAL ①] 店裡的互動點：%s' % J(its))
    pts = [i for i in its if i['tzp'] in ('books', 'cabinet', 'scroll', 'study_door')]
    leak = []
    for it in pts:
        x = await look_point(pg, cdp, '[REVEAL ① 看]', it)
        txt = ' '.join([e['full'] or e['text'] for e in x['lines']] + x['caps'])
        if any(k in txt for k in ('刑法', '吳', '教授')): leak.append((it['label'], txt))
    R.check('[REVEAL ①] 還沒揭曉：店裡看的點、書房的門的字沒有「刑法」「吳」「教授」（不能先洩漏）', not leak, J(leak))
    await room_shots(pg, '[REVEAL ①]', 'pre')
    await L.go_to(pg, cdp, R, 1.0, -0.3, 0.4, '[REVEAL ①] 書房門前', max_s=60); await D.settle(pg)
    await cam_ring(pg, '[REVEAL ①]', 'pre')
    await L.tap_ground(pg, cdp, 0.3, -2.6); await pg.wait_for_timeout(5000); me = await pg.evaluate(ME)
    R.check('[REVEAL ①] 點書房裡的地板走不進去（z > −1.25）', me['z'] > -1.25, J(me))
    await L.joystick(pg, cdp, 0, -45, 1500); me = await pg.evaluate(ME)
    R.check('[REVEAL ①] 搖桿往書房推也進不去（z > −1.25）', me['z'] > -1.25, J(me))
    # ② 大四：入口 B → 選單 → talk → 書房
    d = dd['Y4S1']['day']
    await ld(pg, cdp, await mk(pg, d, 20.0, 'tingzhou', 27.4, 2.8, flags={'dating_kexin': False, 'LM_MET': d - 300, 'LM_PROF': True}), '【前置／捷徑】REVEAL ②：大四上 %s 20:00、LM_MET（300 天前）、LM_PROF，禮貌生財門口' % dd['Y4S1']['date'])
    await facts(pg, '[REVEAL ②]')
    if not await enter_shop(pg, cdp, '[REVEAL ②]'): return
    door = next((i for i in await pg.evaluate(ITS) if i['tzp'] == 'study_door'), None)
    if not R.check('[REVEAL ②] 有「書房的門」', bool(door), ''): return
    a = await pg.evaluate(SNAPG)
    x = await look_point(pg, cdp, '[REVEAL ② 入口 B]', door)
    b = await pg.evaluate(SNAPG); judge_diff('[REVEAL ② 入口 B]', gdiff(a, b))
    bad = cmp_lines('[REVEAL ② entryB]', SEC['entryB'], x['lines'])
    R.check('[REVEAL ②] 入口 B：書房的門＝兩句旁白逐句照稿（沒有名字）', not bad, '差 #%s' % J([i + 1 for i in bad]))
    R.check('[REVEAL ②] 入口 B 以後 LM_HINT 記上、書房還是鎖著', bool(b['flags'].get('LM_HINT')) and not (await pg.evaluate(STUDYVIS))['studyOpen'], J(b['flags'].get('LM_HINT')))
    x2 = await look_point(pg, cdp, '[REVEAL ② 入口 B 再按]', door)
    R.check('[REVEAL ②] 再按書房的門＝不重演入口 B（只有門上的字）', not x2['lines'], J([e['full'] for e in x2['lines']]))
    if not await walk_exit(pg, cdp, '[REVEAL ② 出店]', 'tingzhou', '離開'): return
    await to_table(pg, cdp, '[REVEAL ②]')
    r = await table_press(pg, cdp, '[REVEAL ② 揭曉]', pick=by_text(TALK0))
    if r:
        m = r['menus'][0] if r['menus'] else None
        R.check('[REVEAL ②] 看過入口以後選單六項、最上面＝稿 talk 第一句「%s」、其餘＝稿的五項' % TALK0, bool(m) and len(m) == 6 and m[0] == TALK0 and m[1:] == MENU, J(m))
        bad = cmp_lines('[REVEAL ② talk]', SEC['talk'][1:], r['lines'])
        R.check('[REVEAL ②] 選它＝talk 從第二句演完 %d 句逐句照稿' % (len(SEC['talk']) - 1), not bad, '差 #%s' % J([i + 1 for i in bad]))
        F = (await pg.evaluate(SNAPG))['flags']
        R.check('[REVEAL ②] LM_KNOWN、LM_STUDY 記上', F.get('LM_KNOWN') is True and F.get('LM_STUDY') is True, J({k: F.get(k) for k in FOUR}))
    r = await table_press(pg, cdp, '[REVEAL ② 揭曉後再按]', pick=by_text('離開'))
    R.check('[REVEAL ②] 揭曉以後選單回到五項', bool(r) and bool(r['menus']) and r['menus'][0] == MENU, J(r and r['menus']))
    if not await enter_shop(pg, cdp, '[REVEAL ② 再進店]'): return
    await pg.wait_for_timeout(2500)
    sv = await pg.evaluate(STUDYVIS); R.note('[REVEAL ② 解鎖後] 書房模型狀態：%s' % J(sv))
    R.check('[REVEAL ② 解鎖後] 書房開著（studyOpen）、STUDY_* 顯示、屋頂蓋拿掉%s' % ('' if sv['formal'] else '（正式模型沒載入：只看 studyOpen）'),
            sv['studyOpen'] and (not sv['formal'] or (sv['study']['vis'] > 0 and sv['lid']['vis'] == 0)), J(sv))
    its = await pg.evaluate(ITS); R.note('[REVEAL ② 解鎖後] 店裡的互動點：%s' % J(its))
    AT = {'study_books': '書櫃', 'study_desk': '書桌', 'study_photo': '合照', 'study_letters': '學生來信'}
    got = {}
    for pid, at in AT.items():
        it = next((i for i in its if i['tzp'] == pid), None)
        if not R.check('[REVEAL ② 書房] 有「%s」的點' % at, bool(it), ''): continue
        x = await look_point(pg, cdp, '[REVEAL ② 書房]', it)
        me = await pg.evaluate(ME); got[at] = [e['full'] or e['text'] for e in x['lines']]
        R.note('[REVEAL ② 書房 %s] 站在 %s' % (at, J(me)))
        R.check('[REVEAL ② 書房 %s] 走得到（%s）、旁白＝稿「%s」（沒有名字）' % (at, J(x['ok']), LOOKS.get(at)), bool(x['ok']) and got[at] == [LOOKS.get(at)] and all(not e['shown'] for e in x['lines']), J(got[at]))
    await pg.screenshot(path=os.path.join(OUT, 'lm2_study_inside_game.jpg'), type='jpeg', quality=78)
    await room_shots(pg, '[REVEAL ② 解鎖後]', 'post')
    await L.go_to(pg, cdp, R, 0.9, 2.8, 0.5, '[REVEAL ②] 走出書房回到前半', max_s=90); me = await pg.evaluate(ME)
    R.check('[REVEAL ②] 走得出書房（z > −0.9）、站得住', me['z'] > -0.9 and me['stand'] is not False, J(me))
    me = await walk_exit(pg, cdp, '[REVEAL ② 出店]', 'tingzhou', '離開')
    if me:
        p0 = (me['x'], me['z']); await L.joystick(pg, cdp, 0, 45, 1200); me2 = await pg.evaluate(ME)
        R.check('[REVEAL ②] 出店回到巷子、站得住、推得動', me['zone'] == 'tingzhou' and me['stand'] is not False and math.hypot(me2['x'] - p0[0], me2['z'] - p0[1]) > 0.3, J([me, me2]))
    R.note('[REVEAL] 整段多出／改過的 LM_ 旗標：%s' % J(sorted(LM_SEEN)))
    R.note('[REVEAL] 多出的 LM_ 旗標：%s（稿的四個＝%s；多的照實記，BB 01:02：報 LAWWW、不算 FAIL）' % (J(sorted(LM_SEEN)), '／'.join(FOUR)))
    R.check('[REVEAL] 多出的旗標都是 LM_ 開頭（BB 01:02）', all(str(k).startswith('LM_') for k in LM_SEEN), J(sorted(LM_SEEN)))
    R.note('[REVEAL] 配置的書房：%s' % J(room.get('study') and {k: room['study'].get(k) for k in ('door', 'points')}))


async def wancai_at(pg, cdp, day, hour, flags, why):
    """【前置】讀檔站到萬才館一樓入口前（入口位置從遊戲讀：e7ddae33f 起不在舊的 (93.8,−100.6)）；條件事件開著"""
    if not WSPOT:
        await ld(pg, cdp, await mk(pg, day, hour, 'campus', None, None, flags=flags), '【前置／捷徑】先讀校園（出生點）找萬才館一樓入口', quiet=False)
        ds = await pg.evaluate(WDOORS); R.note('[萬才館] 校園往 wancai 的一樓入口：%s' % J(ds))
        for d in ds:
            sp = await pg.evaluate(WFRONT, d)
            if sp: WSPOT.update({'door': d, 'spot': sp}); break
        R.note('[萬才館] 用的入口與門前站的點：%s' % J(WSPOT))
        if not WSPOT: return None
    sp = WSPOT['spot']
    await ld(pg, cdp, await mk(pg, day, hour, 'campus', sp['x'], sp['z'], flags=flags), '%s（萬才館「%s」門前 %.1f m (%.2f,%.2f)）' % (why, WSPOT['door']['label'], sp['r'], sp['x'], sp['z']), quiet=False)
    return WSPOT['door']


async def part_reveala(pg, cdp):
    dd = await days(pg); await names(pg); LM_SEEN.clear()
    d = dd['Y4S1']['day']
    if not await wancai_at(pg, cdp, d, 15.0, {'dating_kexin': False, 'LM_MET': d - 300, 'LM_PROF': True}, '【前置／捷徑】REVEALA：大四上 %s 15:00、LM_MET、LM_PROF' % dd['Y4S1']['date']):
        R.check('[REVEALA] 找得到萬才館一樓入口', False, ''); return
    await facts(pg, '[REVEALA]')
    ev = await pg.evaluate("(()=>{ const e=(typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[]).find(q=>q&&q.id==='ev_limao_wu_corridor'); if(!e) return null; let ok=null; try{ ok=e.prereq&&e.prereq.custom?e.prereq.custom(GAME.G):null; }catch(x){ ok='ERR'; } return {title:e.title, location:e.location, trigger:e.trigger, once:e.once, prereq:ok, done:!!(GAME.G.events&&JSON.stringify(GAME.G.events).indexOf('ev_limao_wu_corridor')>=0)}; })()")
    R.note('[REVEALA] 入口 A 事件：%s（稿的標題「%s」）' % (J(ev), DR['reveal']['entryA'].get('title')))
    if not R.check('[REVEALA] 有事件 ev_limao_wu_corridor、條件成立', bool(ev) and ev['prereq'] is True, J(ev)): return
    exs = [i for i in await pg.evaluate(ITS) if i['to'] == 'wancai' and i['lv'] == 0]
    exs.sort(key=lambda i: math.hypot(i['x'] - (WSPOT.get('door') or i)['x'], i['z'] - (WSPOT.get('door') or i)['z']))
    if not R.check('[REVEALA] 萬才館一樓入口', bool(exs), J(exs)): return
    ex = exs[0]; a = await pg.evaluate(SNAPG); n0 = await pg.evaluate(LOGN)
    await L.go_to(pg, cdp, R, ex['x'], ex['z'], min(0.6, ex['r'] * 0.6), '[REVEALA] %s' % ex['label'], max_s=120)
    s = await D.settle(pg)
    for _ in range(6):
        if s['interact'] == ex['label'] or s['interact'].startswith(ex['label'][:3]): break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    R.note('[REVEALA] 入口按鈕「%s」' % s['interact'])
    await L.tap(pg, cdp, '#interact')
    title = None
    for _ in range(80):
        q = await pg.evaluate(DRV)
        if title is None:
            title = await pg.evaluate("(()=>{ const e=document.getElementById('title3'); return e&&+getComputedStyle(e).opacity>0.05&&(e.textContent||'').trim()?(e.textContent||'').trim().slice(0,40):null; })()")
        if q['zone'] == 'wancai' and (q['dlg'] or q['busy']): break
        if q['zone'] == 'wancai' and not q['fade'] and not q['busy']:
            await pg.wait_for_timeout(2500); q = await pg.evaluate(DRV)
            if not q['dlg'] and not q['busy']: break
        await pg.wait_for_timeout(300)
    await hook(pg); await drive(pg, cdp, max_s=90)
    log = await pg.evaluate(LOGS, n0); S_ = says(log); b = await pg.evaluate(SNAPG)
    R.note('[REVEALA] 進萬才館以後說的話（全部）：%s；標題卡 %s' % (J([(e['shown'], e['full']) for e in S_]), J(title)))
    me = await pg.evaluate(ME); R.note('[REVEALA] 現在 %s' % J(me))
    k = next((i for i in range(len(S_)) if (S_[i]['full'] or S_[i]['text']) == SEC['entryA'][0][1]), None)
    seg = S_[k:k + len(SEC['entryA'])] if k is not None else []
    bad = cmp_lines('[REVEALA entryA]', SEC['entryA'], seg)
    R.check('[REVEALA] 走進萬才館＝入口 A 三句逐句照稿（祐廷／吳教授）', k is not None and not bad, '差 #%s' % J([i + 1 for i in bad]))
    wu = [e for e in seg if e['cid'] == 'prof_wu' or e['shown'] == NAMES['wu']]
    R.note('[REVEALA] 吳教授的句子：%s' % J([(e['shown'], e['cid'], e['obj']) for e in wu]))
    judge_diff('[REVEALA 入口 A]', gdiff(a, b))
    R.check('[REVEALA] LM_HINT 記上', bool(b['flags'].get('LM_HINT')), J(b['flags'].get('LM_HINT')))
    await pg.screenshot(path=os.path.join(OUT, 'lm2_entryA_after.jpg'), type='jpeg', quality=75)
    await rewind(pg, cdp, 20.0, '【捷徑】REVEALA：回汀州路 20:00')
    await to_table(pg, cdp, '[REVEALA 汀州路]')
    r = await table_press(pg, cdp, '[REVEALA 揭曉]', pick=by_text(TALK0))
    if r:
        m = r['menus'][0] if r['menus'] else None
        R.check('[REVEALA] 入口 A 以後選單六項、最上面＝「%s」' % TALK0, bool(m) and len(m) == 6 and m[0] == TALK0, J(m))
        bad = cmp_lines('[REVEALA talk]', SEC['talk'][1:], r['lines'])
        R.check('[REVEALA] talk 從第二句逐句照稿', not bad, '差 #%s' % J([i + 1 for i in bad]))
    R.note('[REVEALA] 整段多出／改過的 LM_ 旗標：%s' % J(sorted(LM_SEEN)))


async def hours_poll(pg, tag, want_on, until_h, max_s):
    """站著每 0.5 秒記按鈕，記「算命桌」出現（want_on）／消失那一刻的 G.hour"""
    t0 = time.time(); last = None; hit = None; trace = []
    while time.time() - t0 < max_s:
        q = await pg.evaluate(DRV)
        if q['interact'] != last: trace.append((hhmm(q['h']), q['h'], q['interact'])); last = q['interact']
        if (q['interact'] == '算命桌') == want_on: hit = q['h']; break
        if q['h'] >= until_h: break
        await pg.wait_for_timeout(500)
    R.note('%s 按鈕變化：%s' % (tag, J(trace)))
    return hit


async def closed_press(pg, cdp, tag):
    s = await D.settle(pg); n0 = await pg.evaluate(LOGN); h = (await pg.evaluate(DRV))['h']
    if s['interact']: await L.tap(pg, cdp, '#interact'); await drive(pg, cdp, pick=by_text('離開'), max_s=40); await pg.wait_for_timeout(800)
    log = await pg.evaluate(LOGS, n0); me = await pg.evaluate(ME)
    menus = [e['opts'] for e in log if e['k'] == 'choose']; S_ = says(log); caps = [e['text'] for e in log if e['k'] == 'cap']
    R.note('%s %s 按鈕「%s」→ 句子 %s、字幕 %s、選單 %s、之後 %s' % (tag, hhmm(h), s['interact'], J([(e['shown'], e['full']) for e in S_]), J(caps), J(menus), J({k: me[k] for k in ('zone', 'x', 'z')})))
    lm = [e for e in S_ if e['shown'] == '上師' or identify([e])]
    R.check('%s %s（按的那一刻 G.hour %.3f）按：沒有上師的選單、沒有上師說話' % (tag, hhmm(h), h), not any(m == MENU or (m and m[1:] == MENU) for m in menus) and not lm, J(menus))
    shut = (DR.get('closed') or {}).get('收攤')
    R.check('%s %s 收攤：按鈕是「看算命桌」' % (tag, hhmm(h)), s['interact'] == '看算命桌', s['interact'])
    got = [(e['shown'] or '', e['full'] or e['text']) for e in S_]
    R.check('%s %s 收攤：按下去＝稿 closed「收攤」一句旁白、逐字、沒有名字「%s」' % (tag, hhmm(h), shut), got == [('', shut)], J(got))
    return {'btn': s['interact'], 'lines': S_, 'caps': caps, 'zone': me['zone']}


async def part_hours(pg, cdp):
    dd = await days(pg); d = dd['Y1S1']['day']; await names(pg)
    at, door, y = await lay(pg); st0 = (y or {}).get('street') or {}
    R.note('[HOURS] 配置 from %s、to %s；稿 closed：%s' % (st0.get('from'), st0.get('to'), J(DR.get('closed'))))
    # 19:00 前
    await ld(pg, cdp, await mk(pg, d, 18.75, 'tingzhou', *LANE, flags={'dating_kexin': False, 'LM_MET': d - 1}), '【前置／捷徑】HOURS ①：大一上 %s 18:45、認識過' % dd['Y1S1']['date'])
    await L.go_to(pg, cdp, R, at['x'], at['z'], 0.45, '[HOURS ①] 算命桌', max_s=120); s = await D.settle(pg)
    if s['hour'] < 18.98:
        x = await closed_press(pg, cdp, '[HOURS ① 19:00 前]')
        R.note('[HOURS ① 19:00 前] 遊戲顯示（並排稿的「收攤」：%s）：按鈕「%s」、句子 %s、字幕 %s' % (DR.get('closed', {}).get('收攤'), x['btn'], J([e['full'] for e in x['lines']]), J(x['caps'])))
        if x['zone'] != 'tingzhou':
            await walk_exit(pg, cdp, '[HOURS ① 出店]', 'tingzhou', '離開'); await L.go_to(pg, cdp, R, at['x'], at['z'], 0.45, '[HOURS ①] 回算命桌', max_s=90)
    else: R.note('[HOURS ①] 走到桌前已經 %s（≥18:59），19:00 前那一次沒按到' % hhmm(s['hour']))
    hit = await hours_poll(pg, '[HOURS ① 等開]', True, 19.4, 120)
    R.check('[HOURS ①] 「算命桌」出現在 19:00～19:03（G.hour %s）' % (hit if hit is None else '%.3f' % hit), hit is not None and 19.0 <= hit <= 19.05, J(hit))
    if hit is not None:
        r = await table_press(pg, cdp, '[HOURS ① 開了以後]', pick=by_text('離開'))
        R.check('[HOURS ①] 開了以後按＝選單', bool(r) and bool(r['menus']), J(r and r['menus']))
    # 23:30
    await ld(pg, cdp, await mk(pg, d, 23.3, 'tingzhou', *LANE, flags={'dating_kexin': False, 'LM_MET': d - 1}), '【前置／捷徑】HOURS ②：大一上 23:18、認識過')
    await L.go_to(pg, cdp, R, at['x'], at['z'], 0.45, '[HOURS ②] 算命桌', max_s=120); s = await D.settle(pg)
    if s['interact'] == '算命桌' and s['hour'] < 23.45:
        r = await table_press(pg, cdp, '[HOURS ② 收攤前]', pick=by_text('離開'))
        R.check('[HOURS ②] %s（<23:30）按＝選單' % hhmm(r['h0'] if r else s['hour']), bool(r) and bool(r['menus']) and r['h0'] < 23.5, J(r and [r['h0'], r['menus']]))
    else: R.note('[HOURS ②] 走到桌前 %s、按鈕「%s」：收攤前那一次沒按到' % (hhmm(s['hour']), s['interact']))
    gone = await hours_poll(pg, '[HOURS ② 等收]', False, 23.8, 120)
    R.check('[HOURS ②] 「算命桌」在 23:30～23:33 消失（G.hour %s）' % (gone if gone is None else '%.3f' % gone), gone is not None and 23.5 <= gone <= 23.55, J(gone))
    x = await closed_press(pg, cdp, '[HOURS ② 23:30 以後]')
    R.note('[HOURS ② 23:30 以後] 遊戲顯示（並排稿的「收攤」：%s）：按鈕「%s」、字幕 %s' % (DR.get('closed', {}).get('收攤'), x['btn'], J(x['caps'])))
    if x['zone'] != 'tingzhou': await walk_exit(pg, cdp, '[HOURS ② 出店]', 'tingzhou', '離開')
    # 凌晨
    await ld(pg, cdp, await mk(pg, d, 2.0, 'tingzhou', *LANE, flags={'dating_kexin': False, 'LM_MET': d - 1}), '【前置／捷徑】HOURS ③：大一上 02:00、認識過')
    await L.go_to(pg, cdp, R, at['x'], at['z'], 0.45, '[HOURS ③] 算命桌', max_s=120)
    x = await closed_press(pg, cdp, '[HOURS ③ 凌晨]')
    R.note('[HOURS] 稿的「店開著、他不在」：%s——遊戲 zone.tzLimaoAway 現在沒有任何事件設（limao3d.js:18），這一句沒有測到' % DR.get('closed', {}).get('店開著、他不在'))


async def part_ui(pg, cdp):
    dd = await days(pg); d = dd['Y1S1']['day']; await names(pg)
    at, door, y = await lay(pg)
    # ① 橫向：初次見面每一句
    await ld(pg, cdp, await mk(pg, d, 19.5, 'tingzhou', *LANE, flags={'dating_kexin': False}), '【前置／捷徑】UI ①：大一上 19:30、沒有 LM_*（橫向 844×390）')
    ok, s = await to_table(pg, cdp, '[UI ①]')
    boxes = []
    if s['interact'] == '算命桌':
        async def on_line(e):
            await full_line(pg, cdp)
            bx = await pg.evaluate(DLGBOX); i = len(boxes) + 1; boxes.append((e, bx))
            await pg.screenshot(path=os.path.join(OUT, 'lm2_ui_land_%02d.jpg' % i), type='jpeg', quality=80)
        await table_press(pg, cdp, '[UI ① 橫向]', pick=by_text('離開'), on_line=on_line)
    else: R.check('[UI ①] 有「算命桌」', False, s['interact'])
    ui_judge('[UI ① 橫向]', boxes)
    # ② 直向
    await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(1500)
    if await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); return !!r&&r.classList.contains('want')&&getComputedStyle(r).display!=='none'; })()"):
        R.note('[UI ②] 直向跳出「請把手機轉成橫向」，像玩家一樣點掉'); await L.tap(pg, cdp, '#rotate'); await pg.wait_for_timeout(800)
    s = await D.settle(pg); boxes = []
    if s['interact'] == '算命桌':
        async def on_line2(e):
            await full_line(pg, cdp)
            bx = await pg.evaluate(DLGBOX); i = len(boxes) + 1; boxes.append((e, bx))
            await pg.screenshot(path=os.path.join(OUT, 'lm2_ui_port_%02d.jpg' % i), type='jpeg', quality=80)
        r = await table_press(pg, cdp, '[UI ② 直向]', pick=by_text('聊聊天'), on_line=on_line2)
        if r and r['menus']:
            R.note('[UI ②] 直向的選單（畫面）%s' % J(r['shown_menus']))
    else: R.note('[UI ②] 直向時按鈕「%s」，沒按到' % s['interact'])
    ui_judge('[UI ② 直向]', boxes)
    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(1500)
    # ③ 算命桌 → 店門每 0.3 m
    dx, dz = door['x'] - at['x'], door['z'] - at['z']; dist = math.hypot(dx, dz)
    R.note('[UI ③] 算命桌按鈕 (%.2f,%.2f) r%.1f、店門 (%.2f,%.2f) r%.1f，相距 %.2f m' % (at['x'], at['z'], at.get('r', 1.0), door['x'], door['z'], door.get('r', 0.9), dist))
    ss = [round(0.3 * k, 2) for k in range(int(dist / 0.3) + 1)]
    if dist - ss[-1] > 0.05: ss.append(round(dist, 2))
    rows = []
    for sd in ss:
        h = (await pg.evaluate(DRV))['h']
        if h >= 23.0 or h < 19.0: await rewind(pg, cdp, 19.5, '【捷徑】UI ③ 快收攤，跳回 19:30')
        px, pz = at['x'] + dx * sd / dist, at['z'] + dz * sd / dist
        sp = await pg.evaluate(STANDNEAR, {'x': px, 'z': pz, 'r': 0.6})
        if not sp: rows.append((sd, None, '站不住', '', '')); continue
        await L.go_to(pg, cdp, R, sp['x'], sp['z'], 0.15, '[UI ③ %.1f m]' % sd, max_s=60); s = await D.settle(pg)
        ni = await pg.evaluate(D.NEAR_IT)
        n0 = await pg.evaluate(LOGN); z0 = s['zone']; res = '（沒有按鈕）'
        if s['interact']:
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
            q = await pg.evaluate(DRV)
            for _ in range(20):
                if q['zone'] != z0 or q['choices'] or q['dlg']: break
                await pg.wait_for_timeout(400); q = await pg.evaluate(DRV)
            if q['zone'] == 'tz_limao' or q['fade']:
                for _ in range(60):
                    q = await pg.evaluate(DRV)
                    if q['zone'] == 'tz_limao' and not q['fade']: break
                    await pg.wait_for_timeout(300)
                res = '進了店（tz_limao）'; await pg.wait_for_timeout(1500); await hook(pg)
                await walk_exit(pg, cdp, '[UI ③ %.1f m 出店]' % sd, 'tingzhou', '離開')
            else:
                await drive(pg, cdp, pick=by_text('離開'), max_s=40)
                log = await pg.evaluate(LOGS, n0); ch = [e['opts'] for e in log if e['k'] == 'choose']; S_ = says(log); caps = [e['text'] for e in log if e['k'] == 'cap']
                res = ('上師的選單 %s' % J(ch[0])) if ch else (('句子 %s' % J([e['full'] for e in S_])) if S_ else ('字幕 %s' % J(caps) if caps else '（沒反應）'))
        rows.append((sd, (s['x'], s['z']), s['interact'], ni and ni['label'], res))
        R.note('[UI ③ %.1f m] 站在 (%.2f,%.2f)：按鈕「%s」（最近的互動點 %s）→ 按下去：%s' % (sd, s['x'], s['z'], s['interact'], ni and ni['label'], res))
        cons = (s['interact'] == '算命桌' and res.startswith('上師的選單')) or (s['interact'].startswith('進禮貌生財') and res.startswith('進了店')) or (s['interact'] not in ('算命桌',) and not s['interact'].startswith('進'))
        R.check('[UI ③ %.1f m] 按鈕寫的＝按下去的（「%s」→ %s）' % (sd, s['interact'], res[:30]), cons, '')
    open(os.path.join(OUT, 'lm2_ui_gap.md'), 'w', encoding='utf-8').write('| 離算命桌按鈕 m | 站的位置 | 按鈕 | 最近的互動點 | 按下去 |\n|---|---|---|---|---|\n' + '\n'.join('| %s | %s | %s | %s | %s |' % (r[0], r[1], r[2], r[3], r[4]) for r in rows) + '\n')
    # ④ 上師沒有 3D 人物
    _, _, y = await lay(pg); T = ((y or {}).get('street') or {}).get('table') or {}
    sm = T.get('seatMaster') or {'x': 29.35, 'z': 4.6}
    near = await pg.evaluate(NPCNEAR, {'x': sm['x'], 'z': sm['z'], 'r': 1.5})
    mn = await pg.evaluate("(()=>typeof LM!=='undefined'?{masterNpc:!!LM.masterNpc, seat:LM.masterSeat?LM.masterSeat():null}:null)()")
    R.note('[UI ④] 上師座位 %s 1.5 m 內的人物：%s；LM：%s' % (J(sm), J(near), J(mn)))
    tx = T.get('x', 29.35)
    for lab, frm, to, fov in [('客人的位置看上師', (tx, 1.25, 3.0), (tx, 1.0, 4.7), 55), ('巷子斜看算命桌', (tx - 2.6, 1.7, 0.6), (tx, 0.9, 4.0), 50)]:
        save_img(await pg.evaluate(SNAP, {'from': list(frm), 'at': list(to), 'fov': fov, 'tw': 640, 'label': '上師的位置 %s' % lab}), 'lm2_ui_master_%s.jpg' % lab)
    await to_table(pg, cdp, '[UI ④]')
    await pg.screenshot(path=os.path.join(OUT, 'lm2_ui_master_game.jpg'), type='jpeg', quality=78)
    R.note('[UI ④] 上師沒有 3D 人物（照實記，不判）：座位 1.5 m 內有 %d 個人物、LM.masterNpc＝%s；照片 lm2_ui_master_*.jpg' % (len(near), mn and mn['masterNpc']))


async def full_line(pg, cdp):
    """打字中點一下＝整句顯示（已經整句就不點，不然會翻到下一句）"""
    await pg.wait_for_timeout(250)
    if await pg.evaluate("!!(GAME.D&&GAME.D.active&&GAME.D.typing)"): await L.tap(pg, cdp, '#dlg')
    for _ in range(10):
        if not await pg.evaluate("!!(GAME.D&&GAME.D.typing)"): break
        await pg.wait_for_timeout(200)
    await pg.wait_for_timeout(200)


def ui_judge(tag, boxes):
    if not boxes: R.check('%s 有拍到句子' % tag, False, ''); return
    for i, (e, bx) in enumerate(boxes):
        if not bx: R.note('%s #%d 對話框沒開（%s）' % (tag, i + 1, e['full'])); continue
        covered = [p for p in bx['pts'] if not p['inside']]
        R.note('%s #%d［%s］「%s」：框 %s、在畫面裡 %s、被切 %s、被擋的點 %s、ADV %s' % (tag, i + 1, bx['name'], bx['text'][:40], J(bx['box']), bx['inView'], bx['clipped'], J(covered), J((e.get('adv') or {}).get('mode'))))
        R.check('%s #%d 字整句在框裡、沒被切、沒被別的東西擋（截圖 %02d）' % (tag, i + 1, i + 1), bx['inView'] and not bx['clipped'] and not covered, J(covered))
    allms = [(e['who'], bx and bx['name']) for e, bx in boxes if e['who'] and e['who'] not in (NAMES.get('yt'), NAMES.get('wu'))]
    R.note('%s 上師的句子畫面上的名字：%s' % (tag, J(allms)))
    R.check('%s 上師的名字只顯示「上師」（稿：他的名字不出現）' % tag, bool(allms) and all(n == '上師' for _, n in allms), J(allms))
    R.check('%s 對話是模糊背景的 ADV（ADV mode 有 blur）' % tag, all('blur' in ((e.get('adv') or {}).get('mode') or '') for e, _ in boxes), J([(e.get('adv') or {}).get('mode') for e, _ in boxes][:3]))


async def part_serious(pg, cdp):
    dd = await days(pg); await names(pg); LM_SEEN.clear()
    d = dd['Y2S1']['day']
    await ld(pg, cdp, await mk(pg, d, 19.5, 'tingzhou', *LANE, flags=dict({'dating_kexin': True, 'LM_MET': d - 100}, **SERP)), '【前置／捷徑】SERIOUS ①：大二上 %s 19:30、交往中（可昕）、認識過' % dd['Y2S1']['date'])
    end = await pg.evaluate("(()=>{ try{ return ROM.end(GAME.G,'kexin'); }catch(e){ return 'ERR '+e.message; } })()")
    R.setup('SERIOUS ①：【捷徑】ROM.end(GAME.G,"kexin")（遊戲自己的分手函式）→ %s' % J(end))
    f = await facts(pg, '[SERIOUS ①]')
    R.check('[SERIOUS ①] 前置成立：最近分手（LM.brokeRecent）、沒有交往', f.get('brokeRecent') is True and not f['partners'], J({k: f[k] for k in ('brokeRecent', 'partners')}))
    await to_table(pg, cdp, '[SERIOUS ①]')
    seq = []
    for i, t in enumerate(['聊聊天', '問感情', '問感情', '聊聊天']):
        r = await table_press(pg, cdp, '[SERIOUS ① 分手後 第 %d 次 %s]' % (i + 1, t), pick=by_text(t))
        if not r: continue
        seq.append(r['id']); g = POOLG.get(r['id'] or '')
        if g: cmp_lines('[SERIOUS ① 第 %d 次 %s]' % (i + 1, r['id']), g['lines'], r['lines'])
        else:
            for e in r['lines']: R.note('[SERIOUS ① 第 %d 次] ［%s］「%s」' % (i + 1, e['shown'], e['full']))
    R.note('[SERIOUS ①] 分手後四次：%s（稿 seriousNote：%s）' % (J(seq), DR['pool'].get('seriousNote')))
    R.check('[SERIOUS ①] 第一次（選聊聊天）＝lv4；之後不再出 lv4', bool(seq) and seq[0] == 'lv4' and 'lv4' not in seq[1:], J(seq))
    F = (await pg.evaluate(SNAPG))['flags']; R.note('[SERIOUS ①] LM_SER＝%s' % J(F.get('LM_SER')))
    d = dd['Y4S2']['day']
    await ld(pg, cdp, await mk(pg, d, 19.5, 'tingzhou', *LANE, flags=dict({'dating_kexin': False, 'LM_MET': d - 300, 'GRAD_EXAM_RESULT': 'fail'}, **SERP)), '【前置／捷徑】SERIOUS ②：大四下 %s 19:30、認識過、GRAD_EXAM_RESULT＝fail（研究所筆試沒上）' % dd['Y4S2']['date'])
    f = await facts(pg, '[SERIOUS ②]')
    R.check('[SERIOUS ②] 前置成立：落榜（LM.flunked）', f.get('flunked') is True, J(f.get('flunked')))
    await to_table(pg, cdp, '[SERIOUS ②]')
    seq = []
    for i, t in enumerate(['問學業與考試', '問人生方向', '問學業與考試']):
        r = await table_press(pg, cdp, '[SERIOUS ② 落榜後 第 %d 次 %s]' % (i + 1, t), pick=by_text(t))
        if not r: continue
        seq.append(r['id']); g = POOLG.get(r['id'] or '')
        if g: cmp_lines('[SERIOUS ② 第 %d 次 %s]' % (i + 1, r['id']), g['lines'], r['lines'])
        else:
            for e in r['lines']: R.note('[SERIOUS ② 第 %d 次] ［%s］「%s」' % (i + 1, e['shown'], e['full']))
    R.note('[SERIOUS ②] 落榜後三次：%s' % J(seq))
    R.check('[SERIOUS ②] 第一次（選問學業與考試）＝lf5；之後不再出 lf5', bool(seq) and seq[0] == 'lf5' and 'lf5' not in seq[1:], J(seq))
    R.note('[SERIOUS] 整段多出／改過的 LM_ 旗標：%s' % J(sorted(LM_SEEN)))
    R.note('[SERIOUS] 多出的 LM_ 旗標：%s（稿的四個＝%s；多的照實記，BB 01:02：報 LAWWW、不算 FAIL）' % (J(sorted(LM_SEEN)), '／'.join(FOUR)))
    R.check('[SERIOUS] 多出的旗標都是 LM_ 開頭（BB 01:02）', all(str(k).startswith('LM_') for k in LM_SEEN), J(sorted(LM_SEEN)))


async def part_serorder(pg, cdp):
    """BB 02:45 定案：認真那一組（serious）先、吳教授撞見（prof）留到下一次。存檔沒有 LM_PROF＋剛分手（大二上，ROM.end）→
    四類各讀一次檔：第一次按（選那一類）＝serious lv4、LM_PROF 還沒記；第二次去＝prof（吳教授撞見）、LM_PROF 記上。"""
    dd = await days(pg); await names(pg); d = dd['Y2S1']['day']
    for t in ('聊聊天', '問學業與考試', '問感情', '問人生方向'):
        tag = '[SERORDER %s]' % t
        await ld(pg, cdp, await mk(pg, d, 19.5, 'tingzhou', *LANE, flags={'dating_kexin': True, 'LM_MET': d - 100}), '【前置／捷徑】%s 大二上 %s 19:30、交往中（可昕）、認識過、沒有 LM_PROF' % (tag, dd['Y2S1']['date']))
        end = await pg.evaluate("(()=>{ try{ return ROM.end(GAME.G,'kexin'); }catch(e){ return 'ERR '+e.message; } })()")
        R.setup('%s 【捷徑】ROM.end(GAME.G,"kexin") → %s' % (tag, J(end)))
        f = await facts(pg, tag); F0 = (await pg.evaluate(SNAPG))['flags']
        R.check('%s 前置：剛分手、沒有交往、沒有 LM_PROF' % tag, f.get('brokeRecent') is True and not f['partners'] and not F0.get('LM_PROF'), J({'brokeRecent': f.get('brokeRecent'), 'partners': f['partners'], 'LM_PROF': F0.get('LM_PROF')}))
        await to_table(pg, cdp, tag)
        r1 = await table_press(pg, cdp, '%s 第 1 次' % tag, pick=by_text(t)); F1 = (await pg.evaluate(SNAPG))['flags']
        g = POOLG.get((r1 or {}).get('id') or '')
        if r1 and g: cmp_lines('%s 第 1 次 %s' % (tag, r1['id']), g['lines'], r1['lines'])
        R.check('%s 第 1 次（選%s）＝serious lv4、LM_PROF 還沒記' % (tag, t), bool(r1) and r1.get('id') == 'lv4' and not F1.get('LM_PROF'), J({'id': r1 and r1.get('id'), 'LM_PROF': F1.get('LM_PROF'), 'LM_SER': F1.get('LM_SER')}))
        r2 = await table_press(pg, cdp, '%s 第 2 次' % tag, pick=by_text(t)); F2 = (await pg.evaluate(SNAPG))['flags']
        if r2 and r2.get('id') == 'prof': cmp_lines('%s 第 2 次 prof' % tag, SEC['prof'], r2['lines'])
        R.check('%s 第 2 次＝吳教授撞見（prof）、LM_PROF 記上' % tag, bool(r2) and r2.get('id') == 'prof' and bool(F2.get('LM_PROF')), J({'id': r2 and r2.get('id'), 'LM_PROF': F2.get('LM_PROF')}))


async def part_save(pg, cdp, errs):
    await names(pg)
    # ① 線上 v9.10.24 做一份存檔
    base = json.load(open(OLDSAVE, encoding='utf-8')); live_save = None; ver = None
    e0 = len(errs)
    try:
        await pg.goto(LIVE, timeout=90000)
        if await L.wait_loaded(pg, timeout_s=240):
            ver = await pg.evaluate("(()=>{ const m=/版本\\s*v[0-9.]+[^）)]*[）)]?/.exec((document.getElementById('titleScreen')||document.body).innerText||''); return m?m[0]:null; })()")
            st = dict(base); st['zone'] = 'gongguan'; st['pos'] = {'x': 37.1, 'z': 17.5, 'yaw': 0.0, 'lv': 0}; st['hour'] = 19.33; st['invites'] = []
            await L.load_state(pg, st, quiet_events=True); await pg.wait_for_timeout(6000)
            live_save = await pg.evaluate("JSON.parse(JSON.stringify(GAME.snapshot()))")
    except Exception as e:
        R.note('[SAVE ①] 線上版 %s 打不開：%r' % (LIVE, e))
    R.note('[SAVE ①] 線上版 %s：標題「%s」；做出來的存檔 %s；線上頁的 JS 例外 %s' % (LIVE, ver, J(live_save and {k: live_save.get(k) for k in ('v', 'day', 'hour', 'zone', 'pos')}), J(errs[e0:][:3])))
    R.check('[SAVE ①] 線上版標題是 v9.10.24（做的是那一版的存檔）', bool(ver) and 'v9.10.24' in ver, J(ver))
    del errs[e0:]
    src = 'v9.10.24 線上版 GAME.snapshot()' if live_save else 'day46 原檔（線上做不出來，退回）'
    if not live_save:
        live_save = dict(base); live_save['zone'] = 'gongguan'; live_save['pos'] = {'x': 37.1, 'z': 17.5, 'yaw': 0.0, 'lv': 0}; live_save['hour'] = 19.33; live_save['invites'] = []
    open(os.path.join(OUT, 'lm2_save_v91024.json'), 'w', encoding='utf-8').write(json.dumps(live_save, ensure_ascii=False))
    await pg.goto(URL)
    if not await L.wait_loaded(pg): R.check('[SAVE] 測試版重新載入', False, ''); return
    await hook(pg); e1 = len(errs)
    await ld(pg, cdp, live_save, '【前置】SAVE ①：讀 %s（公館往汀州路巷口 19:20；存檔 v=%s）' % (src, live_save.get('v')), quiet=False)
    await facts(pg, '[SAVE ①]')
    gate = next((i for i in await pg.evaluate(ITS) if i['to'] == 'tingzhou'), None)
    if not R.check('[SAVE ①] 公館有往汀州路的入口', bool(gate), ''): return
    me = await walk_exit(pg, cdp, '[SAVE ① 公館→汀州路]', 'tingzhou', '往汀州路')
    if not R.check('[SAVE ①] 走進汀州路', bool(me) and me['zone'] == 'tingzhou', J(me)): return
    ok, s = await to_table(pg, cdp, '[SAVE ①]', max_s=240)
    r = await table_press(pg, cdp, '[SAVE ① 舊存檔第一次]', pick=by_text('離開'))
    if r: cmp_lines('[SAVE ① first]', SEC['first'], r['lines'])
    R.check('[SAVE ①] 舊存檔走進去＝初次見面（%s）' % src, bool(r) and r['id'] == 'first', J(r and r['id']))
    R.check('[SAVE ①] 這一段沒有 JS 例外', len(errs) == e1, J(errs[e1:][:3]))
    # ② 存檔留著旗標
    rd = "(()=>{ const k='fatiao3d_auto'; let s=null; try{ s=GAME.readSave?GAME.readSave(k):(GAME.readSave?GAME.readSave(k):JSON.parse(localStorage.getItem(k)||'null')); }catch(e){ return 'ERR '+e.message; } if(!s) return null; const o={}; for(const x in (s.flags||{})) if(/^LM_/.test(x)) o[x]=s.flags[x]; return {day:s.day, hour:s.hour, zone:s.zone, lm:o, savedAt:s.savedAt}; })()"
    a1 = await pg.evaluate(rd); R.note('[SAVE ②] 剛演完，自動存檔（fatiao3d_auto）：%s' % J(a1))
    R.note('[SAVE ②] （limao3d.js S.spend 在段落裡叫 GM.autosave，game3d.js autosave 段落深度 >0 不存——剛演完可能還沒存，照實記）')
    if await enter_shop(pg, cdp, '[SAVE ② 進店]'):
        await walk_exit(pg, cdp, '[SAVE ② 出店]', 'tingzhou', '離開')
    a2 = await pg.evaluate(rd); R.note('[SAVE ②] 進店再出來以後的自動存檔：%s' % J(a2))
    R.check('[SAVE ②] 自動存檔裡有 LM_MET', isinstance(a2, dict) and 'LM_MET' in (a2.get('lm') or {}), J(a2))
    await pg.reload()
    if not await L.wait_loaded(pg): R.check('[SAVE ②] 重新整理後載入', False, ''); return
    await L.no_phone_auto(pg)
    if not await L.tap(pg, cdp, '#btnContinue'): R.check('[SAVE ②] 標題有「繼續（自動存檔）」', False, ''); return
    for _ in range(60):
        q = await pg.evaluate("(()=>({title:!document.getElementById('titleScreen').classList.contains('hide'), zone:GAME.G&&GAME.G.zone, fade:document.getElementById('fade').classList.contains('on')}))()")
        if not q['title'] and not q['fade']: break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp); await hook(pg)
    f = await facts(pg, '[SAVE ② 繼續]')
    R.check('[SAVE ②] 重新整理、按「繼續」：LM_MET 還在', 'LM_MET' in (f.get('lm') or {}), J(f.get('lm')))
    me = await pg.evaluate(ME)
    if me['zone'] == 'tingzhou':
        if (await pg.evaluate(DRV))['h'] >= 23.0: await rewind(pg, cdp, 20.0, '【捷徑】SAVE ② 快收攤，跳回 20:00')
        await to_table(pg, cdp, '[SAVE ② 繼續]')
        r = await table_press(pg, cdp, '[SAVE ② 繼續以後]', pick=by_text('離開'))
        R.check('[SAVE ②] 繼續以後按算命桌＝選單（不是又初次見面）', bool(r) and r['id'] != 'first' and bool(r['menus']), J(r and r['id']))
    else: R.note('[SAVE ②] 繼續以後在 %s（不在汀州路），算命桌那一次沒按' % me['zone'])


async def part_saveday(pg, cdp):
    await names(pg)
    base = json.load(open(OLDSAVE, encoding='utf-8'))
    R.note('[SAVEDAY] day46 存檔的 LM_ 旗標：%s' % J({k: v for k, v in base.get('flags', {}).items() if k.startswith('LM_')}))
    st = dict(base); st['zone'] = 'dorm'; st['pos'] = None; st['hour'] = 22.0; st['invites'] = []
    await ld(pg, cdp, st, '【前置／捷徑】SAVEDAY ①：day46 存檔、宿舍 22:00（只改 zone／pos／hour）', quiet=False)
    n0 = await pg.evaluate(LOGN); d0 = await pg.evaluate("GAME.G.day")
    bed = await L.find_it(pg, '睡覺')
    if R.check('[SAVEDAY ①] 宿舍有「睡覺」', bool(bed), ''):
        await L.go_to(pg, cdp, R, bed['x'], bed['z'], bed['r'] * 0.7, '[SAVEDAY ①] 床', max_s=120); await D.settle(pg)
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        await drive(pg, cdp, pick=lambda o: next((i for i, t in enumerate(o) if t.startswith('睡到明天早上') or t == '睡覺'), 0), max_s=30)
        for _ in range(240):
            q = await pg.evaluate("({day:GAME.G.day, zone:GAME.G.zone, hour:GAME.G.hour})")
            if q['day'] == d0 + 1 and q['hour'] >= 7.4: break
            if (await pg.evaluate(DRV))['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(4000); await drive(pg, cdp, pick=lambda o: next((i for i, t in enumerate(o) if t.startswith('先起床')), len(o) - 1), max_s=40)
        log = await pg.evaluate(LOGS, n0); S_ = says(log); f = await facts(pg, '[SAVEDAY ① 隔天]')
        R.note('[SAVEDAY ①] 睡覺到隔天說的話：%s' % J([(e['shown'], (e['full'] or '')[:40]) for e in S_]))
        R.check('[SAVEDAY ①] 過了一天（第 %d → %d 天）' % (d0, f['day']), f['day'] == d0 + 1, '')
        R.check('[SAVEDAY ①] 這一天沒有上師的句子、沒有 LM_ 旗標', not any(e['shown'] == '上師' or identify([e]) for e in S_) and not f['lm'], J(f['lm']))
    st = dict(base); st['zone'] = 'tingzhou'; st['pos'] = {'x': 22.0, 'z': 0.0, 'yaw': 0.0, 'lv': 0}; st['hour'] = 20.5; st['invites'] = []
    await ld(pg, cdp, st, '【前置／捷徑】SAVEDAY ②：day46 存檔、汀州路巷 A 西邊 20:30', quiet=False)
    n0 = await pg.evaluate(LOGN)
    at, _, _ = await lay(pg)
    await L.go_to(pg, cdp, R, at['x'], at['z'] - 1.2, 0.6, '[SAVEDAY ②] 從算命桌前走過去', max_s=150)
    await pg.wait_for_timeout(4000)
    await L.go_to(pg, cdp, R, 31.0, 0.0, 0.8, '[SAVEDAY ②] 繼續往東', max_s=90)
    log = await pg.evaluate(LOGS, n0); S_ = says(log); f = await facts(pg, '[SAVEDAY ②]')
    R.check('[SAVEDAY ②] 走過算命桌不按：上師不會自己演、沒有 LM_ 旗標', not any(e['shown'] == '上師' or identify([e]) for e in S_) and not f['lm'], J([(e['shown'], e['full']) for e in S_][:4]))
    dd = await days(pg); d = dd['Y4S1']['day']
    await wancai_at(pg, cdp, d, 15.0, {'dating_kexin': False}, '【前置／捷徑】SAVEDAY ③：大四上 %s 15:00、沒有任何 LM_*' % dd['Y4S1']['date'])
    exs = [i for i in await pg.evaluate(ITS) if i['to'] == 'wancai' and i['lv'] == 0]
    exs.sort(key=lambda i: math.hypot(i['x'] - (WSPOT.get('door') or i)['x'], i['z'] - (WSPOT.get('door') or i)['z']))
    if R.check('[SAVEDAY ③] 萬才館一樓入口', bool(exs), ''):
        n0 = await pg.evaluate(LOGN)
        me = await walk_exit(pg, cdp, '[SAVEDAY ③ 進萬才館]', 'wancai', exs[0]['label'][:3])
        await drive(pg, cdp, max_s=60)
        log = await pg.evaluate(LOGS, n0); S_ = says(log); f = await facts(pg, '[SAVEDAY ③]')
        R.note('[SAVEDAY ③] 進萬才館說的話：%s' % J([(e['shown'], (e['full'] or '')[:40]) for e in S_]))
        R.check('[SAVEDAY ③] 沒認識上師的大四生進萬才館：不出入口 A、沒有 LM_ 旗標', bool(me) and not any(identify([e]) or (e['full'] or '') in [x[1] for x in SEC['entryA']] for e in S_) and not f['lm'], J(f['lm']))

FINDCLS = r"""(o=>{ const G=GAME.G, out=[]; for(let d=o.d0; d<o.d1; d++){ let its=[]; try{ its=CLS.dayItems(G,d)||[]; }catch(e){ continue; }
    for(const it of its){ const rm=it.room||{}; if(it.exam||!(rm.zone==='wancai'||rm.via==='wancai')) continue; let dk=null; try{ dk=CALENDAR.dateOf(d).key; }catch(e){}
      out.push({day:d, date:dk, cid:it.c.id, name:it.c.name, t0:it.t0, t1:it.t1, key:it.key, room:rm, all:its.map(q=>[q.c.name,+q.t0.toFixed(2),+q.t1.toFixed(2),(q.room||{}).name||null])}); }
    if(out.length) break; } return out; })"""
CLSST = r"""(k=>{ const G=GAME.G; let it=null; try{ it=CLS.dayItems(G).find(q=>q.key===k)||null; }catch(e){} const R=(G.courses)||{};
  return {h:+(+G.hour).toFixed(3), zone:G.zone, status:it?CLS.status(G,it):null, lateMin:it&&CLS.lateMin?+CLS.lateMin(G,it).toFixed(1):null, isLate:it&&CLS.isLate?!!CLS.isLate(G,it):null, isLateAbsent:it&&CLS.isLateAbsent?!!CLS.isLateAbsent(G,it):null,
    live:it&&CLS.live?!!CLS.live(G,it):null, done:!!(R.done&&R.done[k]), late:!!(R.late&&R.late[k]), abs:!!(R.abs&&R.abs[k]), seat:!!GAME.E.player.seat}; })"""
CLSDOOR = r"""(rm=>(GAME.E.interactables||[]).filter(i=>!i.hidden&&((rm.zone&&rm.zone!=='wancai'&&i.exit&&i.exit.to===rm.zone)||(rm.door&&i.door===rm.door))).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1,lv:i.lv|0,to:i.exit?i.exit.to:null,door:i.door||null})))"""


async def enter_wancai(pg, cdp, tag, key=None):
    """校園萬才館一樓入口 → 走進去：記說的每一句、標題卡、時間（遊戲、實際）；key＝那堂課（記演完那一刻的狀態）"""
    exs = [i for i in await pg.evaluate(ITS) if i['to'] == 'wancai' and i['lv'] == 0]
    exs.sort(key=lambda i: math.hypot(i['x'] - (WSPOT.get('door') or i)['x'], i['z'] - (WSPOT.get('door') or i)['z']))
    if not R.check('%s 萬才館一樓入口' % tag, bool(exs), ''): return None
    ex = exs[0]; n0 = await pg.evaluate(LOGN)
    await L.go_to(pg, cdp, R, ex['x'], ex['z'], min(0.6, ex['r'] * 0.6), '%s %s' % (tag, ex['label']), max_s=120)
    s = await D.settle(pg)
    for _ in range(6):
        if s['interact'] == ex['label'] or s['interact'].startswith(ex['label'][:3]): break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    h_tap = (await pg.evaluate(DRV))['h']; t_tap = time.time(); st0 = await pg.evaluate(CLSST, key) if key else None
    R.note('%s 入口按鈕「%s」，按的那一刻 %s（G.hour %.3f）；那堂課 %s' % (tag, s['interact'], hhmm(h_tap), h_tap, J(st0)))
    await L.tap(pg, cdp, '#interact'); title = None
    for _ in range(80):
        q = await pg.evaluate(DRV)
        if title is None:
            title = await pg.evaluate("(()=>{ const e=document.getElementById('title3'); return e&&+getComputedStyle(e).opacity>0.05&&(e.textContent||'').trim()?(e.textContent||'').trim().slice(0,40):null; })()")
        if q['zone'] == 'wancai' and (q['dlg'] or q['busy']): break
        if q['zone'] == 'wancai' and not q['fade'] and not q['busy']:
            await pg.wait_for_timeout(2500); q = await pg.evaluate(DRV)
            if not q['dlg'] and not q['busy']: break
        await pg.wait_for_timeout(300)
    await hook(pg); await drive(pg, cdp, pick=lambda o: next((i for i, t in enumerate(o) if any(k in t for k in ('上課', '進教室', '進去'))), 0), max_s=120)
    h_end = (await pg.evaluate(DRV))['h']; t_end = time.time()
    log = await pg.evaluate(LOGS, n0); S_ = says(log); menus = [e['opts'] for e in log if e['k'] == 'choose']
    A = [x[1] for x in SEC['entryA']]; k = next((i for i in range(len(S_)) if (S_[i]['full'] or S_[i]['text']) == A[0]), None)
    seg = S_[k:k + len(A)] if k is not None else []
    st1 = await pg.evaluate(CLSST, key) if key else None; F = (await pg.evaluate(SNAPG))['flags']
    r = {'lines': S_, 'menus': menus, 'title': title, 'entryA': k is not None, 'h_tap': h_tap, 'h_end': h_end, 'secs': round(t_end - t_tap, 1),
         'a_secs': round((seg[-1]['t'] - seg[0]['t']) / 1000.0, 1) if len(seg) > 1 else 0.0, 'a_h': (seg[0]['gh'], seg[-1]['gh']) if seg else None, 'cls': st1, 'hint': F.get('LM_HINT')}
    R.note('%s 進萬才館以後說的話（全部，按順序）：%s；選單 %s；標題卡 %s' % (tag, J([(e['shown'], (e['full'] or '')[:50], e['gh']) for e in S_]), J(menus), J(title)))
    R.note('%s 入口 A %s；三句從 G.hour %s 到 %s、探針點的速度 %.1f 秒；按入口到能動：遊戲 %s → %s（%.1f 分鐘）、實際 %.1f 秒；LM_HINT＝%s；那堂課演完那一刻 %s' % (
        tag, '有演' if k is not None else '沒有演', r['a_h'] and r['a_h'][0], r['a_h'] and r['a_h'][1], r['a_secs'], hhmm(h_tap), hhmm(h_end), (h_end - h_tap) * 60, r['secs'], J(r['hint']), J(st1)))
    if seg: cmp_lines('%s entryA' % tag, SEC['entryA'], seg)
    await pg.screenshot(path=os.path.join(OUT, 'lm2_entryclass_%s.jpg' % re.sub(r'\W+', '_', tag)), type='jpeg', quality=72)
    return r


async def part_entryclass(pg, cdp):
    dd = await days(pg); await names(pg)
    d0 = dd['Y4S1']['day']
    await ld(pg, cdp, await mk(pg, d0, 12.0, 'campus', None, None, flags={'dating_kexin': False}), '【前置／捷徑】ENTRYCLASS：先讀一個大四上的狀態（只為了查課表）', quiet=False)
    found = await pg.evaluate(FINDCLS, {'d0': d0 - 28, 'd1': d0 + 90})
    R.note('[ENTRYCLASS] 大四上教室在法律系館B 的課（第一個有課的日子）：%s' % J(found))
    if not R.check('[ENTRYCLASS] 找得到大四上在法律系館B 上課的日子', bool(found), ''): return
    c = found[0]; flags = {'dating_kexin': False, 'LM_MET': c['day'] - 300, 'LM_PROF': True}
    h0 = c['t0'] - ENTRYMIN / 60.0
    if not await wancai_at(pg, cdp, c['day'], h0, flags, '【前置】ENTRYCLASS ①：大四上 %s（第 %d 天）%s 上課前 %g 分鐘 %s、LM_MET＋LM_PROF' % (c['date'], c['day'], c['name'], ENTRYMIN, hhmm(h0))):
        R.check('[ENTRYCLASS] 找得到萬才館一樓入口', False, ''); return
    f = await facts(pg, '[ENTRYCLASS ①]')
    R.note('[ENTRYCLASS ①] 這一天的課：%s；這堂 %s %s～%s 在 %s' % (J(c['all']), c['name'], hhmm(c['t0']), hhmm(c['t1']), J(c['room'])))
    if f.get('lm', {}).get('LM_HINT'): R.note('[ENTRYCLASS ①] 讀進來就有 LM_HINT（前置不成立）')
    r = await enter_wancai(pg, cdp, '[ENTRYCLASS ① 趕上課]', key=c['key'])
    if r:
        R.note('[ENTRYCLASS ①] 結論（只記）：被拉進入口 A＝%s；入口 A 三句演了 %s 遊戲時間（%s～%s）；按入口到能動 %.1f 遊戲分鐘；那時候上課狀態 %s' % (
            r['entryA'], r['a_h'] and '%.1f 分鐘' % ((r['a_h'][1] - r['a_h'][0]) * 60), r['a_h'] and hhmm(r['a_h'][0]), r['a_h'] and hhmm(r['a_h'][1]), (r['h_end'] - r['h_tap']) * 60, J(r['cls'])))
        doors = await pg.evaluate(CLSDOOR, c['room']); R.note('[ENTRYCLASS ①] 往教室的互動點：%s' % J(doors))
        if doors:
            dr = doors[0]; n0 = await pg.evaluate(LOGN)
            await L.go_to(pg, cdp, R, dr['x'], dr['z'], min(0.6, dr['r'] * 0.6), '[ENTRYCLASS ①] 去教室「%s」' % dr['label'], max_s=180, lv=dr['lv'])
            s = await D.settle(pg); st_door = await pg.evaluate(CLSST, c['key'])
            R.note('[ENTRYCLASS ①] 走到教室門口：按鈕「%s」；那一刻 %s' % (s['interact'], J(st_door)))
            if s['interact']:
                await L.tap(pg, cdp, '#interact')
                await drive(pg, cdp, pick=lambda o: next((i for i, t in enumerate(o) if any(k in t for k in ('進去', '上課', '進教室', '聽'))), 0), max_s=150)
            await pg.wait_for_timeout(3000)
            st_in = await pg.evaluate(CLSST, c['key'])
            if not st_in['done'] and not st_in['seat'] and st_in['zone'] == (c['room'].get('zone') or 'wancai'):   # 進了教室還沒算上課：照玩家找最近的座位坐下
                seats = await pg.evaluate(D.SEATS); me = await pg.evaluate(ME)
                seats.sort(key=lambda q: math.hypot(q['x'] - me['x'], q['z'] - me['z']))
                R.note('[ENTRYCLASS ①] 進了教室（%s），還沒算上課；座位 %d 張，最近的 %s' % (J(st_in), len(seats), J(seats[:1])))
                occ = await pg.evaluate("(()=>(GAME.E.npcs||[]).filter(n=>n&&n.seat).map(n=>[n.seat.x,n.seat.z]))()")
                seats = [q for q in seats if not any(math.hypot(q['sx'] - o[0], q['sz'] - o[1]) < 0.35 for o in occ)]
                s = {'interact': ''}
                for q in seats[:5]:   # 沒人坐的座位：走到 seatApproach，按鈕是「坐下」才按（旁邊有同學時按鈕可能是「和某某說話」，換下一張）
                    tgt = q['ap'] or [q['x'], q['z']]
                    await L.go_to(pg, cdp, R, tgt[0], tgt[1], 0.2, '[ENTRYCLASS ①] 走到座位 (%s,%s)' % (q['sx'], q['sz']), max_s=120, lv=q['slv']); s = await D.settle(pg)
                    R.note('[ENTRYCLASS ①] 座位 (%s,%s) 旁按鈕「%s」' % (q['sx'], q['sz'], s['interact']))
                    if s['interact'].startswith('坐下'): break
                if seats:
                    if s['interact'].startswith('坐下'):
                        await L.tap(pg, cdp, '#interact')
                        t1 = time.time()
                        while time.time() - t1 < 240:   # 上課（點對話、選選項；坐下以後轉暗快轉到下課）
                            await drive(pg, cdp, pick=lambda o: next((i for i, t in enumerate(o) if any(k in t for k in ('上課', '聽', '進去', '專心'))), 0), max_s=60)
                            st_c = await pg.evaluate(CLSST, c['key'])
                            if st_c['done'] or not st_c['seat']: break
                            await pg.wait_for_timeout(2000)
            log = await pg.evaluate(LOGS, n0); st2 = await pg.evaluate(CLSST, c['key'])
            R.note('[ENTRYCLASS ①] 按下去以後說的話：%s；選單 %s' % (J([(e['shown'], (e['full'] or '')[:40]) for e in says(log)][:12]), J([e['opts'] for e in log if e['k'] == 'choose'])))
            R.note('[ENTRYCLASS ①] 那堂課最後（G.courses 的 done／late／abs）：%s' % J(st2))
            await pg.screenshot(path=os.path.join(OUT, 'lm2_entryclass_after_class.jpg'), type='jpeg', quality=72)
        else: R.note('[ENTRYCLASS ①] 萬才館裡找不到往 %s 的互動點，沒走去教室' % J(c['room']))
    # 對照：同一天沒有課的時間
    alls = c['all']; t_first = min(a[1] for a in alls); t_last = max(a[2] for a in alls)
    hc = t_first - 3.0 if t_first - 3.0 >= 7.5 else max(t_last + 0.5, 15.0)
    await wancai_at(pg, cdp, c['day'], hc, flags, '【前置】ENTRYCLASS ②（對照）：同一天 %s（沒有課的時間）、LM_MET＋LM_PROF' % hhmm(hc))
    r2 = await enter_wancai(pg, cdp, '[ENTRYCLASS ② 沒課]')
    if r2:
        R.note('[ENTRYCLASS ②] 對照（只記）：被拉進入口 A＝%s；入口 A 三句 %s 遊戲分鐘；按入口到能動 %.1f 遊戲分鐘、實際 %.1f 秒' % (
            r2['entryA'], r2['a_h'] and '%.1f' % ((r2['a_h'][1] - r2['a_h'][0]) * 60), (r2['h_end'] - r2['h_tap']) * 60, r2['secs']))


async def part_grad(pg, cdp):
    await names(pg)
    if not os.path.exists(GRADSAVE): R.note('[GRAD] 沒有畢業後的存檔（%s），不造' % GRADSAVE); return
    st = json.load(open(GRADSAVE, encoding='utf-8')); st = st.get('G', st)
    F0 = st.get('flags', {})
    keys = [k for k in F0 if re.search(r'GRAD|DELAY|BAR_|JUDGE|^PG$|Y5|^LM_', k)]
    R.note('[GRAD] 存檔 %s：第 %s 天；相關旗標 %s' % (os.path.basename(GRADSAVE), st.get('day'), J({k: (F0[k] if not isinstance(F0[k], (dict, list)) else type(F0[k]).__name__) for k in keys})))
    st['zone'] = 'tingzhou'; st['pos'] = {'x': LANE[0], 'z': LANE[1], 'yaw': 0.0, 'lv': 0}; st['hour'] = 20.0; st['invites'] = []
    await ld(pg, cdp, st, '【前置／捷徑】GRAD：%s 只改 zone／pos／hour：汀州路巷 A 20:00' % os.path.basename(GRADSAVE))
    f = await facts(pg, '[GRAD]')
    yr = await pg.evaluate("(()=>{ let t=null, d=null, dl=null; try{ t=STORY.termAt(GAME.G.day); }catch(e){} try{ d=CALENDAR.termOf(GAME.G.day); }catch(e){} try{ dl=CALENDAR.termOfDelayed?CALENDAR.termOfDelayed(GAME.G.day):null; }catch(e){} return {termAt:t, termOf:d, delayed:dl, lmYear:typeof LM!=='undefined'&&LM.year?LM.year(GAME.G):null, lmTerm:typeof LM!=='undefined'&&LM.term?LM.term(GAME.G):null}; })()")
    R.note('[GRAD] 學年：%s（程式看 LM.year＝4 才出 lf3；LAWWW：畢業後、延畢也算 4）' % J(yr))
    ok, s = await to_table(pg, cdp, '[GRAD]')
    if s['interact'] != '算命桌': R.note('[GRAD] 桌前按鈕「%s」，沒辦法問' % s['interact']); return
    el, unk = eligible('life', f); R.note('[GRAD] 照稿的 when＋現在的狀態，人生方向可以出的組 %s' % J(el))
    got = []
    for i in range(6):
        if len([g for g in got if g]) >= 4: break
        r = await table_press(pg, cdp, '[GRAD 第 %d 次]' % (i + 1), pick=by_text('問人生方向'))
        if not r: await to_table(pg, cdp, '[GRAD]'); continue
        if r['id'] in ('first', 'prof'):
            R.note('[GRAD 第 %d 次] 先演了 %s（不算問人生方向）' % (i + 1, r['id'])); continue
        got.append(r['id']); g = POOLG.get(r['id'] or '')
        if g: cmp_lines('[GRAD 第 %d 次 %s]' % (i + 1, r['id']), g['lines'], r['lines'])
        else:
            for e in r['lines']: R.note('[GRAD 第 %d 次] ［%s］「%s」' % (i + 1, e['shown'], e['full']))
    R.note('[GRAD] 問人生方向抽到：%s；「大四」那組 lf3 有沒有出＝%s（只記，不判）' % (J(got), 'lf3' in got))


async def main():
    print('CC LM2 禮貌生財上師對話：PARTS %s；SHA %s；稿 %s；Windows＋GPU（PC）／SwiftShader（雲端）≠ iPhone' % (','.join(PARTS), SHA, os.path.relpath(DRAFT_DIR, HERE)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.note('hook：%s；LM 在＝%s' % (await hook(pg), await pg.evaluate("typeof LM!=='undefined'")))
        for part, fn in (('FIRST', part_first), ('MENU', part_menu), ('POOL', part_pool), ('FLAGS', part_flags), ('PROF', part_prof), ('REVEAL', part_reveal), ('REVEALA', part_reveala),
                         ('HOURS', part_hours), ('UI', part_ui), ('SERIOUS', part_serious), ('SERORDER', part_serorder), ('SAVE', None), ('SAVEDAY', part_saveday), ('ENTRYCLASS', part_entryclass), ('GRAD', part_grad)):
            if part not in PARTS: continue
            t0 = time.time()
            try:
                if part == 'SAVE': await part_save(pg, cdp, errs)
                else: await fn(pg, cdp)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
            R.note('[%s] 花了 %.0f 秒' % (part, time.time() - t0))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
