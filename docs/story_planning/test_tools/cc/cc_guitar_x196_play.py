"""CC-C（帳號 C）11-05：GUITAR_X196（BB-C 03:14；SHA b4746f345）——吉他店同弦、吉他社、社遊，照玩家操作走。判定歸 BB；CG 和背景現在是深色底，等使用者的圖，不判。
  期望值：AA_619、AA_693（企劃線 c4b14a901；Node 那一組 cc_guitar_x196_node.js 第 0b 節核對過每一句都在原文裡）。
  CASES（預設 shop,zqshop,dorm,yilan,yms）：
  shop    【前置／捷徑】讀檔 2025-10-14（二）20:40 新生南路：吉他社成員、去過兩次社課、錢 20,000。玩家：走到同弦的樓梯口 → 進去 → 每一個「看看」（吉他牆兩點、烏克麗麗）→「買東西」（老闆一句、
          選單價錢九折、買民謠吉他 入門款＝3,420、調音裝袋那一句）→ 坐試琴椅「試彈」（C 和弦那一句）→ 起身 →【捷徑】時間撥到 21:27，待在店裡等到 21:30：「老闆：九點半了。明天再來。」、回到新生南路
  zqshop  【前置／捷徑】讀檔 2025-10-11（六）14:30 宿舍：成員、去過兩次社課、認識子晴、和子晴約好 15:00 同弦（GUITAR.planZqShop＝2-2 選「好，禮拜六。」的結果）。
          玩家：出發選單「出發」→ 2-3 → 選「三千八那把。」→ 扣 3,420、OWN_GUITAR；台詞照稿
  dorm    接 zqshop（有自己的琴）：【捷徑】同一份存檔換到宿舍 22:00 → 房間的「彈吉他」→ 旁白兩句之一、時間 +30 分鐘
  yilan   【前置／捷徑】讀檔 2025-11-10（一）20:50 法律系館：成員、去過兩次社課、認識子晴、錢 20,000、沒有自己的琴。玩家：等 21:00 群組報名表 → 手機打開吉他社群組按「報名」（扣 2,500）→
          【捷徑】同一份存檔跳到 11/22 07:40 宿舍 → 出發 → 整趟（去跟子晴說話、彈社課教的那首＝借子晴的琴、上頂樓透氣、那是什麼歌、我覺得很好聽）→ 11/23 17:00；記每一句的時間
  yms     【前置／捷徑】讀檔 2026-04-27（一）20:50 法律系館：成員、大一下去過兩次社課、ZQ_ROOFTOP_TUNE。玩家：21:00 群組 → 報名（扣 600）→【捷徑】跳到 5/2 09:40 → 出發 → 整趟 → 18:00
  Windows＋GPU（電腦）／SwiftShader（雲端）≠ iPhone。
用法：LW_TESTS=<wt>/tests [CASES=...] python3 cc_guitar_x196_play.py <url> <out>"""
import os, sys, json, asyncio, time, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c for c in (os.environ.get('CASES') or 'shop,zqshop,dorm,yilan,yms').split(',') if c]
R = L.Run('guitar_x196_play', OUT)
# 期望的字（AA_619／AA_693，c4b14a901）
T = {'look': '（牆上的吉他從三千多到三萬多。最貴的那把，標籤寫「不賣，老闆的」。）', 'ukes': '（烏克麗麗掛成一排，顏色都不一樣。最小的那把，比你的手臂還短。）',
     'try': '（你拿下一把，彈了社課教的 C 和弦。老闆從櫃檯抬頭看了一眼，又低頭。）', 'tuned': '（老闆幫你調好音，把琴裝進琴袋。）', 'close': '九點半了。明天再來。',
     'boss': ['先買好彈的，不要先買好看的。', '弦一個月換一次。你們學生都半年才換。', '手指痛是正常的，痛兩個禮拜就不痛了。'],
     'z1': '（子晴已經在樓梯口了，耳機掛在脖子上。）', 'z8': '哪一把比較好按？', 'zr1': '那就那把。……貴的你現在也彈不出差別。', 'zout': '有自己的琴以後，回家才會彈。……社團的琴你不會帶回家。',
     'dorm': ['（你練了刷法。阿凱戴上耳機。）', '（你彈了一首社課教的歌，彈到副歌就忘了。）'],
     'yPost': '社遊 11/22–23 宜蘭，民宿兩天一夜，兩千五（含車、住、早餐）。要帶琴喔。', 'mPost': '這學期社遊一天就好，陽明山野餐。',
     'yBus': '（車上有人彈吉他，後面的人跟著唱。唱到一半，司機把收音機關了。）', 'ySea': '（大家在沙灘上排成一圈彈唱。風很大，譜一直被吹走。）', 'yBbq': '（晚上在民宿的院子烤肉。吃完大家擠進客廳，一個一個上去彈一首。）',
     'yHand': '（子晴把她的琴遞給你。）', 'y12': '（十二點多，樓下還在唱歌。）', 'yUp': '（你上頂樓透氣，子晴已經在了，抱著吉他。）', 'yAsk2': '還沒寫完。結尾我還沒想到。',
     'yMorn': '（第二天早上，學長帶大家去吃卜肉。剛起鍋很燙，大家站在店門口邊吹邊吃。）', 'yLuo': '（下午經過羅東，大家去買伴手禮。你買了一盒牛舌餅。）', 'yBack1': '（回程車上大家都睡了。你旁邊的子晴把耳機分了一邊給你，沒說是什麼歌。）',
     'mStart': '（早上十點，校門口。社長學長租了一台小巴，後車廂塞滿琴袋。）', 'mTune': '今天彈別人的歌。……我的還沒好。', 'mCircle': '（子晴這次在圈子裡彈。）'}
UI = r"""(()=>{ const t=(document.getElementById('dlgText')||{}).textContent||'', ch=document.getElementById('choices'); const open=!!ch&&!ch.classList.contains('hide');
  const opts=open?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||b.textContent||'').trim()):[];
  const ph=document.getElementById('phone'), phOpen=!!ph&&!ph.classList.contains('hide')&&ph.offsetParent!==null;
  const D=GAME.D||{}; return {dlg:!!D.active, text:t, opts, phone:phOpen, hour:+(+GAME.G.hour).toFixed(3), day:GAME.G.day, key:CALENDAR.dateOf(GAME.G.day).key, zone:GAME.G.zone, money:GAME.G.money|0, busy:!!GAME.E.player.busy, seat:!!GAME.E.player.seat, interact:(document.getElementById('interact')||{}).innerText||''}; })()"""
SAYHOOK = r"""(()=>{ if(window.__ccSayOn) return true; window.__ccSay=[]; const s0=GAME.say; GAME.say=function(who,t){ try{ window.__ccSay.push({who:who?(who.name||String(who)):null, t:String(t), key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone}); }catch(e){} return s0.apply(this,arguments); };
  window.__ccSayOn=true; return true; })()"""
PRE = r"""((o)=>{ const G=GAME.G, F=G.flags; F.EXCHANGE_ROUTE='TW'; Object.assign(F,{ROOM_Y2:false}); if(o.member) F.CLUB_club_guitar=true; G.acts=G.acts||{}; G.acts.att=G.acts.att||{};
  for(const d of (o.att||[])) G.acts.att['club_guitar@'+STORY.dayOfKey(d)]={h:19,end:'full'}; if(o.money!=null) G.money=o.money;
  if(o.zq){ SOCIAL.meet&&SOCIAL.meet('heroine_04',G.zone); if(!SOCIAL.has('heroine_04','FIRST_MET')) SOCIAL.remember('heroine_04','FIRST_MET',''); G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done.ev_ziqing_club=1; const r=SOCIAL.rel('heroine_04'); r.fam=Math.max(r.fam||0,30); }
  if(o.roof){ F.ZQ_ROOFTOP_TUNE=true; SOCIAL.remember('heroine_04','HEARD_HER_SONG',''); } if(o.zqShop) GUITAR.planZqShop(G); GUITAR.rec(G); return {member:GUITAR.member(G), att:GUITAR.attended(G,false), knows:!!STORY.knows('heroine_04',G), money:G.money, out:(G.outings||[]).map(q=>q.id)}; })"""
ITS = r"""(()=>(GAME.E.interactables||[]).filter(i=>i&&!i.hidden).map(i=>({x:+(+i.x).toFixed(2),z:+(+i.z).toFixed(2),label:i.label||'',guitar:i.guitar||null,tongxian:i.tongxian||null,exit:i.exit?i.exit.to:null,seat:!!i.seat,kind:i.kind||null})))()"""


async def pick(pg, cdp, pred):
    ok = await pg.evaluate("(src=>{ const f=new Function('t','return ('+src+')(t)'); const ch=document.getElementById('choices'); if(!ch) return false; const b=[...ch.querySelectorAll('button')].filter(x=>x.offsetParent!==null).find(x=>f((x.innerText||x.textContent||'').trim())); if(!b) return false; b.setAttribute('data-ccpick','1'); return true; })", pred)
    if not ok: return False
    await L.tap(pg, cdp, '[data-ccpick="1"]'); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const b=document.querySelector('[data-ccpick]'); if(b) b.removeAttribute('data-ccpick'); })()")
    return True


async def says(pg, n=0):
    return await pg.evaluate("(n=>(window.__ccSay||[]).slice(n))", n)


async def close_phone(pg, cdp):
    for sel in ('#phone [data-skip]', '#btnPhoneClose'):
        if await pg.evaluate("(s=>{ const b=document.querySelector(s); return !!b&&b.offsetParent!==null; })", sel):
            await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1000); return sel
    return None


async def play(pg, cdp, plan, stop, max_s=900):
    """點對話、照 plan（字串清單，選項包含就選，用掉）選；其他選第一個；stop(u) 成立就停"""
    plan = list(plan); t0 = time.time(); menus = []
    while time.time() - t0 < max_s:
        u = await pg.evaluate(UI)
        if stop(u): return u, True, menus
        if u['phone']: await close_phone(pg, cdp); continue
        if u['opts']:
            menus.append([u['key'], u['hour'], u['opts']]); hit = None
            for i, w in enumerate(plan):
                if any(w in o for o in u['opts']): hit = i; break
            if hit is not None:
                w = plan.pop(hit); await pick(pg, cdp, "t=>t.includes(%s)" % J(w))
            else: await pick(pg, cdp, "t=>true")
            continue
        if u['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        await L.close_panels(pg, cdp); await pg.wait_for_timeout(800)
    return await pg.evaluate(UI), False, menus


async def load(pg, cdp, tag, key, h, zone, pos=None, pre=None):
    d = await pg.evaluate("STORY.dayOfKey(%s)" % J(key))
    st = {'zone': zone, 'hour': h, 'day': d, 'weather': 'clear'}
    if pos: st['pos'] = {'x': pos[0], 'z': pos[1], 'yaw': 0, 'lv': 0}
    await L.load_state(pg, st, quiet_phone=True); await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    p = await pg.evaluate(PRE, pre or {}) if pre is not None else None
    await pg.evaluate(SAYHOOK)
    R.setup('[%s] 讀檔 %s %05.2f %s；前置 %s → %s' % (tag, key, h, zone, J(pre), J(p)))
    return p


async def jump(pg, key, h, zone=None):
    snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
    await pg.evaluate("(([s,k,h,z])=>{ const G=JSON.parse(s); G.day=STORY.dayOfKey(k); G.hour=h; if(z){ G.zone=z; delete G.pos; } window.__ccSnap=G; })", [snap, key, h, zone])
    await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(5000); await pg.evaluate("window.__ccSayOn=false"); await pg.evaluate(SAYHOOK)


async def use_it(pg, cdp, tag, it, near=0.5):
    await L.go_to(pg, cdp, R, it['x'], it['z'], near, '%s %s' % (tag, it['label']), max_s=300)
    await pg.wait_for_timeout(800); u = await pg.evaluate(UI)
    if not u['interact'].startswith(it['label']):
        for _ in range(8):
            await pg.wait_for_timeout(600); u = await pg.evaluate(UI)
            if u['interact'].startswith(it['label']): break
    if not u['interact'].startswith(it['label']): R.note('%s 走到 %s 旁邊、互動鍵是 %r' % (tag, J([it['x'], it['z']]), u['interact'])); return False
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); return True


async def case_shop(pg, cdp):
    await load(pg, cdp, 'shop', '2025-10-14', 20.67, 'xinsheng', None, {'member': True, 'att': ['2025-09-29', '2025-10-01'], 'money': 20000})
    its = await pg.evaluate(ITS); door = next((i for i in its if i['exit'] == 'xs_tongxian'), None)
    R.note('[shop] 新生南路同弦的樓梯口：%s' % J(door))
    if not R.check('[shop] 新生南路有同弦的店門（exit.to＝xs_tongxian）', bool(door), J([i for i in its if i['exit']][:6])): return
    await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.obj.position.x=x+1.5; P.obj.position.z=z; })", [door['x'], door['z']]); R.setup('[shop] 站到樓梯口旁邊 1.5 m')
    await use_it(pg, cdp, '[shop]', door, 0.6)
    u, ok, _ = await play(pg, cdp, [], lambda u: u['zone'] == 'xs_tongxian' and not u['busy'] and not u['dlg'], max_s=120)
    if not R.check('[shop] 按樓梯口進到同弦（xs_tongxian）', ok, J(u)): return
    nshop = len(await says(pg)); await pg.wait_for_timeout(2500); await R.shot(pg, 'shop_inside')
    its = await pg.evaluate(ITS); R.note('[shop] 店裡的按鈕：%s' % J(its))
    looks = [i for i in its if i['label'] == '看看']; got = []
    for k, it in enumerate(looks):
        n0 = len(await says(pg))
        if await use_it(pg, cdp, '[shop 看看%d]' % k, it):
            await play(pg, cdp, [], lambda u: not u['dlg'] and not u['busy'], max_s=60)
            got.append([it['guitar'], [x['t'] for x in await says(pg, n0)]])
    R.note('[shop] 看看：%s' % J(got))
    R.check('[shop] 「看看」吉他牆兩點都是「%s」' % T['look'], sum(1 for g, t in got if g == 'look' and T['look'] in t) == 2, J(got))
    R.check('[shop] 烏克麗麗的「看看」是「%s」（AA_693 A2）' % T['ukes'], any(g == 'ukes' and T['ukes'] in t for g, t in got), J(got))
    buy = next((i for i in its if i['label'] == '買東西'), None)
    if buy:
        n0 = len(await says(pg)); m0 = (await pg.evaluate(UI))['money']
        await use_it(pg, cdp, '[shop 買東西]', buy)
        u, ok, menus = await play(pg, cdp, ['民謠吉他 入門款'], lambda u: not u['dlg'] and not u['busy'] and not u['opts'], max_s=120)
        L1 = [x['t'] for x in await says(pg, n0)]; m1 = (await pg.evaluate(UI))['money']; menu = next((m[2] for m in menus if any('入門款' in o for o in m[2])), None)
        R.note('[shop] 買東西：台詞 %s；選單 %s；錢 %d → %d' % (J(L1), J(menu), m0, m1))
        R.check('[shop] 老闆一句（三句之一）', any(b in L1 for b in T['boss']), J(L1))
        R.check('[shop] 選單：社員九折（入門款 3,420、面單款 5,850、有「九折」小字）、「不用了」', bool(menu) and any('3,420' in o for o in menu) and any('5,850' in o for o in menu) and any('九折' in o for o in menu) and any(o.startswith('不用了') for o in menu), J(menu))
        R.check('[shop] 買入門款：扣 3,420、調音裝袋那一句', m0 - m1 == 3420 and T['tuned'] in L1, J([m0 - m1, L1]))
    tryit = next((i for i in its if i['label'] == '試彈'), None)
    if tryit:
        n0 = len(await says(pg)); await use_it(pg, cdp, '[shop 試彈]', tryit)
        await play(pg, cdp, [], lambda u: not u['dlg'] and not u['busy'], max_s=60)
        L1 = [x['t'] for x in await says(pg, n0)]; seat = (await pg.evaluate(UI))['seat']; await R.shot(pg, 'shop_try_seat')
        R.check('[shop] 坐試琴椅「試彈」：「%s」（去過社課）' % T['try'], T['try'] in L1, J([seat, L1]))
        await L.touch_tap(cdp, 600, 300); await pg.wait_for_timeout(2000)
    else: R.check('[shop] 店裡有「試彈」（試琴椅）', False, J(its))
    u = await pg.evaluate(UI)
    if u['zone'] == 'xs_tongxian' and u['hour'] < 21.45:   # PC（GPU）跑得快：試彈途中就到 21:30 了（PC 11-05 GUITAR_play）＝不用撥
        R.setup('[shop] 【捷徑】時間撥到 21:27，待在店裡等打烊')
        await pg.evaluate("(()=>{ GAME.G.hour=21.45; })()")
    else: R.note('[shop] 不用撥時間：現在 %s %.2f（店裡途中就到打烊）' % (u['zone'], u['hour']))
    u, ok, _ = await play(pg, cdp, [], lambda u: u['zone'] != 'xs_tongxian' and not u['dlg'] and not u['busy'], max_s=600)
    L1 = await says(pg, nshop); await R.shot(pg, 'shop_after_close')
    cl = [x for x in L1 if x['t'] == T['close']]
    R.note('[shop] 打烊那一句：%s' % J(cl))
    R.check('[shop] 21:30 還在店裡：「老闆：%s」（21:30 以後、在 xs_tongxian 說的），接著回到新生南路' % T['close'], bool(cl) and cl[0]['who'] == '老闆' and cl[0]['zone'] == 'xs_tongxian' and cl[0]['h'] >= 21.5 - 0.01 and u['zone'] == 'xinsheng', J({'cl': cl, 'L': L1[-4:], 'zone': u['zone'], 'h': u['hour']}))


async def case_zqshop(pg, cdp):
    p = await load(pg, cdp, 'zqshop', '2025-10-11', 14.5, 'dorm', None, {'member': True, 'att': ['2025-09-29', '2025-10-01', '2025-10-06', '2025-10-08'], 'zq': True, 'zqShop': True, 'money': 20000})
    if not R.check('[zqshop] 前置：和子晴約好 15:00 同弦（出遊 guitar_zq_shop）', 'guitar_zq_shop' in (p or {}).get('out', []), J(p)): return
    n0 = len(await says(pg)); m0 = (await pg.evaluate(UI))['money']
    u, ok, menus = await play(pg, cdp, ['出發', '三千八那把'], lambda u: u['key'] == '2025-10-11' and u['hour'] > 15.2 and not u['dlg'] and not u['busy'] and not u['opts'], max_s=900)
    L1 = await says(pg, n0); tx = [x['t'] for x in L1]; m1 = (await pg.evaluate(UI))['money']
    R.note('[zqshop] 2-3：%s；選單 %s' % (J([[x['h'], (x['who'] or '') + '：' + x['t'][:20]] for x in L1]), J(menus)))
    seq = [T['z1'], T['z8'], T['zr1'], T['tuned'], T['zout']]; ok2 = all(s in tx for s in seq) and [tx.index(s) for s in seq] == sorted(tx.index(s) for s in seq)
    R.check('[zqshop] 2-3 照玩家走：15:00 樓梯口那一句 →「哪一把比較好按？」→「三千八那把。」→ 她那一句 → 調音裝袋 → 出來那一句', ok2 and bool(L1) and abs(L1[0]['h'] - 15) < 0.05, J({'first': L1[0] if L1 else None, 'miss': [s for s in seq if s not in tx]}))
    R.check('[zqshop] 九折 3,420、OWN_GUITAR', m0 - m1 == 3420 and await pg.evaluate("!!GAME.G.flags.OWN_GUITAR"), J(m0 - m1))
    await R.shot(pg, 'zqshop_after')


async def case_dorm(pg, cdp):
    if not await pg.evaluate("!!(GAME.G&&GAME.G.flags&&GAME.G.flags.OWN_GUITAR)"):
        await load(pg, cdp, 'dorm', '2025-10-14', 22.0, 'dorm', None, {'member': True}); await pg.evaluate("(()=>{ GAME.G.flags.OWN_GUITAR='entry'; GUITAR.rec(GAME.G).items.entry=GAME.G.day-1; })()"); R.setup('[dorm] 【前置】OWN_GUITAR')
    else:
        R.setup('[dorm] 【捷徑】同一份存檔換到宿舍 2025-10-14 22:00'); await jump(pg, '2025-10-14', 22.0, 'dorm')
    # 「彈吉他」是房間物件（STORY.ROOM_EXTRA → STORY.roomItemList；guitar3d.js S.room）：在「看看房間裡的東西」的選單裡（PC 11-05：原本找外層按鈕）
    its = await pg.evaluate(ITS); it = next((i for i in its if i['label'].startswith('看看房間裡的東西')), None)
    lst = await pg.evaluate("(()=>STORY.roomItemList(GAME.G).map(r=>r[0]))()")
    R.note('[dorm] 房間的按鈕 %s；房間物件 %s' % (J([i['label'] for i in its]), J(lst)))
    if not R.check('[dorm] 宿舍房間物件（看看房間裡的東西）有「彈吉他」', bool(it) and '彈吉他' in lst, J(lst)): return
    h0 = (await pg.evaluate(UI))['hour']; n0 = len(await says(pg))
    await use_it(pg, cdp, '[dorm]', it, 0.6)
    menu = None
    for _ in range(20):
        u = await pg.evaluate(UI)
        if u['opts']: menu = u['opts']; break
        if u['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    R.check('[dorm] 「看看房間裡的東西」選單有「彈吉他」', bool(menu) and any(o.startswith('彈吉他') for o in menu), J(menu))
    if not menu or not any(o.startswith('彈吉他') for o in menu): return
    h0 = (await pg.evaluate(UI))['hour']; n0 = len(await says(pg))   # 按下去那一刻（走過去的時間不算，雲端 11-05 量到 0.72）
    await pick(pg, cdp, "t=>t.startsWith('彈吉他')")
    u, ok, _ = await play(pg, cdp, ['不看了'], lambda u: not u['dlg'] and any(o.startswith('不看了') for o in u['opts']), max_s=120)
    h1 = u['hour']
    await pick(pg, cdp, "t=>t.startsWith('不看了')")
    u, ok, _ = await play(pg, cdp, [], lambda u: not u['dlg'] and not u['busy'] and not u['opts'], max_s=60); u['hour'] = h1
    S1 = await says(pg, n0); L1 = [x['t'] for x in S1]; nar = next((x for x in S1 if x['t'] in T['dorm']), None)
    R.check('[dorm] 彈吉他：轉暗、30 分鐘（按下去 %.2f → 旁白那一刻 %s）、旁白兩句之一' % (h0, nar and nar['h']), bool(nar) and abs(nar['h'] - h0 - 0.5) < 0.1, J(S1))


async def sign_up(pg, cdp, tag, post):
    """等 21:00 群組報名表 → 手機打開吉他社群組 → 按「報名」"""
    t0 = time.time()
    while time.time() - t0 < 300:
        m = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>/^guitar_trip_/.test(m.tag||'')).map(m=>({tag:m.tag,text:m.text,key:CALENDAR.dateOf(m.day).key,h:m.h,ans:m.ans})))()")
        if m: break
        u = await pg.evaluate(UI)
        if u['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(1500)
    R.note('%s 群組報名表：%s' % (tag, J(m)))
    R.check('%s 21:00 群組社長學長「%s」' % (tag, post), bool(m) and m[0]['text'] == post and abs(m[0]['h'] - 21) < 0.01, J(m))
    if not m: return False
    m0 = (await pg.evaluate(UI))['money']; ok = False
    await L.close_panels(pg, cdp); await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500)
    for _ in range(3):
        if await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phone *')].find(x=>x.offsetParent!==null&&x.children.length<4&&/吉他社/.test(x.innerText||'')&&(x.onclick||x.closest('[data-th],[data-msg],button,.item'))); if(b){ (b.closest('[data-th],[data-msg],button,.item')||b).setAttribute('data-ccg','1'); return true; } return false; })()"):
            await L.tap(pg, cdp, '[data-ccg="1"]'); await pg.wait_for_timeout(1200)
        if await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phone button')].find(x=>x.offsetParent!==null&&(x.innerText||'').trim()==='報名'); if(b){ b.setAttribute('data-ccsign','1'); return true; } return false; })()"):
            await L.tap(pg, cdp, '[data-ccsign="1"]'); await pg.wait_for_timeout(1500); ok = True; break
    await R.shot(pg, '%s_phone_signed' % tag.strip('[]'))
    await L.close_panels(pg, cdp)
    if not ok:
        R.setup('%s 手機裡找不到「報名」按鈕 →【捷徑】PHONE.answer（遊戲自己的回覆那一條）' % tag)
        await pg.evaluate("(t=>PHONE.answer(GAME.G,t,0))", m[0]['tag'])
    m1 = (await pg.evaluate(UI))['money']
    return m0 - m1


async def case_yilan(pg, cdp):
    await load(pg, cdp, 'yilan', '2025-11-10', 20.83, 'wancai', None, {'member': True, 'att': ['2025-09-29', '2025-10-01', '2025-10-06', '2025-11-03'], 'zq': True, 'money': 20000})
    d = await sign_up(pg, cdp, '[yilan]', T['yPost'])
    R.check('[yilan] 報名扣 2,500', d == 2500, J(d))
    R.setup('[yilan] 【捷徑】同一份存檔跳到 11/22 07:40 宿舍'); await jump(pg, '2025-11-22', 7.67, 'dorm'); n0 = len(await says(pg))
    u, ok, menus = await play(pg, cdp, ['出發', '去跟子晴說話', '彈社課教的那首', '上頂樓透氣', '那是什麼歌', '我覺得很好聽'], lambda u: u['key'] == '2025-11-23' and u['hour'] >= 16.9 and not u['dlg'] and not u['busy'] and not u['opts'], max_s=1500)
    L1 = await says(pg, n0); tx = [x['t'] for x in L1]
    def tm(t):
        x = next((y for y in L1 if y['t'] == t), None); return x and '%s %02d:%02d' % (x['key'], int(x['h']), int(round(x['h'] % 1 * 60)))
    times = {k: tm(T[k]) for k in ('yBus', 'ySea', 'yBbq', 'y12', 'yMorn', 'yLuo', 'yBack1')}
    R.note('[yilan] 每一句：%s' % J([[x['key'], x['h'], (x['who'] or '') + '：' + x['t'][:22]] for x in L1]))
    R.note('[yilan] 選單：%s' % J(menus))
    R.check('[yilan] 時間：08:00 遊覽車、14:00 海邊、19:00 民宿、11/23 00:15 頂樓、08:30 卜肉、14:00 羅東、15:00 回程', times == {'yBus': '2025-11-22 08:00', 'ySea': '2025-11-22 14:00', 'yBbq': '2025-11-22 19:00', 'y12': '2025-11-23 00:15', 'yMorn': '2025-11-23 08:30', 'yLuo': '2025-11-23 14:00', 'yBack1': '2025-11-23 15:00'}, J(times))
    R.check('[yilan] 沒有自己的琴＝子晴遞琴、彈＝BORROWED_ZQ_GUITAR；上頂樓那一段（問了「%s」）＝ZQ_ROOFTOP_TUNE' % T['yAsk2'], T['yHand'] in tx and T['yUp'] in tx and T['yAsk2'] in tx and await pg.evaluate("GAME.G.flags.BORROWED_ZQ_GUITAR===true&&GAME.G.flags.ZQ_ROOFTOP_TUNE===true"), J([T['yHand'] in tx, T['yUp'] in tx, T['yAsk2'] in tx]))
    R.check('[yilan] 回到學校 11/23 17:00', u['key'] == '2025-11-23' and abs(u['hour'] - 17) < 0.2, J([u['key'], u['hour'], u['zone']]))
    await R.shot(pg, 'yilan_back')


async def case_yms(pg, cdp):
    await load(pg, cdp, 'yms', '2026-04-27', 20.83, 'wancai', None, {'member': True, 'att': ['2026-03-09', '2026-03-11', '2026-04-20'], 'zq': True, 'roof': True, 'money': 20000})
    d = await sign_up(pg, cdp, '[yms]', T['mPost'])
    R.check('[yms] 報名扣 600', d == 600, J(d))
    R.setup('[yms] 【捷徑】同一份存檔跳到 5/2 09:40 宿舍'); await jump(pg, '2026-05-02', 9.67, 'dorm'); n0 = len(await says(pg))
    u, ok, menus = await play(pg, cdp, ['出發', '留下來彈'], lambda u: u['key'] == '2026-05-02' and u['hour'] >= 17.9 and not u['dlg'] and not u['busy'] and not u['opts'], max_s=900)
    L1 = await says(pg, n0); tx = [x['t'] for x in L1]; st = next((x for x in L1 if x['t'] == T['mStart']), None)
    R.note('[yms] 每一句：%s' % J([[x['h'], (x['who'] or '') + '：' + x['t'][:22]] for x in L1]))
    R.check('[yms] 10:00「%s」、子晴「%s」（有 ZQ_ROOFTOP_TUNE）、「%s」；18:00 回到' % (T['mStart'], T['mTune'], T['mCircle']), bool(st) and abs(st['h'] - 10) < 0.05 and T['mTune'] in tx and T['mCircle'] in tx and abs(u['hour'] - 18) < 0.2, J({'st': st, 'end': [u['key'], u['hour']]}))
    await R.shot(pg, 'yms_back')


async def main():
    import subprocess
    real = ''
    try: real = subprocess.run(['git', '-C', os.path.join(os.environ.get('LW_TESTS') or '.', '..'), 'rev-parse', '--short=9', 'HEAD'], capture_output=True, text=True).stdout.strip()
    except Exception: pass
    print('CC GUITAR_X196（照玩家操作）：CASES=%s；SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone；CG／背景深色底不判' % (CASES, os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, int(os.environ.get('CC_SEED') or 20261105))
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for c in CASES:
            try: await {'shop': case_shop, 'zqshop': case_zqshop, 'dorm': case_dorm, 'yilan': case_yilan, 'yms': case_yms}[c](pg, cdp)
            except Exception as e: R.check('[%s] 探針沒有例外' % c, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
