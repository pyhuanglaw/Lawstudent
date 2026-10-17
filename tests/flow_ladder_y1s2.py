"""真實玩家流程（第 2 級，局部瀏覽器；手機模擬，不是實機）：大一下的閒聊階梯對話框（QA-HANDOFF-B1 最後一項）。
[前置] 讀檔到大一下第 5 週的某個時段、某個區域（找得到有下一層階梯的人為止）；[前置] 那個人設成見過、有點熟、門檻台詞聽過了（階梯要見過面；升階那次只說門檻台詞）；
[前置] 玩家放到那個人旁邊 1.2 公尺（瞬移，不測走路）→ 之後全部像玩家一樣：點互動按鈕「和○○說話」→ 點對話框 → 選項按鈕（點第一個）→ 對話結束。
檢查（橫向 844×390、直向 390×844 各一次）：
- 對話框和選項都在畫面裡（沒有被切掉、按鈕至少 44px 高、字不是空的）；
- 播的就是那一層的台詞（STORY.ladLines 的第一句出現在對話框）；
- 對話結束後階梯往前一層（G.social.ladder 加一）、玩家可以再動（不是卡在對話裡）；
- 沒有 JS 錯誤。
用法：python3 tests/flow_ladder_y1s2.py http://127.0.0.1:8765/index.html [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_ladder_y1s2'
TRIES = [('campus', 12.4, 2), ('campus', 17.6, 3), ('linze', 12.2, 4), ('library_hall', 15.0, 2), ('cafe', 20.0, 3), ('dorm', 21.5, 1)]

FIND_JS = """(()=>{ const G=GAME.G, out=[]; for(const id of Object.keys(GAME.npc||{})){ const n=GAME.npc[id]; if(!n||!n.obj||n.staff) continue; const cid=n.charId||id; if(!STORY.ladData(G,cid)) continue;
    if(!SOCIAL.has(cid,'FIRST_MET')) SOCIAL.meet(cid,'x'); const r=SOCIAL.rel(cid); if((r.fam|0)<25) r.fam=25; for(let U,k=0;k<4&&(U=SOCIAL.upLine(cid));k++) SOCIAL.markUp(cid,U.k);   /* 門檻台詞當作已經聽過（不然這次只說那一句、不走階梯）*/
    n.name=SOCIAL.displayName(cid); n.talkLabel='和'+n.name+'說話';   /* 生成時記的按鈕字（那時還不認識）照遊戲的做法換成名字 */
    const st=STORY.ladData(G,cid)?STORY.ladNext(G,cid):null; if(st) out.push({id:cid,key:id,step:st.id,first:(STORY.ladLines(st,G,cid)[0]||''),choices:STORY.ladChoices(st).length,chTexts:STORY.ladChoices(st).map(c=>c.t),name:(CHARACTERS[cid]||{}).name||cid,moving:!!(n.path&&n.path.length),pose:n.pose,x:n.obj.position.x,z:n.obj.position.z}); }
  return out; })()"""

PLACE_JS = """(t=>{ const E=GAME.E, n=GAME.npc[t.key], others=E.npcs.filter(m=>m!==n&&m.obj).map(m=>m.obj.position), out=[]; n.path=null; n.speed=0;
    for(const r of [1.1,1.4,1.8]) for(let k=0;k<16;k++){ const a=k*Math.PI/8, x=n.obj.position.x+Math.sin(a)*r, z=n.obj.position.z+Math.cos(a)*r; if(!(E.nav&&E.nav.clear&&E.nav.clear(x,z,0.35))) continue;
      const near=others.length?Math.min(...others.map(o=>Math.hypot(o.x-x,o.z-z))):99; out.push([x,z,near-r]); }
    return out.sort((a,b)=>b[2]-a[2]).slice(0,8); })(%s)"""

PUT_JS = """(a=>{ const P=GAME.E.player, n=GAME.npc[a[2]]; n.path=null; n.speed=0; P.obj.position.x=a[0]; P.obj.position.z=a[1]; P.path=null; P.obj.rotation.y=Math.atan2(n.obj.position.x-a[0],n.obj.position.z-a[1]); })(%s)"""

LAD_JS = "(id=>{ const D=STORY.ladData(GAME.G,id); const K=D?D.key:id; return ((GAME.G.social||{}).ladder||{})[K]|0; })(%s)"

BOX_JS = """(()=>{ const vw=innerWidth, vh=innerHeight, inV=r=>r.width>0&&r.height>0&&r.left>=-1&&r.top>=-1&&r.right<=vw+1&&r.bottom<=vh+1;
  const d=document.getElementById('dlg'), rd=d?d.getBoundingClientRect():null, t=(document.getElementById('dlgText')||{}).textContent||'';
  const bs=[...document.querySelectorAll('#choices button')].filter(()=>!document.getElementById('choices').classList.contains('hide')).map(b=>{ const r=b.getBoundingClientRect(); return {t:b.textContent.trim(),h:Math.round(r.height),in:inV(r)}; });
  return {dlg:rd?{in:inV(rd),h:Math.round(rd.height)}:null,text:t.trim(),choices:bs}; })()"""


async def one(p, run, landscape):
    tag = '橫向' if landscape else '直向'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    await pg.goto(URL)
    run.check(f'{tag}：遊戲載入', await L.wait_loaded(pg))
    tgt = None
    for zone, hour, wd in TRIES:
        day = await pg.evaluate("STORY.termDay('Y1S2',5,%d)" % wd)
        run.setup(f'{tag}：讀檔到大一下第 5 週（第 {day} 天）{hour:.1f} 時、{zone}')
        await L.load_state(pg, {'zone': zone, 'hour': hour, 'day': day, 'weekday': wd % 7, 'weather': 'sunny', 'money': 5000,
                                'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'met_sis': True}}, quiet_events=True)
        await pg.wait_for_timeout(4000)
        c = await pg.evaluate(FIND_JS)
        run.note(f'{zone} {hour}：有下一層階梯的人 {json.dumps(c, ensure_ascii=False)[:300]}')
        c.sort(key=lambda x: (not x['choices'], x['moving']))   # 有選項的、沒在走路的優先
        if c:
            tgt = c[0]; break
    if not run.check(f'{tag}：找到在場、有下一層階梯的人', tgt is not None):
        await b.close(); return
    run.setup(f'{tag}：{tgt["id"]} 設成見過、有點熟；玩家放到旁邊 1.2 公尺（瞬移）')
    cand = await pg.evaluate(PLACE_JS % json.dumps(tgt)); pos = None; s = None
    for c in cand:   # 互動按鈕要是她（旁邊有別人時換一個站的位置）
        await pg.evaluate(PUT_JS % json.dumps([c[0], c[1], tgt['key']])); await pg.wait_for_timeout(1200)
        s = await L.state(pg)
        if tgt['name'] in s['interact']: pos = c; break
    run.check(f'{tag}：站在{tgt["name"]}旁邊，互動按鈕是「和{tgt["name"]}說話」（{s and s["interact"]}）', bool(pos), json.dumps([cand[:3], s and s['interact']], ensure_ascii=False))
    if not pos:
        await b.close(); return
    lad0 = await pg.evaluate(LAD_JS % json.dumps(tgt['id']))
    await L.tap(pg, cdp, '#interact')
    seen, boxes, chose = [], [], None
    for _ in range(60):
        s = await L.state(pg)
        bx = await pg.evaluate(BOX_JS)
        if s['choices']:
            boxes.append(bx); await run.shot(pg, f'{"land" if landscape else "port"}_choices')
            ts = [c['t'] for c in bx['choices']]   # 那一層的選項點第一個；聊完的選單（約她去…／交換聯絡方式／就這樣）點「就這樣」
            k = next((i for i, x in enumerate(ts) if any(x.startswith(c[:8]) for c in tgt['chTexts'])), None)
            if k is None: k = next((i for i, x in enumerate(ts) if x.startswith('就這樣')), 0)
            await pg.evaluate("document.querySelectorAll('#choices button')[%d].scrollIntoView({block:'center'})" % k)
            cxy = await pg.evaluate("(()=>{ const r=document.querySelectorAll('#choices button')[%d].getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()" % k)
            chose = bx['choices'][k]['t'] if bx['choices'] else None
            await L.touch_tap(cdp, cxy[0], cxy[1]); await pg.wait_for_timeout(700); continue
        if s['dlg']:
            if bx['text'] and (not seen or seen[-1] != bx['text']): seen.append(bx['text']); boxes.append(bx)
            if len(seen) == 1: await run.shot(pg, f'{"land" if landscape else "port"}_dialog')
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if seen: break
        await pg.wait_for_timeout(500)
    first = tgt['first'] if isinstance(tgt['first'], str) else ''
    run.check(f'{tag}：播的是那一層（{tgt["step"]}）的第一句', bool(seen) and first and any(first[:12] in t for t in seen), json.dumps({'first': first, 'seen': seen[:4]}, ensure_ascii=False))
    dl = [x['dlg'] for x in boxes if x.get('dlg')]
    run.check(f'{tag}：對話框整個在畫面裡（看到 {len(seen)} 句）', bool(dl) and bool(seen) and all(d['in'] for d in dl), json.dumps(dl[:3]))
    if tgt['choices']:
        cb = [c for x in boxes for c in x['choices']]
        run.check(f'{tag}：選項按鈕都在畫面裡、至少 44px 高、有字（點了「{chose}」）', bool(cb) and all(c['in'] and c['h'] >= 44 and c['t'] for c in cb), json.dumps(cb, ensure_ascii=False))
    lad1 = await pg.evaluate(LAD_JS % json.dumps(tgt['id']))
    s = await L.state(pg)
    run.check(f'{tag}：對話結束、階梯往前一層、玩家可以動', lad1 == lad0 + 1 and not s['dlg'] and not s['choices'] and not s['busy'], json.dumps({'lad': [lad0, lad1], 'state': s}, ensure_ascii=False)[:300])
    run.check(f'{tag}：沒有 JS 錯誤', not errs, '; '.join(errs[:5]))
    await b.close()


async def main():
    run = L.Run('flow_ladder_y1s2', OUT)
    async with async_playwright() as p:
        for land in (True, False):
            await one(p, run, land)
    sys.exit(run.finish())

asyncio.run(main())
