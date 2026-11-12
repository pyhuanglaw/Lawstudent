"""CC-C 11-12：地點關卡第二層（D154／HV-35；PLACE-GATE-TOOL-1112；規則 RULE_SOURCE 42926c764f docs/rules/ROLE_BB.md 2.6、ROLE_CC.md 2.3）。
起因：使用者 11-12 線上版自己玩 10 分鐘就看到——泰米村食沒店員沒客人、窗戶一片深藍、東南大聯沒天花板、新生南路店外看進去是一張 2D 圖、日常失速一直閃。
這支每個地點（ZONES，區域 id）白天、晚上（HOURS，預設 14、20.5）各走進去一次，機器先判七項（判定歸 BB；判不出來＝UNKNOWN，存圖、exit 1，不准猜成 PASS——ROLE_CC 2.3 第 9 點）：
  ① 店員、客人：櫃檯類互動點（點餐／結帳／櫃台…）2 m 內有 NPC＝店員；其他 NPC＝客人。數字照記，判定照第一層對（這支只標「營業中沒有店員」）。
  ② 往窗外：找區域裡窗玻璃的網格（名字或材質名有 glass／window／窗，或透明材質），投影到「往窗外」那張的畫面上；框內同一色（每通道 32 級量化）超過 80%＝沒窗景（FAIL）；
     找不到窗的網格＝UNKNOWN（標出來給 BB 看圖）。
  ③ 天花板：房間中間 1.6 m 往上打一條射線，6 m 內打到網格＝有；沒打到而且往上拍那張「天空色」≥30%＝沒天花板（FAIL）；沒打到、天空色不到＝UNKNOWN。
  ④ 純色／洋紅：每張洋紅像素（r>170、b>140、g<90）≥0.5%＝FAIL；最大的同一色區塊 ≥60%＝標出來（UNKNOWN，給 BB 看是不是牆）。
  ⑤ 店外往裡看的視差：門外 spawn 往門看，鏡頭左右各移 1.5 m 再拍（三張都對準門那一點）；畫面中間 30% 兩兩比，平均差 < PAR_LO＝幾乎一樣＝貼了一張圖（FAIL）；
     > PAR_HI＝有立體（PASS）；中間＝UNKNOWN。門檻先用有問題的版本校正（新生南路櫥窗、汀州路對照）。
  ⑥ 閃：①、② 兩個鏡頭各轉 0.05° 前後兩張逐點比（同 cc_shop_flicker_probe），亮度差 >40 的像素比例 ≥ZF_HI＝閃（FAIL）、≤ZF_LO＝PASS、中間 UNKNOWN；
     另外走動＋轉鏡頭 5 秒連拍（每 0.2 秒，遊戲鏡頭），8×8 區塊亮度來回跳 ≥3 次的區塊數照記（給 BB 看）。
  ⑦ 做得到：點餐／買一樣（選單照字選第一個能點的、再「點好了」；錢有扣或說了話）、坐下（第一張位子，D.sit_all）、走到「離開…」按了換區域；主控台 console.error＋pageerror 0。
  每間每個時間一張拼圖 gate_<區域>_<時間>.jpg（標★的是機器判 FAIL／UNKNOWN 的項目）＋ gate.json。
【前置／捷徑】load_zone 讀檔進店（區域出生點）／門外（出口的 spawn）；5 秒連拍的轉鏡頭直接設 E.cam.yaw（只為了看閃）。Windows＋GPU（Playwright 有視窗）≠ iPhone。
CC_02 清單 2026-11-12：1✓（營業時間：讀檔進不去＝記「沒開」跳過，不判） 2✓（房間、門、櫃檯、窗網格全從遊戲當下讀） 3✓（點餐選單照順序試第一個能點的；位子取第一張） 4✓（選單照字、按互動鍵前看字） 5✓（go_to 分段、到了看互動鍵） 6✓（等 ASSETS 載完再拍） 7✓ 8✓（門檻：80%／30%／0.5% 是規則原文或 CC 訂的參考值；天花板以往上拍天空≥30% 為準（bd86 東南大聯校正）；視差、閃的門檻先在有問題的版本校正，判不出來＝UNKNOWN） 9✓（拍照鏡頭先跑 fadeWalls；店內照不藏玩家；⑤視差三張藏玩家與路人，只比店面） 10✓ 11✓ 12✓（每項記證據數字） 13✓
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> ZONES=tz_taimi,… [HOURS=14,20.5] [PARTS=1,2,3,4,5,6,7] [PAR_LO=4 PAR_HI=10 ZF_LO=0.3 ZF_HI=1.5] python3 cc_place_gate_probe.py <url> <out>"""
import os, sys, json, asyncio, base64, math, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
TAG = os.environ.get('TAG') or 'x'
ZONES = [z for z in (os.environ.get('ZONES') or 'tz_taimi').split(',') if z]
HOURS = [float(h) for h in (os.environ.get('HOURS') or '14,20.5').split(',') if h]
PARTS = set((os.environ.get('PARTS') or '1,2,3,4,5,6,7').split(','))
PAR_LO, PAR_HI = float(os.environ.get('PAR_LO') or '4'), float(os.environ.get('PAR_HI') or '10')
ZF_LO, ZF_HI = float(os.environ.get('ZF_LO') or '0.3'), float(os.environ.get('ZF_HI') or '1.5')
R = L.Run('gate_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2025-10-22'
SETTLED = "(async()=>{ for(let i=0;i<120;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
ROOM_JS = r"""(()=>{ const E=GAME.E, N=E.nav, f=v=>+(+v).toFixed(2); let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,n=0;
  if(N&&N.cols){ for(let j=0;j<N.rows;j++) for(let i=0;i<N.cols;i++){ const w=N.toWorld(i,j); if(E.canStand(w[0],w[1],0.3,0)){ n++; x0=Math.min(x0,w[0]); x1=Math.max(x1,w[0]); z0=Math.min(z0,w[1]); z1=Math.max(z1,w[1]); } } }
  const IT=(E.interactables||[]).filter(i=>!i.hidden); const lab=i=>String(typeof i.label==='function'?i.label():i.label||'');
  const ex=IT.filter(i=>i.exit).sort((a,b)=>(lab(b).startsWith('離開')?1:0)-(lab(a).startsWith('離開')?1:0))[0]||null;
  const ct=IT.filter(i=>!i.exit&&!i.seat&&/點餐|結帳|櫃|收銀|吧台|吧檯|點飲料|買|店員|老闆/.test(lab(i)))[0]||null;
  const seat=IT.filter(i=>i.seat)[0]||null;
  return {n, box:n?[f(x0),f(x1),f(z0),f(z1)]:null, c:n?[f((x0+x1)/2),f((z0+z1)/2)]:null, exit:ex?{x:f(ex.x),z:f(ex.z),label:lab(ex),to:ex.exit.to||null,spawn:ex.exit.spawn||null}:null,
    counter:ct?{x:f(ct.x),z:f(ct.z),label:lab(ct)}:null, seat:seat?{x:f(seat.seat.x),z:f(seat.seat.z),label:lab(seat)}:null, name:(E.zone&&E.zone.name)||GAME.G.zone}; })()"""
PEOPLE_JS = r"""(a=>{ const E=GAME.E, f=v=>+(+v).toFixed(2); const P=(E.npcs||[]).filter(n=>n&&n.obj&&n.obj.visible!==false).map(n=>({id:n.charId||n.id||'', x:f(n.obj.position.x), z:f(n.obj.position.z)}));
  const clerk=a?P.filter(p=>Math.hypot(p.x-a.x,p.z-a.z)<2):[]; return {total:P.length, clerk:clerk.length, customers:P.length-clerk.length, people:P.slice(0,10)}; })"""
# 拍照：另一台相機（先跑 fadeWalls，同 cc_tingzhou_probe）；同時回傳窗玻璃網格投影到畫面上的框（0～1）
SNAPX = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||60, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  const z=E.zone, P=E.player&&E.player.obj; if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  const rects=[]; if(a.win){ const isWin=o=>{ const m=o.material, mn=(m&&(Array.isArray(m)?m.map(x=>x&&x.name).join(' '):m.name))||''; return /glass|window|窗|vitrine/i.test((o.name||'')+' '+mn)||(m&&!Array.isArray(m)&&m.transparent&&m.opacity<0.9&&m.opacity>0.05); };
    const root=(z&&z.group)||E.scene; root.traverse(o=>{ if(!o.isMesh||!o.visible||!isWin(o)) return; const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) return; const pts=[];
      for(const x of [b.min.x,b.max.x]) for(const y of [b.min.y,b.max.y]) for(const zz of [b.min.z,b.max.z]){ const v=new THREE.Vector3(x,y,zz).project(cam); if(v.z<1&&v.z>-1) pts.push([(v.x+1)/2,(1-v.y)/2]); }
      if(pts.length<2) return; let x0=Math.max(0,Math.min(...pts.map(p=>p[0]))), x1=Math.min(1,Math.max(...pts.map(p=>p[0]))), y0=Math.max(0,Math.min(...pts.map(p=>p[1]))), y1=Math.min(1,Math.max(...pts.map(p=>p[1])));
      if(x1-x0>0.03&&y1-y0>0.03) rects.push([+x0.toFixed(3),+y0.toFixed(3),+x1.toFixed(3),+y1.toFixed(3),String(o.name||'').slice(0,24)]); }); }
  try{ r.render(E.scene,cam); return {u:c.toDataURL('image/png'), rects}; } finally { if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } } })"""
ANA_JS = r"""(async a=>{ const im=await new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=a.u; }); const W=200, H=Math.round(200*im.height/im.width);
  const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d'); g.drawImage(im,0,0,W,H); const d=g.getImageData(0,0,W,H).data;
  const bin=(x0,y0,x1,y1)=>{ const m=new Map(); let n=0; for(let y=Math.floor(y0*H);y<Math.ceil(y1*H);y++) for(let x=Math.floor(x0*W);x<Math.ceil(x1*W);x++){ const o=(y*W+x)*4, key=(d[o]>>3)+'_'+(d[o+1]>>3)+'_'+(d[o+2]>>3); m.set(key,(m.get(key)||0)+1); n++; }
    let best=0, bk=null; for(const [kk,v] of m) if(v>best){ best=v; bk=kk; } return {top_pct:n?+(best*100/n).toFixed(1):0, top_rgb:bk?bk.split('_').map(v=>v*8+4):null, n}; };
  let mag=0, sky=0, n3=0; for(let i=0;i<d.length;i+=4){ if(d[i]>170&&d[i+2]>140&&d[i+1]<90) mag++; } for(let y=0;y<Math.floor(H/3);y++) for(let x=0;x<W;x++){ const o=(y*W+x)*4; n3++; if(d[o+2]>d[o]+20&&d[o+2]>=d[o+1]&&d[o+2]>=60) sky++; }
  let skyAll=0; for(let i=0;i<d.length;i+=4){ if(d[i+2]>d[i]+20&&d[i+2]>=d[i+1]&&d[i+2]>=60) skyAll++; }
  return {magenta_pct:+(mag*100/(W*H)).toFixed(2), sky_top_pct:+(sky*100/n3).toFixed(1), sky_all_pct:+(skyAll*400/d.length).toFixed(1), whole:bin(0,0,1,1), rects:(a.rects||[]).map(r=>Object.assign({rect:r},bin(r[0],r[1],r[2],r[3])))}; })"""
CROPDIFF_JS = r"""(async a=>{ const load=u=>new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=u; }); const ims=await Promise.all(a.us.map(load)); const W=120, H=Math.round(120*ims[0].height/ims[0].width);
  const px=ims.map(im=>{ const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d'); g.drawImage(im,0,0,W,H); return g.getImageData(Math.floor(W*0.35),Math.floor(H*0.35),Math.ceil(W*0.3),Math.ceil(H*0.3)).data; });
  const md=(A,B)=>{ let s=0,n=0; for(let i=0;i<A.length;i+=4){ s+=Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2]); n+=3; } return +(s/n).toFixed(2); };
  return {lc:md(px[0],px[1]), cr:md(px[1],px[2]), lr:md(px[0],px[2])}; })"""
ZF_JS = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement, W=200, H=Math.round(200*c.height/c.width); const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d',{willReadFrequently:true});
  const cam=new THREE.PerspectiveCamera(60, c.width/c.height, 0.05, 400); const z=E.zone, P=E.player&&E.player.obj;
  const shot=yaw=>{ cam.position.set(...a.from); cam.rotation.set(0,0,0); cam.lookAt(...a.at); cam.rotateY(yaw); cam.updateMatrixWorld(true); if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } r.render(E.scene,cam); g.drawImage(c,0,0,W,H); return g.getImageData(0,0,W,H).data; };
  const out=[]; for(let i=0;i<12;i++){ const b=(i-6)*0.004; const A=shot(b), B=shot(b+0.05*Math.PI/180); let n=0,m=0; for(let y=Math.floor(H*0.15);y<Math.floor(H*0.85);y++) for(let x=Math.floor(W*0.15);x<Math.floor(W*0.85);x++){ const o=(y*W+x)*4; const la=0.299*A[o]+0.587*A[o+1]+0.114*A[o+2], lb=0.299*B[o]+0.587*B[o+1]+0.114*B[o+2]; m++; if(Math.abs(la-lb)>40) n++; } out.push(+(n*100/m).toFixed(3)); }
  if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } r.render(E.scene,E.camera); const s=out.slice().sort((x,y)=>x-y); return {pct:out, median:s[6], max:s[11]}; })"""
CEIL_JS = r"""(a=>{ const E=GAME.E, rc=new THREE.Raycaster(new THREE.Vector3(a[0],1.6,a[1]), new THREE.Vector3(0,1,0), 0.05, 6); const ex=new Set(); const P=E.player&&E.player.obj; if(P) P.traverse(o=>ex.add(o)); for(const n of (E.npcs||[])) if(n.obj) n.obj.traverse(o=>ex.add(o));
  const h=rc.intersectObjects(E.scene.children,true).filter(x=>x.object.visible!==false&&!ex.has(x.object))[0]; return h?{hit:true, d:+h.distance.toFixed(2), name:String(h.object.name||'').slice(0,30)}:{hit:false}; })"""
BURST_JS = r"""(async a=>{ const E=GAME.E, r=E.renderer, c=r.domElement, W=64, H=Math.round(64*c.height/c.width), k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d',{willReadFrequently:true});
  const B=8, bw=Math.floor(W/B), bh=Math.floor(H/B), seq=[]; const y0=E.cam.yaw;
  for(let f=0;f<25;f++){ E.cam.yaw=y0+f*0.01; await new Promise(res=>setTimeout(res,200)); r.render(E.scene,E.camera); g.drawImage(c,0,0,W,H); const d=g.getImageData(0,0,W,H).data; const v=[];
    for(let by=0;by<B;by++) for(let bx=0;bx<B;bx++){ let s=0,n=0; for(let y=by*bh;y<(by+1)*bh;y++) for(let x=bx*bw;x<(bx+1)*bw;x++){ const o=(y*W+x)*4; s+=0.299*d[o]+0.587*d[o+1]+0.114*d[o+2]; n++; } v.push(s/n); } seq.push(v); }
  E.cam.yaw=y0; let flick=0; const per=[]; for(let i=0;i<B*B;i++){ let flips=0, prev=0; for(let f=1;f<seq.length;f++){ const dd=seq[f][i]-seq[f-1][i]; if(Math.abs(dd)>12){ const sg=Math.sign(dd); if(prev&&sg!==prev) flips++; prev=sg; } } per.push(flips); if(flips>=3) flick++; }
  return {blocks_flipping:flick, max_flips:Math.max(...per)}; })"""
SHEET_JS = r"""(async a=>{ const ims=await Promise.all(a.urls.map(u=>new Promise(res=>{ if(!u) return res(null); const q=new Image(); q.onload=()=>res(q); q.onerror=()=>res(null); q.src=u; })));
  const w=420, h=236, cols=4, rows=Math.ceil(ims.length/cols), k=document.createElement('canvas'); k.width=w*cols; k.height=h*rows+56; const g=k.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,k.width,k.height);
  g.fillStyle='#fff'; g.font='bold 18px sans-serif'; g.fillText(a.title,8,22); g.font='13px sans-serif'; g.fillStyle='#ffd24d'; g.fillText(a.verdict,8,46);
  ims.forEach((im,i)=>{ const x=(i%cols)*w, y=56+Math.floor(i/cols)*h; if(im) g.drawImage(im,x,y,w,h); g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(x,y,w,20); g.fillStyle=a.flags[i]?'#ff6b6b':'#fff'; g.fillText(a.labels[i]+(a.flags[i]?'  ★'+a.flags[i]:''),x+4,y+15);
    if(im&&a.rects&&a.rects[i]) for(const r of a.rects[i]){ g.strokeStyle='#00e5ff'; g.lineWidth=2; g.strokeRect(x+r[0]*w,y+r[1]*h,(r[2]-r[0])*w,(r[3]-r[1])*h); } });
  return k.toDataURL('image/jpeg',0.85); })"""
HIDE_PEOPLE = "(h=>{ const E=GAME.E; const L=[E.player].concat(E.npcs||[]); for(const n of L){ if(n&&n.obj){ if(h){ n.obj.userData._ccv=n.obj.visible; n.obj.visible=false; } else if(n.obj.userData._ccv!==undefined){ n.obj.visible=n.obj.userData._ccv; delete n.obj.userData._ccv; } } } return L.length; })"
GAMECAM = "(()=>{ const E=GAME.E, r=E.renderer; r.render(E.scene,E.camera); return r.domElement.toDataURL('image/png'); })()"


def v3(lo, hi, x, low_bad):
    """門檻判斷：low_bad＝數字小是壞的（視差）；否則數字大是壞的（閃）"""
    if low_bad: return 'FAIL' if x < lo else ('PASS' if x > hi else 'UNKNOWN')
    return 'PASS' if x <= lo else ('FAIL' if x >= hi else 'UNKNOWN')


async def snap(pg, frm, at, fov=60, win=False):
    return await pg.evaluate(SNAPX, {'from': list(frm), 'at': list(at), 'fov': fov, 'win': win})


async def do_func(pg, cdp, tag, rm, zid):
    res = {}
    ct = rm['counter']
    if ct:
        m0 = await pg.evaluate("GAME.G.money|0")
        ok_reach = False
        for k in range(3):
            q = await D.st(pg)
            if q['interact'].startswith(ct['label'][:4]): ok_reach = True; break
            await L.go_to(pg, cdp, R, ct['x'], ct['z'], 0.8 if k == 0 else 0.5, '%s ⑦ 走到「%s」（第 %d 段）' % (tag, ct['label'], k + 1), max_s=30)
            await pg.wait_for_timeout(600)
        q = await D.st(pg); ok_reach = ok_reach or q['interact'].startswith(ct['label'][:4])
        said = 0; picked = []
        if ok_reach:
            await L.tap(pg, cdp, '#interact'); t0 = time.time()
            while time.time() - t0 < 60:
                q = await D.st(pg)
                if q['choices']:
                    opts = q['choices']; bad = ('不用了', '算了', '離開', '返回', '不買', '下次', '先不要')
                    k = next((i for i, t in enumerate(opts) if t.startswith('點好了') or t.startswith('結帳')), None) if picked else None
                    if k is None: k = next((i for i, t in enumerate(opts) if not any(t.startswith(b) for b in bad)), 0)
                    picked.append(opts[k]); await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(900)
                    if len(picked) > 8: break
                    continue
                if q['dlg']: said += 1; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
                if not q['busy']: break
                await pg.wait_for_timeout(400)
        m1 = await pg.evaluate("GAME.G.money|0")
        res['order'] = {'reach': ok_reach, 'picked': picked, 'said': said, 'money': [m0, m1], 'verdict': 'PASS' if ok_reach and (m1 < m0 or said > 0) else ('FAIL' if ok_reach else 'UNKNOWN')}
    else:
        res['order'] = {'verdict': 'UNKNOWN', 'why': '沒有點餐／結帳類的互動點（這間可能不賣東西：交 BB 看）'}
    if rm['seat']:
        rs = await D.sit_all(pg, cdp, tag + ' ⑦', 'gate_%s_%s_seat' % (TAG, zid), only=[(rm['seat']['x'], rm['seat']['z'])])
        res['sit'] = {'res': rs, 'verdict': 'PASS' if rs and rs[0][1] in ('ok', 'occupied') else 'FAIL'}
    else:
        res['sit'] = {'verdict': 'n/a', 'why': '沒有位子'}
    ex = rm['exit']; ok_out = False
    for k in range(3):
        q = await D.st(pg)
        if q['interact'].startswith('離開') or q['interact'].startswith(ex['label'][:3]): break
        await L.go_to(pg, cdp, R, ex['x'], ex['z'], 0.6, '%s ⑦ 走到「%s」（第 %d 段）' % (tag, ex['label'], k + 1), max_s=40); await pg.wait_for_timeout(600)
    q = await D.st(pg)
    if q['interact'].startswith(ex['label'][:3]):
        await L.tap(pg, cdp, '#interact'); s = await D.wait_zone(pg, cdp, ex['to'] or '', 20); ok_out = s['zone'] != zid
    res['out'] = {'verdict': 'PASS' if ok_out else 'FAIL', 'zone_after': (await D.st(pg))['zone']}
    return res


async def gate_zone(pg, cdp, zid, h, rows, cons):
    hh = '%02d%02d' % (int(h), int(round((h % 1) * 60))); tag = '[%s %s]' % (zid, hh)
    s = await D.load_zone(pg, cdp, zid, DAY, h, wait=8000)
    R.setup('%s 【前置／捷徑】讀檔進 %s %s %.2f 時（區域的出生點）、錢補到 5000（⑦ 要買得起）' % (tag, zid, DAY, h))
    await pg.evaluate("(()=>{ if(GAME.G) GAME.G.money=Math.max(GAME.G.money|0,5000); })()")
    await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
    row = {'zone': zid, 'hour': h, 'v': {}, 'm': {}}
    if s['zone'] != zid:
        R.note('%s 讀檔以後在 %s＝沒開／進不去，這個時間跳過（不判）' % (tag, s['zone'])); row['skipped'] = 'closed:' + s['zone']; rows.append(row); return
    c0 = len(cons)
    rm = await pg.evaluate(ROOM_JS); row['room'] = rm
    if not R.check('%s 量得到房間範圍、有門' % tag, bool(rm['box']) and bool(rm['exit']), J(rm)): rows.append(row); return
    cx, cz = rm['c']; ex, ez = rm['exit']['x'], rm['exit']['z']; dx, dz = cx - ex, cz - ez; m = math.hypot(dx, dz) or 1; ux, uz = dx / m, dz / m
    ck = rm['counter'] or {'x': cx + ux * m * 0.8, 'z': cz + uz * m * 0.8, 'label': '（沒有櫃檯類互動點）'}
    # ① 人
    ppl = await pg.evaluate(PEOPLE_JS, rm['counter']); row['m']['people'] = ppl
    row['v']['1_clerk'] = 'PASS' if ppl['clerk'] > 0 else ('FAIL' if rm['counter'] else 'UNKNOWN')
    await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(400)
    s1 = await snap(pg, (ex + ux * 1.0, 1.6, ez + uz * 1.0), (cx + ux * m * 0.8, 1.2, cz + uz * m * 0.8), 66)
    s2 = await snap(pg, (cx, 1.6, cz), (ex - ux * 2.0, 1.8, ez - uz * 2.0), 60, win=True)
    vx, vz = cx - ck['x'], cz - ck['z']; vm = math.hypot(vx, vz) or 1
    s3 = await snap(pg, (ck['x'] + vx / vm * 2.5, 1.6, ck['z'] + vz / vm * 2.5), (ck['x'], 1.1, ck['z']), 60)
    sup = await snap(pg, (cx, 1.6, cz), (cx + 0.01, 8.0, cz + 0.3), 70)
    u5 = await pg.evaluate(GAMECAM)
    a1 = await pg.evaluate(ANA_JS, {'u': s1['u']}); a2 = await pg.evaluate(ANA_JS, {'u': s2['u'], 'rects': s2['rects']}); a3 = await pg.evaluate(ANA_JS, {'u': s3['u']})
    aup = await pg.evaluate(ANA_JS, {'u': sup['u']}); a5 = await pg.evaluate(ANA_JS, {'u': u5})
    # ② 窗景
    if a2['rects']:
        worst = max(a2['rects'], key=lambda r: r['top_pct']); row['m']['window'] = {'rects': a2['rects'][:6]}
        row['v']['2_window'] = 'FAIL' if worst['top_pct'] > 80 else 'PASS'
        row['m']['window']['worst'] = [worst['top_pct'], worst['top_rgb'], worst['rect'][4]]
    else:
        row['v']['2_window'] = 'UNKNOWN'; row['m']['window'] = {'why': '找不到窗玻璃的網格（名字／材質沒有 glass、window、窗，也沒有半透明材質）'}
    # ③ 天花板
    ce = await pg.evaluate(CEIL_JS, [cx, cz]); row['m']['ceiling'] = {'ray': ce, 'sky_up_pct': aup['sky_all_pct'], 'sky_top_entry': a1['sky_top_pct'], 'sky_top_counter': a3['sky_top_pct']}
    # 往上拍是主要證據（bd86 東南大聯沒天花板：往上 100% 天空，但射線打到 1.5 m 高的吊燈／彩旗，舊判法誤判 PASS）
    if aup['sky_all_pct'] >= 30: row['v']['3_ceiling'] = 'FAIL'
    elif ce['hit'] and ce['d'] >= 1.0: row['v']['3_ceiling'] = 'PASS'
    else: row['v']['3_ceiling'] = 'UNKNOWN'
    # ④ 純色／洋紅
    mags = {k: a['magenta_pct'] for k, a in (('1', a1), ('2', a2), ('3', a3), ('5', a5))}; flat = {k: a['whole']['top_pct'] for k, a in (('1', a1), ('2', a2), ('3', a3), ('5', a5))}
    row['m']['solid'] = {'magenta': mags, 'flat_top_pct': flat}
    row['v']['4_solid'] = 'FAIL' if max(mags.values()) >= 0.5 else ('UNKNOWN' if max(flat.values()) >= 60 else 'PASS')
    # ⑥ 閃（固定鏡頭轉 0.05°）＋5 秒連拍
    if '6' in PARTS:
        z1 = await pg.evaluate(ZF_JS, {'from': [ex + ux * 1.0, 1.6, ez + uz * 1.0], 'at': [cx + ux * m * 0.8, 1.2, cz + uz * m * 0.8]})
        z2 = await pg.evaluate(ZF_JS, {'from': [cx, 1.6, cz], 'at': [ex - ux * 2.0, 1.8, ez - uz * 2.0]})
        bu = await pg.evaluate(BURST_JS, {})
        zmax = max(z1['median'], z2['median']); row['m']['flicker'] = {'zf_entry': z1, 'zf_window': z2, 'burst': bu}
        row['v']['6_flicker'] = v3(ZF_LO, ZF_HI, zmax, low_bad=False)
    await pg.evaluate(D.HUD + '(true)')
    # ⑦ 做得到
    fn = None
    if '7' in PARTS:
        try: fn = await do_func(pg, cdp, tag, rm, zid)
        except Exception as e: fn = {'error': repr(e)[:200]}
        row['m']['func'] = fn
        vs = [x.get('verdict') for x in (fn or {}).values() if isinstance(x, dict)]
        row['v']['7_func'] = 'FAIL' if 'FAIL' in vs or (fn or {}).get('error') else ('UNKNOWN' if 'UNKNOWN' in vs else 'PASS')
    # ⑤ 店外往裡看（三個位置）
    sp = rm['exit']['spawn']; oz = rm['exit']['to']; s4 = s4l = s4r = None
    if sp and oz and '5' in PARTS:
        s2z = await D.load_zone(pg, cdp, oz, DAY, h, x=sp['x'], z=sp['z'], yaw=sp.get('yaw', 0.0), wait=8000)
        R.setup('%s 【前置／捷徑】讀檔到門外 %s (%.2f, %.2f)' % (tag, oz, sp['x'], sp['z']))
        await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
        oy = sp.get('yaw', 0.0); fx, fz = math.sin(oy), math.cos(oy); px, pz = fz, -fx
        tgt = (sp['x'] - fx * 2.0, 1.4, sp['z'] - fz * 2.0); base = (sp['x'] + fx * 2.5, 1.6, sp['z'] + fz * 2.5)
        await pg.evaluate(D.HUD + '(false)')
        await pg.evaluate(HIDE_PEOPLE + '(true)')  # 視差只看店面：玩家、路人在畫面中間會把差值灌高
        s4 = await snap(pg, base, tgt); s4l = await snap(pg, (base[0] - px * 1.5, 1.6, base[2] - pz * 1.5), tgt); s4r = await snap(pg, (base[0] + px * 1.5, 1.6, base[2] + pz * 1.5), tgt)
        await pg.evaluate(HIDE_PEOPLE + '(false)'); await pg.evaluate(D.HUD + '(true)')
        pd = await pg.evaluate(CROPDIFF_JS, {'us': [s4l['u'], s4['u'], s4r['u']]}); a4 = await pg.evaluate(ANA_JS, {'u': s4['u']})
        pmin = min(pd['lc'], pd['cr']); row['m']['parallax'] = pd; row['m']['outside_magenta'] = a4['magenta_pct']
        row['v']['5_parallax'] = v3(PAR_LO, PAR_HI, pmin, low_bad=True)
    elif '5' in PARTS:
        row['v']['5_parallax'] = 'UNKNOWN'; row['m']['parallax'] = {'why': '出口沒有 spawn／to'}
    errs = cons[c0:]; row['m']['console'] = errs[:5]
    row['v']['7_console'] = 'PASS' if not errs else 'FAIL'
    # 拼圖
    labels = ['① 進門全景', '② 往窗外（青框＝窗網格）', '③ 櫃檯：' + ck['label'][:8], '③ 往上（天花板）', '⑤ 店外 中', '⑤ 店外 左 1.5 m', '⑤ 店外 右 1.5 m', '遊戲鏡頭']
    urls = [s1['u'], s2['u'], s3['u'], sup['u'], s4 and s4['u'], s4l and s4l['u'], s4r and s4r['u'], u5]
    fl = ['', '' if row['v'].get('2_window') == 'PASS' else row['v'].get('2_window', ''), '', '' if row['v'].get('3_ceiling') == 'PASS' else row['v'].get('3_ceiling', ''),
          '' if row['v'].get('5_parallax') in ('PASS', None) else row['v'].get('5_parallax'), '', '', '']
    verdict = '  '.join('%s=%s' % (k, v) for k, v in sorted(row['v'].items()))
    sh = await pg.evaluate(SHEET_JS, {'urls': urls, 'labels': labels, 'flags': fl, 'rects': [None, [r['rect'] for r in a2.get('rects', [])], None, None, None, None, None, None],
                                      'title': '%s %s %s（%s，%s）' % (rm['name'], zid, hh, TAG, SHA[:9]), 'verdict': verdict})
    open(os.path.join(OUT, 'gate_%s_%s.jpg' % (zid, hh)), 'wb').write(base64.b64decode(sh.split(',', 1)[1]))
    for i, u in enumerate(urls):
        if u: open(os.path.join(OUT, 'gate_%s_%s_%d.png' % (zid, hh, i + 1)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
    R.note('%s 【機器判】%s；證據 %s' % (tag, verdict, J({k: row['m'].get(k) for k in ('people', 'ceiling', 'parallax', 'solid')})))
    R.note('%s 窗 %s；閃 %s；做得到 %s' % (tag, J(row['m'].get('window')), J({k: (v.get('median') if isinstance(v, dict) and 'median' in v else v) for k, v in (row['m'].get('flicker') or {}).items()}), J(fn)[:600]))
    for k, v in sorted(row['v'].items()):
        if v == 'FAIL': R.check('%s %s 機器判 FAIL' % (tag, k), False, J(row['m'].get({'1_clerk': 'people', '2_window': 'window', '3_ceiling': 'ceiling', '4_solid': 'solid', '5_parallax': 'parallax', '6_flicker': 'flicker', '7_func': 'func', '7_console': 'console'}.get(k, k)))[:400])
        elif v == 'UNKNOWN': R.check('%s %s 機器判不出來＝UNKNOWN（交 BB 看圖；不能當 PASS）' % (tag, k), False, J(row['m'].get({'1_clerk': 'people', '2_window': 'window', '3_ceiling': 'ceiling', '4_solid': 'solid', '5_parallax': 'parallax', '6_flicker': 'flicker', '7_func': 'func'}.get(k, k)))[:400])
    rows.append(row)


async def main():
    print('CC 地點關卡第二層：TAG %s；SHA %s；ZONES %s；HOURS %s；Windows＋GPU ≠ iPhone' % (TAG, SHA or '?', ','.join(ZONES), HOURS), flush=True)
    rows = []; cons = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('console', lambda m: cons.append(m.text[:200]) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: cons.append('pageerror: ' + str(e)[:200]))
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for zid in ZONES:
            for h in HOURS:
                try: await gate_zone(pg, cdp, zid, h, rows, cons)
                except Exception as e: R.check('[%s %s] 沒有中斷' % (zid, h), False, repr(e)[:300])
                open(os.path.join(OUT, 'gate_%s.json' % TAG), 'w', encoding='utf-8').write(J({'sha': SHA, 'tag': TAG, 'rows': rows}))
        await b.close()
    summ = {}
    for r in rows:
        for k, v in (r.get('v') or {}).items(): summ.setdefault(k, {}).setdefault(v, []).append('%s@%s' % (r['zone'], r['hour']))
    print('【總表】' + J(summ), flush=True)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
