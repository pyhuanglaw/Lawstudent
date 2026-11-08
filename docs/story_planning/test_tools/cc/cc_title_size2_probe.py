"""CC-B（帳號 B）11-09：TITLE-SIZE2（BB-B 18:29；LAWWW-B 817293734 矮螢幕標題版）。判定＝BB。
Playwright 內建裝置（不自己設 dpr）iPhone SE／14／14 Pro Max：
  A 橫向、沒有存檔（新 context）；B 橫向、有自動存檔（【前置】先把一份存檔放進 localStorage fatiao3d_auto 再開，「繼續」出現）；C 直向（沒有存檔）。
每張：不捲動截圖；記每個按鈕（文字、rect、高度 ≥44、是否在畫面內、文字有沒有被切掉 scrollWidth>clientWidth／幾行）、
聲明那段（建議橫向遊玩…虛構。）是否整段在畫面內、版本字樣的 rect／是否在畫面內／有沒有蓋到按鈕或聲明。
用法：SAVE_JSON=<存檔.json> python cc_title_size2_probe.py <url> <out>"""
import os, sys, json, asyncio
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
DEVS = ['iPhone SE', 'iPhone 14', 'iPhone 14 Pro Max']
SAVE = os.environ.get('SAVE_JSON')
JS = r"""(()=>{ const t=document.getElementById('titleScreen'); const vw=innerWidth, vh=innerHeight;
  const inV=r=>r.top>=-0.5&&r.bottom<=vh+0.5&&r.left>=-0.5&&r.right<=vw+0.5; const R=r=>[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)];
  const vis=e=>{ const s=getComputedStyle(e); return s.display!=='none'&&s.visibility!=='hidden'&&e.offsetParent!==null&&e.getBoundingClientRect().height>0; };
  const btns=[...t.querySelectorAll('button')].filter(vis).map(b=>{ const r=b.getBoundingClientRect(); const lh=parseFloat(getComputedStyle(b).lineHeight)||parseFloat(getComputedStyle(b).fontSize)*1.3;
    const kids=[...b.querySelectorAll('*')].concat([b]); const clip=kids.some(k=>k.scrollWidth>k.clientWidth+1||k.scrollHeight>k.clientHeight+1);
    const lines=[...b.childNodes].length; return {text:b.innerText.replace(/\n/g,' / ').trim(), rect:R(r), h:Math.round(r.height), inView:inV(r), clip, rawLines:b.innerText.split('\n').length}; });
  const leaf=re=>[...t.querySelectorAll('*')].filter(e=>e.children.length===0&&re.test(e.textContent||'')&&vis(e));
  const disc=leaf(/建議橫向遊玩|所有人物與故事皆為虛構/).map(e=>{ const r=e.getBoundingClientRect(); return {text:e.textContent.trim(), rect:R(r), inView:inV(r)}; });
  const vEl=leaf(/版本/).pop(); let ver=null;
  if(vEl){ const r=vEl.getBoundingClientRect(); const ov=b=>!(r.right<=b.left||r.left>=b.right||r.bottom<=b.top||r.top>=b.bottom);
    const hitB=[...t.querySelectorAll('button')].filter(vis).filter(b=>ov(b.getBoundingClientRect())).map(b=>b.innerText.split('\n')[0]);
    const hitD=leaf(/建議橫向遊玩|所有人物與故事皆為虛構/).filter(e=>ov(e.getBoundingClientRect())).map(e=>e.textContent.trim().slice(0,12));
    ver={text:vEl.textContent.trim(), rect:R(r), inView:inV(r), pos:getComputedStyle(vEl).position, overlapsButtons:hitB, overlapsDisclaimer:hitD}; }
  const rn=document.querySelector('#resumeNote,.resumeNote'); 
  return {vw, vh, dpr:devicePixelRatio, buttons:btns, disclaimer:disc, version:ver, resumeNote:rn&&vis(rn)?{text:rn.innerText.trim().slice(0,60), rect:R(rn.getBoundingClientRect()), inView:inV(rn.getBoundingClientRect())}:null, scrollY}; })()"""
async def shoot(b, p, d, orient, with_save, res):
    dev = dict(p.devices[d if orient == 'portrait' else d + ' landscape'])
    ctx = await b.new_context(**dev)
    if with_save and SAVE:
        sv = open(SAVE, encoding='utf-8').read()
        await ctx.add_init_script("try{ if(!localStorage.getItem('fatiao3d_auto')) localStorage.setItem('fatiao3d_auto', %s); }catch(e){}" % json.dumps(sv))
    pg = await ctx.new_page(); await pg.goto(URL)
    for _ in range(90):
        if await pg.evaluate("(()=>{ const t=document.getElementById('titleScreen'); return !!t&&!t.classList.contains('hide')&&getComputedStyle(t).display!=='none'; })()"): break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(2500)
    r = await pg.evaluate(JS); r.update({'device': d, 'orient': orient, 'save': bool(with_save)})
    f = os.path.join(OUT, 'title2_%s_%s%s.png' % (d.replace(' ', ''), orient, '_save' if with_save else '')); await pg.screenshot(path=f); r['shot'] = os.path.basename(f)
    print('TITLE2 %s' % json.dumps(r, ensure_ascii=False), flush=True); res.append(r); await ctx.close()
async def main():
    res = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        for d in DEVS:
            await shoot(b, p, d, 'landscape', False, res)
            await shoot(b, p, d, 'landscape', True, res)
            await shoot(b, p, d, 'portrait', False, res)
            await shoot(b, p, d, 'portrait', True, res)
        await b.close()
    json.dump(res, open(os.path.join(OUT, 'title_size2.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS', flush=True)
asyncio.run(main())
