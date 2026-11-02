"""CC（帳號 A）11-02：博思 203 桌上的簽到表換成節目單（6f0122821；BB_224 第二節表格 #4；使用者「非上課的簽到只留補習班」，AA_574 #5／#4）。照玩家走、看、截圖。
改了什麼（git show 6f0122821）：assets/models/env/second_ai/boya_203.layout.json 的 interact 拿掉 {id:'signup', x:2.5, z:-2.1, r:0.7, label:'簽到表'}（look＝note 空的＝也是「簽到表」）；
  桌子的阻擋 why 由 signup_table 改 program_table（位置不變 x 2.42～3.38、z −3.2～−2.47）；boya_203.glb 重新匯出（LAWWW2 542b715f2：桌上貼圖的字改節目單）；
  src/data/room_glb_layouts.js 照新 layout 重新產生（src/rooms_glb3d.js 把 layout 的 interact 一個一個推進 E.interactables，label＝按鈕字、look＝按下去的字幕）。
  博思 203（區域 boya_203）只有 2026-05-27（大一下第 14 週週三，SK07 即興劇那一晚）18:30～21:30 開：博雅教學館（區域 boya）2F 203 門口 (−11.6, 1.5, lv 1) 那一晚多一個「進入 博思 203」。
補習班的簽到：不是 3D 互動，是重考期在家（經濟系休學那年）衝刺班 RH-C3（src/data/retake_home.js；2025-06-17 10:20「補習班・櫃台」）的一句旁白
  「（管理人員看了一眼牆上的鐘，在簽到表上畫了一個記號。什麼都沒說。）」——AA_574 #4，使用者決定「只留補習班」＝照舊在。src/econff3d.js：S.RH_PLAY 有 RH-C3、S.next2 排到那一刻 S.run2 → S.rhPlay（EVENTS.run）。
不是 iPhone：Playwright 手機橫向模擬 844×390（SwiftShader 1～4 fps）；直向截圖＝同一頁把畫面改成 390×844（玩家把手機轉直，#rotate 出現就點掉），截完轉回橫向。
URL 不加 ?turbo（走路：點地面／搖桿，playlib L.go_to）。
CASES（逗號隔開；預設 b203,cram）：
  b203  [前置] 法律系最小存檔 2026-05-27 18:40 博雅教學館 2F（lv 1）203 門口；【前置】站到門口 5 m 外 → 走到門口 → 按鈕「進入 博思 203」→ 按 → 博思 203（等正式模型載入）→
        走到節目單那張小桌前 (2.5, −1.85)（原本簽到表互動點 (2.5, −2.1) r 0.7 的範圍裡）→ 讀按鈕字＋GAME.E.interactables（只讀）→ 鏡頭轉向桌子 → 橫向、直向截圖。
        PASS：整間沒有任何 label／look 含「簽到」的互動；站在桌前按鈕不是「簽到表」。桌上的字是不是「節目單」只看截圖（READY_FOR_ART_REVIEW，探針不判）。
        修改前（6f0122821^）：互動清單有「簽到表」、桌前按鈕是「簽到表」（按下去的字幕也記下來）→ FAIL。
  cram  [前置] 經濟系那年、退宿後在家的最小存檔（post91015_probe 的 econ_state；和可昕交往中、事件模式）2025-06-17 09:30 在家 → 照玩家：對話點過去、選項選第一個（不是「出發：」那一類）、手機自己打開就收起來，
        讓遊戲自己跳到 10:20 衝刺班 RH-C3 → 對話框出現那一句就截圖（橫向、直向）。PASS：GAME.say 有那一句（和頁面裡 RETAKE_HOME RH-C3 的原文一字不差，含「簽到表」）。修改前後都 PASS（6f01 沒有動它）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=b203,cram] python3 cc_boya203_probe.py '<URL>/index.html' <輸出資料夾>
等待上限（秒）：WALK_MAX（每一段走路，預設 420）、GLB_MAX（等正式模型，預設 120）、CRAM_MAX（等到 RH-C3 那一句，預設 900）。"""
import os, sys, json, asyncio, re, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
CASES = [c.strip() for c in os.environ.get('CASES', 'b203,cram').split(',') if c.strip()]
DOOR = (-11.6, 1.5, 1)          # 博雅 2F 203 門口的互動點（ROOM_GLB_LAYOUTS.boya_203.back_spawn）
TABLE_AT = (2.5, -1.85)         # 小桌前面站的地方（原本簽到表互動點 (2.5,−2.1) r 0.7 的範圍裡；桌子阻擋 z −3.2～−2.47）
TABLE_LOOK = (2.9, -2.85)       # 鏡頭看向桌面
CRAM_LINE = '在簽到表上畫了一個記號'


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# ---------------------------------------------------------------- 存檔（cc_dl04b_probe.py 的 state_at／load；post91015_probe.py 的 econ_state）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore', 'boya')
ECON0 = {'ECON_CAMP_OPEN': True, 'E15_BUS': 'nosleep', 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'E01_MORNING': True, 'KX_FIRST_MSG': True,
         'fundsV2': 1, 'Y0_STICKY': True, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ECON_OUT = {'Y0_MOVED_OUT': True, 'dating_kexin': True, 'KX_DATING_SINCE': '2024-10-17', 'Y0_DATING': True, 'KX_CAR': 'only_me', 'E12_ASKED': True, 'Y0_LEFT': True}
ECON_DONE_OUT = {'ev_y0_e30': 1, 'ev_y0_a3': 1, 'ev_y0_e26': 1, 'ev_y0_e02': 1, 'ev_y0_e30_note': 1}
ECON_FRIENDS = ('kexin', 'econ_zhengxun', 'econ_weilun', 'econ_tangrui', 'econ_jiahao', 'econ_pinyu')
CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"


async def state_at(pg, key, h, zone, pos=None, flags=None):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    return st, d


async def econ_state(pg, key, h, zone):
    """經濟系那一年、退宿以後住臺北的家（post91015_probe.py econ_state moved=True）"""
    d = await P.day_of(pg, key); e26 = (await P.day_of(pg, '2024-10-17'))['d']
    F = dict(ECON0); F.update(ECON_OUT); F['E26_DAY'] = e26
    st = {'stage': 'econ', 'name': '祐廷', 'day': d['d'], 'weekday': d['wd'], 'hour': h, 'zone': zone, 'pos': None, 'weather': 'clear', 'energy': 100, 'money': 20000,
          'flags': F, 'contacts': {k: d['d'] - 40 for k in ECON_FRIENDS}, 'events': {'done': dict(ECON_DONE_OUT), 'last': {}, 'count': 0},
          'home': {'at': True, 'base': True, 'day': d['d']}}
    return st, d


async def load(pg, cdp, run, st, label):
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP)
    await pg.wait_for_timeout(3500); await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] %s' % label)


# ---------------------------------------------------------------- 記錄（只記不改）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push({k:'enter',n:sp?JSON.stringify(sp):'',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof ADV!=='undefined'&&ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ push({k:'bg',n:'begin',t:typeof (o&&o.background)==='string'?o.background:JSON.stringify((o&&o.background)||null)}); return b0.apply(this,arguments); }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  return 'ok'; })()"""


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0)
    return [r for r in R if k is None or r['k'] == k]


# ---------------------------------------------------------------- 頁面裡讀（只讀）
ITS = r"""(([x,z,R,lv])=>(GAME.E.interactables||[]).filter(i=>(R==null||Math.hypot(i.x-x,i.z-z)<=R)&&(lv==null||(i.lv|0)===lv)).map(i=>({label:i.label||'',look:typeof i.look==='string'?i.look:(i.look?'(fn)':null),x:+(+i.x).toFixed(2),z:+(+i.z).toFixed(2),r:i.radius||null,lv:i.lv|0,hidden:!!i.hidden,seat:!!i.seat,exit:i.exit?i.exit.to:null,npc:!!i.npc})))"""
BTN = r"""(()=>{ const it=document.getElementById('interact'); const vis=!!it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none'; return vis?((document.getElementById('interactLabel')||{}).textContent||(it.textContent||'')).trim():''; })()"""
PLAYER = r"""(()=>{ const p=GAME.E.player.obj.position; return {x:+p.x.toFixed(2),z:+p.z.toFixed(2),lv:GAME.E.player.lv|0,zone:GAME.G.zone,formal:!!(GAME.E.zone&&GAME.E.zone.formal),h:+(+GAME.G.hour).toFixed(2)}; })()"""
RH_C3 = r"""(()=>{ if(typeof RETAKE_HOME==='undefined') return null; const e=RETAKE_HOME.long.find(x=>x.id==='RH-C3'); return e?{date:e.date,time:e.time,place:e.place,bg:e.bg||null,lines:e.lines.map(l=>l.t)}:null; })()"""
DLGFULL = "((GAME.D&&GAME.D.full)||(document.getElementById('dlgText')||{}).textContent||'')"


async def portrait_shot(pg, cdp, run, tag):
    """玩家把手機轉直（390×844）：#rotate 出現就點掉；截一張再轉回橫向"""
    await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(2000)
    if await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); return !!r&&getComputedStyle(r).display!=='none'; })()"):
        await L.tap(pg, cdp, '#rotate'); await pg.wait_for_timeout(600)
    p = await run.shot(pg, tag + '_portrait')
    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(1500)
    return p


def has_sign(it):
    return '簽到' in (it.get('label') or '') or '簽到' in (it.get('look') or '')


# ================================================================ b203
async def case_b203(pg, cdp, run):
    tag = 'b203'
    st, d = await state_at(pg, '2026-05-27', 18 + 40 / 60, 'boya', pos={'x': DOOR[0], 'z': DOOR[1], 'lv': DOOR[2], 'yaw': 0})
    await load(pg, cdp, run, st, '%s：法律系最小存檔 %s（%s 第 %s 週週三，SK07 那一晚）18:40 博雅教學館 2F 203 門口' % (tag, d['key'], d['term'], d['week']))
    await P.place_near(pg, run, DOOR[0], DOOR[1], R=5.0, lv=DOOR[2], what='203 門口')
    door = await pg.evaluate(ITS, [DOOR[0], DOOR[1], 0.3, DOOR[2]])
    run.note('%s：203 門口的互動（只讀）%s' % (tag, J(door)))
    ok = await L.go_to(pg, cdp, run, DOOR[0], DOOR[1], 0.8, '203 門口', max_s=ENVI('WALK_MAX', 420), lv=DOOR[2])
    btn = await pg.evaluate(BTN); p0 = await run.shot(pg, tag + '_door')
    run.check('%s：走到 203 門口、按鈕「進入 博思 203」（那一晚開）' % tag, ok and btn == '進入 博思 203', J({'btn': btn, 'pos': await pg.evaluate(PLAYER), 'shot': p0}))
    if btn != '進入 博思 203': return
    n0 = await pl_len(pg)
    await L.tap(pg, cdp, '#interact')
    t1 = time.time(); pl = None
    while time.time() - t1 < ENVI('GLB_MAX', 120):
        s = await P.ts(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if s['ch']: await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(900); continue
        pl = await pg.evaluate(PLAYER)
        if pl['zone'] == 'boya_203' and pl['formal']: break
        await pg.wait_for_timeout(1500)
    run.check('%s：進到博思 203、正式模型載入（E.zone.formal）' % tag, bool(pl) and pl['zone'] == 'boya_203' and pl['formal'], J({'pl': pl, 'rows': (await rows(pg, n0))[:8]}))
    if not pl or pl['zone'] != 'boya_203': return
    await pg.wait_for_timeout(2500)
    allit = await pg.evaluate(ITS, [0, 0, None, None])
    run.note('%s：博思 203 的互動清單（GAME.E.interactables，只讀；座位只數個數）：%s；座位 %d 個' % (tag, J([i for i in allit if not i['seat']]), len([i for i in allit if i['seat']])))
    sign = [i for i in allit if has_sign(i)]
    run.check('%s：整間沒有任何 label／look 含「簽到」的互動（修改前有「簽到表」(2.5,−2.1)）' % tag, not sign, J(sign))
    ok = await L.go_to(pg, cdp, run, TABLE_AT[0], TABLE_AT[1], 0.45, '小桌前', max_s=ENVI('WALK_MAX', 420), lv=0)
    await pg.wait_for_timeout(1200)
    btn = await pg.evaluate(BTN); me = await pg.evaluate(PLAYER)
    near = await pg.evaluate(ITS, [me['x'], me['z'], 1.2, 0])
    run.note('%s：站在小桌前 %s；按鈕「%s」；1.2 m 內的互動 %s' % (tag, J(me), btn, J(near)))
    run.check('%s：走到小桌前（離 (%.2f, %.2f) ≤0.45 m）' % (tag, TABLE_AT[0], TABLE_AT[1]), ok, J(me))
    run.check('%s：站在小桌前，按鈕不是「簽到表」、附近沒有簽到互動' % tag, '簽到' not in btn and not any(has_sign(i) for i in near), J({'btn': btn, 'near': near}))
    if '簽到' in btn:   # 修改前：照玩家按一下，記下字幕（只記）
        n1 = await pl_len(pg); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800)
        run.note('%s：（修改前）按「%s」→ %s' % (tag, btn, J([[r['k'], r['t']] for r in await rows(pg, n1)])))
        await run.shot(pg, tag + '_signlook')
    turned = await L.turn_camera_to(pg, cdp, TABLE_LOOK[0], TABLE_LOOK[1])
    await pg.wait_for_timeout(1500)
    p1 = await run.shot(pg, tag + '_table'); p2 = await portrait_shot(pg, cdp, run, tag + '_table')
    run.note('%s：鏡頭轉向桌面 %s；截圖 %s、%s——桌上的字（節目單／簽到）看截圖（READY_FOR_ART_REVIEW，探針不判）' % (tag, turned, p1, p2))


# ================================================================ cram：補習班 RH-C3
async def case_cram(pg, cdp, run):
    tag = 'cram'
    st, d = await econ_state(pg, '2025-06-17', 9.5, 'dorm')
    data = await pg.evaluate(RH_C3)
    want = next((t for t in (data or {}).get('lines', []) if CRAM_LINE in t), None)
    run.note('%s：頁面裡 RETAKE_HOME RH-C3（只讀）%s' % (tag, J(data)))
    run.check('%s：資料裡 RH-C3 有補習班簽到那一句（含「簽到表」）' % tag, bool(want) and '簽到表' in want, J(want))
    n0 = await pl_len(pg)
    await load(pg, cdp, run, st, '%s：經濟系退宿後最小存檔 %s 09:30 在家（和可昕交往中；事件模式；衝刺班 6/9～7/9）' % (tag, d['key']))
    t1 = time.time(); shots = None; same = 0; last = None
    while time.time() - t1 < ENVI('CRAM_MAX', 900):
        s = await P.ts(pg)
        if s['dlg'] and CRAM_LINE in s['txt'] and not shots:
            await pg.wait_for_timeout(2500); shots = [await run.shot(pg, tag + '_line'), await portrait_shot(pg, cdp, run, tag + '_line')]
        R = await rows(pg, n0, 'say')
        if shots and any(CRAM_LINE in r['t'] for r in R) and any(r['t'] == '早餐誰請？' for r in R): break
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); continue
        if s['ch']:
            sig = tuple(o['t'] for o in s['ch']); same = same + 1 if sig == last else 0; last = sig
            if same > 25: run.note('%s：同一個選單點了 25 次沒反應 %s' % (tag, J(sig))); break
            k = next((i for i, o in enumerate(s['ch']) if not o['dim'] and not o['t'].startswith(('出發：', '直接過去：'))), 0)
            run.note('%s %s %.2f 選項 %s → %s' % (tag, (await P.clock(pg))['key'], s['h'], J([o['t'][:20] for o in s['ch']]), s['ch'][k]['t'][:24]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1200)
    R = await rows(pg, n0)
    said = [[r['n'], r['t'], r.get('d'), hm(r.get('h'))] for r in R if r['k'] == 'say']
    i = next((k for k, x in enumerate(said) if CRAM_LINE in x[1]), None)
    run.note('%s：RH-C3 前後的台詞 %s；事件 %s；背景 %s' % (tag, J(said[max(0, (i or 0) - 4):(i or 0) + 4]), J([r['t'] for r in R if r['k'] == 'ev'][-6:]), J([r['t'] for r in R if r['k'] == 'bg'][-4:])))
    got = said[i] if i is not None else None
    run.check('%s：衝刺班 RH-C3（2025-06-17 10:20 補習班・櫃台）旁白「%s」照舊出現、和資料一字不差（截圖 %s）' % (tag, want, J(shots)),
              bool(got) and got[1] == want and not got[0] and got[2] == '2025-06-17', J(got))


# ================================================================ main
CASEFN = {'b203': case_b203, 'cram': case_cram}


async def main():
    run = L.Run('boya203_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        try:
            await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('遊戲載入', ok)
            await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
            for c in CASES:
                fn = CASEFN.get(c)
                if not fn: run.check('CASE %s 認得' % c, False, '可以用：' + ','.join(CASEFN)); continue
                print('==== CASE %s（SHA %s）====' % (c, os.environ.get('SHA', '?')), flush=True)
                try: await fn(pg, cdp, run)
                except Exception as e:
                    run.check('%s：跑完（沒有探針例外）' % c, False, repr(e)[:500]); traceback.print_exc()
                    try: await run.shot(pg, c + '_exception')
                    except Exception: pass
        except Exception as e:
            run.check('跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc()
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
