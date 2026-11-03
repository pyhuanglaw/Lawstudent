# -*- coding: utf-8 -*-
"""BB（帳號 A）11-03：AA_609 學姊奶奶的晚餐（3/14 私訊邀約 → 3/17 18:30 公館）瀏覽器探針。
原本只有 Node（tests/aa609_sis_grandma_unit.js）測這一段；cc_aa609_grandma_probe 測的是奶奶第一次出場（學姊的畢業典禮）。
實作：src/r3_3d.js S.father（2029-03-14 21:00 私訊兩句＋回覆「好。」→ OUT.plan r3_sis_father 3/17 18:30 must）；src/data/r3_events.js FATHER（ev_sis_y4_father）。
流程（不用 ?turbo；Playwright 手機橫向模擬 844×390，SwiftShader，不是 iPhone）：
  A【前置／捷徑】最小存檔：2029-03-14（三）20:55 宿舍；用遊戲的 API 把學姊設成熟（fam 65／trust 50／comf 45）＋交往中（ROM.start）＋有聯絡方式；GAME.snapshot() 再讀一次（條件事件照開）。
    照玩家：等 21:00 她的私訊 → 按手機鈕 → 點她的對話 → 點回覆「好。」。
    檢查：①私訊兩句逐字；②回覆只有「好。」（AA_609 第 7 節：一定會去）；③回覆後她回「好。我跟她說。」「好。不用穿太正式。」；④排了 3/17 18:30 的出遊（must、標題「她奶奶的晚餐」）。
  B【捷徑】GAME.snapshot() 改成 3/17（六）18:00、在宿舍再讀一次（中間 3 天不演；不是玩家流程）。
    照玩家：等「出發：她奶奶的晚餐」選項 → 手指點 → 點對話框演完（選項點第一個）。
    檢查：⑤出發選單只有「出發」（must，沒有「不去了」）；⑥稿逐句（startswith、依序、說話人）；⑦記上 MET_SIS_FATHER、events.done；⑧整段畫面上沒有「爸」；沒有 JS 例外。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> python3 bb_aa609_dinner_probe.py '<URL>/index.html' <輸出資料夾>
exit 0＝ALL PASS；1＝有 FAIL。"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

URL0, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
J = lambda o: json.dumps(o, ensure_ascii=False)
WAIT_S = int(os.environ.get('WAIT_S', '900')); PLAY_S = int(os.environ.get('PLAY_S', '900'))
SIS = 'heroine_05'
ASK = ['我奶奶週六要請吃飯。', '她說叫你一起。六點半，公館。']
REPLY = ['好。我跟她說。', '好。不用穿太正式。']
EVID = 'ev_sis_y4_father'
EXPECT = [(None, '（公館的小館子。學姊的奶奶頭髮全白'), ('她奶奶', '你就是'), (None, '奶奶，他自己會夾。'), ('她奶奶', '好、好。'),
          ('她奶奶', '書瑀從小就自己決定事情。我都不管，她都做得很好。'), (None, '……奶奶。'), ('她奶奶', '下次再來。'), (None, '她很久沒有這麼開心了。')]
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'met_sis': True, 'SIS_W1': True}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'cvs', 'bookstore', 'dorm', 'dorm_hall', 'campus', 'classroom')
DAY_JS = "k=>{ const d=STORY.dayOfKey(k); if(d==null) return null; const c=CALENDAR.dateOf(d); return {d, wd:c.wd===7?0:c.wd, key:c.key}; }"
SOC = r"""(()=>{ const G=GAME.G, F=G.flags, id='heroine_05'; const R=SOCIAL.rel(id); R.fam=65; R.trust=50; R.comf=45; SOCIAL.remember(id,'FIRST_MET','');
  G.contacts=G.contacts||{}; G.contacts[id]=G.day-300; F.met_sis=true; F.SIS_W1=true; if(typeof ROM!=='undefined'&&ROM.start) ROM.start(G,id);
  const R0=(F.romance||{})[id]; return {stage:SOCIAL.stage(id), dating:F['dating_'+id]===true||!!(R0&&R0.status==='dating'), contact:typeof INV!=='undefined'&&INV.hasContact(G,id)}; })()"""
HOOK = r"""(()=>{ if(window.__DN) return 'again'; const W=window.__DN={scr:[],say:[],ev:[]};
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const watch=(id,kind,get)=>{ const el=document.getElementById(id); if(!el) return false; let last='';
    const rec=()=>{ const t=get(el); if((t||kind==='name')&&t!==last){ W.scr.push({k:kind,t,at:at()}); } last=t; };
    new MutationObserver(rec).observe(el,{childList:true,subtree:true,characterData:true,attributes:true}); return true; };
  const vis=el=>!el.classList.contains('hide');
  watch('caption','caption',el=>vis(el)?(el.textContent||'').trim():''); watch('dlgName','name',el=>(el.textContent||'').trim());
  watch('dlgText','text',el=>(el.textContent||'').trim()); watch('choices','choices',el=>vis(el)?[...el.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).join('｜'):'');
  watch('phoneBody','phone',el=>(el.textContent||'').trim().slice(0,400));
  const s0=GAME.say; GAME.say=function(w,t){ try{ W.say.push({n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t),at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const v0=EVENTS.run; EVENTS.run=function(ev){ try{ W.ev.push({id:String((ev&&ev.id)||''),at:at(),n:W.say.length}); }catch(e){} return v0.apply(this,arguments); };
  return true; })()"""
TS = r"""(()=>{ const D=GAME.D, ch=document.getElementById('choices'), dl=document.getElementById('dlg');
  return {dlg:!!(D&&D.active), name:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgName')||{}).textContent||'').trim():'',
    txt:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgText')||{}).textContent||'').trim():'',
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim()):[],
    busy:!!GAME.E.player.busy, depth:(D&&D.busyDepth)|0, phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()),
    h:+(+GAME.G.hour).toFixed(3), key:CALENDAR.dateOf(GAME.G.day).key, zone:GAME.G.zone}; })()"""
MSGS = "(()=>(GAME.G.msgs||[]).filter(m=>m.th==='p:heroine_05').map(m=>({d:CALENDAR.dateOf(m.day).key,h:+(+m.h||0).toFixed(2),from:m.from||'',text:String(m.text||''),ask:m.ask?m.ask.id:null})))()"
OUTQ = "(()=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>q.id==='r3_sis_father').map(q=>({d:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state,must:!!q.must,title:q.title||'',ev:q.ev})))()"
CHOICE_AT = "(k=>{ const b=document.querySelectorAll('#choices button'); const e=b[k]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })"


def url_for():
    base, _, q = URL0.partition('?'); ps = [x for x in q.split('&') if x and x != 'turbo']
    return base + ('?' + '&'.join(ps) if ps else '')


async def tap_choice(pg, cdp, k):
    c = await pg.evaluate(CHOICE_AT, k)
    if c: await L.touch_tap(cdp, c[0], c[1])
    return bool(c)


async def handle(pg, cdp, run, s, picks):
    """畫面上的一件事照玩家處理：選項點第一個、對話框點一下、手機自己打開就收起來"""
    if s['ch']:
        picks.append(s['ch']); await tap_choice(pg, cdp, 0); await pg.wait_for_timeout(1200); return True
    if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); return True
    return False


async def main():
    run = L.Run('aa609_dinner', OUT); os.makedirs(OUT, exist_ok=True)
    print('bb_aa609_dinner_probe  SHA=%s  URL=%s' % (SHA, url_for()), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        pg.set_default_timeout(180000)
        try:
            await pg.goto(url_for()); run.check('遊戲載入', await L.wait_loaded(pg))
            await pg.evaluate("localStorage.clear()")
            d = await pg.evaluate(DAY_JS, '2029-03-14')
            st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(BASEF),
                  'day': d['d'], 'weekday': d['wd'], 'hour': 20 + 55 / 60, 'zone': 'dorm', 'pos': None, 'weather': 'clear', 'stage': 'law', 'money': 30000,
                  'visited': {z: True for z in VISITED}}
            await pg.evaluate("(()=>{ window.__DNEV={a:EVENTS.onEnter,b:EVENTS.tick}; })()")
            await L.load_state(pg, st, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(3000)
            soc = await pg.evaluate(SOC)
            run.setup('最小存檔 %s（星期%s）20:55 宿舍；學姊熟＋交往中＋有聯絡方式：%s；GAME.snapshot() 再讀一次（條件事件照開）' % (d['key'], '日一二三四五六'[d['wd']], J(soc)))
            snap = await pg.evaluate("()=>GAME.snapshot()"); snap = snap.get('G', snap) if isinstance(snap, dict) else snap
            snap['hour'] = 20 + 55 / 60
            await pg.evaluate("localStorage.clear()")
            await pg.evaluate("(()=>{ EVENTS.onEnter=window.__DNEV.a; EVENTS.tick=window.__DNEV.b; })()")
            await pg.evaluate(HOOK)
            await L.load_state(pg, snap, quiet_events=False, quiet_phone=False); await pg.wait_for_timeout(3000)
            run.check('前置：學姊交往中、有聯絡方式', soc.get('dating') and soc.get('contact'), J(soc))
            # ---- A：等 21:00 的私訊
            t0 = time.time(); got = None; picks = []
            while time.time() - t0 < WAIT_S:
                m = await pg.evaluate(MSGS)
                if any(x['ask'] == 'r3_sis_father' for x in m): got = m; break
                s = await pg.evaluate(TS)
                if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); continue
                if not await handle(pg, cdp, run, s, picks): await pg.wait_for_timeout(1000)
            run.note('A 等私訊時遇到的選項：%s' % J(picks[-5:]))
            texts = [x['text'] for x in (got or [])]
            run.check('① 3/14 21:00 她的私訊兩句逐字：%s' % J(ASK), all(a in texts for a in ASK), J(got))
            # 照玩家：按手機 → 她的對話 → 回覆
            replies = []
            if got:
                await L.close_panels(pg, cdp)
                await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500)
                c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phoneTabs button, #phone button')].find(x=>(x.textContent||'').trim()==='訊息'); if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)   # 手機打開是「今天」，照玩家點「訊息」分頁
                if not await pg.evaluate("!!document.querySelector('#phoneBody [data-ask^=\"r3_sis_father|\"]')"):
                    await L.tap(pg, cdp, '#phoneBody [data-th="p:heroine_05"]'); await pg.wait_for_timeout(1500)
                replies = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-ask^=\"r3_sis_father|\"]')].map(b=>(b.textContent||'').trim())")
                await pg.screenshot(path=os.path.join(OUT, 'A_phone_ask.png'))
                if replies: await L.tap(pg, cdp, '#phoneBody [data-ask^="r3_sis_father|"]'); await pg.wait_for_timeout(3000)
                await pg.screenshot(path=os.path.join(OUT, 'A_phone_after.png'))
            run.check('② 回覆只有「好。」（AA_609 第 7 節：一定會去）', replies == ['好。'], J(replies))
            t1 = time.time()
            while time.time() - t1 < 60:
                tx = [x['text'] for x in await pg.evaluate(MSGS)]
                if all(r in tx for r in REPLY): break
                await pg.wait_for_timeout(1500)
            m2 = await pg.evaluate(MSGS)
            run.check('③ 回覆後她回 %s' % J(REPLY), all(r in [x['text'] for x in m2] for r in REPLY), J(m2[-4:]))
            await L.phone_away(pg, cdp, tries=2)
            t2 = time.time(); oq = []
            while time.time() - t2 < 60:
                oq = await pg.evaluate(OUTQ)
                if oq: break
                await pg.wait_for_timeout(1500)
            run.check('④ 排了 3/17 18:30 的出遊（must、「她奶奶的晚餐」、ev_sis_y4_father）',
                      bool(oq) and oq[0]['d'] == '2029-03-17' and oq[0]['h'] == 18.5 and oq[0]['must'] and oq[0]['title'] == '她奶奶的晚餐' and oq[0]['ev'] == EVID, J(oq))
            # ---- B：【捷徑】跳到 3/17 18:00
            d17 = await pg.evaluate(DAY_JS, '2029-03-17')
            snap2 = await pg.evaluate("()=>GAME.snapshot()"); snap2 = snap2.get('G', snap2) if isinstance(snap2, dict) else snap2
            snap2['day'] = d17['d']; snap2['weekday'] = d17['wd']; snap2['hour'] = 18.0; snap2['zone'] = 'dorm'; snap2['pos'] = None
            await L.load_state(pg, snap2, quiet_events=False, quiet_phone=True); await pg.wait_for_timeout(3000)
            run.setup('【捷徑】GAME.snapshot() 改成 %s（星期%s）18:00 宿舍再讀一次（3/15～3/16 不演）' % (d17['key'], '日一二三四五六'[d17['wd']]))
            t3 = time.time(); went = None; dep = None; picks = []
            while time.time() - t3 < WAIT_S:
                s = await pg.evaluate(TS)
                if s['ch']:
                    k = next((i for i, t in enumerate(s['ch']) if t.startswith('出發：') and '她奶奶的晚餐' in t), None)
                    if k is not None:
                        dep = s['ch']; await pg.screenshot(path=os.path.join(OUT, 'B_depart.png')); went = s['ch'][k]; await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500); break
                if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); continue
                if not await handle(pg, cdp, run, s, picks): await pg.wait_for_timeout(1000)
            run.check('⑤ 出現「出發：她奶奶的晚餐…」、用手指點了；出發選單只有這一個（must，沒有「不去了」「晚一點」）',
                      bool(went) and len(dep) == 1, J({'went': went, 'menu': dep, 'other': picks[-3:], 'clock': await pg.evaluate(TS)}))
            t4 = time.time(); last = None; since = time.time(); shot = False
            while went and time.time() - t4 < PLAY_S:
                s = await pg.evaluate(TS)
                done = await pg.evaluate("(id=>!!(((GAME.G.events||{}).done||{})[id]))", EVID)
                if done and not s['dlg'] and not s['ch'] and s['depth'] == 0 and not s['busy']: break
                sig = (s['txt'][:30], tuple(s['ch']), s['zone'], s['h'])
                if sig != last: last = sig; since = time.time()
                elif time.time() - since > 240: run.note('240 秒沒有變化：%s' % J(s)); await run.shot(pg, 'stuck'); break
                if s['dlg'] and s['name'] == '她奶奶' and not shot:
                    await pg.wait_for_timeout(1500); await pg.screenshot(path=os.path.join(OUT, 'B_grandma_land.png'))
                    await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(2000); await pg.screenshot(path=os.path.join(OUT, 'B_grandma_port.png'))
                    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(2000); shot = True
                if not await handle(pg, cdp, run, s, []): await pg.wait_for_timeout(900)
            await pg.wait_for_timeout(2500); await run.shot(pg, 'B_after')
            W = await pg.evaluate("(()=>window.__DN||{scr:[],say:[],ev:[]})()")
            with open(os.path.join(OUT, 'transcript.json'), 'w', encoding='utf-8') as f: json.dump(W, f, ensure_ascii=False, indent=1)
            evi = next((e for e in W['ev'] if e['id'] == EVID), None)
            says = W['say'][evi['n']:] if evi else []
            run.note('%s 的台詞：%s' % (EVID, J([[x['n'], x['t']] for x in says])))
            i = 0
            for want_n, want_t in EXPECT:
                j = next((k for k in range(i, len(says)) if says[k]['t'].startswith(want_t) or (want_t == '你就是' and says[k]['t'].startswith('你就是') and '來，多吃一點。' in says[k]['t'])), None)
                ok = j is not None and (want_n is None or says[j]['n'] == want_n)
                run.check('⑥ 稿逐句：%s「%s」（依序）' % (want_n or '', want_t), ok, J(None if j is None else [says[j]['n'], says[j]['t']]))
                if j is not None: i = j + 1
            nm = next((x for x in says if x['t'].startswith('你就是')), None)
            run.check('⑥ 「你就是{name}？」換成玩家的名字（祐廷）、沒有露出 {name}', bool(nm) and '祐廷' in nm['t'] and '{name}' not in nm['t'], J(nm))
            flags = await pg.evaluate("(()=>({MET:!!GAME.G.flags.MET_SIS_FATHER, done:!!(((GAME.G.events||{}).done||{})['ev_sis_y4_father']), mem:(typeof SOCIAL!=='undefined'&&SOCIAL.has)?SOCIAL.has('heroine_05','MET_SIS_FATHER'):null}))()")
            run.check('⑦ 演完：MET_SIS_FATHER、events.done、學姊的記憶 MET_SIS_FATHER', flags['MET'] and flags['done'] and flags['mem'] is not False, J(flags))
            bad = [r for r in W['scr'] if '爸' in r['t']]
            run.check('⑧ 整段畫面上（字幕、對話框、選項、手機）沒有「爸」（收到 %d 筆字）' % len(W['scr']), not bad and len(W['scr']) > 0, J(bad[:5]))
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
