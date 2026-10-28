"""BB-C 10-27：A21 開門動作（ANIM-DOOR-OPEN-1027，LAWWW2-C a25bede18；src/door3d.js）照玩家走一圈。
規格（door3d.js 開頭）：按「進入／離開／走出／出門／回公寓…」這種有門的出入口＝先轉向門、伸右手推門（約 0.45 秒）再換區域，畫面全黑以後手放下；
  自動門（便利商店、美國超市、機場）只轉向不伸手；開放式店面（阿鳳麵店）、樓梯、電梯、「往…」的路、搭車、回到校園：不演。
路線（觸控走到門口、按互動鍵；遠的用手機「地點」快速前往＝玩家真的會用的功能）：
  宿舍房間「走出房間」→ 宿舍走廊「離開宿舍」→【快速前往】台大校園（霖澤館前）→「進入霖澤館」→【快速前往】霖澤館 201 教室 →「離開教室」→「進入 201 階梯教室」
  →【快速前往】溫州街 →「進入兩點半 Café」→「離開咖啡廳」→【快速前往】公館商圈 →「進入便利商店」（自動門）→「離開便利商店」→「進入阿鳳麵店」（不演）→「離開麵店」（不演）
  → 連按兩次：「進入舊路書房」互動鍵 150 ms 內按兩下（看會不會推兩次門、換兩次區域）
每一個出入口記：互動鍵文字、DOOR.kind（推門 push／自動門 auto／不演 null）、有沒有伸手（u.overlay.door）、伸手多久、換區域那一刻手放下了沒（overlay 清掉和區域換掉的先後）、
  換區域以後 2.5 秒：手放下（overlay 沒有開門的那一份、右上臂和推門以前的角度差）、玩家不忙、推搖桿走得動；沒有 JS 例外。
最後 SURVEY＝1（預設開）：【捷徑】GAME.enter 進一串區域，列出每個出入口的 DOOR.kind，標出「進去不演、出來推門」這種不對稱、和小店（118 巷、溫州街的店）出來推門的，給 LAWWW 看是不是開放式店面。
【前置】使用者存檔（法律系 day 14）改成 14:00 宿舍房間、晴天；不關條件事件（QUIET=1 才關）；關掉「要回的訊息自動打開手機」。
DOOR.open 外面包一層只記錄（不改行為）；每一格（requestAnimationFrame）記 overlay 和區域。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。預設不用 ?turbo（turbo 把 GM.sleep 壓到 120 ms；推門用的是真實時間）。
用法：LW_TESTS=<工作樹>/tests python3 door_anim_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]"""
import os, sys, json, asyncio, time, copy, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
SAVEF = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an/user_day14.json'
QUIET = os.environ.get('QUIET') == '1'; SURVEY = os.environ.get('SURVEY', '1') != '0'
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)

INST_JS = """(()=>{ if(window.__dr) return true; if(typeof DOOR==='undefined'||!DOOR.open) return false; const R=window.__dr={opens:[]};
  const arm=()=>{ const u=GAME.E.player.obj.userData, v=u&&u.vrm, b=v&&v.humanoid&&v.humanoid.getNormalizedBoneNode&&v.humanoid.getNormalizedBoneNode('rightUpperArm'); return b?b.quaternion.toArray().map(x=>+x.toFixed(4)):null; };
  const orig=DOOR.open; DOOR.open=function(GM,it){ const z0=GAME.G.zone; let k=null; try{ k=DOOR.kind(it,z0); }catch(e){}
    const rec={label:it&&it.label,to:it&&it.exit&&it.exit.to,from:z0,kind:k,t0:performance.now(),arm0:arm(),zone0:GAME.E.zone}; R.opens.push(rec);
    const p=orig.apply(this,arguments); rec.ret=p?'promise':String(p); if(p&&p.then) p.then(v=>{ rec.tDone=Math.round(performance.now()-rec.t0); rec.res=v; }); return p; };
  const f=()=>{ try{ const u=GAME.E.player.obj.userData||{}, ov=!!(u.overlay&&u.overlay.door), now=performance.now(); const c=R.opens[R.opens.length-1];
      if(c&&now-c.t0<8000){ const dt=Math.round(now-c.t0); if(ov&&c.ovOn==null) c.ovOn=dt; if(ov) c.ovLast=dt; if(GAME.E.zone!==c.zone0&&c.zoneAt==null){ c.zoneAt=dt; c.ovAtZone=ov; }
        if(c.ovOn!=null&&!ov&&c.ovOff==null) c.ovOff=dt; c.frames=(c.frames|0)+1; } }catch(e){ R.err=String(e); } requestAnimationFrame(f); }; requestAnimationFrame(f); return true; })()"""
ARM_JS = """(()=>{ const u=GAME.E.player.obj.userData, v=u&&u.vrm, b=v&&v.humanoid&&v.humanoid.getNormalizedBoneNode&&v.humanoid.getNormalizedBoneNode('rightUpperArm'); return {q:b?b.quaternion.toArray():null, ovDoor:!!(u&&u.overlay&&u.overlay.door), ov:!!(u&&u.overlay)}; })()"""
FIND_JS = """(([to,pre])=>{ const P=GAME.E.player.obj.position; const its=GAME.E.interactables.filter(i=>i.exit&&i.exit.to===to&&(!pre||(i.label||'').startsWith(pre)));
  its.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const i=its[0]; return i?{x:i.x,z:i.z,r:i.radius||1.2,label:i.label,lv:i.lv===undefined?null:i.lv}:null; })"""
SURVEY_JS = """(z=>(GAME.E.interactables||[]).filter(i=>i.exit).map(i=>{ let k=null; try{ k=DOOR.kind(i,z); }catch(e){ k='ERR'; } return {label:i.label,to:i.exit.to,door:i.exit.door||null,kind:k}; }))"""


def qang(a, b):
    if not a or not b: return None
    d = abs(sum(x * y for x, y in zip(a, b))); return 2 * math.acos(min(1.0, d))


async def quick(pg, cdp, run, zone, name):
    """手機「地點」→ 那一列的「前往」（玩家真的會用的快速前往）"""
    await L.close_panels(pg, cdp)
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
    sel = await pg.evaluate("(p=>{ const e=document.querySelector('#phoneBody [data-place=\"'+p+'\"]'); if(!e) return null; e.scrollIntoView({block:'center'}); return p; })(%s)" % json.dumps(zone + '|' + name))
    if not sel:
        run.check('手機「地點」有 %s' % name, False); return False
    await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#phoneBody [data-place="%s"]' % sel.replace('"', '\\"'))
    for _ in range(80):
        s = await L.state(pg)
        if s['zone'] == zone and not s['busy']: break
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
    s = await L.state(pg); run.note('快速前往 %s → %s' % (name, json.dumps(s, ensure_ascii=False))); return s['zone'] == zone


async def door(pg, cdp, run, to, pre, expect, tag, double=False):
    """走到通往 to 的出入口（label 開頭 pre），等互動鍵是它，按下去；回傳這一次的紀錄"""
    s = await L.state(pg)
    if s['dlg'] or s['choices'] or s['busy']:   # BB-C 10-28：進 Café 會先演一句旁白（「你點了拿鐵，拿到的是手沖…」），第一輪沒點掉就去找門＝07 整段卡在對話框（工具錯，不是遊戲）
        run.note('%s：前一段還有對話「%s」→ 像玩家一樣點完再走' % (tag, (s.get('dtext') or '')[:30]))
        await L.advance_dialogs(pg, cdp, run, lambda s: not s['dlg'] and not s['choices'] and not s['busy'], max_steps=40)
    it = await pg.evaluate(FIND_JS + "(%s)" % json.dumps([to, pre]))
    if not it:
        run.check('%s：找得到出入口（→%s %s）' % (tag, to, pre or ''), False, await pg.evaluate("GAME.G.zone")); return None
    z0 = await pg.evaluate("GAME.G.zone")
    ok = await L.go_to(pg, cdp, run, it['x'], it['z'], max(0.6, min(1.0, it['r'] * 0.6)), it['label'], max_s=300, lv=it['lv'])
    s = await L.state(pg)
    for _ in range(12):
        if s['interact'].startswith(it['label'][:6]): break
        await pg.wait_for_timeout(500); s = await L.state(pg)
    if not s['interact'].startswith(it['label'][:6]):
        # 像玩家一樣：互動鍵不是它（例：舊路書房門口被「看看法律書與文具」搶走），在出入口範圍裡找一個「最近的互動＝它」的站位走過去（BB-C 10-28 door_book）
        alt = await pg.evaluate("""(([to,pre])=>{ const E=GAME.E, P=E.player.obj.position, it=E.interactables.find(i=>i.exit&&i.exit.to===to&&(!pre||(i.label||'').startsWith(pre))); if(!it) return null;
          const x0=P.x, z0=P.z, R=(it.radius||1.5)-0.05; let best=null; for(let dx=-R;dx<=R+1e-6;dx+=0.1) for(let dz=-R;dz<=R+1e-6;dz+=0.1){ if(dx*dx+dz*dz>R*R) continue; const x=it.x+dx,z=it.z+dz; if(!E.canStand(x,z,0.32,E.player.lv|0)) continue; let ok=true; for(const [ax,az] of [[0,0],[0.2,0],[-0.2,0],[0,0.2],[0,-0.2]]){ P.set(x+ax,P.y,z+az); if(E.nearestInteractable()!==it){ ok=false; break; } } if(ok){ const d=Math.hypot(x-x0,z-z0); if(!best||d<best[2]) best=[x,z,d]; } }   /* 前後左右 0.2 m 也都是它才算（BB-C 10-28 door_book2：(-1.15,4.05) 走到差 0.14 m 的 (-1.01,4.05) 又變回櫃台）*/
          P.set(x0,P.y,z0); return best; })(%s)""" % json.dumps([to, pre]))
        run.note('%s：互動鍵是「%s」不是「%s」→ 在出入口範圍裡找按得到它的站位：%s' % (tag, s['interact'], it['label'], alt))
        if alt:
            await L.go_to(pg, cdp, run, alt[0], alt[1], 0.12, it['label'] + '（換站位）', max_s=120, lv=it['lv'])
            for _ in range(8):
                s = await L.state(pg)
                if s['interact'].startswith(it['label'][:6]): break
                await pg.wait_for_timeout(500)
    run.check('%s：走到「%s」、互動鍵是它' % (tag, it['label']), ok and s['interact'].startswith(it['label'][:6]), json.dumps(s, ensure_ascii=False))
    a0 = await pg.evaluate(ARM_JS); n0 = await pg.evaluate("window.__dr.opens.length")
    await L.tap(pg, cdp, '#interact')
    if double:
        await pg.wait_for_timeout(150); await L.tap(pg, cdp, '#interact')
    for _ in range(80):
        s = await L.state(pg)
        if s['zone'] == to: break
        await pg.wait_for_timeout(300)
    run.check('%s：換到 %s' % (tag, to), s['zone'] == to, '%s → %s' % (z0, s['zone']))
    await pg.wait_for_timeout(2500)
    recs = await pg.evaluate("window.__dr.opens.slice(%d).map(r=>Object.assign({},r,{zone0:undefined}))" % n0)
    a1 = await pg.evaluate(ARM_JS)
    rec = recs[0] if recs else None
    run.note('%s 紀錄：%s；推門以前／之後右上臂 %s／%s' % (tag, json.dumps(recs, ensure_ascii=False), a0, a1))
    kind = rec['kind'] if rec else None
    run.check('%s：DOOR.kind＝%s（預期 %s）' % (tag, kind, expect), kind == expect, json.dumps(rec, ensure_ascii=False)[:300])
    if expect == 'push':
        run.check('%s：有伸手推門（overlay.door 出現）' % tag, bool(rec) and rec.get('ovOn') is not None, str(rec and rec.get('ovOn')))
        run.check('%s：伸手到換區域約 0.45 秒（overlay 出現到最後一格 ≤ 換區域後 1.5 秒）' % tag, bool(rec) and rec.get('ovLast') is not None and (rec.get('zoneAt') is None or rec['ovLast'] <= rec['zoneAt'] + 1500),
                  'ovOn %s ovLast %s zoneAt %s tDone %s' % (rec and rec.get('ovOn'), rec and rec.get('ovLast'), rec and rec.get('zoneAt'), rec and rec.get('tDone')))
    else:
        run.check('%s：沒有伸手（自動門只轉向、不是門不演）' % tag, not rec or rec.get('ovOn') is None, json.dumps(rec, ensure_ascii=False)[:200])
    ang = qang(a0['q'], a1['q'])
    run.check('%s：換區域 2.5 秒後手放下（沒有開門的 overlay；右上臂和推門以前差 < 0.6 rad）' % tag, not a1['ovDoor'] and (ang is None or ang < 0.6), 'ovDoor %s ov %s 角度差 %s' % (a1['ovDoor'], a1['ov'], ang and round(ang, 2)))
    s = await L.state(pg)
    run.check('%s：換區域以後玩家不忙' % tag, not s['busy'] or s['dlg'], json.dumps(s, ensure_ascii=False))
    if double:
        run.check('%s：連按兩下只推一次門、只換一次區域（DOOR.open 次數）' % tag, len(recs) <= 1, '%d 次：%s' % (len(recs), json.dumps([r.get('label') for r in recs], ensure_ascii=False)))
    await run.shot(pg, tag)
    return rec


async def can_walk(pg, cdp, run, tag):
    s = await L.state(pg)
    if s['dlg'] or s['choices'] or s['busy']:
        run.note('%s：還有對話「%s」→ 點完再推搖桿' % (tag, (s.get('dtext') or '')[:30]))
        await L.advance_dialogs(pg, cdp, run, lambda s: not s['dlg'] and not s['choices'] and not s['busy'], max_steps=40)
    # 先往前推；走不動（例：舊路書房進門面對桌子）就像玩家一樣換方向（後、左、右）——BB-C 10-28 door_r2 12：往前推 0.00 m＝撞桌子
    tried = []
    for dx, dy, nm in ((0, -60, '前'), (0, 60, '後'), (-60, 0, '左'), (60, 0, '右')):
        moved, n, s = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2 if nm != '前' else 3, ms=1200)
        tried.append('%s %.2f m' % (nm, moved))
        if moved >= 0.3: break
    run.check('%s：推搖桿走得動' % tag, moved >= 0.3, '%s（%s）' % ('、'.join(tried), s['zone']))


async def main():
    run = L.Run('door_anim', OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        run.check('door3d.js 載入了（DOOR.open 包好記錄）', await pg.evaluate(INST_JS))
        st = copy.deepcopy(SAVE); st.pop('_stuck', None)
        st.update({'zone': 'dorm', 'hour': 14.0, 'weather': 'sunny', 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.14159, 'lv': 0, 'y': 0}})
        run.setup('[前置] 讀使用者存檔（day 14）：宿舍房間 14:00、晴天')
        await L.load_state(pg, st, quiet_events=QUIET, quiet_phone=True); await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
        s = await L.advance_dialogs(pg, cdp, run, lambda s: not s['dlg'] and not s['choices'] and not s['busy'], max_steps=40)
        R = {}
        if os.environ.get('ONLY') == 'book':   # 只跑舊路書房（單按＋連按兩下）：BB-C 10-28 door_r2 12 重驗
            if await quick(pg, cdp, run, 'gongguan', '公館商圈'):
                R['book_one'] = await door(pg, cdp, run, 'bookstore', '進入舊路書房', 'push', '12a_進入舊路書房（按一下）'); await can_walk(pg, cdp, run, '12a')
                lab = (await L.state(pg))['interact']; run.note('12a：進門以後互動鍵「%s」（落腳點 (0,4) 在「看看法律書與文具」(0,4.05) 半徑 1.1 裡）' % lab)
                R['book_out'] = await door(pg, cdp, run, 'gongguan', '離開', 'push', '12b_離開舊路書房')
                R['book_dbl'] = await door(pg, cdp, run, 'bookstore', '進入舊路書房', 'push', '12c_進入舊路書房（連按兩下）', double=True); await can_walk(pg, cdp, run, '12c')
            run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False)); await b.close(); sys.exit(run.finish())
        R['dorm_out'] = await door(pg, cdp, run, 'dorm_hall', None, 'push', '01_走出房間'); await can_walk(pg, cdp, run, '01')
        R['hall_out'] = await door(pg, cdp, run, 'campus', None, 'push', '02_離開宿舍'); await can_walk(pg, cdp, run, '02')
        if await quick(pg, cdp, run, 'campus', '台大校園（霖澤館前）'):
            R['linze_in'] = await door(pg, cdp, run, 'linze', '進入霖澤館', 'push', '03_進入霖澤館'); await can_walk(pg, cdp, run, '03')
        if await quick(pg, cdp, run, 'classroom', '霖澤館 201 教室'):
            R['cls_out'] = await door(pg, cdp, run, 'linze', '離開教室', 'push', '04_離開教室'); await can_walk(pg, cdp, run, '04')
            R['cls_in'] = await door(pg, cdp, run, 'classroom', '進入 201', 'push', '05_進入201教室')
        if await quick(pg, cdp, run, 'wenzhou', '溫州街'):
            R['cafe_in'] = await door(pg, cdp, run, 'cafe', '進入兩點半', 'push', '06_進入Café')
            R['cafe_out'] = await door(pg, cdp, run, 'wenzhou', '離開咖啡廳', 'push', '07_離開咖啡廳'); await can_walk(pg, cdp, run, '07')
        if await quick(pg, cdp, run, 'gongguan', '公館商圈'):
            R['cvs_in'] = await door(pg, cdp, run, 'cvs', '進入便利商店', 'auto', '08_進入便利商店（自動門）')
            R['cvs_out'] = await door(pg, cdp, run, 'gongguan', '離開便利商店', 'auto', '09_離開便利商店（自動門）')
            R['noodle_in'] = await door(pg, cdp, run, 'noodle', '進入阿鳳麵店', None, '10_進入阿鳳麵店（開放式）')
            R['noodle_out'] = await door(pg, cdp, run, 'gongguan', '離開麵店', None, '11_離開麵店（開放式）'); await can_walk(pg, cdp, run, '11')
            R['book_dbl'] = await door(pg, cdp, run, 'bookstore', '進入舊路書房', 'push', '12_進入舊路書房（連按兩下）', double=True); await can_walk(pg, cdp, run, '12')
        json.dump(R, open(os.path.join(OUT, 'door_records.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        if SURVEY:
            # 【捷徑】GAME.enter 直接進各區域，只列出口和 DOOR.kind（不量動作）
            zones = ['dorm', 'dorm_hall', 'campus', 'linze', 'classroom', 'wancai', 'lawlib', 'library_hall', 'soclib', 'boya', 'putong', 'gym', 'gongguan', 'cvs', 'noodle', 'bookstore',
                     'wenzhou', 'cafe', 'wz_brunch', 'wz_print', 'wz_teahouse', 'wz_lin', 'wz_teishoku', 'lane118',
                     'l118_noodle2', 'l118_self', 'l118_home', 'l118_dian', 'l118_korea', 'l118_omu', 'l118_pasta', 'l118_tea', 'l118_cafe2']
            table = {}
            run.setup('[捷徑] SURVEY：GAME.enter 直接進 %d 個區域，列出口的 DOOR.kind' % len(zones))
            for z in zones:
                okz = await pg.evaluate("(async z=>{ if(!Z3.ZONES[z]) return false; try{ await GAME.enter(z); return true; }catch(e){ return String(e); } })(%s)" % json.dumps(z))
                await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
                if okz is not True: table[z] = {'err': okz}; continue
                for _ in range(10):
                    if not (await L.state(pg))['dlg']: break
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
                table[z] = await pg.evaluate(SURVEY_JS + "(%s)" % json.dumps(z))
            json.dump(table, open(os.path.join(OUT, 'door_survey.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            # 不對稱：A→B 推門、B→A 不演（或反過來）
            asym, small = [], []
            edges = {(z, e['to']): e for z, lst in table.items() if isinstance(lst, list) for e in lst}
            for (a, bz), e in edges.items():
                back = edges.get((bz, a))
                if back and (e['kind'] == 'push') != (back['kind'] == 'push'): asym.append('%s「%s」%s ↔ %s「%s」%s' % (a, e['label'], e['kind'], bz, back['label'], back['kind']))
                if (a.startswith('l118_') or a.startswith('wz_')) and e['kind'] == 'push': small.append('%s「%s」→%s' % (a, e['label'], bz))
            run.note('出入口總表：%s' % json.dumps({z: [(e['label'], e['to'], e['kind']) for e in v] if isinstance(v, list) else v for z, v in table.items()}, ensure_ascii=False)[:4000])
            run.note('進出不對稱（一邊推門、一邊不演）：%s' % ('；'.join(sorted(set(asym))) or '沒有'))
            run.note('小店出來推門（118 巷、溫州街；請 LAWWW 看是不是開放式店面）：%s' % ('；'.join(small) or '沒有'))
            run.check('SURVEY：每個區域都進得去', all(isinstance(v, list) for v in table.values()), json.dumps({z: v for z, v in table.items() if not isinstance(v, list)}, ensure_ascii=False))
        err = await pg.evaluate("(window.__dr||{}).err||null")
        run.check('記錄沒出錯', not err, str(err))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
