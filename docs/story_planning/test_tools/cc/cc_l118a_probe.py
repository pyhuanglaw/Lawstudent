"""CC（帳號 A）11-11：L118A——118 巷 3D 第 1 版（LAWWW2 L118-SHOPS-REDO-1111，X338；BB_335 D、F 節）。Playwright 手機模擬（PC GPU）≠ iPhone。
受測：開發分支 bc407bfc5（＝bcea920be 九間室內第 1 版到齊＋LAWWW2 四間室內第 2 版；含 27bbb3b89、含 64add9fcf 第二批：飲料店立面照參考圖、118牛排自助台上方海報、辛亥韓食茶水桶、水上便當吊牌；27bbb3b89：奈良咖哩、迪倫窯烤披薩、義大麵屋；bcea920be：五湖四海、大學食堂）；
  九間都是新室內（dian、self、korea、tea、omu、noodle2、pasta、home、cafe2），預設九間同一套。舊版對照 779ddd650（舊店名、舊模型）。
對照的程式：src/data/lane118_layout.js（店 id、side、z0／z1；立面 x ±5.2、人行道 ±3.4～±5.2）、src/data/l118_shop_layouts.js（室內 bounds、door、spawn、exits、street.door／spawn_out、seats）、
  src/l118_shops3d.js（店內區域 l118_<id>、座位按鈕「坐下」、出口「離開○○」、門外窗景 W3.VIEW_LAYERS／l118_window_view）、src/zones3d.js buildLane118（店門口互動點 x＝立面±0.9、z＝店中間；「進○○」）、
  src/lane118.js（L118.isOpen：營業時間）。
時間：DAY＝2025-10-08（三）（避開 10-06 中秋、10-10 國慶、10-13 颱風；九間店星期三都開）。外觀 14:00、20:00（照 BB；外觀不看開店與否）；
  室內、門、座位 13:00（九間都開；14:00 九間都已經休息）；VIEWS 13:00＋19:15（窗景換夜景照片 19.2 以後）。
截圖：【捷徑機位】＝暫停遊戲、獨立擺鏡頭（D.CAM，1280×720，藏 HUD、藏玩家），檔名帶 _cam；【遊戲鏡頭】＝遊戲自己的跟隨鏡頭（844×390 手機橫向截圖），檔名帶 _game。
走路一律搖桿（CDP 觸控按 #joy；方向照 E.pathTo 的下一段，像玩家知道往哪走）；按鈕一律觸控點 #interact、#dlg、選項。讀檔只當前置條件，印【前置／捷徑】。
PARTS（逗號分隔；店相關的可以加 _<店 id>，座位可以再加 _<起>-<迄>（從 1 起、含迄））：
  EXT14 EXT20   十一間（九間＋兩間飲料店）正面＋招牌近拍【捷徑機位】（ONLY_SHOPS 可限定）
  INTFRONT      九間室內（SHOPS 可改）：門口往裡、最裡面往門口【捷徑機位】、進門那一刻【遊戲鏡頭】、近照（118牛排自助台上方海報、辛亥韓食茶水桶、水上便當吊牌、奈良咖哩地板）（別名 INT_FRONT）
  DRINK         兩間飲料店：互動點、搖桿沿人行道和路邊來回走（擋不擋路）、站窗口按鈕、買一杯；118 巷導航格存檔（拼圖時和舊版比）
  LANEWALK      14:00、20:00 各一輪（HOURS 可改）：從巷底（後門）搖桿走到巷口、再走回來；每趟 4 張【遊戲鏡頭】；巷子中間 6 秒幀率
  CORNERS       四角＋最裡面各一張【遊戲鏡頭】（CAMDIAG2 判準；看得到人＝吊牌、隔間沒擋住玩家）；辛亥韓食、五湖四海最裡面鏡頭每 45° 一張轉一圈（煮水餃區整組淡出怪不怪；SPIN=1 其他店也轉）；最後走回出口、出店
  SEATS         （BB 07:13）走到 seatApproach 互動鍵被搶（不是坐下／坐吧檯／坐窗邊）時：0.4 m 內的 NPC（seat／seatTarget）、E.zone.seats 那一張的 taken、
                那張的互動點（有沒有、hidden）、照 engine3d nearestInteractable 算的全部分數排序；沒人佔＝印「⚠空椅子被搶」＋截圖；再從椅子前後左右 0.5～0.7 m 各試一次。
                五湖四海 (0.5,−0.9)：從椅子後面 (0.5,−1.5) 搖桿走近，記互動鍵與分數（有人坐就【捷徑】換時間、再不行請路人離開，標清楚）。
                每張椅子：搖桿走到 seatApproach → 按「坐下」→ player.seat、位置／高度 → 穿模（骨頭連線射線打桌椅）→ 截圖 → 起身 → 搖桿四方向推得動 ≥0.3 m；
                高腳椅（seat.lift）另記骨盆（hips 骨頭）高度－椅面高度（0.47＋lift）、腳骨頭高度、小腿／腳線段有沒有打到吧台
  WALLWALK      沿牆（離房間邊 0.45 m 的長方形，每 1 m 一點，貼到人站得住的格子）搖桿走一圈，記卡住的點
  DOORS         街上「進○○」→ 店裡出生點 → 「離開○○」→ 街上站的位置；室內門 x 換算成街上 z（W 側 z＝店中心 z－門x、E 側 z＝店中心 z＋門x），標記圖【捷徑機位】
  VIEWS         九間店裡往門外看【捷徑機位】（13:00、19:15）＋窗景平面用的照片（沒重拍＝現況）
  VIEWSNEW      先用 cc_shop_views_gg.py（＝tools/shots/shop_views_layers.py 的 PC 版）重拍九間門外景，有 webp（PC 有 numpy／PIL）就放進受測 worktree 再拍窗外；
                VIEWS_DIR＝cc-testing 上已經去背好的資料夾（雲端 VIEWS_REMATTE 後）就不重拍、直接用那一份。拍完把 worktree 的原檔放回去
  KITCHEN       四間第 2 版（dian、self、korea、tea）：開放式廚房／出菜口一張、招牌物件近照（每桌鐵板牛排、配菜櫃炸物＋保溫燈＋吊牌、木頭製麵檯＋麵團＋削麵刀、每桌小菜）【捷徑機位】；
                辛亥韓食天花板深紅橫樑：搖桿走到店中間 → 兩指捏合把遊戲鏡頭拉到最遠（室內 6 m）一張、再往下拖到最大俯角一張【遊戲鏡頭】（橫樑只有朝下和兩側的面，看上方露不露空）
  OTHER         還是舊模型的店（OLD_SHOPS，bcea920be 起預設沒有；舊版對照時可以 OLD_SHOPS=home,cafe2）：門口往裡一張＋進門【遊戲鏡頭】一張，只拍不判（別名 OTHER5）
  SPECIAL       奈良咖哩、迪倫、義大麵屋、五湖四海、大學食堂另外的（別名 SPECIAL3）：店裡「看東西」的互動每個按一次記逐字（和配置 note 比）；店內全部互動鍵文字（大學食堂不能有書架、念書類）；迪倫店員座標和面向、搖桿走到爐口前一張【遊戲鏡頭】；
                窯爐的火 13:00／20:00 近拍【捷徑機位】＋火焰網格附近像素色值（有沒有變成白光）；奈良咖哩地板近拍＋地板像素色值（D112 不要深色木）；
                義大麵屋 TRACE_SQ12_photo：【前置／捷徑】G.side.SQ12 設成前一天做完 → 模型節點看不看得到、位置 → 搖桿走過去記互動鍵文字
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=... python3 cc_l118a_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, shutil, subprocess, glob
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = [p.strip() for p in (os.environ.get('PARTS') or 'EXT14,EXT20,INTFRONT').split(',') if p.strip()]
R = L.Run('l118a', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
WT = os.path.abspath(os.path.join(os.environ.get('LW_TESTS') or 'tests', '..'))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
DAY = os.environ.get('DAY') or '2025-10-08'
NEW9 = ['dian', 'self', 'korea', 'tea', 'omu', 'noodle2', 'pasta', 'home', 'cafe2']; OLD2 = [x for x in (os.environ.get('OLD_SHOPS') or '').split(',') if x]; ALL9 = ['dian', 'self', 'tea', 'home', 'cafe2', 'pasta', 'korea', 'omu', 'noodle2']
H_INT = float(os.environ.get('H_INT') or 13.0)
VP = {'width': 844, 'height': 390}
hhmm = lambda h: '%02d%02d' % (int(h), int(round((h % 1) * 60)))
# 三張近照（64add9fcf 的 tools/blender/env_second/lane118_shops.py：118牛排 西牆 z 1.35～2.15、y 1.5～2.2 的海報＋自助台上方黃牌 z 2.3～3.4；
#   辛亥韓食 茶水桶 (−1.08, 1.0～1.37, −2.8)、一疊杯子 (−0.32, 1.0, −2.7)；水上便當 取餐檯上方吊牌 x 0.15～1.25、y 2.32～2.66、z −2.9，字朝 +z）
CLOSE = {'dian': [('自助台上方海報', (-0.7, 1.65, 1.9), (-2.8, 1.8, 2.1), 30)],
         'tea': [('茶水桶', (0.2, 1.55, -1.1), (-0.75, 1.12, -2.75), 32)],
         'self': [('吊牌', (0.85, 1.65, -0.4), (0.85, 2.55, -2.9), 36)],   # bc407bfc5 第 2 版：黃框價目牌 x −0.05～1.75、y 2.24～2.96、z −2.9
         'omu': [('地板', (0.0, 1.35, 1.6), (0.0, 0.0, 0.2), 30)]}

ME = "(()=>{ const P=GAME.E.player, p=P.obj.position; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), x:+p.x.toFixed(2), z:+p.z.toFixed(2), stand:GAME.E.canStand?!!GAME.E.canStand(p.x,p.z,0.3,P.lv|0):null, ent:!!(GAME.isEntering&&GAME.isEntering()), busy:!!P.busy, seat:!!P.seat, fb:GAME.walkFallbacks|0, money:GAME.G.money}; })()"
ITS = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label||'',x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.2,to:i.exit?i.exit.to:null,shop:i.shop118||null,seat:!!i.seat,look:i.look||null})))()"
STATS = r"""(()=>{ const E=GAME.E, r=E.renderer, c=r.domElement; r.render(E.scene,E.camera); const k=document.createElement('canvas'); k.width=160; k.height=90; const g=k.getContext('2d'); g.drawImage(c,0,0,160,90);
  const d=g.getImageData(0,0,160,90).data; const st=(x0,y0,x1,y1)=>{ let s=0,s2=0,n=0; for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++){ const i=(y*160+x)*4, L=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; s+=L; s2+=L*L; n++; } const m=s/n; return [+m.toFixed(1), +Math.sqrt(Math.max(0,s2/n-m*m)).toFixed(1)]; };
  return {all:st(0,0,160,90), mid:st(32,18,128,72)}; })()"""
# CAMDIAG2（cc_tingzhou_probe.py r3）：中央 60% 標準差 ≥20、玩家投影附近 100×160 px 標準差 ≥15、上方 20% 不能像天空或大片黑
CJ2 = r"""(()=>{ const E=GAME.E, r=E.renderer, c=r.domElement, cam=E.camera, P=E.player.obj.position; r.render(E.scene,cam);
  const st=(sx,sy,sw,sh,ow,oh)=>{ const k=document.createElement('canvas'); k.width=ow; k.height=oh; const g=k.getContext('2d'); g.drawImage(c,sx,sy,sw,sh,0,0,ow,oh); const d=g.getImageData(0,0,ow,oh).data; let s=0,s2=0,n=0,bk=0,wh=0,R=0,G=0,B=0;
    for(let i=0;i<d.length;i+=4){ const L=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; s+=L; s2+=L*L; n++; R+=d[i]; G+=d[i+1]; B+=d[i+2]; if(L<12) bk++; if(L>245) wh++; } const m=s/n; return {m:+m.toFixed(1), sd:+Math.sqrt(Math.max(0,s2/n-m*m)).toFixed(1), black:+(bk/n).toFixed(3), white:+(wh/n).toFixed(3), rgb:[Math.round(R/n),Math.round(G/n),Math.round(B/n)]}; };
  const W=c.width, H=c.height, sc=W/(c.clientWidth||W); const mid=st(W*0.2,H*0.2,W*0.6,H*0.6,120,68), top=st(0,0,W,H*0.2,120,20);
  const PO=E.player.obj; const hp=new THREE.Box3().setFromObject(PO).getCenter(new THREE.Vector3()); const ndc=hp.clone().project(cam); const onScreen=PO.visible&&Math.abs(ndc.x)<=1&&Math.abs(ndc.y)<=1&&ndc.z<1;
  const px=(ndc.x+1)/2*W, py=(1-ndc.y)/2*H, bw=100*sc, bh=160*sc; const pl=onScreen?st(Math.max(0,px-bw/2),Math.max(0,py-bh/2),Math.min(bw,W),Math.min(bh,H),50,80):null;
  return {onScreen, ndc:[+ndc.x.toFixed(2),+ndc.y.toFixed(2)], player:[+P.x.toFixed(2),+P.z.toFixed(2)], cam:[+cam.position.x.toFixed(2),+cam.position.y.toFixed(2),+cam.position.z.toFixed(2)], yaw:+E.cam.yaw.toFixed(3), mid, top, near:pl}; })()"""
# 店裡人站得住、從出生點走得到的點（步長 0.25；櫃台後面的店員區不算）＋四角最近的點＋離出口最遠、最裡面（z 最小）的點
BFS = r"""(a=>{ const E=GAME.E, L=L118_SHOP_LAYOUTS[a.sid], C=L.counter, B=L.bounds, st=0.25; const ok=(x,z)=>E.canStand(x,z,0.3,0); const staff=(x,z)=>C&&z<C.z0&&x>C.x0-0.3&&x<C.x1+0.3;
  const k=(x,z)=>Math.round(x/st)+','+Math.round(z/st); const sx=L.spawn.x, sz=L.spawn.z; const seen=new Set([k(sx,sz)]), Q=[[sx,sz]], R=[];
  while(Q.length&&R.length<6000){ const [x,z]=Q.shift(); R.push([x,z]); for(const [dx,dz] of [[st,0],[-st,0],[0,st],[0,-st]]){ const nx=+(x+dx).toFixed(2), nz=+(z+dz).toFixed(2), kk=k(nx,nz); if(seen.has(kk)) continue; seen.add(kk); if(ok(nx,nz)&&!staff(nx,nz)) Q.push([nx,nz]); } }
  const ex=L.exits[0]; let far=null,fd=-1, back=null; for(const [x,z] of R){ const d=Math.hypot(x-ex.x,z-ex.z); if(d>fd){ fd=d; far=[x,z]; } if(!back||z<back[1]-1e-6||(Math.abs(z-back[1])<1e-6&&Math.abs(x)<Math.abs(back[0]))) back=[x,z]; }
  const near=(cx,cz)=>{ let b=null,bd=1e9; for(const [x,z] of R){ const d=Math.hypot(x-cx,z-cz); if(d<bd){ bd=d; b=[x,z]; } } return b?[b[0],b[1],+bd.toFixed(2)]:null; };
  const corners=[[B.x0,B.z1],[B.x1,B.z1],[B.x1,B.z0],[B.x0,B.z0]].map(([x,z])=>near(x,z));
  const ring=[]; const ins=0.45, x0=B.x0+ins, x1=B.x1-ins, z0=B.z0+ins, z1=B.z1-ins; const pts=[]; const seg=(ax,az,bx,bz)=>{ const n=Math.max(1,Math.round(Math.hypot(bx-ax,bz-az)/1.0)); for(let i=0;i<n;i++) pts.push([ax+(bx-ax)*i/n, az+(bz-az)*i/n]); };
  seg(x1,z1,x1,z0); seg(x1,z0,x0,z0); seg(x0,z0,x0,z1); seg(x0,z1,x1,z1);
  for(const [x,z] of pts){ const q=near(x,z); ring.push({want:[+x.toFixed(2),+z.toFixed(2)], at:q&&q[2]<=0.8?[q[0],q[1]]:null, gap:q?q[2]:null}); }
  const xs=R.map(p=>p[0]), zs=R.map(p=>p[1]);
  return {n:R.length, x:[Math.min(...xs),Math.max(...xs)], z:[Math.min(...zs),Math.max(...zs)], far, farD:+fd.toFixed(2), back, corners, ring}; })"""
# 穿模：坐下以後，玩家骨頭連線（大腿、小腿、脊椎、脖子）沿線段打射線（兩個方向，單面材質也打得到），打到店裡的網格＝有東西穿過身體
CLIP = r"""(()=>{ const E=GAME.E, P=E.player.obj; P.updateMatrixWorld(true); const bones={};
  P.traverse(o=>{ if(!o.isBone) return; const n=o.name||''; if(/J_Sec|J_Adj|hair|skirt|Tail/i.test(n)) return; const side=/(_L_|Left|\.L$|_L$|_l_)/.test(n)?'L':(/(_R_|Right|\.R$|_R$|_r_)/.test(n)?'R':'C');
    const t=/hips/i.test(n)?'hips':/upperleg|thigh/i.test(n)?'ul':/lowerleg|calf|shin/i.test(n)?'ll':/foot/i.test(n)&&!/toe/i.test(n)?'foot':/upperchest/i.test(n)?'uchest':/chest/i.test(n)?'chest':/spine/i.test(n)?'spine':/neck/i.test(n)?'neck':/head$/i.test(n)?'head':null;
    if(!t) return; const key=t+(t==='ul'||t==='ll'||t==='foot'?side:''); if(!bones[key]) bones[key]=o.getWorldPosition(new THREE.Vector3()); });
  const pairs=[['ulL','llL'],['llL','footL'],['ulR','llR'],['llR','footR'],['hips','spine'],['spine','chest'],['chest','neck'],['neck','head']];
  const npcs=new Set(); for(const n of (E.npcs||[])) if(n&&n.obj) n.obj.traverse(o=>npcs.add(o)); const mine=new Set(); P.traverse(o=>mine.add(o));
  const vis=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  const T=[]; E.scene.traverse(o=>{ if(!o.isMesh||o.isSkinnedMesh||mine.has(o)||npcs.has(o)||!vis(o)) return; const m=[].concat(o.material)[0]; if(m&&(m.visible===false||m.colorWrite===false)) return; if(o.name==='l118_window_view') return; T.push(o); });
  const rc=new THREE.Raycaster(); const hits=[]; let segs=0;
  for(const [a,b] of pairs){ const A=bones[a], B=bones[b]; if(!A||!B) continue; segs++; const L=A.distanceTo(B); if(L<0.06) continue;
    for(const [p,q] of [[A,B],[B,A]]){ const dir=q.clone().sub(p).normalize(); rc.set(p.clone().addScaledVector(dir,0.03),dir); rc.far=L-0.06; const h=rc.intersectObjects(T,false)[0];
      if(h){ hits.push({seg:a+'-'+b, mesh:h.object.name||'', mat:([].concat(h.object.material)[0]||{}).name||'', at:[+h.point.x.toFixed(2),+h.point.y.toFixed(2),+h.point.z.toFixed(2)]}); break; } } }
  const ys=Object.values(bones).map(v=>v.y);
  const y=k=>bones[k]?+bones[k].y.toFixed(3):null;
  return {bones:Object.keys(bones).sort(), segs, targets:T.length, hits:hits.slice(0,8), nhits:hits.length, legHits:hits.filter(h=>/^(ul|ll)/.test(h.seg)).length, hipsY:y('hips'), footY:[y('footL'),y('footR')], kneeY:[y('llL'),y('llR')], yRange:ys.length?[+Math.min(...ys).toFixed(2),+Math.max(...ys).toFixed(2)]:null}; })()"""
MARKS_ADD = r"""(ms=>{ const E=GAME.E, g=new THREE.Group(); g.name='cc_marks'; for(const m of ms){ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,3.2,8),new THREE.MeshBasicMaterial({color:m.col})); p.position.set(m.x,1.6,m.z); g.add(p);
  const s=new THREE.Mesh(new THREE.SphereGeometry(0.18,10,8),new THREE.MeshBasicMaterial({color:m.col})); s.position.set(m.x,3.3,m.z); g.add(s); } E.scene.add(g); return ms.length; })"""
MARKS_DEL = "(()=>{ const g=GAME.E.scene.getObjectByName('cc_marks'); if(g) GAME.E.scene.remove(g); return !!g; })()"


def fn(kind, sid, h, view, cam):
    return 'l118a_%s_%s_%s_%s_%s.jpg' % (kind, sid, hhmm(h) if h is not None else 'na', view, 'cam' if cam else 'game')


async def cam_shot(pg, name, eye, look, lens=26, marks=None, judge=True):
    """【捷徑機位】1280×720、暫停遊戲、藏 HUD 和玩家（D.CAM），存 jpg；之後放回 844×390、恢復遊戲"""
    await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()")
    if marks: await pg.evaluate(MARKS_ADD, marks)
    await pg.evaluate(D.HUD + '(false)'); c = await pg.evaluate(D.CAM, {'eye': list(eye), 'look': list(look), 'lens': lens}); await pg.wait_for_timeout(600)
    stt = await pg.evaluate(STATS)
    await pg.screenshot(path=os.path.join(OUT, name), type='jpeg', quality=85)
    await pg.evaluate(D.UNCAM); await pg.evaluate(D.HUD + '(true)'); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")
    if marks: await pg.evaluate(MARKS_DEL)
    await pg.set_viewport_size(VP); await pg.wait_for_timeout(800)
    R.note('【捷徑機位】%s：eye %s look %s 焦距 %s（垂直 %s°）；亮度 全畫面 %s、中央 %s' % (name, J(eye), J(look), lens, c and c.get('vfov'), stt['all'], stt['mid']))
    if judge: R.check('[黑畫面] %s 不是黑畫面／一片單色（全畫面平均 %s、變化 %s）' % (name, stt['all'][0], stt['all'][1]), not (stt['all'][0] < 6 and stt['all'][1] < 4) and stt['all'][1] >= 6, J(stt))
    return stt


async def game_shot(pg, name, tag, indoor=True, judge=True):
    """【遊戲鏡頭】遊戲自己的跟隨鏡頭；CAMDIAG2 判準（室內才判上方 20%）"""
    cj = await pg.evaluate(CJ2)
    await pg.screenshot(path=os.path.join(OUT, name), type='jpeg', quality=82)
    flat = cj['mid']['sd'] < 20; seen = bool(cj['near']) and cj['near']['sd'] >= 15
    tb = cj['top']; sky = tb['rgb'][2] > tb['rgb'][0] + 25 and tb['rgb'][2] > tb['rgb'][1] + 8 and tb['m'] > 110
    R.note('%s 【遊戲鏡頭】%s：%s%s%s' % (tag, name, J(cj), '  ★中央一片單色' if flat else '', '' if seen else '  ★看不到人（玩家附近 100×160 px 標準差 <15 或不在畫面上）'))
    if judge:
        if indoor: R.check('%s 【遊戲鏡頭】%s：畫面上方 20%% 不像天空、沒有大面積黑（天花板沒有破洞）' % (tag, name), not sky and tb['black'] <= 0.3, J(tb))
        R.check('%s 【遊戲鏡頭】%s：畫面中央 60%% 不是一片單色（標準差 %.1f ≥20）' % (tag, name, cj['mid']['sd']), not flat, J(cj['mid']))
        R.check('%s 【遊戲鏡頭】%s：看得到人（玩家附近 100×160 px 標準差 %s ≥15）' % (tag, name, cj['near'] and cj['near']['sd']), seen, J({'onScreen': cj['onScreen'], 'ndc': cj['ndc'], 'near': cj['near']}))
    return cj


async def wait_ready(pg, what, secs=60):
    js = {'lane': "!!GAME.E.scene.getObjectByName('lane118_street_glb')", 'shop': "!!(GAME.E.zone&&GAME.E.zone.formal)"}[what]
    t0 = time.time()
    while time.time() - t0 < secs:
        if await pg.evaluate(js): await pg.wait_for_timeout(1500); return round(time.time() - t0, 1)
        await pg.wait_for_timeout(500)
    return None


async def at_lane(pg, cdp, h, x, z, yaw=math.pi, why=''):
    await D.load_zone(pg, cdp, 'lane118', DAY, h, x, z, yaw, wait=3000)
    R.setup('【前置／捷徑】讀檔到 118 巷 %s %s (%.1f,%.1f) %s' % (DAY, hhmm(h), x, z, why))
    t = await wait_ready(pg, 'lane'); R.check('118 巷正式街景（lane118_street_glb）載入（%s 秒）' % t, t is not None, '')


async def at_shop(pg, cdp, sid, h, why=''):
    sp = await pg.evaluate("(s=>L118_SHOP_LAYOUTS[s].spawn)", sid)
    await D.load_zone(pg, cdp, 'l118_' + sid, DAY, h, sp['x'], sp['z'], sp['yaw'], wait=2500)
    R.setup('【前置／捷徑】讀檔到 l118_%s 店裡的進門位置 (%.2f,%.2f) %s %s %s' % (sid, sp['x'], sp['z'], DAY, hhmm(h), why))
    t = await wait_ready(pg, 'shop', 45); R.check('[%s] 店內正式模型載入（%s 秒）' % (sid, t), t is not None, '')
    await L.close_panels(pg, cdp)


async def joy_walk(pg, cdp, tx, tz, near=0.45, max_s=40, tag='', straight=False):
    """真的搖桿（CDP 觸控 #joy）：straight＝直接朝目標推（看路有沒有被擋）；否則照 E.pathTo 前方 1.2 m 的點推。4 秒沒前進 0.25 m 記一次卡住、側推。回傳 (到了沒, 秒數, 卡住紀錄)"""
    t0 = time.time(); last = (time.time(), None); stuck = []
    while time.time() - t0 < max_s:
        m = await pg.evaluate(ME); d = math.hypot(tx - m['x'], tz - m['z'])
        if d < near: return True, round(time.time() - t0, 1), stuck
        if m['busy'] or m['ent']: await pg.wait_for_timeout(400); continue
        if last[1] is None or math.hypot(m['x'] - last[1][0], m['z'] - last[1][1]) > 0.25: last = (time.time(), (m['x'], m['z']))
        elif time.time() - last[0] > 4:
            stuck.append([m['x'], m['z']]); R.note('%s 搖桿卡住：停在 (%.2f,%.2f)，目標 (%.2f,%.2f)' % (tag, m['x'], m['z'], tx, tz))
            await L.joystick(pg, cdp, 35 * (1 if len(stuck) % 2 else -1), 0, 500); last = (time.time(), None)
            if len(stuck) >= 4: break
            continue
        g = None
        if not straight:
            g = await pg.evaluate("(a=>{ const E=GAME.E,P=E.player,o=P.obj.position; const r=E.pathTo?E.pathTo(o.x,o.z,P.lv|0,a[0],a[1],P.lv|0):null; if(!r||!r.length) return null; let ax=o.x,az=o.z,acc=0; for(const q0 of r){ const q=Array.isArray(q0)?q0:[q0.x,q0.z]; const Lq=Math.hypot(q[0]-ax,q[1]-az); if(acc+Lq>=1.2){ const f=(1.2-acc)/Math.max(Lq,1e-6); return [ax+(q[0]-ax)*f,az+(q[1]-az)*f]; } acc+=Lq; ax=q[0]; az=q[1]; } return [ax,az]; })", [tx, tz])
        gx, gz = g or [tx, tz]; dd = math.hypot(gx - m['x'], gz - m['z']) or 0.01
        yaw = await pg.evaluate("GAME.E.cam.yaw"); fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
        vx, vz = (gx - m['x']) / dd, (gz - m['z']) / dd; sx, sy = vx * rx + vz * rz, -(vx * fx + vz * fz); mm = math.hypot(sx, sy) or 1
        mag = 45 if d > 2.0 else max(16, 45 * d / 2.0)
        await L.joystick(pg, cdp, sx / mm * mag, sy / mm * mag, 450 if d > 2.0 else 250)
    m = await pg.evaluate(ME); R.note('%s 搖桿 %d 秒沒到 (%.2f,%.2f)：停在 (%.2f,%.2f)' % (tag, max_s, tx, tz, m['x'], m['z']))
    return False, round(time.time() - t0, 1), stuck


async def drag_yaw(pg, cdp, dyaw):
    """單指在畫面空白處左右滑轉鏡頭（engine3d：yaw −＝dx×0.0075）"""
    left = dyaw
    while abs(left) > 0.02:
        step = max(-1.6, min(1.6, left)); px = -step / 0.0075
        pt = await pg.evaluate("""(px=>{ for(const fy of [0.4,0.33,0.5,0.27]){ const y=innerHeight*fy, x0=innerWidth/2-px/2; const a=document.elementFromPoint(x0,y), b=document.elementFromPoint(x0+px,y); if(a&&a.id==='c'&&b&&b.id==='c') return {x0,y}; } return null; })(%s)""" % json.dumps(px))
        if not pt: return False
        await L.drag(pg, cdp, pt['x0'], pt['y'], pt['x0'] + px, pt['y'], steps=12); await pg.wait_for_timeout(500); left -= step
    return True


async def tap_choice(pg, cdp, i):
    """觸控點第 i 個選項按鈕（只算 button，選單上方的說明 div 不算）"""
    c = await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b[i]||b[0]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", i)
    if c: await L.touch_tap(cdp, c[0], c[1])
    return bool(c)


async def tap_interact(pg, cdp, want, tag):
    s = await D.settle(pg)
    for _ in range(8):
        if s['interact'].startswith(want): break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    if not R.check('%s 互動按鈕是「%s…」' % (tag, want), s['interact'].startswith(want), J({k: s[k] for k in ('x', 'z', 'interact')})): return False
    await L.tap(pg, cdp, '#interact'); return True


async def wait_zone(pg, want, secs=40):
    t0 = time.time()
    while time.time() - t0 < secs:
        m = await pg.evaluate(ME)
        if m['zone'] == want and not m['ent'] and not m['busy']: return round(time.time() - t0, 1), m
        await pg.wait_for_timeout(250)
    return None, await pg.evaluate(ME)


async def lay_info(pg):
    return await pg.evaluate("""(()=>{ const LL=LANE118_LAYOUT, SD=typeof LANE118_SHOPS!=='undefined'?LANE118_SHOPS.shops:[]; return {facade:LL.facade, shops:LL.shops.map(s=>{ const d=SD.find(q=>q.id===s.id)||{};
      return {id:s.id, side:s.side, z0:s.z0, z1:s.z1, name:d.name||s.name, takeout:!!(d.takeout||s.takeout), open:typeof L118!=='undefined'&&GAME.G?L118.isOpen(s.id,GAME.G):null}; })}; })()""")


def shop_filter(part_shop, default):
    if part_shop: return [part_shop]
    env = os.environ.get('SHOPS')
    return [x for x in env.split(',') if x] if env else list(default)


# ------------------------------------------------------------------ 外觀
async def part_ext(pg, cdp, h):
    await at_lane(pg, cdp, h, 0.0, 0.0, math.pi, '（巷子中間，拍十一間正面）')
    li = await lay_info(pg); only = [x for x in (os.environ.get('ONLY_SHOPS') or '').split(',') if x]
    R.note('[EXT %s] 店：%s' % (hhmm(h), J(li['shops'])))
    for s in li['shops']:
        if only and s['id'] not in only: continue
        fx = li['facade']['west'] if s['side'] == 'W' else li['facade']['east']; dirn = 1 if s['side'] == 'W' else -1
        cz = (s['z0'] + s['z1']) / 2; w = s['z1'] - s['z0']
        await cam_shot(pg, fn('ext', s['id'], h, 'front', True), (fx + dirn * 8.5, 1.55, cz), (fx, 2.3, cz), 26)
        dist = max(3.0, min(5.0, 0.6 * w))
        await cam_shot(pg, fn('ext', s['id'], h, 'sign', True), (fx + dirn * dist, 2.0, cz), (fx, 3.45, cz), 24 if w >= 6 else 30)
    R.check('[EXT %s] walkFallbacks 0' % hhmm(h), (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


# ------------------------------------------------------------------ 四間室內全景＋近照
async def part_intfront(pg, cdp, shops, hours):
    for h in hours:
        for sid in shops:
            tag = '[INTFRONT %s %s]' % (sid, hhmm(h))
            await at_shop(pg, cdp, sid, h)
            Ly = await pg.evaluate("(s=>{ const L=L118_SHOP_LAYOUTS[s]; return {name:L.name, b:L.bounds, door:L.door, spawn:L.spawn}; })", sid)
            await pg.wait_for_timeout(1500); await game_shot(pg, fn('int', sid, h, 'door', False), tag)
            b = Ly['b']; bf = await pg.evaluate(BFS, {'sid': sid})
            R.note('%s 站得住的範圍：%d 點、x %s、z %s；最裡面 %s' % (tag, bf['n'], bf['x'], bf['z'], bf['back']))
            await cam_shot(pg, fn('int', sid, h, 'in', True), (Ly['spawn']['x'] * 0.6, 1.6, b['z1'] - 0.35), (0.0, 1.25, b['z0'] + 0.8), 22)
            bk = bf['back'] or [0.0, b['z0'] + 0.8]
            await cam_shot(pg, fn('int', sid, h, 'out', True), (bk[0], 1.6, bk[1] - 0.25), (Ly['door']['x'], 1.3, b['z1']), 22)
            for lab, eye, look, lens in CLOSE.get(sid, []):
                await cam_shot(pg, fn('int', sid, h, 'close_' + lab, True), eye, look, lens)


# ------------------------------------------------------------------ 飲料店
async def part_drink(pg, cdp):
    await at_lane(pg, cdp, 13.0, 0.0, 0.0, math.pi, '（導航格存檔）')
    nav = await pg.evaluate("(()=>{ const N=GAME.E.nav; const rows=[]; for(let r=0;r<N.rows;r++){ let s=''; for(let c=0;c<N.cols;c++) s+=N.b[N.idx(c,r)]?'#':'.'; rows.push(s); } const o=N.toWorld(0,0); return {cols:N.cols, rows:N.rows, origin:o, cell:N.cell||N.cs||null, grid:rows}; })()")
    open(os.path.join(OUT, 'l118a_nav_lane118.json'), 'w', encoding='utf-8').write(J(nav))
    R.note('[DRINK] 118 巷導航格 %d×%d 存成 l118a_nav_lane118.json（拼圖時和舊版比）' % (nav['cols'], nav['rows']))
    li = await lay_info(pg)
    for did in ('drink_a', 'drink_b'):
        s = next((q for q in li['shops'] if q['id'] == did), None)
        if not s: R.note('[DRINK] 這一版沒有 %s（舊版正常），跳過' % did); continue
        tag = '[DRINK %s %s]' % (did, s['name']); dirn = 1 if s['side'] == 'W' else -1; fx = li['facade']['west'] if s['side'] == 'W' else li['facade']['east']
        its = await pg.evaluate(ITS); it = next((i for i in its if i['shop'] == did), None)
        R.check('%s 店門口有互動點（記位置）' % tag, bool(it), J(it))
        R.note('%s 互動點 %s；立面 x %.1f、店 z %.1f～%.1f；營業 %s' % (tag, J(it), fx, s['z0'], s['z1'], s['open']))
        for lab, x in (('人行道中間', fx + dirn * 0.9), ('路邊', fx + dirn * 1.9)):
            await at_lane(pg, cdp, 13.0, x, s['z1'] + 4.0, math.pi, '（%s 南邊 4 m、%s）' % (s['name'], lab))
            fb0 = (await pg.evaluate(ME))['fb']
            ok1, t1, st1 = await joy_walk(pg, cdp, x, s['z0'] - 4.0, 0.5, 45, '%s %s 往北' % (tag, lab), straight=True)
            if st1: await game_shot(pg, fn('drink', did, 13.0, 'stuck_' + lab + '_N', False), tag, indoor=False, judge=False)
            ok2, t2, st2 = await joy_walk(pg, cdp, x, s['z1'] + 4.0, 0.5, 45, '%s %s 往南' % (tag, lab), straight=True)
            if st2: await game_shot(pg, fn('drink', did, 13.0, 'stuck_' + lab + '_S', False), tag, indoor=False, judge=False)
            R.check('%s 搖桿沿%s（x %.1f）直走經過店前、來回不卡（%s／%s 秒）' % (tag, lab, x, t1, t2), ok1 and ok2 and not st1 and not st2, J({'N': st1, 'S': st2}))
            R.check('%s %s walkFallbacks 沒增加' % (tag, lab), (await pg.evaluate(ME))['fb'] == fb0, '')
        if not it: continue
        await at_lane(pg, cdp, 13.0, fx + dirn * 1.8, s['z1'] + 3.0, math.pi, '（%s 前面，買飲料）' % s['name'])
        ok, t, stk = await joy_walk(pg, cdp, it['x'], it['z'], 0.45, 40, '%s 走到窗口' % tag)
        await game_shot(pg, fn('drink', did, 13.0, 'window', False), tag, indoor=False, judge=False)
        if not await tap_interact(pg, cdp, s['name'], tag): continue
        m0 = (await pg.evaluate(ME))['money']; lines = []
        t0 = time.time()
        while time.time() - t0 < 60:
            q = await D.st(pg)
            if not q['busy'] and not q['dlg'] and not q['choices']: break
            if q['choices']: lines.append('▶' + q['choices'][0][:24]); await tap_choice(pg, cdp, 0); await pg.wait_for_timeout(900); continue
            if q['dlg']:
                tx = await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")
                if not lines or lines[-1] != tx[:40]: lines.append(tx[:40])
                await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(600)
        m1 = (await pg.evaluate(ME))['money']
        R.note('%s 點了：%s；錢 %s → %s' % (tag, J(lines), m0, m1))
        R.check('%s 站窗口按下去買得到（選第一個；錢變少、不是負數）' % tag, m1 < m0 and m1 >= 0, J({'m0': m0, 'm1': m1}))
    R.check('[DRINK] walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


# ------------------------------------------------------------------ 巷子走一趟
async def part_lanewalk(pg, cdp):
    for h in [float(x) for x in (os.environ.get('HOURS') or '14,20').split(',')]:
        tag = '[LANEWALK %s]' % hhmm(h)
        await at_lane(pg, cdp, h, 0.0, 31.0, math.pi, '（巷底、後門那一頭）')
        fb0 = (await pg.evaluate(ME))['fb']; allst = []
        for dname, z_end, cps, look in (('N', -38.0, [22.0, 8.0, -8.0, -24.0], -45.0), ('S', 31.0, [-24.0, -8.0, 8.0, 22.0], 45.0)):
            await L.turn_camera_to(pg, cdp, 0.0, look)
            for k, cz in enumerate(cps):
                ok, t, st = await joy_walk(pg, cdp, 0.0, cz, 0.8, 60, '%s 往%s 第 %d 點' % (tag, '北' if dname == 'N' else '南', k + 1), straight=True)
                allst += st; await L.turn_camera_to(pg, cdp, 0.0, look); await pg.wait_for_timeout(900)
                await game_shot(pg, fn('walk', 'lane', h, '%s%d_z%d' % (dname, k + 1, int(cz)), False), tag, indoor=False, judge=False)
                R.check('%s 往%s走到 z %.0f（%s 秒）' % (tag, '北' if dname == 'N' else '南', cz, t), ok, '')
            ok, t, st = await joy_walk(pg, cdp, 0.0, z_end, 0.8, 60, '%s 走到%s' % (tag, '巷口' if dname == 'N' else '巷底'), straight=True); allst += st
            R.check('%s 走到%s z %.0f（%s 秒）' % (tag, '巷口' if dname == 'N' else '巷底', z_end, t), ok, '')
            if dname == 'N':
                fps = await pg.evaluate("new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<6000) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })")
                R.note('%s 巷口 6 秒幀率 %s fps（PC GPU，不是 iPhone）' % (tag, fps))
        R.check('%s 來回沒有卡住' % tag, not allst, J(allst))
        R.check('%s walkFallbacks 沒增加' % tag, (await pg.evaluate(ME))['fb'] == fb0, '')


# ------------------------------------------------------------------ 四角、最裡面、轉一圈
async def part_corners(pg, cdp, sid):
    tag = '[CORNERS %s]' % sid; h = H_INT
    await at_shop(pg, cdp, sid, h)
    bf = await pg.evaluate(BFS, {'sid': sid})
    R.note('%s 站得住的範圍：%d 點、x %s、z %s；四角最近的點 %s；最裡面 %s；離出口最遠 %s（%.1f m）' % (tag, bf['n'], bf['x'], bf['z'], J(bf['corners']), bf['back'], bf['far'], bf['farD']))
    fb0 = (await pg.evaluate(ME))['fb']; miss = []
    pts = [('c%d' % (k + 1), c) for k, c in enumerate(bf['corners'])] + [('back', bf['back'])]
    for lab, p in pts:
        if not p: miss.append(lab); continue
        ok, t, st = await joy_walk(pg, cdp, p[0], p[1], 0.45, 45, '%s 走到 %s (%.2f,%.2f)' % (tag, lab, p[0], p[1]))
        if not ok: miss.append([lab, p, st])
        await pg.wait_for_timeout(1500); await game_shot(pg, fn('corner', sid, h, lab, False), tag)
    R.check('%s 四角＋最裡面都用搖桿走得到' % tag, not miss, J(miss))
    if sid in ('tea', 'home') or os.environ.get('SPIN') == '1':
        for k in range(8):
            if k: await drag_yaw(pg, cdp, math.pi / 4)
            await pg.wait_for_timeout(1000); await game_shot(pg, fn('corner', sid, h, 'spin%d' % (k * 45), False), tag + ' 最裡面轉一圈')
        await drag_yaw(pg, cdp, math.pi / 4)
    ex = next((i for i in await pg.evaluate(ITS) if i['to'] == 'lane118'), None)
    if not R.check('%s 店裡有出口' % tag, bool(ex), ''): return
    tgt = await D.standable_near(pg, ex['x'], ex['z'], ex['r'] * 0.6, 0)
    ok, t, st = await joy_walk(pg, cdp, tgt['x'], tgt['z'], 0.3, 45, '%s 最裡面走回出口' % tag)
    R.check('%s 從最裡面搖桿走回出口（%s 秒）' % (tag, t), ok, J(st))
    if await tap_interact(pg, cdp, '離開', tag):
        t, m = await wait_zone(pg, 'lane118')
        R.check('%s 出店：回到 118 巷、站得住' % tag, m['zone'] == 'lane118' and m['stand'] is not False, J(m))
    R.check('%s walkFallbacks 沒增加' % tag, (await pg.evaluate(ME))['fb'] == fb0, '')


# ------------------------------------------------------------------ 座位
# 互動鍵分數：照 engine3d.js E.nearestInteractable（bc407bfc5）——座位有人坐（npc.seat 0.4 m 內；沒有 label 的座位再加 seatTarget）或 seat.taken 就跳過；
#   範圍 R＝radius（沒有＝1.8）、分數＝距離－prio，範圍內分數最小的贏；人（talk）另算：2.2 m 內、分數＝距離－bias（目前最佳是座位或沒有＝0.5）。不含 tapPref（搖桿走過去沒有點地）
SCORES = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, plv=P.lv|0;
  const occ=st=>E.npcs.some(n=>n.seat&&(n.seat.lv|0)===(st.lv|0)&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.4)||(!st.label&&E.npcs.some(n=>n.seatTarget&&Math.hypot(n.seatTarget.x-st.x,n.seatTarget.z-st.z)<0.4));
  const L=[]; for(const it of E.interactables){ const d=Math.hypot(it.x-o.x,it.z-o.z), R=it.radius||1.8; if(d>R+1.0) continue; const skip=it.hidden?'hidden':(it.seat&&(occ(it.seat)||it.seat.taken)?'occupied/taken':null);
    L.push({label:it.label||'', at:[+it.x.toFixed(2),+it.z.toFixed(2)], seat:it.seat?[+it.seat.x.toFixed(2),+it.seat.z.toFixed(2)]:null, d:+d.toFixed(3), R:+R.toFixed(2), prio:it.prio||0, score:+(d-(it.prio||0)).toFixed(3), inR:d<R, skip}); }
  L.sort((a,b)=>(a.skip?1:0)-(b.skip?1:0)||(b.inR-a.inR)||a.score-b.score);
  const npcs=E.npcs.filter(n=>n&&n.talk&&!n.hidden).map(n=>({name:n.name||n.id, d:+Math.hypot(n.obj.position.x-o.x,n.obj.position.z-o.z).toFixed(2), yieldIt:!!n.yieldIt})).filter(n=>n.d<2.2);
  const ni=E.nearestInteractable(); return {me:[+o.x.toFixed(2),+o.z.toFixed(2)], winner:ni?{label:ni.label, at:[+ni.x.toFixed(2),+ni.z.toFixed(2)]}:null, list:L.slice(0,10), npcs}; })()"""
STEAL = r"""(([x,z])=>{ const E=GAME.E, Z=E.zone||{};
  const who=(E.npcs||[]).filter(n=>n&&((n.seat&&Math.hypot(n.seat.x-x,n.seat.z-z)<0.4)||(n.seatTarget&&Math.hypot(n.seatTarget.x-x,n.seatTarget.z-z)<0.4))).map(n=>({id:n.id||null, charId:n.charId||null, name:n.name||null, by:n.seat&&Math.hypot(n.seat.x-x,n.seat.z-z)<0.4?'seat':'seatTarget', crowd:/crowd/i.test(String(n.id||'')+' '+String(n.charId||'')+' '+String(n.kind||'')+' '+String(n.src||''))||!!n.crowd||!!n.isCrowd, extra:!!n.isExtra}));
  const zs=(Z.seats||[]).find(q=>Math.hypot(q.x-x,q.z-z)<0.05); const it=(E.interactables||[]).find(q=>q.seat&&Math.hypot(q.seat.x-x,q.seat.z-z)<0.05);
  return {npcs:who, zoneSeat:zs?{taken:zs.taken==null?null:zs.taken, label:zs.label||null}:'沒有', interact:it?{label:it.label, hidden:!!it.hidden, radius:it.radius||null, at:[+it.x.toFixed(2),+it.z.toFixed(2)]}:'沒有'}; })"""
SEATLAB = ('坐下', '坐吧檯', '坐窗邊')


async def steal_diag(pg, cdp, t, sid, k, s, first):
    """走到 seatApproach，互動鍵不是坐下類：記誰佔、taken、互動點、分數；再從前後左右各試一次。回傳坐得到的那一點或 None"""
    sd = await pg.evaluate(STEAL, [s['sx'], s['sz']]); sc = await pg.evaluate(SCORES)
    R.note('%s 互動鍵被搶：「%s」；0.4 m 內的人 %s；E.zone.seats %s；這張的互動點 %s' % (t, first, J(sd['npcs']), J(sd['zoneSeat']), J(sd['interact'])))
    R.note('%s 分數排序（engine3d nearestInteractable 的算法：範圍內 距離－prio 最小的贏）：%s；2.2 m 內的人 %s；遊戲選的 %s' % (t, J(sc['list']), J(sc['npcs']), J(sc['winner'])))
    empty = not sd['npcs'] and not (isinstance(sd['zoneSeat'], dict) and sd['zoneSeat'].get('taken'))
    gone = not isinstance(sd['interact'], dict) or sd['interact']['hidden']
    if gone or empty:
        R.note('%s ⚠空椅子被搶%s（沒人佔、互動鍵是「%s」）' % (t, '（互動點不見或 hidden）' if gone else '', first))
        await game_shot(pg, fn('seat', sid, H_INT, 'steal%d' % (k + 1), False), t, judge=False)
        R.check('%s 空椅子在 seatApproach 沒有被別的互動搶走（有人佔不算）' % t, False, J({'interact': first, 'zoneSeat': sd['zoneSeat'], 'it': sd['interact']}))
    else: R.note('%s 有人佔（不是 bug）' % t)
    yaw = await pg.evaluate("(([x,z])=>{ const it=GAME.E.interactables.find(q=>q.seat&&Math.hypot(q.seat.x-x,q.seat.z-z)<0.05); return it?(it.seat.yaw||0):0; })", [s['sx'], s['sz']])
    fx, fz = math.sin(yaw), math.cos(yaw); ok_dirs = []; good = None
    for dname, ux, uz in (('前', fx, fz), ('後', -fx, -fz), ('左', fz, -fx), ('右', -fz, fx)):
        pt = None
        for r_ in (0.5, 0.6, 0.7):
            x_, z_ = s['sx'] + ux * r_, s['sz'] + uz * r_
            if await pg.evaluate("(([x,z])=>GAME.E.canStand(x,z,0.3,0))", [x_, z_]): pt = [round(x_, 2), round(z_, 2), r_]; break
        if not pt: R.note('%s 從%s邊：0.5～0.7 m 站不住，沒試' % (t, dname)); continue
        okw, tw, stw = await joy_walk(pg, cdp, pt[0], pt[1], 0.15, 30, '%s 從%s邊 %s' % (t, dname, pt))
        b2 = await D.settle(pg); ni = await pg.evaluate(D.NEAR_IT)
        mine = bool(ni and ni['seat'] and abs(ni['seat'][0] - s['sx']) < 0.01 and abs(ni['seat'][1] - s['sz']) < 0.01)
        R.note('%s 從%s邊 %s m（站在 %s）：互動鍵「%s」%s' % (t, dname, pt[2], [b2['x'], b2['z']], b2['interact'], '＝這一張' if mine else ('（最近的是 %s）' % J(ni))))
        if mine and b2['interact'].startswith(SEATLAB): ok_dirs.append(dname); good = good or pt
    R.note('%s 坐得到的方向：%s' % (t, J(ok_dirs) if ok_dirs else '沒有'))
    return good


async def home_back_approach(pg, cdp, seats):
    """LAWWW 用配置算出：五湖四海 (0.5,−0.9) 從椅子後面 (0.5,−1.5) 走近時，空椅子也會是「點餐」贏——搖桿從後面走近，記互動鍵與分數"""
    t = '[SEATS home (0.5,-0.9) 從後面走近]'
    s = next((q for q in seats if abs(q['sx'] - 0.5) < 0.05 and abs(q['sz'] + 0.9) < 0.05), None)
    if not R.check('%s 配置裡有這一張' % t, bool(s), ''): return
    occ_js = "(()=>(GAME.E.npcs||[]).filter(n=>n&&((n.seat&&Math.hypot(n.seat.x-0.5,n.seat.z+0.9)<0.4)||(n.seatTarget&&Math.hypot(n.seatTarget.x-0.5,n.seatTarget.z+0.9)<0.4))).map(n=>n.id||n.name))()"
    for hh in (H_INT, 13.5, 12.0):
        who = await pg.evaluate(occ_js)
        if not who: break
        R.note('%s %s 有人：%s → 換時間重新讀檔' % (t, hhmm(hh), J(who))); await at_shop(pg, cdp, 'home', hh + 0.01, '（%s 那張有人，換時間）' % t)
    who = await pg.evaluate(occ_js)
    if who:
        n = await pg.evaluate("(()=>{ let k=0; for(const n of (GAME.E.npcs||[])){ if(n&&((n.seat&&Math.hypot(n.seat.x-0.5,n.seat.z+0.9)<0.4)||(n.seatTarget&&Math.hypot(n.seatTarget.x-0.5,n.seatTarget.z+0.9)<0.4))){ n.seat=null; n.seatTarget=null; n.hidden=true; if(n.obj) n.obj.visible=false; k++; } } return k; })()")
        R.setup('%s 換時間還是有人（%s）：【捷徑】把坐那張的 %d 個 NPC 的 seat／seatTarget 清掉、藏起來（請路人離開）' % (t, J(who), n))
    ok, tt, st = await joy_walk(pg, cdp, 0.5, -1.5, 0.15, 40, '%s 搖桿走到椅子後面 (0.5,−1.5)' % t)
    R.check('%s 搖桿走到 (0.5,−1.5)（%s 秒）' % (t, tt), ok, J(st))
    b0 = await D.settle(pg); sc0 = await pg.evaluate(SCORES)
    R.note('%s 在 (0.5,−1.5)：互動鍵「%s」；分數 %s' % (t, b0['interact'], J(sc0['list'])))
    m = await pg.evaluate(ME); d = math.hypot(0.5 - m['x'], -0.9 - m['z'])
    while d > 0.62:
        yaw = await pg.evaluate("GAME.E.cam.yaw"); fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
        vx, vz = (0.5 - m['x']) / d, (-0.9 - m['z']) / d; sx, sy = vx * rx + vz * rz, -(vx * fx + vz * fz); mm = math.hypot(sx, sy) or 1
        await L.joystick(pg, cdp, sx / mm * 18, sy / mm * 18, 250); m2 = await pg.evaluate(ME)
        if math.hypot(m2['x'] - m['x'], m2['z'] - m['z']) < 0.02: break
        m = m2; d = math.hypot(0.5 - m['x'], -0.9 - m['z'])
    b1 = await D.settle(pg); sc1 = await pg.evaluate(SCORES)
    R.note('%s 從後面搖桿走近到離椅子 %.2f m（%s）：互動鍵「%s」；分數 %s；遊戲選的 %s' % (t, d, [b1['x'], b1['z']], b1['interact'], J(sc1['list']), J(sc1['winner'])))
    await game_shot(pg, fn('seat', 'home', H_INT, 'back_approach', False), t, judge=False)
    R.check('%s 從椅子後面走近，空椅子的互動鍵是坐下類（不是「點餐」）' % t, b1['interact'].startswith(SEATLAB), J({'interact': b1['interact'], 'winner': sc1['winner']}))


async def sit_one(pg, cdp, sid, k, s, res):
    t = '[SEATS %s #%d（%s, %s）]' % (sid, k + 1, s['sx'], s['sz'])
    occ = await pg.evaluate("(([x,z])=>(GAME.E.npcs||[]).some(n=>n&&n.seat&&Math.hypot(n.seat.x-x,n.seat.z-z)<0.35))", [s['sx'], s['sz']])
    if occ: R.note('%s 有 NPC 坐著：遊戲不給坐，先跳過' % t); res[k] = 'occupied'; return
    tgt = s['ap'] or [s['x'], s['z']]; fb0 = (await D.st(pg))['fb']
    ok, tt, st = await joy_walk(pg, cdp, tgt[0], tgt[1], 0.3, 45, '%s 搖桿走到 seatApproach' % t)
    b = await D.settle(pg)
    for _ in range(4):
        if b['interact']: break
        await pg.wait_for_timeout(400); b = await D.st(pg)
    if not b['interact'].startswith(SEATLAB):
        good = await steal_diag(pg, cdp, t, sid, k, s, b['interact'])
        if good: await joy_walk(pg, cdp, good[0], good[1], 0.15, 30, '%s 回到坐得到的那一邊' % t); b = await D.settle(pg)
    ni = await pg.evaluate(D.NEAR_IT)
    mine = bool(ni and ni['seat'] and abs(ni['seat'][0] - s['sx']) < 0.01 and abs(ni['seat'][1] - s['sz']) < 0.01)
    if not mine:
        wc = await pg.evaluate(D.WIN_CELL, {'sx': s['sx'], 'sz': s['sz'], 'lv': 0, 'ap': tgt})
        R.note('%s 在 seatApproach 旁最近的按鈕是 %s；改走到這一張按鈕範圍裡、最近就是它的一點 %s' % (t, J(ni), J(wc)))
        if wc: await joy_walk(pg, cdp, wc['x'], wc['z'], 0.15, 30, '%s 搖桿走到這一張的按鈕範圍' % t); b = await D.settle(pg)
    for _ in range(6):
        if b['interact'].startswith(s['label']): break
        await pg.wait_for_timeout(500); b = await D.st(pg)
    if not R.check('%s 走到旁邊，互動按鈕是「%s」' % (t, s['label']), b['interact'].startswith(s['label']), J({q: b[q] for q in ('x', 'z', 'interact', 'stand')})):
        await game_shot(pg, fn('seat', sid, H_INT, 'nobtn%d' % (k + 1), False), t, judge=False); res[k] = 'nobtn'; return
    await L.tap(pg, cdp, '#interact'); sat = False
    for i in range(30):
        await pg.wait_for_timeout(500)
        if await pg.evaluate("!!GAME.E.player.seat"): sat = True; break
        if i == 8:
            for _ in range(8):
                c0 = await D.st(pg)
                if not c0['dlg']: break
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400)
            c0 = await D.st(pg)
            if not c0['seat'] and c0['interact'].startswith(s['label']): R.note('%s 按了 4 秒沒坐下，再按一次' % t); await L.tap(pg, cdp, '#interact')
    await pg.wait_for_timeout(1500)
    p = await pg.evaluate("(()=>{ const P=GAME.E.player, o=P.obj.position, s=P.seat; return {x:+o.x.toFixed(3),z:+o.z.toFixed(3),y:+o.y.toFixed(3), sx:s?+s.x.toFixed(3):null, sz:s?+s.z.toFixed(3):null}; })()")
    R.check('%s 坐下了（player.seat）' % t, sat, J(p))
    if sat: R.note('%s 按的互動鍵「%s」；實際坐到的座位 (%s, %s)（要坐的是 (%s, %s)）' % (t, b['interact'], p['sx'], p['sz'], s['sx'], s['sz']))
    clip = None
    if sat:
        d = math.hypot(p['x'] - s['sx'], p['z'] - s['sz']); fy = round((s['sy'] if s.get('sy') is not None else 0.0) + (s.get('lift') or 0), 3)
        R.check('%s 坐的位置離座位 %.3f m（≤0.15）、高度 %.3f＝地板＋lift %.3f（±0.06）' % (t, d, p['y'], fy), d <= 0.15 and abs(p['y'] - fy) <= 0.06, J(p))
        clip = await pg.evaluate(CLIP)
        R.note('%s 穿模檢查：骨頭 %s、線段 %d、店裡網格 %d、骨頭高度 %s；打到 %s' % (t, J(clip['bones']), clip['segs'], clip['targets'], clip['yRange'], J(clip['hits'])))
        R.check('%s 坐下以後身體沒有穿進桌椅（大腿／小腿／脊椎／脖子線段沒有打到店裡的網格；找到 %d 段）' % (t, clip['segs']), clip['segs'] >= 6 and clip['nhits'] == 0, J(clip['hits']))
        if s.get('lift'):
            top = round(0.47 + s['lift'], 3); dh = None if clip['hipsY'] is None else round(clip['hipsY'] - top, 3)
            R.note('%s 高腳椅：椅面高度 %.3f（0.47＋lift %.3f）；骨盆（hips 骨頭）%s（高出椅面 %s）；膝蓋 %s；腳 %s；小腿／大腿線段打到網格 %d 段' % (t, top, s['lift'], clip['hipsY'], dh, clip['kneeY'], clip['footY'], clip['legHits']))
            R.check('%s 高腳椅坐姿：骨盆在椅面上方 0.02～0.30 m（屁股在椅面上，CC 粗判）、腳沒有穿進吧台（腿的線段沒打到網格）' % t, dh is not None and 0.02 <= dh <= 0.30 and clip['legHits'] == 0, J({'hipsY': clip['hipsY'], 'top': top, 'dh': dh, 'legHits': clip['legHits']}))
            await cam_shot(pg, fn('seat', sid, H_INT, 'stool%d_side' % (k + 1), True), (p['x'] + 1.6, 1.0, p['z'] + 0.3), (p['x'], 0.8, p['z']), 30, judge=False)
            await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")
        await game_shot(pg, fn('seat', sid, H_INT, 'sit%d' % (k + 1), False), t, judge=False)
    said = []; t1 = time.time()
    while time.time() - t1 < 25:
        c = await D.st(pg)
        if not c['seat'] and not c['busy']: break
        if c['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if c['choices']:
            kk = next((i for i, x in enumerate(c['choices']) if x.startswith('起身') or x.startswith('站起')), len(c['choices']) - 1)
            said.append(c['choices'][kk]); await tap_choice(pg, cdp, kk); await pg.wait_for_timeout(1200); continue
        if c['interact'].startswith('起身') or c['interact'].startswith('站起'): said.append(c['interact']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); continue
        if c['seat']: await L.joystick(pg, cdp, 0, 40, 900); said.append('搖桿推一下'); await pg.wait_for_timeout(1000); continue
        await pg.wait_for_timeout(500)
    if said: R.note('%s 起身：%s' % (t, J(said)))
    mv = await D.pushable(pg, cdp); c = await D.st(pg)
    R.check('%s 起身：不是坐著、站得住、搖桿四方向至少一個推得動 ≥0.3 m（%.2f）、walkFallbacks 沒增加' % (t, mv), not c['seat'] and c['stand'] and mv >= 0.3 and c['fb'] == fb0, J({'moved': mv, 'x': c['x'], 'z': c['z'], 'stand': c['stand']}))
    res[k] = ('ok' if not (clip and clip['nhits']) else 'ok_clip') if sat else 'nosit'


async def part_seats(pg, cdp, sid, rng):
    await at_shop(pg, cdp, sid, H_INT)
    seats = await pg.evaluate(D.SEATS)
    a, b = (rng if rng else (1, len(seats)))
    R.note('[SEATS %s] 座位共 %d 張（這一行測 #%d～#%d）：%s' % (sid, len(seats), a, b, J(seats)))
    res = {}
    if sid == 'home' and any(abs(seats[k]['sx'] - 0.5) < 0.05 and abs(seats[k]['sz'] + 0.9) < 0.05 for k in range(a - 1, min(b, len(seats)))):
        await home_back_approach(pg, cdp, seats); await at_shop(pg, cdp, sid, H_INT, '（從後面走近那一項做完，回到進門位置）')
    for k in range(a - 1, min(b, len(seats))):
        h = (await pg.evaluate(ME))['h']; z = (await pg.evaluate(ME))['zone']
        if h > H_INT + 0.75 or z != 'l118_' + sid: await at_shop(pg, cdp, sid, H_INT, '（時間 %.2f／區域 %s：重新讀檔回 %s）' % (h, z, hhmm(H_INT)))
        await sit_one(pg, cdp, sid, k, seats[k], res)
    occ = [k for k, v in res.items() if v == 'occupied']
    if occ:
        R.note('[SEATS %s] 有人坐的 %s：重新讀檔再試一次' % (sid, [k + 1 for k in occ])); await at_shop(pg, cdp, sid, H_INT, '（重試有人坐的座位）')
        for k in occ: await sit_one(pg, cdp, sid, k, seats[k], res)
    n_ok = sum(1 for v in res.values() if v.startswith('ok'))
    R.note('[SEATS %s] 結果：坐得到 %d／%d（這一行測的）；%s' % (sid, n_ok, len(res), J({k + 1: v for k, v in sorted(res.items())})))
    R.check('[SEATS %s #%d～#%d] 每張都坐得到（有 NPC 一直坐著的另列）' % (sid, a, b), all(v.startswith('ok') or v == 'occupied' for v in res.values()), J({k + 1: v for k, v in sorted(res.items())}))
    if any(v == 'occupied' for v in res.values()): R.note('[SEATS %s] ★兩次都有 NPC 坐著、沒測到：%s' % (sid, [k + 1 for k, v in res.items() if v == 'occupied']))


# ------------------------------------------------------------------ 沿牆走一圈
async def part_wallwalk(pg, cdp, sid):
    tag = '[WALLWALK %s]' % sid
    await at_shop(pg, cdp, sid, H_INT)
    bf = await pg.evaluate(BFS, {'sid': sid}); ring = bf['ring']
    skip = [r_['want'] for r_ in ring if not r_['at']]
    R.note('%s 牆邊長方形 %d 點；貼不到站得住格子（家具、櫃台貼牆）%d 點：%s' % (tag, len(ring), len(skip), J(skip)))
    fb0 = (await pg.evaluate(ME))['fb']; stuck_all = []; miss = []; shots = 0
    for k, r_ in enumerate(ring):
        if not r_['at']: continue
        ok, t, st = await joy_walk(pg, cdp, r_['at'][0], r_['at'][1], 0.45, 25, '%s 第 %d 點 %s' % (tag, k + 1, r_['at']))
        if st: stuck_all += st
        if not ok:
            miss.append(r_['at'])
            if shots < 5: shots += 1; await game_shot(pg, fn('wall', sid, H_INT, 'stuck%d' % (k + 1), False), tag, judge=False)
    R.check('%s 沿牆一圈每一點都用搖桿走到（%d 點）' % (tag, len([r_ for r_ in ring if r_['at']])), not miss, J(miss))
    R.check('%s 沿牆一圈沒有卡住（4 秒不前進）' % tag, not stuck_all, J(stuck_all))
    R.check('%s walkFallbacks 沒增加' % tag, (await pg.evaluate(ME))['fb'] == fb0, '')


# ------------------------------------------------------------------ 門
async def part_doors(pg, cdp, sid):
    tag = '[DOORS %s]' % sid
    Ly = await pg.evaluate("(s=>{ const L=L118_SHOP_LAYOUTS[s], S=LANE118_LAYOUT.shops.find(q=>q.id===s); return {door:L.door, spawn:L.spawn, exits:L.exits, street:L.street, b:L.bounds, side:S.side, z0:S.z0, z1:S.z1, fw:LANE118_LAYOUT.facade.west, fe:LANE118_LAYOUT.facade.east}; })", sid)
    so = Ly['street']['spawn_out']; cz = (Ly['z0'] + Ly['z1']) / 2; W_ = Ly['side'] == 'W'; fx = Ly['fw'] if W_ else Ly['fe']; dirn = 1 if W_ else -1
    zmap = cz - Ly['door']['x'] if W_ else cz + Ly['door']['x']
    await at_lane(pg, cdp, H_INT, so['x'], so['z'], so['yaw'], '（%s 的 spawn_out＝出店站的位置／舊存檔站的地方）' % sid)
    its = await pg.evaluate(ITS); it = next((i for i in its if i['to'] == 'l118_' + sid), None)
    if not R.check('%s 街上有「進…」（營業中）' % tag, bool(it), J([i for i in its if i['shop'] == sid])): return
    lr = lambda z_: ('右' if (z_ < cz) == W_ else '左') if abs(z_ - cz) > 0.3 else '中'
    R.note('%s 街上門口互動點 (%.2f,%.2f) r %.1f「%s」；室內門 x %.2f（寬 %.1f）→ 換算街上 z %.2f（從巷子看店面在%s邊）；店中心 z %.1f；室內出生點 %s；出店站 (%.2f,%.2f)' %
           (tag, it['x'], it['z'], it['r'], it['label'], Ly['door']['x'], Ly['door']['w'], zmap, lr(zmap), cz, J(Ly['spawn']), so['x'], so['z']))
    await cam_shot(pg, fn('door', sid, H_INT, 'facade_marks', True), (fx + dirn * 8.5, 1.55, cz), (fx, 2.0, cz), 26,
                   marks=[{'x': it['x'], 'z': it['z'], 'col': 0xff2020}, {'x': fx + dirn * 0.25, 'z': zmap, 'col': 0x2060ff}, {'x': so['x'], 'z': so['z'], 'col': 0x20c040}], judge=False)
    R.note('%s 標記圖：紅＝街上門口互動點、藍＝室內門換算到立面的位置、綠＝出店站的位置' % tag)
    fb0 = (await pg.evaluate(ME))['fb']
    ok, t, st = await joy_walk(pg, cdp, it['x'], it['z'], 0.5, 40, '%s 搖桿走到店門' % tag)
    if not await tap_interact(pg, cdp, '進', tag): return
    t, m = await wait_zone(pg, 'l118_' + sid)
    await pg.wait_for_timeout(1200); m = await pg.evaluate(ME)
    d = math.hypot(m['x'] - Ly['spawn']['x'], m['z'] - Ly['spawn']['z'])
    R.check('%s 進店：區域 l118_%s、站在出生點 (%.2f,%.2f) 旁 %.2f m（≤0.5）、站得住（%s 秒）' % (tag, sid, Ly['spawn']['x'], Ly['spawn']['z'], d, t), m['zone'] == 'l118_' + sid and d <= 0.5 and m['stand'] is not False, J(m))
    await wait_ready(pg, 'shop', 30); await game_shot(pg, fn('door', sid, H_INT, 'entered', False), tag)
    ex = next((i for i in await pg.evaluate(ITS) if i['to'] == 'lane118'), None)
    if not R.check('%s 店裡有「離開…」' % tag, bool(ex), ''): return
    tg = await D.standable_near(pg, ex['x'], ex['z'], ex['r'] * 0.6, 0)
    ok, t, st = await joy_walk(pg, cdp, tg['x'], tg['z'], 0.3, 40, '%s 搖桿走到出口' % tag)
    if not await tap_interact(pg, cdp, '離開', tag): return
    t, m = await wait_zone(pg, 'lane118'); await pg.wait_for_timeout(1200); m = await pg.evaluate(ME)
    d = math.hypot(m['x'] - so['x'], m['z'] - so['z'])
    R.check('%s 出店：回到 118 巷、站在 spawn_out 旁 %.2f m（≤0.8）、站得住' % (tag, d), m['zone'] == 'lane118' and d <= 0.8 and m['stand'] is not False, J(m))
    await game_shot(pg, fn('door', sid, H_INT, 'out', False), tag, indoor=False, judge=False)
    mv = await D.pushable(pg, cdp)
    R.check('%s 出來以後搖桿推得動（%.2f m）' % (tag, mv), mv >= 0.3, '')
    R.check('%s walkFallbacks 沒增加' % tag, (await pg.evaluate(ME))['fb'] == fb0, '')
    R.note('DOOR %s %s' % (sid, J({'street_door': [it['x'], it['z']], 'interior_door_x': Ly['door']['x'], 'mapped_z': round(zmap, 2), 'mapped_side_from_lane': lr(zmap), 'spawn_in': [Ly['spawn']['x'], Ly['spawn']['z']], 'spawn_out': [so['x'], so['z']]})))


# ------------------------------------------------------------------ 窗景
VIEWINFO = r"""(s=>{ const E=GAME.E, key='l118_'+s, m=E.scene.getObjectByName('l118_window_view'); const L=W3.VIEW_LAYERS&&W3.VIEW_LAYERS[key]; const src=t=>t&&t.image?(t.image.currentSrc||t.image.src||'(bitmap)'):(t&&t.source&&t.source.data&&t.source.data.src)||null;
  const u=m&&m.material&&m.material.uniforms; return {hasPane:!!m, layers:L||null, map:u?src(u.map.value):null, nmap:u?src(u.nmap.value):null, photo:u?u.photo.value:null, near:u?u.near.value:null}; })"""


async def part_views(pg, cdp, label):
    shops = shop_filter(None, ALL9 if label == 'asis' else NEW9)
    for h in [float(x) for x in (os.environ.get('VIEW_HOURS') or '13,19.25').split(',')]:
        for sid in shops:
            tag = '[VIEWS %s %s %s]' % (label, sid, hhmm(h))
            await at_shop(pg, cdp, sid, h); await pg.wait_for_timeout(3000)
            b = await pg.evaluate("(s=>L118_SHOP_LAYOUTS[s].bounds)", sid)
            vi = await pg.evaluate(VIEWINFO, sid)
            R.note('%s 門外窗景平面：%s' % (tag, J(vi)))
            R.check('%s 門外有窗景平面（l118_window_view）、照片載入' % tag, vi['hasPane'] and bool(vi['map']), J(vi))
            dx = await pg.evaluate("(s=>L118_SHOP_LAYOUTS[s].door.x)", sid)
            await cam_shot(pg, fn('view', sid, h, label, True), (dx * 0.4, 1.5, b['z1'] - 2.4), (dx * 0.4, 1.45, b['z1'] + 3.0), 24)


def views_prepare():
    """VIEWSNEW：瀏覽器開以前。回傳 (來源資料夾或 None, 景深 json 或 None, 原檔備份清單)"""
    vd = os.environ.get('VIEWS_DIR')
    names = ['l118_' + s for s in ALL9]
    if vd:
        src = os.path.join(REPO, vd); jp = os.path.join(src, 'shop_views_layers.json')
        print('  VIEWSNEW：用 cc-testing 上已經去背的 %s（不重拍）' % vd, flush=True)
    else:
        vout = os.path.join(OUT, 'views_new'); os.makedirs(vout, exist_ok=True)
        script = os.path.join(HERE, 'cc_shop_views_gg.py'); wrap = os.path.join(REPO, 'tools', 'cc_local', 'gpu_wrap.py')
        cloud = os.path.exists('/opt/pw-browsers/chromium')
        cmd = [sys.executable, script, URL, vout] if cloud or not os.path.exists(wrap) else [sys.executable, wrap, script, URL, vout]
        env = dict(os.environ, VIEW_NAMES=','.join(names))
        t0 = time.time(); print('  VIEWSNEW：重拍 %d 張門外景（%s）…' % (len(names), '雲端直接跑' if cmd[1] == script else '經 gpu_wrap'), flush=True)
        try:
            r = subprocess.run(cmd, env=env, capture_output=True, text=True, timeout=int(os.environ.get('VIEWS_TIMEOUT') or 540))
            log = (r.stdout or '') + '\n' + (r.stderr or '')[-3000:]
        except subprocess.TimeoutExpired as e:
            log = '逾時：%r' % (e,)
        open(os.path.join(vout, 'reshoot.log'), 'w', encoding='utf-8').write(log)
        print('  VIEWSNEW：重拍結束 %.0f 秒；log 最後幾行：\n%s' % (time.time() - t0, '\n'.join(log.strip().splitlines()[-6:])), flush=True)
        src = os.path.join(vout, 'assets', 'models', 'env', 'views'); jp = os.path.join(vout, 'shop_views_layers.json')
    files = sorted(glob.glob(os.path.join(src, 'l118_*.webp')))
    if not files:
        print('  VIEWSNEW：沒有 webp（PC 沒有 numpy／PIL 時只拍原始三張到 views_new/raw/，要在雲端 VIEWS_REMATTE 去背後用 VIEWS_DIR 再排一次）', flush=True)
        return None, None, []
    dst = os.path.join(WT, 'assets', 'models', 'env', 'views'); bak = os.path.join(OUT, 'views_new', 'orig_backup'); os.makedirs(bak, exist_ok=True); done = []
    for f in files:
        d = os.path.join(dst, os.path.basename(f))
        if os.path.exists(d): shutil.copy2(d, os.path.join(bak, os.path.basename(f)))
        shutil.copy2(f, d); done.append(d)
    print('  VIEWSNEW：%d 個 webp 放進受測 worktree（原檔備份在 views_new/orig_backup，跑完放回去）' % len(done), flush=True)
    depth = json.load(open(jp, encoding='utf-8')) if os.path.exists(jp) else None
    return src, depth, done


def views_restore(done):
    bak = os.path.join(OUT, 'views_new', 'orig_backup')
    for d in done:
        b = os.path.join(bak, os.path.basename(d))
        if os.path.exists(b): shutil.copy2(b, d)
        else: os.remove(d)
    if done: print('  VIEWSNEW：受測 worktree 的 %d 個窗景檔放回原樣' % len(done), flush=True)


# ------------------------------------------------------------------ 新三間另外的（BB 06:23）
PIX = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; let box=null; E.scene.traverse(o=>{ if(!o.isMesh) return; for(let q=o;q;q=q.parent) if(!q.visible) return; const m=[].concat(o.material)[0]; if(m&&new RegExp(a.re,'i').test(m.name||'')){ const b=new THREE.Box3().setFromObject(o); box=box?box.union(b):b; } });
  r.render(E.scene,E.camera); const pt=a.pt?new THREE.Vector3(...a.pt):(box?box.getCenter(new THREE.Vector3()):null); if(!pt) return {found:false};
  const v=pt.clone().project(E.camera); const W=c.width,H=c.height, sx=(v.x+1)/2*W, sy=(1-v.y)/2*H; const k=document.createElement('canvas'); k.width=24; k.height=24; const g=k.getContext('2d');
  g.drawImage(c,Math.max(0,sx-a.px/2),Math.max(0,sy-a.px/2),a.px,a.px,0,0,24,24); const d=g.getImageData(0,0,24,24).data; let R=0,G=0,B=0,n=0,wh=0,mx=0;
  for(let i=0;i<d.length;i+=4){ R+=d[i]; G+=d[i+1]; B+=d[i+2]; n++; if(d[i]>240&&d[i+1]>240&&d[i+2]>240) wh++; mx=Math.max(mx,d[i]+d[i+1]+d[i+2]); }
  return {found:!!box||!!a.pt, box:box?[box.min.toArray().map(x=>+x.toFixed(2)),box.max.toArray().map(x=>+x.toFixed(2))]:null, screen:[Math.round(sx),Math.round(sy)], onScreen:v.z<1&&Math.abs(v.x)<=1&&Math.abs(v.y)<=1, rgb:[Math.round(R/n),Math.round(G/n),Math.round(B/n)], white:+(wh/n).toFixed(3)}; })"""


async def looks(pg, cdp, sid, tag):
    its = [i for i in await pg.evaluate(ITS) if i['look']]
    R.note('%s 看東西的互動 %d 個：%s' % (tag, len(its), J(its)))
    for it in its:
        # r2（CC 07:1x）：看東西的互動 prio −0.3、讓位給坐下（src/l118_shops3d.js）——第一個站點互動鍵是「坐下」時，換範圍裡別的站點再試（最多 6 個），記哪裡按得到；全部都被搶＝玩家找不到看那個東西的位置（交 BB）
        tried = []; okp = None
        for fr, ang in [(0.6, None), (0.3, 0), (0.3, 90), (0.3, 180), (0.3, 270), (0.85, 45)]:
            if ang is None: cx, cz = it['x'], it['z']
            else: cx, cz = it['x'] + it['r'] * 0.5 * math.cos(math.radians(ang)), it['z'] + it['r'] * 0.5 * math.sin(math.radians(ang))
            tg = await D.standable_near(pg, cx, cz, it['r'] * fr, 0)
            if not tg: continue
            await joy_walk(pg, cdp, tg['x'], tg['z'], 0.25, 30, '%s 搖桿走到「%s」附近 (%.2f,%.2f)' % (tag, it['label'], tg['x'], tg['z']))
            st_ = await D.settle(pg); tried.append([round(st_['x'], 2), round(st_['z'], 2), st_['interact']])
            if st_['interact'].startswith(it['label']): okp = tried[-1]; break
        R.note('%s「%s」試過的站點（座標、互動鍵）：%s' % (tag, it['label'], J(tried)))
        if not okp:
            R.check('%s「%s」範圍裡找得到一個互動鍵是它的站點（不是被「坐下」搶走）' % (tag, it['label']), False, J(tried)); await D.shot(pg, 'l118a_special_%s_look_blocked' % sid); continue
        if not await tap_interact(pg, cdp, it['label'], tag): continue
        got = []; t0 = time.time()
        while time.time() - t0 < 20:
            cap = await pg.evaluate("(()=>{ const e=document.getElementById('caption'); return e&&!e.classList.contains('hide')&&+getComputedStyle(e).opacity>0.05?(e.textContent||''):''; })()")   # r2（CC 07:1x）：看東西是 caption('',look,4600)（字幕），不是對話框——第一輪只看 #dlg、抓到 []
            if cap and (not got or got[-1] != cap): got.append(cap)
            if cap and time.time() - t0 > 2: break
            q = await D.st(pg)
            if q['dlg']:
                tx = await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''"); await pg.wait_for_timeout(1200)
                tx = await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")
                if not got or got[-1] != tx: got.append(tx)
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
            if got and not q['busy']: break
            await pg.wait_for_timeout(400)
        R.note('%s 按「%s」逐字：%s；配置的字：%s' % (tag, it['label'], J(got), J(it['look'])))
        R.check('%s 按「%s」出現的字＝配置的字' % (tag, it['label']), any(it['look'].strip() in g or g.strip() in it['look'] for g in got if g.strip()), J({'got': got, 'want': it['look']}))


async def part_special3(pg, cdp):
    for sid in shop_filter(None, ['omu', 'noodle2', 'pasta', 'home', 'cafe2']):
        tag = '[SPECIAL %s]' % sid
        await at_shop(pg, cdp, sid, H_INT)
        labs = sorted({i['label'] for i in await pg.evaluate(ITS)})
        R.note('%s 店內全部互動鍵文字：%s' % (tag, J(labs)))
        if sid == 'cafe2': R.check('%s 沒有書架、念書類互動（大學食堂；念書搬到木曜日）' % tag, not any(k in x for x in labs for k in ('書架', '讀書', '念書', '唸書', '自習')), J(labs))
        await looks(pg, cdp, sid, tag)
        if sid == 'omu':
            await cam_shot(pg, fn('int', sid, H_INT, 'close_地板', True), (0.0, 1.35, 1.6), (0.0, 0.0, 0.2), 30)
            await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()"); await pg.evaluate(D.CAM, {'eye': [0.0, 1.35, 1.6], 'look': [0.0, 0.0, 0.2], 'lens': 30})
            px = await pg.evaluate(PIX, {'re': '^$', 'pt': [0.0, 0.0, 0.25], 'px': 120})
            await pg.evaluate(D.UNCAM); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()"); await pg.set_viewport_size(VP)
            lum = 0.299 * px['rgb'][0] + 0.587 * px['rgb'][1] + 0.114 * px['rgb'][2]
            R.note('%s 地板中間（0,0,0.25）附近 120 px 平均色 %s、亮度 %.0f（D112：不要深色木；BB 判）' % (tag, px['rgb'], lum))
        if sid == 'noodle2':
            ck = await pg.evaluate("(()=>(GAME.E.npcs||[]).filter(n=>n&&n.clerk).map(n=>({id:n.id||n.cid||null, x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), yaw:+n.obj.rotation.y.toFixed(2)})))()")
            want = await pg.evaluate("L118_SHOP_LAYOUTS.noodle2.clerk")
            R.note('%s 店員：%s；配置 clerk %s（yaw 0＝面向 +z＝店門那一邊）' % (tag, J(ck), J(want)))
            R.check('%s 店員站在配置的位置（0.2 m 內）' % tag, len(ck) >= 1 and math.hypot(ck[0]['x'] - want['x'], ck[0]['z'] - want['z']) <= 0.2, J(ck))
            ov = next((i for i in await pg.evaluate(ITS) if i['label'].startswith('窯')), None)
            if ov:
                tg = await D.standable_near(pg, ov['x'], ov['z'], ov['r'] * 0.6, 0)
                ok, t, st = await joy_walk(pg, cdp, tg['x'], tg['z'], 0.3, 40, '%s 搖桿走到爐口前' % tag)
                R.check('%s 搖桿走到爐口前（%s 秒）' % (tag, t), ok, J(st))
                await L.turn_camera_to(pg, cdp, 0.9, -3.6); await pg.wait_for_timeout(1200)
                await game_shot(pg, fn('special', sid, H_INT, 'oven_front', False), tag)
            for h in (H_INT, 20.0):
                if h != H_INT: await at_shop(pg, cdp, sid, h, '（晚上看窯爐的火）')
                eye, look = (0.9, 1.5, -0.9), (0.9, 0.9, -3.6)
                await cam_shot(pg, fn('special', sid, h, 'oven_fire', True), eye, look, 32)
                await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()"); await pg.evaluate(D.CAM, {'eye': list(eye), 'look': list(look), 'lens': 32})
                px = await pg.evaluate(PIX, {'re': 'noodle2_fire|fire|ember', 'pt': None, 'px': 40})
                await pg.evaluate(D.UNCAM); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()"); await pg.set_viewport_size(VP)
                R.note('%s %s 火焰網格（材質名 fire／ember）附近 40 px：%s' % (tag, hhmm(h), J(px)))
                R.check('%s %s 窯爐的火：找得到火焰網格、在畫面上、不是白光（近白像素 <30%%、平均色偏橘：R>B＋40）' % (tag, hhmm(h)), px.get('found') and px.get('onScreen') and px['white'] < 0.3 and px['rgb'][0] > px['rgb'][2] + 40, J(px))
        if sid == 'pasta':
            d = await pg.evaluate("GAME.G.day")
            await pg.evaluate("(d=>{ const G=GAME.G; if(!G.side||typeof G.side!=='object') G.side={}; G.side.SQ12={state:'done', doneDay:d-1}; G.stage='law'; })", d)
            R.setup('【前置／捷徑】G.side.SQ12＝{state:done, doneDay:%d}（前一天做完）、G.stage law（痕跡每一格問 SIDEQ.traceOn，不用重進）' % (d - 1))
            await pg.wait_for_timeout(1000)
            tr = await pg.evaluate("(()=>{ let o=null; GAME.E.scene.traverse(q=>{ if(!o&&/TRACE_SQ12/.test(q.name||'')) o=q; }); if(!o) return null; const p=new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()); return {name:o.name, visible:o.visible, on:typeof SIDEQ!=='undefined'&&SIDEQ.traceOn?SIDEQ.traceOn(GAME.G,'SQ12'):null, at:[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)]}; })()")
            R.note('%s TRACE_SQ12：%s' % (tag, J(tr)))
            if not R.check('%s 模型裡有 TRACE_SQ12_* 節點、SQ12 做完的隔天看得到' % tag, bool(tr) and tr['visible'], J(tr)): continue
            tg = await D.standable_near(pg, tr['at'][0], tr['at'][2], 1.4, 0)
            ok, t, st = await joy_walk(pg, cdp, tg['x'], tg['z'], 0.3, 40, '%s 搖桿走到照片前' % tag) if tg else (False, 0, [])
            s_ = await D.settle(pg); its = await pg.evaluate(ITS)
            near = sorted([i for i in its if math.hypot(i['x'] - tr['at'][0], i['z'] - tr['at'][2]) < 1.6], key=lambda i: math.hypot(i['x'] - tr['at'][0], i['z'] - tr['at'][2]))
            R.note('%s 走到照片前 %s：互動鍵「%s」；照片 1.6 m 內的互動點 %s' % (tag, J([s_['x'], s_['z']]), s_['interact'], J(near)))
            R.check('%s 走到照片前看得到互動鍵（記文字）' % tag, ok and bool(s_['interact']), J({'interact': s_['interact']}))
            await game_shot(pg, fn('special', sid, H_INT, 'sq12_photo', False), tag, judge=False)
            await cam_shot(pg, fn('special', sid, H_INT, 'sq12_photo', True), (tr['at'][0], tr['at'][1] + 0.1, tr['at'][2] + 1.3), tuple(tr['at']), 36, judge=False)


# ------------------------------------------------------------------ 四間第 2 版：廚房、招牌物件、辛亥韓食橫樑（BB 06:34；座標照 bc407bfc5 的 tools/blender/env_second/lane118_shops.py＋l118_shop_layouts.js）
KITCHEN = {'dian': [('開放式廚房', (-0.45, 1.65, -0.3), (-0.45, 1.15, -3.6), 26), ('每桌鐵板牛排', (-0.9, 1.45, 0.4), (-1.95, 0.75, 0.4), 32)],
           'self': [('開放式廚房', (0.8, 1.65, -0.9), (0.8, 1.15, -4.1), 26), ('配菜櫃炸物和保溫燈', (-0.3, 1.75, 0.9), (-2.6, 1.25, -1.3), 28), ('吊牌', (0.85, 1.65, -0.4), (0.85, 2.55, -2.9), 36)],
           'korea': [('開放式廚房', (0.65, 1.65, -0.6), (0.65, 1.15, -3.9), 26), ('木頭製麵檯麵團削麵刀', (-0.2, 1.6, 2.3), (-1.1, 0.95, 3.75), 30)],
           'tea': [('出菜口和廚房', (-0.2, 1.6, -0.6), (-0.3, 1.2, -3.8), 30), ('每桌小菜', (-0.6, 1.45, 2.1), (0.7, 0.76, 2.1), 32)]}


async def pinch(pg, cdp, d0, d1, steps=12):
    """兩指捏合（CDP 觸控兩點，畫面中間偏上的遊戲畫面）：d0→d1 像素；d1<d0＝拉遠"""
    cx, cy = await pg.evaluate("[innerWidth/2, innerHeight*0.38]")
    pts = lambda d: [{'x': cx - d / 2, 'y': cy, 'id': 1}, {'x': cx + d / 2, 'y': cy, 'id': 2}]
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': pts(d0)})
    for i in range(1, steps + 1):
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': pts(d0 + (d1 - d0) * i / steps)}); await pg.wait_for_timeout(60)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


async def part_kitchen(pg, cdp, sid):
    tag = '[KITCHEN %s]' % sid
    await at_shop(pg, cdp, sid, H_INT)
    for lab, eye, look, lens in KITCHEN.get(sid, []):
        await cam_shot(pg, fn('kitchen', sid, H_INT, lab, True), eye, look, lens)
    if sid != 'tea': return
    ok, t, st = await joy_walk(pg, cdp, -0.45, 0.4, 0.4, 40, '%s 搖桿走到店中間的走道' % tag)
    R.check('%s 搖桿走到店中間（%s 秒）' % (tag, t), ok, J(st))
    CAMJ = "(()=>{ const c=GAME.E.cam; return {dist:c.dist!=null?+(+c.dist).toFixed(2):null, distTarget:c.distTarget!=null?+(+c.distTarget).toFixed(2):null, pitch:+(+c.pitch).toFixed(3), yaw:+(+c.yaw).toFixed(3)}; })()"
    c0 = await pg.evaluate(CAMJ)
    for _ in range(3):
        await pinch(pg, cdp, 300, 40); await pg.wait_for_timeout(900)
    await pg.wait_for_timeout(1500); c1 = await pg.evaluate(CAMJ)
    R.note('%s 兩指捏合：鏡頭 %s → %s' % (tag, J(c0), J(c1)))
    R.check('%s 兩指捏合把鏡頭拉到最遠（distTarget 6，室內上限）' % tag, (c1['distTarget'] or 0) >= 5.9, J(c1))
    await game_shot(pg, fn('kitchen', sid, H_INT, 'beams_far', False), tag + ' 鏡頭最遠')
    pt = await pg.evaluate("(()=>{ for(const fy of [0.3,0.35,0.25]){ const x=innerWidth*0.55, y=innerHeight*fy; const a=document.elementFromPoint(x,y), b=document.elementFromPoint(x,y+200); if(a&&a.id==='c'&&b&&b.id==='c') return {x,y}; } return null; })()")
    if pt:
        for _ in range(2): await L.drag(pg, cdp, pt['x'], pt['y'], pt['x'], pt['y'] + 200, steps=12); await pg.wait_for_timeout(300)
    await pg.wait_for_timeout(1500); c2 = await pg.evaluate(CAMJ)
    R.note('%s 往下拖到最大俯角：%s' % (tag, J(c2)))
    await game_shot(pg, fn('kitchen', sid, H_INT, 'beams_far_top', False), tag + ' 鏡頭最遠＋最大俯角')


# ------------------------------------------------------------------ 還是舊模型的店
async def part_other(pg, cdp):
    for sid in OLD2:
        tag = '[OTHER5 %s]' % sid
        await at_shop(pg, cdp, sid, H_INT); await pg.wait_for_timeout(1500)
        await game_shot(pg, fn('int', sid, H_INT, 'door', False), tag, judge=False)
        Ly = await pg.evaluate("(s=>{ const L=L118_SHOP_LAYOUTS[s]; return {b:L.bounds, spawn:L.spawn, name:L.name}; })", sid)
        await cam_shot(pg, fn('int', sid, H_INT, 'in', True), (Ly['spawn']['x'] * 0.6, 1.6, Ly['b']['z1'] - 0.35), (0.0, 1.25, Ly['b']['z0'] + 0.8), 22, judge=False)
        R.note('%s 舊模型現況（%s），只拍不判' % (tag, Ly['name']))


def parse(p):
    """EXT14／SEATS_korea_1-7／CORNERS_tea → (base, shop, (a,b))"""
    bits = p.split('_'); base = bits[0].upper()
    if base == 'INT' and len(bits) > 1 and bits[1].upper() == 'FRONT': base = 'INTFRONT'; bits = [base] + bits[2:]
    shop = bits[1] if len(bits) > 1 else None; rng = None
    if len(bits) > 2 and '-' in bits[2]: a, b = bits[2].split('-'); rng = (int(a), int(b))
    return base, shop, rng


async def main():
    print('CC L118A：PARTS %s；SHA %s；DAY %s；Playwright（PC GPU）≠ iPhone' % (','.join(PARTS), os.environ.get('SHA', '?'), DAY), flush=True)
    vsrc = vdepth = None; vdone = []
    if any(parse(p)[0] == 'VIEWSNEW' for p in PARTS): vsrc, vdepth, vdone = views_prepare()
    try:
        async with async_playwright() as p:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            await pg.goto(URL)
            if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
            await pg.evaluate("(()=>{ try{ localStorage.clear(); }catch(e){} if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; })()")
            cal = await pg.evaluate("(k=>{ try{ const d=STORY.dayOfKey(k); const c=CALENDAR.dateOf(d); return {day:d, wd:c.wd, key:c.key, hol:c.holiday||c.hol||null, typhoon:c.typhoon||null}; }catch(e){ return String(e); } })", DAY)
            R.note('日期 %s：%s（wd 3＝星期三）' % (DAY, J(cal)))
            for part in PARTS:
                base, shop, rng = parse(part)
                print('== %s' % part, flush=True)
                try:
                    if base == 'EXT14': await part_ext(pg, cdp, 14.0)
                    elif base == 'EXT20': await part_ext(pg, cdp, 20.0)
                    elif base == 'INTFRONT': await part_intfront(pg, cdp, shop_filter(shop, NEW9), [float(x) for x in (os.environ.get('HOURS_INT') or str(H_INT)).split(',')])
                    elif base == 'DRINK': await part_drink(pg, cdp)
                    elif base == 'LANEWALK': await part_lanewalk(pg, cdp)
                    elif base == 'CORNERS':
                        for sid in shop_filter(shop, NEW9): await part_corners(pg, cdp, sid)
                    elif base == 'SEATS':
                        for sid in shop_filter(shop, NEW9): await part_seats(pg, cdp, sid, rng)
                    elif base == 'WALLWALK':
                        for sid in shop_filter(shop, NEW9): await part_wallwalk(pg, cdp, sid)
                    elif base == 'DOORS':
                        for sid in shop_filter(shop, NEW9): await part_doors(pg, cdp, sid)
                    elif base == 'VIEWS': await part_views(pg, cdp, 'asis')
                    elif base == 'VIEWSNEW':
                        if not vsrc: R.note('[VIEWSNEW] 沒有新拍的 webp，窗外沒有換（見上面的訊息）；只留 views_new/ 的原始檔'); continue
                        if vdepth:
                            dd = {k[:-4]: v for k, v in vdepth.items() if k.startswith('l118_') and k.endswith('_day') and v.get('far')}
                            n = await pg.evaluate("(d=>{ let n=0; for(const k in d){ const v=d[k]; if(W3.VIEW_LAYERS){ W3.VIEW_LAYERS[k]={far:v.far, near:v.near||W3.VIEW_LAYERS[k]&&W3.VIEW_LAYERS[k].near}; n++; } } return n; })", dd)
                            R.setup('【捷徑】W3.VIEW_LAYERS 換成重拍量到的景深（%d 間）：%s' % (n, J(dd)))
                        await part_views(pg, cdp, 'reshot')
                    elif base in ('OTHER', 'OTHER5'): await part_other(pg, cdp)
                    elif base in ('SPECIAL', 'SPECIAL3'): await part_special3(pg, cdp)
                    elif base == 'KITCHEN':
                        for sid in shop_filter(shop, ['dian', 'self', 'korea', 'tea']): await part_kitchen(pg, cdp, sid)
                    else: R.check('[%s] 認得這個 PART' % part, False, '')
                except Exception as e:
                    R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
                    try: await pg.set_viewport_size(VP); await pg.evaluate(D.UNCAM); await pg.evaluate(D.HUD + '(true)')
                    except Exception: pass
            R.check('沒有 JS 例外（pageerror）', not errs, J(errs[:3]))
            await b.close()
    finally:
        views_restore(vdone)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
