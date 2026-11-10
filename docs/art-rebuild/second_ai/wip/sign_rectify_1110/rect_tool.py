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
    if not mk.all():   # 參考圖外面的地方：每一欄取邊緣附近的底色，再沿著橫向大範圍平滑（不平滑會是一條一條的直條紋），往外漸漸接上
        cols_top=np.zeros((w,3)); cols_bot=np.zeros((w,3)); tops=np.zeros(w,int); bots=np.full(w,h-1,int)
        for x in range(w):
            ys=np.where(mk[:,x])[0]
            if len(ys)==0: continue
            tops[x],bots[x]=ys[0],ys[-1]; cols_top[x]=np.median(a[ys[0]+2:ys[0]+10,x],axis=0); cols_bot[x]=np.median(a[max(0,ys[-1]-9):ys[-1]-1,x],axis=0)
        k=np.ones(121)/121
        for c in range(3): cols_top[:,c]=np.convolve(np.pad(cols_top[:,c],60,mode='edge'),k,mode='valid'); cols_bot[:,c]=np.convolve(np.pad(cols_bot[:,c],60,mode='edge'),k,mode='valid')
        for x in range(w):
            if tops[x]>0: a[:tops[x]+2,x]=cols_top[x]
            if bots[x]<h-1: a[bots[x]-1:,x]=cols_bot[x]
        im=Image.fromarray(a)
    return im
if __name__=='__main__':
    items=json.loads(sys.argv[1]); ims=[rect(*it[:4]) for it in items]
    S=Image.new('RGB',(max(i.width for i in ims),sum(i.height+6 for i in ims)),(50,50,50)); y=0
    for i in ims: S.paste(i,(0,y)); y+=i.height+6
    S.save(sys.argv[2],quality=88)
