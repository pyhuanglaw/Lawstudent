"""CC（帳號 A）11-12：CLASS12——大一上三科課堂內容補寫（BB 04:01，P1；使用者「上課至少也要播完吧」的內容那一面）。新版＝開發分支 57e2e22c2 以後；舊版對照＝1d4db297a（同一週約 4 句）。
Windows＋GPU（PC runner）≠ iPhone；雲端 SwiftShader 只做探針自檢。不用 ?turbo、不瞬移；讀檔只當前置（log 印 [前置／捷徑]）。觸控一律 CDP（playlib.touch_tap）。
共用 cc_goclass_probe.py 的函式（import；那一支的 main 只在直接執行時跑）：記錄鉤子（GAME.say／choose／caption／enter、CLS.*）、真的上床睡覺（GC.sleep_wake）、起床選單、手機「今天」。
稿：企劃線 d3a22505b 的 docs/story_planning/syllabus/Y1S1.json（另存 fixtures/class12/Y1S1_d3a22505b.json；SCRIPT=可換）。對那一週的 board、line、more、react、call、ask（obs 討論也記）。
對照的程式（57e2e22c2 src/classes3d.js）：S.attend 第 357–376 行——黑板（3D 黑板 E.zone.setBoard；沒有 3D 黑板的教室是字幕「黑板」）→ line（教授在場＝S.profParts 拆句、名字是教授；
  不在場＝「○老師：」開頭）→ more（照順序各一句）→ 同學 react（pickReact：在場、這學期在學校的人裡照 S.rot 輪一句）→ tpl C 的 call（「○老師點到你。」→ 選項加「」→ follow 照順序）
  ／tpl B 的討論（S.discuss）→ S.classAsk（第 771 行：「（下課前，教授在黑板角落寫了一題。）」→ 題目 → 選項 →「答案是…」→ 這學期第一題多一句「期末考，會考這樣的題目。」）
  → 轉暗快轉到下課 → 字幕「下課了。○老師收起講義。」。題目來自 EXAM_BANK（S.askOf：id、course、term 都要對，status USER_CONFIRMED）。
  答題的紀錄：CLS.rec(G).ask['Y1S1:題號']、GM.addNote('ask_題號')、STUDY.answer（觀念卡：答對＝答對過、答錯＝miss）、LEGAL（G.legal.q）。「法律」頁在 ☰ 筆記本（renderLegal），不在手機上——兩個都截圖。
  「略過對話」是 ADV 畫面上方的鍵（src/adv3d.js 第 46 行 #advTop 第二顆）；座位上課不是 ADV 畫面＝可能沒有這顆鍵（照實記）。
PARTS：
  CLASS   LESSONS（預設十二堂：憲法（上）第 2、6、7、15 週；刑法總則（一）第 4、7、10、13 週；民法總則第 4、6、12、15 週；COURSE=const_1,crim_gen1,civ_general（也收 憲法／刑總／民總）、WEEKS=2,6 選）。
          每一堂第一次：【前置／捷徑】最小存檔前一晚 23:00 宿舍房間 → 真的上床睡覺 → 起床選單照文字選「直接去上課」（起床選單第一項不是這一堂＝照文字「先起床再說」→ 手機「今天」那一列「直接去上課」）
          → 進教室 → 播完 → 下課。第 2 週（2025-09-08，第 −8 天）在舊開局之前：存檔加 LAW_START_DAY=−18、MAIN_D1=−13（新開局 8/29 的值，STORY.LAW_D0／MAIN_D1_NEW）【前置／捷徑】。
          ① 逐句（說話的人、對話框上的名字、字）、每句打完字截一張；句數；坐下（seatPick／attend）到「下課了」幾秒、每句停留幾秒（探針點的速度：對話出現 500 ms 後點、打字中先補完再點一下翻頁、加截圖時間）。
             和稿逐字對（去掉「」『』和空白、去掉「○老師：」再比；教授一句被 profParts 拆成「話（動作）話」也算）：line → more（照順序、每一句都要有）→ 同學 react（是稿裡那一週的其中一句就算對）；
             黑板三行（3D 黑板 setBoard 的參數，或「黑板」字幕）對 board。
          ② 有 call 的週：同一堂再讀兩次（【前置／捷徑】讀檔到上課前 40 分鐘宿舍房間 → 真的點手機「今天」→「直接去上課」），三個選項各選一次；每次 follow 都要播（教授講出答案）、選了以後課照常播完。
          ③ 有 ask 的週：題目真的出來、題目和選項和 EXAM_BANK 那一題一致；第一次答對、第二次（讀檔，同上）答錯；紀錄有變（R.ask、notes、STUDY、G.legal）；真的打開 ☰ 筆記本「法律」頁和手機截圖。
             刑總第 13 週是新掛的 CRIM45_33（討論收尾之後），特別記。
          ④ 對話框上的名字：張教授／吳教授／周教授；教授不在場（每句前面「○老師：」）抽到就截一張。每句 ≤40 字（超過的列出來，只記）；對話框裡的字有沒有被切掉（R.check）。
          ⑤ 下課後：done／attend 有記、手機「今天」寫「上過了」、沒有 JS 例外。SKIPRUN（預設 crim_gen1:10）那一堂另外跑一次（讀檔＋手機）：畫面上有「略過 »」（69374803a 起；沒有就找 ADV 的「略過對話」）就按，略過以後出席照記。
  OLDSAVE ⑥ 舊存檔：三個參數（{url2} {url} {out}）時，先開 url2（線上 779ddd650）讀【前置】學期中的最小存檔（OLDLESSON 那一堂的前一晚 23:00 宿舍）、用舊版自己的 GAME.snapshot() 存下來
          （寫到 <out>/class12_oldsave.json），再開新版讀進來 → 真的睡覺 → 去上那一堂 → 播完、done、沒有 JS 例外。只有兩個參數＝用新版的 GAME.snapshot 合成（log 寫明，不算舊存檔）。
舊版對照（SHA 前 9 碼是 1d4db297a，或 REF=1）：各科只跑一堂（憲法 6、刑總 10、民總 6），只記句數和秒數（D34 對照），不逐字對、不判 more。
  SKIP    （BB 04:27；69374803a 起座位上課有「略過 »」：#dlgSkip，在 #dlg 裡、右上方 top:-50px、min-width 76、高 44；只在 CLS.attend 那一段（GM.skipScope）出現、正在略過時藏起來；
          pointerup＝一路翻到下一個選項（GAME.choose 會把 D.skip3d 關掉＝選完要再按一次）；第一次答完課堂題 toast「題目和答案記在 ☰ 筆記本的「筆記」頁，學習進度在「法律」頁。」，旗標 ASK_NOTE_HINT＝一個存檔一次）。
          每科一週（憲法 6、刑總 13、民總 15；COURSE／WEEKS 可選）：先不略過跑一次（NOSKIP=0 不跑）當對照秒數 → 再跑一次略過：坐下以前、下課以後鍵不能在；坐下後第一句時量鍵的框（VIEWS=both：
          同一行切 viewport 橫向 844×390、直向 390×844 各量一次、各截一張；≥44 px；和對話框的字、名字、選項的交集；鍵中央 elementFromPoint）；在鍵的位置連點 5 下（每 150 ms，第一下＝按略過），
          每一下記點到什麼，判定沒有選到任何選項；每次停在選單（call、討論、題目）記下來、選完看下一句會不會自己翻（不能）、再按一次略過；略過到底：done／attend、手機「上過了」、
          ☰「筆記」「法律」兩頁截圖、通知逐字比對；有題的課略過完用同一份存檔（GAME.snapshot）接著上下一堂有題的課，通知不能再出；下課後的人物事件照記（沒有就寫沒有遇到）。
          舊版 57e2e22c2 沒有 GAME.skipScope＝D34 對照，只跑不略過的秒數。
          SKIP 預設網址加 ?tapguard（SKIPGUARD=0 不加）：和真的手機一樣有選單防連點，連點的結果才和使用者一樣。
環境變數：LW_TESTS SHA PARTS COURSE WEEKS SKIPRUN OLDLESSON SCRIPT REF EVQUIET（同 GOCLASS）PORTRAIT VIEWS NOSKIP SKIPGUARD
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=CLASS COURSE=crim_gen1 python3 cc_class12_probe.py <url> <out>
      舊存檔：PARTS=OLDSAVE python3 cc_class12_probe.py <url2（779ddd650）> <url（新版）> <out>"""
import os, sys, json, asyncio, time, re
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import playlib as L
import bbplay as P
import cc_goclass_probe as GC
from playwright.async_api import async_playwright

if len(sys.argv) >= 4: URL2, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
else: URL2, URL, OUT = None, sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
ENV = os.environ.get
SHA = (ENV('SHA') or '')[:9]
REF = ENV('REF') == '1' or SHA.startswith('1d4db297')
PARTS = [p.strip().upper() for p in (ENV('PARTS') or 'CLASS,OLDSAVE').split(',') if p.strip()]   # 另有 SKIP（不在預設裡）
ALIAS = {'憲法': 'const_1', 'const': 'const_1', '刑總': 'crim_gen1', 'crim': 'crim_gen1', '民總': 'civ_general', 'civ': 'civ_general'}
FULLSET = {'const_1': [2, 7, 15], 'crim_gen1': [4, 7, 10, 13], 'civ_general': [4, 6, 12, 15]}
REFSET = {'const_1': [15], 'crim_gen1': [10], 'civ_general': [6]}
PROFNM = {'const_1': '張教授', 'crim_gen1': '吳教授', 'civ_general': '周教授'}
SKIPRUN = ENV('SKIPRUN') or 'crim_gen1:10'
SKIPSET = [('const_1', 15), ('crim_gen1', 13), ('civ_general', 15)]   # PART SKIP 每科一週（BB 04:27）
VIEWS = ENV('VIEWS') or 'both'   # both＝第一次看到「略過 »」時直向、橫向各量一次截一張（同一行切 viewport）；one＝只量目前的方向
NOSKIP = ENV('NOSKIP') != '0'
SKIPGUARD = ENV('SKIPGUARD') != '0'   # 1＝每一堂先不略過跑一次當對照秒數
ASKHINT = '題目和答案記在 ☰ 筆記本的「筆記」頁，學習進度在「法律」頁。'
OLDLESSON = ENV('OLDLESSON') or 'crim_gen1:10'
SCRIPT = ENV('SCRIPT') or os.path.join(HERE, 'fixtures', 'class12', 'Y1S1_d3a22505b.json')
R = L.Run('class12', OUT)
GC.R = R; GC.OUT = OUT; GC.SHA = SHA
J = GC.J
shot = GC.shot


def lessons():
    base = REFSET if REF else FULLSET
    cs = [ALIAS.get(c.strip(), c.strip()) for c in (ENV('COURSE') or '').split(',') if c.strip()] or list(base)
    ws = [int(w) for w in (ENV('WEEKS') or '').split(',') if w.strip()]
    out = []
    for c in cs:
        for w in (ws or base.get(c, [])): out.append((c, w))
    return out


SY = {}
try:
    for _c in json.load(open(SCRIPT, encoding='utf-8'))['courses']: SY[_c['id']] = {q['w']: q for q in _c.get('syllabus', [])}
except Exception as _e:
    print('讀不到稿 %s：%r' % (SCRIPT, _e), flush=True)

# ---------- 遊戲裡讀的東西 ----------
FINDLESSON = r"""(([cid,w])=>{ const G0=GAME.G, G=Object.assign({},G0,{flags:Object.assign({},G0.flags||{},{LAW_START_DAY:-18,MAIN_D1:-13})});
  for(let d=-30; d<200; d++){ let t=null; try{ t=CALENDAR.termOf(d); }catch(e){} if(!t||t.id!=='Y1S1'||t.week!==w) continue; let its=[]; try{ its=CLS.dayItems(G,d); }catch(e){} const it=its.find(i=>i.c.id===cid); if(!it) continue;
    const k=CALENDAR.dateOf(d), pc=it.c.prof&&typeof CHARACTERS!=='undefined'?CHARACTERS[it.c.prof]:null;
    return {d,wd:k.wd===7?0:k.wd,key:k.key,item:it.key,t0:it.t0,t1:it.t1,zone:(it.room&&it.room.zone)||null,room:(it.room&&it.room.name)||'',first:its[0].key,firstName:its[0].c.name,name:it.c.name,
      prof:it.c.prof||null,profShort:CLS.profName(it.c),profChar:pc?pc.name:null}; } return null; })"""
BANKQ = r"""(id=>{ if(typeof EXAM_BANK==='undefined') return null; const q=EXAM_BANK.questions.find(x=>x.id===id); return q?JSON.parse(JSON.stringify({id:q.id,q:q.q,options:q.options||null,answer:q.answer,type:q.type,course:q.course,term:q.term,status:q.status,core:q.core||null})):null; })"""
ASKREC = r"""(qid=>{ const G=GAME.G, R=CLS.rec(G); let us=[]; try{ us=STUDY.unitsOfQ(qid).map(u=>({id:u.id,st:STUDY.status(G,u),raw:(G.study&&G.study.u||{})[u.id]||null,miss:((G.study&&G.study.miss)||[]).includes(u.id)})); }catch(e){}
  return {ask:R.ask?R.ask['Y1S1:'+qid]:undefined, note:!!(GAME.hasNote&&GAME.hasNote('ask_'+qid)), legal:JSON.parse(JSON.stringify(((G.legal||{}).q||{})[qid]||null)), study:us}; })"""
HEADS = "[...document.querySelectorAll('#choices button')].map(b=>((b.firstChild&&b.firstChild.nodeType===3)?b.firstChild.textContent:(b.textContent||'')).trim())"
DLGCHK = r"""(()=>{ const box=document.getElementById('dlg'), t=document.getElementById('dlgText'), n=document.getElementById('dlgName'); if(!box||box.classList.contains('hide')) return null; const rb=box.getBoundingClientRect();
  return {name:n?(n.style.display==='none'?'':(n.textContent||'').trim()):null, text:(t.textContent||''), clipped:t.scrollHeight>t.clientHeight+2||t.scrollWidth>t.clientWidth+2, inView:rb.left>=-1&&rb.top>=-1&&rb.right<=innerWidth+1&&rb.bottom<=innerHeight+1}; })()"""
SKIPBTN = r"""(()=>{ const vis=e=>{ if(!e) return false; const r=e.getBoundingClientRect(), cs=getComputedStyle(e); return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'; };
  const d=document.getElementById('dlgSkip'), dl=document.getElementById('dlg');
  if(d){ const r=d.getBoundingClientRect(); return {kind:'3d',has:true,vis:vis(d)&&!!dl&&!dl.classList.contains('hide'),c:[r.left+r.width/2,r.top+r.height/2],r:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],text:(d.textContent||'').trim()}; }
  const top=document.getElementById('advTop'); const b=top?[...top.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='略過對話'):null;
  if(b){ const r=b.getBoundingClientRect(); return {kind:'adv',has:true,vis:vis(b)&&!!(typeof ADV!=='undefined'&&ADV.active),c:[r.left+r.width/2,r.top+r.height/2],r:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],text:'略過對話'}; }
  return {has:false,skipScope:typeof GAME.skipScope==='function'}; })()"""
BOARDHOOK = r"""(()=>{ const z=GAME.E&&GAME.E.zone; if(!z||!z.setBoard||z.setBoard.__gc||!window.__GC) return false; const f=z.setBoard; z.setBoard=function(){ try{ window.__GC.push({k:'board',a:[...arguments].map(x=>String(x))}); }catch(e){} return f.apply(this,arguments); }; z.setBoard.__gc=1; return true; })()"""
ENTERHOOK = r"""(()=>{ if(window.__C12E===GAME) return 'again'; window.__C12E=GAME; const f0=GAME.enter; GAME.enter=function(){ const r=f0.apply(this,arguments); try{ if(r&&r.then) r.then(()=>{ try{ (0,eval)(%s); }catch(e){} }); }catch(e){} return r; }; return 'ok'; })()"""


def norm(t):
    t = re.sub(r'[「」『』\s]', '', str(t or ''))
    return re.sub(r'^[^：]{1,4}老師：', '', t)


def find_seq(says, target, start):
    """target（稿的一句）在 says（[norm 過的字]）的哪裡：一句一樣，或連續兩三句接起來一樣（profParts 拆句）。回傳 (起點, 用了幾句) 或 None"""
    nt = norm(target)
    for i in range(start, len(says)):
        if says[i] == nt: return i, 1
        acc = says[i]
        for k in range(1, 3):
            if i + k >= len(says): break
            acc += says[i + k]
            if acc == nt: return i, k + 1
    return None


async def heads(pg):
    return await pg.evaluate(HEADS)


async def tap_head(pg, cdp, k):
    await P.tap_choice(pg, cdp, k)


async def setup_page(pg):
    await pg.evaluate("localStorage.clear()"); await GC.hook(pg)
    await pg.evaluate(ENTERHOOK % json.dumps(BOARDHOOK))


async def go_lesson(pg, cdp, L_, tag, via):
    """去上課：via='wake'（前一晚真的睡覺 → 起床選單）／'phone'（【前置／捷徑】讀檔到上課前 40 分鐘宿舍 → 手機「今天」）。回傳 True／False"""
    early = L_['d'] < 1
    fl = {'LAW_START_DAY': -18, 'MAIN_D1': -13} if early else {}
    dd = {'d': L_['d'], 'wd': L_['wd'], 'key': L_['key']}
    if early: R.setup('%s：第 %d 天在舊開局（第 1 天＝9/17）以前：存檔加 LAW_START_DAY=-18、MAIN_D1=-13（新開局 8/29 的值）' % (tag, L_['d']))
    if via == 'wake':
        w = await GC.sleep_wake(pg, cdp, tag, day=dd, flags=fl)
        if not w: R.check('%s：前一晚真的睡覺、醒來' % tag, False); return False
        if not await GC.wait_wake_say(pg, cdp, tag): R.check('%s：起床選單出了' % tag, False); return False
        for _ in range(30):
            s = await GC.ms(pg)
            if s['ch']: break
            if s['dlg']: await pg.wait_for_timeout(600); await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(300)
        hs = await heads(pg); await shot(pg, '%s_wakemenu' % tag)
        await pg.wait_for_timeout(600)
        if hs and hs[0].startswith('直接去上課') and L_['name'] in hs[0]:
            got = await GC.tap_text(pg, cdp, ['直接去上課']); R.note('%s：起床選單 %s → 照文字「%s」' % (tag, J(hs), got)); return bool(got)
        got = await GC.tap_text(pg, cdp, ['先起床']); R.note('%s：起床選單第一項不是這一堂（%s）→ 照文字「%s」，再用手機「今天」' % (tag, J(hs), got))
        await GC.play(pg, cdp, picks=('先起床',), max_s=20, idle_s=2, tag=tag)
    else:
        h = L_['t0'] - 40 / 60
        await GC.load(pg, cdp, GC.mkstate(dd, h, 'dorm', fl), '%s：【前置／捷徑】最小存檔 %s（第 %d 天）%02d:%02d 宿舍房間（上課前 40 分鐘）' % (tag, L_['key'], L_['d'], int(h), round(h % 1 * 60)))
        await pg.evaluate(ENTERHOOK % json.dumps(BOARDHOOK))
    op, t, _, _ = await GC.phone_today(pg, cdp, tag, week=False)
    sel = '#phoneBody [data-go="%s"]' % L_['item']
    lab = await pg.evaluate("s=>{ const b=document.querySelector(s); return b?b.textContent.trim():null; }", sel)
    R.note('%s：手機「今天」那一列的鍵＝%s' % (tag, J(lab)))
    if not lab: R.check('%s：手機「今天」有「直接去上課」' % tag, False, t[:300]); return False
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(800)
    return True


async def class_loop(pg, cdp, L_, tag, sy, call_pick=0, ask_right=True, skipdlg=False, max_s=600):
    """上課：對話照正常速度點；call 選 call_pick、題目照 ask_right 選對／錯、討論選第一項、下課選單選「先自由活動」。每句打完字截一張、看字有沒有被切掉。
    停在 done 有這一堂、人空下來 3 秒。回傳 {'menus','dlgchk','skip'}"""
    n1 = await GC.logn(pg); t0 = time.time(); free = None; shots = {'seen': 0, 'absent': False}; menus = []; chk = []; skipinfo = {'tried': False}
    key = L_['item']; bank = None
    if sy and sy.get('ask'): bank = await pg.evaluate(BANKQ, sy['ask']['qid'])
    callopts = [norm(o) for o in ((sy or {}).get('call') or {}).get('options', [])]
    obsopts = [norm(o.get('text')) for o in ((sy or {}).get('obs') or {}).get('options', [])]
    while time.time() - t0 < max_s:
        s = await GC.ms(pg)
        lg = await GC.logs(pg, n1)
        i0 = next((i for i, e in enumerate(lg) if e['k'] == 'cls' and e['fn'] in ('attend', 'seatPick')), None)
        if i0 is not None:
            ls = [e for e in lg[i0:] if e['k'] in ('say', 'cap')]
            if len(ls) > shots['seen'] and ((s['dlg'] and not s['typing']) or ls[-1]['k'] == 'cap' or s['ch']):
                shots['seen'] = len(ls); fn = await shot(pg, '%s_line%02d' % (tag, len(ls)))
                d = await pg.evaluate(DLGCHK)
                if d: chk.append({'n': len(ls), 'shot': fn, 'name': d['name'], 'clipped': d['clipped'], 'inView': d['inView'], 'text': d['text'][:60]})
                if not shots['absent'] and re.match(r'^[^：]{1,4}老師：', ls[-1]['text']): shots['absent'] = True; await shot(pg, '%s_prof_absent' % tag); R.note('%s：教授不在場的句子（截圖）：%s' % (tag, ls[-1]['text']))
            if skipdlg and not skipinfo['tried'] and s['dlg']:
                sb = await pg.evaluate(SKIPBTN); skipinfo.update(tried=True, btn=sb)
                if sb.get('vis'): await L.touch_tap(cdp, sb['c'][0], sb['c'][1]); skipinfo['tapped'] = True; R.note('%s：按略過（%s）%s' % (tag, sb.get('text'), J(sb)))
                else: R.note('%s：畫面上沒有可按的略過鍵（%s）' % (tag, J(sb)))
        done = await pg.evaluate("k=>!!CLS.rec(GAME.G).done[k]", key)
        if s['ch']:
            free = None; await pg.wait_for_timeout(600); hs = await heads(pg)
            if not hs: continue
            nh = [norm(h) for h in hs]; k = None; why = ''
            if any(h.startswith(('先自由活動', '直接去下一堂', '先去吃飯')) for h in hs): k = next(i for i, h in enumerate(hs) if h.startswith('先自由活動')); why = '下課選單'
            elif callopts and nh == callopts: k = min(call_pick, len(hs) - 1); why = 'call'
            elif obsopts and nh == obsopts: k = 0; why = '討論'
            elif bank and (hs[0].startswith('（') or hs == ['對', '錯']):
                ans = str(bank['answer']); right = next((i for i, h in enumerate(hs) if h.startswith('（' + ans + '）') or h == ans), None)
                k = right if ask_right else next((i for i in range(len(hs)) if i != right), 0); why = 'ask（%s）' % ('答對' if ask_right else '答錯')
                if k is None: k = 0; why = 'ask（★選項裡找不到題庫答案 %s，照第一項；選單和題庫 %s 不一致或不是那一題）' % (ans, bank.get('id'))   # r2：civ_b 第一輪 TypeError
            elif hs[0].startswith('「') and callopts: k = min(call_pick, len(hs) - 1); why = 'call（字和稿不一樣）'
            else: k = 0; why = '其他（第一項）'
            menus.append({'why': why, 'opts': hs, 'pick': hs[k]}); R.note('%s：選單［%s］%s → %s' % (tag, why, J(hs), hs[k]))
            await shot(pg, '%s_menu%d' % (tag, len(menus))); await tap_head(pg, cdp, k); await pg.wait_for_timeout(700); continue
        if s['dlg']:
            free = None; await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['busy'] or s['fade'] or s['paused']: free = None; await pg.wait_for_timeout(250); continue
        free = free or time.time()
        if done and time.time() - free >= 3: break
        if not done and time.time() - free >= 25: R.note('%s：空下來 25 秒還沒下課（%s）' % (tag, J(s))); break
        await pg.wait_for_timeout(200)
    await GC.play(pg, cdp, picks=('先自由活動',), max_s=20, idle_s=4, tag=tag + '_after')
    return {'menus': menus, 'dlgchk': chk, 'skip': skipinfo, 'n1': n1, 'secs': round(time.time() - t0, 1)}


def compare(tag, cid, w, sy, cl, menus, call_pick):
    """和稿逐字對：line → more（照順序）→ react（其中一句）；call 的 follow；board。回傳缺的清單"""
    says = [e for e in cl if e['k'] == 'say']; N = [norm(e['text']) for e in says]; miss = []; pos = 0; res = []
    for kind, t in [('line', sy.get('line'))] + [('more', m) for m in (sy.get('more') or [])]:
        if not t: continue
        f = find_seq(N, t, pos)
        if f is None:
            g = find_seq(N, t, 0); miss.append((kind, t, '順序不對' if g else '沒有播')); res.append([kind, t, None])
        else: pos = f[0] + f[1]; res.append([kind, t, f[0]])
    R.note('%s：稿 line／more 對到的位置 %s' % (tag, J(res)))
    rs = sy.get('react') or []
    if rs:
        hit = None
        for i in range(pos, len(says)):
            for r in rs:
                if norm(r['text']) and norm(r['text']) in N[i]: hit = (i, r, says[i]['text']); break
            if hit: break
        R.note('%s：同學 react %s（稿 %s）' % (tag, J(hit[2]) if hit else '沒有出現在 more 之後', J([r['who'] + '：' + r['text'] for r in rs])))
        if not hit: miss.append(('react', J([r['text'] for r in rs]), '沒有（或不在 more 之後；人不在場時遊戲照規則不說——看 log 的在場）'))
        else: pos = hit[0] + 1
    else: R.note('%s：稿裡這一週沒有 react（應該不說同學那一句）' % tag)
    if sy.get('call'):
        c = sy['call']; ic = next((i for i, e in enumerate(says) if e['text'].endswith('點到你。')), None)
        R.note('%s：call「…點到你。」在第 %s 句；選單 %s' % (tag, ic, J([m for m in menus if m['why'].startswith('call')])))
        if ic is None: miss.append(('call', '點到你', '沒有'))
        p2 = ic + 1 if ic is not None else pos
        for f in c.get('follow') or []:
            g = find_seq(N, f, p2)
            if g is None: miss.append(('follow', f, '沒有播'))
            else: p2 = g[0] + g[1]
    return miss


async def board_of(pg, n1):
    lg = await GC.logs(pg, n1)
    b = [e['a'] for e in lg if e['k'] == 'board']
    cap = [e['text'] for e in lg if e['k'] == 'cap' and e.get('who') == '黑板']
    return b[-1] if b else None, cap[-1] if cap else None


async def legal_pages(pg, cdp, tag):
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1000)
    await L.tap(pg, cdp, '[data-tab="legal"]'); await pg.wait_for_timeout(900)
    t = await pg.evaluate("(document.getElementById('legalList')||{}).innerText||''"); fn = await shot(pg, '%s_menu_legal' % tag)
    await L.tap(pg, cdp, '[data-tab="notes"]'); await pg.wait_for_timeout(700)
    nt = await pg.evaluate("(document.getElementById('tab-notes')||document.getElementById('menu')||{}).innerText||''"); await shot(pg, '%s_menu_notes' % tag)
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(400)
    R.note('%s：☰ 筆記本「法律」頁（%s）：%s' % (tag, fn, t.replace('\n', ' ｜ ')[:700]))
    R.note('%s：☰ 筆記本「筆記」頁（課堂提問的筆記 ask_…）：%s' % (tag, nt.replace('\n', ' ｜ ')[:500]))
    return t


async def one_run(pg, cdp, errs, cid, w, L_, sy, run, via, call_pick=0, ask_right=True, skipdlg=False):
    tag = 'c12_%s_w%d_%s' % (cid, w, run)
    print('----- %s（%s 第 %d 週 %s；%s；call 選第 %d 項；題目%s%s）-----' % (tag, L_['name'], w, L_['key'], via, call_pick + 1, '答對' if ask_right else '答錯', '；略過對話' if skipdlg else ''), flush=True)
    e0 = len(errs)
    qid = ((sy or {}).get('ask') or {}).get('qid')
    if not await go_lesson(pg, cdp, L_, tag, via): return None
    r0 = await pg.evaluate(GC.REC); a0 = await pg.evaluate(ASKREC, qid) if qid else None   # 按下「直接去上課」那一刻（還在路上，課還沒開始）
    out = await class_loop(pg, cdp, L_, tag, sy, call_pick, ask_right, skipdlg)
    lg = await GC.logs(pg, out['n1']); r1 = await pg.evaluate(GC.REC)
    ent = [e['to'] for e in lg if e['k'] == 'enter']
    cl, _ = GC.class_lines(lg); sec, dw = GC.class_timing(lg, cl)
    R.check('%s：進了教室（%s；教室 zone %s）' % (tag, J(ent), L_['zone']), L_['zone'] in ent or r1['zone'] == L_['zone'])
    R.note('%s：課堂 %d 句（say＋字幕）；坐下到「下課了」%s 秒；整段 %s 秒；每句停留 %s' % (tag, len(cl), sec, out['secs'], J(dw)))
    for e in cl: R.note('    [%s %.3f] 名字「%s」(%s)：%s' % (e['k'], e.get('h') or 0, e.get('shown') if e.get('shown') is not None else (e.get('who') or ''), e.get('cid') or '', e['text']))
    long_ = [[len(e['text']), e['text']] for e in cl if len(e['text']) > 40]
    R.note('%s：超過 40 字的句子 %s' % (tag, J(long_) if long_ else '沒有'))
    clip = [c for c in out['dlgchk'] if c['clipped'] or not c['inView']]
    R.check('%s：對話框的字沒有被切掉、對話框在畫面裡（%d 句檢查）' % (tag, len(out['dlgchk'])), not clip, J(clip))
    exp = PROFNM.get(cid); pl = [e for e in cl if e['k'] == 'say' and (e.get('cid') or '').startswith('prof')]
    bad = [[e.get('shown'), e['text'][:20]] for e in pl if e.get('shown') not in (None, exp)]
    R.note('%s：教授說的 %d 句，對話框名字 %s；不在場（「○老師：」開頭）%d 句' % (tag, len(pl), J(sorted(set(str(e.get('shown')) for e in pl))), sum(1 for e in cl if re.match(r'^[^：]{1,4}老師：', e['text']))))
    if not REF: R.check('%s：對話框上教授的名字是「%s」（人物資料 %s）' % (tag, exp, L_['profChar']), not bad, J(bad))
    bd, bcap = await board_of(pg, out['n1'])
    if not REF and sy:
        R.note('%s：黑板 setBoard=%s；黑板字幕=%s；稿 board=%s' % (tag, J(bd), J(bcap), J(sy.get('board'))))
        okb = (bd and [norm(x) for x in bd[:3]] == [norm(x) for x in sy.get('board', [])[:3]]) or (bcap and all(norm(x) in norm(bcap) for x in sy.get('board', []) if x))
        R.check('%s：黑板三行和稿一樣' % tag, bool(okb), J({'setBoard': bd, 'cap': bcap}))
        miss = compare(tag, cid, w, sy, cl, out['menus'], call_pick)
        R.check('%s：line → more → 同學 react 都播了、順序對、逐字對（call 的 follow 也播了）' % tag, not miss, J(miss))
    elif REF: R.note('%s（D34 舊版對照）：只記句數 %d、秒數 %s；黑板 %s' % (tag, len(cl), sec, J(bd or bcap)))
    R.check('%s：done／attend 有記' % tag, bool(r1['done'].get(L_['item'])) and (r1['attend'].get(cid) or 0) > (r0['attend'].get(cid) or 0), J(GC.rdiff(r0, r1)))
    if qid:
        bank = await pg.evaluate(BANKQ, qid); a1 = await pg.evaluate(ASKREC, qid)
        iq = next((i for i, e in enumerate(cl) if e['k'] == 'say' and e['text'].startswith('（下課前，教授在黑板角落寫了一題')), None)
        qshown = cl[iq + 1]['text'] if iq is not None and iq + 1 < len(cl) else None
        am = next((m for m in out['menus'] if m['why'].startswith('ask')), None)
        bopts = (['（%s）%s' % (k, v) for k, v in bank['options'].items()] if bank and bank.get('options') else ['對', '錯']) if bank else None
        R.note('%s：題目 %s：EXAM_BANK %s' % (tag, qid, J(bank)))
        R.check('%s：%s 題目真的出來、和 EXAM_BANK 一樣（%s）' % (tag, qid, J(qshown)), bool(bank) and qshown == bank['q'])
        R.check('%s：%s 選項和 EXAM_BANK 一樣（%s）' % (tag, qid, J(am and am['opts'])), bool(am) and am['opts'] == bopts, J(bopts))
        ans = next((e['text'] for e in cl if e['k'] == 'say' and e['text'].startswith('答案是')), None)
        R.note('%s：答案那一句 %s；答%s' % (tag, J(ans), '對' if ask_right else '錯'))
        R.note('%s：答題紀錄 前 %s → 後 %s' % (tag, J(a0), J(a1)))
        ch = bool(a1) and (a1['ask'] is not None) and a1 != a0
        R.check('%s：學習紀錄有變（R.ask＝%s、筆記 %s、LEGAL %s、觀念卡 %s）' % (tag, J(a1 and a1['ask']), a1 and a1['note'], J(a1 and a1['legal']), J(a1 and a1['study'])), ch)
        await legal_pages(pg, cdp, tag)
        if cid == 'crim_gen1' and w == 13: R.note('%s：【特別看】刑總第 13 週新掛 CRIM45_33：EXAM_BANK 有沒有 %s、出在討論收尾之後 %s' % (tag, bool(bank), J([m['why'] for m in out['menus']])))
    if (sy or {}).get('call'):
        cm = [m for m in out['menus'] if m['why'].startswith('call')]
        R.check('%s：call 選單出了、選第 %d 項（%s）以後課照常播完' % (tag, call_pick + 1, J(cm)), bool(cm) and bool(r1['done'].get(L_['item'])))
    if skipdlg: R.note('%s：略過對話 %s；略過以後出席 %s' % (tag, J(out['skip']), J(GC.rdiff(r0, r1))))
    op, t, _, _ = await GC.phone_today(pg, cdp, tag, week=False)
    i = t.find(L_['name']); seg = t[i:i + 90] if i >= 0 else ''
    R.check('%s：手機「今天」那一列寫「上過了」（%s）' % (tag, seg.replace('\n', ' ')), '上過了' in seg)
    await GC.close_phone(pg, cdp)
    R.check('%s：沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))
    return {'lines': len(cl), 'sec': sec}


async def part_class(p):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not GC.PORTRAIT)
    try:
        await pg.goto(URL); R.check('CLASS：遊戲載入', await L.wait_loaded(pg)); await setup_page(pg)
        R.note('CLASS：%s；稿 %s' % ('舊版對照（D34，只記句數、秒數）' if REF else '新版', SCRIPT))
        summ = {}
        for cid, w in lessons():
            L_ = await pg.evaluate(FINDLESSON, [cid, w])
            if not R.check('%s 第 %d 週：找到那一天（%s）' % (cid, w, J(L_)), bool(L_)): continue
            sy = SY.get(cid, {}).get(w)
            if not REF:
                R.note('[稿] %s 第 %d 週：tpl %s；line 1＋more %d 句；react %d 句；call %s；ask %s；obs %s' % (cid, w, sy and sy.get('tpl'), len((sy or {}).get('more') or []), len((sy or {}).get('react') or []),
                       bool((sy or {}).get('call')), J((sy or {}).get('ask')), bool((sy or {}).get('obs'))))
            r = await one_run(pg, cdp, errs, cid, w, L_, None if REF else sy, 'r1', 'wake', 0, True)
            summ['%s_w%d' % (cid, w)] = r
            if REF: continue
            if (sy or {}).get('call'):
                await one_run(pg, cdp, errs, cid, w, L_, sy, 'r2', 'phone', 1, False)
                await one_run(pg, cdp, errs, cid, w, L_, sy, 'r3', 'phone', 2, False)
            elif (sy or {}).get('ask'):
                await one_run(pg, cdp, errs, cid, w, L_, sy, 'r2', 'phone', 0, False)
            if SKIPRUN == '%s:%d' % (cid, w):
                await one_run(pg, cdp, errs, cid, w, L_, sy, 'skip', 'phone', 0, True, skipdlg=True)
        R.note('[CLASS 統計] 每一堂第一次的句數、坐下到下課秒數：%s' % J(summ))
    finally:
        await b.close()


async def part_oldsave(p):
    cid, w = OLDLESSON.split(':'); w = int(w)
    st = None
    if URL2:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=not GC.PORTRAIT)
        try:
            await pg.goto(URL2); R.check('OLDSAVE：舊版（url2）載入', await L.wait_loaded(pg)); await setup_page(pg)
            ver = await pg.evaluate("(document.getElementById('titleScreen')||{}).innerText||''")
            R.note('OLDSAVE：舊版標題畫面的字（版本）：%s' % ver.replace('\n', ' ')[-120:])
            L_ = await pg.evaluate(FINDLESSON, [cid, w]); prev = await P.day_of(pg, await pg.evaluate("d=>CALENDAR.dateOf(d).key", L_['d'] - 1))
            await GC.load(pg, cdp, GC.mkstate(prev, 23.0, 'dorm'), 'OLDSAVE：舊版讀最小存檔 %s 23:00 宿舍房間（學期中）' % prev['key'])
            st = await pg.evaluate("GAME.snapshot()")
            R.setup('OLDSAVE：用舊版自己的 GAME.snapshot() 存下來（版本欄位 %s）' % J({k: st.get(k) for k in ('v', 'ver', 'version', 'saveVersion') if k in st}))
            R.check('OLDSAVE：舊版沒有 JS 例外', not errs, J(errs[:3]))
        finally:
            await b.close()
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not GC.PORTRAIT)
    try:
        await pg.goto(URL); R.check('OLDSAVE：新版載入', await L.wait_loaded(pg)); await setup_page(pg)
        L_ = await pg.evaluate(FINDLESSON, [cid, w])
        if st is None:
            prev = await P.day_of(pg, await pg.evaluate("d=>CALENDAR.dateOf(d).key", L_['d'] - 1))
            await GC.load(pg, cdp, GC.mkstate(prev, 23.0, 'dorm'), 'OLDSAVE：沒有 url2——用新版讀最小存檔再 GAME.snapshot() 合成（不是真的舊版存檔）')
            st = await pg.evaluate("GAME.snapshot()")
        json.dump(st, open(os.path.join(OUT, 'class12_oldsave.json'), 'w'), ensure_ascii=False)
        await GC.load(pg, cdp, st, 'OLDSAVE：新版讀這一份存檔（%s）' % ('舊版 779ddd650 存的' if URL2 else '合成'))
        await pg.evaluate(ENTERHOOK % json.dumps(BOARDHOOK))
        # 已經在前一晚 23:00 的宿舍：真的上床睡覺 → 起床 → 去上課
        n0 = await GC.logn(pg)
        if not await GC.bed(pg, cdp, 'oldsave'): R.check('OLDSAVE：床的選單有「睡到明天」', False); return
        t0 = time.time()
        while time.time() - t0 < 240:
            if any(e['k'] == 'cls' and e['fn'] == 'queueWake' for e in await GC.logs(pg, n0)) and await pg.evaluate("d=>GAME.G.day===d", L_['d']): break
            s = await GC.ms(pg)
            if s['ch']: await pg.wait_for_timeout(500); hs = await heads(pg); await tap_head(pg, cdp, len(hs) - 1); continue
            if s['dlg']: await pg.wait_for_timeout(400); await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(250)
        if not R.check('OLDSAVE：讀進來以後睡覺、第 %d 天醒來' % L_['d'], await pg.evaluate("d=>GAME.G.day===d", L_['d'])): return
        if not await GC.wait_wake_say(pg, cdp, 'oldsave'): R.check('OLDSAVE：起床選單出了', False); return
        for _ in range(30):
            s = await GC.ms(pg)
            if s['ch']: break
            if s['dlg']: await pg.wait_for_timeout(600); await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(300)
        await pg.wait_for_timeout(600); got = await GC.tap_text(pg, cdp, ['直接去上課']); R.note('OLDSAVE：起床選單照文字 %s' % got)
        r0 = await pg.evaluate(GC.REC)
        out = await class_loop(pg, cdp, L_, 'oldsave', SY.get(cid, {}).get(w))
        lg = await GC.logs(pg, out['n1']); cl, _ = GC.class_lines(lg); sec, _dw = GC.class_timing(lg, cl); r1 = await pg.evaluate(GC.REC)
        R.note('OLDSAVE：課堂 %d 句、坐下到下課 %s 秒' % (len(cl), sec))
        R.check('OLDSAVE：舊存檔讀進新版去上 %s 第 %d 週：播完、done 有記' % (cid, w), len(cl) >= 3 and bool(r1['done'].get(L_['item'])), J(GC.rdiff(r0, r1)))
        R.check('OLDSAVE：新版沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


SKIPGEO = r"""(()=>{ const q=id=>{ const e=document.getElementById(id); if(!e) return null; const r=e.getBoundingClientRect(); return r.width&&r.height?[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]:null; };
  const sk=document.getElementById('dlgSkip'), r=sk?sk.getBoundingClientRect():null, c=r?[r.left+r.width/2,r.top+r.height/2]:null, hit=c?document.elementFromPoint(c[0],c[1]):null;
  const ch=document.getElementById('choices'); const btns=ch&&!ch.classList.contains('hide')?[...ch.querySelectorAll('button')].map(b=>{ const q=b.getBoundingClientRect(); return {t:((b.firstChild&&b.firstChild.nodeType===3)?b.firstChild.textContent:b.textContent||'').trim().slice(0,20),r:[Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)]}; }):[];
  return {vw:innerWidth,vh:innerHeight,skip:q('dlgSkip'),dlg:q('dlg'),text:q('dlgText'),name:(()=>{ const n=document.getElementById('dlgName'); return n&&n.style.display!=='none'?q('dlgName'):null; })(),choices:btns,
    atCenter:hit?(hit.id||String(hit.className||'').slice(0,30)||hit.tagName)+((hit.closest&&hit.closest('#choices button'))?'（選項 '+(hit.closest('#choices button').textContent||'').trim().slice(0,16)+'）':''):null}; })()"""


def inter(a, b):
    if not a or not b: return None
    x0, y0 = max(a[0], b[0]), max(a[1], b[1]); x1, y1 = min(a[0] + a[2], b[0] + b[2]), min(a[1] + a[3], b[1] + b[3])
    return [x0, y0, x1 - x0, y1 - y0] if x1 > x0 and y1 > y0 else None


async def skip_geo(pg, tag, label):
    g = await pg.evaluate(SKIPGEO); fn = await shot(pg, '%s_skipbtn_%s' % (tag, label))
    sk = g['skip']; ov = {k: inter(sk, g[k]) for k in ('text', 'name')}
    for c in g['choices']: ov['選項「%s」' % c['t']] = inter(sk, c['r'])
    big = bool(sk) and sk[2] >= 44 and sk[3] >= 44
    R.note('%s：「略過 »」%s（viewport %dx%d，截圖 %s）：框 %s、對話框 %s、字 %s、名字 %s；交集 %s；鍵中央 elementFromPoint＝%s' % (tag, label, g['vw'], g['vh'], fn, sk, g['dlg'], g['text'], g['name'], J({k: v for k, v in ov.items() if v}), g['atCenter']))
    R.check('%s：「略過 »」%s ≥44×44 px（%s）' % (tag, label, sk), big)
    R.check('%s：「略過 »」%s 沒有壓到對話框的字、名字（%s）' % (tag, label, J({k: ov[k] for k in ('text', 'name')})), not ov['text'] and not ov['name'])
    return g


async def skip_loop(pg, cdp, L_, tag, sy, use_skip=True, max_s=600):
    """略過的那一次：坐下以前、下課以後「略過 »」不能在；坐下以後第一句時量位置（直向、橫向），在那個位置連點 5 下（每 150 ms，第一下＝按略過）；
    之後每次停在選單：記停在哪一個選單、選了以後下一句會不會自己翻（要再按一次略過才繼續）、再按一次略過。回傳紀錄"""
    n1 = await GC.logn(pg); t0 = time.time(); free = None; info = {'before': [], 'after': [], 'menus': [], 'burst': None, 'presses': 0, 'stopAt': [], 'resume': []}
    key = L_['item']; bank = await pg.evaluate(BANKQ, sy['ask']['qid']) if sy and sy.get('ask') else None
    callopts = [norm(o) for o in ((sy or {}).get('call') or {}).get('options', [])]
    started = False; burst_done = not use_skip; last_menu_t = None; tsit = None; tend = None
    while time.time() - t0 < max_s:
        s = await GC.ms(pg); lg = await GC.logs(pg, n1)
        att = next((e for e in lg if e['k'] == 'cls' and e['fn'] in ('attend', 'seatPick')), None)
        done = await pg.evaluate("k=>!!CLS.rec(GAME.G).done[k]", key)
        sb = await pg.evaluate(SKIPBTN)
        if not att and sb.get('vis'): info['before'].append(s['dtext'])
        if done and sb.get('vis') and not info['after']: info['after'].append(s['dtext']); await shot(pg, '%s_skip_after_class' % tag)
        if att and not started and sb.get('vis'):   # r2（CC 05:4x）：PC 上 s['dlg']／typing 的取樣時機對不上，原條件一次都沒成立＝連點那段沒跑；改成坐下以後鍵一出現就開始（等打字最多 1.5 秒）
            for _ in range(6):
                if not (await GC.ms(pg)).get('typing'): break
                await pg.wait_for_timeout(250)
            started = True; tsit = time.time()
            R.note('%s：坐下以後「略過 »」出現，開始量位置、連點' % tag)
            if VIEWS == 'both' and use_skip:
                vp = pg.viewport_size
                for w_, h_, lab in ((844, 390, '橫向'), (390, 844, '直向')):
                    await pg.set_viewport_size({'width': w_, 'height': h_}); await pg.wait_for_timeout(700); await skip_geo(pg, tag, lab)
                await pg.set_viewport_size(vp); await pg.wait_for_timeout(700)
            else: await skip_geo(pg, tag, '直向' if GC.PORTRAIT else '橫向')
            sb = await pg.evaluate(SKIPBTN)
        if use_skip and started and not burst_done and sb.get('vis'):
            burst_done = True; c = sb['c']; nb = await GC.logn(pg); tb = await pg.evaluate("performance.now()")
            BN = int(os.environ.get('BURSTN') or '5'); BMS = int(os.environ.get('BURSTMS') or '150')   # BB 04:56：5 下／20 下、150／500 ms
            for k in range(BN):
                await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(BMS)
            await pg.wait_for_timeout(500)
            try:   # 被點掉的是掛的考題時：有沒有寫進一筆玩家沒選的答案（STUDY／筆記）——BB 判嚴重度的依據
                rec = await pg.evaluate("(()=>{ const G=GAME.G, R=CLS.rec(G); const st=typeof STUDY!=='undefined'&&STUDY.rec?STUDY.rec(G):null; return {ask:R.ask||null, notes:(G.notes||G.flags&&G.flags.notes||[]).slice?((G.notes||[]).slice(-3)):null, study:st?JSON.stringify(st).slice(0,400):null}; })()")
                R.note('%s：連點後 CLS.rec.ask／筆記／STUDY：%s' % (tag, J(rec)))
            except Exception as e: R.note('%s：讀 ask／筆記失敗 %r' % (tag, e))
            blg = await GC.logs(pg, nb)
            downs = [{'k': i + 1, 'tgt': e.get('tgt'), 'btn': e.get('btn'), 'menu': e.get('menu'), 'sinceMenu': e.get('sinceMenu')} for i, e in enumerate([x for x in blg if x['k'] == 'down'])]
            picks = [e for e in blg if e['k'] == 'pick']
            info['burst'] = {'at': c, 'downs': downs, 'picks': picks, 'menus': [e.get('opts') for e in blg if e['k'] == 'choose'], 'says': len([e for e in blg if e['k'] == 'say'])}
            info['presses'] += 1
            R.note('%s：在「略過 »」的位置連點 %d 下（每 %d ms，第一下＝按略過）：每一下 %s；這段時間翻過 %d 句、出現的選單 %s' % (tag, BN, BMS, J(downs), info['burst']['says'], J(info['burst']['menus'])))
            R.check('%s：連點 %d 下（每 %d ms）沒有選到任何選項（使用者踩到的那一種）' % (tag, BN, BMS), not picks, J([[p.get('first'), p.get('txt'), p.get('downDt')] for p in picks]))
            await shot(pg, '%s_after_burst' % tag)
            continue
        if s['ch']:
            if use_skip and os.environ.get('SKIPHIDE') == '1':   # BB 04:59（2d90b034c）：選項出來的時候「略過 »」要收起來（display:none）
                sbm = await pg.evaluate(SKIPBTN); R.check('%s：選單出現時「略過 »」收起來（看不到）' % tag, not sbm.get('vis'), J({k: sbm.get(k) for k in ('vis', 'r', 'disp') if k in sbm}))
            free = None; await pg.wait_for_timeout(600); hs = await heads(pg)
            if not hs: continue
            if att and not done:
                g = await pg.evaluate(SKIPGEO); sb3 = await pg.evaluate(SKIPBTN)
                ovc = {c['t']: inter(g['skip'], c['r']) for c in g['choices']} if (g['skip'] and sb3.get('vis')) else {}
                fn = await shot(pg, '%s_menu_skipgeo' % tag)
                R.note('%s：選單出現時「略過 »」看得到＝%s、框 %s、鍵中央 elementFromPoint＝%s、選項 %s（截圖 %s）' % (tag, sb3.get('vis'), g['skip'], g['atCenter'], J(g['choices']), fn))
                R.check('%s：選單出現時「略過 »」沒有壓到選項（%s）' % (tag, J({k_: v for k_, v in ovc.items() if v})), not any(ovc.values()))
            nh = [norm(h) for h in hs]
            if any(h.startswith(('先自由活動', '直接去下一堂', '先去吃飯')) for h in hs): k = next(i for i, h in enumerate(hs) if h.startswith('先自由活動')); why = '下課選單'
            elif callopts and nh == callopts: k = 0; why = 'call'
            elif bank and (hs[0].startswith('（') or hs == ['對', '錯']):
                ans = str(bank['answer']); k = next((i for i, h in enumerate(hs) if h.startswith('（' + ans + '）') or h == ans), 0); why = 'ask（答對）'
            else: k = 0; why = '其他（第一項）'
            if att and not done: info['stopAt'].append({'why': why, 'opts': hs}); await shot(pg, '%s_skip_stop%d' % (tag, len(info['stopAt'])))
            info['menus'].append([why, hs[k]]); R.note('%s：停在選單［%s］%s → %s' % (tag, why, J(hs), hs[k]))
            await tap_head(pg, cdp, k)
            last_menu_t = time.time(); await pg.wait_for_timeout(300)
            if use_skip and att and not done:
                # 選完：下一句要停住（不自己翻）；1.5 秒後看還是不是同一句，再按一次略過
                await pg.wait_for_timeout(300); a = await GC.ms(pg); await pg.wait_for_timeout(1500); b2 = await GC.ms(pg); sb2 = await pg.evaluate(SKIPBTN)
                same = a['dlg'] and b2['dlg'] and a['dtext'] == b2['dtext']
                info['resume'].append({'stayed': same, 'text': b2['dtext'], 'btnVisible': sb2.get('vis')})
                R.note('%s：選完以後下一句停住、不自己翻＝%s（「%s」）；「略過 »」又出現＝%s' % (tag, same, b2['dtext'], sb2.get('vis')))
                if sb2.get('vis'): await L.touch_tap(cdp, sb2['c'][0], sb2['c'][1]); info['presses'] += 1
            continue
        if s['dlg']:
            free = None
            if use_skip and att and not done and sb.get('vis') and burst_done:
                await L.touch_tap(cdp, sb['c'][0], sb['c'][1]); info['presses'] += 1; await pg.wait_for_timeout(300); continue
            await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['busy'] or s['fade'] or s['paused']: free = None; await pg.wait_for_timeout(200); continue
        if done and tend is None: tend = await pg.evaluate("performance.now()")
        free = free or time.time()
        if done and time.time() - free >= 3: break
        if not done and time.time() - free >= 25: R.note('%s：空下來 25 秒還沒下課（%s）' % (tag, J(s))); break
        await pg.wait_for_timeout(200)
    await GC.play(pg, cdp, picks=('先自由活動',), max_s=20, idle_s=4, tag=tag + '_after')
    lg = await GC.logs(pg, n1); att = next((e for e in lg if e['k'] == 'cls' and e['fn'] in ('attend', 'seatPick')), None)
    info['n1'] = n1; info['sitToFree'] = round((tend - att['t']) / 1000, 1) if (tend and att) else None
    cap = next((e for e in lg if e['k'] == 'cap' and '下課' in e['text']), None)
    info['menusInClass'] = [{'opts': e.get('opts'), 't': e['t']} for e in lg if e['k'] == 'choose' and att and e['t'] > att['t'] and (not cap or e['t'] < cap['t'])]
    info['picksInClass'] = [{'first': e.get('first'), 'txt': e.get('txt'), 'dt': e.get('dt'), 'downDt': e.get('downDt')} for e in lg if e['k'] == 'pick' and att and e['t'] > att['t'] and (not cap or e['t'] < cap['t'] + 1)]
    return info


async def part_skip(p):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not GC.PORTRAIT)
    try:
        u = GC.guard_url(URL) if SKIPGUARD else URL
        await pg.goto(u); R.check('SKIP：遊戲載入（%s）' % u, await L.wait_loaded(pg)); await setup_page(pg)
        R.note('SKIP：防連點 %s（SKIPGUARD=1＝網址加 ?tapguard，和手機一樣擋選單出現 350 ms 內的點；自動化瀏覽器不加就不擋）' % J(await pg.evaluate(GC.GUARDINFO)))
        has = await pg.evaluate("typeof GAME.skipScope==='function'")
        R.note('SKIP：遊戲有沒有座位上課的「略過 »」（GAME.skipScope）＝%s%s' % (has, '' if has else '（D34 舊版對照：57e2e22c2 沒有＝預期，只跑不略過的秒數）'))
        sel = lessons() if (ENV('COURSE') or ENV('WEEKS')) else SKIPSET
        carry = None; hinted = False; summ = {}
        for cid, w in sel:
            L_ = await pg.evaluate(FINDLESSON, [cid, w])
            if not R.check('SKIP %s 第 %d 週：找到那一天（%s）' % (cid, w, J(L_ and L_['key'])), bool(L_)): continue
            sy = SY.get(cid, {}).get(w); tag0 = 'sk_%s_w%d' % (cid, w); row = {}
            if NOSKIP or not has:
                print('----- %s 不略過（對照秒數）-----' % tag0, flush=True)
                if await go_lesson(pg, cdp, L_, tag0 + '_plain', 'phone'):
                    o = await skip_loop(pg, cdp, L_, tag0 + '_plain', sy, use_skip=False)
                    lg = await GC.logs(pg, o['n1']); cl, _ = GC.class_lines(lg); sec, _d = GC.class_timing(lg, cl)
                    row['plain'] = {'lines': len(cl), 'sitToClassEnd': sec, 'sitToFree': o['sitToFree']}
                    R.note('%s：不略過 %d 句、坐下到「下課了」%s 秒、坐下到下課能動 %s 秒' % (tag0, len(cl), sec, o['sitToFree']))
                    tl = [e for e in lg if e['k'] == 'toast' and e['text'] == ASKHINT]
                    if sy and sy.get('ask'): R.note('%s：不略過那一次（新存檔）答題後的通知 %s' % (tag0, J([e['text'] for e in tl]) if tl else '沒有'))
            if not has: summ[tag0] = row; continue
            print('----- %s 略過 -----' % tag0, flush=True)
            e0 = len(errs); tag = tag0 + '_skip'
            if carry is not None:
                st = json.loads(json.dumps(carry)); st.update(day=L_['d'], weekday=L_['wd'], hour=L_['t0'] - 40 / 60, zone='dorm', pos=None)
                await GC.load(pg, cdp, st, '%s：【前置／捷徑】接著用同一份存檔（上一堂有題的課略過完的 GAME.snapshot，已經有 ASK_NOTE_HINT=%s）改成 %s %02d:%02d 宿舍房間' % (
                    tag, J(carry.get('flags', {}).get('ASK_NOTE_HINT')), L_['key'], int(st['hour']), round(st['hour'] % 1 * 60)))
                await pg.evaluate(ENTERHOOK % json.dumps(BOARDHOOK))
                await GC.phone_today(pg, cdp, tag, week=False); await L.tap(pg, cdp, '#phoneBody [data-go="%s"]' % L_['item']); await pg.wait_for_timeout(800); ok = True
            else: ok = await go_lesson(pg, cdp, L_, tag, 'phone')
            if not ok: continue
            r0 = await pg.evaluate(GC.REC); hint0 = await pg.evaluate("(GAME.G.flags||{}).ASK_NOTE_HINT")
            o = await skip_loop(pg, cdp, L_, tag, sy, use_skip=True)
            lg = await GC.logs(pg, o['n1']); cl, _ = GC.class_lines(lg); sec, _d = GC.class_timing(lg, cl); r1 = await pg.evaluate(GC.REC)
            row['skip'] = {'lines': len(cl), 'sitToClassEnd': sec, 'sitToFree': o['sitToFree'], 'presses': o['presses']}
            R.note('%s：略過 %d 句、坐下到「下課了」%s 秒、坐下到下課能動 %s 秒、按了略過 %d 次；停下來的選單 %s' % (tag, len(cl), sec, o['sitToFree'], o['presses'], J(o['stopAt'])))
            R.check('%s：坐下以前沒有「略過 »」' % tag, not o['before'], J(o['before']))
            R.check('%s：下課以後沒有「略過 »」' % tag, not o['after'], J(o['after']))
            expect = (['call'] if (sy or {}).get('call') else []) + (['討論'] if (sy or {}).get('obs') else []) + (['ask'] if (sy or {}).get('ask') else [])
            got = [m['opts'] for m in o['menusInClass']]
            R.note('%s：課堂裡出現的選單（含連點那段）%s；被選的 %s' % (tag, J(got), J(o['picksInClass'])))
            R.check('%s：略過會停在每一個選項（稿：%s；課堂裡出了 %d 個選單）' % (tag, J(expect), len(got)), len(got) >= len(expect))
            R.check('%s：選完以後不會自己繼續翻（要再按一次略過）' % tag, all(x['stayed'] for x in o['resume']), J(o['resume']))
            R.check('%s：略過到底 done／attend 有記' % tag, bool(r1['done'].get(L_['item'])) and (r1['attend'].get(cid) or 0) > (r0['attend'].get(cid) or 0), J(GC.rdiff(r0, r1)))
            ic = next((i for i, e in enumerate(cl) if e['k'] == 'cap' and '下課' in e['text']), None)
            post = [e for e in lg[next((i for i, e in enumerate(lg) if e is cl[ic]), 0):] if e['k'] == 'say'] if ic is not None else []
            R.note('%s：下課後的人物事件 %s' % (tag, J([e['text'] for e in post]) if post else '沒有遇到'))
            if sy and sy.get('ask'):
                tl = [e['text'] for e in lg if e['k'] == 'toast']
                hit = [t for t in tl if t == ASKHINT]
                if hint0: R.check('%s：同一份存檔第二次答題，不再出「%s」（ASK_NOTE_HINT=%s；這一段的通知 %s）' % (tag, ASKHINT, hint0, J(tl)), not hit)
                else: R.check('%s：第一次答完課堂題，上方通知逐字是「%s」（這一段的通知 %s）' % (tag, ASKHINT, J(tl)), bool(hit))
                await legal_pages(pg, cdp, tag)
                carry = await pg.evaluate("GAME.snapshot()"); hinted = True
            op, t, _, _ = await GC.phone_today(pg, cdp, tag, week=False)
            i = t.find(L_['name']); seg = t[i:i + 90] if i >= 0 else ''
            R.check('%s：手機「今天」那一列寫「上過了」（%s）' % (tag, seg.replace('\n', ' ')), '上過了' in seg)
            await GC.close_phone(pg, cdp)
            R.check('%s：沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))
            summ[tag0] = row
        R.note('[SKIP 統計] 不略過／略過（句數、坐下到下課秒數）：%s；第二題不再提示的檢查有做＝%s' % (J(summ), hinted and carry is not None))
        R.check('SKIP：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


FN = {'CLASS': part_class, 'OLDSAVE': part_oldsave, 'SKIP': part_skip}


async def main():
    real = os.popen('git -C "%s" rev-parse --short=9 HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or 'tests', '..')).read().strip()
    print('CC CLASS12（大一上三科課堂內容）：SHA=%s worktree=%s；%s；PARTS=%s；堂 %s；Playwright 手機模擬 ≠ iPhone' % (SHA or '?', real or '?', '舊版對照 D34' if REF else '新版', ','.join(PARTS), J(lessons())), flush=True)
    async with async_playwright() as p:
        for part in PARTS:
            if part not in FN: R.note('不認得的 PART：%s' % part); continue
            print('===== %s =====' % part, flush=True); t0 = time.time()
            try: await FN[part](p)
            except Exception as e:
                import traceback; traceback.print_exc(); R.check('%s：沒有例外' % part, False, repr(e)[:300])
            R.note('%s 花了 %.1f 分鐘' % (part, (time.time() - t0) / 60))
    sys.exit(R.finish())


asyncio.run(main())
