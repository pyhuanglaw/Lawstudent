"""CC（帳號 A）11-02：BB_222 B-1 的 SE-11（一-7：課堂公布的答案和期末一致）——階段 0「修改前基準」用（開發分支舊版 a3b1bd647）。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader 1～4 fps）；關鍵畫面另外把視窗改成直向 390×844 再截一張。**不用 ?turbo**；上課、作答都照玩家（沒有作答捷徑）。
共用函式從 cc_se06_probe.py 匯入（那支的 argv 只在 main() 讀）。

讀程式看到的（a3b1bd647）：
  - 大一上第 15 週週四＝2025-12-11；民法總則 13:20（法律系館A 201，tpl A），syllabus 第 15 週 ask.qid＝CIV40_03（使用者題目 USER_CONFIRMED）。
    課堂提問 src/classes3d.js S.classAsk：「（下課前，教授在黑板角落寫了一題。）」→ GM.say(題幹) → GM.choose(「（A）…」…) →
    「答案是（B）。考點：民法總則・無權代理。無權代理行為原則上效力未定，取決於本人是否承認。」（不計分）→ 這學期第一次提問再加「期末考，會考這樣的題目。」
  - 期末 12/18（週四）13:20。S.drawExam：課堂題（askedIn 這一門這一學期）優先；民總期末的課堂題剛好 5 題（CIV40_03、CIV40_22、CIVS_01、CIVS_03、CIVS_07），
    所以讀程式預料 CIV40_03 一定抽到（examSeed 怎麼設都一樣；期中用過的題才會被排除，CIV40_03 是第 15 週、不在期中範圍）。
  - 考卷：GM.say('i／5　'+題幹) → GM.choose(同一個 optList，選項字一樣) → 交卷後只有答錯的題才顯示「第 n 題的答案：（B）<選項>。考點：…。<解析>」。
    所以答案要比兩種：class＝照課堂公布的答案點，交卷後那一題沒有列在答錯裡＝期末也判它對；wrong＝故意點別的，看期末顯示的答案和課堂一字不差。
流程：
  [前置] 最小存檔（法律系、過了開場）改到 2025-12-11 12:30 宿舍。
  ① 手機「今天」→ 民法總則那一列「直接去上課」→ 照玩家點對話；課堂提問照玩家點第一個選項（不計分）；記下題幹、選項、「答案是…」原文；截圖（題目＋選項、公布答案）。
  ② [前置] 同一份進度（上完課的 GAME.snapshot()）跳到 2025-12-18 12:20 宿舍（讀檔到期末）。
  ③ 手機「今天」→ 民法總則期末「直接去上課」→ 每一輪各自從②的存檔開始（CIV_PICK 預設 class,wrong）：
     題幹和課堂那一題一樣的那一題照 class／wrong 點；其他題照玩家點第一個選項（不讀答案）。記下抽到哪五題（畫面上的題幹）。截圖（考卷上那一題、交卷）。
  ④ 有抽到：逐字比對題幹、選項（整串）、答案（class：期末沒列它答錯＋R.exam 的作答＝bank 答案，只讀；wrong：「第 n 題的答案」的字母、選項字、考點、解析和課堂一致）。
     沒抽到：印 INFO「沒抽到 CIV40_03，可以用頁面讀出期末題庫裡 CIV40_03 的全文做只讀對照」→【捷徑：只讀】讀 EXAM_BANK 的 CIV40_03、CLS.examPool 有沒有它，和課堂原文比。
檢查只客觀記錄（BB 判定）；真實流程要求 GAME.walkFallbacks=0（這支只有讀檔、跳日期兩個前置，沒有作答捷徑）。逐字稿 <輸出>/transcript_SE-11.json；黑名單照 SE-06 那一組記 INFO。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> python3 cc_se11_probe.py '<URL>/index.html' <輸出資料夾>
環境變數：CIV_PICK=class,wrong　TRIP_MAX=900　STUCK_S=240
"""
import os, sys, json, asyncio, re, time, traceback
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_se06_probe as C   # L、P、HOOK、state_at、load、jump、play_trip、shot2、TR 都在那裡
L, P = C.L, C.P
J = C.J

ASK_HEAD = '（下課前，教授在黑板角落寫了一題。）'
WRONG_RE = re.compile(r'^第 ([1-5]) 題的答案：(.*)$', re.S)
BANKQ = r"""(id=>{ try{ const q=(typeof EXAM_BANK!=='undefined'?EXAM_BANK.questions:[]).find(x=>x.id===id); if(!q) return null; const p=CLS.examPool(q.course,q.term,'final');
  const where=p.cls.some(x=>x.id===id)?'cls':p.bank.some(x=>x.id===id)?'bank':p.ai.some(x=>x.id===id)?'ai':null;
  const opts=(q.type==='tf'||!q.options)?['對','錯']:Object.keys(q.options).map(k=>'（'+k+'）'+q.options[k]);
  return {id:q.id,q:q.q,opts,answer:q.answer,core:q.core||null,explanation:q.explanation||null,status:q.status,askedIn:q.askedIn||null,pool:where,poolCls:p.cls.map(x=>x.id)}; }catch(e){ return {err:String(e.message)}; } })"""
ASKOF = r"""(key=>{ try{ const G=GAME.G, it=CLS.dayItems(G).find(q=>q.key===key); const q=it?CLS.askOf(it):null; return q?q.id:null; }catch(e){ return 'ERR '+e.message; } })"""


def class_ask(R):
    """課堂提問那一段：旁白 → 題幹 → 選項 → 「答案是…」"""
    i = next((k for k, r in enumerate(R) if r['k'] == 'say' and r['t'] == ASK_HEAD), None)
    if i is None: return None
    stem = next((r for r in R[i + 1:] if r['k'] == 'say'), None)
    ch = next((r for r in R[i + 1:] if r['k'] == 'choose'), None)
    ans = next((r for r in R[i + 1:] if r['k'] == 'say' and r['t'].startswith('答案是')), None)
    first = next((r['t'] for r in R[i + 1:] if r['k'] == 'say' and '期末考，會考這樣的題目' in r['t']), None)
    m = re.match(r'^答案是(（([A-E])）|([^。]+))。(?:考點：(.*?)。)?(.*)$', ans['t'], re.S) if ans else None
    return {'stem': stem and stem['t'], 'opts': ch and ch.get('opts'), 'answer_line': ans and ans['t'], 'letter': m and (m.group(2) or m.group(3)),
            'core': m and m.group(4), 'expl': m and m.group(5), 'first_line': first}


async def exam_round(pg, cdp, run, tr, snap, mode, cls, S):
    n0 = await C.pl_n(pg)
    await C.jump(pg, cdp, run, '2025-12-18', 12 + 20 / 60, 'dorm', snap=snap, label='讀檔到期末（同一份上完 12/11 民總的進度）；這一輪 CIV_PICK=%s' % mode)
    await tr.take(pg, n0, mode, 'setup')
    it = await pg.evaluate(C.EXITEM, ['civ_general', 'final'])
    run.note('SE-11 %s：民總期末那一列 %s' % (mode, J(it)))
    if not isinstance(it, dict):
        run.check('SE-11 %s：12/18 有民總期末那一列' % mode, False, J(it)); return
    target = cls['stem']; want = None
    if cls.get('letter') and cls.get('opts'):
        want = next((o for o in cls['opts'] if o.startswith('（%s）' % cls['letter'])), None) or (cls['letter'] if cls['letter'] in ('對', '錯') else None)

    async def answer(qi, stem, T):
        if stem != target: return 0   # 不是課堂那一題：照玩家點第一個（不讀答案）
        k = next((i for i, t in enumerate(T) if t == want), None)
        if k is None: run.note('SE-11：考卷上那一題的選項裡找不到課堂公布的答案「%s」；選項 %s' % (want, J(T))); return 0
        if mode == 'wrong': k = next(i for i in range(len(T)) if i != k)
        run.note('SE-11 %s：第 %d 題就是課堂那一題 → 點「%s」' % (mode, qi, T[k]))
        return k

    n1 = await C.pl_n(pg)
    r = await C.play_trip(pg, cdp, run, 'se11_%s' % mode, it, answer=answer,
                          shoot_txt=[(lambda t: t.startswith('交卷。'), 'submit'), (lambda t: mode == 'wrong' and WRONG_RE.match(t) is not None and bool(cls.get('core')) and cls['core'] in t, 'exam_answer')],
                          shoot_ch=[(lambda T, lt: lt.endswith(target or '\u0000') and C.EXQ_RE.match(lt) is not None, 'exam_q')])
    R = await tr.take(pg, n1, mode, 'exam')
    run.check('SE-11 %s：一鍵去考民總期末、考完' % mode, r['ok'], J({x: r[x] for x in ('btn', 'stuck', 'jumped', 'end')}))
    says = [x for x in R if x['k'] == 'say']
    drawn = []
    for k, x in enumerate(R):
        m = C.EXQ_RE.match(x['t']) if x['k'] == 'say' else None
        if m:
            ch = next((y for y in R[k + 1:] if y['k'] == 'choose'), None)
            drawn.append({'i': int(m.group(1)), 'stem': m.group(2), 'opts': ch and ch.get('opts')})
    exrec = await pg.evaluate(C.EXREC, 'Y1S1:civ_general:final')
    jiao = next((x['t'] for x in says if x['t'].startswith('交卷。')), None)
    wrong = {}
    for x in says:
        m = WRONG_RE.match(x['t'])
        if m: wrong[int(m.group(1))] = m.group(2)
    S[mode] = {'drawn': drawn, 'qs': (exrec or {}).get('qs'), 'ans': (exrec or {}).get('ans'), 'jiao': jiao, 'wrong': wrong, 'answers': r['answers'], 'shots': r['shots']}
    run.note('SE-11 %s：抽到的五題（畫面題幹）%s；R.exam.qs（只讀）%s；%s' % (mode, J([d['stem'][:24] for d in drawn]), J((exrec or {}).get('qs')), jiao))
    hit = next((d for d in drawn if d['stem'] == target), None)
    if hit is None:
        run.note('INFO 沒抽到 CIV40_03，可以用頁面讀出期末題庫裡 CIV40_03 的全文做只讀對照')
        S[mode]['drawn_hit'] = False; return
    S[mode]['drawn_hit'] = True; qi = hit['i']
    run.check('SE-11 %s：題幹一字不差（課堂 vs 期末第 %d 題）' % (mode, qi), hit['stem'] == cls['stem'], J([cls['stem'], hit['stem']]))
    run.check('SE-11 %s：選項一字不差（整串、順序）' % mode, hit['opts'] == cls['opts'], J([cls['opts'], hit['opts']]))
    idx = ((exrec or {}).get('qs') or []).index('CIV40_03') if 'CIV40_03' in ((exrec or {}).get('qs') or []) else None
    if mode == 'class':
        listed = qi in wrong
        bank = await pg.evaluate(BANKQ, 'CIV40_03')
        a = ((exrec or {}).get('ans') or [None] * 5)[idx] if idx is not None else None
        run.check('SE-11 class：照課堂公布的答案（%s）點，期末判對（交卷後沒有列「第 %d 題的答案」）' % (cls['letter'], qi), not listed and a is not None and str(a) == str((bank or {}).get('answer')),
                  J({'列在答錯': wrong.get(qi), 'R.exam.ans': a, 'bank.answer（只讀）': (bank or {}).get('answer'), '課堂': cls['letter']}))
    else:
        w = wrong.get(qi)
        m = re.match(r'^(（([A-E])）(.*?)|(對|錯))(?:。考點：(.*?))?(?:。(.*))?$', w or '', re.S)
        opt_txt = next((o for o in cls['opts'] or [] if o.startswith('（%s）' % cls['letter'])), '')
        run.check('SE-11 wrong：期末「第 %d 題的答案」的答案和課堂一字不差' % qi, w is not None and m is not None and (m.group(2) or m.group(4)) == cls['letter'] and (m.group(4) or ('（%s）%s' % (m.group(2), m.group(3)))) in (cls['opts'] or [cls['letter']]),
                  J({'課堂': cls['answer_line'], '課堂那個選項': opt_txt, '期末': w}))
        run.check('SE-11 wrong：考點、解析和課堂一字不差', m is not None and (m.group(5) or None) == (cls['core'] or None) and (m.group(6) or '').rstrip('。') == (cls['expl'] or '').rstrip('。'),
                  J({'課堂 考點／解析': [cls['core'], cls['expl']], '期末': [m.group(5) if m else None, m.group(6) if m else None]}))


async def main():
    from playwright.async_api import async_playwright
    URL, OUT = sys.argv[1], sys.argv[2]
    modes = [x.strip() for x in os.environ.get('CIV_PICK', 'class,wrong').split(',') if x.strip()]
    run = L.Run('se11_' + '+'.join(modes), OUT); os.makedirs(OUT, exist_ok=True)
    tr = C.TR('SE-11'); S = {'sha': os.environ.get('SHA', '?'), 'url': URL, 'modes': modes}
    print('==== SE-11（SHA %s）不用 turbo；照玩家上課、作答；不是 iPhone ====' % S['sha'], flush=True)
    if 'turbo' in URL: run.note('注意：URL 有 turbo，SE-11 規定不用 turbo')
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        try:
            await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('SE-11：遊戲載入', ok)
            await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(C.HOOK)
            base, d = await C.state_at(pg, ['Y1S1', 15, 4], 12.5, 'dorm')
            S['base_day'] = d
            n0 = await C.pl_n(pg)
            await C.load(pg, cdp, run, base, '大一上第 15 週週四 %s 12:30 宿舍（最小存檔，法律系）' % d['key'])
            await tr.take(pg, n0, 'class', 'setup')
            it = await pg.evaluate(C.EXITEM, ['civ_general', None])
            ask_id = await pg.evaluate(ASKOF, it['key']) if isinstance(it, dict) else None
            run.note('SE-11：民總那一堂 %s；CLS.askOf（只讀）＝%s' % (J(it), ask_id))
            run.check('SE-11：第 15 週週四有民總那一堂、課堂提問是 CIV40_03（只讀）', isinstance(it, dict) and ask_id == 'CIV40_03', J([it, ask_id]))
            n1 = await C.pl_n(pg)
            r = await C.play_trip(pg, cdp, run, 'se11_class', it, picks=(),
                                  shoot_txt=[(lambda t: t.startswith('答案是'), 'class_answer')],
                                  shoot_ch=[(lambda T, lt: bool(T) and T[0].startswith('（A）'), 'class_question')])
            # 課堂提問的選項：play_trip 的 pick_opt 點第一個（「（A）…」；不計分）
            R = await tr.take(pg, n1, 'class', 'class')
            run.check('SE-11：一鍵去上民總、上完（CLS.attend 跑完）', r['ok'], J({x: r[x] for x in ('btn', 'stuck', 'jumped', 'end')}))
            cls = class_ask(R); S['class'] = cls
            run.note('SE-11：課堂公布（原文）%s' % J(cls))
            run.check('SE-11：課堂有提問、公布答案（題幹、選項、「答案是…」都記到）', bool(cls and cls['stem'] and cls['opts'] and cls['answer_line']), J(cls))
            bank = await pg.evaluate(BANKQ, 'CIV40_03'); S['bank_CIV40_03'] = bank
            if cls and cls['stem']:
                run.note('INFO 課堂那一題和題庫 CIV40_03（只讀）：題幹%s、選項%s、答案 %s／%s' % ('同' if cls['stem'] == (bank or {}).get('q') else '不同', '同' if cls['opts'] == (bank or {}).get('opts') else '不同',
                                                                                     cls.get('letter'), (bank or {}).get('answer')))
            snap = await pg.evaluate("()=>GAME.snapshot()")
            S['walk_after_class'] = await pg.evaluate("GAME.walkFallbacks||0")
            if cls and cls['stem']:
                for mode in modes:
                    if mode not in ('class', 'wrong'): run.check('CIV_PICK %s 認得（class／wrong）' % mode, False); continue
                    try: await exam_round(pg, cdp, run, tr, snap, mode, cls, S)
                    except Exception as e:
                        run.check('SE-11 %s：跑完（沒有探針例外）' % mode, False, repr(e)[:500]); traceback.print_exc()
                        try: await run.shot(pg, 'se11_%s_exception' % mode)
                        except Exception: pass
                if not any(S.get(m, {}).get('drawn_hit') for m in modes):
                    run.setup('【捷徑：只讀】期末沒抽到 CIV40_03：讀頁面裡的 EXAM_BANK CIV40_03 全文、CLS.examPool 有沒有它，和課堂原文對照')
                    run.check('SE-11（只讀對照）：題庫 CIV40_03 在民總期末題池（%s），題幹、選項、答案和課堂一字不差' % (bank or {}).get('pool'),
                              bool(bank) and bank.get('pool') is not None and bank['q'] == cls['stem'] and bank['opts'] == cls['opts'] and str(bank['answer']) == str(cls.get('letter')),
                              J({'bank': bank, 'class': cls}))
        except Exception as e:
            run.check('SE-11：跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
            try: await run.shot(pg, 'se11_exception')
            except Exception: pass
        wf = await pg.evaluate("GAME.walkFallbacks||0"); S['walkFallbacks'] = wf
        run.check('SE-11：GAME.walkFallbacks=0（真實流程；前置只有讀檔、跳日期）', wf == 0, str(wf))
        run.check('SE-11：沒有 JS 例外', not errs, J(errs[:3]))
        hx = tr.hits(); S['blacklist'] = hx
        run.note('INFO 逐字稿黑名單字（%s）%d 筆：%s' % ('、'.join(C.BLACK), len(hx), J(hx[:20])))
        p1 = tr.save(OUT)
        json.dump(S, open(os.path.join(OUT, 'se11_summary.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=str)
        run.note('逐字稿 %s（%d 筆）；摘要 se11_summary.json；截圖 %d 張（請接 screencheck、看縮圖總表）' % (p1, len(tr.items), run.n))
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    print('SHA', S['sha'], flush=True)
    sys.exit(run.finish())


if __name__ == '__main__':
    asyncio.run(main())
