"""BB（帳號 A）2026-10-22：RELEASE-9106-TEST 第 13 項（LAWWW 13:3x 加派）——溫州街四家店（WZ-SHOP-AA364-SYS，開發分支 a3d3845e；規格 AA_364 第 2～4 節）。
  LIN       林家乾麵：溫州街走到門口進去、點餐（老闆「內用外帶？」）、乾麵（小）扣 40、「（你點了乾麵（小）。）」、坐下吃約 40 分鐘、吃完站起來；看菜單
  TEI       巷子裡定食：18:00 進去、店員「幾位？這邊坐。」、薑汁燒肉定食扣 180、坐下；點餐選單沒有「味噌湯續一碗」（AA_364 5-5：吃定食就有，吃完那句「你續了一碗味噌湯」接在定食後面）
  TEA       巷口茶飲：騎樓窗口「買一杯飲料」連買五杯——前四杯「甜度冰塊？」、第五杯「半糖少冰？」＋「老樣子」；外帶不坐下、約 5 分鐘
  ICE_JUN／ICE_MAY／ICE_OCT  夏日冰菓室：6 月有芒果冰 140（老闆娘「冰要大碗小碗？」）、5 月開但沒有芒果冰、10 月只有「看夏日冰菓室」＝「（鐵捲門拉著。上面貼了一張紙：「五月見」。）」
  TEI_LATE／LIN_MON／TEI_TUE  定食 20:45、林家週一、定食週二：門口進不去、提示寫開放時間
  LIN5      林家第 5 次：【捷徑】吃過的次數設成 4 → 老闆「小的，不加辣。對吧。」、「老樣子」
【前置】讀使用者 9/25 存檔改日期、時間、地點（溫州街）、台灣路線；quiet_events。照玩家：點地面走過去、按互動、對話、選單。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=LIN,... python3 wzshop_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time, re
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__LOG.push({n:'［選項］', t:JSON.stringify((o||[]).map(x=>x.t)), at:at()}); }catch(e){} return c0.apply(this,arguments); };
  if(GAME.caption){ const c1=GAME.caption; GAME.caption=function(a,b){ try{ window.__LOG.push({n:'［字幕］', t:String(b||a||'').replace(/<[^>]+>/g,'｜'), at:at()}); }catch(e){} return c1.apply(this,arguments); }; }
  if(GAME.titleCard){ const c2=GAME.titleCard; GAME.titleCard=function(a,b){ try{ window.__LOG.push({n:'［日期卡］', t:String(a||'')+'｜'+String(b||''), at:at()}); }catch(e){} return c2.apply(this,arguments); }; } })()"""
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+(+G.hour).toFixed(3), zone:G.zone}; })()"""
MSGS = """(th=>(GAME.G.msgs||[]).filter(m=>m.th===th).map(m=>({d:CALENDAR.dateOf(m.day).key, day:m.day, h:+(+m.h||0).toFixed(2), from:m.from||'', tag:m.tag||'', text:String(m.text||''), ask:m.ask?m.ask.opts.map(o=>o.t):null, until:m.ask&&m.ask.until!=null?m.ask.until:null})))"""
ALLMSG = """(re=>(GAME.G.msgs||[]).filter(m=>new RegExp(re).test(m.tag||'')).map(m=>({th:m.th, d:CALENDAR.dateOf(m.day).key, day:m.day, h:+(+m.h||0).toFixed(2), from:m.from||'', tag:m.tag||'', text:String(m.text||'')})))"""
PEND = """(id=>{ const m=PHONE.pending(GAME.G).find(x=>x.ask&&x.ask.id===id); if(!m) return null; const u=m.ask.until; return {until:u, untilKey:u!=null?CALENDAR.dateOf(Math.floor(u/24)).key+' '+(u-24*Math.floor(u/24)).toFixed(2):null, opts:m.ask.opts.map(o=>o.t)}; })"""
OUTQ = """(re=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>new RegExp(re).test(q.id||'')).map(q=>({id:q.id, d:CALENDAR.dateOf(q.day).key, day:q.day, wd:CALENDAR.dateOf(q.day).wd%7, h:+(+q.h).toFixed(3), state:q.state, title:q.title||'', place:q.place||''})))"""
SETUP = """(([rels,dating,flags])=>{ const G=GAME.G, F=G.flags; const V={ACQ:[8,0,0],FAMILIAR:[25,0,0],FRIEND:[45,30,10],CLOSE:[65,50,45]};
  const day0=STORY.dayOfKey('2025-09-24'); G.contacts=G.contacts||{};
  for(const id in rels){ const R=SOCIAL.rel(id), v=V[rels[id]]; R.fam=v[0]; R.trust=v[1]; R.comf=v[2]; SOCIAL.remember(id,'FIRST_MET',''); if(G.contacts[id]==null) G.contacts[id]=day0;
    const so=G.social||(G.social={}), U=so.relUp||(so.relUp={}), k={ACQ:1,FAMILIAR:2,FRIEND:3,CLOSE:4}[rels[id]]|0; if((U[id]|0)<k) U[id]=k; }   /* 2026-10-22：早就升到這一階、門檻台詞（SOCIAL.playUp）說過了——不然下一次說話先演升階台詞、這次不走閒聊階梯（候選 364dabe0 第二輪以安 9/15）*/
  if(rels.heroine_05){ F.met_sis=true; F.SIS_W1=true; }
  Object.assign(F,flags||{});
  for(const id of dating||[]){ try{ ROM.start(G,id); }catch(e){} F['dating_'+id]=true; const R=SOCIAL.rel(id); R.fam=Math.max(R.fam|0,70); R.trust=Math.max(R.trust|0,60); R.comf=Math.max(R.comf|0,60); R.rom=70; R.npcRom=70; if(G.contacts[id]==null) G.contacts[id]=day0; SOCIAL.remember(id,'FIRST_MET',''); }
  G.visited=Object.assign(G.visited||{},{cafe:true,lawlib:true,library:true,library_hall:true,noodle:true,wancai:true,gongguan:true,campus:true,classroom:true,wenzhou:true});
  const ids=Object.keys(rels).concat(dating||[]);
  return {stages:Object.fromEntries(ids.map(id=>[id,SOCIAL.stage(id)])), partners:(typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):[]), route:STORY.route?STORY.route(G):null, abroad:STORY.abroad?STORY.abroad(G):null}; })"""
NPC = """(ids=>{ const n=(GAME.E.npcs||[]).find(x=>x&&ids.some(id=>x.charId===id||x.id===id)&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0,n.id]:null; })"""
LAB = "(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()"
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
TWF = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'X1_JP': {'$day': '2028-02-20'}, 'JP_DEPARTED': {'$day': '2028-03-25'}, 'JP_RETURNED': {'$day': '2028-08-05'}, 'AN_SENDOFF': 'together'}
# 2026-10-22 08:3x（候選 364dabe0 第一輪 17 個 FAIL 全是前置不足）：使用者存檔停在 9/3（主線第一天），沒有 afternoonDone——以安（LEGACY_IDS）要 afternoonDone 才照作息出現；
# 也沒有 Y4_PATH——日本路線讀檔後先演「大四要怎麼過？」（8/5 返台那晚，在家），腳本在它演到一半時開手機，走不進 Café。大四的情境一律補上「早就過了的主線」：
BASEF = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'Y4_PATH': 'bar'}
USF = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'US_ARRIVED_DAY': {'$day': '2028-08-02'}, 'US_RETURNED': {'$day': '2028-12-23'}}


async def opts(pg):
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


def pick_idx(ops, picks=None, go=()):
    """picks（要選的字，依序找）→ go（這個情境要去的「出發／接起來」開頭）→ 起床選單、跳過時間「照樣跳過」、說話完的「就這樣」→ 別人的出遊「不去了」→ 第一個"""
    for want in picks or []:
        for i, o in enumerate(ops):
            if want in o: return i
    for i, o in enumerate(ops):
        if go and o.startswith(tuple(go)): return i
    for pre in ('先起床再說', '先起床', '照樣跳過', '就這樣'):
        for i, o in enumerate(ops):
            if o.startswith(pre): return i
    if any(o.startswith(('出發：', '接起來：')) for o in ops):
        for i, o in enumerate(ops):
            if o.startswith(('不去了', '今天先不要', '先不接', '不接')): return i
    return 0


async def phone_open(pg):
    return await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())")


async def phone_tab(pg, cdp, tab):
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+t+'\"]'); if(b) b.click(); })(%s)" % json.dumps(tab)); await pg.wait_for_timeout(800)


async def tap_sel_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return c[2]


async def drive(pg, cdp, run, picks=None, go=(), max_s=240, label=''):
    t0 = time.time(); idle = 0; ch = []
    while time.time() - t0 < max_s:
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if not ops: await pg.wait_for_timeout(500); continue
            k = pick_idx(ops, picks, go); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
            say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); idle = 0; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); idle = 0; continue
        if s.get('busy'): await pg.wait_for_timeout(700); continue
        idle += 1
        if idle >= 3: break
        await pg.wait_for_timeout(900)
    return ch


async def wait_for(pg, cdp, run, cond, max_s=400, picks=None, go=(), label='', shot_at=None):
    """時間照走（不跳過時間），遇到對話、選項照 pick_idx 點，直到 cond（JS）成立"""
    t0 = time.time(); ch = []; shot = False
    while time.time() - t0 < max_s:
        if await pg.evaluate(cond): return True, ch
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if ops:
                k = pick_idx(ops, picks, go); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
                say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
                if go and ops[k].startswith(tuple(go)): await run.shot(pg, '%s_prompt' % label)
                await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']:
            if shot_at and not shot:
                txt = await pg.evaluate("((document.getElementById('dlg')||{}).innerText||'')")
                if shot_at in txt: await run.shot(pg, '%s_scene' % label); shot = True
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1500)
    return False, ch


async def answer(pg, cdp, run, th, ask_id, want, label=''):
    await phone_tab(pg, cdp, 'msg')
    await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(th))
    await pg.wait_for_timeout(600); await run.shot(pg, '%s_dm' % label)
    o = await pg.evaluate("(id=>{ const m=PHONE.pending(GAME.G).find(x=>x.ask&&x.ask.id===id); return m?m.ask.opts.map(o=>o.t):null; })(%s)" % json.dumps(ask_id))
    if not o: await L.phone_away(pg, cdp); return None
    k = next((i for i, t in enumerate(o) if t.startswith(want)), 0)
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|%d' % (ask_id, k)))
    await pg.wait_for_timeout(1500); await run.shot(pg, '%s_dm_answered' % label); say('   %s 手機回 %s：「%s」' % (label, ask_id, got)); await L.phone_away(pg, cdp); return got


FALLBACK = {'等到中午': ['等到中午', '等到下一堂課前'], '等到傍晚': ['等到傍晚', '等到下午'], '等到下午': ['等到下午'], '等到晚上': ['等到晚上', '等到傍晚']}


async def skip(pg, cdp, label_prefix, label=''):
    await phone_tab(pg, cdp, 'today'); got = None
    for pre in FALLBACK.get(label_prefix, [label_prefix]):
        got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-skip]')].find(b=>b.textContent.trim().startsWith(%s))" % json.dumps(pre))
        if got: break
    if not got:
        btns = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>b.textContent.trim())"); say('   %s 跳過時間沒有「%s」：%s' % (label, label_prefix, btns)); await L.phone_away(pg, cdp); return None
    await pg.wait_for_timeout(1500)
    for _ in range(6):
        ops = await opts(pg)
        if ops and any(o.startswith('照樣跳過') for o in ops): await tap_idx(pg, cdp, next(i for i, o in enumerate(ops) if o.startswith('照樣跳過'))); await pg.wait_for_timeout(1500); break
        if not ops: await pg.wait_for_timeout(700)
        else: break
    await pg.wait_for_timeout(2500); say('   %s 跳過時間「%s」→ %s' % (label, got, await pg.evaluate(STATE))); return got


async def quick_go(pg, cdp, zone):
    await phone_tab(pg, cdp, 'places')
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(%s))" % json.dumps(zone + '|'))
    if not got: await L.phone_away(pg, cdp); return False
    for _ in range(60):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == zone: break
    await pg.wait_for_timeout(2500); return (await pg.evaluate("GAME.G.zone")) == zone


async def bed(pg, cdp, run, prefix, label=''):
    if (await pg.evaluate("GAME.G.zone")) != 'dorm': await quick_go(pg, cdp, 'dorm')
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()")
    if not it: return None
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, '床', max_s=120, lv=it[2]); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1300)
    ops = []
    for _ in range(12):
        ops = await opts(pg)
        if ops: break
        await pg.wait_for_timeout(600)
    say('   %s 床：%s' % (label, ops))
    k = next((i for i, o in enumerate(ops) if o.startswith(prefix)), None)
    if k is not None: await tap_idx(pg, cdp, k); await pg.wait_for_timeout(2000)
    return ops


async def sleep_night(pg, cdp, run, label=''):
    st0 = await pg.evaluate(STATE); ops = await bed(pg, cdp, run, '睡到明天', label)
    ok, ch = await wait_for(pg, cdp, run, "GAME.G.day>%d&&!GAME.E.player.busy" % st0['day'], max_s=240, label=label)
    await pg.wait_for_timeout(4000)
    for _ in range(3): await drive(pg, cdp, run, max_s=40, label=label); await pg.wait_for_timeout(2500)
    return ops, ok


async def talk(pg, cdp, run, ids, names, picks=None, label=''):
    """走到那個人旁邊，互動鈕是「和〇〇說話」才按（names：她可能的稱呼，例：以安／小安），對話照 picks 點完（說完的「就這樣」）；回傳（選項紀錄, 互動鈕的字）"""
    lab = ''; name = names[0]; hit = lambda s: '說話' in s and any(n in s for n in names)
    for k in range(3):
        pos = await pg.evaluate(NPC + "(%s)" % json.dumps(ids))
        if not pos: say('   %s 不在這一區' % name); return None, ''
        await L.go_to(pg, cdp, run, pos[0], pos[1], 1.2, name, max_s=90, lv=pos[2])
        for j in range(6):
            lab = await pg.evaluate(LAB)
            if hit(lab): break
            pos = await pg.evaluate(NPC + "(%s)" % json.dumps(ids))
            if pos: await L.go_to(pg, cdp, run, pos[0], pos[1], 0.9, name, max_s=30, lv=pos[2])
            await pg.wait_for_timeout(500)
        say('   %s 互動鈕：「%s」' % (label, lab))
        if hit(lab):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
            ch = await drive(pg, cdp, run, picks=picks, max_s=150, label=label)
            return ch, lab
    return None, lab


def texts(log):
    return [x['t'] for x in log if x['n'] not in ('［選項］', '［字幕］', '［日期卡］')]


async def log_since(pg, n0):
    return (await pg.evaluate("window.__LOG||[]"))[n0:]


async def log_len(pg):
    return len(await pg.evaluate("window.__LOG||[]"))


async def msgs(pg, th):
    return await pg.evaluate(MSGS + "(%s)" % json.dumps(th))


async def dayk(pg, key):
    return await pg.evaluate("STORY.dayOfKey('%s')" % key)


async def launch(p, run, base, key, h, zone, preflags=None, rels=None, dating=(), flags=None, quiet=True, label=''):
    """路線旗標先寫進存檔再讀（日本、美國路線讀檔的地方才對）；讀檔後在頁面裡設關係、交往、其他旗標"""
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
    d = await dayk(pg, key)
    for k, kk in ROOMS:
        dd = await dayk(pg, kk)
        if dd <= d: F[k] = dd
    for k in list(F.keys()):
        if k.startswith('dating_') and k[7:] not in dating: F[k] = False
    F['KX_DEC3_MIGRATED'] = True
    for k, v in (preflags or {}).items(): F[k] = (await dayk(pg, v['$day'])) if isinstance(v, dict) and '$day' in v else v
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'money': max(G.get('money') or 0, 30000), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G, quiet_events=quiet); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(SETUP + "(%s)" % json.dumps([rels or {}, list(dating), flags or {}]))
    run.setup('[前置] %s：使用者存檔改到 %s %.2f %s（%s；讀檔前拿掉其他人的交往）；路線旗標 %s；關係 %s；交往 %s；旗標 %s → %s' % (
        label, key, h, zone, 'quiet_events' if quiet else '事件系統開著', json.dumps(preflags or {}, ensure_ascii=False), json.dumps(rels or {}, ensure_ascii=False),
        list(dating) or '—', json.dumps(flags or {}, ensure_ascii=False), json.dumps(r, ensure_ascii=False)))
    say('   %s 設定：%s' % (label, json.dumps(r, ensure_ascii=False)))
    return b, pg, cdp, errs, r


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


def guard(fn):
    async def w(p, run, base, sid, out):
        try: await fn(p, run, base, sid, out)
        except Exception as e: out.setdefault(sid, {})['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    return w


async def finish_page(run, tag, res, errs, b):
    res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % tag, not errs, json.dumps(errs[:3], ensure_ascii=False)); await close(b)


def J(x, n=400):
    return json.dumps(x, ensure_ascii=False)[:n]


async def settle(pg, cdp, run, label, rounds=3):
    """讀檔後如果有事件在演（換場景、淡入淡出中間 drive 會以為沒事），多等幾輪，直到連續一輪什麼都沒有"""
    for _ in range(rounds):
        ch = await drive(pg, cdp, run, max_s=90, label=label); await pg.wait_for_timeout(2500)
        s = await L.state(pg)
        if not ch and not s['dlg'] and not s['choices'] and not s.get('busy'): break



# 2026-10-22 wzshop：RELEASE-9106-TEST 第 13 項（溫州街四家店，WZ-SHOP-AA364-SYS，開發分支 a3d3845e；AA_364 第 2～4 節）
HOOK2 = """(()=>{ if(window.__LOGT) return; window.__LOGT=1; const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  if(GAME.toast){ const t0=GAME.toast; GAME.toast=function(a){ try{ (window.__LOG=window.__LOG||[]).push({n:'［提示］', t:String(a||''), at:at()}); }catch(e){} return t0.apply(this,arguments); }; } })()"""
MONEY = "(()=>GAME.G.money|0)()"
SEAT = "(()=>{ const P=GAME.E.player; return !!(P&&P.seat); })()"
IT = """(sel=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&(sel.to?(i.exit&&i.exit.to===sel.to):sel.shop?(i.wzShop===sel.shop):(i.label===sel.label))); return it?[+it.x.toFixed(2),+it.z.toFixed(2),it.label||'',it.lv|0]:null; })"""
LABELS = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>i.label||'').filter(Boolean))()"


def seq_in(T, want):
    i = 0
    for t in T:
        if i < len(want) and t == want[i]: i += 1
    return i == len(want)


async def use(pg, cdp, run, sel, label, sid, near=0.8):
    """走到那個互動點、按互動（照玩家：點地面走過去、按右下角的按鈕）；回傳 (找得到, 按鈕字, 互動點)"""
    it = await pg.evaluate(IT + "(%s)" % json.dumps(sel))
    if not it:
        say('   %s 找不到「%s」：現有 %s' % (sid, label, J(await pg.evaluate(LABELS), 500))); return False, '', None
    await L.go_to(pg, cdp, run, it[0], it[1], near, label, max_s=240, lv=it[3]); await pg.wait_for_timeout(800)
    lab = await pg.evaluate(LAB); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1800)
    return True, lab, it


async def order(pg, cdp, run, res, sid, sel, label, pick, expect_zone=None, picks_after=None):
    """點餐一次：記錢、時間、坐下、說的話。pick＝選單要選的字（None＝選「不用了」）"""
    m0 = await pg.evaluate(MONEY); st0 = await pg.evaluate(STATE); n0 = await log_len(pg)
    ok, lab, it = await use(pg, cdp, run, sel, label, sid)
    if not ok: return None
    seen_seat = False; ch = []; t0 = time.time()
    while time.time() - t0 < 150:
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        if await pg.evaluate(SEAT): seen_seat = True
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg); st = await pg.evaluate(STATE)
            want = (pick if pick else '不用了')
            k = next((i for i, o in enumerate(ops) if want in o), None)
            if k is None: k = pick_idx(ops, picks_after or [])
            ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
            say('   %s %s %.2f 選項 %s → %s' % (sid, st['key'], st['h'], [o[:14] for o in ops], ops[k][:16]))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); pick = None if pick and want in ops[k] else pick; continue
        if s['dlg']:
            if await pg.evaluate(SEAT): seen_seat = True
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s.get('busy'): await pg.wait_for_timeout(700); continue
        await pg.wait_for_timeout(1500)
        s2 = await L.state(pg)
        if not (s2['choices'] or s2['dlg'] or s2.get('busy')): break
    m1 = await pg.evaluate(MONEY); st1 = await pg.evaluate(STATE); lg = await log_since(pg, n0)
    r = {'lab': lab, 'it': it, 'money': [m0, m1, m0 - m1], 'h': [st0['h'], st1['h'], round(st1['h'] - st0['h'], 3)], 'zone': [st0['zone'], st1['zone']], 'seat': seen_seat,
         'said': [((x['n'] + '：') if x['n'] else '') + x['t'] for x in lg][-12:], 'ch': ch}
    res.setdefault('orders', []).append(r); say('   %s %s：%s' % (sid, label, J(r, 700))); await run.shot(pg, '%s_%s' % (sid, label))
    return r


def said_has(r, who, line):
    return any(x == '%s：%s' % (who, line) for x in (r or {}).get('said', []))


def opt_has(r, txt):
    return any(any(txt in o for o in c['opts']) for c in (r or {}).get('ch', []))


async def enter_shop(pg, cdp, run, res, sid, key, label):
    """溫州街走到店門口按「進去」：回傳 (進去了沒, 提示)"""
    n0 = await log_len(pg); ok, lab, it = await use(pg, cdp, run, {'to': 'wz_' + key}, label, sid)
    for _ in range(20):
        z = await pg.evaluate("GAME.G.zone")
        if z == 'wz_' + key: break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(4000); z = await pg.evaluate("GAME.G.zone"); lg = await log_since(pg, n0)
    toast = [x['t'] for x in lg if x['n'] == '［提示］']; res['door_' + key] = [ok, lab, z, toast]; say('   %s 門口「%s」→ %s %s' % (sid, lab, z, J(toast)))
    return z == 'wz_' + key, toast, lab


WZF = dict(TWF, **BASEF)
# AA_364 第 5 節（企劃線 2026-10-22 13:3x 補稿）：選「老樣子」的回答、第一次的旁白、吃完（一個人）的旁白
SAME = {'lin': ('老闆', '好。一樣。'), 'tei': ('店員', '好，一樣的定食。'), 'tea': ('店員', '好，一樣的。'), 'ice': ('老闆娘', '好。一樣的。')}
FIRST = {'lin': '（攤子前面只有三張小桌子。老闆煮麵的時候，沒有抬頭。）', 'tei': '（店裡只有八個位子。牆上貼著：「味噌湯免費續，但不要浪費。」）',
         'tea': '（窗口的菜單只有四樣。你點完，後面已經排了兩個人。）', 'ice': '（價目表是手寫的。芒果冰那一行旁邊，用紅筆寫著「六到八月」。）'}
AFTER = {'lin': '（你吃完的時候，老闆已經在煮下一碗了。）', 'tei': '（你續了一碗味噌湯。比第一碗還燙。）', 'tea': '（你拿著飲料，沿著溫州街走回去。）', 'ice': '（冰化得比你吃得快。最後幾口，你是用喝的。）'}
DAYS = {'WED': '2027-10-13', 'MON': '2027-10-11', 'TUE': '2027-10-12', 'JUN': '2028-06-13', 'MAY': '2028-05-16'}


@guard
async def s_lin(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, DAYS['WED'], 12.0, 'wenzhou', preflags=WZF, label=sid + '（2027-10-13（三）12:00 溫州街；營業 11:00～14:00）')
    try:
        await pg.evaluate(HOOK2); await settle(pg, cdp, run, sid)
        inside, toast, lab = await enter_shop(pg, cdp, run, res, sid, 'lin', '林家乾麵')
        run.check('%s：走到林家乾麵門口按「%s」進得去（wz_lin）' % (sid, lab), inside, J(res.get('door_lin')))
        if not inside: return
        await settle(pg, cdp, run, sid)
        o = await order(pg, cdp, run, res, sid, {'label': '點餐'}, '點餐', '乾麵（小）')
        run.check('%s：老闆「內用外帶？」→ 選單六樣（含 AA_364 第 5 節加的貢丸湯 30）＋「不用了」→ 乾麵（小）扣 40 元' % sid, bool(o) and said_has(o, '老闆', '內用外帶？') and o['money'][2] == 40 and opt_has(o, '滷蛋') and opt_has(o, '貢丸湯　30'), J(o, 600))
        run.check('%s：第一次的旁白「%s」、吃完「%s」（AA_364 第 5 節）' % (sid, FIRST['lin'][:12], AFTER['lin'][:12]), bool(o) and seq_in(o['said'], ['（你點了乾麵（小）。）', FIRST['lin'], AFTER['lin']]), J(o and o['said'], 500))
        run.check('%s：「（你點了乾麵（小）。）」、坐下吃（約 40 分鐘）、吃完站起來' % sid, bool(o) and '（你點了乾麵（小）。）' in o['said'] and o['seat'] and 0.55 <= o['h'][2] <= 0.9 and not await pg.evaluate(SEAT), J(o, 600))
        lk = await order(pg, cdp, run, res, sid, {'label': '看菜單'}, '看菜單', None)
        run.note('%s：看菜單 → %s' % (sid, J(lk and lk['said'], 300)))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_tei(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, DAYS['WED'], 18.0, 'wenzhou', preflags=WZF, label=sid + '（2027-10-13（三）18:00 溫州街；營業 17:30～20:30）')
    try:
        await pg.evaluate(HOOK2); await settle(pg, cdp, run, sid)
        inside, toast, lab = await enter_shop(pg, cdp, run, res, sid, 'teishoku', '巷子裡定食')
        run.check('%s：走到巷子裡定食門口按「%s」進得去（wz_teishoku）' % (sid, lab), inside, J(res.get('door_teishoku')))
        if not inside: return
        await settle(pg, cdp, run, sid)
        o = await order(pg, cdp, run, res, sid, {'label': '點餐'}, '點餐', '薑汁燒肉定食')
        run.check('%s：店員「幾位？這邊坐。」→ 薑汁燒肉定食扣 180 元、坐下吃' % sid, bool(o) and said_has(o, '店員', '幾位？這邊坐。') and o['money'][2] == 180 and o['seat'], J(o, 600))
        run.check('%s：點餐選單沒有「味噌湯續一碗」（AA_364 第 5 節第 5 點，企劃線 5ae04087：吃定食就有，不是單點）' % sid, bool(o) and not opt_has(o, '味噌湯'), J(o and o.get('ch'), 400))
        run.check('%s：第一次的旁白、吃完的旁白（AA_364 第 5 節）' % sid, bool(o) and seq_in(o['said'], ['（你點了薑汁燒肉定食。）', FIRST['tei'], AFTER['tei']]), J(o and o['said'], 500))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_closed(p, run, base, sid, out):
    """定食 20:45（關了）、林家週一、定食週二：門口按了進不去、提示寫開放時間"""
    res = out.setdefault(sid, {})
    case = {'TEI_LATE': ('teishoku', DAYS['WED'], 20.75, '巷子裡定食', '20:45'), 'LIN_MON': ('lin', DAYS['MON'], 12.0, '林家乾麵', '週一 12:00'), 'TEI_TUE': ('teishoku', DAYS['TUE'], 12.0, '巷子裡定食', '週二 12:00')}[sid]
    key, day, h, name, when = case
    b, pg, cdp, errs, r = await launch(p, run, base, day, h, 'wenzhou', preflags=WZF, label='%s（%s %s 溫州街）' % (sid, day, when))
    try:
        await pg.evaluate(HOOK2); await settle(pg, cdp, run, sid)
        inside, toast, lab = await enter_shop(pg, cdp, run, res, sid, key, name)
        run.check('%s：%s %s 進不去、提示寫開放時間（%s）' % (sid, name, when, J(toast, 120)), (not inside) and any('11:' in t or '17:' in t or '公休' in t or '開' in t for t in toast), J(res.get('door_' + key)))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_tea(p, run, base, sid, out):
    """巷口茶飲：騎樓窗口連買五杯——前四杯「甜度冰塊？」，第五杯「半糖少冰？」、選單多「老樣子」"""
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, DAYS['WED'], 15.0, 'wenzhou', preflags=WZF, label=sid + '（2027-10-13（三）15:00 溫州街；茶飲每天 10:00～22:00）')
    try:
        await pg.evaluate(HOOK2); await settle(pg, cdp, run, sid)
        L5 = []
        for i in range(5):
            o = await order(pg, cdp, run, res, sid, {'shop': 'tea'}, '茶飲窗口%d' % (i + 1), '珍珠奶茶' if i < 4 else '老樣子')
            L5.append(o)
            if not o: break
        o1 = L5[0] if L5 else None
        run.check('%s：騎樓窗口「%s」：店員「甜度冰塊？」→ 珍珠奶茶扣 55 元、拿了就走（約 5 分鐘、沒坐下）' % (sid, (o1 or {}).get('lab', '')), bool(o1) and said_has(o1, '店員', '甜度冰塊？') and o1['money'][2] == 55 and not o1['seat'] and o1['h'][2] <= 0.2 and o1['zone'][1] == 'wenzhou', J(o1, 600))
        run.check('%s：第一杯：第一次的旁白、拿了走的旁白（AA_364 第 5 節）' % sid, bool(o1) and seq_in(o1['said'], ['（你點了珍珠奶茶。）', FIRST['tea'], AFTER['tea']]), J(o1 and o1['said'], 500))
        o5 = L5[4] if len(L5) == 5 else None
        run.check('%s：第 5 杯：店員換「半糖少冰？」、選單多「老樣子」→ 店員「好，一樣的。」、扣 55' % sid, bool(o5) and said_has(o5, '店員', '半糖少冰？') and opt_has(o5, '老樣子') and said_has(o5, '店員', '好，一樣的。') and o5['money'][2] == 55, J(o5, 600))
        run.check('%s：第 2～4 杯還是「甜度冰塊？」' % sid, all(o and said_has(o, '店員', '甜度冰塊？') and not opt_has(o, '老樣子') for o in L5[1:4]), J([o and o['said'][-3:] for o in L5[1:4]], 400))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_ice(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    day = {'ICE_JUN': DAYS['JUN'], 'ICE_MAY': DAYS['MAY'], 'ICE_OCT': DAYS['WED']}[sid]
    b, pg, cdp, errs, r = await launch(p, run, base, day, 15.0, 'wenzhou', preflags=WZF, label='%s（%s 15:00 溫州街）' % (sid, day))
    try:
        await pg.evaluate(HOOK2); await settle(pg, cdp, run, sid)
        labs = await pg.evaluate(LABELS); res['labels'] = [x for x in labs if '冰' in x or '飲料' in x]
        if sid == 'ICE_OCT':
            run.check('%s：10 月沒有「買一碗冰」、有「看夏日冰菓室」' % sid, '買一碗冰' not in labs and '看夏日冰菓室' in labs, J(res['labels']))
            n0 = await log_len(pg); ok, lab, it = await use(pg, cdp, run, {'label': '看夏日冰菓室'}, '看夏日冰菓室', sid); await pg.wait_for_timeout(2500)
            lg = await log_since(pg, n0); T = [x['t'] for x in lg]; res['look'] = T; await run.shot(pg, '%s_shutter' % sid)
            run.check('%s：「（鐵捲門拉著。上面貼了一張紙：「五月見」。）」' % sid, any('（鐵捲門拉著。上面貼了一張紙：「五月見」。）' in t for t in T), J(T, 300))
            return
        o = await order(pg, cdp, run, res, sid, {'shop': 'ice'}, '冰菓室窗口', '芒果冰' if sid == 'ICE_JUN' else '紅豆牛奶冰')
        if sid == 'ICE_JUN':
            run.check('%s：6 月：老闆娘「冰要大碗小碗？」、選單有芒果冰 140 → 扣 140、拿了就走' % sid, bool(o) and said_has(o, '老闆娘', '冰要大碗小碗？') and opt_has(o, '芒果冰') and o['money'][2] == 140 and not o['seat'], J(o, 600))
            run.check('%s：第一次的旁白、吃完的旁白（AA_364 第 5 節）' % sid, bool(o) and seq_in(o['said'], ['（你點了芒果冰。）', FIRST['ice'], AFTER['ice']]), J(o and o['said'], 500))
        else:
            run.check('%s：5 月：開了、沒有芒果冰（6～8 月才有）→ 紅豆牛奶冰扣 70' % sid, bool(o) and not opt_has(o, '芒果冰') and o['money'][2] == 70, J(o, 600))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_lin5(p, run, base, sid, out):
    """林家第 5 次：【捷徑】吃過的次數設成 4（G.eat.n），再照玩家點一次＝老闆「小的，不加辣。對吧。」、選單多「老樣子」"""
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, DAYS['WED'], 18.0, 'wenzhou', preflags=WZF, label=sid + '（2027-10-13（三）18:00 溫州街）')
    try:
        await pg.evaluate(HOOK2); await settle(pg, cdp, run, sid)
        pre = await pg.evaluate("(()=>{ const R=EAT.rec(GAME.G); R.n['林家乾麵']=4; R.last['林家乾麵']='乾麵（大）'; return {n:R.n['林家乾麵'], last:R.last['林家乾麵']}; })()")
        run.setup('[捷徑] %s：林家乾麵吃過 4 次、上次點乾麵（大）（EAT.rec）→ %s' % (sid, J(pre)))
        inside, toast, lab = await enter_shop(pg, cdp, run, res, sid, 'lin', '林家乾麵')
        if not inside: run.check('%s：進得去' % sid, False, J(res.get('door_lin'))); return
        await settle(pg, cdp, run, sid)
        o = await order(pg, cdp, run, res, sid, {'label': '點餐'}, '點餐', '老樣子')
        run.check('%s：第 5 次、上次點乾麵（大）：老闆「大的，不加辣。對吧。」（AA_364 第 5 節照上次點的換）、選單多「老樣子」→ 老闆「好。一樣。」、乾麵（大）扣 55' % sid, bool(o) and said_has(o, '老闆', '大的，不加辣。對吧。') and opt_has(o, '老樣子') and said_has(o, '老闆', '好。一樣。') and o['money'][2] == 55, J(o, 600))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_ice_old(p, run, base, sid, out):
    """冰菓室：【捷徑】吃過 4 次、上次點芒果冰；5 月（不是 6～8 月）點第 5 次＝老闆娘「又來了啊。」、選單沒有「老樣子」（買不到的不列，AA_364 第 5 節）"""
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, DAYS['MAY'], 15.0, 'wenzhou', preflags=WZF, label=sid + '（2028-05-16（二）15:00 溫州街）')
    try:
        await pg.evaluate(HOOK2); await settle(pg, cdp, run, sid)
        pre = await pg.evaluate("(()=>{ const R=EAT.rec(GAME.G); R.n['夏日冰菓室']=4; R.last['夏日冰菓室']='芒果冰'; return {n:R.n['夏日冰菓室'], last:R.last['夏日冰菓室']}; })()")
        run.setup('[捷徑] %s：夏日冰菓室吃過 4 次、上次點芒果冰（EAT.rec）→ %s' % (sid, J(pre)))
        o = await order(pg, cdp, run, res, sid, {'shop': 'ice'}, '冰菓室窗口', '綜合剉冰')
        run.check('%s：5 月第 5 次：老闆娘「又來了啊。」、沒有芒果冰也沒有「老樣子」→ 綜合剉冰扣 60' % sid, bool(o) and said_has(o, '老闆娘', '又來了啊。') and not opt_has(o, '老樣子') and not opt_has(o, '芒果冰') and o['money'][2] == 60, J(o, 600))
    finally: await finish_page(run, sid, res, errs, b)


ORDER = ['LIN', 'TEI', 'TEA', 'ICE_JUN', 'ICE_MAY', 'ICE_OCT', 'TEI_LATE', 'LIN_MON', 'TEI_TUE', 'LIN5', 'ICE_OLD']
FN = {'LIN': s_lin, 'TEI': s_tei, 'TEA': s_tea, 'ICE_JUN': s_ice, 'ICE_MAY': s_ice, 'ICE_OCT': s_ice, 'TEI_LATE': s_closed, 'LIN_MON': s_closed, 'TEI_TUE': s_closed, 'LIN5': s_lin5, 'ICE_OLD': s_ice_old}


async def main():
    run = L.Run('wzshop', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'wzshop.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    run.finish()

asyncio.run(main())
