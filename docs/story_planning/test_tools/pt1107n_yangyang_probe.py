"""BB-B 2026-11-07：YANGYANG-IN-1107 洋洋鹹酥雞瀏覽器驗收（LAWWW-B e66781d1f／084f7c3e6；台詞 AA_724 bf5c3e6c6，打烊 AA_700）。
照玩家：點地面走過去、按右下角的互動按鈕、點對話、點選項（Playwright 手機橫向、?turbo）。
  A 進門：公館 G05「進入 洋洋鹹酥雞」→ 區域 yangyang；進門那幾句；同一天再進去不再說
  B 座位：玩家點得到的座位 20 張；四人桌 4 南側兩張（npcOnly）沒有「坐下」
  C 看五處（case／menu／self／fridge／kitchen）：說的句子是 AA_724 那一處的
  D 內用：「夾好給我。……內用還外帶？」→ 內用 → 兩層菜單夾兩樣（鹹酥雞 70、雞排 85）→ 調味兩題（都要、大辣＋「大辣喔？……好，你說的。」）
     → 等 10 分鐘那一句 → 坐到空位（坐下那一句）→ 吃 30 分鐘、吃完那一句；扣 155 元
  E 外帶只點飲料（紅茶 25）：不問調味、不等、不坐
  F 錢不夠：【捷徑】錢設 100 → 鹹酥雞 70＋雞排 85 → 夾好了 →「這樣不夠喔。……拿掉一樣？」→ 拿掉雞排 → 夾好了 → 照常
  G 打烊：【捷徑】撥到 00:58（店裡）→ 01:00 老闆「我們今天要打烊了。」一句、人到公館店門前；01:30 按門＝鐵門那一句
[前置] 讀使用者存檔 day46，【捷徑】改成 19:00 公館、錢 1000、清邀約（照舊的事件系統，手機自動打開關掉）。
用法：LW_TESTS=<測試樹>/tests python3 pt1107n_yangyang_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import playlib as L
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
def say(*a): print(' '.join(str(x) for x in a), flush=True)
J = lambda x, n=500: json.dumps(x, ensure_ascii=False)[:n]

HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  if(GAME.caption){ const c1=GAME.caption; GAME.caption=function(a,b){ try{ window.__LOG.push({n:'［字幕］', t:String(b||a||''), at:at()}); }catch(e){} return c1.apply(this,arguments); }; }
  if(GAME.toast){ const t0=GAME.toast; GAME.toast=function(a){ try{ window.__LOG.push({n:'［提示］', t:String(a||''), at:at()}); }catch(e){} return t0.apply(this,arguments); }; } })()"""
STATE = "(()=>{ const G=GAME.G, P=GAME.E.player; return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), zone:G.zone, money:G.money|0, seat:!!(P&&P.seat), x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2)}; })()"
IT = """(sel=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&(sel.to?(i.exit&&i.exit.to===sel.to):sel.kind?(i.gg2===sel.gg2&&i.kind===sel.kind):(i.label===sel.label))); return it?[+it.x.toFixed(2),+it.z.toFixed(2),it.label||'',it.lv|0]:null; })"""
LAB = "(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()"
LOGN = "(window.__LOG||[]).length"
LOGS = "(n=>(window.__LOG||[]).slice(n))"
D = """(()=>GG2.L.yangyang)()"""


async def opts(pg):
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>({t:b.textContent.trim(), dim:b.disabled||b.classList.contains('dim')})); })()")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


async def run_flow(pg, cdp, picks, max_s=180, label=''):
    """點對話、照 picks 依序選選項（字串開頭相符）；選項不在 picks 裡就停（回傳 'stuck'）。回傳 (選過的, 狀態)"""
    t0 = time.time(); chosen = []; idle = 0; picks = list(picks)
    while time.time() - t0 < max_s:
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if not ops: await pg.wait_for_timeout(400); continue
            if not picks: return chosen, ('choices', [o['t'] for o in ops])
            want = picks[0]; k = next((i for i, o in enumerate(ops) if o['t'].startswith(want)), None)
            if k is None: return chosen, ('nopick', want, [o['t'] for o in ops])
            chosen.append({'want': want, 'opts': [o['t'] + ('（灰）' if o['dim'] else '') for o in ops]})
            say('   %s 選項 %s → %s' % (label, [o['t'][:12] for o in ops], ops[k]['t']))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1100)
            ops2 = await opts(pg)
            if ops2 and [o['t'] for o in ops2] == [o['t'] for o in ops]:   # 點了沒反應（灰掉的選項）
                chosen[-1]['noeffect'] = True; return chosen, ('noeffect', want)
            picks.pop(0); idle = 0; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); idle = 0; continue
        if s.get('busy'): await pg.wait_for_timeout(600); continue
        idle += 1
        if idle >= 3: break
        await pg.wait_for_timeout(900)
    return chosen, ('done', picks)


async def use(pg, cdp, run, sel, label, near=0.8):
    it = await pg.evaluate(IT + "(%s)" % json.dumps(sel))
    if not it:
        labs = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>(i.label||'')+(i.kind?'['+i.kind+']':'')))()")
        say('   找不到「%s」：現有 %s' % (label, J(labs, 800))); return False, '', None
    ok = await L.go_to(pg, cdp, run, it[0], it[1], near, label, max_s=240, lv=it[3]); await pg.wait_for_timeout(700)
    lab = await pg.evaluate(LAB); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    return True, lab, it


async def said(pg, n0):
    return [((x['n'] + '：') if x['n'] else '') + x['t'] for x in await pg.evaluate(LOGS + "(%d)" % n0)]


async def load(pg, cdp, run, base, h, zone='gongguan', money=1000, label=''):
    s = json.loads(json.dumps(base)); s['hour'] = h; s['zone'] = zone; s['pos'] = None; s['money'] = money; s['invites'] = []
    await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK)
    await run_flow(pg, cdp, [], max_s=60, label='讀檔後')
    st = await pg.evaluate(STATE); run.setup('[前置] %s：讀使用者存檔 day46，【捷徑】改成 %.2f %s、錢 %d、清邀約 → %s' % (label, h, zone, money, J(st))); return st


async def main():
    run = L.Run('pt1107n_yangyang', OUT)
    base = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await load(pg, cdp, run, base, 19.0, label='A～F')
        dd = await pg.evaluate(D)
        # ---- A 進門 ----
        n0 = await pg.evaluate(LOGN)
        ok, lab, it = await use(pg, cdp, run, {'to': 'yangyang'}, '洋洋店門口', near=1.2)
        for _ in range(15):
            if await pg.evaluate("GAME.G.zone") == 'yangyang': break
            await pg.wait_for_timeout(1000)
        door = (await pg.evaluate(D))['door']
        for _ in range(40):   # 進門句由 GG2.tick（STORY.TICKS）說：雲端 SwiftShader 每 30 格才跑一次（約 10 秒），等它出來
            await run_flow(pg, cdp, [], max_s=3, label='進門')
            if any(t in door for t in await said(pg, n0)): break
            await pg.wait_for_timeout(1000)
        sA = await said(pg, n0); stA = await pg.evaluate(STATE)
        say('   A 進門', J(sA, 800)); await run.shot(pg, 'A_in')
        run.check('A 公館 G05 按鈕「%s」→ 進到 yangyang' % lab, ok and lab.startswith('進入 洋洋') and stA['zone'] == 'yangyang', J(stA))
        run.check('A 進門：說了一句 AA_724 的進門句（一次一句、隨機）', len([t for t in sA if t in door]) == 1, J(sA))
        # ---- B 座位 ----
        sb = await pg.evaluate("""(()=>{ const its=(GAME.E.interactables||[]).filter(i=>i.seat&&!i.hidden), ss=(GAME.E.zone&&GAME.E.zone.seats)||[];
          return {its:its.length, seats:ss.length, npcOnly:ss.filter(q=>q.npcOnly).map(q=>({x:q.x,z:q.z,table:q.table})), npcItem:ss.filter(q=>q.npcOnly).filter(q=>its.some(i=>Math.hypot(i.seat.x-q.x,i.seat.z-q.z)<0.05)).length,
                  tables:[...new Set(ss.map(q=>q.table))]}; })()""")
        run.check('B 玩家點得到的座位 20 張、npcOnly 的 %d 張沒有「坐下」' % len(sb['npcOnly']), sb['its'] == 20 and sb['npcItem'] == 0 and len(sb['npcOnly']) == 2, J(sb))
        # ---- C 看五處 ----
        for kind in ['case', 'menu', 'self', 'fridge', 'kitchen']:
            n0 = await pg.evaluate(LOGN); ok, lab, it = await use(pg, cdp, run, {'gg2': 'yangyang', 'kind': kind}, '看 ' + kind, near=0.25)
            if lab.startswith('坐下'): say('   ! %s：按鈕是「%s」' % (kind, lab))
            await run_flow(pg, cdp, [], max_s=40, label=kind); sc = await said(pg, n0)
            run.check('C 看 %s（按鈕「%s」）：說 AA_724 那一處的句子' % (kind, lab), ok and len(sc) == 1 and sc[0] in dd['look'][kind], J(sc))
            if (await pg.evaluate(STATE))['seat']: await pg.evaluate("GAME.standUp&&GAME.standUp(GAME.E.player)"); await pg.wait_for_timeout(600)
        await run.shot(pg, 'C_look')
        # ---- D 內用 ----
        if (await pg.evaluate(STATE))['seat']: await pg.evaluate("GAME.standUp&&GAME.standUp(GAME.E.player)"); await pg.wait_for_timeout(600)
        st0 = await pg.evaluate(STATE); n0 = await pg.evaluate(LOGN)
        ok, lab, it = await use(pg, cdp, run, {'gg2': 'yangyang', 'kind': 'order'}, '點炸物')
        seen_seat = False
        ch, end = await run_flow(pg, cdp, ['內用', '本店推薦', '鹹酥雞', '炸物', '雞排', '夾好了', '都要', '大辣'], max_s=240, label='D')
        st1 = await pg.evaluate(STATE); sD = await said(pg, n0)
        say('   D', J({'lab': lab, 'end': end, 'said': sD, 'st0': st0, 'st1': st1}, 1500)); await run.shot(pg, 'D_after')
        B = '老闆：'
        run.check('D 按鈕「%s」、老闆「夾好給我。……內用還外帶？」' % lab, ok and (B + dd['ask']) in sD, J(sD[:3]))
        run.check('D 兩層菜單：先選一類再選一樣、可以夾兩樣，選項有「夾好了」（共 155 元）', len(ch) >= 6 and any('夾好了' in o for c in ch for o in c['opts']) and end[0] == 'done', J(ch, 900))
        run.check('D 調味兩題＋大辣那一句', (B + dd['basil'][0]) in sD and (B + dd['spicy'][0]) in sD and (B + dd['spicyBig']) in sD, J(sD))
        waits = [((B if w[0] else '') + w[1]) for w in dd['wait']]
        run.check('D 等炸好那一句（三選一）', any(t in waits for t in sD), J(sD))
        run.check('D 坐下那一句（四人桌／兩人桌）', any(t in (dd['seat']['four'], dd['seat']['two']) for t in sD), J(sD))
        eats = [e[0] for e in dd['eat']]
        run.check('D 吃完那一句', any(t in eats for t in sD), J(sD))
        run.check('D 扣 155 元、時間過約 40 分鐘（等 10＋吃 30）', st0['money'] - st1['money'] == 155 and 0.6 <= st1['h'] - st0['h'] <= 0.9, J([st0, st1]))
        # 出去再進來：同一天不再說進門那幾句
        await run_flow(pg, cdp, [], max_s=30)
        if st1['seat']: await pg.evaluate("GAME.standUp&&GAME.standUp(GAME.E.player)"); await pg.wait_for_timeout(800)
        ok, lab, it = await use(pg, cdp, run, {'to': 'gongguan'}, '出口')
        for _ in range(15):
            if await pg.evaluate("GAME.G.zone") == 'gongguan': break
            await pg.wait_for_timeout(1000)
        await run_flow(pg, cdp, [], max_s=40)
        n0 = await pg.evaluate(LOGN); ok, lab, it = await use(pg, cdp, run, {'to': 'yangyang'}, '洋洋店門口（第二次）', near=1.2)
        for _ in range(15):
            if await pg.evaluate("GAME.G.zone") == 'yangyang': break
            await pg.wait_for_timeout(1000)
        await run_flow(pg, cdp, [], max_s=40); sA2 = await said(pg, n0)
        run.check('A 同一天第二次進去：不再說進門的句子', await pg.evaluate("GAME.G.zone") == 'yangyang' and not any(t in door for t in sA2), J(sA2))
        # ---- E 外帶飲料 ----
        st0 = await pg.evaluate(STATE); n0 = await pg.evaluate(LOGN)
        ok, lab, it = await use(pg, cdp, run, {'gg2': 'yangyang', 'kind': 'order'}, '點炸物（外帶）')
        ch, end = await run_flow(pg, cdp, ['外帶', '冷飲櫃', '紅茶', '夾好了'], max_s=180, label='E')
        st1 = await pg.evaluate(STATE); sE = await said(pg, n0)
        say('   E', J({'end': end, 'said': sE, 'st0': st0, 'st1': st1}, 900))
        run.check('E 外帶只點紅茶：扣 25、不問調味、不等、不坐', st0['money'] - st1['money'] == 25 and (B + dd['basil'][0]) not in sE and not any(t in waits for t in sE) and not st1['seat'] and end[0] == 'done', J([sE, st0, st1, end]))
        # ---- F 錢不夠 ----
        await pg.evaluate("GAME.G.money=100"); run.setup('【捷徑】F：錢設成 100')
        n0 = await pg.evaluate(LOGN)
        ok, lab, it = await use(pg, cdp, run, {'gg2': 'yangyang', 'kind': 'order'}, '點炸物（錢不夠）')
        ch, end = await run_flow(pg, cdp, ['外帶', '本店推薦', '鹹酥雞', '炸物', '雞排'], max_s=180, label='F')
        F = {'end': end, 'ch': ch}
        if end[0] == 'noeffect':   # 雞排灰掉、點了沒反應：照實記，改選「返回」→ 夾好了
            ch2, end2 = await run_flow(pg, cdp, ['返回', '夾好了', '都要', '不辣'], max_s=180, label='F2'); F['after'] = [ch2, end2]
        else:
            ch2, end2 = await run_flow(pg, cdp, ['夾好了'], max_s=60, label='F2'); F['after'] = [ch2, end2]
            if end2[0] in ('choices', 'nopick'):
                ch3, end3 = await run_flow(pg, cdp, ['雞排', '夾好了', '都要', '不辣'], max_s=180, label='F3'); F['after2'] = [ch3, end3]
        sF = await said(pg, n0); stF = await pg.evaluate(STATE); F['said'] = sF; F['money'] = stF['money']
        say('   F', J(F, 1500)); await run.shot(pg, 'F_after')
        dim = any('雞排' in o and '（灰）' in o for c in ch for o in c['opts'])
        run.check('F 錢不夠：%s' % ('雞排在選單上是灰的（錢 100 已經夾了 70），點了沒反應＝到不了「這樣不夠喔」' if dim else '老闆「這樣不夠喔。……拿掉一樣？」、拿掉以後照常結帳'),
                  (not dim and (B + dd['short']) in sF and stF['money'] == 30) or (dim and stF['money'] == 30), J(F, 900))
        # ---- G 打烊 ----
        await run_flow(pg, cdp, [], max_s=40)
        if (await pg.evaluate(STATE))['seat']: await pg.evaluate("GAME.standUp&&GAME.standUp(GAME.E.player)")
        await pg.evaluate("(()=>{ const G=GAME.G; G.day+=1; G.hour=0.97; if(GAME.syncWeekday) GAME.syncWeekday(); if(GAME.updateHUD) GAME.updateHUD(); })()")
        run.setup('【捷徑】G：人在店裡，撥到隔天 00:58')
        n0 = await pg.evaluate(LOGN); t0 = time.time(); sG = []
        while time.time() - t0 < 240:
            await run_flow(pg, cdp, [], max_s=5)
            st = await pg.evaluate(STATE)
            if st['zone'] != 'yangyang': break
            await pg.wait_for_timeout(1500)
        await run_flow(pg, cdp, [], max_s=30)
        sG = await said(pg, n0); stG = await pg.evaluate(STATE)
        say('   G', J({'said': sG, 'st': stG}, 900)); await run.shot(pg, 'G_closed')
        run.check('G 01:00 老闆「我們今天要打烊了。」一句、人出來到公館', (B + '我們今天要打烊了。') in sG and stG['zone'] == 'gongguan' and len([t for t in sG if not t.startswith('［')]) == 1, J([sG, stG]))
        await pg.evaluate("GAME.G.hour=1.5"); run.setup('【捷徑】G：撥到 01:30')
        n0 = await pg.evaluate(LOGN); ok, lab, it = await use(pg, cdp, run, {'to': 'yangyang'}, '洋洋店門口（打烊後）', near=1.2)
        await run_flow(pg, cdp, [], max_s=40); sG2 = await said(pg, n0)
        run.check('G 01:30 按門：鐵門那一句、進不去', dd['sign'] in sG2 and await pg.evaluate("GAME.G.zone") == 'gongguan', J(sG2))
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
