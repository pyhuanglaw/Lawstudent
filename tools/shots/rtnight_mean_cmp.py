"""光照貼圖的平均亮度比（rtNight，晚上沒烘焙的小東西跟著暗多少）：舊算法（GPU 畫布 drawImage→getImageData）和新算法（createImageBitmap 縮圖→CPU 畫布）比對（PERF-ZONE-ENTER-1018；LAWWW2-B 2026-10-30）。
用法：python3 tools/shots/rtnight_mean_cmp.py <測試樹根目錄> <同一個 server 的任一網址>"""
import asyncio, json, sys, glob, os
from playwright.async_api import async_playwright
ROOT, URL = sys.argv[1], sys.argv[2]
days = sorted(glob.glob(os.path.join(ROOT, 'assets/models/env/**/*_lm_day.webp'), recursive=True))
pairs = [(os.path.relpath(d, ROOT), os.path.relpath(d, ROOT).replace('_lm_day.webp', '_lm_night.webp')) for d in days]
pairs = [p for p in pairs if os.path.exists(os.path.join(ROOT, p[1]))]
JS = """async (pairs)=>{
 const load=u=>new Promise((r,j)=>{ const im=new Image(); im.onload=()=>r(im); im.onerror=j; im.src=u; });
 const mean=(src,soft)=>{ const c=document.createElement('canvas'); c.width=c.height=32; const x=c.getContext('2d',soft?{willReadFrequently:true}:undefined); x.drawImage(src,0,0,32,32); const d=x.getImageData(0,0,32,32).data; let s=0,n=0;
   for(let i=0;i<d.length;i+=4){ const v=Math.max(d[i],d[i+1],d[i+2])/255; if(v<0.01) continue; s+=v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4); n++; } return n?s/n:0; };
 const k=(md,mn)=>md>0&&mn>0?Math.min(1,Math.max(0.3,mn/md*1.2/0.95)):0.55;
 const out=[]; for(const [a,b] of pairs){ const A=await load(a), B=await load(b);
   const oldK=k(mean(A,false),mean(B,false));
   const bm=async im=>{ const bb=await createImageBitmap(im,{resizeWidth:32,resizeHeight:32,resizeQuality:'medium'}); const v=mean(bb,true); bb.close(); return v; };
   const newK=k(await bm(A),await bm(B)); out.push([a.split('/').pop().replace('_lm_day.webp',''),+oldK.toFixed(4),+newK.toFixed(4)]); }
 return out; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(); await pg.goto(URL)
        r = await pg.evaluate(JS, pairs)
        for row in r: print('%-24s 舊 %.4f  新 %.4f  差 %+.4f' % (row[0], row[1], row[2], row[2]-row[1]))
        await b.close()
asyncio.run(main())
