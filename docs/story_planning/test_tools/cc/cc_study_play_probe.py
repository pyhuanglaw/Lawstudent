"""CC-C 11-12：STUDY-EXAM-CAREER-1102 B 節「瀏覽器實玩（不用 turbo）」（BB_222 第 239～285 行，BB-C 09:08 交；使用者 11-02 要的讀書／考試／國考／職涯）。結果 BB 判。
Playwright（PC GPU）手機模擬 ≠ iPhone。不用 ?turbo；讀檔只當起點（印【前置／捷徑】）；作答用【捷徑】的地方寫明。PARTS 一次跑一段（每段 ≤20 分鐘，佇列一段一項）：
  SE06  【前置】大一上 2025-12-15 07:40 宿舍，prep、study、筆記都清空、沒有課本 → 照玩家：一鍵「到下一堂課的教室」去上課／考試、沒有課就一鍵「回去睡覺」→
        第一場期末【捷徑：作答】全對、第二場【捷徑：作答】4 對（第 5 題故意選錯）。捷徑＝讀遊戲自己的 CLS.curExam（測試掛勾：現在第幾題、題號）＋CLS.drawExam 同一份題目的答案再按那個選項（不改遊戲狀態）
        → 記交卷那一句、成績、逐字稿；通過條件（BB_222）：5／5＝100、4／5＝90；逐字稿沒有任何台詞提到沒讀書。剩下的時間（FF=1）用床的快轉往後到成績單（學期結束後第一個早上）。
  SE12  【前置】大一上第 16 週（期末週）體育、國文那兩堂課開始前 40 分鐘，prep 空的 → 一鍵去上課 → 存逐字稿、每句旁白截圖；
        出現「考卷發下來。體育期末考。」「你認得題目裡的每一個字，合起來就不太認得了。」或照讀書次數寫的負面評語＝FAIL（AA 定稿明文允許的除外，BB 判）。
  FA01  【前置】社員存檔（SIS_CLUB_EXPO、lawclub、CLUB_lawclub_study）大二上 2026-10-24（週六）07:50 宿舍 → 不動、真的等遊戲時間走到 08:40 →
        畫面上不能出現「出發：法服值班／晚一點／這週請假」那一種例行出發選單；記 OUT.get(G,'fafu_'+今天)、所有對話和選單。
CC_02 清單 2026-11-12：1✓（日期照 BB_222：12/15 07:40、第 16 週、2026-10-24 07:50；期末週從遊戲 CLS.examList 讀） 2✓（課、考試、一鍵選項都從遊戲讀：CLS.examList、CLS.dayItems、#goPop 的字） 3✓（同一份存檔每段重新讀） 4✓（選項照字找；考試選項照遊戲 optList 的字：是非＝對／錯、選擇＝（鍵）選項） 5✓（去教室用遊戲的一鍵，不瞬移） 6✓（讀檔等 6 秒、對話一句一句點） 7✓ 8✓（門檻是 BB_222 的通過條件；黑名單台詞原文照表；其他負面句只記、BB 判） 9n/a（截圖要看旁白，不藏東西） 10n/a（條件事件要開：考試、上課旁白、法服都是事件） 11✓ 12✓（逐字稿＋每一場的分數、時間、選單） 13✓（作答捷徑、改存檔都標）
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=SE06|SE12|FA01 [FIX=tests/fixtures/user_save_day51b_1110.json] [MAX_MIN=18] [FF=1] python3 cc_study_play_probe.py <url> <out>"""
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


async def onetap(pg, cdp, label):
    """一鍵（#btnGo）→ #goPop 裡那一項（照字）"""
    await L.tap(pg, cdp, '#btnGo'); await pg.wait_for_timeout(700)
    k = {'到下一堂課': 'cls', '回去睡覺': 'sleep', '約會': 'date'}.get(label, label)
    ok = await pg.evaluate("""(k=>{ const pop=document.getElementById('goPop'); if(!pop) return 'no-pop'; const e=pop.querySelector('[data-gok="'+k+'"]'); if(!e) return 'none: '+(pop.textContent||'').slice(0,200);
      const t=(e.textContent||'').trim(); if(e.classList.contains('dim')){ e.click(); return 'dim: '+t; } e.click(); return 'ok: '+t; })""", k)   # onetap3d.js renderPop：<button data-gok="cls|sleep|date">（dim＝現在不能用，按了會跳 toast 寫原因）
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
    while time.time() - t0 < (MAX_MIN - 4) * 60 and len(done) < 2:
        s = await pg.evaluate(ST)
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
        await pg.wait_for_timeout(1500)
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
        R.check('%s 交卷畫面的分數和成績紀錄一致' % tag, all(any(('%d 分' % d_['score']) in h for h in hand) for d_ in done), J(hand))
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
    tag = '[FA01]'
    ry2 = await pg.evaluate(DAYOF, '2026-09-06')   # 大二搬房間那天（ROOM_Y2 有值＝不補演拆箱）

    def member(sv):
        F = sv.setdefault('flags', {}); F['SIS_CLUB_EXPO'] = F.get('SIS_CLUB_EXPO') or 1; F['lawclub'] = True; F['CLUB_lawclub_study'] = max(int(F.get('CLUB_lawclub_study') or 0), 2)
        F.setdefault('ROOM_Y2', ry2)
    r = await load(pg, sv0, '2026-10-24', 7.83, 'dorm', mods=member)
    R.setup('%s 【前置】社員存檔（SIS_CLUB_EXPO、lawclub、CLUB_lawclub_study）讀到 %s 07:50 宿舍（大二上）' % (tag, r['key']))
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
    R.check('%s 沒有例行的出發選單（法服值班／晚一點／這週請假）' % tag, not bad, J(bad))
    res['FA01'] = {'out0': out0, 'out1': out1, 'menus': menus, 'lines': lines, 'end': s}


async def main():
    print('CC STUDY-EXAM-CAREER B 節：SHA %s；PARTS %s；不用 turbo；Playwright ≠ iPhone' % (SHA or '?', PARTS), flush=True)
    sv0 = json.load(open(fix_path(FIX), encoding='utf-8'))
    res = {'sha': SHA, 'parts': PARTS}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for name, fn in (('SE06', part_se06), ('SE12', part_se12), ('FA01', part_fa01)):
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
