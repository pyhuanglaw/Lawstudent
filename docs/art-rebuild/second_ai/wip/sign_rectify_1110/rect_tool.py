import sys, json
import numpy as np
from PIL import Image
def coeffs(dst,src):
    A=[];B=[]
    for (x,y),(u,v) in zip(dst,src): A.append([x,y,1,0,0,0,-u*x,-u*y]); A.append([0,0,0,x,y,1,-v*x,-v*y]); B+=[u,v]
    return np.linalg.solve(np.array(A,float),np.array(B,float))
def rect(f,quad,w,h):
    src=Image.open(f).convert('RGB'); c=coeffs([(0,0),(w,0),(w,h),(0,h)],quad); im=src.transform((w,h),Image.PERSPECTIVE,c,Image.BICUBIC)
    m=Image.new('L',src.size,255).transform((w,h),Image.PERSPECTIVE,c,Image.NEAREST)   # 參考圖外面的地方（招牌被圖的邊切掉）：用同一欄最近的招牌底色補
    a=np.asarray(im).copy(); mk=np.asarray(m)>0
    if not mk.all():
        for x in range(w):
            col=mk[:,x]
            if col.all() or not col.any(): continue
            ys=np.where(col)[0]; top,bot=ys[0],ys[-1]
            if top>0: a[:top,x]=np.median(a[top:top+6,x],axis=0)
            if bot<h-1: a[bot+1:,x]=np.median(a[bot-5:bot+1,x],axis=0)
        im=Image.fromarray(a)
    return im
if __name__=='__main__':
    items=json.loads(sys.argv[1]); ims=[rect(*it[:4]) for it in items]
    S=Image.new('RGB',(max(i.width for i in ims),sum(i.height+6 for i in ims)),(50,50,50)); y=0
    for i in ims: S.paste(i,(0,y)); y+=i.height+6
    S.save(sys.argv[2],quality=88)
