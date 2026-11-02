"""單張灰底立繪去背、縮放到和既有表情同一個外框（可昕 teasing，BB-C 61a1db97，2026-10-18 LAWWW-C）。
只用 numpy＋PIL（沙盒沒有 scipy、rembg）：邊框取底色 → 從邊框 flood fill 出背景＋被圍住的底色小區塊（頭髮絲中間，2026-11-02）→ 開運算去碎點 → 邊緣用附近的前景色估 alpha、顏色修回前景色（defringe，2026-11-02 BB 第 106 組）→ 腳下地面陰影（底部 3%、比底色暗、沒彩度）去掉 →
依參考圖（同一套衣服的 smile.webp）的外框高度縮放、頭頂和中心對齊。
用法：python3 tools/portraits/matte_gray.py <來源.png> <輸出.webp> <參考.webp> [--noscale] [--bg x,y …]（--noscale：來源已經對齊成參考圖的大小，只去背、不縮放）"""
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
# 被人物圍住的背景（兩腿中間、手臂和身體之間、頭髮絲之間、耳機線圈裡）：邊框填不到；沒被填到的「接近底色」區塊，顏色和底色平均差夠小也算背景。
# 大塊（≥ 300 px）：平均差 ≤ 5（明軒，2026-10-18：白鞋、淺色衣服也會「接近底色」，但顏色比底色不均，明軒白鞋 8.9；真的底色 3 左右）；
# 小塊（3～299 px，頭髮絲中間、線圈空隙；BB 11-02 第 106 組 pool_11、pool_20）：中間有 30% 以上的點和底色差 ≤ 5，而且那些點和底色同一個色偏（R、G、B 差的形狀一樣），眼白、反光不會被當成背景；大塊另外接受同一個條件（一半以上）
def _ring(m,pad=3):
    ys,xs=np.nonzero(m); y0_,y1_,x0_,x1_=max(ys.min()-pad,0),ys.max()+pad+1,max(xs.min()-pad,0),xs.max()+pad+1
    sm=m[y0_:y1_,x0_:x1_]; r=(np.array(Image.fromarray((sm*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)))>127)&~sm
    return (slice(y0_,y1_),slice(x0_,x1_)),r
def _skinny(sl,r):   # 四周有皮膚（暖色、有彩度、不暗）＝眼白、牙齒、臉上的反光，不是背景（pool_16 眼白、pool_4 臉旁，11-02）
    px=a[sl][r].astype(np.float32); sk=(px[:,0]-px[:,2]>=18)&(px.mean(axis=1)>110)
    return sk.mean()>=0.04 if len(px) else False
tint=bg-bg.mean()
_outer=np.array(Image.fromarray(((np.array(mark)==128)*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(41)))>127   # 外面那一大片背景往內 20 px（30 px 會把 pool_16 的眼白去掉；更裡面的空隙用 --bg 手動指定）：被圍住的小塊要在這裡面才算（眼白在臉的中間，離外面的背景 40 px 以上；pool_16，11-02）
for y in range(0,H,2):
    for x in range(0,W,2):
        if mark.getpixel((x,y))==255:
            ImageDraw.floodfill(mark,(x,y),64); arr=np.array(mark); m=arr==64; n=int(m.sum()); d=diff[m]
            core=d<=5; nc=int(core.sum())   # 區塊外圈是頭髮和底色混在一起的點（差 10～14），只看中間「幾乎就是底色」的點
            c=a[m][core].mean(axis=0) if nc else None; same=nc>0 and np.abs((c-c.mean())-tint).max()<=2.5
            if n>=300: isbg=d.mean()<=5 or (same and nc>=0.5*n)
            elif n>=3: isbg=same and nc>=max(2,0.3*n) and _outer[m].mean()>=0.5
            else: isbg=False
            arr[m]=128 if isbg else 200; mark=Image.fromarray(arr).copy()   # .copy()：fromarray 的圖是唯讀的，floodfill 寫不進去
bgm=np.array(mark)==128
# 手動指定的背景點（--bg x,y，來源圖座標，可以給好幾次）：從那一點往外填「和底色差 ≤ 14」的區塊（pool_1 脖子旁、耳朵下面的髮絲空隙，11-02 BB 第二次）
for i,arg in enumerate(sys.argv):
    if arg=='--bg' and i+1<len(sys.argv):
        x,y=map(int,sys.argv[i+1].split(',')); nm=Image.fromarray(((diff<=14)&~bgm).astype(np.uint8)*255).copy()
        if nm.getpixel((x,y))==255: ImageDraw.floodfill(nm,(x,y),64); bgm|=np.array(nm)==64; print('--bg',x,y,'填了',int((np.array(nm)==64).sum()),'px')
        else: print('--bg',x,y,'那一點不是接近底色的點（差',int(diff[y,x]),'）')
# 頭髮絲中間「比底色亮」的沒彩度小洞（pool_11 髮髻旁邊 235～238：和底色差超過 14，上面的「接近底色」抓不到；BB 11-02）：
# 沒彩度、比底色暗不到 30、離背景 12 px 以內、面積 < 300、四周 2 px 七成以上是深色頭髮 → 背景
_sat=a.max(axis=2)-a.min(axis=2)
_near=np.array(Image.fromarray((bgm*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(25)))>127
_cand=(~bgm)&(_sat<=10)&(a.mean(axis=2)>=bg.mean()-30)&_near
cm=Image.fromarray((_cand*255).astype(np.uint8)).copy()
for y,x in zip(*np.nonzero(_cand)):
    if cm.getpixel((int(x),int(y)))!=255: continue
    ImageDraw.floodfill(cm,(int(x),int(y)),64); arr=np.array(cm); m=arr==64; n=int(m.sum()); ok=False
    if n<300:
        sl,ring=_ring(m); rb_=bgm[sl][ring]; rd=diff[sl][ring]
        ok=ring.sum()>0 and ((rd>60)|rb_).mean()>=0.7 and (rd>60).mean()>=0.3 and not _skinny(sl,ring)   # 四周有皮膚的（脖子旁的空隙）不自動判，用 --bg 指定：放寬會把白襯衫的褶子挖掉（pool_7，11-02）
    if ok: bgm[m]=True
    arr[m]=32; cm=Image.fromarray(arr).copy()
import os
if os.environ.get('MATTE_DEBUG'): mark.save(os.environ['MATTE_DEBUG'])   # 128＝背景、200＝被圍住但不算背景、255/0＝人物
fgimg=Image.fromarray(((~bgm)*255).astype(np.uint8))
fgimg=fgimg.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))   # opening: drop specks
fg=np.array(fgimg)>127
def box(x,r):   # 方框平均（沒有 scipy）：x 是 H×W 或 H×W×C
    p=np.pad(x,((r+1,r),(r+1,r))+((0,0),)*(x.ndim-2),mode='edge').cumsum(0).cumsum(1)
    k=2*r+1; return (p[k:,k:]-p[:-k,k:]-p[k:,:-k]+p[:-k,:-k])/(k*k)
# 邊緣：每一點估「前景色」F＝附近完全在人物裡面的點的平均（往內 3 px 以上），alpha＝這一點在「底色 → F」線上的位置；
# 前景色離底色太近（淺灰毛衣）就用舊的「和底色的距離」。顏色用 F 修回去（defringe），不留底色的亮線／灰邊（BB 11-02：pool_11 肩膀外緣、Kevin 髮緣和袖口）
bgimg=Image.fromarray(((~fg)*255).astype(np.uint8))
nearbg=np.array(bgimg.filter(ImageFilter.MaxFilter(9)))>127   # 離背景 4 px 以內（頭髮絲之間：混了底色的點常常在背景旁邊 2～4 px）
inner=fg&((np.array(fgimg.filter(ImageFilter.MinFilter(7)))>127)|(diff>60))   # 前景色的來源：往內 3 px 以上，或顏色和底色差很多（頭髮絲本身）
band=nearbg&~inner|(~fg&(np.array(fgimg.filter(ImageFilter.MaxFilter(5)))>127))
w=inner.astype(np.float32); F=np.zeros_like(a)
for r in (3,6,12,24):
    ws=box(w,r); Fs=box(a*w[...,None],r)/np.maximum(ws,1e-6)[...,None]; take=(ws>0.02)&(F.sum(axis=2)==0); F[take]=Fs[take]
D=F-bg; DD=(D*D).sum(axis=2); proj=np.clip(((a-bg)*D).sum(axis=2)/np.maximum(DD,1),0,1)
soft=np.clip((diff-12)/34,0,1)**1.3
alpha=fg.astype(np.float32)
use=band&(DD>=30*30); alpha[use]=proj[use]
old=band&(DD<30*30); alpha[old]=soft[old]*fg[old]
alpha[~band&~fg]=0
# 淺色衣服的最外圈（白襯衫袖子：前景色和底色太近，上面估不出 alpha，留一圈淺色光暈；pool_7，11-02 BB 第二次）：最外面 1 px 再內縮
_e3=np.array(fgimg.filter(ImageFilter.MinFilter(3)))>127; _e5=np.array(fgimg.filter(ImageFilter.MinFilter(5)))>127
_lt=(DD<45*45)&(a.mean(axis=2)>=140)   # 前景是淺色、這一點也是淺色（原圖淺色衣服外面那一圈 227 的亮邊、170 的淺灰線）
alpha[fg&~_e3&_lt]*=0.25; alpha[_e3&~_e5&_lt]*=0.6   # 最外面 1 px 幾乎拿掉、第 2 px 淡一點；深色的線（頭髮、深色衣服）不動
alpha[(alpha<0.08)]=0
# 腳下的地面陰影（比底色暗、沒有彩度）：底部 3% 的範圍去掉
y0=int(H*0.968); sub=a[y0:]; sat=sub.max(axis=2)-sub.min(axis=2); darker=sub.mean(axis=2)<bg.mean()-8
sh=(sat<14)&darker&(diff[y0:]<70); alpha[y0:][sh]=0
rgb=a.copy(); m=(alpha>0.0)&(alpha<0.98)
un=np.clip((a[m]-bg*(1-alpha[m][:,None]))/np.maximum(alpha[m][:,None],0.05),0,255)
k=np.clip((0.9-alpha[m])/0.9,0,1)[:,None]; rgb[m]=un*(1-k)+F[m]*k   # 越透明越用 F 的顏色
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
