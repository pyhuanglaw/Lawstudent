# -*- coding: utf-8 -*-
"""CC（帳號 A）11-03：AA_609 學姊的奶奶（企劃線 claude/story-planning「docs/story_planning/AA_609_學姊的奶奶_取代爸爸.md」）的瀏覽器探針。
奶奶第一次出場的那一場＝學姊自己的畢業典禮 ev_sis_graduation（2026-06-06（六）11:00，祐廷大一下）：
  稿：AA_609 第 6 節那一列「sis_grad3d.js:186 她的大學畢業典禮「來，拍一張。」……恢復給奶奶：說話人「學姊的奶奶」：「來，拍一張。」；「九月開學？」照 AA_590 給媽媽」。
  實作（e79973830／84c5eaa59）：src/sis_grad3d.js:183-196 ev_sis_graduation（188 行 speaker '學姊的奶奶'）；
    觸發 src/sis_grad3d.js:230-232 S.gradRule：6/6 08:00～11:00、學姊 FAMILIAR 以上 → 私訊「今天十一點，A館。不用帶花。」＋ OUT.plan（sisg_grad，11:00，走過去 10 分鐘）。
  其他奶奶的場景都比較晚：3/17 晚餐 r3_events.js（大四 2029）、美國 208 剪報 us208_3d.js（2028-10）、走一圈剪報 sis_b13_events.js（2027-12）、礁溪 encounters.js:109（大三起）、
    祐廷畢業典禮 postgrad3d.js（2029-06）。
  AA_609 實作 commit：f56c0136f（＋458e17ae5 測試）；對照＝f56c0136f^（1ef4e2763，預期：「來，拍一張。」那一句不在、說話人不是「學姊的奶奶」→ FAIL）。
流程（不用 ?turbo；Playwright 手機橫向模擬 844×390，SwiftShader，不是 iPhone）：
  【前置／捷徑】最小存檔讀檔（GAME.applySave）：2026-06-06（六）10:40 宿舍、條件事件照開（只關「手機自動打開」）；
  【捷徑】用遊戲的 API 把學姊設成 FAMILIAR（SOCIAL.rel fam 25、relUp、contacts、met_sis、SIS_W1），GAME.snapshot() 再讀一次。
  照玩家：等她的私訊、出遊排進行程 → 等「出發：學姊的畢業典禮…」選項 → 手指點 → 點對話框到演完。
  從讀完檔起，MutationObserver 收 #caption、#dlgName、#dlgText、#choices 的所有文字（＋ GAME.say 的說話人、原文只記錄不改）。
檢查：
  ① 前置：學姊 FAMILIAR 以上；② 收到私訊（startswith「今天十一點，A館。不用帶花。」）；③ 出現「出發：」選項、點了；④ 演了 ev_sis_graduation；
  ⑤ 稿逐句（startswith，依序）：學姊的媽媽「九月開學？」→ 學姊的奶奶「來，拍一張。」（畫面上的說話人 #dlgName 也要一樣）；
  ⑥ 整個過程畫面上（#caption、對話框、選項）沒有「爸爸」；只出現「爸」的另外記 INFO。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> python3 cc_aa609_grandma_probe.py '<URL>/index.html' <輸出資料夾>
環境：AA609_MD＝稿的路徑（有給就確認期望句子逐字在稿裡）；WAIT_S（等出發選項的上限，預設 900）、PLAY_S（演事件的上限，預設 900）。
exit 0＝ALL PASS；1＝有 FAIL。"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

URL0, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
# DIM=1（BUG-ADV-NOPORTRAIT-DIM-1103 修好以後；BB 16:23）：奶奶（沒有立繪的名字說話人）那一句時，台上學姊的 .advSlot 要有 .dim，橫向、直向都驗
DIM = os.environ.get('DIM', '') == '1'
SLOTS = "[...document.querySelectorAll('#adv .advSlot')].map(e=>({id:e.id, show:e.classList.contains('show'), dim:e.classList.contains('dim'), off:e.classList.contains('off'), img:!!e.querySelector('img'), filter:getComputedStyle(e).filter}))"
DIMSEEN = {}
J = lambda o: json.dumps(o, ensure_ascii=False)
WAIT_S = int(os.environ.get('WAIT_S', '900')); PLAY_S = int(os.environ.get('PLAY_S', '900'))

# ---------------------------------------------------------------- AA_609 第 6 節（逐字抄）
DM = '今天十一點，A館。不用帶花。'          # sis_grad3d.js:231（AA_459 第 5 節；觸發用的私訊，不是 AA_609 改的）
EXPECT = [('學姊的媽媽', '九月開學？'), ('學姊的奶奶', '來，拍一張。')]
EVID = 'ev_sis_graduation'
BANNED = '爸爸'

BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'met_sis': True, 'SIS_W1': True}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'cvs', 'bookstore', 'dorm', 'dorm_hall', 'campus', 'classroom')


def url_for():
    base, _, q = URL0.partition('?'); ps = [x for x in q.split('&') if x and x != 'turbo']
    return base + ('?' + '&'.join(ps) if ps else '')


DAY_JS = "k=>{ const d=STORY.dayOfKey(k); if(d==null) return null; const c=CALENDAR.dateOf(d), t=CALENDAR.termOf?CALENDAR.termOf(d):null; return {d, wd:c.wd===7?0:c.wd, key:c.key, term:t&&t.id, week:t&&t.week}; }"

SOC = r"""(()=>{ const G=GAME.G, F=G.flags, id='heroine_05'; const R=SOCIAL.rel(id); R.fam=Math.max(R.fam|0,25); SOCIAL.remember(id,'FIRST_MET','');
  G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=STORY.dayOfKey('2025-09-24');
  const so=G.social||(G.social={}), U=so.relUp||(so.relUp={}); if((U[id]|0)<2) U[id]=2; F.met_sis=true; F.SIS_W1=true;
  return {stage:SOCIAL.stage(id), fam:R.fam}; })()"""

# 畫面上的字（MutationObserver）＋ GAME.say／EVENTS.run 記錄（只記不改）
HOOK = r"""(()=>{ if(window.__A609) return 'again'; const W=window.__A609={scr:[],say:[],ev:[]};
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const watch=(id,kind,get)=>{ const el=document.getElementById(id); if(!el) return false; let last='';
    const rec=()=>{ const t=get(el); if((t||kind==='name')&&t!==last){ W.scr.push({k:kind,t,at:at(),ms:Math.round(performance.now())}); } last=t; };
    new MutationObserver(rec).observe(el,{childList:true,subtree:true,characterData:true,attributes:true}); return true; };
  const vis=el=>!el.classList.contains('hide');
  const r={caption:watch('caption','caption',el=>vis(el)?(el.textContent||'').trim():''),
    dlgName:watch('dlgName','name',el=>(el.textContent||'').trim()),
    dlgText:watch('dlgText','text',el=>(el.textContent||'').trim()),
    choices:watch('choices','choices',el=>vis(el)?[...el.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).join('｜'):'')};
  const s0=GAME.say; GAME.say=function(w,t){ try{ W.say.push({n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t),at:at()}); }catch(e){} return s0.apply(this,arguments); };
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ try{ W.ev.push({id:String((ev&&ev.id)||''),at:at(),n:W.say.length}); }catch(e){} return v0.apply(this,arguments); }; }
  return r; })()"""

TS = r"""(()=>{ const D=GAME.D, ch=document.getElementById('choices'), dl=document.getElementById('dlg');
  return {dlg:!!(D&&D.active), name:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgName')||{}).textContent||'').trim():'',
    txt:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgText')||{}).textContent||'').trim():'',
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim()):[],
    busy:!!GAME.E.player.busy, depth:(D&&D.busyDepth)|0, phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()),
    h:+(+GAME.G.hour).toFixed(3), key:CALENDAR.dateOf(GAME.G.day).key, zone:GAME.G.zone}; })()"""
MSGS = "(()=>(GAME.G.msgs||[]).filter(m=>m.th==='p:heroine_05').map(m=>({d:CALENDAR.dateOf(m.day).key,h:+(+m.h||0).toFixed(2),tag:m.tag||'',text:String(m.text||'')})))()"
OUTQ = "(()=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>q.id==='sisg_grad').map(q=>({id:q.id,d:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state,title:q.title||''})))()"
EVDONE = "(id=>!!(((GAME.G.events||{}).done||{})[id]))"
CHOICE_AT = "(k=>{ const b=document.querySelectorAll('#choices button'); const e=b[k]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })"


async def tap_choice(pg, cdp, k):
    c = await pg.evaluate(CHOICE_AT, k)
    if c: await L.touch_tap(cdp, c[0], c[1])
    return bool(c)


def md_check(run):
    p = os.environ.get('AA609_MD')
    if not p: run.note('稿：沒有給 AA609_MD，只用探針裡逐字抄的句子'); return
    try: md = open(p, encoding='utf-8').read()
    except Exception as e: run.check('稿 AA609_MD 讀得到', False, repr(e)); return
    want = ['說話人「學姊的奶奶」：「來，拍一張。」', '「九月開學？」照 AA_590 給媽媽']
    miss = [w for w in want if w not in md]
    run.check('稿：探針的期望句子逐字在 AA_609 第 6 節（%d 處）' % len(want), not miss, J(miss))


async def main():
    run = L.Run('aa609_grandma', OUT); os.makedirs(OUT, exist_ok=True)
    print('cc_aa609_grandma_probe  SHA=%s  URL=%s' % (SHA, url_for()), flush=True)
    md_check(run)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        pg.set_default_timeout(180000)
        try:
            await pg.goto(url_for()); run.check('遊戲載入', await L.wait_loaded(pg))
            await pg.evaluate("localStorage.clear()")
            d = await pg.evaluate(DAY_JS, '2026-06-06')
            st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(BASEF),
                  'day': d['d'], 'weekday': d['wd'], 'hour': 10.0 + 40 / 60, 'zone': 'dorm', 'pos': None, 'weather': 'clear', 'stage': 'law', 'money': 30000,
                  'visited': {z: True for z in VISITED}}
            await pg.evaluate("(()=>{ window.__A609EV={a:EVENTS.onEnter,b:EVENTS.tick}; })()")   # 第一次讀檔關掉的條件事件，第二次讀檔前還原
            await L.load_state(pg, st, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(3000)
            run.setup('最小存檔讀檔：%s（星期%s，%s 第 %s 週）10:40 宿舍' % (d['key'], '日一二三四五六'[d['wd']], d['term'], d['week']))
            soc = await pg.evaluate(SOC)
            run.setup('用遊戲的 API 把學姊設成 FAMILIAR（SOCIAL.rel fam≥25、relUp、contacts、met_sis、SIS_W1）：%s；GAME.snapshot() 再讀一次（條件事件照開，只關手機自動打開）' % J(soc))
            snap = await pg.evaluate("()=>GAME.snapshot()")
            snap = snap.get('G', snap) if isinstance(snap, dict) else snap
            snap['hour'] = 10.0 + 40 / 60
            await pg.evaluate("localStorage.clear()")
            await pg.evaluate("(()=>{ EVENTS.onEnter=window.__A609EV.a; EVENTS.tick=window.__A609EV.b; })()")
            await pg.evaluate(HOOK)   # 讀檔前就開始收畫面上的字
            await L.load_state(pg, snap, quiet_events=False, quiet_phone=True); await pg.wait_for_timeout(3000)
            run.note('條件事件已還原：%s' % J(await pg.evaluate("(()=>EVENTS.onEnter===window.__A609EV.a&&EVENTS.tick===window.__A609EV.b)()")))
            stage = await pg.evaluate("(()=>SOCIAL.stage('heroine_05'))()")
            run.check('① 前置：學姊 FAMILIAR 以上（S.gradRule 要 atLeast FAMILIAR）', stage in ('FAMILIAR', 'FRIEND', 'CLOSE_FRIEND', 'POSSIBLE_ROMANTIC_INTEREST', 'ROMANTIC_TENSION', 'RELATIONSHIP'), stage)
            await run.shot(pg, 'loaded')
            # ---- 照玩家：等「出發：」選項（中間的對話、別的選項照玩家點；手機開著就收起來）
            t0 = time.time(); went = None; seen_ch = []
            while time.time() - t0 < WAIT_S:
                s = await pg.evaluate(TS)
                if s['ch']:
                    seen_ch.append(s['ch'])
                    k = next((i for i, t in enumerate(s['ch']) if t.startswith('出發：') and '畢業典禮' in t), None)
                    if k is not None:
                        await run.shot(pg, 'depart_choice'); went = s['ch'][k]; await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500); break
                    k2 = next((i for i, t in enumerate(s['ch']) if not t.startswith(('出發：', '不去了', '晚一點'))), 0)
                    run.note('別的選項 %s → 點 %s' % (J(s['ch']), s['ch'][k2])); await tap_choice(pg, cdp, k2); await pg.wait_for_timeout(1200); continue
                if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); continue
                if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
                await pg.wait_for_timeout(1000)
            msgs = await pg.evaluate(MSGS); oq = await pg.evaluate(OUTQ)
            run.note('學姊的私訊：%s；出遊：%s' % (J(msgs), J(oq)))
            run.check('② 收到她的私訊（startswith「%s」）' % DM, any(m['text'].startswith(DM) for m in msgs), J(msgs[-3:]))
            run.check('③ 照玩家：出現「出發：…畢業典禮…」選項、用手指點了', bool(went), J({'went': went, 'seen': seen_ch[-3:], 'clock': await pg.evaluate(TS)}))
            # ---- 演事件：點對話框到演完
            t1 = time.time(); last = None; since = time.time()
            while went and time.time() - t1 < PLAY_S:
                s = await pg.evaluate(TS); done = await pg.evaluate(EVDONE, EVID)
                if done and not s['dlg'] and not s['ch'] and s['depth'] == 0 and not s['busy']: break
                sig = (s['txt'][:30], tuple(s['ch']), s['zone'], s['h'])
                if sig != last: last = sig; since = time.time()
                elif time.time() - since > 240: run.note('240 秒沒有變化：%s' % J(s)); await run.shot(pg, 'stuck'); break
                if s['ch']:
                    run.note('事件裡的選項 %s → 點第一個' % J(s['ch'])); await tap_choice(pg, cdp, 0); await pg.wait_for_timeout(1200); continue
                if s['dlg']:
                    who = {'學姊的奶奶': 'grandma', '學姊的媽媽': 'mom'}.get(s['name'])
                    if who and (who, 'land') not in DIMSEEN:   # 沒有立繪的名字說話人：橫向、直向各截一張、記下台上立繪的狀態（BB 16:27）
                        await pg.wait_for_timeout(1200); await pg.screenshot(path=os.path.join(OUT, '%s_line.png' % who)); DIMSEEN[(who, 'land')] = await pg.evaluate(SLOTS)
                        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(2000)
                        await pg.screenshot(path=os.path.join(OUT, '%s_line_port.png' % who)); DIMSEEN[(who, 'port')] = await pg.evaluate(SLOTS)
                        await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(2000)
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
                await pg.wait_for_timeout(900)
            await pg.wait_for_timeout(2500); await run.shot(pg, 'after')
            W = await pg.evaluate("(()=>window.__A609||{scr:[],say:[],ev:[]})()")
            with open(os.path.join(OUT, 'transcript.json'), 'w', encoding='utf-8') as f: json.dump(W, f, ensure_ascii=False, indent=1)
            evi = next((e for e in W['ev'] if e['id'] == EVID), None)
            print('  媽媽、奶奶那一句時台上的立繪：' + J({'_'.join(k): v for k, v in DIMSEEN.items()}), flush=True)
            if DIM:   # 修好以後（f110787dd）：學姊還在台上（show、有圖、沒有 .off）而且變暗（.dim）
                for who, nm in (('mom', '媽媽'), ('grandma', '奶奶')):
                    for o in ('land', 'port'):
                        sl = DIMSEEN.get((who, o)); on = [x for x in (sl or []) if x['show'] and x['img']]
                        if sl is not None and not on and who == 'mom':   # V19 PC：媽媽那一句是這一場的第一句，學姊還沒上台＝台上沒有人可以暗，不算 FAIL（只記錄）
                            print('INFO ⑦ 媽媽說話時（%s）台上還沒有人（這一場的第一句；學姊下一句才上台）：%s' % (o, J(sl)), flush=True); continue
                        run.check('⑦ %s說話時（%s）學姊還在台上（有圖、沒有 .off）而且變暗（.dim）' % (nm, '橫向' if o == 'land' else '直向'),
                                  bool(on) and all(x['dim'] and not x['off'] for x in on), J(sl))
            run.check('④ 演了 %s（EVENTS.run 叫到、events.done 記上）' % EVID, bool(evi) and await pg.evaluate(EVDONE, EVID), J([e['id'] for e in W['ev']]))
            says = W['say'][evi['n']:] if evi else []
            nxt = next((e['n'] for e in W['ev'] if evi and e['n'] > evi['n']), None)
            if nxt is not None: says = W['say'][evi['n']:nxt]
            run.note('%s 的台詞（GAME.say）：%s' % (EVID, J([[x['n'], x['t']] for x in says])))
            # 畫面上的說話人＋句子（#dlgName、#dlgText 最後完整的那一版）
            scr = W['scr']; pairs = []; name = ''
            for r in scr:
                if r['k'] == 'name': name = r['t']
                elif r['k'] == 'text':
                    if pairs and pairs[-1][0] == name and r['t'].startswith(pairs[-1][1]): pairs[-1] = [name, r['t']]
                    else: pairs.append([name, r['t']])
            # ⑤ 稿逐句（依序、startswith）
            i = 0; found = []
            for want_n, want_t in EXPECT:
                j = next((k for k in range(i, len(says)) if says[k]['t'].startswith(want_t)), None)
                found.append(None if j is None else [says[j]['n'], says[j]['t']])
                ok_t = j is not None
                run.check('⑤ 稿逐句：「%s」有演（GAME.say startswith、依序）' % want_t, ok_t, J(found[-1]))
                run.check('⑤ 稿逐句：「%s」的說話人＝「%s」（GAME.say）' % (want_t, want_n), ok_t and says[j]['n'] == want_n, J(found[-1]))
                sp = next((q for q in pairs if q[1].startswith(want_t)), None)
                run.check('⑤ 畫面上：「%s」那一句對話框的名字＝「%s」（#dlgName）' % (want_t, want_n), bool(sp) and sp[0] == want_n, J(sp))
                if j is not None: i = j + 1
            # ⑥ 畫面上沒有「爸爸」
            bad = [r for r in scr if BANNED in r['t']]
            run.check('⑥ 整個過程畫面上（#caption、對話框、選項）沒有「%s」（收到 %d 筆字）' % (BANNED, len(scr)), not bad and len(scr) > 0, J(bad[:5]))
            dad = [r for r in scr if '爸' in r['t']]
            run.note('INFO 畫面上出現「爸」的字（不算 FAIL）：%s' % J(dad[:5]))
        except Exception as e:
            run.check('跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
            try: await run.shot(pg, 'exception')
            except Exception: pass
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    print('SHA', SHA, flush=True)
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
