"""聽眾、同學坐好才出現（2026-10-13 LAWWW2 審查：博思 101 的聽眾出現後前幾秒有一半以上是站姿、站在椅子和桌板中間；
使用者經 LAWWW2 轉達：坐姿要在顯示之前就正確，測試進教室、演講開始、讀檔、跳時間）。不用 ?turbo。
做法：包住 E.render——每一幀畫面送出前，檢查座位上（姿勢 sit／read）、畫面裡看得到的人，真實骨架的臀部離他所在的地面多高：
坐著約 0.45–0.6 m、站著約 0.9–1.0 m（LAWWW2 量的）；超過 0.75 m 記一筆「站著被畫出來」（只閃一幀也抓得到）。
A. 進教室：[前置／捷徑] 讀檔在博思大廳、演講已經開始 20 分鐘（測試活動：遊戲的活動清單是空的）→ 走到 101 門口、走進去、走到第 3 排
B. 演講開始：[前置／捷徑] 讀檔在 101 裡、離演講開始 15 分鐘前還有半分鐘 → 站著等（遊戲時間自己走）→ 聽眾在 15 分鐘前進場坐好
C. 讀檔：演講中用選單存檔（欄位 1）→ 選單讀取欄位 1（在遊戲裡讀；重新整理的話測試活動會不見）
D. 跳時間：[前置／捷徑] 讀檔在 101 裡 12:50（14:00 有演講）→ 手機「跳過時間」→「等到下午」
E. 換正式模型：[前置／捷徑] 把畫面裡 4 位聽眾標成「正式模型晚到」（換成另一個已載入的模型）——手機網路慢、模型 180 秒內沒下載完時，
   遊戲每 1.5 秒（GM.upgradeModels，在 E.update 之後、畫面之前）把晚到的模型換上去；換上去的那一幀（修改前）是站姿。A～D 在這個環境裡模型都已載入，所以 E 另外做。
每一段：看得到座位上的人的幀數 > 0、站著被畫出來 0 次；截圖。
用法：python3 tests/flow_seated_spawn.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_seated_spawn'
DAY_FRI = 3   # 9/19 週五（學期中、沒有博雅的課）
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
STAND = 0.75

HOOK = """(()=>{ if(window.__seat) return; const E=GAME.E, r0=E.render.bind(E); const V=new THREE.Vector3(), M=new THREE.Matrix4(), F=new THREE.Frustum();
  window.__seat={frames:0,seen:0,bad:[],proc:0,maxSit:0};
  E.render=function(){ const S=window.__seat; try{ S.frames++; const cam=E.camera; cam.updateMatrixWorld(); M.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); F.setFromProjectionMatrix(M); let any=false;
    for(const n of E.npcs){ if(!n.seat||!(n.pose==='sit'||n.pose==='read')) continue; const o=n.obj; let vis=true; for(let p=o;p;p=p.parent) if(!p.visible){ vis=false; break; } if(!vis) continue;
      const u=o.userData||{}; if(u.driver==='proc'){ V.set(o.position.x,o.position.y+0.8,o.position.z); if(F.containsPoint(V)) S.proc++; continue; }
      if(!u.vrm) continue; const nd=u.vrm.humanoid.getRawBoneNode('hips'); if(!nd) continue; nd.getWorldPosition(V); if(!F.containsPoint(V)) continue;
      any=true; const hy=V.y-o.position.y; if(hy<STAND_M) S.maxSit=Math.max(S.maxSit,hy);
      if(hy>STAND_M&&S.bad.length<40) S.bad.push({f:E.frame,hour:+GAME.G.hour.toFixed(3),x:+o.position.x.toFixed(1),z:+o.position.z.toFixed(1),hy:+hy.toFixed(2),key:n.clsKey||n.crowd||n.id||''}); }
    if(any) S.seen++; }catch(e){ S.err=String(e); } return r0(); }; })()""".replace('STAND_M', str(STAND))
RESET = "(()=>{ const S=window.__seat; const r={frames:S.frames,seen:S.seen,bad:S.bad.slice(),proc:S.proc,maxSit:+S.maxSit.toFixed(2),err:S.err||null}; S.frames=0; S.seen=0; S.bad=[]; S.proc=0; S.maxSit=0; S.err=null; return r; })()"


def act_js(t0, t1, n=14):
    return "(()=>{ const d=CALENDAR.dateOf(%d); ACTIVITIES.list=ACTIVITIES.list.filter(a=>a.id!=='t_seat'); ACTIVITIES.list.push({id:'t_seat',title:'測試演講（坐姿測試）',kind:'lecture',zone:'boya',room:'101',roomName:'博思 101',dates:[d.key],t0:%f,t1:%f,crowd:{n:%d}}); })()" % (DAY_FRI, t0, t1, n)


async def frames(pg, n):
    await pg.evaluate("(async n=>{ const f0=GAME.E.frame; for(let i=0;i<600&&GAME.E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,200)); })(%d)" % n)


async def seated_count(pg):
    return await pg.evaluate("GAME.E.npcs.filter(n=>n.clsStudent&&n.seat&&(n.pose==='sit'||n.pose==='read')).length")


def report(run, label, r, need_seen=True):
    run.check(f'{label}：看得到座位上的人的畫面 > 0 幀（這一段真的有看到聽眾）', (r['seen'] > 0) or not need_seen, f"畫了 {r['frames']} 幀、看得到的 {r['seen']} 幀、坐著的臀部最高 {r['maxSit']} m")
    run.check(f'{label}：座位上的人沒有一幀是站著被畫出來的（臀部 > {STAND} m）', not r['bad'] and not r['err'], json.dumps(r['bad'][:6], ensure_ascii=False) + (' 錯誤 ' + r['err'] if r['err'] else ''))
    if r['proc']: run.note(f"{label}：畫面裡有 {r['proc']} 次是程序化備用人物（模型還沒載入）")


async def main():
    run = L.Run('flow_seated_spawn', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate(HOOK)
        # ---------- A：進教室 ----------
        run.setup('測試活動：第 3 天 10:00–12:00 博思 101 演講（14 人）；讀檔在博思大廳 10:20（演講已經開始）')
        await pg.evaluate(act_js(10.0, 12.0))
        await L.load_state(pg, {'zone': 'boya', 'hour': 10.33, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 0, 'z': 6.8, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3000); await pg.evaluate(RESET)
        n = await seated_count(pg)
        run.check('A 進博思時演講已經開始：101 裡有坐著的聽眾（還在畫面外）', n >= 8, f'{n} 人')
        d = await L.find_it(pg, '看看博思 101')
        ok = await L.go_to(pg, cdp, run, d['x'], d['z'], 0.8, '博思 101 門口')
        seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.find(q=>q.room==='101'&&q.row===2&&q.col===5); const ap=GAME.seatApproach(s)||[s.x,s.z]; return {ax:ap[0],az:ap[1]}; })()")
        ok2 = await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.4, '101 第 3 排', lv=0)
        await frames(pg, 6)
        run.check('A 自己走到 101 門口、走進去到第 3 排', ok and ok2)
        await run.shot(pg, 'A_inside_101')
        report(run, 'A 進教室', await pg.evaluate(RESET))
        # ---------- B：演講開始（聽眾進場）----------
        run.setup('測試活動：第 3 天 14:00–16:00；讀檔在 101 第 3 排旁 13:44:40（聽眾在 13:45 開始坐進來）、面向座位')
        await pg.evaluate(act_js(14.0, 16.0))
        await L.load_state(pg, {'zone': 'boya', 'hour': 13.7444, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': -8.2, 'z': 6.0, 'lv': 0, 'yaw': 4.71}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(2500)
        n0 = await seated_count(pg); await pg.evaluate(RESET)
        t0 = time.time(); n1 = n0
        while time.time() - t0 < 240:
            await pg.wait_for_timeout(3000); n1 = await seated_count(pg)
            if n1 >= 8: break
        await frames(pg, 8)
        h = (await L.state(pg))['hour']
        run.check('B 站著等到 13:45：聽眾自己坐進來（遊戲時間自己走，沒有快轉）', n0 == 0 and n1 >= 8, f'等之前 {n0} 人、之後 {n1} 人、現在 {h:.3f}')
        await run.shot(pg, 'B_audience_in')
        report(run, 'B 演講開始前進場', await pg.evaluate(RESET))
        # ---------- C：讀檔 ----------
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
        await L.tap(pg, cdp, '.tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
        c = await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(x=>x.textContent.includes('欄位 1')); const e=it&&[...it.querySelectorAll('button')].find(x=>x.textContent==='存檔'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        saved = await pg.evaluate("(()=>{ const t=localStorage.getItem('fatiao3d_slot_1'); if(!t) return null; const s=JSON.parse(t); return {zone:s.zone,hour:s.hour,pos:s.pos}; })()")
        run.check('C 用選單存檔（欄位 1）：在博思、演講時段', bool(saved) and saved['zone'] == 'boya', json.dumps(saved, ensure_ascii=False))
        await pg.evaluate(RESET)
        c = await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(x=>x.textContent.includes('欄位 1')); const e=it&&[...it.querySelectorAll('button')].find(x=>x.textContent==='讀取'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        run.check('C 選單裡有欄位 1 的「讀取」', bool(c))
        if c: await L.touch_tap(cdp, c[0], c[1])
        await pg.wait_for_timeout(5000); await frames(pg, 10)
        s = await L.state(pg); n = await seated_count(pg)
        run.check('C 讀取欄位 1：回到博思 101、聽眾坐著', s['zone'] == 'boya' and n >= 8, f"{s['zone']} {n} 人")
        await run.shot(pg, 'C_after_load')
        report(run, 'C 讀檔', await pg.evaluate(RESET))
        # ---------- D：跳時間 ----------
        run.setup('測試活動：第 3 天 14:00–16:00（同一場）；讀檔在 101 裡 12:50、面向座位')
        await L.load_state(pg, {'zone': 'boya', 'hour': 12.84, 'day': DAY_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': -8.2, 'z': 6.0, 'lv': 0, 'yaw': 4.71}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(2500)
        n0 = await seated_count(pg); await pg.evaluate(RESET)
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="today"]'); await pg.wait_for_timeout(1200)
        c = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('[data-skip]')].find(x=>Math.abs(+x.dataset.skip-14)<0.01); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        run.check('D 手機有「等到下午（14:00）」', bool(c))
        if c: await L.touch_tap(cdp, c[0], c[1])
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'] and q['hour'] > 13.9, pick=0)
        await frames(pg, 40)
        n1 = await seated_count(pg); h = (await L.state(pg))['hour']
        run.check('D 跳到 14:00：之前沒有聽眾、之後坐好', n0 == 0 and n1 >= 8 and h >= 13.95, f'跳之前 {n0} 人、之後 {n1} 人、{h:.3f}')
        await run.shot(pg, 'D_after_skip')
        report(run, 'D 跳時間', await pg.evaluate(RESET))
        # ---------- E：換正式模型（晚到的模型換上去的那一幀）----------
        run.setup('鏡頭轉向聽眾（像玩家拖鏡頭；D 結束時鏡頭貼著 101 的門、往下看著玩家，畫面裡沒有聽眾）')
        await pg.evaluate("""(()=>{ const E=GAME.E, P=E.player.obj.position; const cs=E.npcs.filter(m=>m.clsStudent); if(!cs.length) return; let cx=0,cz=0; for(const m of cs){ cx+=m.obj.position.x; cz+=m.obj.position.z; } cx/=cs.length; cz/=cs.length;
          E.cam.yaw=Math.atan2(P.x-cx,P.z-cz); E.cam.pitch=0.2; E.cam.manualT=3; })()""")
        await frames(pg, 8)
        run.setup('畫面裡 4 位坐著的聽眾標成「正式模型晚到」：換成另一個已載入的路人模型（GM.upgradeModels 每 1.5 秒在畫面之前換）')
        k = await pg.evaluate("""(()=>{ const E=GAME.E, M=ASSETS.manifest, keys=Object.keys(M).filter(k=>M[k].type==='vrm'&&!M[k].lazy&&ASSETS.has(k)&&M[k].ambient); window.__upg=[];
          const F=new THREE.Frustum(), Mx=new THREE.Matrix4(), V=new THREE.Vector3(); E.camera.updateMatrixWorld(); Mx.multiplyMatrices(E.camera.projectionMatrix,E.camera.matrixWorldInverse); F.setFromProjectionMatrix(Mx);
          for(const m of E.npcs){ if(window.__upg.length>=4||!m.clsStudent) continue; const u=m.obj.userData; if(u.driver!=='vrm') continue; 
            const nd=u.vrm&&u.vrm.humanoid.getRawBoneNode('hips'); if(nd){ nd.getWorldPosition(V); if(!F.containsPoint(V)) continue; }
            const alt=keys.find(q=>q!==u.key); if(!alt) continue; u.buildSpec=Object.assign({},u.buildSpec,{model:alt}); u.wantModel=alt; m.__alt=alt; window.__upg.push(m); } return window.__upg.length; })()""")
        await pg.evaluate(RESET)
        t0 = time.time(); done = 0
        while time.time() - t0 < 90:
            await pg.wait_for_timeout(2000)
            done = await pg.evaluate("(window.__upg||[]).filter(m=>m.obj.userData.key===m.__alt).length")
            if k and done >= k: break
        await frames(pg, 6)
        run.check('E 畫面裡的聽眾換上「晚到的模型」（這一段真的有換）', k >= 1 and done == k, f'標了 {k} 位、換好 {done} 位')
        await run.shot(pg, 'E_after_upgrade')
        report(run, 'E 換正式模型', await pg.evaluate(RESET))
        run.check('沒有頁面錯誤', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())


asyncio.run(main())
