"""CC-C 11-12：宋知寧在山嵐二樓（SHOP-JOBS-1112 第四輪，d4daa6326c；LAWWW-C 08:39 交排，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
要看的：人在不在、腳踩地板（不浮、不陷）、面向哪裡、有沒有擋走道、有沒有站在按鈕（互動點）上，各一張圖。
做法：【前置／捷徑】讀檔 FIX（預設 day51b_1110）改成「她已經搬到山嵐」：flags SHOP_ZN_MET、SHOP_ZN_CONTACT、SHOP_ZN_BK.sent＝[1..5]、moved＝前一天（＝第 5 則訊息發了）、
  聯絡人有她、關係 fam 30（「還不夠熟」不擋）→ 時間設週六 15:00／週日 15:30（她的班：週六 14～17、週日 14～18）、地點 xs_shanlan、條件事件關掉。
  店內偶遇是擲骰（同一天同一時段固定；有人符合時 60%），所以從 DAY0 往後試週末，週六、週日各找到 NEED 次就停（最多 MAXTRY 天）；每一次記遊戲的決定（G.daily.shopEnc.dec：誰、站哪、取消原因）。
  找到她 → 記位置、樓層、身體高度和腳下地板（往下打射線，不算她自己）、面向（yaw 和她面前 1.5 m 打到什麼）、1 m 內的互動點、導航格四周能不能走（擋走道的參考）→
  再讀一次檔把玩家放到二樓她面前 2 m（同一天同一時段＝同一個決定），拍：遊戲鏡頭、正面（她面前 2.2 m）、斜上方 45°（看她和走道的關係）、俯視（BB-C 08:42）、腳；記 1 m 內最近的家具名（場景網格外框離她 ≤1 m、不是地板天花板）。
CC_02 清單 2026-11-12：1✓（她的班從遊戲的 SHOPENC.npOf 讀，拍照時間在班內） 2✓（她站哪＝遊戲 standPick 決定，從 E.npcs 的 shopZn 讀，不寫死座標） 3✓（每個日期各讀一次檔；同一天第二次讀檔確認同一個決定） 4n/a（不按按鈕） 5n/a（玩家用讀檔放到二樓，不走樓梯） 6✓（讀檔後等 7 秒、人生出來再量） 7✓ 8n/a（不判，記事實＋圖給 BB；腳離地 >0.08 m、1 m 內有互動點只標★提示） 9✓（拍她的鏡頭藏玩家） 10✓（條件事件關掉） 11✓ 12✓（每次記日期、決定、位置、地板差、面向、互動點、導航格） 13✓（改存檔的捷徑寫在【前置／捷徑】）
用法：LW_TESTS=<wt>/tests SHA=<sha> [FIX=tests/fixtures/user_save_day51b_1110.json] [DAY0=52] [MAXTRY=10] [NEED=1] python3 cc_zn_shanlan_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]
TESTS = os.environ.get('LW_TESTS') or 'tests'
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51b_1110.json'
DAY0 = int(os.environ.get('DAY0') or '52'); MAXTRY = int(os.environ.get('MAXTRY') or '10'); NEED = int(os.environ.get('NEED') or '1')
R = L.Run('zn_shanlan', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ZONE = 'xs_shanlan'
HOUR = {6: 15.0, 0: 15.5}   # G.weekday：6＝週六、0＝週日


def fix_path(rel):
    for base in (os.path.dirname(TESTS), '.'):
        p = os.path.join(base, rel)
        if os.path.exists(p): return p
    return rel


APPLY = r"""(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); return {zone:GAME.G.zone, day:GAME.G.day, hour:GAME.G.hour}; })"""
WEEKENDS = r"""((a)=>{ const out=[]; for(let d=a.d0; d<a.d0+120&&out.length<a.n; d++){ const D=CALENDAR.dateOf(d), wd=D.wd%7; if(wd!==6&&wd!==0) continue; let ex=false; try{ ex=!!(CLS.examWeek&&CLS.examWeek({day:d,weekday:wd,hour:12,flags:{}})); }catch(e){} out.push({day:d, key:D.key, wd, exam:ex}); } return out; })"""
ZN = r"""(()=>{ const E=GAME.E, G=GAME.G; const n=(E.npcs||[]).find(q=>q&&q.shopZn); let dec=null; try{ const R=SHOPENC.rec(G); dec=R&&R.dec?Object.entries(R.dec).filter(([k])=>k.indexOf('xs_shanlan')>=0).map(([k,v])=>({k, who:v&&v.who, place:v&&v.place, cancel:v&&v.cancel})):null; }catch(e){ dec=String(e); }
  let P0=null; try{ const p=SHOPENC.npOf(G,'npc_songzn'); P0=p?{spot:p.intro_spot, days:p.days, from:p.from, to:p.to}:null; }catch(e){}
  const base={dec, np:P0, moved:(()=>{ try{ return SHOPENC.znMoved(G); }catch(e){ return String(e); } })(), playerLv:E.player&&E.player.lv, hideAbove:E.zone&&E.zone.hideAbove};
  if(!n||!n.obj) return Object.assign(base,{found:false});
  const o=n.obj, ex=new Set(); o.traverse(q=>ex.add(q)); if(E.player&&E.player.obj) E.player.obj.traverse(q=>ex.add(q));
  const rc=new THREE.Raycaster(); const hit=(from,dir,far)=>{ rc.set(from,dir); rc.far=far; const h=rc.intersectObjects(E.scene.children,true).find(x=>!ex.has(x.object)&&x.object.visible!==false); return h?{d:+h.distance.toFixed(2), y:+h.point.y.toFixed(3), name:h.object.name||''}:null; };
  const down=hit(new THREE.Vector3(o.position.x,o.position.y+1.2,o.position.z), new THREE.Vector3(0,-1,0), 6);
  const ry=o.rotation.y, fwd=new THREE.Vector3(Math.sin(ry),0,Math.cos(ry)); const front=hit(new THREE.Vector3(o.position.x,o.position.y+1.4,o.position.z), fwd, 3);
  const its=(E.interactables||[]).filter(i=>!i.hidden&&((i.lv|0)===(n.lv|0))).map(i=>({label:i.label, d:+Math.hypot(i.x-o.position.x,i.z-o.position.z).toFixed(2)})).filter(i=>i.d<1.0).sort((a,b)=>a.d-b.d);
  const N=E.nav, fr=(x,z)=>{ try{ return N?(N.free.length>=3?N.free(x,z,n.lv|0):N.free(x,z)):null; }catch(e){ return null; } }; const ring=[]; for(let a=0;a<8;a++){ const t=a*Math.PI/4; ring.push(fr(o.position.x+Math.sin(t)*0.8,o.position.z+Math.cos(t)*0.8)); }
  const furn=[]; const bx=new THREE.Box3(); E.scene.traverse(q=>{ if(!q.isMesh||ex.has(q)||q.visible===false||!q.geometry) return; if(!q.geometry.boundingBox) q.geometry.computeBoundingBox(); bx.copy(q.geometry.boundingBox).applyMatrix4(q.matrixWorld);
    const sx=bx.max.x-bx.min.x, sz=bx.max.z-bx.min.z, sy=bx.max.y-bx.min.y; if(sx>8||sz>8||sy<0.15) return; if(bx.max.y<o.position.y+0.1||bx.min.y>o.position.y+2.2) return;
    const dx=Math.max(bx.min.x-o.position.x,0,o.position.x-bx.max.x), dz=Math.max(bx.min.z-o.position.z,0,o.position.z-bx.max.z), d=Math.hypot(dx,dz); if(d<=1.0) furn.push({name:q.name||(q.parent&&q.parent.name)||'?', d:+d.toFixed(2), size:[+sx.toFixed(2),+sy.toFixed(2),+sz.toFixed(2)]}); });
  furn.sort((a,b)=>a.d-b.d);
  return Object.assign(base,{found:true, furn1m:furn.slice(0,8), name:n.name, label:n.talkLabel, lv:n.lv|0, x:+o.position.x.toFixed(2), y:+o.position.y.toFixed(3), z:+o.position.z.toFixed(2), yaw:+ry.toFixed(3), pose:n.pose, visible:o.visible, until:n.until,
    floor:down, gap:down?+(o.position.y-down.y).toFixed(3):null, front, near_its:its, ring_free:ring, here_free:fr(o.position.x,o.position.z)}); })()"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov, c.width/c.height, 0.05, 300); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const P=E.player&&E.player.obj, pv=P?P.visible:null; if(P) P.visible=false; let url; try{ r.render(E.scene,cam); url=c.toDataURL('image/jpeg',0.9); } finally { if(P) P.visible=pv; } return url; })"""


def wsave(u, name):
    import base64
    if u: open(os.path.join(OUT, name), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


def prep(sv0, day, wd, h, pos=None):
    sv = json.loads(json.dumps(sv0))
    sv['day'] = day; sv['weekday'] = wd; sv['hour'] = h; sv['zone'] = ZONE; sv['weather'] = 'clear'; sv.pop('pos', None)
    if pos: sv['pos'] = pos
    F = sv.setdefault('flags', {})
    F['SHOP_ZN_MET'] = True; F['SHOP_ZN_CONTACT'] = True; F['SHOP_ZN_N'] = 2
    F['SHOP_ZN_BK'] = {'c0': day - 30, 'sent': [1, 2, 3, 4, 5], 'terms': {}, 'last': day - 1, 'moved': day - 1}
    sv.setdefault('contacts', {})['npc_songzn'] = day - 30
    rel = sv.setdefault('social', {}).setdefault('rel', {})
    rel['npc_songzn'] = {'fam': 30, 'trust': 15, 'aff': 0, 'resp': 0, 'comf': 15, 'rom': 0, 'npcRom': 0, 'seen': 3, 'talked': 3, '_migrated': True}
    return sv


async def main():
    print('CC 宋知寧山嵐二樓：SHA %s；FIX %s；Playwright ≠ iPhone' % (SHA or '?', FIX), flush=True)
    sv0 = json.load(open(fix_path(FIX), encoding='utf-8'))
    res = {'sha': SHA, 'tries': [], 'found': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        days = await pg.evaluate(WEEKENDS, {'d0': DAY0, 'n': MAXTRY})
        R.note('要試的週末：%s' % J(days))
        got = {6: 0, 0: 0}
        for dd in days:
            wd = dd['wd']
            if got[wd] >= NEED: continue
            if dd['exam']: R.note('%s 考試週，跳過（考試週店內偶遇只有 cafe、cvs）' % dd['key']); continue
            h = HOUR[wd]; tag = '%s_%s' % (dd['key'], 'sat' if wd == 6 else 'sun')
            r = await pg.evaluate(APPLY, prep(sv0, dd['day'], wd, h))
            R.setup('[%s] 【前置／捷徑】讀檔到 xs_shanlan %s %.1f（第 5 則已發、前一天搬過來；條件事件關掉）' % (tag, dd['key'], h))
            await pg.wait_for_timeout(7000); await L.close_panels(pg, cdp)
            z = await pg.evaluate(ZN)
            res['tries'].append({'tag': tag, 'apply': r, 'zn': z})
            R.note('[%s] 遊戲的決定 %s；她的班 %s；搬了=%s；找到=%s' % (tag, J(z.get('dec')), J(z.get('np')), z.get('moved'), z.get('found')))
            if not z.get('found'): continue
            got[wd] += 1
            # 玩家放到二樓她面前 2 m，再拍
            fx, fz = z['x'] + math.sin(z['yaw']) * 2.0, z['z'] + math.cos(z['yaw']) * 2.0
            yaw_to = math.atan2(z['x'] - fx, z['z'] - fz)
            await pg.evaluate(APPLY, prep(sv0, dd['day'], wd, h, {'x': fx, 'z': fz, 'yaw': yaw_to, 'lv': z['lv']}))
            R.setup('[%s] 【前置／捷徑】同一天同一時段再讀一次檔，玩家放到二樓她面前 2 m（lv %s）' % (tag, z['lv']))
            await pg.wait_for_timeout(7000); await L.close_panels(pg, cdp)
            z2 = await pg.evaluate(ZN)
            same = z2.get('found') and abs(z2['x'] - z['x']) < 0.2 and abs(z2['z'] - z['z']) < 0.2
            R.check('[%s] 再讀一次她還在同一個地方（同一天同一時段＝同一個決定）' % tag, bool(same), J({'a': [z['x'], z['z']], 'b': [z2.get('x'), z2.get('z')]}))
            zz = z2 if z2.get('found') else z
            fy = zz['floor']['y'] if zz.get('floor') else zz['y']
            await pg.screenshot(path=os.path.join(OUT, 'zn_%s_game.png' % tag))
            frm = [zz['x'] + math.sin(zz['yaw']) * 2.2, fy + 1.6, zz['z'] + math.cos(zz['yaw']) * 2.2]
            wsave(await pg.evaluate(SNAP, {'from': frm, 'at': [zz['x'], fy + 1.1, zz['z']], 'fov': 55}), 'zn_%s_front.jpg' % tag)
            a45 = zz['yaw'] + math.pi / 4
            frm2 = [zz['x'] + math.sin(a45) * 3.5, fy + 2.8, zz['z'] + math.cos(a45) * 3.5]
            wsave(await pg.evaluate(SNAP, {'from': frm2, 'at': [zz['x'], fy + 0.6, zz['z']], 'fov': 65}), 'zn_%s_high45.jpg' % tag)
            wsave(await pg.evaluate(SNAP, {'from': [zz['x'], fy + 6.5, zz['z'] + 0.01], 'at': [zz['x'], fy, zz['z']], 'fov': 60}), 'zn_%s_top.jpg' % tag)   # BB-C 08:42：俯視一張（天花板擋到就看 high45）
            side = zz['yaw'] + math.pi / 2   # 腳：從側面 1.3 m、低 0.35 m 平看腳底和地板
            wsave(await pg.evaluate(SNAP, {'from': [zz['x'] + math.sin(side) * 1.3, fy + 0.35, zz['z'] + math.cos(side) * 1.3], 'at': [zz['x'], fy + 0.1, zz['z']], 'fov': 60}), 'zn_%s_feet.jpg' % tag)
            star = []
            if zz.get('gap') is not None and abs(zz['gap']) > 0.08: star.append('★腳離地板 %.3f m' % zz['gap'])
            if zz.get('near_its'): star.append('★1 m 內有互動點 %s' % J(zz['near_its']))
            if zz.get('ring_free') and zz['ring_free'].count(False) >= 5: star.append('★四周 0.8 m 有 %d／8 方向走不過去' % zz['ring_free'].count(False))
            R.note('[%s] 她：lv %s 位置 (%s, %s, y %s)；地板 %s（差 %s）；面向 yaw %s、面前 1.5 m 打到 %s；1 m 內互動點 %s；四周導航 %s；站的地方能走=%s；姿勢 %s；按鈕「%s」；1 m 內最近的家具 %s %s' % (
                tag, zz['lv'], zz['x'], zz['z'], zz['y'], J(zz.get('floor')), zz.get('gap'), zz['yaw'], J(zz.get('front')), J(zz.get('near_its')), J(zz.get('ring_free')), zz.get('here_free'), zz.get('pose'), zz.get('label'), J(zz.get('furn1m')), ' '.join(star)))
            R.check('[%s] 她在二樓（lv 1）' % tag, zz['lv'] == 1, str(zz['lv']))
            res['found'].append({'tag': tag, 'zn': zz, 'stars': star})
        R.check('週六找到她（%d 次）' % got[6], got[6] >= 1, J([t['zn'].get('dec') for t in res['tries'] if t['tag'].endswith('sat')]))
        R.check('週日找到她（%d 次）' % got[0], got[0] >= 1, J([t['zn'].get('dec') for t in res['tries'] if t['tag'].endswith('sun')]))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'zn_shanlan.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
