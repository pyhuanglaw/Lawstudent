"""光照貼圖的「壓扁的面」檢查（LM-COLLAPSE-1030，LAWWW2-B 2026-10-30）：讀烘焙好的 GLB（TEXCOORD_1），找世界面積大（> 1 m²）、
光照 UV 面積卻不到整個模型平均密度 10% 的三角形，再從面上 21 個點沿法線射線，有碰到東西（> 5 cm）、而且碰到的是正面的點＝朝室內、看得到（碰到背面＝起點在別的實心零件裡面：被蓋住）。
為什麼：bake_room.py 的 collapse_black（夾在中間、烘成全黑的面收成一點）10-30 以前只看面的中心——大的牆、地板中心剛好在黑板、講桌、
書架後面就整面收掉，lm_fix_hidden.py 再接到共用邊上，變成對角線那一條光拉開來（博思 101 講台旁一塊斜的深色影子：BB-B n19；社科圖地板一半）。
用法：python3 tools/blender/env_second/lightbake/lm_squash_scan.py 房間.glb [...]（不用 Blender；每間幾十秒）
輸出：每個 GLB 朝室內、被壓扁的三角形數、面積、最大的幾個（物件名、中心、法線、21 點裡看得到幾點）。重烘（bake_room.py 10-30 以後）才會好。"""
import json, struct, sys
import numpy as np
def load(path):
    b=open(path,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; J=json.loads(b[20:20+n]); off=20+n; bin_=b[off+8:off+8+struct.unpack('<I',b[off:off+4])[0]]
    def acc(i):
        a=J['accessors'][i]; bv=J['bufferViews'][a['bufferView']]; o=bv.get('byteOffset',0)+a.get('byteOffset',0)
        nc={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]; dt={5126:np.float32,5125:np.uint32,5123:np.uint16,5121:np.uint8}[a['componentType']]
        st=bv.get('byteStride',0) or nc*np.dtype(dt).itemsize
        arr=np.frombuffer(bin_,dtype=np.uint8,count=a['count']*st,offset=o).reshape(a['count'],st)
        return np.frombuffer(arr[:,:nc*np.dtype(dt).itemsize].tobytes(),dtype=dt).reshape(a['count'],nc)
    return J,acc
def allTris(J,acc):
    out=[]
    for nd in J['nodes']:
        if 'mesh' not in nd: continue
        t=np.array(nd.get('translation',[0,0,0]))
        for pr in J['meshes'][nd['mesh']]['primitives']:
            if pr.get('mode',4)!=4: continue
            P=acc(pr['attributes']['POSITION'])+t; I=acc(pr['indices']).ravel().reshape(-1,3) if 'indices' in pr else np.arange(len(P)).reshape(-1,3)
            m=J['materials'][pr['material']]['name'] if 'material' in pr else ''
            if 'glass' in m: continue
            out.append(P[I])
    return np.concatenate(out)
def hit(T,o,d,tmax=60.0):
    """沿 d 最近碰到的三角形的距離；碰到的是背面（起點在別的實心零件裡面，例如貼著牆、伸進牆裡的樓梯）回傳 None——看不到"""
    e1=T[:,1]-T[:,0]; e2=T[:,2]-T[:,0]; p=np.cross(d,e2); det=(e1*p).sum(1); ok=np.abs(det)>1e-9
    inv=np.where(ok,1/np.where(ok,det,1),0); s=o-T[:,0]; u=(s*p).sum(1)*inv; q=np.cross(s,e1); v=(q*d).sum(1)*inv; t=(e2*q).sum(1)*inv
    m=ok&(u>=0)&(v>=0)&(u+v<=1)&(t>1e-3)&(t<tmax)
    if not m.any(): return None
    i=np.nonzero(m)[0][np.argmin(t[m])]
    return None if np.dot(np.cross(e1[i],e2[i]),d)>0 else t[i]   # 背面：法線和射線同方向
for path in sys.argv[1:]:
    J,acc=load(path); T=allTris(J,acc); rows=[]; aA=aU=0
    for nd in J['nodes']:
        if 'mesh' not in nd: continue
        t=np.array(nd.get('translation',[0,0,0]))
        for pr in J['meshes'][nd['mesh']]['primitives']:
            if 'TEXCOORD_1' not in pr['attributes']: continue
            P=acc(pr['attributes']['POSITION'])+t; U=acc(pr['attributes']['TEXCOORD_1']); I=acc(pr['indices']).ravel().reshape(-1,3)
            n=np.cross(P[I[:,1]]-P[I[:,0]],P[I[:,2]]-P[I[:,0]]); A=np.linalg.norm(n,axis=1)/2
            du1=U[I[:,1]]-U[I[:,0]]; du2=U[I[:,2]]-U[I[:,0]]; UA=np.abs(du1[:,0]*du2[:,1]-du1[:,1]*du2[:,0])/2
            aA+=A.sum(); aU+=UA.sum()
            for k in np.nonzero(A>1.0)[0]: rows.append((nd['name'],int(k),A[k],UA[k],P[I[k]],n[k]/np.linalg.norm(n[k])))
    if not aA: print(path.split('/')[-1],'沒有光照貼圖 UV（TEXCOORD_1），不用查'); continue
    dens=aU/aA; vis=[]
    for r in rows:
        if not (1e-12<r[3]<0.1*dens*r[2]): continue
        V=r[4]; c=V.mean(0); best=None; ns=0
        for a in range(6):
            for b in range(6-a):
                q=V[0]+(V[1]-V[0])*(a/5)+(V[2]-V[0])*(b/5); q=c+(q-c)*0.9; d=hit(T,q+r[5]*0.01,r[5])
                if d is not None and d>0.05: ns+=1; best=d if best is None else max(best,d)
        if ns: vis.append((r[0],r[1],r[2],r[3],c,r[5],best,ns))
    vis.sort(key=lambda r:-r[2])
    print(path.split('/')[-1],'朝室內、被壓扁',len(vis),'面積',round(sum(r[2] for r in vis),1),'m2')
    for r in vis[:6]: print('   %-30s %7.2f m2 at %s n %s 前方最遠 %.1f m（21 點有 %d 點看得到）'%(r[0][:30],r[2],r[4].round(1),r[5].round(1),r[6],r[7]))
