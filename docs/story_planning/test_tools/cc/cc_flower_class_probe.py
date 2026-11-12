"""CC-C 11-12：⑪ FLOWER-CLASS-1112 花序二樓花藝課（BB-C 驗收：「報名、扣錢、一週一次、沒錢、打烊；三門課各一次＋第二次只出旁白；七位送花交往版／朋友版各一（{物} 換對）；
  學姊 s1→約一起上課→s2（三個描述旗標各一）→過五天 s3；AA_820 定稿 58c5c2c1b 對字」）。判定歸 BB；Playwright 手機橫向觸控（SwiftShader／PC GPU）≠ iPhone。
受測：LAWWW 正式 bd8643003a（含 60f7a6b3eb＋dd202ff058，merge 4263eec337）；舊版對照 9dedfa2088（60f7a6b3eb 的上一個：沒有 src/flower_class3d.js、src/data/flower_class.js；D34，預期每個 case 第一步就 FAIL）。
期望值出處（逐字）：AA_820 定稿＝企劃線 58c5c2c1b 的 docs/story_planning/AA_820_flower_class.json（git show；淺層 clone 讀不到＝複本 fixtures/aa820_flower_class_58c5c2c1b.json，
  sha1 f191278497846159036d04601ac7b4beafb18275＝git show 的位元組；兩個都讀不到才改比頁面上的 FLOWER_CLASS，log 寫明）。遊戲匯入的是 AA_820@65e38a5de，和 58c5c2c1b 那一份逐字相同（git diff 空的）。
  稿沒有寫、照遊戲原本規則的（來源寫在檢查那一行）：選單價錢格式「課名　900 元」、「送她禮物…」（GIFTH.TALK）、「你把○○遞給○○。」（gifthol3d.js hand）、
  「（動作）話」拆成旁白＋話、字不改（gifthol3d.js S.play；flower_class3d.js play）、營業時間 10:00～21:00（FNS.hours＝AA_792 staff.hours）、一起上課付兩份（AA_820 together.cond）。
對照的程式：src/flower_class3d.js（S.signup：anyFits→weekUsed→staff_ask→這個月的課→fits→一起上課的第二層→S.take：fits／week／錢不夠／包包滿→扣錢→fade→solo／together→advance→成品進包包；
  S.react：學姊交往中第一次＝s1、其他照 give；S.sisS3 走 SISY23.preTalk 和 STORY.PRE_TALK）、src/gifthol3d.js（hand 對 made 的成品呼叫 S.MADE）、src/story3d.js（talkCharacter → offerInvite 的 TALK_OPTS）。
CASES（每一個都從 day46 存檔起：2025-11-01 週六，存檔本來就和可昕交往中；捷徑一律 R.setup 印【前置／捷徑】）：
  COURSES 第 1 週：讀檔一樓門口 13:00 → 搖桿上樓 → 走到「報名花藝課」→ 花藝師 staff_ask → 「這個月的課」三門（課名　價錢 元）→ 照字選「基礎花束」→（有可昕＝第二層照字選「報名花藝課」自己上）
          → 第一次上課＋有交往對象＝first_class 接在第一句旁白後面（照字選 DESC 第一個）→ 其餘 lines；扣 900、advance 2、成品進包包；同一天再按＝week_limit。
          第 2、3 週：【前置／捷徑】存檔快照、日期 +7（同一個週六 13:00、二樓樓梯口）→ 花型設計、季節花藝各一次（整段 lines、沒有 first_class）。第 4 週：基礎花束第二次＝只有 again 那一句旁白。
  POOR    【前置】錢 500 → 基礎花束 → no_money 旁白、不扣、不轉暗、包包不變。
  CLOSED  20:00＝三門都排不進去 → 一按就 closed 旁白（沒有 staff_ask）；18:35 →「這個月的課」季節花藝（2.5 小時）灰掉、另兩門沒灰（選單出來那一刻的時間算）→ 照字點灰掉的季節花藝 → closed 旁白、不扣。
  SIS     學姊三場（DESC 第一個）：【前置】學姊交往中（dating_heroine_05＋romance dating）、可昕改成沒交往（只剩一個交往對象）
          A 二樓自己上基礎花束（first_class 照字選 DESC → G.flags.FC_DESC_*）→ B【前置／捷徑】讀檔到她照作息在 3D 的時段 → 走到她旁邊說話 →「送她禮物…」→ 照字選成品 → s1（{物}＝成品名）、選項 fx、FC_SIS_S1
          → C【前置／捷徑】下一個禮拜（和 A 不同週）、她那時候沒課（INV.busyAt）、二樓 → 報名 → 照字選「約她一起上花藝課」（hint＝她的名字）→ s2（只有 FC_DESC_* 那兩句 if）、扣兩份、包包不變、FC_SIS_S2
          → D【前置／捷徑】s1 那天 +5 天以後她在 3D 的時段 → 說話 → s3、FC_SIS_S3。
  S2      另外兩個描述旗標（S2DESCS，預設 busy,none）：【前置】學姊交往中、FC_SIS_S1、FC_DESC_<那一個>、上過一次課 → 二樓報名 → 約她一起上 → s2 只出那兩句 if。
  GIFT    七位（WHO）× 交往版／朋友版（VERS）：【前置】包包放一樣成品（三樣輪流，{物} 換對）、交往版＝只和她交往（學姊另外 FC_SIS_S1＝已經演過 s1，才是 give.dating 那三句）、
          朋友版＝不交往、沒見過的補 FIRST_MET＋熟悉 45 信任 30（GIFTH.canGet 要「不是陌生人」）→ 讀檔到她照作息在 3D 的時段（掃 14 天；避開讀書區〔GM.say 會加小聲〕、上課、上班；
          掃不到＝【捷徑】GAME.spawnCharacter 放在花序一樓門口前面——可昕這 14 天都不在 3D）→ 走到她旁邊說話 →「送她禮物…」→ 照字選成品 →「你把○○遞給○○。」＋give.<她>.<版> 逐字。
判定（每一段對話）：遊戲說的每一句（GAME.say 的說話的人＋字）＝AA_820 照順序展開的那一串，逐句比；不一樣就印「第 n 句：稿／遊戲」兩邊的字；畫面上對話框（GAME.D.full）也逐句比一次；
  選單的字＝稿的選項字（{物} 換成品名）；扣的錢＝稿的價錢（一起上＝兩份）；advance＝稿的時數；成品＝稿的 makes；旗標；選項 fx＝稿（SOCIAL.applyFx 收到的）。
  每一 case 結束：沒有 JS 例外、GAME.walkFallbacks 沒增加、沒有對話框／選單開著；每一個等待迴圈 60 秒沒進展就記狀態＋截圖停下來。
走的路（每一行 log 有寫）：一樓門口搖桿上樓（COURSES 第 1 週）／讀檔在二樓樓梯口；她照作息在 3D（掃到的區域）／GAME.spawnCharacter；說話＝走到她旁邊按「和○○說話」。
CC_02 清單 2026-11-12：1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7✓ 8✓ 9n/a（只存失敗、卡住時的畫面給人看，不用截圖判斷） 10✓ 11✓ 12✓ 13✓
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=new|old [CASES=COURSES,POOR,CLOSED,SIS,S2,GIFT] [WHO=heroine_01,…] [VERS=dating,friend] [DESC=direct|busy|none] [S2DESCS=busy,none]
      [PICK=0|1（s1／s2／s3 的選項照稿第幾個）] [GIFTWHERE=scan|spawn] python3 cc_flower_class_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, copy, re, subprocess
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL0, OUT = sys.argv[1], sys.argv[2]
URL = URL0 if 'tapguard' in URL0 else URL0 + ('&' if '?' in URL0 else '?') + 'tapguard'   # CC_02 乙 4：和真的手機一樣擋「選單剛出來那一下」的誤點（log 標【前置】）
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
CASES = [c.strip() for c in (os.environ.get('CASES') or 'COURSES,POOR,CLOSED,SIS,S2,GIFT').split(',') if c.strip()]
PEOPLE = ['heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin']
WHO = [w for w in (os.environ.get('WHO') or ','.join(PEOPLE)).split(',') if w]
VERS = [v for v in (os.environ.get('VERS') or 'dating,friend').split(',') if v]
DESC = os.environ.get('DESC') or 'direct'
S2DESCS = [d for d in (os.environ.get('S2DESCS') or 'busy,none').split(',') if d]
PICK = int(os.environ.get('PICK') or '0')
GIFTWHERE = os.environ.get('GIFTWHERE') or 'scan'
SIS = 'heroine_05'
R = L.Run('fclass_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
DOC_SHA, DOC_PATH = '58c5c2c1b', 'docs/story_planning/AA_820_flower_class.json'
DOC_FIX = os.path.join(HERE, 'fixtures', 'aa820_flower_class_58c5c2c1b.json')
STUCK_S = 60
LANDING = (4.15, -6.05)   # 二樓樓梯平台（src/data/flower_notes_layout.js landing x 3.4～4.9、z −6.8～−5.32；cc_fn_func_probe.py 同一點）
DOOR1F = (0.0, 5.6)       # 一樓門口裡面（cc_fn_func_probe.py「店裡門口」；layout spawn (0, 6.1)）
AVOID_ZONES = r'lib|classroom|putong'   # 讀書區（library、library_media、lawlib…）GM.say 會 LIBQ.whisper 加「（小聲）」＝字和稿不同；classroom／putong＝上課
PREF_ZONES = ['cafe', 'wancai', 'l118_dian', 'wenzhou', 'gongguan', 'campus']   # 小的區域先（走得近）
RESULT = {'tag': TAG, 'sha': SHA, 'url': URL, 'cases': {}}


# ---------------------------------------------------------------- 稿
def load_doc():
    """AA_820 定稿：git show 58c5c2c1b（這支探針所在的 repo、目前目錄）→ 複本 fixtures → None（CC_02 乙 7：讀不到要有退路、寫明）"""
    why = []
    for root in (REPO, os.getcwd()):
        try:
            b = subprocess.check_output(['git', '-C', root, 'show', DOC_SHA + ':' + DOC_PATH], stderr=subprocess.STDOUT, timeout=30)
            return json.loads(b.decode('utf-8')), 'git show %s:%s（%s）' % (DOC_SHA, DOC_PATH, root)
        except Exception as e:
            why.append('%s：%s' % (root, ((getattr(e, 'output', b'') or b'').decode('utf-8', 'replace').strip()[-100:] or repr(e)[:100])))
    try:
        return json.load(open(DOC_FIX, encoding='utf-8')), '複本 %s（git show 讀不到：%s）' % (os.path.relpath(DOC_FIX, HERE), '；'.join(why))
    except Exception as e:
        why.append('複本：%r' % e)
    return None, '；'.join(why)


DOC, DOC_HOW = load_doc()
STAFF = '花藝師'   # AA_820 classes.*.lines 的 who（rules：「花藝師是店員」）


def sub(t, thing):
    return str(t).replace('{物}', thing or '')


def split_line(spk, s):
    """遊戲原本的規則（gifthol3d.js S.play；flower_class3d.js play）：「（動作）話」拆成旁白＋那個人說的（字不改）；整句（…）＝旁白"""
    m = re.match(r'^(（[^）]*）)(.+)$', s)
    if spk and m: return [[None, m.group(1)], [spk, m.group(2)]]
    if not spk or s.startswith('（'): return [[None, s]]
    return [[spk, s]]


def flat(lines, who=None, narr=False, thing=None, flags=None):
    """稿的一段 → 會演出來的 [[說話的人(charId／「花藝師」／None＝旁白), 字], …]（照 flower_class3d.js play：字串＋narr＝整句旁白；{who,t[,if]}＝那個人說、if 的旗標沒有就不演）"""
    out = []; flags = flags or {}
    for e in ([lines] if isinstance(lines, (str, dict)) else (lines or [])):
        if isinstance(e, str):
            s = sub(e, thing)
            out += [[None, s]] if (narr or not who) else split_line(who, s)
        elif isinstance(e, dict) and e.get('t'):
            if e.get('if') and not flags.get(e['if']): continue
            out += split_line(e.get('who'), sub(e['t'], thing))
    return out


def opt_texts(choices, thing=None):
    return [sub(c.get('t'), thing) for c in choices or []]


# ---------------------------------------------------------------- 頁面
HOOK_JS = r"""(()=>{ window.__FC=window.__FC||[]; if(GAME.__fch) return 'already'; GAME.__fch=1;
  const P=o=>{ try{ o.h=+(+GAME.G.hour).toFixed(3); o.zn=GAME.G.zone; window.__FC.push(o); }catch(e){} };
  const s0=GAME.say; GAME.say=function(a,b){ P({k:'say', who:a?(a.name||(typeof a==='string'?a:'')):null, cid:(a&&a.charId)||null, t:String(b==null?'':b)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o,opt){ let t=[],dm=[]; try{ t=(o||[]).map(x=>x&&x.t); dm=(o||[]).map(x=>!!(x&&x.dim)); }catch(e){} P({k:'choose', opts:t, dim:dm, note:(opt&&opt.note)||null});
    const r=c0.apply(this,arguments); try{ Promise.resolve(r).then(i=>P({k:'picked', i, t:t[i]})); }catch(e){} return r; };
  const f0=GAME.fade; if(f0) GAME.fade=function(on){ P({k:'fade', on:!!on}); return f0.apply(this,arguments); };
  const a0=GAME.advance; if(a0) GAME.advance=function(h){ P({k:'advance', v:h}); return a0.apply(this,arguments); };
  const m0=GAME.money; if(m0) GAME.money=function(n){ P({k:'money', v:n}); return m0.apply(this,arguments); };
  const t0=GAME.toast; if(t0) GAME.toast=function(t){ P({k:'toast', t:String(t)}); return t0.apply(this,arguments); };
  if(typeof SOCIAL!=='undefined'&&SOCIAL.applyFx){ const x0=SOCIAL.applyFx; SOCIAL.applyFx=function(G,id,fx){ P({k:'fx', id, fx:fx==null?null:JSON.parse(JSON.stringify(fx))}); return x0.apply(this,arguments); }; }
  return 'hooked'; })()"""
RESET_JS = "(()=>{ window.__FC=[]; return true; })()"
LOG_JS = "(()=>(window.__FC||[]).slice())()"
LOGN_JS = "(()=>(window.__FC||[]).length)()"
DLG_JS = r"""(()=>{ const D=GAME.D, n=document.getElementById('dlgName'), t=document.getElementById('dlgText'); const on=!!(D&&D.active);
  const who=(n&&n.style.display!=='none'&&getComputedStyle(n).display!=='none')?(n.textContent||'').trim():''; return {on, who, t:on?String(D.full!=null?D.full:((t&&t.textContent)||'')).trim():''}; })()"""
CH_JS = r"""(()=>{ const box=document.getElementById('choices'); if(!box||box.classList.contains('hide')) return null; const bs=[...box.querySelectorAll('button')]; if(!bs.length) return null;
  return {note:[...box.querySelectorAll('.chNote')].map(e=>(e.textContent||'').trim()), opts:bs.map(b=>{ const c=b.cloneNode(true), h=c.querySelector('.hint'), hint=h?(h.textContent||'').trim():''; if(h) h.remove(); return {t:(c.textContent||'').trim(), hint, dim:b.classList.contains('dim')}; })}; })()"""
CH_AT = r"""(k=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b[k]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {xy:[r.left+r.width/2,r.top+r.height/2], top:!!t&&(t===e||e.contains(t)), cover:t?((t.id||t.tagName)+(typeof t.className==='string'&&t.className?'.'+t.className.split(' ')[0]:'')):null}; })"""
DLG_TOP_JS = r"""(()=>{ const e=document.getElementById('dlg'); if(!e||e.classList.contains('hide')) return {ok:false, why:'沒有對話框'}; const r=e.getBoundingClientRect(); const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {ok:!!t&&(t===e||e.contains(t)), cover:t?((t.id||t.tagName)+(typeof t.className==='string'&&t.className?'.'+t.className.split(' ')[0]:'')):null}; })()"""
BTN_TOP_JS = r"""(()=>{ const e=document.getElementById('interact'); if(!e||e.classList.contains('hide')) return {ok:false,why:'沒有互動鍵'}; const r=e.getBoundingClientRect(); if(!r.width) return {ok:false,why:'互動鍵大小 0'};
  const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {ok:!!h&&(h===e||e.contains(h)), top:h?(h.id||h.tagName):null, t:(e.textContent||'').trim()}; })()"""
PHONE_OPEN_JS = "(()=>{ const e=document.getElementById('phone'); return !!e&&!e.classList.contains('hide'); })()"
GSTATE_JS = r"""(()=>{ const G=GAME.G, f=G.flags||{}, GH=typeof GIFTH!=='undefined'?GIFTH:null; const fc=f.FC&&typeof f.FC==='object'?JSON.parse(JSON.stringify(f.FC)):null;
  return {day:G.day, hour:+(+G.hour).toFixed(3), zone:G.zone, money:G.money|0, bag:GH?GH.bag(G).map(b=>b.id):(((f.GIFTH||{}).bag)||[]).map(b=>b&&b.id), fc,
    fl:Object.fromEntries(Object.keys(f).filter(k=>/^FC_/.test(k)).map(k=>[k,f[k]])), fb:GAME.walkFallbacks||0, dkey:(typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).key:null),
    wd:(typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:null)}; })()"""
PAGE_JS = r"""(()=>({fc:typeof FLOWER_CLASS!=='undefined'?FLOWER_CLASS:null, fclass:typeof FCLASS!=='undefined', hours:(typeof FNS!=='undefined'&&FNS.hours)?FNS.hours():null,
  talk:(typeof GIFTH!=='undefined'&&GIFTH.TALK)||null, signupIt:(GAME.E.interactables||[]).filter(i=>i.fcSignup).map(i=>({x:i.x,z:i.z,lv:i.lv|0,label:i.label}))}))()"""
NAME_JS = "(id=>({disp:SOCIAL.displayName(id), npc:SOCIAL.npcName?SOCIAL.npcName(id):null}))"
NPC_JS = r"""(id=>{ const E=GAME.E, AL={heroine_01:'an',heroine_05:'sis'};
  let n=(E.npcs||[]).find(q=>q&&q.charId===id&&q.talk&&!q.hidden&&q.obj)||null; if(!n&&GAME.npc&&GAME.npc[id]&&GAME.npc[id].talk) n=GAME.npc[id];
  if(!n&&GAME.npc&&AL[id]&&GAME.npc[AL[id]]&&GAME.npc[AL[id]].talk) n=GAME.npc[AL[id]]; if(!n||!n.obj) return null; const p=n.obj.position;
  return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv:n.lv|0, label:n.talkLabel||null, name:n.name||'', seat:!!n.seat}; })"""
PATH_AHEAD_JS = r"""(([tx,tz,tlv,ahead])=>{ const E=GAME.E,P=E.player,o=P.obj.position,plv=P.lv|0; const glv=(tlv===null||tlv===undefined)?plv:tlv; if(!E.pathTo) return null; const p=E.pathTo(o.x,o.z,plv,tx,tz,glv); if(!p||!p.length) return null;
  let ax=o.x,az=o.z,acc=0; for(const q of p){ const qx=Array.isArray(q)?q[0]:q.x, qz=Array.isArray(q)?q[1]:q.z; const Ln=Math.hypot(qx-ax,qz-az); if(acc+Ln>=ahead){ const f=(ahead-acc)/Math.max(Ln,1e-6); return {x:ax+(qx-ax)*f,z:az+(qz-az)*f,n:p.length}; } acc+=Ln; ax=qx; az=qz; } return {x:ax,z:az,n:p.length}; })"""
PATH_DIAG_JS = r"""(a=>{ const E=GAME.E,P=E.player,o=P.obj.position; const r=E.pathTo?E.pathTo(o.x,o.z,P.lv|0,a[0],a[1],(a[2]==null?(P.lv|0):a[2])):null;
  return {from:[+o.x.toFixed(2),+o.z.toFixed(2),P.lv|0], n:r?r.length:null, standTarget:E.canStand?!!E.canStand(a[0],a[1],0.3,(a[2]==null?(P.lv|0):a[2])):null, standHere:E.canStand?!!E.canStand(o.x,o.z,0.3,P.lv|0):null}; })"""
SNAP_JS = "(()=>JSON.parse(JSON.stringify(GAME.snapshot())))()"
WD_JS = "(d=>CALENDAR.dateOf(d).wd%7)"
# 掃：她照作息在 3D 的時段（STORY.whereIs；同 cc_x324_ladder_probe.py 的 SCAN_JS）——只算，算完把日期時間放回去。被排掉的原因逐條計數（CC_02 乙 2）
SCAN_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday}; const why={}, out=[], bad=new RegExp(a.avoid); const W=k=>{ why[k]=(why[k]||0)+1; };
  try{ for(let d=a.d0; d<a.d0+a.days; d++){ for(const hr of a.hours){ G.day=d; G.hour=hr; G.weekday=CALENDAR.dateOf(d).wd%7; let w=null;
        try{ w=STORY.whereIs(GAME,a.id); }catch(e){ W('whereIs 例外'); continue; }
        if(!w||!w.zone){ W('不在 3D'); continue; } if(w.away){ W('不在臺北／away'); continue; } if(bad.test(w.zone)){ W('避開的區域 '+w.zone); continue; }
        if(/上課|上班|打工/.test(w.act||'')){ W('上課／上班 '+w.zone); continue; } if(typeof GIFTH!=='undefined'&&GIFTH.holOf&&GIFTH.holOf(a.id,d)){ W('她的送禮節日'); continue; }
        G.hour=hr+0.6; let w2=null; try{ w2=STORY.whereIs(GAME,a.id); }catch(e){} if(!w2||w2.zone!==w.zone){ W('半小時內就離開'); continue; }
        out.push({d, dkey:CALENDAR.dateOf(d).key, wd:CALENDAR.dateOf(d).wd%7, hr, zone:w.zone, act:w.act||''}); } } }
  finally{ Object.assign(G,keep); }
  const pr=z=>{ const i=a.pref.indexOf(z); return i<0?99:i; }; out.sort((x,y)=>pr(x.zone)-pr(y.zone)||x.d-y.d||x.hr-y.hr);
  const pick=[], zs={}; for(const c of out){ if((zs[c.zone]||0)>=2) continue; zs[c.zone]=(zs[c.zone]||0)+1; pick.push(c); if(pick.length>=4) break; }
  return {cands:pick, n:out.length, why}; })"""
# 一起上課的時段：她在臺北（STORY.presence）、那段時間沒課沒班（INV.busyAt）、下課不超過打烊（FNS.hours）、和 A 不同週（週一起算，同 flower_class3d.js weekOf 的定義：CALENDAR wd 1＝週一）——
#   用的是遊戲的作息資料，不是被測的 FCLASS.canTogether（CC_02 乙 4：判準不依賴被測的程式）
FREE_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday}, why={}, W=k=>{ why[k]=(why[k]||0)+1; }; const wk=d=>d-(((CALENDAR.dateOf(d).wd|0)+6)%7); const close=(FNS.hours()||[10,21])[1];
  try{ for(let d=a.d0; d<a.d0+a.days; d++){ if(a.notWeek!=null&&wk(d)===wk(a.notWeek)){ W('和上一次上課同一週'); continue; } for(const hr of a.hours){ G.day=d; G.hour=hr; G.weekday=CALENDAR.dateOf(d).wd%7;
        if(hr+a.len>close-0.25){ W('下課太接近打烊'); continue; } const p=STORY.presence?STORY.presence(a.id,G):{here:true}; if(p&&p.here===false){ W('不在臺北'); continue; }
        let b=false; try{ b=!!(INV.busyAt&&INV.busyAt(G,a.id,d,hr,a.len+0.5)); }catch(e){ W('busyAt 例外'); continue; } if(b){ W('她那時候有課／班'); continue; }
        Object.assign(G,keep); return {d, dkey:CALENDAR.dateOf(d).key, wd:CALENDAR.dateOf(d).wd%7, hr, why}; } } }
  finally{ Object.assign(G,keep); } return {none:true, why}; })"""


def day46():
    s = json.load(open(SAVE, encoding='utf-8')); return copy.deepcopy(dict(s.get('G', s)))


def set_dating(st, only):
    """【前置】只和 only 交往（None＝誰都不交往）：dating_<她> 旗標＋romance.<她>.status（flower_class3d.js dating() 兩個都看）"""
    fl = st.setdefault('flags', {}); rom = fl.setdefault('romance', {})
    for k in [k for k in list(fl.keys()) if k.startswith('dating_')]: fl.pop(k, None)
    for pid, r in rom.items():
        if isinstance(r, dict) and r.get('status') == 'dating': r['status'] = 'none'
    if only:
        fl['dating_' + only] = True
        r = rom.get(only) if isinstance(rom.get(only), dict) else {}
        r.update({'status': 'dating', 'since': r.get('since') or 'Y1S1', 'knows': r.get('knows') or [], 'suspicion': r.get('suspicion') or 0, 'history': r.get('history') or []}); rom[only] = r
    return st


def partners_of(st):
    fl = st.get('flags') or {}; out = {k[7:] for k, v in fl.items() if k.startswith('dating_') and v is True}
    for pid, r in (fl.get('romance') or {}).items():
        if isinstance(r, dict) and r.get('status') == 'dating': out.add(pid)
    return sorted(out)


async def load(pg, cdp, st, tag, why):
    st = copy.deepcopy(st); st['invites'] = []
    try: await L.load_state(pg, st, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, st, quiet_events=True)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    R.setup('%s %s（GAME.applySave；關條件事件 EVENTS.onEnter／tick、手機自動打開——這支只測花藝課；網址加 ?tapguard）' % (tag, why))
    pre = await drive(pg, cdp, tag + ' 讀檔以後先有的', lambda ch, ctx: (None, ''), max_s=40)
    if pre['lines'] or pre['picks']: R.note('%s 讀檔以後先有的對話／選單（照字收掉，不算）：%s' % (tag, J({'lines': pre['lines'][-6:], 'picks': pre['picks']})))
    await pg.evaluate(HOOK_JS)
    return await pg.evaluate(GSTATE_JS)


async def snapshot_skip(pg, day=None, hour=None, zone=None, pos=None, mutate=None):
    """【前置／捷徑】存檔快照（GAME.snapshot）改日期／時間／區域／位置——等於存檔、過幾天再讀（錢、包包、旗標、FC 紀錄都留著）"""
    s = await pg.evaluate(SNAP_JS)
    if day is not None: s['day'] = day; s['weekday'] = await pg.evaluate(WD_JS, day)
    if hour is not None: s['hour'] = hour
    if zone is not None: s['zone'] = zone
    s['pos'] = pos
    if mutate: mutate(s)
    return s


def pos2f(x, z, yaw=math.pi):
    return {'x': x, 'z': z, 'yaw': yaw, 'lv': 1}


# ---------------------------------------------------------------- 點、等（CC_02 乙 4、10、13）
def fallback_pick(ch):
    """不認識的選單：照字選「算了／就這樣／先不用／離開」那一類；沒有就第一個沒灰的（記一行）"""
    o = ch['opts']
    for w in ('就這樣', '算了', '先不用', '不用了', '離開', '先這樣', '下次'):
        for i, x in enumerate(o):
            if x['t'].startswith(w): return i
    return next((i for i, x in enumerate(o) if not x['dim']), 0)


async def tap_choice(pg, cdp, k, tag):
    c = await pg.evaluate(CH_AT, k)
    if not c: return False
    if not c['top']:
        R.note('%s 選項 %d 的中心最上面是 %s，不是那個按鈕：先收手機／面板再按' % (tag, k, c['cover'])); await L.close_panels(pg, cdp); c = await pg.evaluate(CH_AT, k)
        if not c: return False
    await L.touch_tap(cdp, c['xy'][0], c['xy'][1]); return True


async def drive(pg, cdp, tag, policy, done=None, max_s=420, ctx=None):
    """一路像玩家一樣點：選單＝policy(選單, ctx) 回傳 (第幾個, 理由)；None＝不認識的選單（照字收掉，記下來）；對話框＝先確認最上面是對話框再點（逐句記畫面上的字）。
    選單出來先等 0.7 秒（?tapguard 擋 350 ms 內的點）。STUCK_S 秒都沒變＝停下來記狀態＋截圖（不點到逾時）。回傳 {lines, picks, unknown, stuck, done, secs}"""
    ctx = ctx if ctx is not None else {}
    t0 = time.time(); last = time.time(); sig = None; lines = []; picks = []; unknown = []; stuck = False; fin = False; seen_menu = None; idle = 0; lastd = None
    while time.time() - t0 < max_s:
        if await pg.evaluate(PHONE_OPEN_JS): await L.close_panels(pg, cdp); R.note('%s 手機自己打開了：收起來' % tag)
        ch = await pg.evaluate(CH_JS); d = await pg.evaluate(DLG_JS); n = await pg.evaluate(LOGN_JS); s = await L.state(pg)
        key = (d['t'], J(ch), n, s['busy'], s['zone'])
        if key != sig: sig = key; last = time.time()
        elif time.time() - last > STUCK_S:
            stuck = True; R.note('%s %d 秒沒有進展：%s；對話框 %s；選單 %s' % (tag, STUCK_S, J({k: s[k] for k in ('zone', 'x', 'z', 'lv', 'busy', 'dlg', 'choices', 'interact', 'hour', 'paused')}), J(d), J(ch)))
            try: await D.shot(pg, 'fclass_stuck_%s_%d' % (TAG, int(time.time())), judge_black=False)
            except Exception: pass
            break
        if ch and ch['opts']:
            if seen_menu is None: seen_menu = time.time()
            if time.time() - seen_menu < 0.7: await pg.wait_for_timeout(300); continue
            k, why = policy(ch, ctx)
            if k is None:
                k = fallback_pick(ch); unknown.append([x['t'] for x in ch['opts']]); why = '不認識的選單：照字選「%s」' % ch['opts'][k]['t']
            picks.append({'opts': [x['t'] for x in ch['opts']], 'hints': [x['hint'] for x in ch['opts']], 'dim': [x['dim'] for x in ch['opts']], 'note': ch['note'], 'pick': k, 'why': why})
            await tap_choice(pg, cdp, k, tag); seen_menu = None; idle = 0; await pg.wait_for_timeout(900); continue
        seen_menu = None
        if d['on']:
            cur = (d['who'], d['t'], n)
            if cur != lastd: lines.append([d['who'], d['t']]); lastd = cur
            top = await pg.evaluate(DLG_TOP_JS)
            if not top['ok']: R.note('%s 對話框最上面是 %s：先收起來' % (tag, top.get('cover'))); await L.close_panels(pg, cdp)
            await L.tap(pg, cdp, '#dlg'); idle = 0; await pg.wait_for_timeout(450); continue
        if not s['busy'] and (done is None or await done()):
            idle += 1
            if idle >= 3: fin = True; break
        else: idle = 0
        await pg.wait_for_timeout(500)
    return {'lines': lines, 'picks': picks, 'unknown': unknown, 'stuck': stuck, 'done': fin, 'secs': round(time.time() - t0, 1)}


# ---------------------------------------------------------------- 走（CC_02 乙 5、13）
async def joy_walk(pg, cdp, tag, target, near, btn=None, max_s=150):
    """搖桿走：每一推朝 E.pathTo 前方 1.5 m（玩家看著路推；多樓層照 pathTo 一層一層走）；target()＝(x, z, lv)（她會走動，每一推重讀）。
    btn(互動鍵的字)→True＝到了（看互動鍵、不看座標）；途中出現對話或選單就停下來回報（不盲點）；20 秒沒前進 0.3 m＝停、附 pathTo／canStand"""
    t0 = time.time(); pushes = 0; prog = (time.time(), None); tg = None
    while time.time() - t0 < max_s:
        s = await L.state(pg); tg = await target()
        if tg is None: await pg.wait_for_timeout(600); continue
        tx, tz, tlv = tg
        if btn and btn(s['interact']) and not s['dlg'] and not s['choices']: return {'ok': True, 't': round(time.time() - t0, 1), 'pushes': pushes, 'end': s, 'by': '互動鍵＝' + s['interact']}
        if s['dlg'] or s['choices']: return {'ok': False, 't': round(time.time() - t0, 1), 'pushes': pushes, 'end': s, 'why': '途中出現%s' % ('對話' if s['dlg'] else '選單'), 'event': await pg.evaluate(DLG_JS)}
        dist = math.hypot(tx - s['x'], tz - s['z'])
        if not btn and dist <= near and (tlv is None or s['lv'] == tlv): return {'ok': True, 't': round(time.time() - t0, 1), 'pushes': pushes, 'end': s}
        if prog[1] is None or math.hypot(s['x'] - prog[1][0], s['z'] - prog[1][1]) > 0.3: prog = (time.time(), (s['x'], s['z']))
        elif time.time() - prog[0] > 20: break
        ah = await pg.evaluate(PATH_AHEAD_JS, [tx, tz, tlv, 1.5]); ax, az = (ah['x'], ah['z']) if ah else (tx, tz)
        yaw = s['camYaw']; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx
        da = max(math.hypot(ax - s['x'], az - s['z']), 0.01); ux, uz = (ax - s['x']) / da, (az - s['z']) / da
        sx, sy = ux * rx + uz * rz, -(ux * fx + uz * fz); m = math.hypot(sx, sy) or 1
        pm = 600 if dist > 2.5 else max(250, int(600 * dist / 2.5)); mag = 45 if dist > 2.5 else max(16, 45 * dist / 2.5)   # 近目標推輕、推短（CC_02 乙 5：PC 上會在目標兩邊來回晃）
        await L.joystick(pg, cdp, sx / m * mag, sy / m * mag, pm); pushes += 1
    s = await L.state(pg); pd = await pg.evaluate(PATH_DIAG_JS, list(tg) if tg else [0, 0, None])
    R.note('%s 走不到：停在 %s、互動鍵「%s」；E.pathTo 從這裡到目標 %s 點、目標站得住 %s、這裡站得住 %s' % (tag, pd['from'], s['interact'], pd['n'], pd['standTarget'], pd['standHere']))
    try: await D.shot(pg, 'fclass_walk_%s_%d' % (TAG, int(time.time())), judge_black=False)
    except Exception: pass
    return {'ok': False, 't': round(time.time() - t0, 1), 'pushes': pushes, 'end': s, 'why': '沒走到（20 秒沒前進或逾時）', 'diag': pd}


async def walk_to_signup(pg, cdp, tag, from_door):
    lab = DOC['signup']['button']
    if from_door:   # 一樓門口 → 搖桿上樓（pathTo 帶上樓梯）→ 二樓平台
        r = await joy_walk(pg, cdp, tag + ' 上樓', lambda: _const(LANDING[0], LANDING[1], 1), 0.7, max_s=200)
        R.check('%s 搖桿從一樓門口走上二樓樓梯平台（lv %s、%s 秒、推 %d 次）' % (tag, r['end']['lv'], r['t'], r['pushes']), r['ok'] and r['end']['lv'] == 1, J({k: r.get(k) for k in ('why', 'event', 'diag')}))
        if not r['ok']: return False
    for k in range(2):
        r = await joy_walk(pg, cdp, tag + ' 走到報名', lambda: _const(0.3, -4.65, 1), 0.5, btn=lambda t: t.startswith(lab), max_s=120)   # 互動點 S.AT (0.3, −4.65) lv 1（flower_class3d.js）；看互動鍵的字
        if r['ok']: break
        if r.get('why', '').startswith('途中出現'):
            ev = await drive(pg, cdp, tag + ' 走路途中的劇情', lambda ch, c: (None, ''), max_s=90); R.note('%s 走路途中出現劇情（停下來照字處理，再走）：%s' % (tag, J({'lines': ev['lines'][-6:], 'picks': ev['picks']})))
    R.note('%s 走到報名：%s' % (tag, J({k: r.get(k) for k in ('ok', 't', 'pushes', 'by', 'why')})))
    return R.check('%s 走到示範長桌前面，互動鍵是稿的「%s」（走的路：%s）' % (tag, lab, '一樓門口搖桿上樓' if from_door else '讀檔在二樓樓梯口'), r['ok'], J(r.get('end') and {k: r['end'][k] for k in ('x', 'z', 'lv', 'interact')}))


async def _const_coro(x, z, lv):
    return (x, z, lv)


def _const(x, z, lv):
    return _const_coro(x, z, lv)


async def tap_interact(pg, cdp, tag, prefix):
    s = await L.state(pg)
    if not s['interact'].startswith(prefix): return R.check('%s 按之前互動鍵是「%s」' % (tag, prefix), False, s['interact'])
    b = await pg.evaluate(BTN_TOP_JS)
    if not b.get('ok'): R.note('%s 互動鍵最上面是 %s：先收面板' % (tag, J(b))); await L.close_panels(pg, cdp)
    await pg.evaluate(RESET_JS); await L.tap(pg, cdp, '#interact'); return True


# ---------------------------------------------------------------- 比對
def says_of(log, i0=0):
    return [[(e.get('cid') or e.get('who') or None), e.get('t')] for e in log[i0:] if e.get('k') == 'say']


def cmp_seq(tag, what, got, want, contiguous_at=None):
    """逐句比（說話的人＋字）；不一樣印第幾句、稿、遊戲兩邊。contiguous_at＝在 got 裡找 want[0] 開始的那一段（前後可以有別的劇情）"""
    g = got
    if contiguous_at:
        st = next((i for i in range(len(got)) if got[i] == want[0]), None) if want else 0
        if st is None:
            R.check('%s %s：遊戲說的話裡找得到稿的第一句 %s' % (tag, what, J(want[:1])), False, '遊戲：' + J(got[:12])); return False
        g = got[st:st + len(want)]
    bad = [(i, w, g[i] if i < len(g) else None) for i, w in enumerate(want) if i >= len(g) or g[i] != w]
    extra = g[len(want):] if not contiguous_at else []
    for i, w, x in bad[:4]: R.note('%s %s 第 %d 句不一樣：稿 %s／遊戲 %s' % (tag, what, i + 1, J(w), J(x)))
    if extra: R.note('%s %s 稿以外多出來的：%s' % (tag, what, J(extra[:4])))
    return R.check('%s %s：%d 句和 AA_820 逐字一樣（說話的人、字、順序）' % (tag, what, len(want)), not bad and not extra, J({'bad': len(bad), 'extra': len(extra)}))


def cmp_screen(tag, what, lines, want):
    """畫面上的對話框（GAME.D.full）逐句：稿的每一句依序都出現過（之間可以有別的）"""
    ts = [t for _, t in lines]; i = 0; miss = []
    for w in want:
        try: i = ts.index(w[1], i) + 1
        except ValueError: miss.append(w[1])
    return R.check('%s %s：畫面上的對話框依序出現稿的 %d 句' % (tag, what, len(want)), not miss, '沒看到：' + J(miss[:3]))


def menus(log, i0=0):
    return [e for e in log[i0:] if e.get('k') == 'choose']


async def end_checks(pg, tag, errs, e0, fb0):
    s = await L.state(pg); fb = await pg.evaluate("GAME.walkFallbacks||0")
    R.check('%s 結束：沒有對話框、選單開著' % tag, not s['dlg'] and not s['choices'], J({k: s[k] for k in ('dlg', 'choices', 'busy', 'zone')}))
    R.check('%s 結束：GAME.walkFallbacks 沒增加（%s → %s）' % (tag, fb0, fb), fb == fb0, '')
    R.check('%s 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))


# ---------------------------------------------------------------- 報名一次
async def signup(pg, cdp, tag, key, mode='solo', pid=None, desc=None, from_door=False, expect='done', partners=(), first=False, flags=None, dim_tap=False):
    """走到報名 → 按 → 照字選課（和第二層）→ 演完；回傳 {log, drive, g0, g1}。expect：done／again／poor／closed／closed_menu／week（只檢查這一種結果該有的）"""
    X = DOC; T = X['signup']; c = X['classes'][key]; cname = c['name']; copt = '%s　%d 元' % (cname, c['price'])   # 選單格式「課名　價錢 元」：flower_class3d.js signup 的 opts
    if not await walk_to_signup(pg, cdp, tag, from_door): return None
    g0 = await pg.evaluate(GSTATE_JS)
    who_name = (await pg.evaluate(NAME_JS, pid))['disp'] if pid else None
    fdesc = next((o for o in X['story']['first_class']['choice'] if o.get('set') == 'FC_DESC_' + (desc or DESC)), X['story']['first_class']['choice'][0])
    s2c = X['story']['sis']['s2']['choice']

    def pol(ch, ctx):
        ts = [o['t'] for o in ch['opts']]
        if copt in ts or (ch['note'] and ch['note'][0] == T['menu_title']):
            if dim_tap:
                k = next((i for i, o in enumerate(ch['opts']) if o['t'] == copt), None); return (k, '照字點「%s」（灰掉的那一個）' % copt) if k is not None else (None, '')
            k = next((i for i, o in enumerate(ch['opts']) if o['t'] == copt), None); return (k, '照字選課「%s」' % copt) if k is not None else (None, '')
        if T['button'] in ts and '算了' in ts:
            if mode == 'together':
                k = next((i for i, o in enumerate(ch['opts']) if o['t'] == X['together']['invite_button'] and o['hint'] == who_name), None)
                return (k, '照字選「%s」（hint %s）' % (X['together']['invite_button'], who_name)) if k is not None else (None, '')
            return ts.index(T['button']), '照字選「%s」（自己上）' % T['button']
        if ts == opt_texts(X['story']['first_class']['choice']): return ts.index(fdesc['t']), 'first_class 照字選「%s」' % fdesc['t']
        if ts == opt_texts(s2c): return PICK % len(ts), 's2 照字選稿第 %d 個' % (PICK % len(ts) + 1)
        tc = (X['together'].get(pid) or {}).get('choice') if pid else None
        if tc and ts == opt_texts(tc): return PICK % len(ts), 'together 照字選稿第 %d 個' % (PICK % len(ts) + 1)
        return None, ''
    if not await tap_interact(pg, cdp, tag, T['button']): return None
    dr = await drive(pg, cdp, tag, pol, max_s=600)
    log = await pg.evaluate(LOG_JS); g1 = await pg.evaluate(GSTATE_JS)
    R.note('%s 選單：%s；不認識的選單 %s；%s 秒' % (tag, J([{'opts': p['opts'], 'hint': p['hints'], 'dim': p['dim'], 'note': p['note'], 'pick': p['pick']} for p in dr['picks']]), J(dr['unknown']), dr['secs']))
    R.note('%s 前後：%s → %s' % (tag, J({k: g0[k] for k in ('dkey', 'hour', 'money', 'bag', 'fc', 'fl')}), J({k: g1[k] for k in ('hour', 'money', 'bag', 'fc', 'fl')})))
    R.check('%s 流程走完（沒有 %d 秒沒進展）' % (tag, STUCK_S), dr['done'] and not dr['stuck'], J({k: dr[k] for k in ('done', 'stuck', 'secs')}))
    R.check('%s 沒有不認識的選單' % tag, not dr['unknown'], J(dr['unknown']))
    got = says_of(log); ms = menus(log); money_ev = [e['v'] for e in log if e.get('k') == 'money']; adv = [e['v'] for e in log if e.get('k') == 'advance']; fades = [e['on'] for e in log if e.get('k') == 'fade']
    if expect == 'closed':
        cmp_seq(tag, '打烊（closed，旁白）', got, [[None, T['closed']]])
        R.check('%s 沒有選單、沒扣錢、沒轉暗、時間沒往後撥' % tag, not ms and not money_ev and not fades and not adv and g1['money'] == g0['money'], J({'menus': len(ms), 'money': money_ev, 'fade': fades, 'adv': adv}))
        return {'log': log, 'drive': dr, 'g0': g0, 'g1': g1}
    if expect == 'week':
        cmp_seq(tag, '一個禮拜一次（week_limit，花藝師）', got, [[STAFF, T['week_limit']]])
        R.check('%s 沒有選單、沒扣錢、包包沒變' % tag, not ms and not money_ev and g1['money'] == g0['money'] and g1['bag'] == g0['bag'], J({'menus': len(ms), 'money': money_ev, 'bag': g1['bag']}))
        return {'log': log, 'drive': dr, 'g0': g0, 'g1': g1}
    m0 = ms[0] if ms else None
    want_opts = ['%s　%d 元' % (X['classes'][k]['name'], X['classes'][k]['price']) for k in X['classes']] + ['算了']
    R.check('%s 「%s」選單：標題＝稿 menu_title、三門課＝稿的課名＋價錢（「課名　價錢 元」）＋「算了」' % (tag, T['menu_title']), bool(m0) and m0['note'] == T['menu_title'] and m0['opts'] == want_opts, J(m0))
    p0 = dr['picks'][0] if dr['picks'] else None
    if p0: R.check('%s 畫面上選單的字＝遊戲傳給選單的字（%s）' % (tag, T['menu_title']), p0['opts'] == want_opts and p0['note'] == [T['menu_title']], J({'opts': p0['opts'], 'note': p0['note']}))
    if p0 and m0:   # 每一門的 hint＝稿 items[makes].name；灰掉＝那一刻的時間＋稿的時數超過打烊（FNS.hours，AA_792）
        close = (await pg.evaluate(PAGE_JS))['hours'] or [10, 21]
        exp_dim = [m0['h'] + X['classes'][k]['hours'] > close[1] + 1e-6 for k in X['classes']] + [False]
        R.check('%s 每一門的提示＝稿的成品名' % tag, p0['hints'][:3] == [X['items'][X['classes'][k]['makes']]['name'] for k in X['classes']], J(p0['hints']))
        R.check('%s 灰掉的課＝選單出來那一刻 %.2f 點＋稿的時數超過打烊 %s（%s）' % (tag, m0['h'], close[1], J(exp_dim)), p0['dim'] == exp_dim, J(p0['dim']))
    if expect == 'closed_menu':
        R.check('%s 前置：選單出來的時候季節花藝灰掉、另兩門沒灰（%.2f 點）' % (tag, m0['h'] if m0 else -1), bool(p0) and p0['dim'][:3] == [False, False, True], J(p0 and p0['dim']))
        cmp_seq(tag, '點灰掉的課＝打烊（staff_ask → closed）', got, [[STAFF, T['staff_ask']], [None, T['closed']]])
        R.check('%s 沒扣錢、沒轉暗、包包沒變' % tag, not money_ev and not fades and g1['money'] == g0['money'] and g1['bag'] == g0['bag'], J({'money': money_ev, 'fade': fades}))
        return {'log': log, 'drive': dr, 'g0': g0, 'g1': g1}
    price = c['price'] * (2 if mode == 'together' else 1)
    if expect == 'poor':
        cmp_seq(tag, '錢不夠（staff_ask → no_money 旁白）', got, [[STAFF, T['staff_ask']], [None, T['no_money']]])
        R.check('%s 錢不夠：不扣（%d → %d）、不轉暗、時間沒撥、包包沒變' % (tag, g0['money'], g1['money']), not money_ev and not fades and not adv and g1['money'] == g0['money'] and g1['bag'] == g0['bag'], J({'money': money_ev, 'fade': fades, 'adv': adv}))
        return {'log': log, 'drive': dr, 'g0': g0, 'g1': g1}
    # done／again：扣錢、轉暗、演、advance、成品
    if mode == 'together':
        want = [[STAFF, T['staff_ask']]]
        if pid == SIS and not (flags or {}).get('FC_SIS_S2'):
            sc = X['story']['sis']['s2']; pc = sc['choice'][PICK % len(sc['choice'])]
            want += flat(sc['lines'], narr=True, flags=flags) + flat(pc['re'], who=pid) + flat(sc['end'], narr=True)
            what = '學姊 s2（%s）' % ','.join(k for k in (flags or {}) if k.startswith('FC_DESC_'))
            ch_want = opt_texts(sc['choice']); fx_want = pc.get('fx')
        else:
            T2 = X['together'][pid]; pc = T2['choice'][PICK % len(T2['choice'])]
            want += flat(T2['lines'], narr=True) + flat(pc['re'], who=pid) + flat([T2['end']], narr=True); what = 'together.%s' % pid; ch_want = opt_texts(T2['choice']); fx_want = pc.get('fx')
        cmp_seq(tag, what, got, want); cmp_screen(tag, what, dr['lines'], want)
        R.check('%s %s 的選項字＝稿' % (tag, what), any(m['opts'] == ch_want for m in ms), J([m['opts'] for m in ms]))
        fxs = [e for e in log if e.get('k') == 'fx' and e.get('id') == pid]
        R.check('%s 選了稿第 %d 個，SOCIAL.applyFx 收到稿的 fx %s' % (tag, PICK % len(ch_want) + 1, J(fx_want)), any(e['fx'] == fx_want for e in fxs), J(fxs))
        R.check('%s 一起上課：扣兩份 %d 元（稿 together.cond「祐廷付兩份」）、包包沒變（稿：她也有一份了）' % (tag, price), money_ev == [-price] and g0['money'] - g1['money'] == price and g1['bag'] == g0['bag'], J({'money': money_ev, 'diff': g0['money'] - g1['money'], 'bag': g1['bag']}))
    else:
        if expect == 'again':
            want = [[STAFF, T['staff_ask']], [None, c['again']]]; what = '%s 第二次（只有 again 旁白）' % cname
            inside = []; on = False
            for e in log:
                if e.get('k') == 'fade': on = e['on']; continue
                if on and e.get('k') == 'say': inside.append(e)
            R.check('%s 轉暗那一段只有一句、是旁白（沒有說話的人）、字＝稿 again' % tag, len(inside) == 1 and not inside[0].get('who') and inside[0]['t'] == c['again'], J(inside))
        else:
            fc_on = bool(first and partners)
            want = [[STAFF, T['staff_ask']]] + flat([c['lines'][0]], narr=True)
            if fc_on:
                F = X['story']['first_class']; want += flat(F['lines'], narr=True) + flat(fdesc['re'], who=STAFF)
            want += flat(c['lines'][1:], narr=True)
            what = '%s（%s）' % (cname, '第一次上課＋有交往對象 %s：first_class 接在第一句旁白後面' % ','.join(partners) if fc_on else '整段 lines、沒有 first_class')
            if fc_on:
                R.check('%s first_class 的選項字＝稿（三個）' % tag, any(m['opts'] == opt_texts(X['story']['first_class']['choice']) for m in ms), J([m['opts'] for m in ms]))
                R.check('%s 選了「%s」→ G.flags.%s' % (tag, fdesc['t'], fdesc['set']), g1['fl'].get(fdesc['set']) is True and not [k for k in g1['fl'] if k.startswith('FC_DESC_') and k != fdesc['set']], J(g1['fl']))
            else:
                R.check('%s 沒有 first_class 的選單' % tag, not any(m['opts'] == opt_texts(X['story']['first_class']['choice']) for m in ms), '')
        cmp_seq(tag, what, got, want); cmp_screen(tag, what, dr['lines'], want)
        made = c['makes']; nm = X['items'][made]['name']; toasts = [e['t'] for e in log if e.get('k') == 'toast']
        R.check('%s 扣 %d 元（稿 classes.%s.price；%d → %d）' % (tag, price, key, g0['money'], g1['money']), money_ev == [-price] and g0['money'] - g1['money'] == price, J(money_ev))
        R.check('%s 成品「%s」（稿 makes %s）進包包、toast 開頭是成品名' % (tag, nm, made), g1['bag'] == g0['bag'] + [made] and any(t.startswith(nm) for t in toasts), J({'bag': g1['bag'], 'toast': toasts}))
    R.check('%s 轉暗一次、亮回來一次' % tag, fades == [True, False], J(fades))
    R.check('%s 時間往後撥稿的時數 %s（GAME.advance 收到）' % (tag, c['hours']), adv == [c['hours']], J({'adv': adv, 'hour': [g0['hour'], g1['hour']]}))
    R.check('%s 記了這一天上過課（FC.last＝%s）' % (tag, g0['day']), (g1['fc'] or {}).get('last') == g0['day'], J(g1['fc']))
    return {'log': log, 'drive': dr, 'g0': g0, 'g1': g1}


async def present(pg, tag):
    """舊版／沒有花藝課：頁面上沒有 FLOWER_CLASS／FCLASS、二樓沒有報名的互動點"""
    p = await pg.evaluate(PAGE_JS)
    ok = R.check('%s 這一版有花藝課（FLOWER_CLASS、FCLASS、報名的互動點「%s」）' % (tag, DOC['signup']['button']), bool(p['fc']) and p['fclass'] and any(i['label'] == DOC['signup']['button'] for i in p['signupIt']),
                 J({'FLOWER_CLASS': bool(p['fc']), 'FCLASS': p['fclass'], 'it': p['signupIt']}))
    if not ok: R.note('%s 沒有花藝課：這個 case 後面不做（舊版對照預期 FAIL，D34）' % tag)
    return ok


# ---------------------------------------------------------------- CASES
async def case_courses(pg, cdp, errs):
    tag0 = '[COURSES]'; st = day46(); st.update({'zone': 'flower_notes', 'hour': 13.0, 'pos': {'x': DOOR1F[0], 'z': DOOR1F[1], 'yaw': math.pi, 'lv': 0}})
    parts = partners_of(st); e0 = len(errs)
    g = await load(pg, cdp, st, tag0 + ' 第 1 週', '【前置／捷徑】day46 存檔（交往中：%s）→ 花序一樓門口 13:00' % ','.join(parts))
    if not await present(pg, tag0): return
    fb0 = g['fb']; d0 = g['day']
    r = await signup(pg, cdp, tag0 + ' 第 1 週 基礎花束', 'basic', from_door=True, partners=parts, first=True)
    if r:
        await signup(pg, cdp, tag0 + ' 第 1 週 同一天再報名', 'basic', expect='week')
    for wk, key, exp in ((1, 'design', 'done'), (2, 'season', 'done'), (3, 'basic', 'again')):
        tag = '%s 第 %d 週 %s' % (tag0, wk + 1, DOC['classes'][key]['name'])
        s = await snapshot_skip(pg, day=d0 + 7 * wk, hour=13.0, zone='flower_notes', pos=pos2f(*LANDING))
        await load(pg, cdp, s, tag, '【前置／捷徑】存檔快照、日期改 +%d 天（第 %d 天，下一個週六）13:00、二樓樓梯口（錢、包包、FC 紀錄留著）' % (7 * wk, d0 + 7 * wk))
        await signup(pg, cdp, tag, key, expect=exp, partners=parts, first=False)
    await end_checks(pg, tag0, errs, e0, fb0)


async def case_poor(pg, cdp, errs):
    tag = '[POOR]'; st = day46(); st.update({'zone': 'flower_notes', 'hour': 13.0, 'pos': pos2f(*LANDING), 'money': 500}); e0 = len(errs)
    g = await load(pg, cdp, st, tag, '【前置／捷徑】day46 存檔、錢改 500（三門課最便宜 %d）→ 花序二樓樓梯口 13:00' % min(c['price'] for c in DOC['classes'].values()))
    if not await present(pg, tag): return
    await signup(pg, cdp, tag + ' 基礎花束', 'basic', expect='poor')
    await end_checks(pg, tag, errs, e0, g['fb'])


async def case_closed(pg, cdp, errs):
    tag = '[CLOSED]'; e0 = len(errs); fb0 = None
    for h, exp, why in ((20.0, 'closed', '三門課都排不進去（最短 2 小時、打烊 21:00）'), (18.583, 'closed_menu', '季節花藝 2.5 小時排不進去、另兩門 2 小時還可以（到 19:00 前；留 25 遊戲分鐘）')):
        st = day46(); st.update({'zone': 'flower_notes', 'hour': h, 'pos': pos2f(*LANDING)})
        g = await load(pg, cdp, st, '%s %05.2f' % (tag, h), '【前置／捷徑】day46 存檔 → 花序二樓樓梯口 %05.2f：%s' % (h, why))
        if fb0 is None: fb0 = g['fb']
        if not await present(pg, tag): return
        await signup(pg, cdp, '%s %05.2f' % (tag, h), 'season', expect=exp, dim_tap=(exp == 'closed_menu'))
    await end_checks(pg, tag, errs, e0, fb0)


async def place_her(pg, cdp, tag, pid, d0, days=14):
    """她照作息在 3D 的時段（掃 days 天、依序試前 3 個候選）→【前置／捷徑】讀檔過去（快照）；掃不到＝GAME.spawnCharacter 在花序一樓門口前面。回傳 {way, npc}"""
    sc = None
    if GIFTWHERE != 'spawn':
        sc = await pg.evaluate(SCAN_JS, {'id': pid, 'd0': d0, 'days': days, 'hours': [10, 11, 13, 14, 15, 16, 17, 19, 20], 'avoid': AVOID_ZONES, 'pref': PREF_ZONES})
        R.note('%s 掃她（%s）在 3D 的時段：候選 %s；共 %d 個；被排掉的 %s' % (tag, pid, J(sc['cands']), sc['n'], J(sc['why'])))
        for c in sc['cands'][:3]:   # CC_02 乙 3：依序試，跳過的寫原因
            s = await snapshot_skip(pg, day=c['d'], hour=c['hr'] + 0.05, zone=c['zone'], pos=None)
            await load(pg, cdp, s, tag, '【前置／捷徑】存檔快照 → %s（第 %d 天）%05.2f、%s（她的作息：%s）' % (c['dkey'], c['d'], c['hr'] + 0.05, c['zone'], c['act']))
            n = None
            for _ in range(12):
                n = await pg.evaluate(NPC_JS, pid)
                if n: break
                await pg.wait_for_timeout(1000)
            if n: return {'way': '她照作息在 %s（%s %s 點）' % (c['zone'], c['dkey'], c['hr']), 'npc': n, 'cand': c}
            R.note('%s 讀檔到 %s %s 點 %s，這一區沒有她（換下一個候選）' % (tag, c['dkey'], c['hr'], c['zone']))
    s = await snapshot_skip(pg, zone='flower_notes', hour=14.0, pos={'x': DOOR1F[0], 'z': DOOR1F[1], 'yaw': math.pi, 'lv': 0})
    await load(pg, cdp, s, tag, '【前置／捷徑】存檔快照 → 花序一樓門口 14:00（%s）' % ('GIFTWHERE=spawn' if GIFTWHERE == 'spawn' else '掃不到她在 3D 的時段'))
    sp = await pg.evaluate("(id=>{ const P=GAME.E.player.obj.position; const n=GAME.spawnCharacter(id,P.x,P.z-2.2,{yaw:0}); return n?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),label:n.talkLabel||null}:null; })", pid)
    R.setup('%s 【前置／捷徑】GAME.spawnCharacter(%s) 放在玩家前面 2.2 m：%s（不測她從哪裡走來）' % (tag, pid, J(sp)))
    await pg.wait_for_timeout(1500)
    return {'way': 'GAME.spawnCharacter（花序一樓門口）', 'npc': await pg.evaluate(NPC_JS, pid)}


async def talk_her(pg, cdp, tag, pid):
    """走到她旁邊（搖桿、她會走動就追；看互動鍵是不是「和她說話」）→ 確認互動鍵最上面 → 按"""
    async def tgt():
        n = await pg.evaluate(NPC_JS, pid); return (n['x'], n['z'], n['lv']) if n else None
    def is_her(t):
        return t.startswith('和') and t.endswith('說話')
    r = None
    for k in range(3):
        r = await joy_walk(pg, cdp, '%s 走到她旁邊（第 %d 次）' % (tag, k + 1), tgt, 0.9, btn=is_her, max_s=150)
        if r['ok']: break
        if r.get('why', '').startswith('途中出現'):
            ev = await drive(pg, cdp, tag + ' 走路途中的劇情', lambda ch, c: (None, ''), max_s=120); R.note('%s 走路途中出現劇情（停下來照字處理）：%s' % (tag, J({'lines': ev['lines'][-6:], 'picks': ev['picks']})))
    n = await pg.evaluate(NPC_JS, pid)
    if not R.check('%s 走到她旁邊，互動鍵是「和○○說話」（她 %s）' % (tag, J(n)), bool(r and r['ok']), J(r and {k: r.get(k) for k in ('why', 't', 'by', 'diag')})): return False
    return await tap_interact(pg, cdp, tag, '和')


async def give(pg, cdp, tag, pid, gid, ver, flags):
    """說話 →「送她禮物…」→ 照字選成品 → 比反應。ver＝dating／friend／s1"""
    X = DOC; it = X['items'][gid]; nm = it['name']; talk = (await pg.evaluate(PAGE_JS))['talk'] or '送她禮物…'
    ctx = {'offered': False, 'picked': False}
    s1 = X['story']['sis']['s1']; s3 = X['story']['sis']['s3']

    def pol(ch, c):
        ts = [o['t'] for o in ch['opts']]
        if not c['offered'] and talk in ts: c['offered'] = True; return ts.index(talk), '照字選「%s」' % talk
        if c['offered'] and not c['picked'] and nm in ts: c['picked'] = True; return ts.index(nm), '照字選成品「%s」' % nm
        if ts == opt_texts(s1['choice'], nm) or ts == opt_texts(s3['choice']): return PICK % len(ts), '學姊那一場照字選稿第 %d 個' % (PICK % len(ts) + 1)
        if '就這樣' in ts:
            if not c['offered']: c['no_offer'] = ts
            return ts.index('就這樣'), '照字選「就這樣」'
        return None, ''
    if not await talk_her(pg, cdp, tag, pid): return None
    g0 = await pg.evaluate(GSTATE_JS)
    dr = await drive(pg, cdp, tag, pol, max_s=420, ctx=ctx)
    log = await pg.evaluate(LOG_JS); g1 = await pg.evaluate(GSTATE_JS); nmj = await pg.evaluate(NAME_JS, pid)
    R.note('%s 說話：選單 %s；不認識的選單（照字收掉）%s；%s 秒' % (tag, J([{'opts': p['opts'], 'pick': p['pick'], 'why': p['why']} for p in dr['picks']]), J(dr['unknown']), dr['secs']))
    R.check('%s 說話的選單有「%s」（平常日子、包包有成品）' % (tag, talk), ctx['offered'], J(ctx.get('no_offer')))
    R.check('%s 「%s」之後的清單有成品「%s」（照字選）' % (tag, talk, nm), ctx['picked'], J([p['opts'] for p in dr['picks']]))
    R.check('%s 流程走完（沒有 %d 秒沒進展）' % (tag, STUCK_S), dr['done'] and not dr['stuck'], J({k: dr[k] for k in ('done', 'stuck', 'secs')}))
    pk = next((i for i, e in enumerate(log) if e.get('k') == 'picked' and e.get('t') == nm), None)
    got = says_of(log, pk + 1 if pk is not None else len(log))
    if ver == 's1':
        pc = s1['choice'][PICK % len(s1['choice'])]
        want = flat(s1['lines'], narr=True, thing=nm) + flat(pc['re'], who=pid, thing=nm) + flat(s1['end'], narr=True, thing=nm); what = '學姊 s1「%s」（{物}＝%s）' % (s1['title'], nm)
        R.check('%s s1 的選項字＝稿（{物}＝%s）' % (tag, nm), any(m['opts'] == opt_texts(s1['choice'], nm) for m in menus(log)), J([m['opts'] for m in menus(log)]))
        fxs = [e for e in log if e.get('k') == 'fx' and e.get('id') == pid]
        R.check('%s s1 選了稿第 %d 個，SOCIAL.applyFx 收到稿的 fx %s' % (tag, PICK % 2 + 1, J(pc.get('fx'))), any(e['fx'] == pc.get('fx') for e in fxs), J(fxs))
        R.check('%s s1 以後 G.flags.FC_SIS_S1、FC.s1＝今天（%s）' % (tag, g0['day']), g1['fl'].get('FC_SIS_S1') is True and (g1['fc'] or {}).get('s1') == g0['day'], J({'fl': g1['fl'], 'fc': g1['fc']}))
    else:
        V = X['give'][pid][ver]
        want = [[None, '你把%s遞給%s。' % (nm, nmj['disp'])]] + flat(V, who=pid, thing=nm); what = 'give.%s.%s（{物}＝%s）' % (pid, ver, nm)   # 第一句＝送禮系統原本的「你把○○遞給○○。」（gifthol3d.js hand）
        if any('{物}' in t for t in V): R.note('%s 這一版的稿有 {物}：%s' % (tag, J([t for t in V if '{物}' in t])))
    cmp_seq(tag, what, got, want); cmp_screen(tag, what, dr['lines'], want)
    R.check('%s 送出去：包包少了那一樣' % tag, g1['bag'].count(gid) == g0['bag'].count(gid) - 1, J({'before': g0['bag'], 'after': g1['bag']}))
    return {'log': log, 'g0': g0, 'g1': g1}


async def case_gift(pg, cdp, errs):
    items = list(DOC['items'].keys()); k = 0
    for pid in WHO:
        for ver in VERS:
            tag = '[GIFT %s %s]' % (pid, ver); e0 = len(errs); gid = items[k % len(items)]; k += 1
            st = day46(); set_dating(st, pid if ver == 'dating' else None)
            fl = st.setdefault('flags', {}); gh = dict(fl.get('GIFTH') or {}); gh['bag'] = [{'id': gid, 'day': st['day'], 'shop': 'gg_flower'}]; fl['GIFTH'] = gh
            if pid == SIS and ver == 'dating': fl['FC_SIS_S1'] = True; fl['FC_SIS_S3'] = True; fl['FC'] = {'n': {'basic': 1}, 'cnt': 1, 'gave': {}, 'after': {}, 's1': st['day']}   # 已經演過 s1（稿：之後再送照 give 的三句）；s3 也演過＝不插進來
            if pid == 'heroine_03': fl['YT_MET_JOB'] = True   # 語彤：在茶屋認識過（AA_610；tests/pg_harness.js 同樣當「已經認識語彤」）
            st.update({'zone': 'flower_notes', 'hour': 14.0, 'pos': {'x': DOOR1F[0], 'z': DOOR1F[1], 'yaw': math.pi, 'lv': 0}})
            g = await load(pg, cdp, st, tag, '【前置／捷徑】day46 存檔；%s；包包放一樣成品 %s「%s」%s' % ('只和她交往' if ver == 'dating' else '誰都不交往', gid, DOC['items'][gid]['name'],
                                                                         '；FC_SIS_S1／S3（已經演過 s1、s3）' if pid == SIS and ver == 'dating' else ''))
            if not await present(pg, tag): continue
            mt = await pg.evaluate("(id=>{ const had=SOCIAL.has(id,'FIRST_MET'), st0=SOCIAL.stage(id); if(!had) SOCIAL.remember(id,'FIRST_MET',''); if(SOCIAL.stage(id)==='STRANGER'||!had){ const r=SOCIAL.rel(id); r.fam=Math.max(r.fam||0,45); r.trust=Math.max(r.trust||0,30); }"
                                   " return {had, st0, st1:SOCIAL.stage(id), can:typeof GIFTH!=='undefined'?GIFTH.canGet(GAME.G,id):null}; })", pid)
            if not mt['had'] or mt['st0'] == 'STRANGER': R.setup('%s 【前置】她還沒見過／是陌生人（%s）：補 FIRST_MET、熟悉 ≥45、信任 ≥30（GIFTH.canGet 要「不是陌生人」）→ %s' % (tag, J(mt), mt['st1']))
            R.check('%s 前置：GIFTH.canGet＝可以送她' % tag, mt['can'] is True, J(mt))
            pl = await place_her(pg, cdp, tag, pid, g['day'])
            R.note('%s 走的路：%s；她 %s' % (tag, pl['way'], J(pl['npc'])))
            if not R.check('%s 這一區有她' % tag, bool(pl['npc']), ''): continue
            fb0 = (await pg.evaluate(GSTATE_JS))['fb']
            await give(pg, cdp, tag, pid, gid, ver, fl)
            await end_checks(pg, tag, errs, e0, fb0)


async def case_sis(pg, cdp, errs):
    tag0 = '[SIS %s]' % DESC; e0 = len(errs)
    st = day46(); set_dating(st, SIS); st.update({'zone': 'flower_notes', 'hour': 13.0, 'pos': pos2f(*LANDING)})
    g = await load(pg, cdp, st, tag0 + ' A', '【前置／捷徑】day46 存檔、只和學姊交往（dating_heroine_05＋romance；可昕改成沒交往）→ 花序二樓樓梯口 13:00')
    if not await present(pg, tag0): return
    fb0 = g['fb']; dA = g['day']
    a = await signup(pg, cdp, tag0 + ' A 自己上基礎花束', 'basic', partners=[SIS], first=True, desc=DESC)
    if not a or 'g_fc_bouquet' not in a['g1']['bag']: R.check('%s A 做出成品（前一步沒成功，後面跳過）' % tag0, False, ''); return
    flags = dict(a['g1']['fl'])
    if not R.check('%s A 記了描述旗標 FC_DESC_%s' % (tag0, DESC), flags.get('FC_DESC_' + DESC) is True, J(flags)): return
    # B：送她 → s1
    pl = await place_her(pg, cdp, tag0 + ' B', SIS, dA)
    R.note('%s B 走的路：%s；她 %s' % (tag0, pl['way'], J(pl['npc'])))
    if not R.check('%s B 這一區有她' % tag0, bool(pl['npc']), ''): return
    b = await give(pg, cdp, tag0 + ' B 送成品', SIS, 'g_fc_bouquet', 's1', flags)
    if not b or not b['g1']['fl'].get('FC_SIS_S1'): R.check('%s B s1 演完（前一步沒成功，後面跳過）' % tag0, False, ''); return
    dB = b['g0']['day']
    # C：下一次上課（和 A 不同週）、她沒課 → 約她一起上 → s2
    fr = await pg.evaluate(FREE_JS, {'id': SIS, 'd0': dB, 'days': 14, 'hours': [13, 14, 10, 15], 'len': DOC['classes']['basic']['hours'], 'notWeek': dA})
    R.note('%s C 一起上課的時段：%s' % (tag0, J(fr)))
    if not R.check('%s C 前置：14 天內找得到她在臺北、沒課、和 A 不同週的時段' % tag0, not fr.get('none'), J(fr.get('why'))): return
    s = await snapshot_skip(pg, day=fr['d'], hour=fr['hr'] + 0.0, zone='flower_notes', pos=pos2f(*LANDING))
    await load(pg, cdp, s, tag0 + ' C', '【前置／捷徑】存檔快照 → %s（第 %d 天）%05.2f、二樓樓梯口（她那時候沒課、和第一次上課不同週）' % (fr['dkey'], fr['d'], fr['hr']))
    c = await signup(pg, cdp, tag0 + ' C 約她一起上', 'basic', mode='together', pid=SIS, flags=flags)
    if not c: return
    R.check('%s C s2 以後 G.flags.FC_SIS_S2' % tag0, c['g1']['fl'].get('FC_SIS_S2') is True, J(c['g1']['fl']))
    # D：s1 那天 +5 天以後說話 → s3
    pl = await place_her(pg, cdp, tag0 + ' D', SIS, max(dB + DOCDAYS, c['g1']['day']))
    R.note('%s D 走的路：%s；她 %s；s1 在第 %d 天' % (tag0, pl['way'], J(pl['npc']), dB))
    if not R.check('%s D 這一區有她' % tag0, bool(pl['npc']), ''): return
    gD = await pg.evaluate(GSTATE_JS)
    R.check('%s D 前置：離 s1 已經 %d 天（稿 s3.when「過五天以上」）' % (tag0, gD['day'] - dB), gD['day'] - dB >= DOCDAYS, '')
    sc3 = DOC['story']['sis']['s3']; pc = sc3['choice'][PICK % len(sc3['choice'])]

    def pol3(ch, cx):
        ts = [o['t'] for o in ch['opts']]
        if ts == opt_texts(sc3['choice']): cx['s3menu'] = True; return PICK % len(ts), 's3 照字選稿第 %d 個' % (PICK % len(ts) + 1)
        if '就這樣' in ts: return ts.index('就這樣'), '照字選「就這樣」'
        return None, ''
    if not await talk_her(pg, cdp, tag0 + ' D', SIS): return
    cx = {}; dr = await drive(pg, cdp, tag0 + ' D 說話', pol3, max_s=420, ctx=cx)
    log = await pg.evaluate(LOG_JS); g1 = await pg.evaluate(GSTATE_JS)
    R.note('%s D 說話：選單 %s；不認識的選單 %s' % (tag0, J([{'opts': p['opts'], 'pick': p['pick']} for p in dr['picks']]), J(dr['unknown'])))
    R.check('%s D 流程走完' % tag0, dr['done'] and not dr['stuck'], J({k: dr[k] for k in ('done', 'stuck', 'secs')}))
    want = flat(sc3['lines'], who=SIS, narr=True) + flat(pc['re'], who=SIS)
    R.check('%s D s3 的選項字＝稿' % tag0, bool(cx.get('s3menu')), J([p['opts'] for p in dr['picks']]))
    cmp_seq(tag0 + ' D', '學姊 s3「%s」（s1 過 %d 天）' % (sc3['title'], gD['day'] - dB), says_of(log), want, contiguous_at=True); cmp_screen(tag0 + ' D', 's3', dr['lines'], want)
    fxs = [e for e in log if e.get('k') == 'fx' and e.get('id') == SIS]
    R.check('%s D s3 選了稿第 %d 個，SOCIAL.applyFx 收到稿的 fx %s' % (tag0, PICK % 2 + 1, J(pc.get('fx'))), any(e['fx'] == pc.get('fx') for e in fxs), J(fxs))
    R.check('%s D s3 以後 G.flags.FC_SIS_S3' % tag0, g1['fl'].get('FC_SIS_S3') is True, J(g1['fl']))
    await end_checks(pg, tag0, errs, e0, fb0)


DOCDAYS = 5   # AA_820 story.sis.s3.when「s1 以後過五天以上」


async def case_s2(pg, cdp, errs):
    for dz in S2DESCS:
        tag = '[S2 %s]' % dz; e0 = len(errs)
        st = day46(); set_dating(st, SIS); fl = st['flags']; fl['FC_SIS_S1'] = True; fl['FC_DESC_' + dz] = True; fl['FC'] = {'n': {'basic': 1}, 'cnt': 1, 'gave': {}, 'after': {}, 's1': st['day'] - 3}
        st.update({'zone': 'flower_notes', 'hour': 13.0, 'pos': pos2f(*LANDING)})
        g = await load(pg, cdp, st, tag, '【前置／捷徑】day46 存檔、只和學姊交往、演過 s1（FC_SIS_S1、FC.s1＝3 天前）、上過一次課（FC.cnt 1，不同週）、描述旗標 FC_DESC_%s → 二樓樓梯口 13:00' % dz)
        if not await present(pg, tag): continue
        fr = await pg.evaluate(FREE_JS, {'id': SIS, 'd0': g['day'], 'days': 10, 'hours': [13, 14, 10, 15], 'len': DOC['classes']['basic']['hours'], 'notWeek': None})
        if not R.check('%s 前置：找得到她在臺北、沒課的時段' % tag, not fr.get('none'), J(fr)): continue
        if fr['d'] != g['day'] or abs(fr['hr'] - g['hour']) > 0.5:
            s = await snapshot_skip(pg, day=fr['d'], hour=float(fr['hr']), zone='flower_notes', pos=pos2f(*LANDING))
            g = await load(pg, cdp, s, tag, '【前置／捷徑】存檔快照 → %s %05.2f（她那時候沒課）' % (fr['dkey'], fr['hr']))
        await signup(pg, cdp, tag + ' 約她一起上', 'basic', mode='together', pid=SIS, flags={'FC_DESC_' + dz: True})
        await end_checks(pg, tag, errs, e0, g['fb'])


async def main():
    print('CC FLOWER-CLASS-1112 花藝課：TAG %s；SHA %s；CASES %s；WHO %s；VERS %s；DESC %s；S2DESCS %s；PICK %d；GIFTWHERE %s；Playwright ≠ iPhone' % (TAG, SHA or '?', ','.join(CASES), ','.join(WHO), ','.join(VERS), DESC, ','.join(S2DESCS), PICK, GIFTWHERE), flush=True)
    R.setup('網址加 ?tapguard（和真的手機一樣擋選單剛出來那一下的誤點）：%s' % URL)
    if not R.check('期望值：讀得到 AA_820 定稿（%s）' % DOC_HOW, DOC is not None, DOC_HOW): sys.exit(1)
    R.note('期望值：%s' % DOC_HOW)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        await pg.evaluate(HOOK_JS)
        pd = await pg.evaluate(PAGE_JS)
        if pd['fc']:
            bad = [k for k in ('signup', 'classes', 'items', 'give', 'together', 'story') if J(pd['fc'].get(k)) != J(DOC.get(k))]
            R.check('頁面上的 FLOWER_CLASS（%s）六節＝AA_820 定稿 58c5c2c1b' % pd['fc'].get('src'), not bad, '不一樣的：' + '、'.join(bad))
        else: R.note('頁面上沒有 FLOWER_CLASS（舊版預期沒有）')
        R.note('營業時間 FNS.hours＝%s（AA_792 staff.hours；判「排不進去」用）' % J(pd['hours']))
        F = {'COURSES': case_courses, 'POOR': case_poor, 'CLOSED': case_closed, 'SIS': case_sis, 'S2': case_s2, 'GIFT': case_gift}
        for c in CASES:
            if c not in F: R.check('[%s] 認得這個 case' % c, False, J(list(F))); continue
            t0 = time.time()
            try: await F[c](pg, cdp, errs)
            except Exception as e: R.check('[%s] 沒有中斷' % c, False, repr(e)[:300])
            R.note('[%s] 用了 %.0f 秒' % (c, time.time() - t0))
        R.check('全程沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    RESULT['fails'] = R.fails; open(os.path.join(OUT, 'fclass_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
