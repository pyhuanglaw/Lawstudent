# 隔間牆（extras.partition）兩面在光照貼圖上的明暗（11-08 LAWWW2-B，LM-PARTITION-1108 交件時量改前／改後）。不需要 Blender：
#   python3 tools/blender/env_second/lightbake/lm_partition_stats.py <glb> <白天 webp> [晚上 webp]；EXCL=x0,x1,z0,z1 不算朝那個範圍（進不去的房間）的面
# 每個三角形取 7 點（重心＋3 頂點往重心縮 1/4＋3 邊中點），依面積加權；印出正面（朝 dir）、背面的平均、標準差、5～95% 範圍、「整片一個值」（> 0.3 m² 的三角形 7 點差不到 0.004）的面積比例
import json,struct,sys,numpy as np
from PIL import Image
def q2m(q):
    x,y,z,w=q; return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
p=sys.argv[1]; b=open(p,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; J=json.loads(b[20:20+n]); bin_=b[20+n+8:]
def acc(i):
    a=J['accessors'][i]; v=J['bufferViews'][a['bufferView']]; k={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
    dt={5126:np.float32,5125:np.uint32,5123:np.uint16,5121:np.uint8}[a['componentType']]; off=v.get('byteOffset',0)+a.get('byteOffset',0)
    st=v.get('byteStride'); isz=np.dtype(dt).itemsize
    if st and st!=k*isz: raw=np.frombuffer(bin_,dtype=np.uint8,count=st*a['count'],offset=off).reshape(a['count'],st)[:,:k*isz]; return np.frombuffer(raw.tobytes(),dtype=dt).reshape(-1,k)
    return np.frombuffer(bin_,dtype=dt,count=a['count']*k,offset=off).reshape(-1,k)
par={}
for i,nd in enumerate(J['nodes']):
    for c in nd.get('children',[]): par[c]=i
def world(i):
    M=np.eye(4)
    while i is not None:
        nd=J['nodes'][i]; T=np.eye(4); T[:3,:3]=q2m(nd.get('rotation',[0,0,0,1]))@np.diag(nd.get('scale',[1,1,1])); T[:3,3]=nd.get('translation',[0,0,0]); M=T@M; i=par.get(i)
    return M
imgs=[np.asarray(Image.open(f).convert('RGB'),dtype=np.float32).mean(axis=2)/255.0 for f in sys.argv[2:]]
W=[(0,0,0)]  # 取樣點的重心座標
B=np.array([[1/3,1/3,1/3],[.625,.1875,.1875],[.1875,.625,.1875],[.1875,.1875,.625],[.5,.5,0],[0,.5,.5],[.5,0,.5]])
import os
EX=[float(v) for v in os.environ['EXCL'].split(',')] if os.environ.get('EXCL') else None
res={}
for i,nd in enumerate(J['nodes']):
    ex=nd.get('extras') or {}
    if not ex.get('partition') or nd.get('mesh') is None: continue
    d=np.array(ex.get('dir',[0,0,1]),dtype=float); M=world(i)
    for pr in J['meshes'][nd['mesh']]['primitives']:
        if 'TEXCOORD_1' not in pr['attributes']: continue
        P=acc(pr['attributes']['POSITION']).astype(float)@M[:3,:3].T+M[:3,3]; U=acc(pr['attributes']['TEXCOORD_1']).astype(float)
        I=acc(pr['indices']).reshape(-1,3) if 'indices' in pr else np.arange(len(P)).reshape(-1,3)
        a,bb,c=P[I[:,0]],P[I[:,1]],P[I[:,2]]; N=np.cross(bb-a,c-a); A=np.linalg.norm(N,axis=1)/2; Nn=N/np.maximum(2*A[:,None],1e-12); side=np.where(Nn@d>0.3,'正面',np.where(Nn@d<-0.3,'背面','側邊'))
        uvs=np.einsum('kj,tjd->tkd',B,np.stack([U[I[:,0]],U[I[:,1]],U[I[:,2]]],axis=1))   # 三角形 × 7 點 × 2
        for t in range(len(I)):
            if A[t]<0.05: continue
            if EX is not None:
                pc=(a[t]+bb[t]+c[t])/3+Nn[t]*0.3
                if EX[0]<pc[0]<EX[1] and EX[2]<pc[2]<EX[3]: continue   # 朝進不去的房間（EXCL＝x0,x1,z0,z1）
            for li,img in enumerate(imgs):
                h,w=img.shape; xs=np.clip((uvs[t,:,0]*w).astype(int),0,w-1); ys=np.clip((uvs[t,:,1]*h).astype(int),0,h-1); vals=img[ys,xs]
                r=res.setdefault((li,side[t]),{'v':[],'w':[],'flat':0.0,'area':0.0}); r['v']+=list(vals); r['w']+=[A[t]/7]*7; r['area']+=A[t]
                if vals.max()-vals.min()<0.004 and A[t]>0.3: r['flat']+=A[t]
tag=['白天','晚上']
for (li,side),r in sorted(res.items()):
    if side=='側邊': continue
    v=np.array(r['v']); w=np.array(r['w']); m=(v*w).sum()/w.sum(); sd=np.sqrt(((v-m)**2*w).sum()/w.sum()); o=np.argsort(v); cw=np.cumsum(w[o])/w.sum(); p5=v[o][np.searchsorted(cw,0.05)]; p95=v[o][np.searchsorted(cw,0.95)]
    print(f'  {tag[li]} {side}：{r["area"]:.0f} m²　平均 {m:.3f}　標準差 {sd:.3f}　5～95% {p5:.3f}～{p95:.3f}　整片一個值 {100*r["flat"]/max(r["area"],1e-9):.0f}%')
