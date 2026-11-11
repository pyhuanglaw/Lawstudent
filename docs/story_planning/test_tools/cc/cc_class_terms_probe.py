"""CC（帳號 A）11-12：CLASS_TERMS——大一下～大四上各一堂課的課堂內容（BB 指定；cc_class12_probe.py 的大一上版本推廣到後面的學期）。
Windows＋GPU（PC runner）≠ iPhone；雲端 SwiftShader 只做探針自檢。不用 ?turbo、不瞬移；讀檔只當前置（log 印 [前置／捷徑]）。觸控一律 CDP（playlib.touch_tap）。
六堂（PARTS 可選，逗號分隔；預設全部）：
  Y1S2  const_2（憲法（下））第 3 週——call：行政院長任命
  Y2S1  crim_spec（刑法分則）第 10 週——obs（討論）：筆電借了不還；討論收尾之後有 DISC_03 課堂題
  Y3S1  civpro_1（民事訴訟法甲上）第 7 週——call：只有轉帳紀錄夠嗎（一週兩格：挑那一週播主要內容的那一格，S.content 不是 second）
  Y4S1  enforcement（強制執行法）第 12 週——call：鋼琴第三人異議（教室 WMULTI 沒有 3D 黑板＝字幕「黑板」）
  Y4S2  legal_research（法律專題研究）第 12 週——obs（討論）：朋友借錢給人五百塊不還（研討室 A＝門口上課 2D；recall 四句要「上過那幾堂」才播，最小存檔不會播，只記）
  JA2   日文（下）第 3 週（て形）——課程代號、學期從遊戲 COURSES 照課名「日文（下）」找（找不到就列出所有「日文」的課）；tpl A：只有黑板、line（沒有 react、call、obs）；
        沒有教授人物（「日文老師：」開頭）；共同教學館 102＝門口上課。企劃 JSON 是 JP.json。第一次去日文課的 ev_jp_g1 會先演（照字處理、記下來）
  那天前面還有別的課（起床選單第一項不是這一堂）：早上就按這一堂會被問「照樣跳過」＝翹掉前面那堂，所以【前置／捷徑】改讀那天上課前 40 分鐘宿舍房間，再用手機「今天」（log 寫明）；
  手機按下去還是問「照樣跳過」就照字「先不要」、判前置 FAIL（不替玩家翹課）。手機早上沒有鍵時也改讀上課前 40 分鐘。
稿：遊戲自己的 src/data/syllabus.js（頁面上的 SYLLABUS，和受測 SHA 一致）；另外和企劃線 origin/claude/story-planning 的 docs/story_planning/syllabus/<學期>.json
  （git show 讀；SPREF 可換 ref、SPDIR=資料夾可改讀本機檔）比對——不一樣只記 R.note（不判 FAIL），最後列總表。企劃 JSON 讀不到就寫明「只比遊戲 syllabus.js」。
前置（每一堂）：【前置／捷徑】最小存檔（同 cc_goclass_probe.mkstate）那一堂前一晚 23:00 宿舍房間；大二以後加 ROOM_Y2…ROOM_Yn（住那一年的房間，dorm3d.js homeOf）
  → 真的走到床（6 秒一段，途中有對話／選單就停下來處理）→「睡到明天早上」→ 醒來 → 起床選單照文字「直接去上課：<課名>」
  （第一項不是這一堂＝照文字「先起床再說」→ 手機「今天」那一列「直接去上課」）→ 遊戲自己帶去教室、坐下 → 上課。VIA=phone：改讀到上課前 40 分鐘宿舍、直接用手機「今天」。
判定（BB 的標準，逐字）：黑板三行、line、每一句 more、react（稿裡其中一句：遊戲照 S.rot 輪一句）都真的播；call／obs 的選項出現、選了以後 follow 播
  （call＝follow 每一句；obs＝選的那一項的 result、在場同學的 replies、教授 close）；畫面上沒有 undefined、{name}、開發者註記；下課以後能自由走動（搖桿 ≥0.3 m、不是 busy）。
  react／replies 沒播時，FAIL 那一行附上遊戲的規則（reactOK：CHARACTERS 有、STORY.present、EVENTS.npcOf 在教室）讓 BB 判，不放寬。
選項一律照字選（PICK＝選稿裡第幾個 call／obs 選項，預設 0；課堂題照 EXAM_BANK 答案的字選；不認得的選單照 bbplay.pick_of 的婉拒字、沒有才第一個沒變暗的，並記下來）。
GAME.choose 鉤子沒抓到、畫面上卻有按鈕的選單＝遊戲內部選單：照按鈕字選並記一行。每個等待迴圈沒進展每 30 秒記一次狀態（zone、時刻、busy、busyDepth／busyWho、dlg、選單、最後一句）＋截圖。
環境變數：LW_TESTS SHA PARTS PICK VIA SPREF SPDIR MAXS EVQUIET
用法：LW_TESTS=<wt>/tests SHA=<40 碼> PARTS=Y1S2 python3 cc_class_terms_probe.py <url> <out>"""
import os, sys, json, asyncio, time, re, subprocess
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import playlib as L
import bbplay as P
import cc_goclass_probe as GC
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
ENV = os.environ.get
SHA = ENV('SHA') or ''
# PART：(課程代號或 None＝照課名找, 第幾週, call／obs／None, 企劃 JSON 檔名（None＝照遊戲的學期）, 照課名找時的課名)
LESSONS = {'Y1S2': ('const_2', 3, 'call', None, None), 'Y2S1': ('crim_spec', 10, 'obs', None, None), 'Y3S1': ('civpro_1', 7, 'call', None, None), 'Y4S1': ('enforcement', 12, 'call', None, None),
           'Y4S2': ('legal_research', 12, 'obs', None, None), 'JA2': (None, 3, None, 'JP', '日文（下）')}
PARTS = [p.strip().upper() for p in (ENV('PARTS') or ','.join(LESSONS)).split(',') if p.strip()]
PICK = int(ENV('PICK') or 0)
VIA = ENV('VIA') or 'wake'
SPREF = ENV('SPREF') or 'origin/claude/story-planning'
SPDIR = ENV('SPDIR') or ''
MAXS = float(ENV('MAXS') or 900)
EVQUIET = ENV('EVQUIET') == '1'
CONTENT_KEYS = ('tpl', 'board', 'line', 'more', 'react', 'call', 'obs', 'ask', 'recall')
R = L.Run('class_terms', OUT)
GC.R = R; GC.OUT = OUT; GC.SHA = SHA[:9]; GC.EVQUIET = EVQUIET
J = GC.J
shot = GC.shot
DIFFS = []      # 遊戲 syllabus.js 和企劃 JSON 不一樣的地方（只記）
SUMMARY = {}

# ---------- 遊戲裡讀的東西（都用 pg.evaluate(JS, 參數)，不經過 Python 的 % 格式化）----------
COURSEOF = r"""(([cid,nm])=>{ if(typeof COURSES==='undefined') return {err:'沒有 COURSES'}; const all=COURSES.list.map(c=>({id:c.id,name:c.name,term:c.term,kind:c.kind,room:c.room,prof:c.prof||null,choice:c.choice?c.choice.group:null}));
  const c=cid?all.find(x=>x.id===cid):all.find(x=>x.name===nm); const like=nm?all.filter(x=>x.name.includes(nm.slice(0,2))):[];
  return {c:c||null, like, syl:c&&typeof SYLLABUS!=='undefined'?!!(SYLLABUS.courses||{})[c.id]:null}; })"""
FINDLESSON = r"""(([term,cid,w,yr])=>{ const G0=GAME.G, fl=Object.assign({},G0.flags||{}); for(let y=2;y<=yr;y++) fl['ROOM_Y'+y]=true; const G=Object.assign({},G0,{stage:'law',flags:fl});
  const cands=[], seen=[]; let lo=null, hi=null;
  for(let d=-30; d<2400; d++){ let t=null; try{ t=CALENDAR.termOf(d); }catch(e){} if(!t||t.id!==term) continue; if(lo===null) lo=d; hi=d; if(t.week!==w) continue;
    let its=[]; try{ its=CLS.dayItems(G,d); }catch(e){} const k=CALENDAR.dateOf(d); let hol=false; try{ hol=!!CALENDAR.holiday(d); }catch(e){}
    seen.push({d,key:k.key,wd:k.wd,hol,items:its.map(i=>i.c.id+'@'+i.t0.toFixed(2))});
    const it=its.find(i=>i.c.id===cid); if(!it) continue; let ct=null; try{ ct=CLS.content(it); }catch(e){}
    const pc=it.c.prof&&typeof CHARACTERS!=='undefined'?CHARACTERS[it.c.prof]:null;
    cands.push({d,wd:k.wd===7?0:k.wd,key:k.key,item:it.key,t0:it.t0,t1:it.t1,zone:(it.room&&it.room.zone)||null,door:(it.room&&it.room.door)||null,room:(it.room&&it.room.name)||'',
      first:its[0].key,firstName:its[0].c.name,name:it.c.name,prof:it.c.prof||null,profShort:CLS.profName(it.c),profChar:pc?pc.name:null,second:!!(ct&&ct.second),line:ct?String(ct.line||''):null,week:t.week,term:t.id}); }
  let all=[]; try{ all=COURSES.list.filter(c=>c.term===term).map(c=>c.id+(CLS.enrolled(G,c)?'':'（沒修）')); }catch(e){}
  return {pick:cands.find(c=>!c.second)||null, cands, seen, termDays:[lo,hi], termCourses:all}; })"""
SYLJS = r"""(([cid,w])=>{ if(typeof SYLLABUS==='undefined') return {err:'沒有 SYLLABUS'}; const W=(SYLLABUS.courses||{})[cid]||null; const q=W?W.find(x=>x.w===w):null;
  return {sy:q?JSON.parse(JSON.stringify(q)):null, weeks:W?W.map(x=>x.w):null, courses:Object.keys(SYLLABUS.courses||{}).length, reviewed:Array.isArray(SYLLABUS.reviewed)?SYLLABUS.reviewed.includes(cid+'|'+w):null, source:SYLLABUS.source||null}; })"""
BANKQ = r"""(id=>{ if(typeof EXAM_BANK==='undefined') return null; const q=EXAM_BANK.questions.find(x=>x.id===id); return q?JSON.parse(JSON.stringify({id:q.id,q:q.q,options:q.options||null,answer:q.answer,type:q.type,course:q.course,term:q.term,status:q.status})):null; })"""
PRESENCE = r"""(([whos,day])=>whos.map(id=>{ let pres=null, npc=null, knows=null; try{ pres=typeof STORY!=='undefined'&&STORY.present?!!STORY.present(id,{day}):null; }catch(e){ pres='ERR '+e; }
  try{ npc=typeof EVENTS!=='undefined'&&EVENTS.npcOf?!!EVENTS.npcOf(id):null; }catch(e){ npc='ERR '+e; } try{ knows=typeof STORY!=='undefined'&&STORY.knows?!!STORY.knows(id):null; }catch(e){}
  return {who:id, name:(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])?CHARACTERS[id].name:null, present:pres, inRoom:npc, knows}; }))"""
HEADS = "[...document.querySelectorAll('#choices button')].map(b=>((b.firstChild&&b.firstChild.nodeType===3)?b.firstChild.textContent:(b.textContent||'')).trim())"
CURMENU = "(()=>window.__GC&&window.__GC.cur?window.__GC.cur.opts:null)()"
BTNAT = r"""(k=>{ const bs=[...document.querySelectorAll('#choices button')]; const b=bs[k]; if(!b) return null; b.scrollIntoView({block:'nearest'}); const r=b.getBoundingClientRect(); const cx=r.left+r.width/2, cy=r.top+r.height/2;
  const h=document.elementFromPoint(cx,cy); return {c:[cx,cy], hit:!!h&&(h===b||b.contains(h)), top:h?(h.id||String(h.className||'').slice(0,30)||h.tagName):null}; })"""
DLGCHK = r"""(()=>{ const box=document.getElementById('dlg'), t=document.getElementById('dlgText'), n=document.getElementById('dlgName'); if(!box||box.classList.contains('hide')) return null; const rb=box.getBoundingClientRect();
  return {name:n?(n.style.display==='none'?'':(n.textContent||'').trim()):null, text:(t.textContent||''), clipped:t.scrollHeight>t.clientHeight+2||t.scrollWidth>t.clientWidth+2, inView:rb.left>=-1&&rb.top>=-1&&rb.right<=innerWidth+1&&rb.bottom<=innerHeight+1}; })()"""
SCREENTXT = r"""(()=>{ const q=id=>{ const e=document.getElementById(id); if(!e||e.classList.contains('hide')) return ''; const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden') return ''; return (e.innerText||'').trim(); };
  return ['dlg','choices','caption','toast','hud'].map(q).filter(Boolean).join(' ｜ ').slice(0,600); })()"""
BOARDHOOK = r"""(()=>{ const z=GAME.E&&GAME.E.zone; if(!z||!z.setBoard||z.setBoard.__gc||!window.__GC) return false; const f=z.setBoard; z.setBoard=function(){ try{ window.__GC.push({k:'board',a:[...arguments].map(x=>String(x))}); }catch(e){} return f.apply(this,arguments); }; z.setBoard.__gc=1; return true; })()"""
ENTERHOOK = r"""(()=>{ if(window.__CTE===GAME) return 'again'; window.__CTE=GAME; const f0=GAME.enter; GAME.enter=function(){ const r=f0.apply(this,arguments); try{ if(r&&r.then) r.then(()=>{ try{ (0,eval)(%s); }catch(e){} }); }catch(e){} return r; }; return 'ok'; })()"""
PSTATE = r"""(()=>{ const P=GAME.E.player, o=P.obj.position; return {x:+o.x.toFixed(3), z:+o.z.toFixed(3), lv:P.lv|0, busy:!!P.busy, seat:!!P.seat, path:!!(P.path&&P.path.length), zone:GAME.G.zone}; })()"""
BAD = [re.compile(x) for x in (r'undefined', r'\bnull\b', r'\bNaN\b', r'\[object ', r'\{[A-Za-z_一-鿿]{1,20}\}', r'PLACEHOLDER', r'TODO', r'LEGAL_REVIEW', r'\b(?:AA|BB|CC)[_-]?\d{2,}',
                                r'STUDY-EXAM', r'\bref\s*[:：]', r'\breview\s*[:：]', r'MISSING_', r'__')]


def norm(t):
    t = re.sub(r'[「」『』\s]', '', str(t or ''))
    return re.sub(r'^[^：]{1,4}老師：', '', t)


def find_seq(says, target, start):
    """target（稿的一句）在 says（norm 過的字）的哪裡：一句一樣，或連續兩三句接起來一樣（profParts 拆句）。回傳 (起點, 用了幾句) 或 None"""
    nt = norm(target)
    if not nt: return None
    for i in range(start, len(says)):
        if says[i] == nt: return i, 1
        acc = says[i]
        for k in range(1, 3):
            if i + k >= len(says): break
            acc += says[i + k]
            if acc == nt: return i, k + 1
    return None


def find_sub(says, target, start):
    """replies／react：遊戲加了「名字：「…」」，稿的字是那一句的一部分就算"""
    nt = norm(target)
    if not nt: return None
    for i in range(start, len(says)):
        if nt in says[i]: return i
    return None


# ---------- 企劃 JSON ----------
def sp_json(term):
    if SPDIR:
        p = os.path.join(SPDIR, term + '.json')
        try: return json.load(open(p, encoding='utf-8')), 'SPDIR ' + p
        except Exception as e: return None, '讀不到 %s：%r' % (p, e)
    try:
        repo = subprocess.run(['git', '-C', HERE, 'rev-parse', '--show-toplevel'], capture_output=True, text=True, timeout=30).stdout.strip() or HERE
        sha = subprocess.run(['git', '-C', repo, 'rev-parse', SPREF], capture_output=True, text=True, timeout=30).stdout.strip()
        r = subprocess.run(['git', '-C', repo, 'show', '%s:docs/story_planning/syllabus/%s.json' % (SPREF, term)], capture_output=True, timeout=60)
        if r.returncode != 0: return None, 'git show %s 失敗：%s' % (SPREF, r.stderr.decode('utf-8', 'replace')[:200])
        return json.loads(r.stdout.decode('utf-8')), '%s（%s）' % (SPREF, sha or '?')
    except Exception as e:
        return None, 'git show 例外：%r' % (e,)


def sp_week(js, cid, w):
    if not js: return None, None
    c = next((x for x in js.get('courses', []) if x.get('id') == cid), None)
    if not c: return None, '企劃 JSON 沒有 %s（有：%s）' % (cid, J([x.get('id') for x in js.get('courses', [])]))
    q = next((x for x in c.get('syllabus', []) if x.get('w') == w), None)
    if not q: return None, '企劃 JSON 的 %s 沒有第 %d 週（有：%s）' % (cid, w, J([x.get('w') for x in c.get('syllabus', [])]))
    return q, None


def ddiff(a, b, path):
    """兩邊的稿逐欄比（dict 照鍵、list 照位置往下比），回傳 [(路徑, 遊戲, 企劃)]。企劃多的註記欄位（例：obs.echo）也會列出來"""
    if isinstance(a, dict) and isinstance(b, dict):
        out = []
        for k in sorted(set(a) | set(b)): out += ddiff(a.get(k), b.get(k), '%s.%s' % (path, k))
        return out
    if isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        out = []
        for i, (x, y) in enumerate(zip(a, b)): out += ddiff(x, y, '%s[%d]' % (path, i))
        return out
    return [] if json.dumps(a, ensure_ascii=False, sort_keys=True) == json.dumps(b, ensure_ascii=False, sort_keys=True) else [(path, a, b)]


def diff_script(term, cid, w, game, sp, src):
    tag = '%s %s 第 %d 週' % (term, cid, w)
    if sp is None: R.note('[稿比對] %s：讀不到企劃 JSON（%s），只比遊戲 syllabus.js' % (tag, src)); DIFFS.append([tag, '讀不到企劃 JSON', src]); return
    if game is None: R.note('[稿比對] %s：遊戲 syllabus.js 沒有這一週' % tag); DIFFS.append([tag, '遊戲沒有這一週', None]); return
    n = 0
    for k in CONTENT_KEYS:
        a, b = game.get(k), sp.get(k)
        for path, x, y in ddiff(a, b, k):
            n += 1; DIFFS.append([tag, path, {'syllabus.js': x, '企劃 JSON': y}]); R.note('[稿比對] %s：%s 不一樣：遊戲 %s ｜ 企劃 %s' % (tag, path, J(x), J(y)))
    only = [k for k in sp if k not in game and k not in CONTENT_KEYS and k != 'w']
    if only: R.note('[稿比對] %s：企劃 JSON 多的註記欄位（不進遊戲）%s' % (tag, J(only)))
    only2 = [k for k in game if k not in sp]
    if only2: n += 1; DIFFS.append([tag, '遊戲多的欄位', only2]); R.note('[稿比對] %s：遊戲 syllabus.js 有、企劃 JSON 沒有的欄位 %s' % (tag, J(only2)))
    R.note('[稿比對] %s：內容欄位 %s 不一樣的 %d 項（企劃 %s）' % (tag, J(CONTENT_KEYS), n, src))


# ---------- 玩家操作 ----------
async def btn_tap(pg, cdp, k, tag):
    """按第 k 顆選項：先確認按鈕中央最上面的就是它（乙 4），不是就收起蓋住的東西再試一次"""
    for i in range(2):
        a = await pg.evaluate(BTNAT, k)
        if not a: R.note('%s：第 %d 顆選項不見了' % (tag, k)); return False
        if a['hit']: await L.touch_tap(cdp, a['c'][0], a['c'][1]); return True
        R.note('%s：選項第 %d 顆被「%s」蓋住（截圖 %s），先收起面板' % (tag, k, a['top'], await shot(pg, tag + '_covered')))
        await L.close_panels(pg, cdp); await pg.wait_for_timeout(500)
    a = await pg.evaluate(BTNAT, k)
    if a: await L.touch_tap(cdp, a['c'][0], a['c'][1])
    return bool(a and a['hit'])


async def walkpos(pg, s):
    """進展的一部分：busy／走路中（seatMenu 的 walkTo、去教室）人的位置（0.2 m 一格）。雲端走得慢，只看對話會把「還在走」誤記成沒進展"""
    if not (s['busy'] or s['path']): return None
    p = await pg.evaluate(PSTATE)
    return (round(p['x'] / 0.2), round(p['z'] / 0.2), p['zone'])


async def diag(pg, tag, why):
    s = await GC.ms(pg); cv = await pg.evaluate(GC.COVER); scr = await pg.evaluate(SCREENTXT)
    lg = await GC.logs(pg, max(0, await GC.logn(pg) - 30)); last = next((e['text'] for e in reversed(lg) if e['k'] in ('say', 'cap')), None)
    fn = await shot(pg, tag + '_idle')
    R.note('%s：【等待診斷】%s：zone %s、%s 時、busy %s、busyDepth %s、busyWho %s、dlg %s、選單 %s（%s）、最後一句 %s、畫面字 %s、截圖 %s' % (
        tag, why, s['zone'], s['h'], s['busy'], (cv or {}).get('busyDepth'), J((cv or {}).get('busyWho')), s['dlg'], s['ch'], J((cv or {}).get('chTexts')), J(last), J(scr[:200]), fn))


async def pick_menu(pg, cdp, tag, prefer=(), ctx=None):
    """畫面上的選單照字選：prefer（開頭符合，照順序）→ ctx 的課堂選單（call／obs／題目）→ bbplay 的婉拒字 → 第一個沒變暗的。回傳 {opts, pick, why, internal}"""
    await pg.wait_for_timeout(600)
    b = await P.ts(pg); opts = b['ch']; hs = await pg.evaluate(HEADS)
    if not opts or not hs: return None
    cur = await pg.evaluate(CURMENU)
    internal = cur is None
    if internal: R.note('%s：遊戲內部選單（GAME.choose 鉤子沒抓到）：照按鈕字選 %s' % (tag, J(hs)))
    nh = [norm(h) for h in hs]; k = None; why = ''
    for p in prefer:
        k = next((i for i, h in enumerate(hs) if h.startswith(p)), None)
        if k is not None: why = '照字「%s」' % p; break
    if k is None and ctx:
        if ctx.get('call') and nh == ctx['call']: tgt = ctx['call'][min(PICK, len(nh) - 1)]; k = nh.index(tgt); why = 'call（照稿第 %d 項的字）' % (PICK + 1)
        elif ctx.get('obs') and nh == ctx['obs']: tgt = ctx['obs'][min(PICK, len(nh) - 1)]; k = nh.index(tgt); why = 'obs 討論（照稿第 %d 項的字）' % (PICK + 1)
        elif ctx.get('bank') and (hs[0].startswith('（') or hs == ['對', '錯']):
            bk = ctx['bank']; ans = str(bk.get('answer')); k = next((i for i, h in enumerate(hs) if h.startswith('（' + ans + '）') or h == ans), None); why = '課堂題（照 EXAM_BANK %s 答案 %s 的字）' % (bk.get('id'), ans)
            if k is None: why = '課堂題★選項裡找不到題庫答案 %s' % ans
        elif ctx.get('call') and hs[0].startswith('「'): why = '★像 call 但字和稿不一樣（稿 %s）' % J(ctx['call'])
        elif ctx.get('obs') and len(hs) == len(ctx['obs']): why = '★像 obs 但字和稿不一樣（稿 %s）' % J(ctx['obs'])
    if k is None:
        k, p = P.pick_of(opts, ()); why = (why + '；' if why else '') + ('不認得的選單，照婉拒字' if p is None and any(opts[k]['t'].startswith(x) for x in P.DECLINE) else '不認得的選單，照第一個沒變暗的') + '「%s」' % hs[k]
    fn = await shot(pg, '%s_menu' % tag)
    R.note('%s：選單 %s → 選「%s」（%s；截圖 %s）' % (tag, J(hs), hs[k], why, fn))
    await btn_tap(pg, cdp, k, tag); await pg.wait_for_timeout(700)
    return {'opts': hs, 'pick': hs[k], 'k': k, 'why': why, 'internal': internal}


async def drain(pg, cdp, tag, prefer=(), max_s=120, idle_s=3.0, ctx=None, menus=None):
    """正常速度把插進來的劇情演完：對話出現 500 ms 後點、選單照字選；空下來 idle_s 秒就停。沒進展每 30 秒記一次診斷"""
    t0 = time.time(); idle = None; sig0 = None; prog = time.time(); dg = time.time()
    while time.time() - t0 < max_s:
        s = await GC.ms(pg); sig = (s['nd'], s['dlg'], s['ch'], s['dtext'], s['busy'], s['fade'], s['zone'], await walkpos(pg, s))
        if sig != sig0: sig0 = sig; prog = time.time()
        elif time.time() - prog >= 30 and time.time() - dg >= 30: dg = time.time(); await diag(pg, tag, '沒進展 %.0f 秒' % (time.time() - prog))
        if s['phone'] and not s['ch']: await L.phone_away(pg, cdp, tries=1); await L.close_panels(pg, cdp); continue
        if s['ch']:
            idle = None; m = await pick_menu(pg, cdp, tag, prefer, ctx)
            if m and menus is not None: menus.append(m)
            continue
        if s['dlg']:
            idle = None
            if not s['dtext'].strip(): await pg.wait_for_timeout(150); continue
            await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        if s['busy'] or s['fade'] or s['paused']: idle = None; await pg.wait_for_timeout(250); continue
        idle = idle or time.time()
        if time.time() - idle >= idle_s: return True
        await pg.wait_for_timeout(200)
    await diag(pg, tag, 'drain 超過 %d 秒' % max_s); return False


def mkstate(dd, h, yr):
    fl = {('ROOM_Y%d' % y): True for y in range(2, yr + 1)}
    return GC.mkstate(dd, h, 'dorm', fl), fl


async def bed(pg, cdp, tag):
    """走到床（6 秒一段 go_to；每段之間看 busy／dlg／選單，有就先演完）→ 按互動 → 床的選單照字「睡到明天早上」"""
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0,it.label||'']:null; })()")
    if not it:
        lab = await pg.evaluate("(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>i.label||'').slice(0,20)")
        R.note('%s：這一區找不到床（有的互動點：%s）' % (tag, J(lab))); return None
    arrived = False
    for seg in range(30):
        s = await GC.ms(pg)
        if s['dlg'] or s['ch'] or s['busy']: R.note('%s：走向床的途中有劇情（第 %d 段；%s），先演完' % (tag, seg, J(s['dtext']))); await drain(pg, cdp, tag + '_tobed'); continue
        ok = await L.go_to(pg, cdp, R, it[0], it[1], 0.8, '床', max_s=6, lv=it[2], stop=lambda q: q['dlg'] or q['choices'])
        st = await L.state(pg)
        if st['dlg'] or st['choices']: continue
        if ok and ((st.get('interact') or '').startswith(('睡', '床', '躺')) or ((st['x'] - it[0]) ** 2 + (st['z'] - it[1]) ** 2) ** 0.5 <= 0.8): arrived = True; break
    if not arrived: R.note('%s：30 段還沒走到床（%s；床 %s）' % (tag, J(await L.state(pg)), J(it))); await shot(pg, tag + '_bed_fail'); return None
    for _ in range(5):
        if (await P.ts(pg))['ch']: break
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        s = await GC.ms(pg)
        if s['dlg'] and not s['ch']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
    m = await pick_menu(pg, cdp, tag + '_bed', prefer=('睡到明天早上', '睡到明天'))
    if not m or not m['pick'].startswith('睡到明天'): R.note('%s：床的選單沒有「睡到明天」（%s）' % (tag, J(m))); return None
    return m['pick']


async def sleep_wake(pg, cdp, tag, L_, yr):
    prev = await P.day_of(pg, await pg.evaluate("d=>CALENDAR.dateOf(d).key", L_['d'] - 1))
    st, fl = mkstate(prev, 23.0, yr)
    await GC.load(pg, cdp, st, '%s：最小存檔 %s（第 %d 天）23:00 宿舍房間；旗標 %s（住那一年的房間）' % (tag, prev['key'], prev['d'], J(fl)))
    await pg.evaluate(ENTERHOOK % json.dumps(BOARDHOOK))
    room = await pg.evaluate("(()=>{ try{ return {zone:GAME.G.zone, plate:(GAME.E.zone&&GAME.E.zone.plate)||null}; }catch(e){ return null; } })()")
    R.note('%s：讀進來 %s' % (tag, J(room)))
    n0 = await GC.logn(pg)
    if not await bed(pg, cdp, tag): return False
    t0 = time.time(); prog = time.time(); sig0 = None; dg = time.time()
    while time.time() - t0 < 300:
        lg = await GC.logs(pg, n0)
        if any(e['k'] == 'cls' and e['fn'] == 'queueWake' for e in lg) and await pg.evaluate("d=>GAME.G.day===d", L_['d']): break
        s = await GC.ms(pg); sig = (s['nd'], s['dlg'], s['ch'], s['day'], s['fade'])
        if sig != sig0: sig0 = sig; prog = time.time()
        elif time.time() - prog >= 30 and time.time() - dg >= 30: dg = time.time(); await diag(pg, tag + '_sleep', '睡覺沒進展 %.0f 秒' % (time.time() - prog))
        if s['ch']: await pick_menu(pg, cdp, tag + '_sleep'); continue
        if s['dlg'] and s['dtext'].strip() and not s['dtext'].startswith('早安'): await pg.wait_for_timeout(400); await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(250)
    ok = await pg.evaluate("d=>GAME.G.day===d", L_['d'])
    R.note('%s：睡醒 第 %s 天（要第 %d 天）%s' % (tag, await pg.evaluate("GAME.G.day"), L_['d'], J(await GC.ms(pg))))
    return ok


async def wait_wake_menu(pg, cdp, tag, max_s=150):
    """等起床選單（「直接去上課」「先起床再說」那一組）。途中別的劇情照正常速度演完（選單照字）"""
    t0 = time.time(); prog = time.time(); sig0 = None; dg = time.time()
    while time.time() - t0 < max_s:
        s = await GC.ms(pg); sig = (s['nd'], s['dlg'], s['ch'], s['dtext'])
        if sig != sig0: sig0 = sig; prog = time.time()
        elif time.time() - prog >= 30 and time.time() - dg >= 30: dg = time.time(); await diag(pg, tag + '_wake', '等起床選單沒進展 %.0f 秒' % (time.time() - prog))
        if s['ch']:
            hs = await pg.evaluate(HEADS)
            if any(h.startswith(('直接去上課', '先起床')) for h in hs): return hs
            await pick_menu(pg, cdp, tag + '_prewake'); continue
        if s['dlg']:
            if not s['dtext'].strip(): await pg.wait_for_timeout(150); continue
            R.note('%s：起床選單以前的一句：%s' % (tag, s['dtext'])); await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1)
        await pg.wait_for_timeout(150)
    await diag(pg, tag + '_wake', '%d 秒內沒等到起床選單' % max_s); return None


async def go_lesson(pg, cdp, L_, tag, yr):
    if VIA == 'wake':
        if not R.check('%s：前一晚真的睡覺、第 %d 天醒來' % (tag, L_['d']), await sleep_wake(pg, cdp, tag, L_, yr)): return False
        hs = await wait_wake_menu(pg, cdp, tag)
        if not R.check('%s：起床選單出了（%s）' % (tag, J(hs)), bool(hs)): return False
        await shot(pg, tag + '_wakemenu')
        if hs and hs[0].startswith('直接去上課') and L_['name'] in hs[0]:
            m = await pick_menu(pg, cdp, tag + '_wake', prefer=('直接去上課',)); return bool(m and m['pick'].startswith('直接去上課'))
        R.note('%s：起床選單第一項不是這一堂（%s）→ 照字「先起床再說」' % (tag, J(hs)))
        await pick_menu(pg, cdp, tag + '_wake', prefer=('先起床',))
        await drain(pg, cdp, tag + '_getup', max_s=60, idle_s=2)
        if L_['first'] != L_['item']:
            # 這一堂前面還有別的課（例：日文（下）13:20、早上有債各）：早上就按這一堂的「直接去上課」，遊戲會問「照樣跳過／先不要」＝會翹掉前面那堂（JA2 第一輪就這樣翹了債各）。
            # 不替玩家翹別的課：改【前置／捷徑】讀那天上課前 40 分鐘宿舍房間，再用手機「今天」
            h = L_['t0'] - 40 / 60; dd = {'d': L_['d'], 'wd': L_['wd'], 'key': L_['key']}; st, fl = mkstate(dd, h, yr)
            await GC.load(pg, cdp, st, '%s：那天第一堂是 %s（不是這一堂）；早上直接去會翹掉它 → 改讀 %s（第 %d 天）%02d:%02d 宿舍房間（上課前 40 分鐘）；旗標 %s' % (tag, L_['firstName'], L_['key'], L_['d'], int(h), round(h % 1 * 60), J(fl)))
            await pg.evaluate(ENTERHOOK % json.dumps(BOARDHOOK))
            await drain(pg, cdp, tag + '_noon', max_s=90, idle_s=3)
    else:
        h = L_['t0'] - 40 / 60; dd = {'d': L_['d'], 'wd': L_['wd'], 'key': L_['key']}
        st, fl = mkstate(dd, h, yr)
        await GC.load(pg, cdp, st, '%s：最小存檔 %s（第 %d 天）%02d:%02d 宿舍房間（上課前 40 分鐘）；旗標 %s' % (tag, L_['key'], L_['d'], int(h), round(h % 1 * 60), J(fl)))
        await pg.evaluate(ENTERHOOK % json.dumps(BOARDHOOK))
        await drain(pg, cdp, tag + '_morning', max_s=90, idle_s=3)
    await GC.phone_today(pg, cdp, tag, week=False)
    sel = '#phoneBody [data-go="%s"]' % L_['item']
    lab = await pg.evaluate("s=>{ const b=document.querySelector(s); return b?b.textContent.trim():null; }", sel)
    R.note('%s：手機「今天」那一列的鍵＝%s' % (tag, J(lab)))
    if not lab and VIA == 'wake':
        await GC.close_phone(pg, cdp)
        h = L_['t0'] - 40 / 60; dd = {'d': L_['d'], 'wd': L_['wd'], 'key': L_['key']}; st, fl = mkstate(dd, h, yr)
        await GC.load(pg, cdp, st, '%s：早上手機「今天」沒有這一堂的鍵（下午的課）→ 改讀 %s（第 %d 天）%02d:%02d 宿舍房間（上課前 40 分鐘）；旗標 %s' % (tag, L_['key'], L_['d'], int(h), round(h % 1 * 60), J(fl)))
        await pg.evaluate(ENTERHOOK % json.dumps(BOARDHOOK))
        await drain(pg, cdp, tag + '_noon', max_s=90, idle_s=3)
        await GC.phone_today(pg, cdp, tag + '_noon', week=False)
        lab = await pg.evaluate("s=>{ const b=document.querySelector(s); return b?b.textContent.trim():null; }", sel)
        R.note('%s：上課前 40 分鐘手機「今天」那一列的鍵＝%s' % (tag, J(lab)))
    if not R.check('%s：手機「今天」有「直接去上課」那一列的鍵' % tag, bool(lab)): await GC.close_phone(pg, cdp); return False
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
    if (await GC.ms(pg))['ch']:
        hs = await pg.evaluate(HEADS)
        if any(h.startswith('照樣跳過') for h in hs):   # 會翹掉別的課：不替玩家翹，照字「先不要」，判前置失敗（乙 1）
            await pick_menu(pg, cdp, tag + '_phone', prefer=('先不要',)); R.check('%s：按「直接去上課」不會要翹別的課（%s）' % (tag, J(hs)), False); return False
    return True


async def class_loop(pg, cdp, L_, tag, ctx, whos):
    """上課：對話照正常速度點、選單照字選；每句打完字截一張、量字有沒有被切掉。停在 done 有這一堂、人空下來 3 秒"""
    n1 = await GC.logn(pg); t0 = time.time(); free = None; menus = []; chk = []; seen = 0; pres = None; key = L_['item']
    sig0 = None; prog = time.time(); dg = time.time(); screens = []
    while time.time() - t0 < MAXS:
        s = await GC.ms(pg); sig = (s['nd'], s['dlg'], s['ch'], s['dtext'], s['busy'], s['fade'], s['zone'], await walkpos(pg, s))
        if sig != sig0: sig0 = sig; prog = time.time()
        elif time.time() - prog >= 30 and time.time() - dg >= 30: dg = time.time(); await diag(pg, tag, '上課沒進展 %.0f 秒' % (time.time() - prog))
        lg = await GC.logs(pg, n1)
        i0 = next((i for i, e in enumerate(lg) if e['k'] == 'cls' and e['fn'] in ('attend', 'seatPick')), None)
        if i0 is not None:
            if pres is None: pres = await pg.evaluate(PRESENCE, [whos, L_['d']]); R.note('%s：坐下那時，稿裡說話的同學在不在（reactOK 的條件）%s' % (tag, J(pres)))
            ls = [e for e in lg[i0:] if e['k'] in ('say', 'cap')]
            if len(ls) > seen and ((s['dlg'] and not s['typing']) or ls[-1]['k'] == 'cap' or s['ch']):
                seen = len(ls); fn = await shot(pg, '%s_line%02d' % (tag, len(ls)))
                d = await pg.evaluate(DLGCHK)
                if d: chk.append({'n': len(ls), 'shot': fn, 'name': d['name'], 'clipped': d['clipped'], 'inView': d['inView'], 'text': d['text'][:60]})
                screens.append(await pg.evaluate(SCREENTXT))
        done = await pg.evaluate("k=>!!CLS.rec(GAME.G).done[k]", key)
        if s['ch']:
            free = None; m = await pick_menu(pg, cdp, tag, prefer=('先自由活動', '還是進去聽', '老位子', '坐中間'), ctx=ctx)
            if m: m['inClass'] = i0 is not None and not done; menus.append(m)
            continue
        if s['dlg']:
            free = None
            if not s['dtext'].strip(): await pg.wait_for_timeout(150); continue
            await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['busy'] or s['fade'] or s['paused']: free = None; await pg.wait_for_timeout(250); continue
        free = free or time.time()
        if done and time.time() - free >= 3: break
        if not done and time.time() - free >= 25: await diag(pg, tag, '空下來 25 秒還沒下課'); break
        await pg.wait_for_timeout(200)
    else:
        await diag(pg, tag, '上課超過 %d 秒' % MAXS)
    await drain(pg, cdp, tag + '_after', prefer=('先自由活動',), max_s=60, idle_s=4, menus=menus)
    return {'menus': menus, 'dlgchk': chk, 'n1': n1, 'secs': round(time.time() - t0, 1), 'pres': pres, 'screens': screens}


def compare(tag, sy, cl, menus, bank, pres):
    """和稿逐字對：line → more（照順序）→ react（其中一句）→ call（點到你 → 選單 → follow）／obs（prompt → 選單 → result → replies → close）。回傳缺的清單"""
    says = [e for e in cl if e['k'] == 'say']; N = [norm(e['text']) for e in says]; miss = []; pos = 0; res = []
    for kind, t in [('line', sy.get('line'))] + [('more%d' % (i + 1), m) for i, m in enumerate(sy.get('more') or [])]:
        if not t: continue
        f = find_seq(N, t, pos)
        if f is None:
            g = find_seq(N, t, 0); miss.append((kind, t, '順序不對（在第 %d 句）' % g[0] if g else '沒有播')); res.append([kind, None])
        else: pos = f[0] + f[1]; res.append([kind, f[0]])
    R.note('%s：稿 line／more 對到的句子位置 %s' % (tag, J(res)))
    pw = {p['who']: p for p in (pres or [])}
    # CC 17:1x（BB 17:12 判準）：STORY.present 為 true 的同學（或 who＝class）要播；不在學校的不播。門口上課（2D）也一樣（LAWWW 修：away＝true、只看 STORY.present）
    here = lambda w: w == 'class' or (pw.get(w) or {}).get('present') is True
    _who = [r.get('who') for r in sy.get('react') or []] + [q.get('who') for q in (sy.get('obs') or {}).get('replies') or []]
    if [w for w in _who if w and w != 'class'] and not pres: miss.append(('同學在不在', J(_who), '坐下那時沒量到 STORY.present（pres 空的）＝不能判誰該播，不算 PASS'))
    rs_all = sy.get('react') or []; rs = [r for r in rs_all if here(r.get('who'))]; rs_no = [r for r in rs_all if not here(r.get('who'))]
    for r in rs_no:
        if norm(r.get('text')) and any(norm(r.get('text')) in n for n in N): miss.append(('react 不在學校的人', '%s：%s' % (r.get('who'), r.get('text')), '不在學校（STORY.present 不是 true）卻播了；%s' % J(pw.get(r.get('who')))))
    if rs_no: R.note('%s：react 裡不在學校、不該播的 %s' % (tag, J([(r.get('who'), pw.get(r.get('who'))) for r in rs_no])))
    if rs:
        hit = None
        for i in range(pos, len(says)):
            r = next((r for r in rs if norm(r.get('text')) and norm(r.get('text')) in N[i]), None)
            if r: hit = (i, r, says[i]['text']); break
        R.note('%s：同學 react 播了 %s（稿裡在學校的 %s）' % (tag, J(hit[2]) if hit else '沒有', J([(r.get('who'), r.get('text')) for r in rs])))
        if not hit: miss.append(('react', J([r.get('text') for r in rs]), '沒有播（或不在 more 之後）；遊戲規則 reactOK 的條件：%s' % J([pw.get(r.get('who')) for r in rs])))
        else: pos = hit[0] + 1
    elif rs_all: R.note('%s：稿裡的 react 都是不在學校的人，不該播' % tag)
    else: R.note('%s：稿裡這一週沒有 react' % tag)
    if sy.get('call'):
        c = sy['call']; ic = next((i for i in range(len(says)) if says[i]['text'].endswith('點到你。')), None)
        cm = [m for m in menus if m['why'].startswith('call')]
        R.note('%s：call「…點到你。」在第 %s 句；選單 %s' % (tag, ic, J([[m['opts'], m['pick']] for m in cm])))
        if ic is None: miss.append(('call', '點到你。', '沒有播'))
        if not cm: miss.append(('call 選單', J(c.get('options')), '沒有出現（或字和稿不一樣：%s）' % J([m['opts'] for m in menus])))
        p2 = ic + 1 if ic is not None else pos
        for k, f in enumerate(c.get('follow') or []):
            g = find_seq(N, f, p2)
            if g is None: miss.append(('follow%d' % (k + 1), f, '沒有播'))
            else: p2 = g[0] + g[1]
    if sy.get('obs'):
        ob = sy['obs']; om = next((m for m in menus if m['why'].startswith('obs')), None)
        R.note('%s：obs 選單 %s' % (tag, J(om and [om['opts'], om['pick']])))
        p2 = pos
        if ob.get('prompt'):
            g = find_seq(N, ob['prompt'], pos)
            if g is None: miss.append(('obs prompt', ob['prompt'], '沒有播'))
            else: p2 = g[0] + g[1]
        if not om: miss.append(('obs 選單', J([o.get('text') for o in ob.get('options') or []]), '沒有出現（或字和稿不一樣：%s）' % J([m['opts'] for m in menus])))
        else:
            o = next((o for o in ob.get('options') or [] if norm(o.get('text')) == norm(om['pick'])), None)
            if o and o.get('result'):
                g = find_seq(N, o['result'], p2)
                if g is None: miss.append(('obs result', o['result'], '沒有播'))
                else: p2 = g[0] + g[1]
        for k, q in enumerate(ob.get('replies') or []):
            g = find_sub(N, q.get('text'), p2)
            if not here(q.get('who')):   # BB 17:12：不在學校的不播
                if g is not None: miss.append(('obs reply%d 不在學校的人' % (k + 1), '%s：%s' % (q.get('who'), q.get('text')), '不在學校卻播了；%s' % J(pw.get(q.get('who')))))
                continue
            if g is None: miss.append(('obs reply%d' % (k + 1), '%s：%s' % (q.get('who'), q.get('text')), '沒有播；遊戲規則 reactOK 的條件：%s' % J(pw.get(q.get('who')))))
            else: p2 = g + 1
        if ob.get('close'):
            g = find_seq(N, ob['close'], p2)
            if g is None: miss.append(('obs close', ob['close'], '沒有播'))
            else: p2 = g[0] + g[1]
    return miss


def bad_texts(lg, chk, sy):
    """畫面上出過的字（對話、字幕、通知、選項、對話框名字、黑板）裡有沒有 undefined、{name}、開發者註記"""
    items = []
    for e in lg:
        if e['k'] in ('say', 'cap', 'toast'): items.append((e['k'], (e.get('who') or '') + '｜' + e['text']))
        elif e['k'] == 'choose': items.append(('選項', ' ／ '.join(str(x) for x in (e.get('opts') or []))))
        elif e['k'] == 'board': items.append(('黑板', ' ／ '.join(e.get('a') or [])))
        if e['k'] == 'say' and e.get('shown') is not None: items.append(('名字', str(e.get('shown'))))
    for c in chk: items.append(('對話框', '%s｜%s' % (c.get('name'), c.get('text'))))
    notes = [str(sy.get(k))[:14] for k in ('review', 'ref') if sy and sy.get(k)]
    out = []
    for k, t in items:
        for rx in BAD:
            if rx.search(t): out.append([k, rx.pattern, t[:80]]); break
        else:
            for nt in notes:
                if nt and nt in t: out.append([k, '稿的註記', t[:80]]); break
    return out


async def free_move(pg, cdp, tag):
    """下課後能自由走動：不是 busy、搖桿推得動 ≥0.3 m（前、後、左、右輪著推，每個方向最多 3 下）"""
    await drain(pg, cdp, tag + '_pre_move', prefer=('先自由活動', '起身'), max_s=60, idle_s=3)
    s0 = await pg.evaluate(PSTATE); tries = []; ok = False
    for dx, dy, nm in ((0, -60, '前'), (0, 60, '後'), (-60, 0, '左'), (60, 0, '右')):
        s = await GC.ms(pg)
        if s['dlg'] or s['ch']: R.note('%s：推搖桿前有對話／選單，先演完' % tag); await drain(pg, cdp, tag + '_mid_move', prefer=('先自由活動', '起身'), max_s=60)
        moved, n, st = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=3, ms=1500)
        tries.append([nm, round(moved, 2), n, st.get('zone'), st.get('busy')])
        if moved >= 0.3: ok = True; break
    s1 = await pg.evaluate(PSTATE); fn = await shot(pg, tag + '_free_move')
    R.check('%s：下課以後能自由走動（推之前 busy=%s、seat=%s；搖桿 %s；之後 %s；截圖 %s）' % (tag, s0['busy'], s0['seat'], J(tries), J(s1), fn), ok and not s1['busy'])


async def one_term(pg, cdp, errs, term):
    part = term; cid0, w, kind, jsname, cname = LESSONS[part]
    co = await pg.evaluate(COURSEOF, [cid0, cname])
    if not R.check('%s：遊戲 COURSES 有這門課（%s）' % (part, J((co or {}).get('c'))), bool(co and co.get('c'))):
        R.note('%s：找不到——課名像「%s」的課有 %s' % (part, cname or cid0, J((co or {}).get('like')))); return
    cid = co['c']['id']; term = co['c']['term']; yr = int(term[1]) if len(term) > 1 and term[1].isdigit() else 1
    if cname: R.note('%s：照課名「%s」找到 %s（%s；同名開頭的課 %s）' % (part, cname, cid, J(co['c']), J(co.get('like'))))
    if part.startswith('Y') and term != part: R.note('★%s：%s 在遊戲裡是 %s 的課，照遊戲的學期找' % (part, cid, term))
    tag = 'ct_%s_%s_w%d' % (part, cid, w)
    print('----- %s（%s %s 第 %d 週；%s）-----' % (tag, term, cid, w, kind), flush=True)
    e0 = len(errs)
    fl = await pg.evaluate(FINDLESSON, [term, cid, w, yr])
    L_ = fl.get('pick') if fl else None
    if not R.check('%s：找到 %s 第 %d 週那一堂（%s）' % (tag, cid, w, J(L_)), bool(L_)):
        R.note('%s：那一學期第 %d 週每一天的課（找不到時列出有的）：%s；學期的天 %s；那學期的課 %s；候選（含 second）%s' % (tag, w, J((fl or {}).get('seen')), J((fl or {}).get('termDays')), J((fl or {}).get('termCourses')), J((fl or {}).get('cands'))))
        return
    if len(fl.get('cands') or []) > 1: R.note('%s：這一週有 %d 格（%s），挑播主要內容的那一格 %s' % (tag, len(fl['cands']), J([[c['key'], c['item'], c['second']] for c in fl['cands']]), L_['item']))
    sj = await pg.evaluate(SYLJS, [cid, w]); sy = (sj or {}).get('sy')
    if not R.check('%s：遊戲 syllabus.js 有這一週（有的週：%s；來源 %s）' % (tag, J((sj or {}).get('weeks')), J((sj or {}).get('source'))[:160]), bool(sy)): return
    R.check('%s：這一週在 SYLLABUS.reviewed（遊戲才會播稿，不然是一般句子）' % tag, (sj or {}).get('reviewed') is True, J(sj.get('reviewed')))
    if kind: R.check('%s：稿裡這一週有 %s' % (tag, kind), bool(sy.get(kind)), J(list(sy.keys())))
    else: R.note('%s：稿裡這一週沒有 call／obs（tpl %s，欄位 %s）：只看黑板、line、more、react' % (tag, sy.get('tpl'), J(list(sy.keys()))))
    if (sy.get('obs') or {}).get('recall'): R.note('%s：obs 有 recall %d 句（要上過那幾堂才播；最小存檔沒上過＝照規則不播，不判）' % (tag, len(sy['obs']['recall'])))
    js, src = sp_json(jsname or term); spw, why = sp_week(js, cid, w)
    diff_script(term, cid, w, sy, spw, src)
    if why: R.note('[稿比對] %s：%s' % (tag, why))
    R.note('[稿] %s：tpl %s；黑板 %s；line＋more %d 句；react %d 句；call %s；obs %s；ask %s' % (tag, sy.get('tpl'), J(sy.get('board')), len(sy.get('more') or []), len(sy.get('react') or []),
           J((sy.get('call') or {}).get('options')), J([o.get('text') for o in (sy.get('obs') or {}).get('options') or []]), J(sy.get('ask'))))
    qid = ((sy.get('ask') or {}).get('qid')) or (((sy.get('obs') or {}).get('disc') or {}).get('qid'))
    bank = await pg.evaluate(BANKQ, qid) if qid else None
    if qid: R.note('%s：這一堂的課堂題 %s：EXAM_BANK %s' % (tag, qid, J(bank)))
    ctx = {'call': [norm(o) for o in (sy.get('call') or {}).get('options', [])], 'obs': [norm(o.get('text')) for o in (sy.get('obs') or {}).get('options', [])], 'bank': bank}
    whos = sorted(set([r.get('who') for r in sy.get('react') or []] + [q.get('who') for q in (sy.get('obs') or {}).get('replies') or []]) - {None, 'class'})
    R.note('%s：%s（第 %d 天，週%s）%s %s～%s %s（zone %s）教授 %s（%s）；那天第一堂 %s' % (tag, L_['key'], L_['d'], L_['wd'], L_['name'], L_['t0'], L_['t1'], L_['room'], L_['zone'], L_['profChar'], L_['profShort'], L_['firstName']))
    if not await go_lesson(pg, cdp, L_, tag, yr): await diag(pg, tag, '去上課失敗'); return
    r0 = await pg.evaluate(GC.REC)
    out = await class_loop(pg, cdp, L_, tag, ctx, whos)
    lg = await GC.logs(pg, out['n1']); r1 = await pg.evaluate(GC.REC)
    ent = [e['to'] for e in lg if e['k'] == 'enter']
    cl, _ = GC.class_lines(lg); sec, dw = GC.class_timing(lg, cl)
    R.check('%s：進了教室（%s；教室 zone %s）' % (tag, J(ent), L_['zone']), L_['zone'] in ent or r1['zone'] == L_['zone'] or not L_['zone'])
    R.note('%s：課堂 %d 句（say＋字幕）；坐下到「下課了」%s 秒；整段 %s 秒' % (tag, len(cl), sec, out['secs']))
    for e in cl: R.note('    [%s %.3f] 名字「%s」(%s)：%s' % (e['k'], e.get('h') or 0, e.get('shown') if e.get('shown') is not None else (e.get('who') or ''), e.get('cid') or '', e['text']))
    pl = [e for e in cl if e['k'] == 'say' and (e.get('cid') or '').startswith('prof')]
    R.note('%s：教授說的 %d 句，對話框名字 %s（人物資料 %s）；不在場（「○老師：」開頭）%d 句' % (tag, len(pl), J(sorted(set(str(e.get('shown')) for e in pl))), L_['profChar'], sum(1 for e in cl if re.match(r'^[^：]{1,4}老師：', e['text']))))
    clip = [c for c in out['dlgchk'] if c['clipped'] or not c['inView']]
    R.check('%s：對話框的字沒有被切掉、對話框在畫面裡（%d 句檢查）' % (tag, len(out['dlgchk'])), not clip, J(clip))
    bd = [e['a'] for e in lg if e['k'] == 'board']; bcap = [e['text'] for e in lg if e['k'] == 'cap' and e.get('who') == '黑板']
    bd = bd[-1] if bd else None; bcap = bcap[-1] if bcap else None
    R.note('%s：黑板 setBoard=%s；黑板字幕=%s；稿 board=%s' % (tag, J(bd), J(bcap), J(sy.get('board'))))
    okb = bool(bd and [norm(x) for x in bd[:3]] == [norm(x) for x in (sy.get('board') or [])[:3]]) or bool(bcap and all(norm(x) in norm(bcap) for x in (sy.get('board') or []) if x))
    R.check('%s：黑板三行和稿一樣' % tag, okb, J({'setBoard': bd, 'cap': bcap}))
    miss = compare(tag, sy, cl, out['menus'], bank, out['pres'])
    R.check('%s：line → 每一句 more → 同學 react 都播了、順序對、逐字對' % tag, not [m for m in miss if m[0].startswith(('line', 'more', 'react'))], J([m for m in miss if m[0].startswith(('line', 'more', 'react'))]))
    fk = [m for m in miss if not m[0].startswith(('line', 'more', 'react'))]
    if kind or fk: R.check('%s：%s 的選項出現、選了以後 follow 都播了（%s）' % (tag, kind, J([[m['opts'], m['pick']] for m in out['menus'] if m['why'].startswith(('call', 'obs'))])), not fk, J(fk))
    if bank:
        iq = next((i for i, e in enumerate(cl) if e['k'] == 'say' and e['text'].startswith('（下課前，教授在黑板角落寫了一題')), None)
        am = next((m for m in out['menus'] if m['why'].startswith('課堂題')), None)
        R.note('%s：課堂題 %s 出在第 %s 句；選單 %s；答案那一句 %s' % (tag, qid, iq, J(am and [am['opts'], am['pick'], am['why']]), J(next((e['text'] for e in cl if e['k'] == 'say' and e['text'].startswith('答案是')), None))))
    bad = bad_texts(lg, out['dlgchk'], spw or sy)
    R.check('%s：畫面上沒有 undefined、{name}、開發者註記（對話、字幕、通知、選項、名字、黑板，%d 則）' % (tag, len([e for e in lg if e['k'] in ('say', 'cap', 'toast', 'choose', 'board')])), not bad, J(bad))
    unk = [m for m in out['menus'] if m['why'].startswith(('不認得', '★')) or '★' in m['why']]
    if unk: R.note('%s：不認得或和稿對不上的選單 %s' % (tag, J([[m['opts'], m['pick'], m['why']] for m in unk])))
    itn = [m for m in out['menus'] if m.get('internal')]
    if itn: R.note('%s：遊戲內部選單（鉤子沒抓到）%s' % (tag, J([[m['opts'], m['pick']] for m in itn])))
    R.check('%s：下課了（CLS.rec done 有 %s、attend +1）' % (tag, L_['item']), bool(r1['done'].get(L_['item'])) and (r1['attend'].get(cid) or 0) > (r0['attend'].get(cid) or 0), J(GC.rdiff(r0, r1)))
    await free_move(pg, cdp, tag)
    R.check('%s：沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))
    SUMMARY[part] = {'lesson': '%s 第 %d 週 %s' % (cid, w, L_['key']), 'lines': len(cl), 'sitToEnd': sec, 'secs': out['secs'], 'miss': len(miss), 'bad': len(bad)}


async def part(p, term):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not GC.PORTRAIT)
    try:
        await pg.goto(URL); R.check('%s：遊戲載入' % term, await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()"); await GC.hook(pg); await pg.evaluate(ENTERHOOK % json.dumps(BOARDHOOK))
        await one_term(pg, cdp, errs, term)
    finally:
        await b.close()


async def main():
    real = os.popen('git -C "%s" rev-parse HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or 'tests', '..')).read().strip()
    print('CC CLASS_TERMS（大一下～大四上各一堂課堂內容）：SHA=%s worktree HEAD=%s；PARTS=%s；PICK=%d；VIA=%s；企劃 ref %s；Playwright 手機模擬 ≠ iPhone' % (SHA or '?', real or '?', ','.join(PARTS), PICK, VIA, SPDIR or SPREF), flush=True)
    if SHA and real and not real.startswith(SHA[:9]): R.note('★SHA 環境變數 %s 和 worktree HEAD %s 不一樣' % (SHA, real))
    async with async_playwright() as p:
        for term in PARTS:
            if term not in LESSONS: R.note('不認得的 PART：%s（有：%s）' % (term, J(list(LESSONS)))); continue
            print('===== %s =====' % term, flush=True); t0 = time.time()
            try: await part(p, term)
            except Exception as e:
                import traceback; traceback.print_exc(); R.check('%s：沒有例外' % term, False, repr(e)[:300])
            R.note('%s 花了 %.1f 分鐘' % (term, (time.time() - t0) / 60))
    R.note('[統計] %s' % J(SUMMARY))
    if DIFFS:
        print('===== 遊戲 syllabus.js 和企劃 JSON 的差異（只記，不判 FAIL）=====', flush=True)
        for d in DIFFS: print('  ' + J(d), flush=True)
    else: print('===== 遊戲 syllabus.js 和企劃 JSON：這幾週的內容欄位沒有差異 =====', flush=True)
    sys.exit(R.finish())


asyncio.run(main())
