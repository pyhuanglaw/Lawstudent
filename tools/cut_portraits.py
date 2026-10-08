"""把使用者提供的五人合圖切成五張透明背景立繪（campus/neutral）。
方法：從邊框 flood fill 出背景（淺灰、含漸層），其餘為前景；每個角色用 x 區間取前景元件，去掉標題／名字文字，
邊緣用背景色反推 alpha（線稿邊緣抗鋸齒）。輸出 PNG（原尺寸）＋ WebP。
用法：python3 tools/cut_portraits.py <sheet.png>"""
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage
src=sys.argv[1]
im=Image.open(src).convert('RGB'); a=np.array(im).astype(np.int16); H,W,_=a.shape
# 背景色：邊框中位數
border=np.concatenate([a[:8].reshape(-1,3),a[-8:].reshape(-1,3),a[:,:8].reshape(-1,3),a[:,-8:].reshape(-1,3)])
bg=np.median(border,axis=0); print('bg',bg)
diff=np.abs(a-bg).max(axis=2)          # 與背景色的最大通道差
near=diff<=22                           # 接近背景（含漸層／陰影）
# flood fill：從邊框出發，只走「接近背景」的像素 → 背景區；被線稿包住的白襯衫不會被吃掉（線稿是深色）
seed=np.zeros((H,W),bool); seed[0,:]=seed[-1,:]=seed[:,0]=seed[:,-1]=True; seed&=near
bgmask=ndimage.binary_propagation(seed,mask=near)
fg=~bgmask
# 去掉小碎片（文字筆畫等），補小洞
fg=ndimage.binary_opening(fg,iterations=1)
lab,n=ndimage.label(fg); sizes=ndimage.sum(fg,lab,range(1,n+1))
print('components',n)
# 角色分割：五條分界線（每列在重疊區找背景縫隙，找不到用預設 x），像素依分界線歸屬
CH=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05']
DEFAULT_B=[245,480,695,945]   # 預設分界 x
Y0,Y1=120,1060
bounds=np.zeros((4,H),int)
for k,bx in enumerate(DEFAULT_B):
    for y in range(H):
        lo,hi=bx-48,bx+48
        row=fg[y,lo:hi]
        if not row.any(): bounds[k,y]=bx; continue
        # 找「離預設分界最近」的背景 run（不是最長的：最長的可能是人物手臂與身體之間的縫）
        runs=[]; run=0; start=0
        for i,v in enumerate(list(row)+[True]):
            if not v:
                if run==0: start=i
                run+=1
            else:
                if run>=2: runs.append((start,run))
                run=0
        best=None; bd=1e9
        for st,ln in runs:
            a0,a1=lo+st,lo+st+ln-1
            d=0 if a0<=bx<=a1 else min(abs(a0-bx),abs(a1-bx))
            if d<bd: bd=d; best=(a0,a1)
        bounds[k,y]=(best[0]+best[1])//2 if best and bd<=30 else bx
    # 平滑（中位數）
    bounds[k]=ndimage.median_filter(bounds[k],size=15)
    if k==2:   # 語彤｜子晴：子晴的背包貼著語彤的牛仔褲，沒有縫隙 → 這段用固定分界 688
        bounds[k][590:1012]=np.minimum(bounds[k][590:1012],688)
xs_idx=np.arange(W)[None,:].repeat(H,0)
owner=np.zeros((H,W),int)
for k in range(4): owner+= (xs_idx>=bounds[k][:,None]).astype(int)
out={}
os.makedirs('assets/portraits',exist_ok=True)
for ci,cid in enumerate(CH):
    region=(owner==ci)
    # 在自己的區域內重新 flood fill 背景：區域邊界（分界線）也當種子，這樣夾在兩人之間、原本被包住的背景縫隙也會被清掉
    rim=region&~ndimage.binary_erosion(region,iterations=1)
    seed2=(rim|seed)&near&region
    bg2=ndimage.binary_propagation(seed2,mask=near&region)
    m=region&~bg2
    m=ndimage.binary_opening(m,iterations=1)
    m[:Y0,:]=False; m[Y1+20:,:]=False
    # 去掉小碎片（文字），保留主體
    lab2,n2=ndimage.label(m); sizes2=ndimage.sum(m,lab2,range(1,n2+1))
    keep=np.zeros((H,W),bool)
    biggest=int(np.argmax(sizes2))+1 if n2 else 0
    # 分界線旁的像素（隔壁角色貼過來的碎片會碰到分界線）
    touch=np.zeros((H,W),bool)
    for k in range(4):
        for y in range(H):
            bxk=bounds[k][y]
            touch[y,max(0,bxk-2):min(W,bxk+3)]=True
    for i in range(1,n2+1):
        comp=(lab2==i)
        if sizes2[i-1]<600: continue
        if i!=biggest and (comp&touch).any(): continue   # 不是主體、又貼著分界線 → 是隔壁的碎片
        keep|=comp
    m=ndimage.binary_closing(keep,iterations=2); m=ndimage.binary_fill_holes(m)
    ys,xs=np.where(m)
    bx0,bx1,by0,by1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
    alpha=(m*255).astype(np.uint8)
    edge=m&~ndimage.binary_erosion(m,iterations=2)
    soft=np.clip((diff/40.0),0,1)
    alpha_edge=(soft*255).astype(np.uint8)
    alpha=np.where(edge,np.maximum(alpha_edge,60),alpha).astype(np.uint8)
    rgba=np.dstack([np.clip(a,0,255).astype(np.uint8),alpha])
    crop=rgba[by0:by1,bx0:bx1]
    img=Image.fromarray(crop,'RGBA')
    d=f'assets/portraits/{cid}/campus'; os.makedirs(d,exist_ok=True)
    img.save(f'{d}/neutral.png',optimize=True); img.save(f'{d}/neutral.webp',quality=92,method=6)
    out[cid]={'box':[int(bx0),int(by0),int(bx1),int(by1)],'size':[int(bx1-bx0),int(by1-by0)],'pixels':int(m.sum())}
    print(cid,out[cid])
json.dump(out,open('assets/portraits/_cut_report.json','w'),indent=1)
