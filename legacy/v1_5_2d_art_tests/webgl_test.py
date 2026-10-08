import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        for args in ([], ['--use-gl=angle','--use-angle=swiftshader'], ['--use-gl=swiftshader'], ['--enable-unsafe-swiftshader']):
            try:
                b=await p.chromium.launch(args=args)
                pg=await b.new_page(viewport={'width':400,'height':300})
                await pg.set_content("<canvas id=c width=200 height=150></canvas><script>const gl=document.getElementById('c').getContext('webgl');window.r=gl?gl.getParameter(gl.RENDERER):'none';</script>")
                r=await pg.evaluate("window.r")
                print(args, '->', r)
                await b.close()
            except Exception as e:
                print(args,'ERR',str(e)[:200])
asyncio.run(main())
