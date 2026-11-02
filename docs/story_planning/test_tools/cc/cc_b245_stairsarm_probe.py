"""CC（帳號 A）11-02 BB_245 第二批 #8：FIX-STAIRS-ARM 上樓梯第一段手臂往前平舉（沛珊）（瀏覽器探針）。
LAWWW 驗法（docs/handoff/BB245_LAWWW_REPLY_1102.md 第一節）：瀏覽器：和沛珊上樓梯鏡頭切過去那一格沒有 T 字手臂；探針：鏡頭外 16 m 內的人骨架每格更新。
修正：051e5c451（engine3d.js：畫面外的人 `if(!vis) return` → `if(!vis&&cd>16) return`：16 m 內的人畫面外也更新骨架）；對照＝051e5c451^（預期 FAIL）。
不是 iPhone：Playwright 手機直向模擬（720×960，同 tools/shots/char_motion.py），SwiftShader。不用 ?turbo。
情境（照 tools/shots/char_motion.py 的樓梯段）：【前置／捷徑】load_state（quiet_events）霖澤館第 8 天（週六）11:00，玩家在大廳 (4,4)；
  【捷徑】先把跟隨鏡頭轉到玩家和樓梯口之間（E.cam.yaw 指向樓梯口：樓梯在鏡頭背後＝畫面外、離鏡頭 16 m 內），再清掉其他 NPC、
  GAME.spawnCharacter 放沛珊在樓梯口 (-6.6, 6.0)，等她的 VRM 載好，先站著 STAND_MS（預設 8000 ms，畫面外多記幾格），再 GAME.walkTo(她, -6.6, -4.6, lv 1) 讓她自己走上樓梯。
記錄（只包一層、不改行為）：CHAR.animate 包一層，記沛珊這一格有沒有被更新骨架；E.render 包一層，每畫一格記：她 visible、她離鏡頭的水平距離 cd、
  這一格有沒有更新骨架、左上臂（VRM raw leftUpperArm→leftLowerArm）和正下方的夾角（T 字＝約 90°）、她的高度 y。
判定：
  前置  她在畫面外、cd < 15 m 的格子至少 MIN_FRAMES（預設 5）格（cd 15～17 m 的灰色地帶不判，只記）
  ①    這些格子每一格都有更新骨架（CHAR.animate 有叫到她）
  ②    這些格子裡左上臂和正下方的夾角都 < 70°（不是 T 字；走路擺手約 10～40°）
  鏡頭切過去（她爬到第一段 y 0.7～1.7 m 時，用 E.cinematic 把鏡頭切到她側前方）：③ 切過去以後第一格看得到她（visible）的那一格，左上臂夾角 < 70°；截圖＝上樓梯的畫面。
用法：LW_TESTS=<工作樹>/tests [SHA=<sha>] [MIN_FRAMES=5] python3 cc_b245_stairsarm_probe.py '<URL>/index.html' <輸出資料夾>
exit 0＝ALL PASS；1＝有 FAIL。"""
import os, sys, asyncio, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_b245_common as C
from cc_b245_common import L, J, check, info, setup
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?'); MINF = int(os.environ.get('MIN_FRAMES', '5')); STAND_MS = int(os.environ.get('STAND_MS', '8000'))
CID = 'classmate_peishan'
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}"

HOOK = """(id=>{ if(window.__ccArm) return 'already'; const S=window.__ccArm={id, frames:[], hit:false, cut:false, cutRec:null, on:false};
  const tgt=()=>GAME.E.npcs.find(k=>k.charId===id);
  const a0=CHAR.animate; CHAR.animate=function(o){ const n=tgt(); if(n&&o===n.obj) S.hit=true; return a0.apply(this,arguments); };
  const V=new THREE.Vector3(), W=new THREE.Vector3();
  const arm=n=>{ let u=null; n.obj.traverse(x=>{ if(!u&&x.userData&&x.userData.vrm) u=x.userData; }); const h=u&&u.vrm&&u.vrm.humanoid; if(!h) return null;
    const a=h.getRawBoneNode('leftUpperArm'), b=h.getRawBoneNode('leftLowerArm'); if(!a||!b) return null; a.updateWorldMatrix(true,false); b.updateWorldMatrix(true,false);
    a.getWorldPosition(V); b.getWorldPosition(W); const d=W.sub(V); const L=d.length()||1; return +(Math.acos(Math.max(-1,Math.min(1,-d.y/L)))*180/Math.PI).toFixed(1); };
  const r0=GAME.E.render; GAME.E.render=function(){ const E=GAME.E, n=tgt();
    if(S.on&&n){ const o=n.obj, c=E.camera.position; const cd=Math.hypot(c.x-o.position.x,c.z-o.position.z);
      const rec={f:E.frame|0, vis:!!o.visible, cd:+cd.toFixed(2), upd:S.hit, arm:arm(n), y:+o.position.y.toFixed(2), z:+o.position.z.toFixed(2)};
      if(S.cut&&!S.cutRec&&rec.vis) S.cutRec=rec; S.frames.push(rec); if(S.frames.length>3000) S.frames.splice(0,1000); }
    S.hit=false; return r0.apply(this,arguments); };
  return 'ok'; })"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('cc_b245_stairsarm_probe  SHA=%s  URL=%s' % (SHA, URL), flush=True)
    rec = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        pg.set_default_timeout(180000)
        await pg.set_viewport_size({'width': 720, 'height': 960})
        await pg.goto(URL)
        check('遊戲載入', await L.wait_loaded(pg))
        flags = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}
        setup('load_state（quiet_events）霖澤館第 8 天（週六）11:00，玩家在大廳 (4,4)')
        await L.load_state(pg, {'zone': 'linze', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 4.0, 'z': 4.0, 'yaw': 0, 'lv': 0}, 'flags': flags}, quiet_events=True)
        await pg.wait_for_timeout(3000)
        await pg.evaluate(HOOK + "(%s)" % J(CID))
        setup('跟隨鏡頭轉向樓梯口（樓梯在鏡頭背後）、清掉其他 NPC、spawnCharacter 沛珊在 (-6.6, 6.0)')
        sp = await pg.evaluate("""(id=>{ const E=GAME.E, P=E.player.obj.position; E.cam.yaw=Math.atan2(-6.6-P.x, 6.0-P.z); E.npcs.slice().forEach(n=>E.removeNPC(n)); for(const k in GAME.npc) delete GAME.npc[k];
          const n=GAME.spawnCharacter(id,-6.6,6.0,{yaw:Math.PI}); n.greet=false; n.frozen=false; n.beh='idle'; return {yaw:+E.cam.yaw.toFixed(3), ok:!!n}; })(%s)""" % J(CID))
        info('spawn：' + J(sp))
        ld = None
        for _ in range(240):
            ld = await pg.evaluate("""(id=>{ const n=GAME.E.npcs.find(k=>k.charId===id); if(!n) return null; let u=null, k=null, d=null; n.obj.traverse(x=>{ if(x.userData&&x.userData.vrm&&!u) u=x.userData; if(x.userData&&x.userData.driver&&!d){ d=x.userData.driver; k=x.userData.key; } }); return {vrm:!!u, key:k, driver:d, vis:n.obj.visible}; })(%s)""" % J(CID))
            if ld and ld['vrm']: break
            await pg.wait_for_timeout(500)
        info('沛珊模型：' + J(ld))
        check('前置：沛珊的 VRM 載好了（才量得到上臂）', bool(ld and ld['vrm']), J(ld))
        await pg.evaluate("(()=>{ const S=window.__ccArm; S.frames.length=0; S.on=true; })()")
        await pg.wait_for_timeout(STAND_MS)   # 先站著（畫面外）記幾格：低幀率下從樓梯口走到第一段中間只有幾格
        await pg.evaluate("(id=>{ const n=GAME.E.npcs.find(k=>k.charId===id); void GAME.walkTo(n,-6.6,-4.6,{lv:1}); })(%s)" % J(CID))
        cut = False
        for i in range(400):
            s = await pg.evaluate("(id=>{ const n=GAME.E.npcs.find(k=>k.charId===id); if(!n) return null; const o=n.obj.position; return {y:+o.y.toFixed(2), z:+o.z.toFixed(2), lv:n.lv|0, n:window.__ccArm.frames.length}; })(%s)" % J(CID))
            if not s: break
            if not cut and 0.7 <= s['y'] <= 1.7:
                setup('她爬到第一段 y=%.2f：E.cinematic 把鏡頭切到她側前方（模擬劇情運鏡切過去）' % s['y'])
                await pg.evaluate("""(id=>{ const E=GAME.E, n=E.npcs.find(k=>k.charId===id), o=n.obj.position; window.__ccArm.cut=true;
                  const p=new THREE.Vector3(o.x+3.2,o.y+1.6,o.z-1.6), l=new THREE.Vector3(o.x,o.y+1.0,o.z); E.cinematic(p,l); E.camera.position.copy(p); E.cam.look=l; E.camera.lookAt(l); })(%s)""" % J(CID))
                cut = True
                await pg.add_style_tag(content=HIDE)
                await pg.wait_for_timeout(1500)
                await pg.screenshot(path=os.path.join(OUT, 'stairsarm_cut_flight1.png'))
                await pg.wait_for_timeout(2500)
                await pg.screenshot(path=os.path.join(OUT, 'stairsarm_cut_flight1_b.png'))
                break
            await pg.wait_for_timeout(400)
        S = await pg.evaluate("window.__ccArm")
        fr = S['frames']; rec['frames'] = fr; rec['cutRec'] = S['cutRec']
        pre = [f for f in fr if not f['vis'] and f['cd'] < 15]
        gray = [f for f in fr if not f['vis'] and 15 <= f['cd'] < 17]
        info('記到 %d 格；畫面外且 cd<15 m %d 格；cd 15～17 m %d 格；看得到 %d 格' % (len(fr), len(pre), len(gray), len([f for f in fr if f['vis']])))
        info('前 12 格：' + J(fr[:12]))
        check('前置：沛珊在畫面外、離鏡頭 < 15 m 的格子至少 %d 格' % MINF, len(pre) >= MINF, str(len(pre)))
        noupd = [f for f in pre if not f['upd']]
        check('① 畫面外、16 m 內的格子每一格都更新骨架（CHAR.animate 有叫到她）', bool(pre) and not noupd, '%d/%d 格沒更新；例 %s' % (len(noupd), len(pre), J(noupd[:3])))
        tarm = [f for f in pre if f['arm'] is None or f['arm'] >= 70]
        check('② 畫面外那幾格的左上臂和正下方夾角都 < 70°（不是 T 字）', bool(pre) and not tarm, '%d/%d 格 ≥70°；例 %s' % (len(tarm), len(pre), J(tarm[:3])))
        cr = S['cutRec']
        check('前置：有切到她爬第一段（y 0.7～1.7）', cut, '')
        check('③ 鏡頭切過去以後第一格看得到她：左上臂夾角 < 70°', bool(cr and cr['arm'] is not None and cr['arm'] < 70), J(cr))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'stairsarm.json'), 'w'), ensure_ascii=False, indent=1)
    return C.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
