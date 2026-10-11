"""套件建築的三角形（顏色那一輪、會投影的）：傅鐘 CK.bell()、行政大樓、文學院、校史館 CK.hall(...)、洞洞館 CK.pavilion、社科院 CK.modern（和正式模型比，VISUAL_REVIEW 第 9、10、11、13 節）。用法：python3 tools/blender/env_second/shots/kit_tris.py URL"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
from playwright.async_api import async_playwright
import playlib as PL
JS = """(()=>{ const cnt=g=>{ let tot=0, cast=0, n=0; g.traverse(o=>{ if(!o.isMesh&&!o.isSprite) return; n++; if(o.isSprite){ tot+=2; return; } const ge=o.geometry; const t=(ge.index?ge.index.count:ge.attributes.position.count)/3; tot+=t; if(o.castShadow) cast+=t; }); return {objects:n, tris:tot, castTris:cast}; };
  const bell=CK.bell(); const admin=CK.hall({w:46,d:16,floors:3,gfh:4.2,fh:3.4,wall:'#cdb48e',trim:'#e8e0cf',roof:'#4a3a33',roofH:4.2,arcade:true,porch:{bays:3,depth:3.0,pediment:false},sign:'行政大樓'});
  const arts=CK.hall({w:40,d:18,floors:2,gfh:4.8,fh:4.4,wall:'#9b5a42',trim:'#d8cfbd',roof:'#43342e',roofH:4.8,arcade:true,porch:{bays:3,depth:3.0,pediment:true,pedH:1.8},sign:'文學院'});
  const hist=CK.hall({w:24,d:16,floors:2,gfh:5.0,fh:4.6,wall:'#a25d43',trim:'#d8cfbd',roof:'#43342e',roofH:4.4,arcade:true,porch:{bays:3,depth:2.6,pediment:true,pedH:1.6},sign:'校史館'});
  const pavilion=CK.pavilion({w:22,d:14,gfh:4.0,h:9,sign:'農業陳列館'}); const soc=CK.modern({w:56,d:22,floors:4,gfh:4.4,fh:3.85,sign:'社會科學院'});
  return {bell:cnt(bell), admin:cnt(admin), arts:cnt(arts), hist:cnt(hist), pavilion:cnt(pavilion), soc:cnt(soc)}; })()"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await pg.goto(sys.argv[1]); await PL.wait_loaded(pg)
        print(json.dumps(await pg.evaluate(JS), ensure_ascii=False)); await b.close()
asyncio.run(main())
