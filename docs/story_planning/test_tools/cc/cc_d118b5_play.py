"""CC-C（帳號 C）11-05：D118_B5 法服改純劇情（BB-C 00:06、00:19：改跑 747dba80d、期望值照 AA_691 f512588e1；LAWWW-C b6df3fc09；D118_PLAN 第 266～295 行 BB 驗收）。期望值照 BB-C 00:06＋AA_604（企劃線 23581d5b6）＋AA_625；判定歸 BB。
  CASES（預設全部）：
   b5b   大二上第一場 10/24（社員）：10/23 20:00 法服群組一則（AA_604 場次表第 1 列柏翰那一句）→ 睡覺 → 10/24 08:30 出發選單（出發／這週請假）→ 選出發 → 到萬才館（法律系館B）
         → 玩家走到圓桌按「坐到圓桌（做初談紀錄）」→ 共同開頭（AA_604 第 3 節）→ 新個案（選項選第一個）→ 收尾旁白第 1 列 → 12:00；FAFU_STORY_1、SEEN 1、柏翰關係值不變。
         第一場沒有回訪（AA_604：回訪是第 2～4 場）。
   miss2 第二場 2027-04-10 故意錯過：4/9 20:00 群組一則 → 4/10 08:30 出發選單選「這週請假」→ 之後兩週：沒有任何法服的訊息、不補選單、SEEN 不變、關係值不變。
   notice 只看過公告（LAWCLUB_NOTICE，不是社員）：10/23 20:00 沒有群組那一則、不在法服群組、10/24 沒有出發選單。
   migrate 舊存檔（v9.10 結構：只看過公告的 lawclub、FAFU_TRK、還在排的值班出發選單 fafu_<天>、沒有 FAFU_PURE）讀進來：STORY.fafuMigrate 只做一次（FAFU_PURE）、
         只看過公告的改成 LAWCLUB_NOTICE（不是社員）、還在排的值班選單變 cancelled；再讀一次不再動。
   sats  大二上社員，2026-10-01～11-30 兩個月：週六都在睡覺（不出門）——只有 10/24 那一場跳一次出發選單、其他週六不跳；沒有柏翰私訊；關係值不變。
         【捷徑】這一段照遊戲每 0.5 秒跑的手機規則（STORY.phoneRules）把時間一格一格往前推（主迴圈先停），不是真的一晚一晚睡（雲端 SwiftShader 睡六十晚太久）。
   aunt  2027-05-22（社員、認識語彤）：前一晚 5/21（五）20:00 法服群組柏翰一則（AA_691 第 1 項；睡過去的隔天早上補、時間照 5/21 20:00）；當天 08:30 出發選單 → 出發 → 走到圓桌按 → 阿姨那一場（AA_625「（法律系館B的諮詢室。門開了，進來的是秀琴姨，後面跟著語彤。）」）照常演。
   abroad 日本路線大三下、美國路線大四上（2028-10-21 那一場）：那一段時間沒有法服的提醒、出發選單（【捷徑】同 sats 推時間）。
  Windows＋GPU（電腦）／SwiftShader（雲端）≠ iPhone。
用法：LW_TESTS=<wt>/tests [CASES=b5b,miss2,notice,migrate,sats,aunt,abroad] python3 cc_d118b5_play.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c.strip() for c in (os.environ.get('CASES') or 'b5b,s2seen,s2unseen,miss2,s3,s4,notice,migrate,sats,aunt,auntneg,abroad').split(',') if c.strip()]
R = L.Run('d118b5_play', OUT)
# 期望值：AA_604（23581d5b6）第 2 節場次表、第 3 節共同開頭與收尾；AA_625 阿姨那一場的第一句
MSG1 = '週六九點，有一位預約的阿姨。人手夠，想來的再來。'
MSG2 = '週六九點，有預約。上次漏水那位阿姨也說要再來。'
OPEN = '（週六上午九點，法律系館B一樓的圓桌。學長已經把紀錄表排好了。）'
END1 = '（初談紀錄，一頁。學長在最下面簽名。你把日期寫在最上面。）'
AUNT1 = '（法律系館B的諮詢室。門開了，進來的是秀琴姨，後面跟著語彤。）'
# AA_691（企劃線 f512588e1；BB-C 00:19）
SEM1 = '這學期起我排班。有事找我。'   # 第 3 項：第 1 場共同開頭後面，柏翰
END2 = '（阿姨走的時候，把照片收回袋子裡，跟你們點了一下頭。）'   # AA_604 收尾第 2 列（看過第 1 場）
END2U = '（兩位民眾都走了。學長把紀錄表翻回第一頁，又看了一次。）'   # AA_691 第 4 項（沒看過第 1 場）
BACKMISS = '（上次來過的一位民眾又來了，學長去接。）'   # AA_604 第 3 節：沒看過上一場
AUNTMSG = '週六九點有一件租約的諮詢。預約的阿姨說，會有人陪她來。'   # AA_691 第 1 項：2027-05-21（五）20:00 法服群組，柏翰
MSG3 = '週六九點有預約。我已經交接了，這次只是來幫忙。'   # AA_604 第 3 列（日期照 AA_691 第 2 項改 2027-10-30）
MSG4 = '週六九點有預約。可能是我最後一次排。'   # AA_604 第 4 列（雅筑學姊）
MEMO = '法服：做了一份初談紀錄'   # AA_691 第 5 項
MEM = {'CLUB_lawclub_study': True, 'lawclub': True, 'SIS_CLUB_EXPO': True}
UI = r"""(()=>{ const t=(document.getElementById('dlgText')||{}).textContent||'', ch=document.getElementById('choices'); const open=!!ch&&!ch.classList.contains('hide');
  const opts=open?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||b.textContent||'').trim()):[];
  const D=GAME.D||{}; return {dlg:!!D.active, text:t, opts, hour:+(+GAME.G.hour).toFixed(3), day:GAME.G.day, key:CALENDAR.dateOf(GAME.G.day).key, zone:GAME.G.zone, busy:!!GAME.E.player.busy}; })()"""
SAYHOOK = r"""(()=>{ if(window.__ccSayOn) return true; window.__ccSay=[]; const s0=GAME.say; GAME.say=function(who,t){ try{ window.__ccSay.push({t:String(t), key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2)}); }catch(e){} return s0.apply(this,arguments); }; window.__ccSayOn=true; return true; })()"""
SETF = r"""(o=>{ const F=GAME.G.flags; Object.assign(F,o.flags||{}); if(o.route) F.EXCHANGE_ROUTE=o.route; for(const id of (o.friends||[])){ if(id==='heroine_03') F.YT_MET_JOB=true;   /* STORY.knows('heroine_03') 要 YT_MET_JOB（AA_610：一盞茶屋當同事才認識；PC 11-05 r1 aunt 四項就是少了這個）*/ SOCIAL.meet&&SOCIAL.meet(id,GAME.G.zone); if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.remember(id,'FIRST_MET',''); const r=SOCIAL.rel(id); r.fam=Math.max(r.fam||0,45); r.trust=Math.max(r.trust||0,30); }
  try{ STORY.phoneRules(GAME); }catch(e){} return {member:STORY.fafuMember(GAME.G), joined:STORY.fafuJoined(GAME.G), inGroup:PHONE.inGroup(GAME.G,'lawclub_study'), notice:!!F.LAWCLUB_NOTICE, pure:F.FAFU_PURE, seen:F.FAFU_STORY_SEEN}; })"""
REL = "(()=>{ const o={}; for(const id of ['classmate_bohan','heroine_03','npc_lawclub_pres']){ const r=SOCIAL.rel(id)||{}; o[id]=[r.fam|0,r.trust|0,r.comf|0]; } return o; })()"
FAFU_MSGS = "(()=>(GAME.G.msgs||[]).filter(m=>m.th==='g:lawclub_study'||m.th==='p:classmate_bohan'||/fafu/.test(m.tag||'')).map(m=>({tag:m.tag||null,th:m.th,from:m.from,text:m.text,key:CALENDAR.dateOf(m.day).key,h:m.h})))()"
FAFU_OUTS = "(()=>OUT.rec(GAME.G).filter(q=>/^fafu_/.test(q.id||'')).map(q=>({id:q.id,key:CALENDAR.dateOf(q.day).key,h:q.h,title:q.title,no:q.no,state:q.state})))()"
# 【捷徑】時間一格一格往前推、跑手機規則（主迴圈停著）：記每一格 OUT.due 跳出來的出發選單、法服的訊息
WALK = r"""(a=>{ const G=GAME.G, E=GAME.E, keep={day:G.day,hour:G.hour,zone:G.zone,weekday:G.weekday}; E.paused=true; const due=[], seen=new Set();
  try{ for(let d=a.d0; d<=a.d1; d++){ for(let h=0; h<24; h+=0.5){ G.day=d; G.hour=h; G.weekday=CALENDAR.dateOf(d).wd%7; try{ STORY.phoneRules(GAME); }catch(e){} try{ PHONE.tick&&PHONE.tick(G); }catch(e){}
        let q=null; try{ q=OUT.due(G); }catch(e){} if(q&&!seen.has(q.id)){ seen.add(q.id); due.push({id:q.id,key:CALENDAR.dateOf(d).key,wd:CALENDAR.dateOf(d).wd%7,h,title:q.title}); }
        if(q&&a.sleep&&q.state==='planned'){ q.state='missed'; } } } }   /* 睡著：跳出來的選單沒人按＝錯過（遊戲在家睡覺時也是這樣過期）*/
  finally{ E.paused=false; }
  return {due}; })"""


async def pick(pg, cdp, pred):
    ok = await pg.evaluate("(src=>{ const f=new Function('t','return ('+src+')(t)'); const ch=document.getElementById('choices'); if(!ch) return false; const b=[...ch.querySelectorAll('button')].filter(x=>x.offsetParent!==null).find(x=>f((x.innerText||x.textContent||'').trim())); if(!b) return false; b.setAttribute('data-ccpick','1'); return true; })", pred)
    if not ok: return False
    await L.tap(pg, cdp, '[data-ccpick="1"]'); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const b=document.querySelector('[data-ccpick]'); if(b) b.removeAttribute('data-ccpick'); })()")
    return True


async def says(pg, n=0):
    return [x['t'] for x in await pg.evaluate("(n=>(window.__ccSay||[]).slice(n))", n)]


async def load(pg, cdp, key, h, zone, o, tag):
    d = await pg.evaluate("STORY.dayOfKey(%s)" % J(key))
    R.setup('%s 讀檔：%s %s %s；%s' % (tag, zone, key, '%02d:%02d' % (int(h), round(h % 1 * 60)), J(o)))
    await L.load_state(pg, {'zone': zone, 'hour': h, 'day': d, 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(3500); await L.close_panels(pg, cdp)
    st = await pg.evaluate(SETF, o)
    await pg.evaluate(SAYHOOK)
    R.note('%s 設定以後：%s' % (tag, J(st)))
    return d, st


async def wait_until(pg, cdp, cond_js, max_s=240, handle=True):
    t0 = time.time()
    while time.time() - t0 < max_s:
        v = await pg.evaluate(cond_js)
        if v: return v
        if handle:
            u = await pg.evaluate(UI)
            if u['dlg'] and not u['opts']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(1000)
    return None


async def sleep_tonight(pg, cdp, tag):
    """一鍵「回去睡覺」（在宿舍就是直接睡）→ 睡到早上"""
    await L.close_panels(pg, cdp)
    if not await L.tap(pg, cdp, '#btnGo'): return False
    await pg.wait_for_timeout(1000)
    if not await L.tap(pg, cdp, '#goPop [data-gok="sleep"]'): return False
    await pg.wait_for_timeout(1500)
    if await pg.evaluate("(()=>{ const b=document.getElementById('goConfirm'); return !!b&&!b.classList.contains('hide'); })()"):
        await L.tap(pg, cdp, '#goCfYes')
    R.note('%s 一鍵「回去睡覺」' % tag)
    return True


async def depart_menu(pg, cdp, tag, choose, max_s=600):
    """等出發選單（OUT 的出發／這週請假）跳出來，照 choose 選"""
    t0 = time.time(); seen = None
    while time.time() - t0 < max_s:
        u = await pg.evaluate(UI)
        if u['opts']:
            if any('這週請假' in o for o in u['opts']) or any(o.startswith('出發') for o in u['opts']):
                seen = dict(u); await pick(pg, cdp, "t=>t.startsWith(%s)" % J(choose)); return seen
            await pick(pg, cdp, "t=>true"); continue
        if u['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        await pg.wait_for_timeout(1000)
    return seen


async def table_scene(pg, cdp, tag, n0):
    """走到圓桌、按「坐到圓桌（做初談紀錄）」，演到 12:00"""
    ok = await L.go_to(pg, cdp, R, -1.6, 3.4, 1.0, tag + ' 圓桌', max_s=300)
    lab = (await L.state(pg)).get('interact') or ''
    R.note('%s 走到圓桌：%s、互動鍵 %r' % (tag, ok, lab))
    if not lab.startswith('坐到圓桌'):
        for _ in range(10):
            await pg.wait_for_timeout(800); lab = (await L.state(pg)).get('interact') or ''
            if lab.startswith('坐到圓桌'): break
    if not R.check('%s 圓桌的互動鍵「坐到圓桌（做初談紀錄）」' % tag, lab.startswith('坐到圓桌'), lab): return None
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    t0 = time.time(); menus = []
    while time.time() - t0 < 480:
        u = await pg.evaluate(UI)
        if u['opts']: menus.append(u['opts']); await pick(pg, cdp, "t=>true"); continue
        if u['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        if u['hour'] >= 11.99 and not u['busy']: break
        await pg.wait_for_timeout(800)
    u = await pg.evaluate(UI)
    return {'lines': await says(pg, n0), 'menus': menus, 'end': u}


async def case_b5b(pg, cdp):
    d, st = await load(pg, cdp, '2026-10-23', 19.9, 'dorm', {'flags': MEM, 'friends': ['classmate_bohan']}, '[b5b]')
    R.check('[b5b] 社員、在法服群組', st['member'] is False or st['joined'], J(st))
    rel0 = await pg.evaluate(REL)
    m = await wait_until(pg, cdp, "(()=>{ const m=(GAME.G.msgs||[]).find(x=>x.tag==='fafu_story_1'); return m?{text:m.text,from:m.from,th:m.th,key:CALENDAR.dateOf(m.day).key,h:m.h}:null; })()", 240)
    R.check('[b5b] 10/23 20:00 法服群組一則「%s」（AA_604 第 1 列）' % MSG1, bool(m) and m['key'] == '2026-10-23' and abs(m['h'] - 20) < 0.01 and m['text'] == MSG1 and m['th'] == 'g:lawclub_study', J(m))
    await sleep_tonight(pg, cdp, '[b5b]')
    seen = await depart_menu(pg, cdp, '[b5b]', '出發', 900)
    R.check('[b5b] 10/24 08:30 跳出發選單（出發／這週請假）', bool(seen) and seen['key'] == '2026-10-24' and abs(seen['hour'] - 8.5) < 0.2 and any('這週請假' in o for o in seen['opts']), J(seen))
    z = await wait_until(pg, cdp, "(()=>GAME.G.zone==='wancai'&&!GAME.E.player.busy?{zone:GAME.G.zone,h:+GAME.G.hour.toFixed(2)}:null)()", 300)
    R.check('[b5b] 出發 → 到萬才館（法律系館B）9:00 前後', bool(z) and abs(z['h'] - 9) < 0.5, J(z))
    n0 = len(await says(pg))
    sc = await table_scene(pg, cdp, '[b5b]', n0)
    if not sc: return
    L1 = sc['lines']; R.note('[b5b] 台詞（%d 句）：%s；選單 %s' % (len(L1), J(L1[:14]), J(sc['menus'])))
    io, ie = (L1.index(OPEN) if OPEN in L1 else -1), (L1.index(END1) if END1 in L1 else -1)
    R.check('[b5b] 流程：共同開頭 → 新個案（有「你先問什麼？」的選單）→ 收尾旁白第 1 列（第一場沒有回訪）', 0 <= io < ie and len(sc['menus']) >= 1 and ie - io > 2, J({'open': io, 'end': ie, 'menus': len(sc['menus'])}))
    R.check('[b5b] 共同開頭後面接柏翰「%s」（AA_691 第 3 項）' % SEM1, io >= 0 and io + 1 < len(L1) and L1[io + 1] == SEM1, J(L1[io:io + 3] if io >= 0 else L1[:3]))
    mm = await pg.evaluate("(()=>(GAME.G.memo||[]).filter(m=>/初談紀錄/.test(m.t||'')).map(m=>m.t))()")
    R.check('[b5b] 手機記事「%s」（AA_691 第 5 項；不寫「值班」）' % MEMO, MEMO in mm and not [t for t in mm if '值班' in t], J(mm))
    fl = await pg.evaluate("(()=>({k1:GAME.G.flags.FAFU_STORY_1, seen:GAME.G.flags.FAFU_STORY_SEEN, h:+GAME.G.hour.toFixed(2), key:CALENDAR.dateOf(GAME.G.day).key}))()")
    d24 = await pg.evaluate("STORY.dayOfKey('2026-10-24')")   # 那天＝10/24（週六）；d 是讀檔那天 10/23（PC 11-05 r1 比錯天）
    R.check('[b5b] 演完 12:00、FAFU_STORY_1＝那天（10/24＝%s）、FAFU_STORY_SEEN 1' % d24, abs(fl['h'] - 12) < 0.05 and fl['k1'] == d24 and fl['seen'] == 1, J(fl))
    rel1 = await pg.evaluate(REL)
    R.check('[b5b] 關係值不變（純劇情，不加數值）', rel0 == rel1, J([rel0, rel1]))
    await R.shot(pg, 'b5b_after')


async def case_miss2(pg, cdp):
    d, st = await load(pg, cdp, '2027-04-09', 19.9, 'dorm', {'flags': dict(MEM, FAFU_STORY_SEEN=1), 'friends': ['classmate_bohan']}, '[miss2]')
    await pg.evaluate("(d=>{ GAME.G.flags.FAFU_STORY_1=STORY.dayOfKey('2026-10-24'); })()")
    rel0 = await pg.evaluate(REL)
    m = await wait_until(pg, cdp, "(()=>{ const m=(GAME.G.msgs||[]).find(x=>x.tag==='fafu_story_2'); return m?{text:m.text,key:CALENDAR.dateOf(m.day).key,h:m.h}:null; })()", 240)
    R.check('[miss2] 4/9 20:00 群組一則「%s」' % MSG2, bool(m) and m['key'] == '2027-04-09' and m['text'] == MSG2, J(m))
    await sleep_tonight(pg, cdp, '[miss2]')
    seen = await depart_menu(pg, cdp, '[miss2]', '這週請假', 900)
    R.check('[miss2] 4/10 08:30 出發選單 → 選「這週請假」', bool(seen) and seen['key'] == '2027-04-10', J(seen))
    m0 = await pg.evaluate(FAFU_MSGS)
    R.setup('[miss2] 【捷徑】之後兩週（4/10 中午～4/24）照手機規則推時間')
    w = await pg.evaluate(WALK + '(%s)' % J({'d0': d + 1, 'd1': d + 15, 'sleep': True}))
    m1 = await pg.evaluate(FAFU_MSGS); new = [x for x in m1 if x not in m0]
    fl = await pg.evaluate("(()=>({k2:GAME.G.flags.FAFU_STORY_2==null?null:GAME.G.flags.FAFU_STORY_2, seen:GAME.G.flags.FAFU_STORY_SEEN}))()")
    rel1 = await pg.evaluate(REL)
    R.check('[miss2] 錯過不補、不追問：之後兩週沒有任何法服的訊息、沒有法服的出發選單', not new and not [x for x in w['due'] if x['id'].startswith('fafu_')], J({'new': new, 'due': w['due']}))
    R.check('[miss2] 不扣：FAFU_STORY_2 沒有、SEEN 還是 1、關係值不變', fl['k2'] is None and fl['seen'] == 1 and rel0 == rel1, J([fl, rel0, rel1]))


async def case_s2(pg, cdp, seen1):
    tag = '[s2%s]' % ('seen' if seen1 else 'unseen')
    fl = dict(MEM, FAFU_STORY_SEEN=1 if seen1 else 0)
    d, st = await load(pg, cdp, '2027-04-09', 19.9, 'dorm', {'flags': fl, 'friends': ['classmate_bohan']}, tag)
    if seen1:
        R.setup('%s 【前置】看過第 1 場（FAFU_STORY_1＝2026-10-24、那一場的新個案＝S.FAFU_STORY[0].c）' % tag)
        await pg.evaluate("(()=>{ const F=GAME.G.flags; F.FAFU_STORY_1=STORY.dayOfKey('2026-10-24'); F.FAFU_STORY_REC={c:{1:STORY.FAFU_STORY[0].c},b:[]}; })()")
    m = await wait_until(pg, cdp, "(()=>{ const m=(GAME.G.msgs||[]).find(x=>x.tag==='fafu_story_2'); return m?{text:m.text,key:CALENDAR.dateOf(m.day).key,h:m.h}:null; })()", 240)
    R.check('%s 4/9 20:00 群組一則「%s」' % (tag, MSG2), bool(m) and m['key'] == '2027-04-09' and m['text'] == MSG2, J(m))
    await sleep_tonight(pg, cdp, tag)
    sn = await depart_menu(pg, cdp, tag, '出發', 900)
    R.check('%s 4/10 08:30 出發選單 → 出發' % tag, bool(sn) and sn['key'] == '2027-04-10', J(sn))
    z = await wait_until(pg, cdp, "(()=>GAME.G.zone==='wancai'&&!GAME.E.player.busy?{zone:GAME.G.zone,h:+GAME.G.hour.toFixed(2)}:null)()", 300)
    R.check('%s 到萬才館' % tag, bool(z), J(z))
    n0 = len(await says(pg)); sc = await table_scene(pg, cdp, tag, n0)
    if not sc: return
    L1 = sc['lines']; R.note('%s 台詞（%d 句）：%s' % (tag, len(L1), J(L1[:16])))
    io = L1.index(OPEN) if OPEN in L1 else -1
    want = END2 if seen1 else END2U
    R.check('%s 共同開頭 → %s → 新個案 → 收尾「%s」（AA_691 第 4 項）' % (tag, '回訪（漏水的阿姨）' if seen1 else '沒看過上一場那一句旁白', want), io >= 0 and want in L1 and L1.index(want) > io and ((BACKMISS not in L1) if seen1 else (BACKMISS in L1)), J({'open': io, 'end': want in L1, 'backmiss': BACKMISS in L1}))
    R.check('%s 另一種收尾不出現' % tag, (END2U if seen1 else END2) not in L1, '')
    fl2 = await pg.evaluate("(()=>({k2:GAME.G.flags.FAFU_STORY_2, seen:GAME.G.flags.FAFU_STORY_SEEN, h:+GAME.G.hour.toFixed(2)}))()")
    R.check('%s 演完 12:00、FAFU_STORY_2 有記、SEEN %d' % (tag, 2 if seen1 else 1), abs(fl2['h'] - 12) < 0.05 and fl2['k2'] is not None and fl2['seen'] == (2 if seen1 else 1), J(fl2))


async def case_s2seen(pg, cdp): await case_s2(pg, cdp, True)


async def case_s2unseen(pg, cdp): await case_s2(pg, cdp, False)


async def case_s3(pg, cdp):
    d, st = await load(pg, cdp, '2027-10-20', 9.0, 'dorm', {'flags': dict(MEM, FAFU_STORY_SEEN=2), 'friends': ['classmate_bohan']}, '[s3]')
    m0 = await pg.evaluate(FAFU_MSGS); d1 = await pg.evaluate("STORY.dayOfKey('2027-10-31')")
    R.setup('[s3] 【捷徑】2027-10-20～10-31 照手機規則推時間（第 3 場改到 10/30，AA_691 第 2 項）')
    w = await pg.evaluate(WALK + '(%s)' % J({'d0': d, 'd1': d1, 'sleep': True}))
    m1 = await pg.evaluate(FAFU_MSGS); new = [x for x in m1 if x not in m0]; fd = [x for x in w['due'] if x['id'].startswith('fafu_')]
    R.note('[s3] 出發選單 %s；法服訊息 %s' % (J(fd), J(new)))
    R.check('[s3] 10/23（感冒那一週）沒有法服：10/22 晚上沒有提醒、10/23 沒有出發選單', not [x for x in new if x['key'] == '2027-10-22'] and not [x for x in fd if x['key'] == '2027-10-23'], J([new, fd]))
    R.check('[s3] 10/29 20:00 群組「%s」、10/30 08:30 出發選單（只有這一個）' % MSG3, [x['text'] for x in new if x['tag'] == 'fafu_story_3' and x['key'] == '2027-10-29' and abs(x['h'] - 20) < 0.01] == [MSG3] and len(fd) == 1 and fd[0]['key'] == '2027-10-30' and abs(fd[0]['h'] - 8.5) < 0.01, J([new, fd]))


async def case_s4(pg, cdp):
    d, st = await load(pg, cdp, '2028-10-20', 19.9, 'dorm', {'flags': dict(MEM, FAFU_STORY_SEEN=3), 'friends': ['classmate_bohan']}, '[s4]')
    mem0 = await pg.evaluate("(()=>((GAME.G.social&&GAME.G.social.mem&&GAME.G.social.mem.classmate_bohan)||[]).filter(m=>m&&(m.k||m.key||m.id||m[0])==='FAFU_STORY').length)()")
    m = await wait_until(pg, cdp, "(()=>{ const m=(GAME.G.msgs||[]).find(x=>x.tag==='fafu_story_4'); return m?{text:m.text,key:CALENDAR.dateOf(m.day).key,h:m.h,from:m.from}:null; })()", 240)
    R.check('[s4] 10/20 20:00 群組雅筑學姊「%s」' % MSG4, bool(m) and m['key'] == '2028-10-20' and m['text'] == MSG4, J(m))
    await sleep_tonight(pg, cdp, '[s4]')
    sn = await depart_menu(pg, cdp, '[s4]', '出發', 900)
    R.check('[s4] 10/21 08:30 出發選單 → 出發', bool(sn) and sn['key'] == '2028-10-21', J(sn))
    z = await wait_until(pg, cdp, "(()=>GAME.G.zone==='wancai'&&!GAME.E.player.busy?{zone:GAME.G.zone}:null)()", 300)
    n0 = len(await says(pg)); sc = await table_scene(pg, cdp, '[s4]', n0)
    if not sc: return
    R.note('[s4] 台詞（%d 句）：%s' % (len(sc['lines']), J(sc['lines'][:12])))
    mem1 = await pg.evaluate("(()=>((GAME.G.social&&GAME.G.social.mem&&GAME.G.social.mem.classmate_bohan)||[]).filter(m=>m&&(m.k||m.key||m.id||m[0])==='FAFU_STORY').length)()")
    has1 = await pg.evaluate("SOCIAL.has('classmate_bohan','FAFU_STORY')")
    R.check('[s4] 第 4 場不記柏翰的記憶（FAFU_STORY 筆數 %s → %s；SOCIAL.has %s）（AA_691 第 5 項）' % (mem0, mem1, has1), mem1 == mem0 and not has1, J([mem0, mem1, has1]))
    mm = await pg.evaluate("(()=>(GAME.G.memo||[]).filter(m=>/初談紀錄/.test(m.t||'')).map(m=>m.t))()")
    R.check('[s4] 手機記事「%s」' % MEMO, MEMO in mm, J(mm))


async def case_auntneg(pg, cdp):
    for label, fl, fr, done in (('不是社員', {}, ['heroine_03'], False), ('不認識語彤', MEM, [], False), ('阿姨那一場演過', MEM, ['heroine_03'], True)):
        d, st = await load(pg, cdp, '2027-05-21', 19.0, 'dorm', {'flags': fl, 'friends': fr}, '[auntneg %s]' % label)
        if done: await pg.evaluate("(()=>{ (GAME.G.events.done||(GAME.G.events.done={})).ev_yt_aunt_consult=1; })()")
        R.setup('[auntneg %s] 【捷徑】5/21 19:00～5/22 12:00 照手機規則推時間' % label)
        w = await pg.evaluate(WALK + '(%s)' % J({'d0': d, 'd1': d + 1, 'sleep': True}))
        ms = [x for x in await pg.evaluate(FAFU_MSGS) if x['text'] == AUNTMSG]
        R.check('[auntneg %s] 5/21 20:00 柏翰那一則不傳（只傳給社員、認識語彤、阿姨那一場還沒演的）' % label, not ms, J(ms))


async def case_notice(pg, cdp):
    d, st = await load(pg, cdp, '2026-10-23', 19.9, 'dorm', {'flags': {'LAWCLUB_NOTICE': True}}, '[notice]')
    R.setup('[notice] 【捷徑】10/23 20:00～10/24 12:00 照手機規則推時間')
    w = await pg.evaluate(WALK + '(%s)' % J({'d0': d, 'd1': d + 1, 'sleep': True}))
    ms = await pg.evaluate(FAFU_MSGS); outs = await pg.evaluate(FAFU_OUTS)
    st2 = await pg.evaluate("(()=>({member:STORY.fafuMember(GAME.G), inGroup:PHONE.inGroup(GAME.G,'lawclub_study')}))()")
    R.check('[notice] 只看過公告（不是社員）：不在法服群組、沒有 10/23 的群組那一則、10/24 沒有出發選單', not st2['member'] and not st2['inGroup'] and not ms and not outs and not w['due'], J({'st': st2, 'msgs': ms, 'outs': outs, 'due': w['due']}))


async def case_migrate(pg, cdp):
    d = await pg.evaluate("STORY.dayOfKey('2026-10-10')")
    R.setup('[migrate] 舊存檔（v9.10 結構）：2026-10-10 10:00 宿舍、只看過公告的 lawclub、FAFU_TRK、還在排的值班出發選單 fafu_<10/17>、沒有 FAFU_PURE；用遊戲的讀檔讀進來')
    r = await pg.evaluate("""(async d=>{ const s=GAME.defaults('祐廷'); s.day=d; s.hour=10; s.zone='dorm'; s.flags=s.flags||{}; delete s.flags.FAFU_PURE; delete s.flags.FAFU_STORY_SEEN; s.flags.lawclub=true; s.flags.FAFU_TRK={n:3}; s.flags.FAFU_OFF=1;
      const d17=d+7; s.outings=[{id:'fafu_'+d17,day:d17,h:9,place:'法律系館B一樓',title:'法服值班（法律系館B一樓 9:00）',no:'這週請假',state:'planned'}];
      document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); const G=GAME.G, F=G.flags;
      const a={pure:F.FAFU_PURE, lawclub:F.lawclub, notice:!!F.LAWCLUB_NOTICE, member:STORY.fafuMember(Object.assign({},G,{day:STORY.dayOfKey('2026-10-24')})), trk:!!F.FAFU_TRK, seen:F.FAFU_STORY_SEEN, outs:OUT.rec(G).filter(q=>/^fafu_/.test(q.id)).map(q=>[q.id,q.state])};
      const snap=JSON.parse(JSON.stringify(GAME.snapshot())); snap.flags.lawclub=true; await GAME.applySave(snap); const F2=GAME.G.flags;
      const b={pure:F2.FAFU_PURE, lawclub:F2.lawclub, notice:!!F2.LAWCLUB_NOTICE, outs:OUT.rec(GAME.G).filter(q=>/^fafu_/.test(q.id)).map(q=>[q.id,q.state])};
      return {a,b}; })(%d)""" % d)
    R.note('[migrate] 讀進來以後：%s' % J(r))
    a, b2 = r['a'], r['b']
    R.check('[migrate] STORY.fafuMigrate 做了（FAFU_PURE）、只看過公告＝LAWCLUB_NOTICE、不是社員', bool(a['pure']) and a['notice'] and not a['lawclub'] and not a['member'], J(a))
    R.check('[migrate] 還在排的值班出發選單 → cancelled', bool(a['outs']) and all(s == 'cancelled' for _, s in a['outs']), J(a['outs']))
    R.check('[migrate] 只做一次：再讀一次（存檔裡 FAFU_PURE 已經有）不再動（這一輪故意把 lawclub 改回 true，照樣留著）', bool(b2['pure']) and b2['lawclub'] is True, J(b2))


async def case_sats(pg, cdp):
    d, st = await load(pg, cdp, '2026-10-01', 9.0, 'dorm', {'flags': MEM, 'friends': ['classmate_bohan']}, '[sats]')
    rel0 = await pg.evaluate(REL); m0 = await pg.evaluate(FAFU_MSGS)
    d1 = await pg.evaluate("STORY.dayOfKey('2026-11-30')")
    R.setup('[sats] 【捷徑】2026-10-01～11-30 照手機規則推時間（每 30 分鐘一格、主迴圈停著）；跳出來的出發選單沒人按＝睡過頭錯過')
    w = await pg.evaluate(WALK + '(%s)' % J({'d0': d, 'd1': d1, 'sleep': True}))
    m1 = await pg.evaluate(FAFU_MSGS); new = [x for x in m1 if x not in m0]; rel1 = await pg.evaluate(REL)
    fd = [x for x in w['due'] if x['id'].startswith('fafu_')]
    R.note('[sats] 兩個月跳出來的出發選單：%s；法服相關訊息：%s' % (J(w['due']), J(new)))
    R.check('[sats] 只有 10/24 那一場跳一次出發選單（其他週六不跳）', len(fd) == 1 and fd[0]['key'] == '2026-10-24' and abs(fd[0]['h'] - 8.5) < 0.01, J(fd))
    R.check('[sats] 沒有柏翰私訊（p:classmate_bohan）', not [x for x in new if x['th'] == 'p:classmate_bohan'], J([x for x in new if x['th'] == 'p:classmate_bohan']))
    R.check('[sats] 法服群組只有 10/23 那一則（fafu_story_1）', [x['tag'] for x in new if x['th'] == 'g:lawclub_study' and x['tag'] != 'fafu_welcome'] in (['fafu_story_1'], []), J([[x['tag'], x['key'], x['text']] for x in new if x['th'] == 'g:lawclub_study']))
    R.check('[sats] 關係值不變', rel0 == rel1, J([rel0, rel1]))


async def case_aunt(pg, cdp):
    d, st = await load(pg, cdp, '2027-05-21', 19.5, 'dorm', {'flags': MEM, 'friends': ['heroine_03', 'classmate_bohan']}, '[aunt]')
    m0 = await pg.evaluate(FAFU_MSGS)
    await pg.wait_for_timeout(2000)
    await sleep_tonight(pg, cdp, '[aunt]')
    seen = await depart_menu(pg, cdp, '[aunt]', '出發', 900)
    m1 = await pg.evaluate(FAFU_MSGS); new = [x for x in m1 if x not in m0]
    am = [x for x in m1 if x['text'] == AUNTMSG]
    R.check('[aunt] 5/21（五）20:00 法服群組柏翰「%s」（AA_691 第 1 項；5/21 晚上睡過去的，隔天早上補進群組、時間照 5/21 20:00）' % AUNTMSG, len(am) == 1 and am[0]['key'] == '2027-05-21' and abs(am[0]['h'] - 20) < 0.01 and am[0]['from'] == 'classmate_bohan' and am[0]['th'] == 'g:lawclub_study', J(am))
    R.check('[aunt] 5/22 08:30 出發選單（出發／這週請假）', bool(seen) and seen['key'] == '2027-05-22' and any('這週請假' in o for o in seen['opts']), J(seen))
    z = await wait_until(pg, cdp, "(()=>GAME.G.zone==='wancai'&&!GAME.E.player.busy?{zone:GAME.G.zone,h:+GAME.G.hour.toFixed(2)}:null)()", 300)
    R.check('[aunt] 出發 → 到萬才館', bool(z), J(z))
    n0 = len(await says(pg))
    sc = await table_scene(pg, cdp, '[aunt]', n0)
    if not sc: return
    R.note('[aunt] 台詞（%d 句）：%s' % (len(sc['lines']), J(sc['lines'][:10])))
    mem = await pg.evaluate("SOCIAL.has('heroine_03','RENT_CONSULTATION')")
    R.check('[aunt] 阿姨那一場照常演：「%s」、記 RENT_CONSULTATION' % AUNT1, AUNT1 in sc['lines'] and mem, J({'first': sc['lines'][:2], 'mem': mem}))
    await R.shot(pg, 'aunt_after')


async def case_abroad(pg, cdp):
    for route, k0, k1, tag in (('JP', '2028-02-15', '2028-06-30', '日本路線大三下'), ('US', '2028-09-01', '2028-12-31', '美國路線大四上')):
        d, st = await load(pg, cdp, k0, 9.0, 'dorm', {'flags': MEM, 'route': route, 'friends': ['classmate_bohan']}, '[abroad %s]' % route)
        m0 = await pg.evaluate(FAFU_MSGS); d1 = await pg.evaluate("STORY.dayOfKey(%s)" % J(k1))
        R.setup('[abroad %s] 【捷徑】%s～%s 照手機規則推時間' % (route, k0, k1))
        w = await pg.evaluate(WALK + '(%s)' % J({'d0': d, 'd1': d1, 'sleep': True}))
        m1 = await pg.evaluate(FAFU_MSGS); new = [x for x in m1 if x not in m0]
        ab = await pg.evaluate("(k=>{ const G=GAME.G, d=STORY.dayOfKey(k); return STORY.abroad(Object.assign({},G,{day:d})); })(%s)" % J('2028-04-15' if route == 'JP' else '2028-10-21'))
        R.note('[abroad %s] 人在國外（STORY.abroad 那段時間）：%s' % (route, ab))
        R.check('[abroad %s] %s：沒有法服的提醒、出發選單（那一場不排；fafu_welcome＝讀檔時入社的歡迎訊息，不算）' % (route, tag), ab and not [x for x in w['due'] if x['id'].startswith('fafu_')] and not [x for x in new if 'fafu' in str(x['tag']) and x['tag'] != 'fafu_welcome'], J({'due': w['due'], 'new': new}))


async def main():
    print('CC D118_B5（法服改純劇情）：CASES=%s；SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (CASES, os.environ.get('SHA', '?')), flush=True)
    for c in CASES:
        async with async_playwright() as p:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            await cc_det.install(pg, int(os.environ.get('CC_SEED') or 20261105))
            t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('[%s] 遊戲載入' % c, ok, '%.1f 秒' % (time.time() - t0))
            if ok:
                await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
                try:
                    await {'b5b': case_b5b, 's2seen': case_s2seen, 's2unseen': case_s2unseen, 'miss2': case_miss2, 's3': case_s3, 's4': case_s4, 'notice': case_notice, 'migrate': case_migrate, 'sats': case_sats, 'aunt': case_aunt, 'auntneg': case_auntneg, 'abroad': case_abroad}[c](pg, cdp)
                except Exception as e:
                    R.check('[%s] 探針沒有例外' % c, False, repr(e)[:300])
                R.check('[%s] 沒有 JS 例外' % c, not errs, J(errs[:3]))
            await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
