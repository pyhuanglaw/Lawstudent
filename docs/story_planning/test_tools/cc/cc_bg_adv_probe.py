"""CC-C（帳號 C）11-04：2D 背景在遊戲裡的畫面（BB-C 13:54 美術截圖 A；D120 BB 判；**Windows＋GPU（Playwright 有視窗）≠ iPhone**）。
  【捷徑】用 ADV 直接顯示那張背景（ADV.begin({background:{image}})），不是照劇情走到那一幕；站人物（ADV.show）、開對話框（GAME.say 一句 CC 的測試台詞），
  每張拍直向 390×844、橫向 844×390；另外附原圖縮小版（寬 640，JPEG）。
  背景：ART-BG16 ntu_linze、ART-BG17 ntu_avenue（ev_kexin_visits_ntu）、ART-BG08 car（ev_kexin_trip_spring_y1）、ART-GYM-BG1 ntu_gym_ceremony（8/31 開學典禮）、
        ART-10 nccu_dorm、nccu_dorm_day；ART-14 約會底圖 d01～d32（assets/bg/d*_base_*.webp，34 張）。
  人物：這幾個事件劇情裡只有可昕一個人出場（祐廷沒有立繪）——每張拍兩個版本：「劇情」＝照劇情只站可昕（約會底圖站以安）；「兩人」＝另一側再站一位（看人物會不會擋住重點）。
  ART-14 另外拼直向、橫向兩張總覽（只拼「劇情」版）。
  要看的（BB 判）：人物有沒有擋住重點、直向裁切後主體還在不在、對話框底下有沒有字被蓋、有沒有看得清楚的真實校名／店名／商標（D77、D115）、有沒有深色木地板（D112）。
用法：LW_TESTS=<wt>/tests [BGS=ntu_linze,...|all] [DATES=1] python3 cc_bg_adv_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []
MAIN = [('ntu_linze', 'kexin', 'heroine_01', 'ART-BG16'), ('ntu_avenue', 'kexin', 'heroine_01', 'ART-BG17'), ('car', 'kexin', None, 'ART-BG08'),
        ('ntu_gym_ceremony', 'heroine_01', 'kai', 'ART-GYM-BG1'), ('nccu_dorm', 'kexin', 'heroine_01', 'ART-10'), ('nccu_dorm_day', 'kexin', 'heroine_01', 'ART-10')]
SEL = [b.strip() for b in (os.environ.get('BGS') or 'all').split(',') if b.strip()]
DATES = os.environ.get('DATES', '1') == '1'
VP = {'portrait': (390, 844), 'landscape': (844, 390)}
LINE = '（CC 測試台詞：看對話框底下有沒有字被蓋住。這一行故意寫長一點，兩行以上才看得出來。）'


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


BGURL_JS = r"""(k=>{ const B=(typeof OUTINGS!=='undefined'&&OUTINGS.BG)||(typeof OUT!=='undefined'&&OUT.BG)||null; const b=B&&B[k]; return b&&b.image?b.image:('assets/bg/'+k+'.webp'); })"""
SHOW_JS = r"""(async([img,a,b])=>{ if(ADV.active) ADV.end(); ADV.begin({background:{image:img}}); await new Promise(r=>setTimeout(r,300));
  if(a) ADV.show('right',a,'neutral'); if(b) ADV.show('left',b,'neutral');
  const t0=performance.now(); for(;;){ const el=document.querySelector('#adv .bg, .adv-bg')||ADV.bg; const ok=el&&getComputedStyle(el).backgroundImage!=='none'; if(ok||performance.now()-t0>8000) break; await new Promise(r=>setTimeout(r,200)); }
  return {active:ADV.active, mode:typeof ADV.bgMode==='object'?'image':ADV.bgMode, cls:ADV.root&&ADV.root.className}; })"""
SAY_JS = "(t=>{ void GAME.say('杜可昕', t); return true; })"
CLOSE_JS = r"""(async()=>{ for(let i=0;i<6;i++){ const d=document.getElementById('dlg'); if(!d||d.classList.contains('hide')) break; d.click(); await new Promise(r=>setTimeout(r,250)); } if(ADV.active) ADV.end(); return true; })()"""
THUMB_JS = r"""(async(img)=>{ const r=await fetch(img); if(!r.ok) return null; const bm=await createImageBitmap(await r.blob()); const w=640, h=Math.round(bm.height*w/bm.width); const c=new OffscreenCanvas(w,h); c.getContext('2d').drawImage(bm,0,0,w,h);
  const b=await c.convertToBlob({type:'image/jpeg',quality:0.85}); const u=new Uint8Array(await b.arrayBuffer()); let s=''; for(let i=0;i<u.length;i+=32768) s+=String.fromCharCode.apply(null,u.subarray(i,i+32768)); return [btoa(s), bm.width, bm.height]; })"""
MONTAGE_JS = r"""(async([imgs,labels,tw,th,cols])=>{ const rows=Math.ceil(imgs.length/cols); const c=new OffscreenCanvas(cols*tw, rows*(th+22)), x=c.getContext('2d'); x.fillStyle='#202124'; x.fillRect(0,0,c.width,c.height); x.fillStyle='#fff'; x.font='14px sans-serif';
  for(let i=0;i<imgs.length;i++){ const cx=(i%cols)*tw, cy=Math.floor(i/cols)*(th+22); x.fillText(labels[i],cx+4,cy+16); if(!imgs[i]) continue; const bm=await createImageBitmap(await (await fetch('data:image/jpeg;base64,'+imgs[i])).blob()); x.drawImage(bm,cx,cy+22,tw,th); }
  const b=await c.convertToBlob({type:'image/jpeg',quality:0.85}); const u=new Uint8Array(await b.arrayBuffer()); let s=''; for(let i=0;i<u.length;i+=32768) s+=String.fromCharCode.apply(null,u.subarray(i,i+32768)); return btoa(s); })"""


# BB-C 17:07：橫向上下的黑邊是 GM.letterbox 的 #letterT／#letterB（8%、純黑）。每張截圖當下記黑邊的實際高度（computed，含 0.6 秒的轉場）和 D.busyDepth，
#   分得出是捷徑（GAME.say）剛好碰到，還是那一幕本來就會有黑邊
LETTER_JS = """(()=>{ const q=id=>document.getElementById(id), cs=e=>e?getComputedStyle(e):null, b=q('letterB'), t=q('letterT'), D=GAME.D||{};
  return {bH:b?+parseFloat(cs(b).height).toFixed(1):null, bStyle:b?b.style.height:null, tH:t?+parseFloat(cs(t).height).toFixed(1):null, busyDepth:D.busyDepth|0, active:!!D.active, vh:innerHeight}; })()"""


async def shoot(pg, key, img, a, b, tag, keep=None):
    out = {}
    for ori, (w, h) in VP.items():
        await pg.set_viewport_size({'width': w, 'height': h}); await pg.wait_for_timeout(700)
        st = await pg.evaluate(SHOW_JS + '(%s)' % J([img, a, b]))
        await pg.evaluate(SAY_JS + '(%s)' % J(LINE)); await pg.wait_for_timeout(500)
        for _ in range(30):   # CC-C 16:1x：台詞是一個字一個字打出來的，打完才拍（不然看不出對話框底下有沒有字被蓋住）
            n = await pg.evaluate("(()=>((document.getElementById('dlgText')||{}).textContent||'').length)()")
            if n >= len(LINE) - 1: break
            await pg.wait_for_timeout(200)
        await pg.wait_for_timeout(300)
        lb = await pg.evaluate(LETTER_JS)
        fn = os.path.join(OUT, 'bg_%s_%s_%s.jpg' % (key, tag, ori))
        png = await pg.screenshot(path=fn, type='jpeg', quality=85)
        if keep is not None and ori in keep: keep[ori].append(base64.b64encode(png).decode())
        st = dict(st or {}, letter=lb)
        print('  [%s %s %s] #letterB %s px（style %s）、#letterT %s px、D.busyDepth %s、D.active %s' % (key, tag, ori, lb['bH'], lb['bStyle'], lb['tH'], lb['busyDepth'], lb['active']), flush=True)
        out[ori] = st
        await pg.evaluate(CLOSE_JS); await pg.wait_for_timeout(300)
    return out


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC 2D 背景在遊戲裡（ADV 直接顯示＝[捷徑]）；SHA=%s；Windows＋GPU ≠ iPhone' % os.environ.get('SHA', '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        print('  [前置／捷徑] 讀檔到宿舍（條件事件關閉），之後每張都用 ADV.begin 直接顯示背景', flush=True)
        await L.load_state(pg, {'zone': 'dorm', 'hour': 14.0, 'weather': 'clear', 'pos': {'x': 0, 'z': 0, 'yaw': 0, 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
        items = [m for m in MAIN if 'all' in SEL or m[0] in SEL]
        if DATES:
            dl = await pg.evaluate("(async()=>{ const out=[]; for(let i=1;i<=32;i++){ const n=String(i).padStart(2,'0'); for(const s of ['','a','b']) for(const t of ['afternoon','overcast','rain','night','dusk','day','morning','sunset','golden']){ const u='assets/bg/d'+n+s+'_base_'+t+'.webp'; try{ const r=await fetch(u,{method:'HEAD'}); if(r.ok) out.push(u); }catch(e){} } } return out; })()")
            print('  約會底圖：%d 張' % len(dl), flush=True)
            items += [(os.path.basename(u)[:-5], 'heroine_01', 'heroine_02', 'ART-14') for u in dl]
        mont = {'portrait': [], 'landscape': []}; labels = []
        for key, a, b2, task in items:
            img = await pg.evaluate(BGURL_JS + '(%s)' % J(key)) if not key.startswith('d') or '_base_' not in key else 'assets/bg/%s.webp' % key
            th = await pg.evaluate(THUMB_JS + '(%s)' % J(img))
            if not check('[%s] %s 背景圖讀得到（%s）' % (task, key, img), bool(th), ''): continue
            with open(os.path.join(OUT, 'bg_%s_orig_640.jpg' % key), 'wb') as fh: fh.write(base64.b64decode(th[0]))
            r1 = await shoot(pg, key, img, a, None, 'story', keep=mont if task == 'ART-14' else None)
            if b2: await shoot(pg, key, img, a, b2, 'two')
            if task == 'ART-14': labels.append(key)
            print('  [%s] %s：原圖 %d×%d；直向 %s、橫向 %s' % (task, key, th[1], th[2], J(r1['portrait']), J(r1['landscape'])), flush=True)
        for ori, (w, h) in VP.items():
            if not mont[ori]: continue
            tw, th2 = (130, 282) if ori == 'portrait' else (281, 130)
            b64 = await pg.evaluate(MONTAGE_JS + '(%s)' % J([mont[ori], labels, tw, th2, 9 if ori == 'portrait' else 4]))
            with open(os.path.join(OUT, 'ART14_overview_%s.jpg' % ori), 'wb') as fh: fh.write(base64.b64decode(b64))
            print('  ART-14 總覽 ART14_overview_%s.jpg（%d 張）' % (ori, len(mont[ori])), flush=True)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
