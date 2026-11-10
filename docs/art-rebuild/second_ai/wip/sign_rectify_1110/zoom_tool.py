import sys
from PIL import Image, ImageDraw, ImageFont
# zoom.py <圖> <x0> <y0> <x1> <y1> <輸出> ：放大那一塊、畫每 50 px 的格線和座標
f,x0,y0,x1,y1,out=sys.argv[1],*map(int,sys.argv[2:6]),sys.argv[6]
im=Image.open(f).convert('RGB'); x0=max(0,x0); y0=max(0,y0); x1=min(im.width,x1); y1=min(im.height,y1)
c=im.crop((x0,y0,x1,y1)); k=min(3.0,1500/c.width); c=c.resize((int(c.width*k),int(c.height*k)),Image.LANCZOS); d=ImageDraw.Draw(c); F=ImageFont.load_default()
for x in range((x0//50+1)*50,x1,50): X=(x-x0)*k; d.line([(X,0),(X,c.height)],fill=(255,255,0) if x%100==0 else (120,120,0),width=1); d.text((X+2,2),str(x),fill=(255,255,0),font=F)
for y in range((y0//50+1)*50,y1,50): Y=(y-y0)*k; d.line([(0,Y),(c.width,Y)],fill=(0,255,255) if y%100==0 else (0,120,120),width=1); d.text((2,Y+2),str(y),fill=(0,255,255),font=F)
c.save(out,quality=88); print(im.size,c.size)
