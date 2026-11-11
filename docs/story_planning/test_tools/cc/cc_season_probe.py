"""CC（帳號 A）11-11：SEASON（LIFE-DETAILS-SEASONAL-1110 季節布置第一批：公館、溫州街的聖誕與過年）——BB 03:48 派工；新版＝開發分支 b394363fe，舊版對照 696cf6036。
Playwright（PC GPU）≠ iPhone；畫面判定歸 BB。

對照的程式（b394363fe）：
  日期表 src/data/season_deco.js（SEASON_DECO）：
    XMAS 聖誕（門上的花圈、玻璃上緣的小燈串、雪花貼紙）md 12-01～12-25（含頭尾）；只有咖啡、早午餐店（溫州街 SUNNY SIDE、日常失速；公館 afar、Daybreak），每區 2 間。
    CNY 過年（春聯、橫批、倒貼的福、紅燈籠）lunar cny，from −14、to +15（春節往前 14 天～往後 15 天）；每一扇店門、住家門（公館 11 扇、溫州街 13 扇）。
    CALENDAR.LUNAR[2026].cny＝2026-02-17（src/data/calendar.js 30 行）→ 除夕 02-16、除夕前三天 02-13、初三 02-19；CNY 顯示 02-03～03-04；XMAS 顯示 2025-12-01～12-25。
  切換 src/season_deco3d.js（SD3）：包住 Z3.ZONES.wenzhou／gongguan 的 build；進區域時 SD3.active(區域, G.day) 決定代號，沒有任何一組＝不載入模型；
    有＝載入 bldg.season_<區域>（assets/models/env/second_ai/season_<區域>.glb）、clone 成 'season_<區域>_glb' 掛進 zone.group，SEASON_<代號>_on 照代號顯示（zone.seasonCodes、zone.seasonRoot）。
    不擋導航、沒有互動點、不投影。
  模型節點：SEASON_CNY_on（網格 SEASON_CNY_at 貼圖、SEASON_CNY_gl 發光〔只有公館〕、SEASON_CNY_vc 頂點色〔只有公館〕）；
            SEASON_XMAS_on（SEASON_XMAS_flat、SEASON_XMAS_gl 發光、SEASON_XMAS_vc）。材質 season_atlas、season_vc、season_glow（emissive 1,1,1 × strength 1.2＝晚上會亮的那些）。
    每一扇門的位置在 season_<區域>.doors.json（id、kind、w0／w1 門的兩端、n 朝外、top 門頂、glass 櫥窗兩端）：公館 G00～G14 在 z 22、溫州街 A*（z 5.9）、B*（z −5.9）、C2、W0、W2。
    合成的網格是整條街一個，所以近拍照 doors.json 的門，把每扇門附近 3 m 內看得到的 season 頂點算成那扇門的布置（「看到什麼拍什麼」：沒有布置的門不拍）。

PARTS：
  SHOTS  DATES 每個日期 × ZONES 每條街 × HOURS（預設 14,20）：【前置】讀檔到那一天那個時間 → 等季節模型 → log 場景裡 season_*／SEASON_* 物件名稱、數量、看得到的那幾個、外框；
         和 SD3.active 的預期比對（平常日 2025-11-05 不能有任何布置）→ 全景三張、每扇有布置的門近拍、晚上發光那一叢再近一張（中央全白 >15% 標★）→ 拼一張。
         第一個時間另外做穿模（外框交集近似：每扇門的布置外框 vs 招牌、柱子、機車、其他網格的頂點）。
         過曝：18 點以後，有發光網格（season_glow）的門：另外畫一張遮罩（發光網格白、其他黑但照樣擋），在正常截圖的同樣像素上算全白（>245）和紅色的比例；全白 >15% 標★。
  EDGE   照日期表算邊界（每一段：開始前一天、開始當天、最後一天、結束隔天）× ZONES：數物件、拍一張全景（14:00）。舊版沒有 SEASON_DECO 就用新版的日期（EDGE_DATES 可蓋過）。
  WALK   FUNC_DATES 每個日期 × ZONES：搖桿沿街走一趟（照 E.pathTo 中途點，F.joy_to）；walkFallbacks 0。
  DOORS  FUNC_DATES × ZONES：每一間「進…」的店門（ITS 找 label 開頭是「進」、有 exit 的）搖桿走過去、按鈕是它、按了進得去、從店裡出口出得來、出來推得動（DOORS_MAX 間）。
  NAV    ZONES：平常日（NORMAL_DATE）和 FUNC_DATES 每一天各掃一次 canStand（半徑 0.3、每個導航格中心），記不一樣的格子。
  FPS    ZONES × FPS_DATES（預設平常日＋FUNC_DATES）× FPS_HOURS（預設 20）：兩個點各 FPSS 秒（舊版同位置對照）。
環境變數：SHA、PARTS、ZONES（預設 gongguan,wenzhou）、DATES（預設 2025-12-10,2026-02-13,2026-02-19,2025-11-05）、HOURS（預設 14,20）、FUNC_DATES（預設 2026-02-13＝除夕前三天：有過年布置、店照常開；初三國定假日很多店不開，DOORS 會跳過不開的店）、
  NORMAL_DATE（預設 2025-11-05）、EDGE_DATES（逗號分隔，蓋過自動算的）、EDGE_LIST_ONLY（1＝只列邊界日）、DOORS_MAX（預設 99）、FPSS（預設 8）、FPS_HOURS（預設 20）、Q（畫質，預設 medium）、LW_TESTS。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=SHOTS [DATES=…] [ZONES=gongguan] python cc_season_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
EV = lambda k, d: os.environ.get(k) or d
PARTS = EV('PARTS', 'SHOTS,EDGE,WALK,DOORS,NAV,FPS').split(',')
ZONES = [z for z in EV('ZONES', 'gongguan,wenzhou').split(',') if z]
NORMAL = EV('NORMAL_DATE', '2025-11-05')
DATES = [d for d in EV('DATES', '2025-12-10,2026-02-13,2026-02-19,' + NORMAL).split(',') if d]
HOURS = [float(x) for x in EV('HOURS', '14,20').split(',')]
FUNC_DATES = [d for d in EV('FUNC_DATES', '2026-02-13').split(',') if d]   # 除夕前三天：有過年布置、店照常開（初三是國定假日，很多店關）
SHA = EV('SHA', '')[:9]
R = L.Run('season', OUT); F.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ZN = {'gongguan': '公館', 'wenzhou': '溫州街'}
DAYNAME = {'2025-12-10': '聖誕期間', '2026-02-13': '除夕前三天', '2026-02-16': '除夕', '2026-02-17': '春節', '2026-02-19': '初三', NORMAL: '平常日（不該有布置）'}
# 舊版沒有日期表時的邊界日（照 b394363fe 的 season_deco.js＋calendar.js 算好的）
EDGE_FALLBACK = [('XMAS', '開始前一天', '2025-11-30', False), ('XMAS', '開始當天', '2025-12-01', True), ('XMAS', '最後一天', '2025-12-25', True), ('XMAS', '結束隔天', '2025-12-26', False),
                 ('CNY', '開始前一天', '2026-02-02', False), ('CNY', '開始當天', '2026-02-03', True), ('CNY', '最後一天', '2026-03-04', True), ('CNY', '結束隔天', '2026-03-05', False)]
STREETS = {
    'gongguan': {'pano': [('西段往東（店面那一側）', (-64.0, 2.2, 13.0), (-42.0, 2.0, 21.0), 24), ('中段往東', (-14.0, 2.2, 13.0), (8.0, 2.0, 21.0), 24), ('東段往西', (76.0, 2.2, 13.0), (52.0, 2.0, 21.0), 24)],
                 'walk': [(-58.0, 14.0), (-25.0, 14.0), (5.0, 14.0), (35.0, 14.0), (65.0, 14.0)], 'axisZ': 14.0},
    'wenzhou': {'pano': [('西段往東', (-36.0, 2.0, 0.0), (-15.0, 1.8, 0.0), 24), ('中段往東', (-2.0, 2.0, 0.0), (20.0, 1.8, 0.0), 24), ('東段往西', (52.0, 2.0, 0.0), (30.0, 1.8, 0.0), 24)],
                'walk': [(-34.0, 0.0), (-10.0, 0.0), (15.0, 0.0), (40.0, 0.0), (52.0, 0.0)], 'axisZ': 0.0},
}

ME = "(()=>{ const E=GAME.E, P=E.player, p=P.obj.position, N=E.nav; return {zone:GAME.G.zone, day:GAME.G.day, h:+(+GAME.G.hour).toFixed(2), x:+p.x.toFixed(2), z:+p.z.toFixed(2), free:N?!!N.free(p.x,p.z):null, stand:E.canStand?!!E.canStand(p.x,p.z,0.3,P.lv|0):null, fb:GAME.walkFallbacks|0}; })()"
SNAPFREE = r"""(([x,z,r])=>{ const E=GAME.E; const ok=(a,b)=>E.canStand?E.canStand(a,b,0.33,0):(E.nav&&E.nav.free(a,b)); if(ok(x,z)) return [x,z,0]; let best=null;
  for(let rr=0.25;rr<=r+1e-6;rr+=0.25){ for(let k=0;k<24;k++){ const a=k/24*Math.PI*2, px=x+Math.cos(a)*rr, pz=z+Math.sin(a)*rr; if(ok(px,pz)){ best=[+px.toFixed(2),+pz.toFixed(2),+rr.toFixed(2)]; break; } } if(best) break; } return best; })"""
# 場景裡的季節物件：名字、種類、看不看得到（往上每一層都 visible）、頂點數、世界外框；SD3 的預期代號
SEASON_LIST = r"""(()=>{ const E=GAME.E, z=E.zone||{}, zid=GAME.G.zone, day=GAME.G.day; const vis=o=>{ for(let q=o;q;q=q.parent) if(q.visible===false) return false; return true; };
  /* 只有季節模型（season_<區域>_glb）底下的才算布置；溫州小公園的杜鵑、楓香節點也叫 SEASON_AZALEA_*（zones3d.js wzParkSeason），另外記、不算 */
  const roots=[]; E.scene.traverse(o=>{ if(/^season_\w+_glb$/.test(o.name||'')) roots.push(o); }); const under=o=>{ for(let q=o;q;q=q.parent) if(roots.includes(q)) return true; return false; };
  const L=[]; E.scene.traverse(o=>{ if(!/^(season_|SEASON_)/.test(o.name||'')) return; let b=null; if(o.isMesh){ o.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(o); if(!bb.isEmpty()) b=[[+bb.min.x.toFixed(2),+bb.min.y.toFixed(2),+bb.min.z.toFixed(2)],[+bb.max.x.toFixed(2),+bb.max.y.toFixed(2),+bb.max.z.toFixed(2)]]; }
    const m=o.isMesh?(Array.isArray(o.material)?o.material[0]:o.material):null; L.push({name:o.name, deco:under(o), type:o.isMesh?'mesh':(o.isGroup?'group':o.type), visible:vis(o), verts:o.isMesh&&o.geometry.attributes.position?o.geometry.attributes.position.count:0, mat:m?m.name:null,
      emissive:m&&m.emissive?+(m.emissive.r+m.emissive.g+m.emissive.b).toFixed(2):null, emI:m&&m.emissiveIntensity!=null?+(+m.emissiveIntensity).toFixed(2):null, box:b}); });
  const cnt={}, other={}; L.forEach(q=>{ if(q.deco) cnt[q.name]=(cnt[q.name]||0)+1; else other[q.name]=(other[q.name]||0)+1; });
  return {sd3:typeof SD3!=='undefined', deco:typeof SEASON_DECO!=='undefined', expect:(typeof SD3!=='undefined'&&SD3.active)?SD3.active(zid,day):null, key:(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf)?CALENDAR.dateOf(day).key:null,
    seasonCodes:z.seasonCodes||null, root:!!z.seasonRoot, roots:roots.map(o=>o.name), list:L.filter(q=>q.deco), other, count:cnt, visibleOn:L.filter(q=>q.deco&&/^SEASON_[A-Z0-9]+_on$/.test(q.name)&&q.visible).map(q=>q.name.replace(/^SEASON_|_on$/g,'')), visibleMeshes:L.filter(q=>q.deco&&q.type==='mesh'&&q.visible).map(q=>q.name)}; })()"""
# 每扇門的布置：doors.json 的門 → 附近 3 m 內看得到的 season 頂點（世界座標）→ 外框、哪幾個網格、發光那一叢的中心
DOORS_JS = r"""(async zid=>{ const E=GAME.E; let doors=[]; try{ const r=await fetch('assets/models/env/second_ai/season_'+zid+'.doors.json'); if(r.ok) doors=await r.json(); }catch(e){}
  const vis=o=>{ for(let q=o;q;q=q.parent) if(q.visible===false) return false; return true; };
  /* 每扇門一段「門面」線段：門（w0、w1）和櫥窗（glass）在門面方向的最外兩端；布置的頂點離哪一段最近（1.5 m 內）就算哪一扇（聖誕燈串沿整片玻璃上緣，離門中心可以 5 m 以上）*/
  const D=doors.map(d=>{ const c=[(d.w0[0]+d.w1[0])/2,(d.w0[1]+d.w1[1])/2], tl=Math.hypot(d.w1[0]-d.w0[0],d.w1[1]-d.w0[1])||1, t=[(d.w1[0]-d.w0[0])/tl,(d.w1[1]-d.w0[1])/tl]; const P=[d.w0,d.w1].concat(d.glass||[]), pr=P.map(q=>(q[0]-c[0])*t[0]+(q[1]-c[1])*t[1]);
    return {id:d.id, kind:d.kind, c, t, s0:Math.min(...pr), s1:Math.max(...pr), n:d.n, top:d.top, meshes:{}, box:null, glow:null}; });
  const segD=(d,x,z)=>{ const u=Math.max(d.s0,Math.min(d.s1,(x-d.c[0])*d.t[0]+(z-d.c[1])*d.t[1])); return Math.hypot(x-(d.c[0]+d.t[0]*u),z-(d.c[1]+d.t[1]*u)); };
  const roots=[]; E.scene.traverse(o=>{ if(/^season_\w+_glb$/.test(o.name||'')) roots.push(o); }); const under=o=>{ for(let q=o;q;q=q.parent) if(roots.includes(q)) return true; return false; };
  const v=new THREE.Vector3(); E.scene.traverse(o=>{ if(!o.isMesh||!under(o)||!vis(o)) return; o.updateMatrixWorld(true); const pa=o.geometry.attributes.position, mat=(Array.isArray(o.material)?o.material[0]:o.material)||{}, glow=/glow/.test(mat.name||'');
    for(let k=0;k<pa.count;k++){ v.fromBufferAttribute(pa,k).applyMatrix4(o.matrixWorld); let best=null, bd=1.5; for(const d of D){ const dd=segD(d,v.x,v.z); if(dd<bd){ bd=dd; best=d; } } if(!best){ (D.orphan=D.orphan||{})[o.name]=(D.orphan[o.name]||0)+1; continue; }
      best.meshes[o.name]=(best.meshes[o.name]||0)+1; (best.box=best.box||new THREE.Box3()).expandByPoint(v); if(glow){ (best.glow=best.glow||new THREE.Box3()).expandByPoint(v); } } });
  const r3=b=>b?[[+b.min.x.toFixed(2),+b.min.y.toFixed(2),+b.min.z.toFixed(2)],[+b.max.x.toFixed(2),+b.max.y.toFixed(2),+b.max.z.toFixed(2)]]:null;
  return {n:doors.length, orphan:D.orphan||null, doors:D.map(d=>({id:d.id,kind:d.kind,c:[+d.c[0].toFixed(2),+d.c[1].toFixed(2)],n:d.n,top:d.top,meshes:d.meshes,box:r3(d.box),glow:r3(d.glow)}))}; })"""
# 穿模（外框交集近似）：每扇門布置的外框（往外 1 cm）裡面有沒有別的網格的頂點；有＝那些頂點的外框和布置外框的交集（長寬高、體積），照材質名稱分類
CLIP_JS = r"""(a=>{ const E=GAME.E, root=E.zone&&E.zone.seasonRoot; const vis=o=>{ for(let q=o;q;q=q.parent) if(q.visible===false) return false; return true; };
  const B=a.doors.filter(d=>d.box).map(d=>({id:d.id, b:new THREE.Box3(new THREE.Vector3(...d.box[0]),new THREE.Vector3(...d.box[1])).expandByScalar(0.01)})); if(!B.length) return {doors:0, hits:[]};
  const U=new THREE.Box3(); B.forEach(q=>U.union(q.b)); const out=[], v=new THREE.Vector3(), cat=s=>/pillar|column|柱/i.test(s)?'柱子':(/sign|SIGN|band|plate|PLATE|board|panel|neon|lightbox/i.test(s)?'招牌':(/scooter/i.test(s)?'機車':(/wall|plaster|tile|glass|win|door|frame|ground|road|floor|curb|walk/i.test(s)?'牆面玻璃地面（貼在門面上本來就會碰到）':'其他')));
  let meshesChecked=0; E.scene.traverse(o=>{ if(!o.isMesh||o.isSkinnedMesh||!vis(o)||!o.geometry||!o.geometry.attributes.position) return; for(let q=o;q;q=q.parent) if(q===root) return; if(/^SEASON_|^season_/.test(o.name||'')) return;
    o.updateMatrixWorld(true); if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const wb=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); if(o.isInstancedMesh){ return; } if(!wb.intersectsBox(U)) return; meshesChecked++;
    const pa=o.geometry.attributes.position, mn=((Array.isArray(o.material)?o.material[0]:o.material)||{}).name||'', inB=B.map(()=>null), cnt=B.map(()=>0);
    for(let k=0;k<pa.count;k++){ v.fromBufferAttribute(pa,k).applyMatrix4(o.matrixWorld); if(!U.containsPoint(v)) continue; for(let i=0;i<B.length;i++) if(B[i].b.containsPoint(v)){ cnt[i]++; (inB[i]=inB[i]||new THREE.Box3()).expandByPoint(v); } }
    for(let i=0;i<B.length;i++){ if(cnt[i]<1) continue; const x=inB[i].clone().intersect(B[i].b), s=x.getSize(new THREE.Vector3()); out.push({door:B[i].id, mesh:o.name||'(無名)', mat:mn, cat:cat(mn+' '+(o.name||'')), n:cnt[i], dims:[+s.x.toFixed(3),+s.y.toFixed(3),+s.z.toFixed(3)], vol:+(s.x*s.y*s.z).toFixed(5)}); } });
  /* 機車：正式模型是合成網格（scooters_*），上面照頂點算過；這裡另外用套件機車的位置（每台約 1.9×1.2×0.7 m）再算一次外框交集 */
  E.scene.traverse(o=>{ if(!/_kit_scooters$/.test(o.name||'')) return;
    for(const k of o.children.filter(q=>q.isGroup)){ k.updateMatrixWorld(true); const p=new THREE.Vector3().setFromMatrixPosition(k.matrixWorld), e=k.matrixWorld.elements, fx=e[8], fz=e[10], fl=Math.hypot(fx,fz)||1, hx=Math.abs(fx/fl)*0.95+Math.abs(fz/fl)*0.35, hz=Math.abs(fz/fl)*0.95+Math.abs(fx/fl)*0.35;
      const sb=new THREE.Box3(new THREE.Vector3(p.x-hx,0,p.z-hz),new THREE.Vector3(p.x+hx,1.2,p.z+hz)); for(const q of B){ if(!sb.intersectsBox(q.b)) continue; const x=sb.clone().intersect(q.b), s=x.getSize(new THREE.Vector3()); out.push({door:q.id, mesh:'套件機車 ('+p.x.toFixed(1)+','+p.z.toFixed(1)+')', mat:'', cat:'機車', n:0, dims:[+s.x.toFixed(3),+s.y.toFixed(3),+s.z.toFixed(3)], vol:+(s.x*s.y*s.z).toFixed(5)}); } } });
  out.sort((p,q)=>q.vol-p.vol); return {doors:B.length, meshesChecked, hits:out}; })"""
NAVSCAN_JS = r"""(a=>{ const E=GAME.E, N=E.nav; if(!N||!E.canStand) return null; let s=''; for(let r=0;r<N.rows;r++) for(let c=0;c<N.cols;c++){ const [x,z]=N.toWorld(c,r); s+=E.canStand(x,z,0.3,0)?'1':'0'; }
  window.__ccNav=window.__ccNav||{}; const k=a.zone, base=window.__ccNav[k]; let diff=null;
  if(a.base){ window.__ccNav[k]={bits:s,cols:N.cols,rows:N.rows}; } else if(base&&base.bits.length===s.length){ diff={lost:[],gained:[]}; for(let i=0;i<s.length;i++){ if(s[i]===base.bits[i]) continue; const [x,z]=N.toWorld(i%N.cols,Math.floor(i/N.cols)); (s[i]==='0'?diff.lost:diff.gained).push([+x.toFixed(2),+z.toFixed(2)]); } }
  return {cols:N.cols, rows:N.rows, cell:N.cell, stand:(s.match(/1/g)||[]).length, total:s.length, sameSize:base?base.bits.length===s.length:null, diff:diff?{lost:diff.lost.length, gained:diff.gained.length, lostPts:diff.lost.slice(0,60), gainedPts:diff.gained.slice(0,60)}:null}; })"""
CAP_JS = r"""(s=>{ let d=document.getElementById('cccap'); if(!s){ if(d) d.remove(); return; } if(!d){ d=document.createElement('div'); d.id='cccap'; d.style.cssText='position:fixed;left:0;top:0;right:0;z-index:99998;background:rgba(0,0,0,0.6);color:#fff;font:15px sans-serif;padding:3px 6px;pointer-events:none'; document.body.appendChild(d); } d.textContent=s; })"""
LUMA_JS = r"""(async b64=>{ const im=new Image(); im.src='data:image/jpeg;base64,'+b64; await im.decode(); const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d'); x.drawImage(im,0,0);
  const x0=Math.floor(im.width*0.2), y0=Math.floor(im.height*0.2), w=Math.floor(im.width*0.6), h=Math.floor(im.height*0.6), d=x.getImageData(x0,y0,w,h).data; let n=0,bk=0,wh=0,s=0;
  for(let i=0;i<d.length;i+=8){ const y=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; n++; s+=y; if(y<12) bk++; else if(y>245) wh++; } return {mean:+(s/n).toFixed(1), black:+(bk/n).toFixed(3), white:+(wh/n).toFixed(3)}; })"""
# 發光像素遮罩：把非發光的網格換成黑色（照樣寫深度、會擋住後面的燈）、season_glow 換成純白，背景黑、關霧，畫一張 → 遮罩＝看得到的發光像素；
# 再拿正常那張截圖的同樣像素算全白（>245）、紅色的比例。之後材質、背景、霧都還原。
GLOWMASK_JS = r"""(async b64=>{ const E=GAME.E, r=E.renderer, sc=E.scene, cam=E.camera, root=E.zone&&E.zone.seasonRoot; if(!root) return null;
  const im=new Image(); im.src='data:image/jpeg;base64,'+b64; await im.decode(); const W=im.width, H=im.height;
  const blk=new THREE.MeshBasicMaterial({color:0x000000}), wht=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}); const sw=[], hid=[]; let glowN=0;
  const under=o=>{ for(let q=o;q;q=q.parent) if(q===root) return true; return false; };
  sc.traverse(o=>{ if(o.isSprite||o.isPoints||o.isLine){ if(o.visible){ hid.push(o); o.visible=false; } return; } if(!o.isMesh) return; const m=Array.isArray(o.material)?o.material[0]:o.material; const g=under(o)&&m&&/glow/.test(m.name||''); if(g) glowN++; sw.push([o,o.material]); o.material=g?wht:blk; });
  const bg=sc.background, fog=sc.fog; sc.background=new THREE.Color(0x000000); sc.fog=null; let mk=null;
  try{ r.render(sc,cam); const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d'); x.drawImage(r.domElement,0,0,W,H); mk=x.getImageData(0,0,W,H).data; }
  finally{ for(const [o,m] of sw) o.material=m; for(const o of hid) o.visible=true; sc.background=bg; sc.fog=fog; blk.dispose(); wht.dispose(); E.render(); }
  const c2=document.createElement('canvas'); c2.width=W; c2.height=H; const x2=c2.getContext('2d'); x2.drawImage(im,0,0); const d=x2.getImageData(0,0,W,H).data; let n=0,wh=0,red=0,sum=0;
  for(let i=0;i<d.length;i+=4){ if(mk[i]<128) continue; n++; const y=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; sum+=y; if(y>245) wh++; if(d[i]>120&&d[i]>d[i+1]*1.8&&d[i]>d[i+2]*1.8) red++; }
  return {glowMeshes:glowN, px:n, white:n?+(wh/n).toFixed(3):null, red:n?+(red/n).toFixed(3):null, mean:n?+(sum/n).toFixed(1):null}; })"""
MONT_JS = r"""(async a=>{ const ims=await Promise.all(a.imgs.map(u=>new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src='data:image/jpeg;base64,'+u; })));
  const w=480, h=Math.round(480*ims[0].height/ims[0].width), C=a.cols, rows=Math.ceil(ims.length/C), k=document.createElement('canvas'); k.width=w*C; k.height=h*rows+30; const g=k.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,k.width,k.height);
  g.fillStyle='#fff'; g.font='bold 20px sans-serif'; g.fillText(a.title,8,22); ims.forEach((im,i)=>g.drawImage(im,(i%C)*w,30+Math.floor(i/C)*h,w,h)); return k.toDataURL('image/jpeg',0.85); })"""
FPS_JS = "(ms=>new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<ms) requestAnimationFrame(f); else { const i=GAME.E.renderer.info.render; res({fps:+(n/((performance.now()-t0)/1000)).toFixed(1), calls:i.calls, tris:i.triangles}); } }; requestAnimationFrame(f); }))"
EDGES_JS = r"""(zids=>{ if(typeof SEASON_DECO==='undefined'||typeof CALENDAR==='undefined'||typeof SD3==='undefined') return null; const out=[], codes=new Set(); for(const z of zids){ const Z=SEASON_DECO.zones[z]; if(Z) Z.codes.forEach(c=>codes.add(c)); }
  const d0=(typeof STORY!=='undefined'&&STORY.dayOfKey)?STORY.dayOfKey('2025-09-01'):1, KEY=d=>CALENDAR.dateOf(d).key;
  for(const c of codes){ let prev=SD3.on(c,d0), segs=0; for(let d=d0+1;d<d0+400&&segs<1;d++){ const on=SD3.on(c,d); if(on&&!prev){ let e=d; while(SD3.on(c,e+1)) e++; out.push([c,'開始前一天',KEY(d-1),false],[c,'開始當天',KEY(d),true],[c,'最後一天',KEY(e),true],[c,'結束隔天',KEY(e+1),false]); segs++; d=e; } prev=on; } }
  return out; })"""


def b64(b):
    return base64.b64encode(b).decode()


def hh_of(h):
    return '%02d%02d' % (int(h), int(round((h % 1) * 60)))


async def at(pg, cdp, zone, day, h, x=None, z=None, why=''):
    s = await D.load_zone(pg, cdp, zone, day, h, x, z, wait=7000)
    R.setup('【前置／捷徑】讀檔到 %s %s（%s）%.2f 時%s %s' % (zone, day, DAYNAME.get(day, ''), h, '' if x is None else ' (%.1f,%.1f)' % (x, z), why))
    return s


async def wait_season(pg, max_s=25):
    """等季節模型：SD3 預期有代號就等 zone.seasonRoot 掛上；預期沒有（或舊版）等 3 秒就回"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        q = await pg.evaluate("(()=>{ const z=GAME.E.zone||{}; const ex=(typeof SD3!=='undefined'&&SD3.active)?SD3.active(GAME.G.zone,GAME.G.day):null; return {ex, root:!!z.seasonRoot}; })()")
        if q['root']: return round(time.time() - t0, 1)
        if (not q['ex']) and time.time() - t0 > 3: return round(time.time() - t0, 1)
        await pg.wait_for_timeout(700)
    return round(time.time() - t0, 1)


async def season_report(pg, tag, day):
    q = await pg.evaluate(SEASON_LIST)
    names = sorted(q['count'].items())
    R.note('%s 日期 %s（遊戲 %s）；SD3 %s、SEASON_DECO %s；SD3 預期代號 %s；zone.seasonCodes %s；季節模型掛上 %s' % (tag, day, q['key'], q['sd3'], q['deco'], J(q['expect']), J(q['seasonCodes']), q['root']))
    R.note('%s 季節模型 %s 底下的物件 %d 個：%s；看得到的組 %s；看得到的網格 %s' % (tag, J(q['roots']), len(q['list']), J(names), J(q['visibleOn']), J(q['visibleMeshes'])))
    if q['other']: R.note('%s （季節模型以外、名字也是 season_／SEASON_ 開頭的：%s——溫州小公園的杜鵑楓香，不算布置）' % (tag, J(q['other'])))
    for it in q['list']:
        if it['type'] == 'mesh': R.note('%s 　%s：看得到 %s、頂點 %d、材質 %s（emissive %s × %s）、外框 %s' % (tag, it['name'], it['visible'], it['verts'], it['mat'], it['emissive'], it['emI'], J(it['box'])))
    if not q['sd3']:
        R.note('%s 這一版沒有 SD3（舊版沒有季節布置是預期）' % tag)
        R.check('%s 沒有任何看得到的季節布置（舊版）' % tag, not q['visibleMeshes'], J(q['visibleMeshes']))
    else:
        R.check('%s 看得到的季節組＝SD3 預期 %s（平常日＝一個都沒有）' % (tag, J(q['expect'])), sorted(q['visibleOn']) == sorted(q['expect'] or []) and (bool(q['root']) == bool(q['expect'])), J({'visible': q['visibleOn'], 'root': q['root']}))
        if day == NORMAL: R.check('%s 平常日 %s：沒有季節模型、沒有任何 SEASON 網格' % (tag, NORMAL), not q['root'] and not q['visibleMeshes'], J(q['visibleMeshes']))
    return q


class Shooter:
    """一批獨立鏡頭的截圖（D.CAM：暫停、搬遊戲鏡頭、照新鏡頭重算淡出牆、NPC、行道樹；不動玩家）：1280×720、藏 HUD 和玩家、上面一條字。"""
    def __init__(self, pg, tag):
        self.pg = pg; self.tag = tag; self.imgs = []; self.files = []; self.stars = []

    async def __aenter__(self):
        await self.pg.set_viewport_size({'width': 1280, 'height': 720}); await self.pg.wait_for_timeout(900)
        await self.pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()"); await self.pg.evaluate(D.HUD + '(false)')
        return self

    async def shot(self, fn, label, eye, look, lens=24, glow=None):
        c = await self.pg.evaluate(D.CAM, {'eye': list(eye), 'look': list(look), 'lens': lens}); await self.pg.wait_for_timeout(500)
        await self.pg.evaluate(CAP_JS, '%s｜%s｜%s' % (self.tag, label, SHA)); await self.pg.evaluate("GAME.E.render()")
        b = await self.pg.screenshot(path=os.path.join(OUT, fn), type='jpeg', quality=85)
        lm = await self.pg.evaluate(LUMA_JS, b64(b)); self.imgs.append(b64(b)); self.files.append(fn)
        star = '　★大面積全黑' if lm['black'] > 0.15 else ('　★大面積全白（過曝？看圖）' if lm['white'] > 0.15 else '')
        if glow:   # 看得到的發光像素（遮罩，會被前面的東西擋）：全白比例（>15%＝★白球）、紅色比例（紅燈籠應該是紅的）
            g = await self.pg.evaluate(GLOWMASK_JS, b64(b)); lm['glow'] = g
            if g and g['px'] and g['white'] > 0.15: star += '　★發光像素全白 %.0f%%（變成白球？）' % (g['white'] * 100)
            if g: R.note('[發光] %s 看得到的發光像素 %d 個（season_glow 網格 %d 個）：全白 %s、紅色 %s、平均亮度 %s' % (fn, g['px'], g['glowMeshes'], g['white'], g['red'], g['mean']))
        if star: self.stars.append(fn + star)
        R.note('[截圖] %s %s：鏡頭 eye %s → look %s（lens %s、vfov %s）；中央 60%% 亮度 %s、全黑 %.1f%%、全白 %.1f%%%s' % (fn, label, J([round(x, 2) for x in c['eye']]), J([round(x, 2) for x in c['look']]), c['lens'], c['vfov'], lm['mean'], lm['black'] * 100, lm['white'] * 100, star))
        return lm

    async def montage(self, fn, title, cols=4):
        if not self.imgs: return
        u = await self.pg.evaluate(MONT_JS, {'imgs': self.imgs, 'cols': cols, 'title': title})
        open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1])); R.note('[拼圖] %s（%d 張）%s' % (fn, len(self.imgs), ('；★ ' + '、'.join(self.stars)) if self.stars else ''))

    async def __aexit__(self, *a):
        await self.pg.evaluate(CAP_JS, None); await self.pg.evaluate(D.UNCAM); await self.pg.evaluate(D.HUD + '(true)')
        await self.pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")
        await self.pg.set_viewport_size({'width': 844, 'height': 390}); await self.pg.wait_for_timeout(900)


async def clip_report(pg, tag, dj):
    c = await pg.evaluate(CLIP_JS, {'doors': dj['doors']})
    hits = c['hits']; real = [h for h in hits if h['cat'] in ('招牌', '柱子', '機車', '其他')]
    R.note('%s 穿模（外框交集近似）：有布置的門 %d 扇、檢查了 %d 個網格；交集 %d 筆（招牌／柱子／機車／其他 %d 筆）' % (tag, c['doors'], c.get('meshesChecked', 0), len(hits), len(real)))
    for h in real[:40]: R.note('%s 　門 %s × %s「%s」（材質 %s）：%d 個頂點在布置外框裡、交集 %s m、體積 %s m³' % (tag, h['door'], h['cat'], h['mesh'], h['mat'], h['n'], J(h['dims']), h['vol']))
    wall = {}
    for h in hits:
        if h not in real: wall[h['mat'] or h['mesh']] = wall.get(h['mat'] or h['mesh'], 0) + 1
    if wall: R.note('%s 　（貼在門面上本來就會碰到的牆面、玻璃、門框：%s）' % (tag, J(wall)))
    open(os.path.join(OUT, 'season_clip_%s.json' % tag.strip('[]').replace(' ', '_')), 'w', encoding='utf-8').write(J(c))
    return c


async def part_shots(pg, cdp):
    for day in DATES:
        for zone in ZONES:
            S_ = STREETS.get(zone)
            if not S_: R.note('[SHOTS] 不認得 %s' % zone); continue
            for hi, h in enumerate(HOURS):
                hh = hh_of(h); tag = '[SHOTS %s %s %s]' % (ZN[zone], day, hh)
                px, pz = S_['walk'][2]; await at(pg, cdp, zone, day, h, px, pz, '（%s 拍季節布置）' % ZN[zone])
                w = await wait_season(pg); await pg.wait_for_timeout(2500)
                R.note('%s 等季節模型 %s 秒' % (tag, w))
                await season_report(pg, tag, day)
                dj = await pg.evaluate(DOORS_JS, zone)
                deco = [d for d in dj['doors'] if d['box']]
                R.note('%s doors.json %d 扇；有布置的 %d 扇：%s%s' % (tag, dj['n'], len(deco), J([[d['id'], d['kind'], d['meshes'], d['box']] for d in deco]), ('；離每扇門 1.5 m 以上、沒算進任何一扇的頂點 %s' % J(dj['orphan'])) if dj.get('orphan') else ''))
                if hi == 0 and deco: await clip_report(pg, tag, dj)
                async with Shooter(pg, '%s %s（%s）%s' % (ZN[zone], day, DAYNAME.get(day, ''), hh)) as sh:
                    for k, (lab, eye, look, lens) in enumerate(S_['pano']):
                        await sh.shot('season_%s_%s_%s_pano%d.jpg' % (zone, day, hh, k + 1), '全景 %s' % lab, eye, look, lens)
                    for d in deco:
                        b = d['box']; cx, cz = (b[0][0] + b[1][0]) / 2, (b[0][2] + b[1][2]) / 2; cy = (b[0][1] + b[1][1]) / 2; nx, nz = d['n']
                        span = max(b[1][0] - b[0][0], b[1][2] - b[0][2], b[1][1] - b[0][1]); dist = max(2.6, min(6.0, span * 1.3 + 1.2))
                        await sh.shot('season_%s_%s_%s_%s.jpg' % (zone, day, hh, d['id']), '門 %s（%s）布置近拍：%s' % (d['id'], d['kind'], '、'.join(d['meshes'])), (cx + nx * dist, 1.7, cz + nz * dist), (cx, cy, cz), 30, d['glow'] if h >= 18 else None)
                        if d['glow'] and h >= 18:
                            g = d['glow']; gx, gy, gz = (g[0][0] + g[1][0]) / 2, (g[0][1] + g[1][1]) / 2, (g[0][2] + g[1][2]) / 2
                            await sh.shot('season_%s_%s_%s_%s_glow.jpg' % (zone, day, hh, d['id']), '門 %s 晚上發光那一叢（season_glow）再近一張：看有沒有變成白球' % d['id'], (gx + nx * 2.4, 1.6, gz + nz * 2.4), (gx, gy, gz), 30, d['glow'])   # 站在騎樓裡抬頭看（1.8 m、高 2.4 m 的機位會卡進雨遮）
                    await sh.montage('season_%s_%s_%s_all.jpg' % (zone, day, hh), '%s %s（%s）%s（%s）：全景三張、每扇有布置的門近拍' % (ZN[zone], day, DAYNAME.get(day, ''), hh, SHA))


async def part_edge(pg, cdp):
    ev = os.environ.get('EDGE_DATES')
    edges = [('自訂', '自訂', d, None) for d in ev.split(',') if d] if ev else (await pg.evaluate(EDGES_JS, ZONES))
    if not edges: edges = EDGE_FALLBACK; R.note('[EDGE] 這一版沒有日期表（舊版）：照新版 b394363fe 的邊界日拍（舊版應該全部沒有）')
    else: edges = [tuple(e) for e in edges]
    R.note('[EDGE] 邊界日：%s' % J(edges))
    if EV('EDGE_LIST_ONLY', '') == '1': R.note('[EDGE] EDGE_LIST_ONLY=1：只列邊界日，不讀檔、不拍'); return
    for code, lab, day, want in edges:
        for zone in ZONES:
            S_ = STREETS.get(zone)
            if not S_: continue
            tag = '[EDGE %s %s %s %s]' % (code, lab, day, ZN[zone])
            px, pz = S_['walk'][2]; await at(pg, cdp, zone, day, 14.0, px, pz, '（%s %s）' % (code, lab))
            await wait_season(pg); await pg.wait_for_timeout(1500)
            q = await season_report(pg, tag, day)
            if want is not None and q['sd3']:
                R.check('%s %s 那一組%s' % (tag, code, '看得到' if want else '看不到'), (code in q['visibleOn']) == want, J(q['visibleOn']))
            async with Shooter(pg, '%s %s %s %s' % (ZN[zone], code, lab, day)) as sh:
                lab_, eye, look, lens = S_['pano'][1]
                await sh.shot('season_edge_%s_%s_%s.jpg' % (zone, code, day), '全景 %s（%s %s）' % (lab_, code, lab), eye, look, lens)


async def part_walk(pg, cdp):
    for day in FUNC_DATES:
        for zone in ZONES:
            S_ = STREETS.get(zone)
            if not S_: continue
            tag = '[WALK %s %s]' % (ZN[zone], day); pts = S_['walk']
            await at(pg, cdp, zone, day, 14.0, pts[0][0], pts[0][1], '（沿街走的起點）'); await wait_season(pg); await F.ready(pg, cdp, 20)
            fb0 = (await pg.evaluate(ME))['fb']; bad = []
            for (tx, tz) in pts[1:]:
                sp = await pg.evaluate(SNAPFREE, [tx, tz, 3.0])
                if not sp: R.note('%s (%.1f,%.1f) 3 m 內沒有站得住的地方，跳過' % (tag, tx, tz)); continue
                if sp[2] > 0: R.note('%s 目標 (%.1f,%.1f) 站不住，改最近站得住的 (%.2f,%.2f)（挪 %.2f m）' % (tag, tx, tz, sp[0], sp[1], sp[2]))
                r = await F.joy_to(pg, cdp, '%s → (%.1f,%.1f)' % (tag, sp[0], sp[1]), sp[0], sp[1], near=0.8, max_s=90)
                R.note('%s 搖桿到 (%.1f,%.1f)：%s、%s 秒、推 %d 次、跳 %s%s' % (tag, sp[0], sp[1], r['ok'], r['t'], r['pushes'], J(r['jumps']), ('；' + r['why']) if r.get('why') else ''))
                if not r['ok'] or r['jumps']: bad.append([sp[0], sp[1], r.get('why'), r['jumps']])
            me = await pg.evaluate(ME)
            R.check('%s 搖桿沿街走完，每一段都走到、沒有跳' % tag, not bad, J(bad))
            R.check('%s walkFallbacks 0' % tag, me['fb'] - fb0 == 0, J(me))


async def enter(pg, cdp, tag, d):
    """和 F.enter_door 一樣（搖桿走到門、按鈕是它才按、等換區域），差在：按了 20 秒沒換區域，記下畫面上的提示，等 3 秒再按一次（玩家也會再按）；第二次才進去會寫在判定裡"""
    r = await F.joy_to(pg, cdp, tag, d['x'], d['z'], near=min(0.9, d['r'] * 0.5), lv=d['lv'], max_s=120)
    s = await F.wait_btn(pg, d['label'], 5)
    if not R.check('%s 搖桿走到「%s」，按鈕是它（%s 秒、沒有跳）' % (tag, d['label'], r['t']), s['interact'].startswith(d['label']) and not r['jumps'], J({'end': [s['x'], s['z']], 'btn': s['interact'], 'jumps': r['jumps'], 'why': r.get('why')})): return None
    k = 0
    for k in (1, 2):
        await L.tap(pg, cdp, '#interact'); s = await D.wait_zone(pg, cdp, d['to'], max_s=20 if k == 1 else 40)
        if s['zone'] == d['to']: break
        t = await pg.evaluate("(()=>{ const e=document.getElementById('toast'); return e?(e.textContent||'').trim():''; })()")
        R.note('%s 第 %d 次按「%s」沒有換區域：提示「%s」、按鈕「%s」、%s' % (tag, k, d['label'], t, s['interact'], J({q: s[q] for q in ('zone', 'x', 'z', 'busy', 'dlg')})))
        await pg.wait_for_timeout(3000)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp); s = await D.st(pg)
    ok = s['zone'] == d['to']
    R.check('%s 按「%s」到了 %s、站得住%s' % (tag, d['label'], d['to'], '（第 2 次按才進去）' if ok and k == 2 else ''), ok and s['stand'] and k == 1, J(s))
    return s if ok else None


async def part_doors(pg, cdp):
    mx = int(EV('DOORS_MAX', '99'))
    for day in FUNC_DATES:
        for zone in ZONES:
            S_ = STREETS.get(zone)
            if not S_: continue
            tagz = '[DOORS %s %s]' % (ZN[zone], day); px, pz = S_['walk'][2]
            await at(pg, cdp, zone, day, 14.0, px, pz, '（店門進出：先列店門）'); await wait_season(pg); await F.ready(pg, cdp, 20)
            fbs = 0; me = await pg.evaluate(ME)
            doors = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden&&i.exit&&/^進/.test(i.label||'')).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1,lv:i.lv|0,label:i.label,to:i.exit.to})))()")
            R.note('%s 「進…」的店門 %d 間：%s' % (tagz, len(doors), J(doors)))
            for i, d in enumerate(doors[:mx]):
                tag = '%s #%d %s' % (tagz, i + 1, d['label'])
                op = await pg.evaluate("(to=>{ let ws; try{ ws=(typeof PLACES!=='undefined'&&PLACES.windowsOf)?PLACES.windowsOf(to,GAME.G.day):undefined; }catch(e){ ws='err'; } const hol=(typeof CALENDAR!=='undefined'&&CALENDAR.holiday)?CALENDAR.holiday(GAME.G.day):null; return {ws:ws===undefined?'沒有營業時間表':ws, hol:hol||null, open:ws===undefined||(Array.isArray(ws)&&ws.some(w=>w[0]<=14.2&&w[1]>14.6))}; })", d['to'])
                if not op['open']:
                    R.note('%s 那一天 14:00 這間不開（PLACES.windowsOf %s、假日 %s）——跳過，不是布置造成' % (tag, J(op['ws']), J(op['hol']))); continue
                ax = S_['axisZ']; sx_, sz_ = d['x'], (ax if abs(d['z'] - ax) <= 8 else d['z'] + math.copysign(5.0, ax - d['z']))   # 店門往街上那一側 5 m 左右（街的中線 z）
                sp = await pg.evaluate(SNAPFREE, [sx_, sz_, 3.0]) or [sx_, sz_, 0]
                # 每一間從那一間門前的街上開始（不然雲端低幀率要走 60 m 以上）；之後全程搖桿
                await at(pg, cdp, zone, day, 14.0, sp[0], sp[1], '（店門「%s」前面的街上）' % d['label']); await wait_season(pg); await F.ready(pg, cdp, 20)
                fb0 = (await pg.evaluate(ME))['fb']
                s = await enter(pg, cdp, tag, d)
                if not s:
                    t = await pg.evaluate("(()=>{ const e=document.getElementById('toast'); return e?(e.textContent||'').trim():''; })()")
                    R.note('%s 沒進去：畫面上的提示「%s」；營業時間 %s' % (tag, t, J(op['ws'])))
                if s:
                    await pg.wait_for_timeout(1200)
                    ex = await pg.evaluate("(z=>{ const i=(GAME.E.interactables||[]).find(q=>!q.hidden&&q.exit&&q.exit.to===z); return i?{x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1,lv:i.lv|0,label:i.label,to:i.exit.to}:null; })", zone)
                    if R.check('%s 店裡有出口回%s' % (tag, ZN[zone]), bool(ex), ''):
                        s2 = await enter(pg, cdp, tag + ' 出店', ex)
                        if s2:
                            mv = await D.pushable(pg, cdp); R.check('%s 出店站在 %s、推得動（%.2f m）' % (tag, J([s2['x'], s2['z']]), mv), mv >= 0.3 and s2['stand'], J(s2))   # 讀檔會把 walkFallbacks 歸零：每一間各自算
                me = await pg.evaluate(ME); fbs += me['fb'] - fb0
            R.check('%s walkFallbacks 0（每一間累計）' % tagz, fbs == 0, J(me))


async def part_nav(pg, cdp):
    for zone in ZONES:
        S_ = STREETS.get(zone)
        if not S_: continue
        px, pz = S_['walk'][2]
        await at(pg, cdp, zone, NORMAL, 14.0, px, pz, '（平常日：導航格基準）'); await wait_season(pg)
        b = await pg.evaluate(NAVSCAN_JS, {'zone': zone, 'base': True})
        R.note('[NAV %s %s] 基準：%s' % (ZN[zone], NORMAL, J(b)))
        for day in FUNC_DATES:
            await at(pg, cdp, zone, day, 14.0, px, pz, '（布置那一天）'); await wait_season(pg); await pg.wait_for_timeout(1500)
            r = await pg.evaluate(NAVSCAN_JS, {'zone': zone, 'base': False})
            d = (r or {}).get('diff') or {}
            R.note('[NAV %s %s] canStand 站得住 %s／%s 格；和平常日比：少了 %s 格、多了 %s 格；少的 %s；多的 %s' % (ZN[zone], day, r and r['stand'], r and r['total'], d.get('lost'), d.get('gained'), J(d.get('lostPts')), J(d.get('gainedPts'))))
            R.check('[NAV %s %s] 導航格和平常日一樣（布置不擋路）' % (ZN[zone], day), bool(r and r['sameSize'] and d.get('lost') == 0 and d.get('gained') == 0), J({k: d.get(k) for k in ('lost', 'gained')}))


async def part_fps(pg, cdp):
    q = EV('Q', 'medium'); secs = int(EV('FPSS', '8'))
    await pg.evaluate("(q=>{ const s=document.getElementById('setQuality'); if(s){ s.value=q; s.dispatchEvent(new Event('change')); } })", q)
    dates = [d for d in EV('FPS_DATES', ','.join([NORMAL] + FUNC_DATES)).split(',') if d]
    for zone in ZONES:
        S_ = STREETS.get(zone)
        if not S_: continue
        for day in dates:
            for h in [float(x) for x in EV('FPS_HOURS', '20').split(',')]:
                for k in (1, 3):
                    x, z = S_['walk'][k]; await at(pg, cdp, zone, day, h, x, z, '（FPS 第 %d 點）' % k); await wait_season(pg); await pg.wait_for_timeout(3000)
                    me = await pg.evaluate(ME); r = await pg.evaluate(FPS_JS, secs * 1000); vis = (await pg.evaluate(SEASON_LIST))['visibleOn']
                    R.note('[FPS %s %s %s 點%d] 畫質 %s、站 %s %d 秒：%s fps、draw call %s、三角形 %s；看得到的季節組 %s（PC GPU，不是 iPhone；舊版同位置對照）' % (ZN[zone], day, hh_of(h), k, q, J([me['x'], me['z']]), secs, r['fps'], r['calls'], r['tris'], J(vis)))


async def main():
    print('CC SEASON：受測 %s；PARTS %s；ZONES %s；DATES %s；HOURS %s；FUNC_DATES %s；Playwright ≠ iPhone' % (SHA, ','.join(PARTS), ','.join(ZONES), ','.join(DATES), HOURS, ','.join(FUNC_DATES)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for part, fn in (('SHOTS', part_shots), ('EDGE', part_edge), ('WALK', part_walk), ('DOORS', part_doors), ('NAV', part_nav), ('FPS', part_fps)):
            if part not in PARTS: continue
            t0 = time.time()
            try: await fn(pg, cdp)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
            R.note('[%s] 用了 %.0f 秒' % (part, time.time() - t0))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
