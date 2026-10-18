"""單張灰底立繪去背、縮放到和既有表情同一個外框（可昕 teasing，BB-C 61a1db97，2026-10-18 LAWWW-C）。
只用 numpy＋PIL（沙盒沒有 scipy、rembg）：邊框取底色 → 從邊框 flood fill 出背景 → 開運算去碎點 → 邊緣 2 px 用和底色的距離當 alpha、去掉底色 → 腳下地面陰影（底部 3%、比底色暗、沒彩度）去掉 →
依參考圖（同一套衣服的 smile.webp）的外框高度縮放、頭頂和中心對齊。
用法：python3 tools/portraits/matte_gray.py <來源.png> <輸出.webp> <參考.webp> [--noscale]（--noscale：來源已經對齊成參考圖的大小，只去背、不縮放）"""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
src, out, ref = sys.argv[1], sys.argv[2], sys.argv[3]
im=Image.open(src).convert('RGB'); a=np.array(im).astype(np.float32); H,W,_=a.shape
border=np.concatenate([a[:6].reshape(-1,3),a[-6:].reshape(-1,3),a[:,:6].reshape(-1,3),a[:,-6:].reshape(-1,3)])
bg=np.median(border,axis=0); print('bg',bg)
diff=np.abs(a-bg).max(axis=2)
# flood fill on a "near background" binary image from border seeds
near=Image.fromarray(((diff<=14)*255).astype(np.uint8))
mark=near.copy()
for x in range(0,W,7):
    for y in (0,H-1):
        if mark.getpixel((x,y))==255: ImageDraw.floodfill(mark,(x,y),128)
for y in range(0,H,7):
    for x in (0,W-1):
        if mark.getpixel((x,y))==255: ImageDraw.floodfill(mark,(x,y),128)
# 被人物圍住的背景（兩腿中間、手臂和身體之間）：邊框填不到；沒被填到的「接近底色」區塊，面積夠大（≥ 300 px）、顏色和底色平均差 ≤ 5 也算背景（明軒，2026-10-18）
for y in range(0,H,5):
    for x in range(0,W,5):
        if mark.getpixel((x,y))==255:
            ImageDraw.floodfill(mark,(x,y),64); m=np.array(mark)==64; n=int(m.sum())
            isbg=n>=300 and diff[m].mean()<=5   # 白鞋、淺色衣服也會「接近底色」，但顏色比底色不均（明軒白鞋 8.9；真的底色 3 左右）
            arr=np.array(mark); arr[m]=128 if isbg else 200; mark=Image.fromarray(arr).copy()   # .copy()：fromarray 的圖是唯讀的，floodfill 寫不進去
bgm=np.array(mark)==128
fgimg=Image.fromarray(((~bgm)*255).astype(np.uint8))
fgimg=fgimg.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))   # opening: drop specks
fgimg=fgimg.filter(ImageFilter.MinFilter(3)); fg=np.array(fgimg)>127
dil=np.array(fgimg.filter(ImageFilter.MaxFilter(5)))>127; ero=np.array(fgimg.filter(ImageFilter.MinFilter(5)))>127
edge=dil&~ero
alpha=fg.astype(np.float32)
soft=np.clip((diff-12)/34,0,1)**1.3
alpha[edge]=soft[edge]
alpha[~dil]=0
# 腳下的地面陰影（比底色暗、沒有彩度）：底部 8% 的範圍去掉
y0=int(H*0.968); sub=a[y0:]; sat=sub.max(axis=2)-sub.min(axis=2); darker=sub.mean(axis=2)<bg.mean()-8
sh=(sat<14)&darker&(diff[y0:]<70); alpha[y0:][sh]=0
rgb=a.copy(); m=(alpha>0.02)&(alpha<0.98)
rgb[m]=np.clip((a[m]-bg*(1-alpha[m][:,None]))/alpha[m][:,None],0,255)
img=Image.fromarray(np.dstack([rgb,alpha*255]).astype(np.uint8),'RGBA')
bb=img.getbbox(); print('src bbox',bb)
if '--noscale' in sys.argv:
    img.save(out,'WEBP',quality=92,method=6); print('out bbox',bb,'（不縮放）'); sys.exit(0)
r=Image.open(ref).convert('RGBA'); rb=r.getbbox(); print('ref bbox',rb)
s=(rb[3]-rb[1])/(bb[3]-bb[1]); crop=img.crop(bb); nw,nh=round(crop.width*s),round(crop.height*s)
crop=crop.resize((nw,nh),Image.LANCZOS)
canvas=Image.new('RGBA',r.size,(0,0,0,0)); cx=(rb[0]+rb[2])/2; canvas.alpha_composite(crop,(round(cx-nw/2),rb[1]))
print('out bbox',canvas.getbbox(),'scale',round(s,4))
canvas.save(out,'WEBP',quality=92,method=6)
