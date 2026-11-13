"""CC（帳號 A）11-03：BUG-SLEEP-CINEMATIC-1103 瀏覽器探針（BB 2026-11-03）。
使用者原話：「不要每天都給我撥放走上床躺下熄燈，只要第二天從床上起來就好」。
修正：f5cd65cdf（src/story3d.js goToBed：S.SLEEP_FULL=false 時「淡出 → standUp → S.lieDown → 睡覺鏡頭 → S.roomDark(1) → 閉眼 → 淡入」，
     原本的走到梯子前（GM.walkTo）→ pose 'climb' 一階一階 → bed_entry → 淡出躺下 → darkTo 漸暗熄燈，搬到 goToBedFull，只有 S.SLEEP_FULL=true 才用）；
     醒來照舊 wakeUp／getUp（pose 'climbdown' 一階一階下來，站回梯子前）。Node 測試：tests/dorm_sleep_scene_unit.js ⑩。
對照（修改前）：f5cd65cdf^。預期：修正版 ALL PASS；修改前「沒有走路」「沒有爬梯」「沒有漸暗」「淡出裡躺下」會 FAIL。

判斷讀遊戲狀態（不靠目測）：頁面裡每 30 ms 取樣 player.pose、位置、S._dark、遊戲時間；包一層記錄
  GAME.walkTo、GAME.fade、STORY.lieDown、STORY.roomDark（k 值）、GAME.choose、GAME.say、GAME.titleCard（只記不改）。
  goToBed／goToBedFull 是閉包，從外面叫不到——用它們一定會叫的公開函式判斷：完整演出＝GAME.walkTo＋pose 'climb'＋roomDark 的小數 k（darkTo 漸暗）；
  修正版＝沒有 walkTo、躺下前沒有 'climb'、roomDark 只有 0／1、lieDown 發生在 fade(true) 之後、fade(false) 之前。
流程（觸發那幾步照玩家：CDP 觸控）：
  【前置／捷徑】最小存檔讀到 2025-11-09（日）22:30 宿舍（隔天 11/10 週一有憲法（上）09:10）；條件事件照常、只關手機自動打開（quiet_phone）
  → 照玩家走到床（互動點 sleep:true，按鈕「睡覺」）→ 按 #interact → 床的選單點「睡到明天」開頭的那一個 → 之後的對話、選單照玩家點（起床選單選「先起床」）
  → 讀：隔天、醒來從床上爬下來、站回梯子前、自動存檔是隔天、沒有 JS 例外。
不是 iPhone：Playwright 手機模擬（is_mobile、觸控；SwiftShader 1～4 fps）。URL 不加 ?turbo（有的話拿掉）。直向 390×844（ORIENT=land 改橫向）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> python3 cc_sleep_cine_probe.py '<URL>/index.html' <輸出資料夾>
每項一行 PASS／FAIL，最後 ALL PASS 或 FAILED n；exit 0／1。"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
URL = URL.replace('?turbo&', '?').replace('&turbo', '').replace('?turbo', '')
SHA = os.environ.get('SHA', '?')
LAND = os.environ.get('ORIENT', 'port') == 'land'
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def setup(s): print('  [前置／捷徑] ' + s, flush=True)
def note(s): print('  ' + s, flush=True)


class _Run:   # playlib.go_to 只用 run.note
    def note(self, s): note(s)


BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore', 'classroom')
DAY_KEY, HOUR = '2025-11-09', 22.5


async def state_at(pg, key, h, zone):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(BASEF)}
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}}
    return st, d


# 只記不改：包一層記參數、時間；30 ms 取樣
HOOK = r"""(()=>{ if(window.__SC) return 'again'; const W=window.__SC={log:[],fr:[],on:false};
  const t=()=>{ let h=null,d=null; try{ h=+(+GAME.G.hour).toFixed(4); d=GAME.G.day; }catch(e){} return {ms:Math.round(performance.now()),h,d}; };
  const push=(k,x)=>{ W.log.push(Object.assign({k},x||{},t())); if(W.log.length>4000) W.log.splice(0,1000); };
  const wrap=(o,fn,k,arg)=>{ const f0=o[fn]; if(typeof f0!=='function') return false; o[fn]=function(){ push(k,arg?arg.apply(null,arguments):{}); return f0.apply(this,arguments); }; return true; };
  const ok={walkTo:wrap(GAME,'walkTo','walkTo',(p,x,z)=>({x:+x,z:+z,player:!!(p&&GAME.E&&p===GAME.E.player)})),
    fade:wrap(GAME,'fade','fade',on=>({on:!!on})),
    lieDown:wrap(STORY,'lieDown','lieDown'),
    roomDark:wrap(STORY,'roomDark','roomDark',(G,k)=>({kk:+(+k||0).toFixed(3)})),
    choose:wrap(GAME,'choose','choose',o=>({t:(o||[]).filter(x=>x&&!x.hidden).map(x=>x.t||x.text||'')})),
    say:wrap(GAME,'say','say',(w,s)=>({t:String(s==null?'':s).slice(0,80)})),
    titleCard:wrap(GAME,'titleCard','titleCard',a=>({t:String(a==null?'':(typeof a==='object'?JSON.stringify(a):a)).slice(0,80)}))};
  setInterval(()=>{ if(!W.on) return; try{ const P=GAME.E.player, o=P.obj.position, fd=document.getElementById('fade');
    const f={pose:P.pose||null,x:+o.x.toFixed(3),y:+o.y.toFixed(3),z:+o.z.toFixed(3),dark:+((STORY._dark||0)).toFixed(3),eyes:!!(P.obj.userData&&P.obj.userData.eyesShut),
      fade:fd?+(+getComputedStyle(fd).opacity).toFixed(2):null,bed:!!STORY._bed}; const L=W.fr[W.fr.length-1];
    if(!L||L.pose!==f.pose||Math.abs(L.x-f.x)+Math.abs(L.y-f.y)+Math.abs(L.z-f.z)>0.02||L.dark!==f.dark||L.eyes!==f.eyes||L.fade!==f.fade||L.bed!==f.bed||L.d!==GAME.G.day){ W.fr.push(Object.assign(f,t())); if(W.fr.length>6000) W.fr.splice(0,2000); } }catch(e){} },30);
  return ok; })()"""
BEDIT = "(()=>{ const it=(GAME.E.interactables||[]).find(x=>x.sleep); return it?{x:it.x,z:it.z,label:it.label||null}:null; })()"
SCENE = "(()=>{ const sc=STORY.sleepSceneOf?STORY.sleepSceneOf(GAME):null; if(!sc) return null; return {approach:sc.approach,steps:sc.steps,feet:sc.lie.feet,top:sc.lie.mattress_top_y}; })()"
STATE = "(()=>{ const G=GAME.G, P=GAME.E.player, o=P.obj.position; return {day:G.day,key:CALENDAR.dateOf(G.day).key,h:+(+G.hour).toFixed(3),zone:G.zone,pose:P.pose,busy:!!P.busy,frozen:!!P.frozen,x:+o.x.toFixed(2),y:+o.y.toFixed(2),z:+o.z.toFixed(2),bed:!!STORY._bed,dark:STORY._dark||0,full:STORY.SLEEP_FULL===undefined?'undefined':STORY.SLEEP_FULL}; })()"
AUTO = "(()=>{ try{ const s=(GAME.readSave?GAME.readSave('fatiao3d_auto'):(GAME.readSave?GAME.readSave('fatiao3d_auto'):JSON.parse(localStorage.getItem('fatiao3d_auto')||'null'))); if(!s) return null; const G=s.G||s; return {day:G.day,hour:G.hour,zone:G.zone}; }catch(e){ return {err:String(e)}; } })()"


def pick(opts, prefs):
    for pf in prefs:
        for i, o in enumerate(opts):
            if not o['dim'] and o['t'].startswith(pf): return i
    for i, o in enumerate(opts):
        if not o['dim']: return i
    return 0


async def play(pg, cdp, prefs, max_s, until=None):
    """對話點下去、選單照 prefs（開頭符合）點；until(state)→True 就停。回傳 (選過的, 是否被 until 停下)"""
    t0 = time.time(); chose = []; idle = None
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['phone'] and not s['dlg'] and not s['ch']: await L.phone_away(pg, cdp, tries=2); continue
        if until and await until(s): return chose, True
        if s['ch']:
            idle = None; await pg.wait_for_timeout(500); s = await P.ts(pg)
            if not s['ch']: continue
            k = pick(s['ch'], prefs); chose.append({'opts': [o['t'] for o in s['ch']], 'picked': s['ch'][k]['t'], 'h': s['h'], 'day': s['day']})
            note('選單 %s → %s' % (J([o['t'] for o in s['ch']]), s['ch'][k]['t']))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if s['busy'] or s['depth'] > 0: idle = None; await pg.wait_for_timeout(500); continue
        idle = idle or time.time()
        if time.time() - idle > 8: break
        await pg.wait_for_timeout(500)
    return chose, False


async def main():
    os.makedirs(OUT, exist_ok=True)
    rec = {'sha': SHA, 'url': URL, 'orient': 'land' if LAND else 'port'}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=LAND)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        n = [0]

        async def shot(lab):
            n[0] += 1; fp = os.path.join(OUT, 'sleep_%02d_%s.png' % (n[0], lab))
            try: await pg.screenshot(path=fp)
            except Exception as e: note('截圖失敗 %r' % e)
            return fp
        try:
            await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok)
            await pg.evaluate("localStorage.clear()"); await P.init(pg)
            st, d = await state_at(pg, DAY_KEY, HOUR, 'dorm')
            await L.load_state(pg, st, quiet_phone=True); await pg.wait_for_timeout(4000)
            try: await L.phone_away(pg, cdp, tries=2)
            except Exception: pass
            setup('最小存檔讀到 %s %.2f 宿舍（遊戲日 %s）；條件事件照常，只關「要回覆的訊息自動打開手機」' % (d['key'], HOUR, d['d']))
            hk = await pg.evaluate(HOOK); rec['hooks'] = hk
            check('記錄鉤子都掛上（GAME.walkTo、fade、choose、say、STORY.lieDown、roomDark）', isinstance(hk, dict) and all(hk.get(k) for k in ('walkTo', 'fade', 'lieDown', 'roomDark', 'choose', 'say')), J(hk))
            sc = await pg.evaluate(SCENE); rec['scene'] = sc
            check('宿舍有上舖的睡覺場面資料（STORY.sleepSceneOf）', bool(sc), J(sc))
            s0 = await pg.evaluate(STATE); rec['s0'] = s0; note('起點 %s' % J(s0))
            bed = await pg.evaluate(BEDIT); rec['bed'] = bed
            if not check('宿舍有床的互動點（sleep:true）', bool(bed), J(bed)): raise RuntimeError('no bed')
            arrived = await L.go_to(pg, cdp, _Run(), bed['x'], bed['z'], 0.7, '床', max_s=300, stop=lambda s: s['interact'].startswith('睡覺'))
            lab = (await P.ts(pg))['lab']
            check('照玩家走到床、按鈕是「睡覺」', bool(arrived) and lab.startswith('睡覺'), J({'lab': lab}))
            await shot('at_bed')
            s1 = await pg.evaluate(STATE); rec['s_at_bed'] = s1
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            # 床的選單
            t0 = time.time(); opts = None
            while time.time() - t0 < 60:
                s = await P.ts(pg)
                if s['ch']: opts = s['ch']; break
                if s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(700)
            rec['bed_menu'] = opts
            k = next((i for i, o in enumerate(opts or []) if not o['dim'] and o['t'].startswith('睡到明天')), None)
            check('床的選單有「睡到明天…」（開頭比對）', k is not None, J([o['t'] for o in (opts or [])]))
            if k is None: raise RuntimeError('no sleep option')
            picked = opts[k]['t']; await shot('bed_menu')
            await pg.evaluate("(()=>{ window.__SC.on=true; window.__SC.pick={ms:Math.round(performance.now()),h:+(+GAME.G.hour).toFixed(4),d:GAME.G.day}; })()")
            await P.tap_choice(pg, cdp, k); note('點「%s」' % picked)
            # 黑幕裡躺好的那一刻截圖（修正版：一淡入就躺在床上、燈熄）
            shot_lie = None; t1 = time.time()
            while time.time() - t1 < 60:
                f = await pg.evaluate("(()=>{ const P=GAME.E.player; return {pose:P.pose,dark:STORY._dark||0}; })()")
                if f['pose'] == 'lie': await pg.wait_for_timeout(900); shot_lie = await shot('lying'); break
                await pg.wait_for_timeout(150)
            d0 = s0['day']

            async def woke(s):
                return s['day'] == d0 + 1 and not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and \
                    (await pg.evaluate("(()=>!STORY._bed&&GAME.E.player.pose!=='lie')()"))
            chose, stopped = await play(pg, cdp, ('先起床', '起床', '照樣', '好'), max_s=900, until=woke)
            rec['chose'] = chose
            t2 = time.time()   # play() 可能在起床前的空檔（8 秒沒有對話）就停：再等爬下來、床的狀態清掉（最多 120 秒）
            while time.time() - t2 < 120:
                q = await pg.evaluate(STATE)
                if q['day'] == d0 + 1 and q['pose'] not in ('lie', 'climb', 'climbdown') and not q['busy'] and not q['bed']: break
                s = await P.ts(pg)
                if s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(1000)
            note('play() 停下 %s；之後等起床 %.1f 秒' % ('（等到醒來）' if stopped else '（空檔逾時）', time.time() - t2))
            await pg.wait_for_timeout(3000)
            s2 = await pg.evaluate(STATE); rec['s_end'] = s2; await shot('woke')
            W = await pg.evaluate("(()=>({log:window.__SC.log,fr:window.__SC.fr,pick:window.__SC.pick}))()")
            log, fr, pk = W['log'], W['fr'], W['pick']
            rec['pick'] = pk
            after = [x for x in log if x['ms'] >= pk['ms']]
            lie_i = next((i for i, x in enumerate(after) if x['k'] == 'lieDown'), None)
            lie_ms = after[lie_i]['ms'] if lie_i is not None else None
            pre = after[:lie_i] if lie_i is not None else after
            walks = [x for x in pre if x['k'] == 'walkTo' and x.get('player')]
            fr_after = [f for f in fr if f['ms'] >= pk['ms']]
            fr_pre = [f for f in fr_after if lie_ms is None or f['ms'] < lie_ms]
            climb_pre = [f for f in fr_pre if f['pose'] == 'climb']
            darks_bed = [x['kk'] for x in after if x['k'] == 'roomDark' and x.get('d') == d0]
            frac = [k2 for k2 in darks_bed if 0 < k2 < 1]
            fade_on = next((x for x in pre if x['k'] == 'fade' and x['on']), None)
            fade_off_after = next((x for x in after[(lie_i or 0):] if x['k'] == 'fade' and not x['on']), None) if lie_i is not None else None
            fr_first_lie = next((f for f in fr_after if f['pose'] == 'lie'), None)
            pos_moved = 0.0
            for a, b2 in zip(fr_pre, fr_pre[1:]): pos_moved += abs(a['x'] - b2['x']) + abs(a['z'] - b2['z']) + abs(a['y'] - b2['y'])
            ys_pre = [f['y'] for f in fr_pre]
            rec.update(walks=walks, climb_pre=len(climb_pre), darks_bed=darks_bed, fade_on=fade_on, first_lie=fr_first_lie, pos_moved_pre=round(pos_moved, 3))
            timing = {'pick_to_fade_ms': (fade_on['ms'] - pk['ms']) if fade_on else None, 'pick_to_lie_ms': (lie_ms - pk['ms']) if lie_ms else None,
                      'pick_to_lie_game_min': round((after[lie_i]['h'] - pk['h']) * 60, 2) if lie_i is not None else None,
                      'frames_before_lie': len(fr_pre), 'max_y_before_lie': max(ys_pre) if ys_pre else None}
            rec['timing'] = timing
            note('點選項到 fade(true)／躺下：%s' % J(timing))
            note('躺下前的鉤子：%s' % J([(x['k'], x.get('on', x.get('kk', x.get('t', '')))) for x in pre][:30]))
            check('上床：沒有走到梯子前（點選項到躺下之間沒有 GAME.walkTo）', lie_i is not None and not walks, J({'walkTo': walks[:3], 'lie': lie_i is not None}))
            check('上床：躺下前沒有爬梯（pose 沒有出現 climb）', lie_i is not None and not climb_pre, J({'climb_frames': len(climb_pre), 'poses': sorted(set(f['pose'] or '' for f in fr_pre))}))
            check('上床：躺下前人沒有沿著梯子／床移動（位置變化 < 0.3 m、高度沒超過 0.3 m）', lie_i is not None and pos_moved < 0.3 and (not ys_pre or max(ys_pre) < 0.3), J({'moved': round(pos_moved, 3), 'maxY': timing['max_y_before_lie']}))
            check('上床：直接黑幕（點選項後第一個畫面動作是 fade(true)，躺下在 fade(true) 之後、fade(false) 之前）',
                  bool(fade_on) and lie_i is not None and bool(fade_off_after) and fade_on['ms'] <= lie_ms <= fade_off_after['ms'] and not any(x['k'] in ('walkTo',) for x in pre),
                  J({'fade_on': fade_on and fade_on['ms'] - pk['ms'], 'lie': lie_ms and lie_ms - pk['ms'], 'fade_off': fade_off_after and fade_off_after['ms'] - pk['ms']}))
            check('上床：不演熄燈（roomDark 沒有 0～1 之間的漸暗，熄燈在黑幕裡一次到 1）', bool(darks_bed) and not frac and 1 in darks_bed, J({'roomDark_k': darks_bed[:20]}))
            check('上床：躺好時燈已熄、閉眼（第一個 lie 取樣 dark=1、eyesShut）', bool(fr_first_lie) and fr_first_lie['dark'] >= 0.99 and fr_first_lie['eyes'], J(fr_first_lie))
            # 醒來
            fr_next = [f for f in fr_after if f['d'] == d0 + 1]
            downs = [f for f in fr_next if f['pose'] == 'climbdown']
            dys = [f['y'] for f in downs]
            mono = all(a >= b2 - 0.02 for a, b2 in zip(dys, dys[1:]))
            check('醒來：從床上起來、一階一階爬下來（隔天 pose climbdown 取樣 ≥ 3、高度往下）', len(downs) >= 3 and mono and bool(dys) and dys[0] > dys[-1] + 0.3,
                  J({'n': len(downs), 'y': [round(y, 2) for y in dys[:12]]}))
            lie_next = [f for f in fr_next if f['pose'] == 'lie']
            check('醒來：隔天一開始還躺在床上（隔天有 lie 取樣，再接 climbdown）', bool(lie_next) and bool(downs) and lie_next[0]['ms'] < downs[0]['ms'], J({'lie': len(lie_next), 'down': len(downs)}))
            ap = sc and sc['approach']
            near_ap = bool(ap) and abs(s2['x'] - ap[0]) < 1.5 and abs(s2['z'] - ap[1]) < 1.5 if s2['zone'] == 'dorm' else None
            check('醒來：站回地面、能動（pose 不是 lie／climb／climbdown、y≈0、沒有凍住、床的狀態清掉）', s2['pose'] not in ('lie', 'climb', 'climbdown') and abs(s2['y']) < 0.2 and not s2['frozen'] and not s2['bed'],
                  J({'s': s2, 'near_approach': near_ap}))
            check('時間推進：換到隔天（day +1）、早上醒來（05:00～12:00）', s2['day'] == d0 + 1 and 5 <= s2['h'] < 13,
                  J({'d0': d0, 's2': s2, 'chose': [c['picked'] for c in chose]}))
            wake_h = next((f['h'] for f in fr_next), None)
            note('隔天第一個取樣的遊戲時間 %s；起床後 %s' % (wake_h, s2['h']))
            au = await pg.evaluate(AUTO); rec['autosave'] = au
            check('存檔：自動存檔是隔天（localStorage fatiao3d_auto 的 day = %d）' % (d0 + 1), bool(au) and au.get('day') == d0 + 1, J(au))
            if not stopped: note('注意：play() 沒有等到「醒來、空下來」的狀態就結束（%s）' % J(s2))
        except Exception as e:
            check('跑完（沒有探針例外）', False, repr(e)[:400]); traceback.print_exc()
            try: await shot('exception')
            except Exception: pass
        finally:
            check('沒有 JS 例外', not errs, J(errs[:3])); rec['errs'] = errs[:5]
            with open(os.path.join(OUT, 'sleep_cine_record.json'), 'w', encoding='utf-8') as f: json.dump(rec, f, ensure_ascii=False, indent=1, default=str)
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    print('SHA', SHA, flush=True)
    print('ALL PASS' if not FAILS else 'FAILED %d' % len(FAILS), flush=True)
    sys.exit(1 if FAILS else 0)


if __name__ == '__main__':
    asyncio.run(main())
