"""CC-C 11-12：STUDY-EXAM-CAREER-1102 B 節「瀏覽器實玩（不用 turbo）」（BB_222 第 239～285 行，BB-C 09:08 交；使用者 11-02 要的讀書／考試／國考／職涯）。結果 BB 判。
Playwright（PC GPU）手機模擬 ≠ iPhone。不用 ?turbo；讀檔只當起點（印【前置／捷徑】）；作答用【捷徑】的地方寫明。PARTS 一次跑一段（每段 ≤20 分鐘，佇列一段一項）：
  SE06  【前置】大一上 2025-12-15 07:40 宿舍，prep、study、筆記都清空、沒有課本 → 照玩家：一鍵「到下一堂課的教室」去上課／考試、沒有課就一鍵「回去睡覺」→
        第一場期末【捷徑：作答】全對、第二場【捷徑：作答】4 對（第 5 題故意選錯）。捷徑＝讀遊戲自己的 CLS.curExam（測試掛勾：現在第幾題、題號）＋CLS.drawExam 同一份題目的答案再按那個選項（不改遊戲狀態）
        → 記交卷那一句、成績、逐字稿；通過條件（BB_222）：5／5＝100、4／5＝90；逐字稿沒有任何台詞提到沒讀書。剩下的時間（FF=1）用床的快轉往後到成績單（學期結束後第一個早上）。
  SE12  【前置】大一上第 16 週（期末週）體育、國文那兩堂課開始前 40 分鐘，prep 空的 → 一鍵去上課 → 存逐字稿、每句旁白截圖；
        出現「考卷發下來。體育期末考。」「你認得題目裡的每一個字，合起來就不太認得了。」或照讀書次數寫的負面評語＝FAIL（AA 定稿明文允許的除外，BB 判）。
  FA01  【前置】社員存檔（SIS_CLUB_EXPO、lawclub、CLUB_lawclub_study）大二上 2026-10-24（週六）07:50 宿舍 → 不動、真的等遊戲時間走到 08:40 →
        畫面上不能出現「出發：法服值班／晚一點／這週請假」那一種例行出發選單；記 OUT.get(G,'fafu_'+今天)、所有對話和選單。
  SE11  【前置】大一上第 15 週民法總則（civ_general）上課前 40 分鐘，prep 空的 → 一鍵去上課 → 下課前的課堂題：記題目、選項、教授公布的答案（逐字）→
        同一份存檔（GAME.readSave 自動存檔）讀到期末那一場的早上 → 看遊戲這份存檔的期末抽題（CLS.drawExam，同一個 examSeed）有沒有這一題：
        有＝一鍵去考，考到這一題時記畫面上的題目和選項，和上課那一次逐字比；作答選上課公布的答案，看交卷時這一題算對。沒抽到＝照實記（BB_222：「如果抽到這題」）。
  FA05  【前置】大一上 2025-11-08（週六）10:00、沒去社博（SIS_CLUB_EXPO、lawclub、LAWCLUB_NOTICE、CLUB_lawclub_study 都沒有），在法律系館B（wancai）一樓 →
        走到公告欄按「看公告：法律服務社招募」→ 記：lawclub、LAWCLUB_NOTICE、筆記 club_law、手機群組、STORY.fafuJoined／fafuMember、學姊招呼「值班表你看了嗎？」的條件（STORY.LADDER_GREET_IF）、
        學姊私訊話題（MSG.sisTopics）→ 同一份存檔讀到大二上 2026-10-24（週六）07:50 宿舍、等到 08:40：不能有法服出發選單。
        通過條件（BB_222 FA-05）：看公告只加筆記（LAWCLUB_NOTICE）、lawclub 不能是 true、不加群組、學姊招呼和值班都走非社員版。
  SE01  【前置】大一上，prep、study、筆記清空、沒有課本（＝從沒上過課的人）。時間點（期末週從 CLS.examList 算）：考前 7 天 10:00、考前 1 天 10:00、第一場考試當天 07:30、
        兩場考試中間、第 15 週週日 20:30 → 每個時間點記 STUDY.reviewOpt（有沒有、灰不灰、提示字）、STUDY.reviewInfo 的科目；
        考前 7 天那一點真的用一次：走到宿舍書桌按互動 → 選單裡找「考前總複習」→ 按 → 記點了幾下、遊戲時間花多少、逐字稿；手機「今天」那一頁有沒有這一項（只記）。
        「已經考完的科目」：【前置】把第一場記成考過（CLS.rec(G).exam[key].status='done'），看 reviewInfo 還包不包含那一科。
CC_02 清單 2026-11-13：1✓（日期照 BB_222：12/15 07:40、第 16 週、2026-10-24 07:50；期末週從遊戲 CLS.examList 讀） 2✓（課、考試、一鍵選項都從遊戲讀：CLS.examList、CLS.dayItems、#goPop 的字） 3✓（同一份存檔每段重新讀） 4✓（選項照字找；考試選項照遊戲 optList 的字：是非＝對／錯、選擇＝（鍵）選項） 5✓（去教室用遊戲的一鍵，不瞬移） 6✓（讀檔等 6 秒、對話一句一句點） 7✓ 8✓（門檻是 BB_222 的通過條件；黑名單台詞原文照表；其他負面句只記、BB 判） 9n/a（截圖要看旁白，不藏東西） 10n/a（條件事件要開：考試、上課旁白、法服都是事件） 11✓ 12✓（逐字稿＋每一場的分數、時間、選單） 13✓（作答捷徑、改存檔都標）
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=SE06|SE12|FA01|SE11|FA05|SE01 [FIX=tests/fixtures/user_save_day51b_1110.json] [MAX_MIN=18] [FF=1] python3 cc_study_play_probe.py <url> <out>"""
import os, sys, json, asyncio, time, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]
TESTS = os.environ.get('LW_TESTS') or 'tests'
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51b_1110.json'
PARTS = [x for x in (os.environ.get('PARTS') or 'SE06').split(',') if x]
JUMP2 = (os.environ.get('JUMP2') or '') == '1'   # BB-C 11-14 SE06：第一場考完卡住就【捷徑】讀到第二場那天
MAX_MIN = float(os.environ.get('MAX_MIN') or '18'); FF = (os.environ.get('FF') or '1') == '1'
R = L.Run('study_play_' + '_'.join(PARTS), OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
BLACK = ['考卷發下來。體育期末考', '你認得題目裡的每一個字，合起來就不太認得了']
NEG = re.compile(r'沒讀書|沒念書|沒有讀|沒有念|沒準備|沒有準備|書沒讀|讀得不夠|念得不夠|臨時抱佛腳')


def fix_path(rel):
    for base in (os.path.dirname(TESTS), '.'):
        p = os.path.join(base, rel)
        if os.path.exists(p): return p
    return rel


APPLY = r"""(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); return {day:GAME.G.day, hour:GAME.G.hour, zone:GAME.G.zone, key:CALENDAR.dateOf(GAME.G.day).key}; })"""
DAYOF = "(k=>STORY.dayOfKey(k))"
# 逐字稿：包 GAME.say／GAME.choose（只記，不改）
HOOK = r"""(()=>{ if(!window.__sp){ window.__sp={t:[]}; const s0=GAME.say, c0=GAME.choose; const now=()=>{ const G=GAME.G; return G?(CALENDAR.dateOf(G.day).key+' '+(+G.hour).toFixed(2)):''; };
    GAME.say=function(w,t){ try{ window.__sp.t.push({at:now(), who:(w&&w.name)||(typeof w==='string'?w:''), t:String(t)}); }catch(e){} return s0.apply(this,arguments); };
    GAME.choose=function(o){ try{ window.__sp.t.push({at:now(), choose:(o||[]).map(x=>x&&x.t)}); }catch(e){} return c0.apply(this,arguments); }; } window.__sp.t=[]; return true; })()"""
TRANS = "(()=>window.__sp?window.__sp.t:[])()"
ST = r"""(()=>{ const G=GAME.G, E=GAME.E; const d=document.getElementById('dlg'), c=document.querySelectorAll('#choices button');
  return {key:CALENDAR.dateOf(G.day).key, day:G.day, h:+(+G.hour).toFixed(2), zone:G.zone, dlg:!!(d&&d.offsetParent), dtext:(document.getElementById('dlgText')||{}).textContent||'', choices:[...c].filter(b=>b.offsetParent).map(b=>b.textContent.trim()),
    busy:!!(E.player&&E.player.busy)||!!(GAME.D&&GAME.D.busyDepth>0), exam:(typeof CLS!=='undefined'&&CLS.curExam)?Object.assign({},CLS.curExam):null, money:G.money}; })()"""
# 【捷徑：作答】讀這一題的正確選項字（遊戲自己的 drawExam、optList 同一套字）
ANS = r"""(()=>{ const ce=CLS.curExam; if(!ce||!ce.i) return null; const r=CLS.drawExam(GAME.G,ce.cid,ce.term,ce.kind); const q=r&&r.qs?r.qs[ce.i-1]:null; if(!q) return null;
  const right=q.type==='tf'||!q.options?String(q.answer):'（'+q.answer+'）'+q.options[q.answer]; return {cid:ce.cid, i:ce.i, qid:q.id, right, q:String(q.q).slice(0,60)}; })()"""
EXAMS = r"""((t)=>{ const G=GAME.G; return CLS.examList(G,t).map(e=>({cid:e.c.id, name:e.c.name, day:e.day, key:CALENDAR.dateOf(e.day).key, t0:e.t0, t1:e.t1})).sort((a,b)=>a.day-b.day||a.t0-b.t0); })"""
SCAN_CLS = r"""((a)=>{ const G=GAME.G, keep={day:G.day,weekday:G.weekday,hour:G.hour}; const out=[];
  try{ for(let d=0; d<2600; d++){ const T=CALENDAR.termOf(d); if(!T||T.id!==a.term||T.week!==a.week) continue; G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=6;
      for(const it of (CLS.dayItems(G)||[])){ const nm=(it.c&&it.c.name)||''; if(a.names.some(n=>nm.indexOf(n)>=0)) out.push({day:d, key:CALENDAR.dateOf(d).key, wd:G.weekday, t0:it.t0, name:nm, cid:it.c&&it.c.id, itkey:it.key}); } } }
  finally{ Object.assign(G,keep); } return out; })"""


def blank(sv):
    """【前置】prep、study、筆記清空、沒有課本（BB_222 SE-06）"""
    C = sv.setdefault('courses', {})
    for k in ('prep', 'note', 'ask', 'disc'): C[k] = {}
    sv['study'] = {'v': 1, 'u': {}, 'miss': [], 'bf': 1}
    sv['notes'] = []
    F = sv.setdefault('flags', {}); F.pop('books', None); F.pop('textbook', None)
    return sv


async def load(pg, sv0, key, hour, zone, mods=None, blank_=False):
    sv = json.loads(json.dumps(sv0)); d = await pg.evaluate(DAYOF, key)
    sv.update({'day': d, 'hour': hour, 'zone': zone, 'weather': 'clear', 'weekday': (await pg.evaluate("((d)=>CALENDAR.dateOf(d).wd%7)", d))}); sv.pop('pos', None)
    if blank_: blank(sv)
    if mods: mods(sv)
    r = await pg.evaluate(APPLY, sv); await pg.wait_for_timeout(6000); await pg.evaluate(HOOK)
    return r


DIAG_N = int(os.environ.get('DIAG_N') or 0)   # 11-13 BB-C SE06_diag：每按一次一鍵記狀態＋截圖，按 DIAG_N 次就停；-1＝一直記不停（11-14 加 toast、CLS.next＋goPlan 的 depart／t0）
DIAG_HOOK = r"""(()=>{ if(window.__sdH) return 'again'; window.__sdH=1; window.__sd={go:[], ev:[]};
  try{ if(typeof CLS!=='undefined'&&CLS.goClass){ const g0=CLS.goClass; CLS.goClass=function(){ let r; try{ r=g0.apply(this,arguments); }catch(e){ window.__sd.go.push({err:String(e).slice(0,80)}); throw e; }
    try{ const rr=(r&&r.then)?'promise':r; window.__sd.go.push({t:+performance.now().toFixed(0), args:[...arguments].map(a=>typeof a==='object'?(a&&a.key)||'obj':a).slice(0,3), ret:typeof rr==='object'?JSON.parse(JSON.stringify(rr)):rr}); if(r&&r.then) r.then(v=>window.__sd.go.push({t:+performance.now().toFixed(0), resolved:v===undefined?null:(typeof v==='object'?JSON.parse(JSON.stringify(v)):v)})); }catch(e){} return r; }; } }catch(e){}
  try{ if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ window.__sd.ev.push({t:+performance.now().toFixed(0), id:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; } }catch(e){}
  try{ const el=document.getElementById('toast'); if(el){ window.__sd.toast=[]; new MutationObserver(()=>{ const t=(el.textContent||'').trim(); const L=window.__sd.toast; if(t&&L[L.length-1]!==t) L.push(t.slice(0,60)); }).observe(el,{childList:true,subtree:true,characterData:true}); } }catch(e){}
  return 'ok'; })()"""
DIAG_SNAP = r"""(()=>{ const G=GAME.G, P=GAME.E.player, o=P.obj.position, D=GAME.D, ch=document.getElementById('choices'), dl=document.getElementById('dlg');
  let rs=null; try{ rs=(typeof CLS!=='undefined'&&CLS.routeStop!==undefined)?JSON.parse(JSON.stringify(CLS.routeStop)):(GAME.routeStop??null); }catch(e){ rs='ERR'; }
  const X=window.__sd||{go:[],ev:[]}; const out={zone:G.zone, pos:[+o.x.toFixed(2),+o.z.toFixed(2),P.lv|0], key:CALENDAR.dateOf(G.day).key, hour:+(+G.hour).toFixed(3), time:G.time??null,
    busyDepth:(D&&D.busyDepth)|0, dlg:!!(dl&&!dl.classList.contains('hide')), choices:!!(ch&&!ch.classList.contains('hide')&&ch.children.length), busy:!!P.busy,
    goClass:X.go.slice(-3), events:X.ev.slice(-5).map(e=>e.id), routeStop:rs}; X.go=[]; X.ev=[];
  { const ts=document.getElementById('toast'); out.toast=(ts&&ts.offsetParent)?(ts.textContent||'').trim().slice(0,60):''; out.toastLog=(X.toast||[]).slice(-4); X.toast=[]; }
  try{ const it=CLS.next(G); if(it){ let pl=null; try{ pl=CLS.goPlan?CLS.goPlan(GAME,it):null; }catch(e){ pl={err:String(e).slice(0,60)}; } out.next={key:it.key||null, exam:!!it.exam, t0:it.t0, depart:pl&&pl.depart!=null?+(+pl.depart).toFixed(3):(pl&&pl.err)||null}; } }catch(e){ out.next='ERR'; }
  return out; })()"""


async def onetap(pg, cdp, label):
    """一鍵（#btnGo）→ #goPop 裡那一項（照字）"""
    await L.tap(pg, cdp, '#btnGo'); await pg.wait_for_timeout(700)
    k = {'到下一堂課': 'cls', '回去睡覺': 'sleep', '約會': 'date'}.get(label, label)
    ok = await pg.evaluate("""(k=>{ const pop=document.getElementById('goPop'); if(!pop) return 'no-pop'; const e=pop.querySelector('[data-gok="'+k+'"]'); if(!e) return 'none: '+(pop.textContent||'').slice(0,200);
      const t=(e.textContent||'').trim(); if(e.classList.contains('dim')){ e.click(); return 'dim: '+t; } e.click(); return 'ok: '+t; })""", k)   # onetap3d.js renderPop：<button data-gok="cls|sleep|date">（dim＝現在不能用，按了會跳 toast 寫原因）
    if ok.startswith('ok'):   # 11-14 LAWWW-C（STUDY_SE06_d587 TEST_BUG）：一鍵三項都先跳防誤觸確認框（onetap3d.js S.run→domConfirm；框開著遊戲暫停、0.45 秒內點不算、點框外＝取消），要按 #goCfYes 才真的出發
        await pg.wait_for_timeout(700); cf = await L.tap(pg, cdp, '#goCfYes'); await pg.wait_for_timeout(1500)
        ok += '｜確定=%s' % cf
        return ok
    await pg.wait_for_timeout(900)
    return ok


async def step_dialog(pg, cdp, s, exam_pick=None):
    """一步：有選項就選（考試照 exam_pick 決定），有對話就點"""
    if s['choices']:
        idx = 0
        if s['exam'] and exam_pick:
            a = await pg.evaluate(ANS)
            idx = exam_pick(a, s['choices'])
        await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % idx)
        await pg.wait_for_timeout(700); return True
    if s['dlg']:
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); return True
    return False


def transcript_checks(tag, tr):
    lines = [x['t'] for x in tr if 't' in x]
    bl = [l for l in lines if any(b in l for b in BLACK)]
    neg = [l for l in lines if NEG.search(l)]
    R.check('%s 逐字稿沒有黑名單台詞（「考卷發下來。體育期末考。」「你認得題目裡的每一個字…」）' % tag, not bl, J(bl[:5]))
    R.note('%s 照讀書次數寫的負面句（只記、BB 判）：%s' % (tag, J(neg[:10])))
    return bl, neg


async def part_se06(pg, cdp, sv0, res):
    tag = '[SE06]'
    r = await load(pg, sv0, '2025-12-15', 7.67, 'dorm', blank_=True)
    if DIAG_N: R.note('%s 診斷 hook：%s' % (tag, await pg.evaluate(DIAG_HOOK)))
    R.setup('%s 【前置】讀檔到 %s 07:40 宿舍，prep、study、筆記清空、沒有課本' % (tag, r['key']))
    ex = await pg.evaluate(EXAMS, 'Y1S1')
    R.note('%s 大一上期末（CLS.examList）：%s' % (tag, J(ex)))
    order = []; picks = {}

    def pick(a, ch):
        if not a: return 0
        if a['cid'] not in order: order.append(a['cid'])
        n = order.index(a['cid'])
        right = next((k for k, t in enumerate(ch) if t == a['right'] or t.startswith(a['right'])), None)
        if right is None: picks.setdefault(a['cid'], []).append(('找不到正確選項', a, ch)); return 0
        if n == 1 and a['i'] == 5:   # 第二場第 5 題故意選錯
            return next(k for k in range(len(ch)) if k != right)
        return right
    t0 = time.time(); done = []; last_key = None; acts = []
    stall = {'sig': None, 't': time.time(), 'last': 0, 'n': 0}; jumped = [False]; pre_keys = []
    while time.time() - t0 < (MAX_MIN - 4) * 60 and len(done) < 2:
        s = await pg.evaluate(ST)
        # 11-14 SE06_4af4_r2：體育期末「你游完了」那句以後 13 分鐘沒有任何紀錄（分不出遊戲卡住還是點不動）——同一個畫面 45 秒沒變就每 45 秒記一次狀態＋截圖；120 秒以後對話改用 DOM click，記哪一種有效
        sig = (s['key'], s['h'], s['dlg'], s['dtext'][:40], tuple(s['choices'][:3]), s['busy'])
        if sig != stall['sig']:
            if stall['n']: R.note('%s 卡住解除（%.0f 秒）：現在 %s %.2f %s dlg=%s「%s」busy=%s' % (tag, time.time() - stall['t'], s['key'], s['h'], s['zone'], s['dlg'], s['dtext'][:40], s['busy']))
            stall = {'sig': sig, 't': time.time(), 'last': time.time(), 'n': 0}
        elif time.time() - stall['last'] >= 45:
            stall['last'] = time.time(); stall['n'] += 1
            dg = await pg.evaluate(DIAG_SNAP) if DIAG_N else None
            await pg.screenshot(path=os.path.join(OUT, 'se06_stall_%02d.png' % stall['n']))
            R.note('%s 卡住 %.0f 秒（第 %d 次記）：%s %.2f %s dlg=%s「%s」選項 %s busy=%s；診斷 %s' % (tag, time.time() - stall['t'], stall['n'], s['key'], s['h'], s['zone'], s['dlg'], s['dtext'][:60], J(s['choices'][:4]), s['busy'], J(dg)))
            if s['dlg'] and time.time() - stall['t'] >= 120:
                await pg.evaluate("(()=>{ const d=document.getElementById('dlg'); if(d) d.click(); })()"); await pg.wait_for_timeout(800)
                s2 = await pg.evaluate(ST); R.note('%s 對話改用 DOM click 以後：dlg=%s「%s」h=%.2f' % (tag, s2['dlg'], s2['dtext'][:40], s2['h'])); continue
        # BB-C 11-14：JUMP2=1＝第一場考完、當天卡住 180 秒或過了 17:30，【捷徑】同一份進度讀到下一場期末那天 07:40 宿舍，再一鍵——只驗第二場
        if JUMP2 and len(done) == 1 and not jumped[0] and (time.time() - stall['t'] >= 180 or s['h'] >= 17.5):
            nx = next((e for e in ex if e['day'] > s['day'] and not any((':%s:' % e['cid']) in d_['k'] for d_ in done)), None)
            if nx:
                jumped[0] = True; pre_keys[:] = [d_['k'] for d_ in done]; sv = await pg.evaluate("JSON.parse(JSON.stringify(GAME.snapshot()))")
                await pg.evaluate("(()=>{ const d=document.getElementById('dlg'); if(d) d.classList.add('hide'); })()")
                await load(pg, sv, nx['key'], 7.67, 'dorm')
                R.setup('%s 【捷徑】JUMP2：第一場考完、%s %.2f %s（卡住 %.0f 秒）→ 同一份進度讀到 %s 07:40 宿舍，只驗第二場 %s' % (tag, s['key'], s['h'], s['zone'], time.time() - stall['t'], nx['key'], nx['name']))
                kept = await pg.evaluate("(()=>Object.keys(CLS.rec(GAME.G).exam||{}).filter(k=>k.indexOf('Y1S1:')===0))()")
                if not R.check('FAIL_SETUP 檢查：%s JUMP2 讀檔以後第一場的成績還在（%s）' % (tag, kept), any(done[0]['k'] == k for k in kept), J(kept)): break
                stall = {'sig': None, 't': time.time(), 'last': time.time(), 'n': 0}; continue
        if await step_dialog(pg, cdp, s, pick): continue
        rec = await pg.evaluate("(()=>{ const R=CLS.rec(GAME.G).exam||{}; return Object.entries(R).filter(([k,v])=>k.indexOf('Y1S1:')===0&&v&&v.status==='done').map(([k,v])=>({k, correct:v.correct, score:v.score})); })()")
        done = rec
        if len(done) >= 2: break
        if s['busy']: await pg.wait_for_timeout(800); continue
        nxt = await pg.evaluate("(()=>{ const it=CLS.next(GAME.G); return it?{day:it.day,t0:it.t0,name:it.c&&it.c.name}:null; })()")
        if nxt and nxt['day'] == s['day']:
            acts.append([s['key'], s['h'], '一鍵 到下一堂課 → %s' % (nxt['name'],), await onetap(pg, cdp, '到下一堂課')])
        else:
            acts.append([s['key'], s['h'], '一鍵 回去睡覺', await onetap(pg, cdp, '回去睡覺')])
            if str(acts[-1][3]).startswith('dim'):   # 11-14 SE06_4af4 TEST_BUG：17:30 以前「回去睡覺」是暗的（「晚上（17:30 以後）才能直接睡」），連按 41 次到上限＝沒考第二場；暗的不算次數，等到 17:35 再按
                acts.pop(); t0w = time.time()
                while time.time() - t0w < 240 and (await pg.evaluate(ST))['h'] % 24 < 17.58: await pg.wait_for_timeout(2000)
                continue
        await pg.wait_for_timeout(1500)
        if DIAG_N:
            dg = await pg.evaluate(DIAG_SNAP); acts[-1].append(dg)
            await pg.screenshot(path=os.path.join(OUT, 'se06_diag_%02d.png' % len(acts)))
            R.note('%s 第 %d 次一鍵（%s）：%s' % (tag, len(acts), acts[-1][2], J(dg)))
            if DIAG_N > 0 and len(acts) >= DIAG_N: R.note('%s DIAG_N=%d：診斷到這裡' % (tag, DIAG_N)); break   # DIAG_N=-1＝每按一次都記、照常考完（BB-C 11-14）
        if len(acts) > 40: break
    tr = await pg.evaluate(TRANS)
    R.note('%s 一鍵紀錄：%s' % (tag, J(acts[-20:])))
    R.note('%s 考完的：%s；作答找不到正確選項：%s' % (tag, J(done), J(picks)))
    hand = [x['t'] for x in tr if 't' in x and x['t'].startswith('交卷')]
    R.note('%s 交卷那一句：%s' % (tag, J(hand)))
    scores = [d_['score'] for d_ in sorted(done, key=lambda x: order.index(x['k'].split(':')[1]) if x['k'].split(':')[1] in order else 9)]
    R.check('%s 考了兩場期末（%d）' % (tag, len(done)), len(done) >= 2, J(done))
    if len(done) >= 2:
        R.check('%s 第一場全對＝100 分、第二場 4 對＝90 分（%s）' % (tag, scores), scores[:2] == [100, 90], J(done))
        chk = [d_ for d_ in done if d_['k'] not in pre_keys]   # 11-14 BB-C SE06_r3 TEST_BUG：JUMP2 讀檔以後逐字稿重來，讀檔前考的那場交卷句不在裡面——只比讀檔以後考的
        R.check('%s 交卷畫面的分數和成績紀錄一致（比 %d 場%s）' % (tag, len(chk), '，JUMP2 讀檔前那場不比' if pre_keys else ''), all(any(('%d 分' % d_['score']) in h for h in hand) for d_ in chk), J(hand))
    transcript_checks(tag, tr)
    out = {'exams': ex, 'done': done, 'hand': hand, 'acts': acts}
    if FF and len(done) >= 2:
        # 剩下的時間：床的快轉往後，到成績單（學期結束後第一個早上）
        t1 = time.time(); seen = []
        while time.time() - t1 < 4 * 60:
            s = await pg.evaluate(ST)
            if s['choices']:
                i = next((k for k, t in enumerate(s['choices']) if '過一週' in t or '快轉' in t), None)
                if i is None: i = next((k for k, t in enumerate(s['choices']) if '睡到明天' in t or t.startswith('睡')), 0)
                await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); seen.append(s['choices'][:6]); await pg.wait_for_timeout(900); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
            if s['busy']: await pg.wait_for_timeout(800); continue
            rep = await pg.evaluate("(()=>{ try{ return CLS.reportFor(GAME.G,'Y1S1'); }catch(e){ return String(e); } })()")
            T = await pg.evaluate("(()=>CALENDAR.termOf(GAME.G.day)&&CALENDAR.termOf(GAME.G.day).id)()")
            if T and T != 'Y1S1': out['report'] = rep; break
            await onetap(pg, cdp, '回去睡覺'); await pg.wait_for_timeout(1500)
        tr2 = await pg.evaluate(TRANS)
        rl = [x['t'] for x in tr2 if 't' in x and ('成績' in x['t'])]
        R.note('%s 快轉到 %s：成績相關的句子 %s；CLS.reportFor %s；快轉時的選單 %s' % (tag, (await pg.evaluate(ST))['key'], J(rl[-8:]), J(out.get('report')), J(seen[-4:])))
    open(os.path.join(OUT, 'se06_transcript.json'), 'w', encoding='utf-8').write(J(await pg.evaluate(TRANS)))
    res['SE06'] = out


async def part_se12(pg, cdp, sv0, res):
    tag = '[SE12]'
    await load(pg, sv0, '2025-12-15', 7.0, 'dorm', blank_=True)
    hits = await pg.evaluate(SCAN_CLS, {'term': 'Y1S1', 'week': 16, 'names': ['體育', '國文']})
    R.note('%s 大一上第 16 週的體育、國文（CLS.dayItems）：%s' % (tag, J(hits)))
    if not R.check('%s 第 16 週找得到體育或國文' % tag, bool(hits), ''): res['SE12'] = {'hits': hits}; return
    out = {'hits': hits, 'classes': []}
    for h in hits[:3]:
        r = await load(pg, sv0, h['key'], max(7.0, h['t0'] - 0.67), 'dorm', blank_=True)
        R.setup('%s 【前置】讀檔到 %s %.2f 宿舍（%s 開始前 40 分鐘），prep 空的' % (tag, h['key'], r['hour'], h['name']))
        t0 = time.time(); went = None
        while time.time() - t0 < 5 * 60:
            s = await pg.evaluate(ST)
            if await step_dialog(pg, cdp, s): continue
            dn = await pg.evaluate("(k=>!!CLS.rec(GAME.G).done[k])", h['itkey'])
            if dn: break
            if s['busy']: await pg.wait_for_timeout(800); continue
            if went is None: went = await onetap(pg, cdp, '到下一堂課'); await pg.wait_for_timeout(2000); continue
            await pg.wait_for_timeout(1500)
        tr = await pg.evaluate(TRANS)
        await pg.screenshot(path=os.path.join(OUT, 'se12_%s_%s.png' % (h['key'], h['cid'])))
        R.note('%s %s %s 逐字稿：%s' % (tag, h['key'], h['name'], J([x.get('t') or x.get('choose') for x in tr][-30:])))
        bl, neg = transcript_checks('%s %s' % (tag, h['name']), tr)
        out['classes'].append({'h': h, 'onetap': went, 'transcript': tr, 'black': bl, 'neg': neg})
    open(os.path.join(OUT, 'se12_transcript.json'), 'w', encoding='utf-8').write(J(out))
    res['SE12'] = out


async def part_fa01(pg, cdp, sv0, res):
    # 11-13 BB-C（BB_255）：10/24 是法服固定場次第 1 場（FAFU_STORY）＝有選單是設計；一般值班的週六（10/31）才是「沒有出發選單」。兩天都跑、期望相反
    res['FA01'] = {}
    for day_, want_menu in (('2026-10-31', False), ('2026-10-24', True)):
        await _fa01_day(pg, cdp, sv0, res, day_, want_menu)


async def _fa01_day(pg, cdp, sv0, res, day_, want_menu):
    tag = '[FA01 %s]' % day_
    ry2 = await pg.evaluate(DAYOF, '2026-09-06')   # 大二搬房間那天（ROOM_Y2 有值＝不補演拆箱）

    def member(sv):
        F = sv.setdefault('flags', {}); F['SIS_CLUB_EXPO'] = F.get('SIS_CLUB_EXPO') or 1; F['lawclub'] = True; F['CLUB_lawclub_study'] = max(int(F.get('CLUB_lawclub_study') or 0), 2)
        F.setdefault('ROOM_Y2', ry2)
    r = await load(pg, sv0, day_, 7.83, 'dorm', mods=member)
    R.setup('%s 【前置】社員存檔（SIS_CLUB_EXPO、lawclub、CLUB_lawclub_study）讀到 %s 07:50 宿舍（大二上）' % (tag, r['key']))
    R.check('FAIL_SETUP 檢查：%s 讀到 %s 宿舍' % (tag, day_), r.get('key') == day_, J(r))
    out0 = await pg.evaluate("(()=>{ try{ const G=GAME.G; return OUT.get(G,'fafu_'+G.day)||null; }catch(e){ return 'err '+String(e).slice(0,80); } })()")
    t0 = time.time(); menus = []; lines = []
    while time.time() - t0 < (MAX_MIN - 4) * 60:
        s = await pg.evaluate(ST)
        if s['h'] >= 8.67 and not s['dlg'] and not s['choices']: break
        if s['choices']:
            menus.append([s['key'], s['h'], s['choices']]); await pg.screenshot(path=os.path.join(OUT, 'fa01_menu_%02d.png' % len(menus)))
            i = next((k for k, t in enumerate(s['choices']) if '請假' in t or '不' in t), 0)
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(800); continue
        if s['dlg']: lines.append(s['dtext']); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        await pg.wait_for_timeout(2000)
    s = await pg.evaluate(ST)
    out1 = await pg.evaluate("(()=>{ try{ const G=GAME.G; return OUT.get(G,'fafu_'+G.day)||null; }catch(e){ return 'err '+String(e).slice(0,80); } })()")
    await pg.screenshot(path=os.path.join(OUT, 'fa01_end.png'))
    bad = [m for m in menus if any(('法服值班' in t or '這週請假' in t or t.startswith('晚一點')) for t in m[2])]
    R.note('%s 07:50 OUT.get(fafu_今天)=%s；%s %.2f 時 OUT.get=%s；選單 %s；對話 %s' % (tag, J(out0), s['key'], s['h'], J(out1), J(menus), J(lines[-12:])))
    R.check('%s 等到 %.2f（要 ≥ 08:30）' % (tag, s['h']), s['h'] >= 8.5, '')
    if want_menu: R.check('%s 法服固定場次那天有出發選單（設計如此）' % tag, bool(bad), J(menus))
    else: R.check('%s 一般值班週六沒有例行的出發選單（法服值班／晚一點／這週請假）' % tag, not bad, J(bad))
    res['FA01'][day_] = {'out0': out0, 'out1': out1, 'menus': menus, 'lines': lines, 'end': s}


async def finish_class(pg, cdp, itkey, maxs=300, pick=None):
    t0 = time.time(); went = None
    while time.time() - t0 < maxs:
        s = await pg.evaluate(ST)
        if await step_dialog(pg, cdp, s, pick): continue
        if itkey and await pg.evaluate("(k=>!!CLS.rec(GAME.G).done[k])", itkey): return went
        if s['busy']: await pg.wait_for_timeout(800); continue
        if went is None: went = await onetap(pg, cdp, '到下一堂課'); await pg.wait_for_timeout(2000); continue
        await pg.wait_for_timeout(1500)
    return went


async def part_se11(pg, cdp, sv0, res):
    tag = '[SE11]'
    await load(pg, sv0, '2025-12-15', 7.0, 'dorm', blank_=True)
    hits = await pg.evaluate(SCAN_CLS, {'term': 'Y1S1', 'week': 15, 'names': ['民法總則']})
    R.note('%s 大一上第 15 週民法總則：%s' % (tag, J(hits)))
    if not R.check('%s 第 15 週找得到民法總則' % tag, bool(hits), ''): res['SE11'] = {'hits': hits}; return
    h = hits[-1]
    r = await load(pg, sv0, h['key'], max(7.0, h['t0'] - 0.67), 'dorm', blank_=True)
    R.setup('%s 【前置】讀檔到 %s %.2f 宿舍（%s 開始前 40 分鐘），prep 空的' % (tag, h['key'], r['hour'], h['name']))
    await finish_class(pg, cdp, h['itkey'])
    tr = await pg.evaluate(TRANS)
    lines = [x.get('t') for x in tr if x.get('t')]
    i0 = next((k for k, t in enumerate(lines) if '教授在黑板角落寫了一題' in t), None)
    ask = {'q': lines[i0 + 1] if i0 is not None and i0 + 1 < len(lines) else None, 'answer': next((t for t in lines[(i0 or 0):] if t.startswith('答案是')), None)}
    chs = [x['choose'] for x in tr if 'choose' in x]
    ask['choices'] = chs[-1] if chs else None
    asked = await pg.evaluate("(()=>Object.keys(CLS.rec(GAME.G).ask).filter(k=>k.indexOf('Y1S1:')===0))()")
    qid = asked[-1].split(':', 1)[1] if asked else None
    R.note('%s 課堂題（%s）：%s' % (tag, qid, J(ask)))
    if not R.check('%s 上課有出課堂題' % tag, bool(ask['q'] and qid), J(lines[-15:])): res['SE11'] = {'h': h, 'ask': ask}; return
    await pg.evaluate("GAME.autosave&&GAME.autosave(true)")
    sv1 = await pg.evaluate("GAME.readSave('fatiao3d_auto')")
    ex = await pg.evaluate(EXAMS, 'Y1S1'); e = next((x for x in ex if x['cid'] == h['cid']), None)
    drawn = await pg.evaluate("((a)=>{ const r=CLS.drawExam(GAME.G,a.c,'Y1S1','final'); return r&&r.qs?r.qs.map(q=>q.id):null; })", {'c': h['cid']})
    R.note('%s 這份存檔的期末（%s）抽到：%s' % (tag, J(e), J(drawn)))
    out = {'h': h, 'ask': ask, 'qid': qid, 'exam': e, 'drawn': drawn}
    if not drawn or qid not in drawn:
        R.note('%s 這份存檔的期末沒抽到 %s（BB_222：如果抽到這題才比）' % (tag, qid)); res['SE11'] = out; return
    k = drawn.index(qid) + 1
    sv1 = dict(sv1); sv1.pop('pos', None)
    r = await load(pg, sv1, e['key'], max(7.0, e['t0'] - 0.67), 'dorm')
    R.setup('%s 同一份存檔讀到期末 %s %.2f 宿舍（考前 40 分鐘）' % (tag, e['key'], r['hour']))
    seen = {}

    def pick(a, ch):
        if not a: return 0
        if a['qid'] == qid:
            seen['choices'] = ch
            want = (ask['answer'] or '').replace('答案是', '').split('。')[0]
            return next((i for i, t in enumerate(ch) if t == want or t.startswith(want) or (want and want in t)), 0)
        return next((i for i, t in enumerate(ch) if t == a['right'] or t.startswith(a['right'])), 0)
    await finish_class(pg, cdp, None, maxs=420, pick=pick)
    tr2 = await pg.evaluate(TRANS)
    ql = next((x['t'] for x in tr2 if x.get('t', '').startswith('%d／5　' % k)), None)
    rec = await pg.evaluate("((c)=>{ const R=CLS.rec(GAME.G).exam||{}; return R['Y1S1:'+c+':final']||null; })", h['cid'])
    out.update({'exam_line': ql, 'exam_choices': seen.get('choices'), 'rec': rec})
    R.note('%s 期末第 %d 題畫面：%s；選項 %s；成績紀錄 %s' % (tag, k, J(ql), J(seen.get('choices')), J(rec)))
    R.check('%s 題幹一字不差（上課「%s」vs 期末「%s」）' % (tag, ask['q'], ql), bool(ql) and ql.split('　', 1)[-1] == ask['q'], '')
    R.check('%s 選項一字不差' % tag, seen.get('choices') == ask['choices'], J([ask['choices'], seen.get('choices')]))
    if rec and rec.get('ans'):
        bank = await pg.evaluate("(id=>{ const q=EXAM_BANK.questions.find(x=>x.id===id); return q?String(q.answer):null; })", qid)
        R.check('%s 照上課公布的答案作答，期末算對（題庫答案 %s、作答 %s）' % (tag, bank, rec['ans'][k - 1]), str(rec['ans'][k - 1]) == bank, '')
    res['SE11'] = out


async def part_fa05(pg, cdp, sv0, res):
    tag = '[FA05]'

    def fresh(sv):
        F = sv.setdefault('flags', {})
        for k in ('SIS_CLUB_EXPO', 'lawclub', 'LAWCLUB_NOTICE', 'CLUB_lawclub_study', 'FAFU_SHIFT_N'): F.pop(k, None)
        sv['notes'] = [n for n in (sv.get('notes') or []) if not (isinstance(n, dict) and n.get('id') == 'club_law')]
        # 11-14 BB-C 09:53（BB_458 TEST_BUG）：群組只在 story3d.js fafuJoined 時加、加了不會退——已入社的存檔只拿旗標，群組本來就在；一併拿掉
        GS = (sv.get('phone') or {}).get('groups')
        if isinstance(GS, dict): GS.pop('lawclub_study', None)
    r = await load(pg, sv0, '2025-11-08', 10.0, 'wancai', mods=fresh)
    R.setup('%s 【前置】大一上 %s 10:00 法律系館B（wancai）一樓，沒去社博（法服旗標都拿掉、G.phone.groups.lawclub_study 拿掉）' % (tag, r['key']))
    g0 = await pg.evaluate("(()=>{ try{ const GS=PHONE.rec(GAME.G).groups||{}; return Object.keys(GS).map(k=>({id:k, name:(GS[k]&&GS[k].name)||'', day:GS[k]&&GS[k].day})); }catch(e){ return String(e); } })()")
    if not R.check('FAIL_SETUP 檢查：%s 讀檔以後、看公告以前沒有 lawclub_study 群組' % tag, isinstance(g0, list) and not any(g['id'] == 'lawclub_study' for g in g0), J(g0)): res['FA05'] = {'g0': g0}; return
    it = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(q=>q.notice==='lawclub'&&!q.hidden); return i?{x:i.x,z:i.z,lv:i.lv|0,label:i.label}:null; })()")
    if not R.check('%s 找得到「看公告：法律服務社招募」' % tag, bool(it), J(await pg.evaluate("GAME.E.interactables.filter(i=>!i.hidden).map(i=>i.label).slice(0,30)"))): res['FA05'] = {}; return
    await L.go_to(pg, cdp, R, it['x'], it['z'], 0.8, it['label'], max_s=90, lv=it['lv'])
    s = await pg.evaluate(ST); lab = await pg.evaluate("(document.getElementById('interact')||{}).textContent||''")
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    lines = []
    for _ in range(30):
        s = await pg.evaluate(ST)
        if s['dlg']: lines.append(s['dtext']); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if s['choices']: await step_dialog(pg, cdp, s); continue
        break
    after = await pg.evaluate("""(()=>{ const G=GAME.G, F=G.flags||{}; let grp=null, gl=null, fj=null, fm=null, sis=null;
      try{ const GS=PHONE.rec(G).groups||{}; grp=Object.keys(GS).map(k=>({id:k, name:(GS[k]&&GS[k].name)||'', day:GS[k]&&GS[k].day})); }catch(e){ grp=String(e); } try{ const L=STORY.LADDER_GREET_IF['值班表你看了嗎？']; gl=L?!!L.test(G):null; }catch(e){ gl=String(e); }
      try{ fj=!!STORY.fafuJoined(G); fm=!!STORY.fafuMember(G); }catch(e){ fj=String(e); } try{ sis=(MSG.sisTopics(G)||[]).map(t=>t&&(t.t||t.id||t.k||JSON.stringify(t).slice(0,40))); }catch(e){ sis=String(e); }
      return {lawclub:F.lawclub===true, notice:!!F.LAWCLUB_NOTICE, note:(G.notes||[]).some(n=>n&&n.id==='club_law'), groups:grp, greetDuty:gl, fafuJoined:fj, fafuMember:fm, sisTopics:sis, memo:(G.memo||[]).slice(-3)}; })()""")
    R.note('%s 互動鍵「%s」；公告那幾句 %s；按完 %s' % (tag, lab, J(lines), J(after)))
    R.check('%s 看公告只記 LAWCLUB_NOTICE、lawclub 不是 true' % tag, after['notice'] and not after['lawclub'], J(after))
    R.check('%s 筆記加了「法律服務社」' % tag, after['note'], '')
    R.check('%s 沒有因為看公告就算加入（fafuJoined=false）' % tag, after['fafuJoined'] is False, J(after['fafuJoined']))
    R.note('%s 看完公告以後手機群組（id、名稱、加入天）：%s（BB-C 21:36：5685 出現 lawclub_study；76f8 story3d.js 改成 fafuJoined 才加）' % (tag, J(after['groups'])))
    R.check('%s 沒有加任何法服群組（id＝lawclub_study 或名稱含「法服」才算；law_class、family_law 每個法律系學生都有，BB-C 21:37）' % tag, isinstance(after['groups'], list) and not any(g['id'] == 'lawclub_study' or '法服' in (g.get('name') or '') for g in after['groups']), J(after['groups']))
    await pg.evaluate("GAME.autosave&&GAME.autosave(true)")
    sv1 = await pg.evaluate("GAME.readSave('fatiao3d_auto')"); sv1 = dict(sv1); sv1.pop('pos', None)
    ry2 = await pg.evaluate(DAYOF, '2026-09-06')
    r = await load(pg, sv1, '2026-10-24', 7.83, 'dorm', mods=lambda sv: sv.setdefault('flags', {}).setdefault('ROOM_Y2', ry2))
    R.setup('%s 同一份存檔讀到大二上 %s 07:50 宿舍（等到 08:40）' % (tag, r['key']))
    g2 = await pg.evaluate("(()=>{ const G=GAME.G; let gl=null, fm=null; try{ const L=STORY.LADDER_GREET_IF['值班表你看了嗎？']; gl=L?!!L.test(G):null; fm=!!STORY.fafuMember(G); }catch(e){ gl=String(e); } return {greetDuty:gl, fafuMember:fm, lawclub:G.flags.lawclub===true}; })()")
    R.check('%s 大二：學姊「值班表你看了嗎？」不給（非社員版）' % tag, g2['greetDuty'] is False and g2['fafuMember'] is False, J(g2))
    t0 = time.time(); menus = []
    while time.time() - t0 < 6 * 60:
        s = await pg.evaluate(ST)
        if s['h'] >= 8.67 and not s['dlg'] and not s['choices']: break
        if s['choices']:
            menus.append([s['key'], s['h'], s['choices']]); i = next((k for k, t in enumerate(s['choices']) if '請假' in t or '不' in t), 0)
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(800); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        await pg.wait_for_timeout(2000)
    bad = [m for m in menus if any(('法服值班' in t or '這週請假' in t or t.startswith('晚一點')) for t in m[2])]
    R.check('%s 大二值班週六 08:30 沒有法服出發選單' % tag, not bad, J(bad))
    R.note('%s 大二週六的選單 %s' % (tag, J(menus)))
    res['FA05'] = {'lines': lines, 'after': after, 'y2': g2, 'menus': menus}


async def part_se01(pg, cdp, sv0, res):
    tag = '[SE01]'
    await load(pg, sv0, '2025-12-15', 7.0, 'dorm', blank_=True)
    ex = await pg.evaluate(EXAMS, 'Y1S1')
    if not R.check('%s 大一上有期末（CLS.examList）' % tag, bool(ex), ''): res['SE01'] = {}; return
    d0 = ex[0]['day']; e2 = ex[1] if len(ex) > 1 else None
    w15sun = await pg.evaluate("(()=>{ for(let d=0;d<2600;d++){ const T=CALENDAR.termOf(d); if(T&&T.id==='Y1S1'&&T.week===15&&CALENDAR.dateOf(d).wd%7===0) return d; } return null; })()")
    key = lambda d: pg.evaluate("((d)=>CALENDAR.dateOf(d).key)", d)
    pts = [('考前7天', d0 - 7, 10.0), ('考前1天', d0 - 1, 10.0), ('考試當天早上', d0, 7.5)]
    if e2: pts.append(('兩場中間', e2['day'], max(7.5, (ex[0]['t1'] or 12) + 0.3) if e2['day'] == d0 else 7.5))
    if w15sun is not None: pts.append(('第15週週日晚上', w15sun, 20.5))
    out = {'exams': ex, 'points': []}
    for nm, d, h in pts:
        k = await key(d)
        r = await load(pg, sv0, k, h, 'dorm', blank_=True)
        o = await pg.evaluate("(()=>{ const G=GAME.G; let ro=null, info=null; try{ ro=STUDY.reviewOpt(G); }catch(e){ ro=String(e); } try{ const i=STUDY.reviewInfo(G,'final'); info=i?i.courses.map(x=>x.c&&x.c.name):null; }catch(e){ info=String(e); } return {opt:ro&&{t:ro.t,dim:ro.dim,hint:ro.hint}, courses:info}; })()")
        R.note('%s %s（%s %.1f）：總複習 %s；範圍 %s' % (tag, nm, k, h, J(o['opt']), J(o['courses'])))
        if nm in ('考試當天早上', '兩場中間'):   # BB-C 21:36 判 SE-01 照設計：三小時的總複習會撞到考試＝灰，提示寫明會錯過哪一科
            names = [e['name'] for e in ex if e.get('name')]
            R.check('%s %s「考前總複習」是灰的、提示寫明會錯過哪一科（%s 其中之一）' % (tag, nm, '、'.join(names)), bool(o['opt']) and bool(o['opt']['dim']) and any(n and n in (o['opt'].get('hint') or '') for n in names), J(o['opt']))
        else:
            R.check('%s %s 有「考前總複習」可以按（不是灰的）' % (tag, nm), bool(o['opt']) and not o['opt']['dim'], J(o['opt']))
        out['points'].append({'nm': nm, 'key': k, 'h': h, 'o': o})
    # 已經考完的科目【前置】
    k = await key(e2['day'] if e2 else d0)
    def done1(sv):
        C = sv.setdefault('courses', {}); E_ = C.setdefault('exam', {}); E_['Y1S1:%s:final' % ex[0]['cid']] = {'status': 'done', 'correct': 5, 'score': 100, 'qs': [], 'ans': []}
    await load(pg, sv0, k, 7.5, 'dorm', mods=done1, blank_=True)
    o = await pg.evaluate("(()=>{ const i=STUDY.reviewInfo(GAME.G,'final'); return i?i.courses.map(x=>x.c&&x.c.id):null; })()")
    R.note('%s 【前置】%s 記成考過以後的範圍：%s' % (tag, ex[0]['cid'], J(o)))
    R.check('%s 考完的科目（%s）不在總複習範圍裡' % (tag, ex[0]['name']), isinstance(o, list) and ex[0]['cid'] not in o, J(o))
    # 考前 7 天：真的走到書桌按一次
    k = await key(d0 - 7)
    await load(pg, sv0, k, 10.0, 'dorm', blank_=True)
    desk = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(q=>!q.hidden&&(q.desk||q.deskStudy||/書桌/.test(q.label||''))); return i?{x:i.x,z:i.z,lv:i.lv|0,label:i.label}:null; })()")
    clicks = 0; h0 = (await pg.evaluate(ST))['h']; got = False
    if R.check('%s 宿舍找得到書桌' % tag, bool(desk), J(await pg.evaluate("GAME.E.interactables.filter(i=>!i.hidden).map(i=>i.label)"))):
        await L.go_to(pg, cdp, R, desk['x'], desk['z'], 0.8, desk['label'], max_s=60, lv=desk['lv'])
        await L.tap(pg, cdp, '#interact'); clicks += 1; await pg.wait_for_timeout(1200)
        for _ in range(12):
            s = await pg.evaluate(ST)
            if s['choices']:
                i = next((k2 for k2, t in enumerate(s['choices']) if '考前總複習' in t), None)
                if i is None: i = next((k2 for k2, t in enumerate(s['choices']) if t.startswith('讀書')), 0)
                else: got = True
                await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); clicks += 1; await pg.wait_for_timeout(900)
                if got: break
                continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
            break
        t1 = time.time()
        while time.time() - t1 < 240:
            s = await pg.evaluate(ST)
            if not await step_dialog(pg, cdp, s):
                if not s['busy']: break
                await pg.wait_for_timeout(800)
    h1 = (await pg.evaluate(ST))['h']
    R.note('%s 書桌：點了 %d 下到「考前總複習」（找到=%s）；遊戲時間 %.2f → %.2f' % (tag, clicks, got, h0, h1))
    R.check('%s 書桌找得到「考前總複習」、≤3 下（點了 %d 下）' % (tag, clicks), got and clicks <= 3, '')
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500)
    ph = await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return p?(p.innerText||'').replace(/\\s+/g,' ').slice(0,1500):''; })()")
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()")
    R.note('%s 手機「今天」頁有沒有總複習：%s（只記）；頁面字 %s' % (tag, '總複習' in ph, ph[:300]))
    tr = await pg.evaluate(TRANS)
    transcript_checks(tag, tr)
    out.update({'desk': desk, 'clicks': clicks, 'got': got, 'h': [h0, h1], 'phone_has': '總複習' in ph})
    res['SE01'] = out


async def main():
    print('CC STUDY-EXAM-CAREER B 節：SHA %s；PARTS %s；不用 turbo；Playwright ≠ iPhone' % (SHA or '?', PARTS), flush=True)
    sv0 = json.load(open(fix_path(FIX), encoding='utf-8'))
    res = {'sha': SHA, 'parts': PARTS}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for name, fn in (('SE06', part_se06), ('SE12', part_se12), ('FA01', part_fa01), ('SE11', part_se11), ('FA05', part_fa05), ('SE01', part_se01)):
            if name not in PARTS: continue
            try:
                await fn(pg, cdp, sv0, res)
            except Exception as e:
                R.check('[%s] 沒有中斷' % name, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % name))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'study_play.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
