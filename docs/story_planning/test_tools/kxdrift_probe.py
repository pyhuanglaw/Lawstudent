"""BB（帳號 A）2026-10-22：v9.10.6 預告清單（LAWWW 09:25）AA_351 可昕「個性磨合不了，慢慢分手」三條路（開發分支 e028fe50 起；AA_384 3c0a0ea9；任務 AA351-KX-DRIFT-1021）。
台詞照 AA_351 第 3 節（LAWWW 的 tests/aa351_kx_drift_unit.js 已逐字比對、各種條件）；這支看玩家實際走一遍：
  D0_TELL    做對：大二下 5/5（三）16:30，手機約另一位女主角去公館吃飯 → 她答應 →「（跟可昕說一聲）」→ 手機傳給可昕、她回 → KX_CRACK −1 → 吃完不排她的電話、21:15 都沒打來
  D0_SILENT  對照：同上選「（不說）」→ 吃完排 21:00 她的電話 →「接起來」→ 照稿 → 選「我忘了講。對不起。」＝不加
  REPAIR     修補成功：【前置】KX_CRACK 5、D2／D3 當作演過；【捷徑】console 加 1 到 6 → 當天 21:00 她約週五「山下那家」→ 回「好。」→ 週五 19:00 出發 → 照稿 → 選「我會改…」＝歸零、修補期 35 天；
             【捷徑】修補期結束日改成今天 → KX_REPAIRED；【前置】同一份存檔跳到下一週她的日子（週日）→ 見面完她說「這個月你都有先講。」
  SPLIT      分開：【前置】大二下期末考最後一天 20:45，KX_CRACK 6、D4 選了「是妳太容易生氣。」→ 21:00 她傳「明天晚上七點，我宿舍樓下。」→ 隔天 19:00 出發 → 照稿 → 選「……好。」→ 分開 → 到家手機自己打開「到了。」「嗯。」
【前置】讀使用者存檔改日期、時間、地點、關係（每個情境寫在 run.setup）；之後照玩家：手機約人、跳過時間、手機「地點」、床、回訊息、跳出來的「出發」「接起來」按下去。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=D0_TELL,... python3 kxdrift_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
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


async def go_cafe(pg, cdp, run, label):
    """手機「地點」進 Café；沒去成（事件還在演、手機被收走）就先演完再按，最多三次；回傳（到了沒, 第幾次）"""
    for k in range(3):
        if await quick_go(pg, cdp, 'cafe'): return True, k + 1
        st = await pg.evaluate(STATE); say('   %s 第 %d 次手機「地點」沒進 Café（%s）' % (label, k + 1, J(st)))
        await settle(pg, cdp, run, label)
    return False, 3


# 2026-10-22 aa296：HOOK 多記「提示」（GAME.toast，例：「手機響了。」）
HOOK2 = """(()=>{ if(window.__LOGT) return; window.__LOGT=1; const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  if(GAME.toast){ const t0=GAME.toast; GAME.toast=function(a){ try{ (window.__LOG=window.__LOG||[]).push({n:'［提示］', t:String(a||''), at:at()}); }catch(e){} return t0.apply(this,arguments); }; } })()"""
BASE0 = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True}
AN, ZQ, KX, PS, ZR = 'heroine_01', 'heroine_04', 'kexin', 'classmate_peishan', 'heroine_02'
SAID = "(()=>(window.__LOG||[]).map(x=>[x.n,x.t,x.at]))()"
FL = "(k=>{ const v=GAME.G.flags[k]; return v===undefined?null:v; })"
MEM = """(([id,tag])=>{ const s=GAME.G.social||{}, L=(s.mem&&s.mem[id])||[]; const m=L.find(x=>x.tag===tag); if(m) return m.note||''; try{ const M=SOCIAL.memories?SOCIAL.memories(id):[]; const x=(M||[]).find(y=>y.tag===tag); return x?(x.note||''):null; }catch(e){ return null; } })"""


def caps(log):
    return [x['t'] for x in log if x['n'] == '［字幕］']


def toasts(log):
    return [x['t'] for x in log if x['n'] == '［提示］']


def cards(log):
    return [x['t'] for x in log if x['n'] == '［日期卡］']


def chs(log):
    out = []
    for x in log:
        if x['n'] == '［選項］':
            try: out.append(json.loads(x['t']))
            except Exception: out.append(x['t'])
    return out


def seq_in(T, want):
    """want 的句子照順序出現在 T 裡（中間可以夾別的）"""
    i = 0
    for t in T:
        if i < len(want) and t == want[i]: i += 1
    return i == len(want)


async def bed2(pg, cdp, run, prefix, label='', home='dorm'):
    """這一區有床就用這一張（美國公寓也有）；沒有才回宿舍。prefix 依序找（字串或 tuple）"""
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()")
    if not it:
        await quick_go(pg, cdp, home)
        it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()")
    if not it: return None
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, '床', max_s=120, lv=it[2]); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1300)
    ops = []
    for _ in range(12):
        ops = await opts(pg)
        if ops: break
        await pg.wait_for_timeout(600)
    say('   %s 床：%s' % (label, ops))
    pre = prefix if isinstance(prefix, tuple) else (prefix,)
    k = next((i for p in pre for i, o in enumerate(ops) if o.startswith(p)), None)
    if k is not None: await tap_idx(pg, cdp, k); await pg.wait_for_timeout(2000)
    return ops, (ops[k] if k is not None else None)


async def sleep2(pg, cdp, run, prefix=('睡到明天',), label='', home='dorm'):
    st0 = await pg.evaluate(STATE); r = await bed2(pg, cdp, run, prefix, label, home)
    ops, got = r if r else ([], None)
    ok, ch = await wait_for(pg, cdp, run, "GAME.G.day>%d&&!GAME.E.player.busy" % st0['day'], max_s=300, label=label)
    await pg.wait_for_timeout(4000)
    for _ in range(3): await drive(pg, cdp, run, max_s=40, label=label); await pg.wait_for_timeout(2500)
    return ops, got, ok


async def post_ps_dm(pg):
    """【前置】消失期（2026-12-18～2027-08-06）你傳給沛珊的一則：2027-03-15 20:00「生日快樂」"""
    return await pg.evaluate("""(()=>{ const G=GAME.G, d=STORY.dayOfKey('2027-03-15'); PHONE.postAt(G,{th:'p:classmate_peishan',from:'player',text:'生日快樂'},d,20);
      delete G.flags.PS_BACK_READ; G.flags.dating_classmate_peishan=false; return (G.msgs||[]).filter(m=>m.th==='p:classmate_peishan'&&m.from==='player').map(m=>[CALENDAR.dateOf(m.day).key,m.h,m.text]); })()""")


async def outq(pg, rx):
    return await pg.evaluate(OUTQ + "(%s)" % json.dumps(rx))


async def wait_out(pg, cdp, run, oid, max_s, label, picks=None, also=None):
    cond = "(OUT.rec(GAME.G).some(q=>q.id===%s&&q.state!=='planned'))%s" % (json.dumps(oid), ('||(' + also + ')') if also else '')
    return await wait_for(pg, cdp, run, cond, max_s=max_s, picks=picks, go=('接起來',), label=label)


def prompts(ch):
    return [c for c in (ch or []) if any(o.startswith('接起來') for o in c['opts'])]


KX = 'kexin'
KD = """(()=>{ const G=GAME.G, F=G.flags, R=F.KX_DRIFT||null; return {crack:+F.KX_CRACK||0, dating:F.dating_kexin===true, ended:F.KX_ENDED||null, endedOn:F.KX_ENDED_ON!=null?CALENDAR.dateOf(F.KX_ENDED_ON).key:null, repaired:!!F.KX_REPAIRED,
  partners:(ROM.partners?ROM.partners(G):[]), on:!!(KXDRIFT.on&&KXDRIFT.on(G)), r4:R&&R.r4?R.r4.st:null, r4Pick:R?R.r4Pick:null, repairEnd:R&&R.repairEnd!=null?CALENDAR.dateOf(R.repairEnd).key:null,
  r5:R&&R.r5?{st:R.r5.st,how:R.r5.how||null,day:R.r5.day!=null?CALENDAR.dateOf(R.r5.day).key:null}:null, r1:R&&R.r1?{st:R.r1.st,area:R.r1.area}:null, log:R?(R.log||[]).slice(-6):[]}; })()"""
INVQ = """(who=>(GAME.G.invites||[]).filter(v=>v.who===who).map(v=>({id:v.id,state:v.state,place:v.place,zone:v.zone,d:CALENDAR.dateOf(v.day).key,day:v.day,h:+(+v.h).toFixed(3)})))"""


def kx_dm(ms):
    return [m for m in ms if m['from'] in ('player', 'kexin')]


async def kxd(pg):
    return await pg.evaluate(KD)


async def phone_invite(pg, cdp, run, who, place_pre, time_pre, d0_pick, label):
    """手機「朋友」→ who 的「約」→ 地點（place_pre 開頭）→ 時間（time_pre 開頭；改天＝照她說的那個時間）→ 她答應以後的「（跟可昕說一聲）／（不說）」照 d0_pick"""
    await phone_tab(pg, cdp, 'friends')
    got = await tap_sel_js(pg, cdp, "document.querySelector('#phoneBody [data-inv=\"%s\"]')" % who)
    if not got: await L.phone_away(pg, cdp); return None, []
    seen = []
    t0 = time.time()
    while time.time() - t0 < 180:
        if await phone_open(pg) and not (await L.state(pg))['choices']: await pg.wait_for_timeout(500)
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if not ops: await pg.wait_for_timeout(400); continue
            k = next((i for i, o in enumerate(ops) if o.startswith(place_pre)), None)
            if k is None: k = next((i for i, o in enumerate(ops) if o.startswith(time_pre)), None)
            if k is None: k = next((i for i, o in enumerate(ops) if o == d0_pick), None)
            if k is None and any(o.startswith(('好', '那就')) for o in ops): k = next(i for i, o in enumerate(ops) if o.startswith(('好', '那就')))   # 改天：答應她說的時間
            if k is None: k = next((i for i, o in enumerate(ops) if o.startswith('今天')), None)
            if k is None: k = 0
            seen.append({'opts': ops, 'pick': ops[k]}); say('   %s 約：%s → %s' % (label, [o[:14] for o in ops], ops[k][:16]))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200)
            if ops[k] == d0_pick: break
            continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if seen and not s.get('busy'):
            await pg.wait_for_timeout(1500)
            s2 = await L.state(pg)
            if not s2['choices'] and not s2['dlg']: break
        await pg.wait_for_timeout(600)
    await drive(pg, cdp, run, max_s=60, label=label)
    if await phone_open(pg): await L.phone_away(pg, cdp)
    return got, seen


async def to_dinner(pg, cdp, run, who, sid, res):
    """約好的那一場：跳過時間（停在約好的時間前 10 分鐘）→ 手機「地點」到那個地方 → 兩個人都在＝直接開始 → 演完"""
    iv = [v for v in await pg.evaluate(INVQ + "(%s)" % json.dumps(who)) if v['state'] in ('accepted', 'going')]
    res['iv'] = iv
    if not iv: return False
    v = iv[-1]; st = await pg.evaluate(STATE)
    for _ in range(3):   # 改天的：睡到那一天
        if st['day'] >= v['day']: break
        await sleep2(pg, cdp, run, ('睡到明天',), sid); st = await pg.evaluate(STATE)
    if st['day'] == v['day'] and st['h'] < v['h'] - 0.3:
        for pre in ('等到傍晚', '等到下午', '等到晚上'):
            got = await skip(pg, cdp, pre, sid)
            st = await pg.evaluate(STATE)
            if got or st['h'] >= v['h'] - 0.3: break
    res['at_skip'] = await pg.evaluate(STATE)
    ok = await quick_go(pg, cdp, v['zone']); res['go_zone'] = [ok, v['zone']]
    done, ch = await wait_for(pg, cdp, run, "(GAME.G.invites||[]).some(x=>x.id===%s&&x.state==='done')" % json.dumps(v['id']), max_s=600, label=sid)
    await drive(pg, cdp, run, max_s=90, label=sid)
    res['iv_end'] = await pg.evaluate(INVQ + "(%s)" % json.dumps(who)); res['after_dinner'] = await pg.evaluate(STATE)
    return done


D0 = {'opt': '（跟可昕說一聲）', 'no': '（不說）', 'reply0': '好。吃完跟我說好不好吃。'}
R1 = {'ring': '（手機響了。可昕。）', 'where': '你今天在公館？', 'lines': ['予樂說看到你，跟一個女生。', '她是誰不重要。你為什麼沒跟我講？'],
      'opts': ['「我忘了講。對不起。」', '「只是一起吃飯。」', '「妳想太多了吧。」'], 'r0': ['……好。下次講。', '（電話掛得很快。）']}
D0_WHO = ['heroine_01', 'heroine_03', 'heroine_04']
D0F = dict(TWF, **BASE0, KX_OUR_DAY={'day': 'sun', 'mode': 'mid'}, KX_DEC3_MIGRATED=True)


@guard
async def s_d0(p, run, base, sid, out):
    tell = sid == 'D0_TELL'; res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-05-05', 16.5, 'dorm', preflags=D0F, rels={'heroine_01': 'FRIEND', 'heroine_03': 'FRIEND', 'heroine_04': 'FRIEND', KX: 'CLOSE'},
                                       dating=(KX,), label=sid + '（大二下第 11 週；和可昕交往中（只和她）；2027-05-05（三）16:30 宿舍）')
    try:
        await pg.evaluate(HOOK2); await pg.evaluate("(()=>{ const F=GAME.G.flags; F.KX_CRACK=1; delete F.KX_DRIFT; KXDRIFT.rec(GAME.G); })()"); k0 = await kxd(pg); res['k0'] = k0
        run.setup('[前置] %s：KX_CRACK＝1（看得到「說了 −1」）；以安、語彤、子晴 FRIEND；可昕 CLOSE、交往中 → %s' % (sid, J(k0)))
        run.check('%s：讀檔後「慢慢分手」那一套有開（只和可昕交往、大二下）' % sid, k0['on'] and k0['partners'] == [KX], J(k0))
        n0 = await log_len(pg); who = None; seen = []
        for w in D0_WHO:
            got, seen = await phone_invite(pg, cdp, run, w, '去公館吃飯', '今天', D0['opt'] if tell else D0['no'], sid)
            if [v for v in await pg.evaluate(INVQ + "(%s)" % json.dumps(w)) if v['state'] in ('accepted', 'going')]: who = w; break
            say('   %s 約 %s 沒成（%s）' % (sid, w, J(seen, 300)))
        res['who'] = who; res['seen'] = seen; L1 = await log_since(pg, n0)
        run.check('%s：手機約一位女主角去公館吃飯，她答應了（%s）' % (sid, who), bool(who), J(seen, 500))
        if not who: return
        d0o = [c for c in seen if D0['opt'] in c['opts']]
        run.check('%s：她答應以後跳出「%s」「%s」兩個選項' % (sid, D0['opt'], D0['no']), bool(d0o) and d0o[0]['opts'] == [D0['opt'], D0['no']], J(seen, 500))
        await pg.wait_for_timeout(4000)
        th = kx_dm(await msgs(pg, 'p:kexin')); k1 = await kxd(pg); res['after_d0'] = [th[-4:], k1]
        mine = [m for m in th if m['from'] == 'player' and '吃飯' in m['text']]
        if tell:
            run.check('%s：說了＝手機傳給可昕「（今天／明天／週○）我跟…去阿鳳麵店吃飯。」（%s）' % (sid, mine[-1]['text'] if mine else '—'), bool(mine) and bool(re.match(r'^(今天|明天|週.)我跟.+去阿鳳麵店吃飯。$', mine[-1]['text'])), J(th[-4:]))
            ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='p:kexin'&&m.from==='kexin'&&m.text===%s)" % json.dumps(D0['reply0']), max_s=240, label=sid)
            run.check('%s：她回「%s」' % (sid, D0['reply0']), ok, J(kx_dm(await msgs(pg, 'p:kexin'))[-3:]))
            run.check('%s：說了＝KX_CRACK 1→0' % sid, k1['crack'] == 0, J(k1))
        else:
            run.check('%s：沒說＝沒有傳給可昕、KX_CRACK 照舊 1' % sid, not mine and k1['crack'] == 1, J(res['after_d0']))
        done = await to_dinner(pg, cdp, run, who, sid, res)
        run.check('%s：約好的時間到公館、兩個人都在＝直接開始，吃完（%s）' % (sid, J(res.get('iv_end'), 200)), done, J({'iv': res.get('iv'), 'skip': res.get('at_skip'), 'go': res.get('go_zone'), 'end': res.get('iv_end')}, 600))
        await pg.wait_for_timeout(3000)
        q1 = await outq(pg, '^kx_drift_r1'); k2 = await kxd(pg); res['r1_out'] = [q1, k2]
        if tell:
            run.check('%s：說了＝吃完不排她的電話（沒有 kx_drift_r1）' % sid, not q1, J(res['r1_out']))
        else:
            run.check('%s：沒說、在公館＝吃完排了她的電話（21:00 或吃完後 30 分鐘）' % sid, bool(q1) and q1[0]['state'] == 'planned' and q1[0]['h'] >= 21 - 1e-6, J(res['r1_out']))
        n1 = await log_len(pg); st = await pg.evaluate(STATE)
        if st['h'] < 19.8: await skip(pg, cdp, '等到晚上', sid)
        if tell:
            await wait_for(pg, cdp, run, "GAME.G.hour>=21.25||GAME.G.day>%d" % st['day'], max_s=900, label=sid)
            T = texts(await log_since(pg, n1)); q2 = await outq(pg, '^kx_drift_r1')
            run.check('%s：待到 21:15 沒有她的電話' % sid, R1['ring'] not in T and not q2, J({'said': T[-6:], 'out': q2}))
        else:
            d = st['day']
            ok, ch = await wait_out(pg, cdp, run, 'kx_drift_r1_%d' % d, 900, sid, picks=[R1['opts'][0]])
            await drive(pg, cdp, run, picks=[R1['opts'][0]], max_s=120, label=sid)
            L2 = await log_since(pg, n1); T = texts(L2); pr = prompts(ch); res['call'] = {'said': T, 'prompt': pr}
            run.check('%s：21:00 問「接起來：可昕打電話來」（%s）' % (sid, J(pr[:1], 160)), bool(pr) and pr[0]['opts'][0] == '接起來：可昕打電話來', J(pr))
            oc = [c for c in chs(L2) if isinstance(c, list) and c == R1['opts']]
            run.check('%s：電話照稿：「%s」「%s」「%s」「%s」→ 三個選項 → 選「%s」→「%s」「%s」' % (sid, R1['ring'], R1['where'], R1['lines'][0], R1['lines'][1], R1['opts'][0], R1['r0'][0], R1['r0'][1]),
                      seq_in(T, [R1['ring'], R1['where']] + R1['lines'] + R1['r0']) and bool(oc), J({'said': T, 'opts': chs(L2)}, 900))
            k3 = await kxd(pg); res['after_call'] = k3
            run.check('%s：選「我忘了講。對不起。」＝KX_CRACK 不加（還是 1）' % sid, k3['crack'] == 1, J(k3))
        await run.shot(pg, '%s_end' % sid)
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- 修補成功（D4 →「我會改」→ 修補期 → 下一次「我們的日子」）
R4 = {'ask': '週五晚上，山下那家。有事要講。', 'lines': ['我們最近是不是一直在吵？', '我知道我脾氣不好。', '可是你也一直讓我猜。猜你在哪、跟誰、會不會遲到。', '……我不想再猜了。'],
      'opts': ['「我會改。先講、準時、妳生氣我當天就打給妳。」', '「我們都太忙了。」', '「是妳太容易生氣。」'], 'r0': ['你講的喔。', '（她把你碗裡的湯餃夾走一顆。）']}
REPAIR_LINE = '這個月你都有先講。'
DRIFT_PRE = """(([crack,extra])=>{ const G=GAME.G, F=G.flags, t=G.day*24+(+G.hour||0); F.KX_CRACK=crack; delete F.KX_DRIFT; const R=KXDRIFT.rec(G);
  R.th={2:t-200,4:t-100}; R.r2={st:'done'}; R.r3={st:'done'}; R.r1Term='Y2S2'; Object.assign(R,extra||{}); return {crack:F.KX_CRACK, th:R.th, on:KXDRIFT.on(G)}; })"""


@guard
async def s_repair(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-05-06', 20.75, 'dorm', preflags=D0F, rels={KX: 'CLOSE'}, dating=(KX,), label=sid + '（大二下第 11 週；和可昕交往中；2027-05-06（四）20:45 宿舍）')
    try:
        await pg.evaluate(HOOK2)
        pre = await pg.evaluate(DRIFT_PRE + "([5,null])"); res['pre'] = pre
        run.setup('[前置] %s：KX_CRACK＝5；2、4 那兩階（D2 短回覆、D3 視訊）當作已經演過 → %s' % (sid, J(pre)))
        run.note('%s：【捷徑】console KXDRIFT.add(G,1)＝第 6 階（遊戲裡是遲到、沒說、吵架累積上來的）' % sid)
        await pg.evaluate("KXDRIFT.add(GAME.G,1,'bb_test')"); k0 = await kxd(pg); res['k0'] = k0
        run.check('%s：到 6＝D4 等著（r4 pending）' % sid, k0['crack'] == 6 and k0['r4'] in ('pending', 'asked'), J(k0))
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.tag==='kx_drift_r4_ask')", max_s=600, label=sid)
        th = [m for m in await msgs(pg, 'p:kexin') if m['tag'] == 'kx_drift_r4_ask']; res['ask'] = th
        run.check('%s：當天 21:00 她傳「%s」（選項：好。／那天不行。）' % (sid, R4['ask']), ok and bool(th) and th[0]['text'] == R4['ask'] and th[0]['ask'] == ['好。', '那天不行。'] and th[0]['d'] == '2027-05-06' and abs(th[0]['h'] - 21) < 0.05, J(th))
        got = await answer(pg, cdp, run, 'p:kexin', 'kx_drift_r4_ask', '好。', sid)
        ok2, _ = await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='kx_drift_r4'&&q.state==='planned')", max_s=120, label=sid)
        q = await outq(pg, '^kx_drift_r4'); res['plan'] = q
        run.check('%s：回「好。」＝排 5/7（五）19:00「和可昕：政大・山下的小吃街」' % sid, ok2 and bool(q) and q[0]['d'] == '2027-05-07' and abs(q[0]['h'] - 19) < 0.01, J(q))
        ops, gotb, okw = await sleep2(pg, cdp, run, ('睡到明天',), sid); res['bed'] = ops
        n0 = await log_len(pg)
        for pre_ in ('等到傍晚', '等到晚上'):
            st = await pg.evaluate(STATE)
            if st['h'] >= 18: break
            await skip(pg, cdp, pre_, sid)
        st = await pg.evaluate(STATE); res['stop'] = st
        ok3, ch = await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='kx_drift_r4'&&q.state!=='planned')", max_s=900, go=('出發',), picks=[R4['opts'][0]], label=sid)
        await drive(pg, cdp, run, picks=[R4['opts'][0]], max_s=150, label=sid)
        L1 = await log_since(pg, n0); T = texts(L1); res['said'] = T; k1 = await kxd(pg); res['k1'] = k1
        go = [c for c in (ch or []) if any(o.startswith('出發') for o in c['opts'])]
        run.check('%s：5/7 傍晚跳「出發：和可昕：政大・山下的小吃街」（%s）' % (sid, go[0]['at'] if go else '—'), bool(go) and go[0]['at'].startswith('2027-05-07'), J({'go': go, 'stop': st}, 500))
        oc = [c for c in chs(L1) if isinstance(c, list) and c == R4['opts']]
        run.check('%s：字幕「政大・山下的小吃街」；她四句照稿 → 三個選項 → 選「%s」→「%s」「%s」' % (sid, R4['opts'][0], R4['r0'][0], R4['r0'][1]),
                  '政大・山下的小吃街' in caps(L1) and seq_in(T, R4['lines'] + R4['r0']) and bool(oc), J({'caps': caps(L1), 'said': T, 'opts': chs(L1)}, 900))
        run.check('%s：選「我會改…」＝歸零（KX_CRACK 0）、進修補期（35 天到 6/11）' % sid, k1['crack'] == 0 and k1['r4Pick'] == 0 and k1['repairEnd'] == '2027-06-11', J(k1))
        await run.shot(pg, '%s_r4' % sid)
        # 修補期 35 天：【捷徑】結束日改成今天 → 下一次手機規則記 KX_REPAIRED
        run.note('%s：【捷徑】修補期結束日改成今天（遊戲裡要過 35 天、中間沒有再到 6）' % sid)
        await pg.evaluate("(()=>{ const R=GAME.G.flags.KX_DRIFT; R.repairEnd=GAME.G.day; })()")
        ok4, _ = await wait_for(pg, cdp, run, "GAME.G.flags.KX_REPAIRED===true", max_s=120, label=sid)
        k2 = await kxd(pg); res['k2'] = k2
        run.check('%s：修補期結束時 <6＝KX_REPAIRED（沒有分開）' % sid, ok4 and k2['dating'] and k2['ended'] is None, J(k2))
        # 下一次「我們的日子」：【前置】同一份存檔跳到下一週的週日 12:00（她的日子＝週日 14:00；D4 那一週有她的出遊＝那一週不排）
        snap = await pg.evaluate("JSON.parse(JSON.stringify(GAME.G))")
        d16 = await dayk(pg, '2027-05-16'); snap.update({'day': d16, 'hour': 12.0, 'zone': 'dorm', 'pos': None, 'weekday': 0})
        await L.load_state(pg, snap, quiet_events=False); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK); await pg.evaluate(HOOK2)
        run.setup('[前置] %s：同一份存檔（D4 演完、KX_REPAIRED）跳到 2027-05-16（日）12:00 宿舍：下一週她的日子（週日 14:00）' % sid)
        n1 = await log_len(pg); qo = await outq(pg, '^kx_od_'); res['od'] = qo
        ok5, ch5 = await wait_for(pg, cdp, run, "(window.__LOG||[]).some(x=>x.t===%s)||OUT.rec(GAME.G).some(q=>/^kx_od_/.test(q.id)&&q.day===%d&&q.state==='done')" % (json.dumps(REPAIR_LINE), d16), max_s=900, go=('出發',), label=sid)
        await drive(pg, cdp, run, max_s=90, label=sid)
        L2 = await log_since(pg, n1); T2 = texts(L2); res['od_said'] = T2; qo2 = await outq(pg, '^kx_od_')
        run.check('%s：5/16 的「我們的日子」見面完，她說「%s」（一次）' % (sid, REPAIR_LINE), T2.count(REPAIR_LINE) == 1, J({'said': T2[-10:], 'od': qo2}, 700))
        await run.shot(pg, '%s_od' % sid)
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- 分開（D5：期末考最後一天 21:00 → 隔天 19:00 政大宿舍樓下）
R5 = {'ask': '明天晚上七點，我宿舍樓下。', 'talk': ['我想了一個禮拜。', '我們分開好不好。', '我不想每次見面，都在算你又遲到幾分鐘。', '你應該也不想每次都在猜我為什麼生氣。'],
      'opts': ['「再試一次？」', '「……好。」', '（不說話）'], 'r1': ['嗯。', '（她點頭，很久沒說話。）'], 'close': ['我先上去了。', '到家傳一下。這個我還是想知道。'], 'home': ['到了。', '嗯。']}


@guard
async def s_split(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-06-07', 12.0, 'dorm', preflags=D0F, rels={KX: 'CLOSE'}, dating=(KX,), label=sid + '（大二下期末考週；和可昕交往中）')
    try:
        ex = await pg.evaluate("(()=>{ const d=KXDRIFT.examDay(GAME.G,'Y2S2'); return d==null?null:{day:d,key:CALENDAR.dateOf(d).key}; })()"); res['exam'] = ex
        run.check('%s：讀到期末考最後一天（%s）' % (sid, J(ex)), bool(ex), J(ex))
        if not ex: return
        snap = await pg.evaluate("JSON.parse(JSON.stringify(GAME.G))"); snap.update({'day': ex['day'], 'hour': 20.75, 'zone': 'dorm', 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % ex['day'])})
        await L.load_state(pg, snap, quiet_events=True); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK); await pg.evaluate(HOOK2)
        pre = await pg.evaluate(DRIFT_PRE + "([6,{r4:{st:'done'},r4Pick:2}])")
        await pg.evaluate("(()=>{ const G=GAME.G, R=G.flags.KX_DRIFT, t=G.day*24+(+G.hour||0); R.th[6]=t-50; R.r5={st:'pending',at:t,via:'r4'}; })()"); k0 = await kxd(pg); res['k0'] = [pre, k0]
        run.setup('[前置] %s：%s（期末考最後一天）20:45 宿舍；KX_CRACK＝6、D4 選了「是妳太容易生氣。」（等 D5）→ %s' % (sid, ex['key'], J(k0)))
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>/^kx_drift_r5_msg/.test(m.tag||''))", max_s=600, label=sid)
        m = [x for x in await msgs(pg, 'p:kexin') if x['tag'].startswith('kx_drift_r5_msg')]; q = await outq(pg, '^kx_drift_r5'); res['ask'] = [m, q]
        run.check('%s：期末考最後一天 21:00 她傳「%s」' % (sid, R5['ask']), ok and bool(m) and m[0]['text'] == R5['ask'] and m[0]['d'] == ex['key'] and abs(m[0]['h'] - 21) < 0.05, J(m))
        run.check('%s：排隔天 19:00「和可昕：政大・宿舍樓下」' % sid, bool(q) and q[0]['day'] == ex['day'] + 1 and abs(q[0]['h'] - 19) < 0.01 and q[0]['state'] == 'planned', J(q))
        await sleep2(pg, cdp, run, ('睡到明天',), sid)
        n0 = await log_len(pg)
        for pre_ in ('等到傍晚', '等到晚上'):
            st = await pg.evaluate(STATE)
            if st['h'] >= 18: break
            await skip(pg, cdp, pre_, sid)
        ok3, ch = await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='kx_drift_r5'&&q.state!=='planned')", max_s=900, go=('出發',), picks=[R5['opts'][1]], label=sid)
        await drive(pg, cdp, run, picks=[R5['opts'][1]], max_s=150, label=sid)
        ok4, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.tag==='kx_drift_r5_home')", max_s=240, label=sid)
        await pg.wait_for_timeout(1500); await run.shot(pg, '%s_home_phone' % sid)
        L1 = await log_since(pg, n0); T = texts(L1); res['said'] = T; k1 = await kxd(pg); res['k1'] = k1
        go = [c for c in (ch or []) if any(o.startswith('出發') for o in c['opts'])]
        run.check('%s：隔天傍晚跳「出發：和可昕：政大・宿舍樓下」' % sid, bool(go), J(go))
        oc = [c for c in chs(L1) if isinstance(c, list) and c == R5['opts']]
        run.check('%s：字幕「政大・宿舍樓下」；她四句照稿 → 三個選項 → 選「%s」→「%s」「%s」→「%s」「%s」' % (sid, R5['opts'][1], R5['r1'][0], R5['r1'][1], R5['close'][0], R5['close'][1]),
                  '政大・宿舍樓下' in caps(L1) and seq_in(T, R5['talk'] + R5['r1'] + R5['close']) and bool(oc), J({'caps': caps(L1), 'said': T, 'opts': chs(L1)}, 900))
        run.check('%s：分開了：不再交往、KX_ENDED drift、分開那天記好' % sid, not k1['dating'] and k1['ended'] == 'drift' and k1['endedOn'] == (await pg.evaluate("CALENDAR.dateOf(%d).key" % (ex['day'] + 1))), J(k1))
        th = kx_dm(await msgs(pg, 'p:kexin'))
        run.check('%s：到家手機自己打開她那一段：你傳「%s」、她回「%s」' % (sid, R5['home'][0], R5['home'][1]), ok4 and [x['text'] for x in th[-2:]] == R5['home'] and th[-2]['from'] == 'player', J(th[-3:]))
    finally: await finish_page(run, sid, res, errs, b)


ORDER = ['D0_TELL', 'D0_SILENT', 'REPAIR', 'SPLIT']
FN = {'D0_TELL': s_d0, 'D0_SILENT': s_d0, 'REPAIR': s_repair, 'SPLIT': s_split}


async def main():
    run = L.Run('kxdrift', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'kxdrift.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
