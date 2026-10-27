"""BB-C 10-27：X117／BB_TEST_QUEUE_1027 5p「打羽球不背包」（BADCLIP-BAG-1027，開發分支 056851057；使用者 22:4x「打羽球男主角還背著背包什麼意思」）。
羽球小短片（src/badminton_clip3d.js）開演時 CHAR.carryOff 把祐廷和對手身上的包（backpack、tote、guitar、bag_yu、folder、apron、helmet、foodmap、thermos）拿下來，
演完、跳過、出錯照原本還原；眼鏡、耳環、髮圈不動。
環境變數：
  PARTNER＝heroine_01（以安，托特包）／heroine_03（語彤，後背包）／zhe（阿哲，後背包）／classmate_bohan（柏翰，眼鏡＋後背包）；預設 heroine_03
  MODE＝setup（預設）：【前置】讀使用者存檔、人在新體育館 1F 18:48；【捷徑】INV.accept 寫進「今天 19:00 和 PARTNER 約在新體育館羽球場」（遊戲自己的約好函式）
          → 之後照遊戲：她照作息走進來（INV.entryFor：約好的時間前 15 分鐘）、兩個人都在場＝見面自己開始（S.autoStart）→ 短片
        phone：【前置】讀使用者存檔、人在宿舍 17:00 → 手機「朋友」→ PARTNER「約」→「去新體育館打羽球」→ 今天的時段 → 【捷徑】時間撥到約好的前 12 分鐘
          → 手機「地點」快速前往新體育館 → 見面自己開始 → 短片
  FULL＝1（預設）：之前沒有和 PARTNER 打完的羽球邀約＝完整版三個鏡頭；FULL=0：【前置】先放一筆打完的＝第二次（只有鏡頭 2）
  SKIP＝1：短片第一個鏡頭開始約 1.2 秒後按「跳過」
  QUIET＝1：關掉條件事件（預設不關）
檢查：短片有演、鏡頭數對；演出中每一格兩個人身上的包都不見（effective visible＝自己和所有上層都 visible）、眼鏡等不是包的配件還在；
  演完（含跳過）照原本還原（站著時後背包又看得到）；跳過＝沒有 BADCLIP.LINES 那一句、對話框照常回來；沒有卡住（busyDepth 0、能動）；沒有 JS 例外。
每個鏡頭一張截圖（頁面記錄鏡頭切換，Python 看到換鏡頭就截）。不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。預設不用 ?turbo（turbo 把 GM.sleep 壓到 120 ms）。
用法：LW_TESTS=<工作樹>/tests PARTNER=heroine_03 python3 badclip_bag_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]
  存檔預設 scratchpad bbtest/p0an/user_day14.json（法律系 day 14；裡面已經有一筆和語彤打完的羽球 iv11——FULL=1 會先拿掉）"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
SAVEF = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an/user_day14.json'
PARTNER = os.environ.get('PARTNER', 'heroine_03'); MODE = os.environ.get('MODE', 'setup'); FULL = os.environ.get('FULL', '1') != '0'
SKIP = os.environ.get('SKIP') == '1'; QUIET = os.environ.get('QUIET') == '1'
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
H_MEET = 19.0
GYM_SPAWN = {'x': 0, 'z': 17.6, 'yaw': 3.14159, 'lv': 0, 'y': 0}

# 頁面內記錄（在讀檔以前裝好，讀檔不會清掉 window）：每 200 ms 一筆；BADCLIP.busy 以前一直覆寫 pre、演的時候記 samples、結束以後記 post
REC_JS = """(pid=>{ if(window.__bbc) return; window.__bbPartner=pid; const R=window.__bbc={pre:null,samples:[],cuts:[],post:[],t0:null,busySeen:false,tEnd:null,err:null};
  const CARRY=(typeof CHAR!=='undefined'&&CHAR.CARRY)?CHAR.CARRY.slice():['backpack','tote','guitar','bag_yu','folder','apron','helmet','foodmap','thermos'];
  const effVis=o=>{ let x=o; while(x){ if(!x.visible) return false; x=x.parent; } return true; };
  const ents=()=>{ const E=GAME.E, o={P1:E.player}; const n=(GAME.npc&&GAME.npc[pid])||(E.npcs||[]).find(m=>m.charId===pid||m.id===pid); if(n) o.partner=n; return o; };
  const snap=()=>{ const out={}, es=ents(); for(const k in es){ const e=es[k], u=(e.obj&&e.obj.userData)||{}, P=u.props||{}, pos=e.obj.position, o={};
      for(const n in P){ const p=P[n]; if(!p||!p.isObject3D) continue; const w=new THREE.Vector3(); p.getWorldPosition(w); o[n]={vis:effVis(p),own:!!p.visible,carry:CARRY.includes(n),d:+Math.hypot(w.x-pos.x,w.z-pos.z).toFixed(2)}; }
      out[k]={props:o,pose:e.pose||null,propOn:u.propOn?Object.assign({},u.propOn):null}; } return out; };
  let lastCam=null;
  R.iv=setInterval(()=>{ try{ const busy=typeof BADCLIP!=='undefined'&&!!BADCLIP.busy, now=performance.now();
    if(!busy){ if(!R.busySeen){ R.pre={t:now,ents:snap()}; } else { if(R.tEnd==null) R.tEnd=now; if(R.post.length<60) R.post.push({t:Math.round(now-R.t0),ents:snap(),depth:GAME.D.busyDepth}); } return; }
    if(!R.busySeen){ R.busySeen=true; R.t0=now; }
    const cp=GAME.E.camera.position, cam=[+cp.x.toFixed(2),+cp.y.toFixed(2),+cp.z.toFixed(2)], t=Math.round(now-R.t0);
    if(!lastCam||Math.hypot(cam[0]-lastCam[0],cam[1]-lastCam[1],cam[2]-lastCam[2])>1.5) R.cuts.push({t,cam}); lastCam=cam;
    R.samples.push({t,shot:R.cuts.length,ents:snap()}); }catch(e){ R.err=String(e); } },200); })"""
DBG = """(()=>{ const D=GAME.D, E=GAME.E, R=window.__bbc||{}; return {depth:D.busyDepth, dlg:!!D.active, txt:((document.getElementById('dlgText')||{}).textContent||'').slice(0,40),
  busy:!!E.player.busy, frozen:!!E.player.frozen, zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(3), clip:typeof BADCLIP!=='undefined'&&!!BADCLIP.busy, cuts:(R.cuts||[]).length, seen:!!R.busySeen,
  iv:(GAME.G.invites||[]).filter(v=>v.place==='gym_badminton'&&v.who===window.__bbPartner).map(v=>v.state).slice(-1)[0]||null,
  ch:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>b.textContent.slice(0,16)), skipBtn:!!document.getElementById('badclipSkip') }; })()"""


def base_state(zone, hour, pos):
    s = copy.deepcopy(SAVE); s.pop('_stuck', None)
    s['zone'] = zone; s['hour'] = hour; s['pos'] = pos
    inv = [v for v in s.get('invites', []) if not (v.get('who') == PARTNER and v.get('place') == 'gym_badminton')]
    if not FULL:   # 【前置】之前打完過一次（第二次只演鏡頭 2）
        inv.append({'id': 'ivbb0', 'who': PARTNER, 'place': 'gym_badminton', 'zone': 'gym', 'day': s['day'] - 3, 'h': 19.0, 'state': 'done', 'accepted': True, 'by': 'player', 'now': False, 'label': 'BB 前置：上次打過'})
    s['invites'] = inv
    r = s.setdefault('social', {}).setdefault('rel', {}).setdefault(PARTNER, {'fam': 0, 'trust': 0, 'aff': 0, 'resp': 0, 'comf': 0, 'rom': 0, 'npcRom': 0, 'seen': 0, 'talked': 0})
    r['fam'] = max(r.get('fam', 0), 30); r['trust'] = max(r.get('trust', 0), 15); r['comf'] = max(r.get('comf', 0), 15)   # 【前置】有點熟（FAMILIAR）以上才約得了羽球
    s.setdefault('contacts', {})[PARTNER] = s.get('contacts', {}).get(PARTNER, 1) or 1
    s.setdefault('visited', {})['gym'] = True
    return s


async def tap_choice(pg, cdp, pred_js):
    c = await pg.evaluate("""(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const b=bs.find(x=>(%s)(x.textContent)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent]; })()""" % pred_js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return c[2]


async def main():
    run = L.Run('badclip_bag_%s_%s%s%s' % (PARTNER, MODE, '' if FULL else '_2nd', '_skip' if SKIP else ''), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await pg.evaluate(REC_JS + "(%s)" % json.dumps(PARTNER))
        if MODE == 'phone':
            st = base_state('dorm', 17.0, {'x': 0, 'z': 2.4, 'yaw': 3.14159, 'lv': 0, 'y': 0})
            run.setup('[前置] 讀使用者存檔（day 14）：宿舍房間 17:00；%s 有點熟、有聯絡方式、去過新體育館；%s' % (PARTNER, '之前沒一起打過羽球' if FULL else '之前打過一次'))
            await L.load_state(pg, st, quiet_events=QUIET, quiet_phone=True); await pg.wait_for_timeout(4000)
            await L.close_panels(pg, cdp)
            if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
            await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(800)
            has = await pg.evaluate("(id=>{ const e=document.querySelector('#phoneBody [data-inv=\"'+id+'\"]'); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })(%s)" % json.dumps(PARTNER))
            run.check('手機「朋友」有 %s 的「約」' % PARTNER, has)
            if has:
                await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#phoneBody [data-inv="%s"]' % PARTNER); await pg.wait_for_timeout(1500)
            got = await tap_choice(pg, cdp, "t=>t.startsWith('去新體育館打羽球')")
            run.check('選地方「去新體育館打羽球」', bool(got), str(got))
            got = await tap_choice(pg, cdp, "t=>/^今天 (1[89]|20):00/.test(t)") or await tap_choice(pg, cdp, "t=>t.startsWith('今天')")
            run.check('選時間（今天的時段）', bool(got), str(got))
            s = await L.advance_dialogs(pg, cdp, run, lambda s: not s['dlg'] and not s['choices'] and not s['busy'], max_steps=30)
            iv = await pg.evaluate("(id=>(GAME.G.invites||[]).filter(v=>v.who===id&&v.place==='gym_badminton').slice(-1)[0]||null)(%s)" % json.dumps(PARTNER))
            run.check('答應了：約好今天的羽球（accepted）', bool(iv) and iv.get('state') == 'accepted', json.dumps(iv, ensure_ascii=False))
            if iv:
                run.setup('[捷徑] 時間撥到約好的前 12 分鐘（%.2f）' % (iv['h'] - 0.2))
                await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % (iv['h'] - 0.2))
            await L.close_panels(pg, cdp)
            # BB-C 23:4x：手機「地點」的快速前往清單（PLACES.quickList）沒有新體育館——第一版找它＝FAIL（工具假設錯）。
            # 遊戲的路：約好的時間前 30 分鐘、人不在那一區、空下來＝跳「直接過去：和…」（invites3d.js S.goPrompt，UX-INV-GO-1023）→ 點它
            gl = await pg.evaluate("(PLACES.quickList()||[]).filter(p=>p&&p[0]==='gym').map(p=>p[1])")
            run.note('手機「地點」快速前往清單裡的新體育館：%s（沒有＝要走過去或用「直接過去」）' % gl)
            got = None
            for _ in range(120):
                q = await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); return (ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>b.textContent):[]; })()")
                if any(t.startswith('直接過去') for t in q):
                    got = next(t for t in q if t.startswith('直接過去')); await tap_choice(pg, cdp, "t=>t.startsWith('直接過去')"); break
                if q: await tap_choice(pg, cdp, "t=>true")
                elif await pg.evaluate("!!(GAME.D&&GAME.D.active)"): await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(500)
            run.check('約好的時間前跳出「直接過去：和…」、點它', bool(got), str(got))
            await pg.wait_for_timeout(6000)
        else:
            st = base_state('gym', H_MEET - 0.2, GYM_SPAWN)
            run.setup('[前置] 讀使用者存檔（day 14）：新體育館 1F 入口 %.2f；%s 有點熟、有聯絡方式；%s' % (H_MEET - 0.2, PARTNER, '之前沒一起打過羽球' if FULL else '之前打過一次'))
            await L.load_state(pg, st, quiet_events=QUIET, quiet_phone=True); await pg.wait_for_timeout(3000)
            await L.close_panels(pg, cdp)
            ok = await pg.evaluate("((id,h)=>!!INV.accept(GAME.G,id,'gym_badminton',GAME.G.day,h)||(GAME.G.invites||[]).some(v=>v.who===id&&v.place==='gym_badminton'&&v.state==='accepted'))(%s,%s)" % (json.dumps(PARTNER), H_MEET))
            run.setup('[捷徑] INV.accept：今天 %s 和 %s 約在新體育館羽球場（＝手機約好了）' % (H_MEET, PARTNER))
            run.check('約好了（accepted）', ok)
        pre_note = await pg.evaluate("JSON.stringify((window.__bbc||{}).pre)")
        run.note('開演以前的配件：%s' % (pre_note or '')[:900])
        # 等短片開演；之後每換一個鏡頭截一張
        t0 = time.time(); shots = 0; skipped = False; started = False; last = None; said = []
        while time.time() - t0 < 420:
            s = await pg.evaluate(DBG); k = json.dumps(s, ensure_ascii=False)
            if k != last: last = k; run.note(k)
            if s['txt'] and (not said or said[-1] != s['txt']): said.append(s['txt'])
            if s['seen']: started = True
            if s['clip']:
                if s['cuts'] > shots:
                    shots = s['cuts']; await pg.wait_for_timeout(500); await run.shot(pg, 'cut%d' % shots)
                    if SKIP and not skipped:
                        await pg.wait_for_timeout(700); skipped = await L.tap(pg, cdp, '#badclipSkip'); run.note('按「跳過」：%s' % skipped)
                await pg.wait_for_timeout(150); continue
            if started and not s['clip']:
                if s['ch']:
                    await tap_choice(pg, cdp, "t=>true"); continue
                if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
                if s['depth'] == 0 and not s['busy'] and s['iv'] == 'done': break
            elif s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            elif s['ch']: await tap_choice(pg, cdp, "t=>true"); continue
            await pg.wait_for_timeout(400)
        await run.shot(pg, 'after')
        R = await pg.evaluate("(()=>{ const R=window.__bbc||{}; return {pre:R.pre,samples:R.samples,cuts:R.cuts,post:R.post,err:R.err,t0:R.t0,tEnd:R.tEnd}; })()")
        json.dump(R, open(os.path.join(OUT, 'record_%s.json' % run.name), 'w', encoding='utf-8'), ensure_ascii=False)
        run.note('鏡頭切換：%s' % json.dumps(R['cuts'], ensure_ascii=False))
        run.check('短片有演（BADCLIP.busy 出現過）', started, str(len(R['samples'])))
        nc = max(0, len(R['cuts'] or []) - 1)   # BB-C 23:3x：cuts 第一筆（t=0）是開演那一格原本跟著玩家的鏡頭，不是切換（第一版把它算進去：完整版 4 筆＝切 3 次、第二次 2 筆＝切 1 次）
        if SKIP: run.check('跳過：按得到「跳過」', bool(skipped))
        elif FULL: run.check('完整版：三個鏡頭（鏡頭切換 ≥3，不算開演那一格；鏡頭 3 裡面可能再切一次）', nc >= 3, str(nc))
        else: run.check('第二次：只有鏡頭 2（鏡頭切換 1 次，不算開演那一格）', nc == 1, str(nc))
        # 演出中每一格：包都不見；不是包的配件跟開演以前一樣
        pre = (R.get('pre') or {}).get('ents') or {}
        bad, keep_bad, seen_ents = [], [], set()
        for smp in R['samples'] or []:
            for who, e in smp['ents'].items():
                seen_ents.add(who)
                for n, pr in e['props'].items():
                    if pr['carry'] and pr['vis']: bad.append('%dms 鏡頭%d %s.%s' % (smp['t'], smp['shot'], who, n))
                    pv = ((pre.get(who) or {}).get('props') or {}).get(n)
                    if not pr['carry'] and pv and pv['vis'] != pr['vis']: keep_bad.append('%dms %s.%s %s→%s' % (smp['t'], who, n, pv['vis'], pr['vis']))
        run.check('演出中記到祐廷和對手（P1、partner）', {'P1', 'partner'} <= seen_ents, str(sorted(seen_ents)))
        carried = {who: [n for n, pr in ((pre.get(who) or {}).get('props') or {}).items() if pr['carry']] for who in ('P1', 'partner')}
        run.note('開演以前身上的包：%s' % json.dumps(carried, ensure_ascii=False))
        run.check('演出中兩個人身上都沒有包（每 200 ms 一格）', not bad, '；'.join(bad[:12]))
        run.check('眼鏡、耳環、髮圈等不是包的配件照舊', not keep_bad, '；'.join(keep_bad[:8]))
        # 演完：照原本還原（站著時）
        post = R.get('post') or []   # 短片結束以後 12 秒（每 200 ms）；見面演完她可能離開＝partner 不在，取她最後還在的那一格
        fin = {who: next((q['ents'][who] for q in reversed(post) if who in q['ents']), {}) for who in ('P1', 'partner')}
        miss = []
        for who in ('P1', 'partner'):
            for n, pv in ((pre.get(who) or {}).get('props') or {}).items():
                if not pv['carry']: continue
                cur = ((fin.get(who) or {}).get('props') or {}).get(n)
                pose = (fin.get(who) or {}).get('pose')
                if cur is None: miss.append('%s.%s 不見了（模型換了？）' % (who, n)); continue
                if pose in ('sit', 'read'): continue   # 坐著時後背包本來就藏（character3d.js animateVRM）
                if pv['vis'] != cur['vis']: miss.append('%s.%s %s→%s（pose %s）' % (who, n, pv['vis'], cur['vis'], pose))
        run.check('演完照原本還原（包回到身上；坐著的不算）', bool(post) and not miss, '；'.join(miss) or ('post %d 筆' % len(post)))
        po = {who: (fin.get(who) or {}).get('propOn') for who in ('P1', 'partner')}
        run.note('演完的 propOn：%s' % json.dumps(po, ensure_ascii=False))
        if SKIP:
            line = await pg.evaluate("(id=>typeof BADCLIP!=='undefined'&&BADCLIP.LINES?BADCLIP.LINES[id]||null:null)(%s)" % json.dumps(PARTNER))
            run.check('跳過：沒有說短片後面那一句（BADCLIP.LINES）', not line or not any(line in t for t in said), str(line))
            dur = (R['tEnd'] - R['t0']) if R.get('tEnd') is not None and R.get('t0') is not None else None
            c1 = (R['cuts'][0]['t'] if R.get('cuts') else 0)
            run.check('跳過：按了以後短片很快結束（開演到結束 < 第一個鏡頭＋6 秒；完整版要 13 秒以上）', dur is not None and dur < c1 + 6000, '開演到結束 %s ms' % dur)
        s = await pg.evaluate(DBG)
        run.check('沒有卡住（busyDepth 0、玩家不忙、沒有凍住）', s['depth'] == 0 and not s['busy'] and not s['frozen'], json.dumps(s, ensure_ascii=False))
        moved, n, _ = await L.push_until(pg, cdp, 0, -60, 0.4, max_pushes=3)
        run.check('推搖桿走得動', moved >= 0.4, '%.2f m／%d 次' % (moved, n))
        run.check('約好的那一場結束（iv done）', s['iv'] == 'done', str(s['iv']))
        run.check('頁面記錄沒出錯', not R.get('err'), str(R.get('err')))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
