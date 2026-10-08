"""縮小 VRM 貼圖並移除縮圖（原型用）：python3 tools/shrink_vrm.py in.vrm out.vrm [maxsize=1024] [note]"""
import struct,json,io,sys
from PIL import Image
src,dst=sys.argv[1],sys.argv[2]; MAXS=int(sys.argv[3]) if len(sys.argv)>3 else 1024; note=sys.argv[4] if len(sys.argv)>4 else ''
d=open(src,'rb').read(); ln=struct.unpack('<I',d[12:16])[0]; j=json.loads(d[20:20+ln])
off=20+ln; bl=struct.unpack('<I',d[off:off+4])[0]; binb=bytearray(d[off+8:off+8+bl])
meta=(j.get('extensions',{}).get('VRMC_vrm',{}) or {}).get('meta') or (j.get('extensions',{}).get('VRM',{}) or {}).get('meta')
thumb=None
if meta and 'thumbnailImage' in meta: thumb=meta.pop('thumbnailImage')
if meta and 'texture' in meta: thumb=meta.pop('texture')   # VRM0
newimgs={}
for i,im in enumerate(j['images']):
    bv=j['bufferViews'][im['bufferView']]; b=bytes(binb[bv['byteOffset']:bv['byteOffset']+bv['byteLength']])
    pil=Image.open(io.BytesIO(b)); name=im.get('name','') or ''
    if i==thumb: pil=Image.new('RGBA',(1,1),(0,0,0,0))
    mx=MAXS//2 if ('nm' in name.lower() or 'normal' in name.lower() or 'mask' in name.lower()) else MAXS
    if max(pil.size)>mx:
        r=mx/max(pil.size); pil=pil.resize((max(1,int(pil.size[0]*r)),max(1,int(pil.size[1]*r))),Image.LANCZOS)
    out=io.BytesIO(); pil.save(out,'PNG',optimize=True); newimgs[i]=out.getvalue()
img_by_bv={j['images'][i]['bufferView']:i for i in newimgs}
newbin=bytearray()
for k,bv in enumerate(j['bufferViews']):
    data=newimgs[img_by_bv[k]] if k in img_by_bv else bytes(binb[bv['byteOffset']:bv['byteOffset']+bv['byteLength']])
    while len(newbin)%4: newbin.append(0)
    bv['byteOffset']=len(newbin); bv['byteLength']=len(data); newbin+=data
while len(newbin)%4: newbin.append(0)
j['buffers'][0]['byteLength']=len(newbin)
for i in newimgs: j['images'][i]['mimeType']='image/png'
if note: j.setdefault('asset',{})['extras']={'note':note}
js=json.dumps(j,separators=(',',':')).encode()
while len(js)%4: js+=b' '
total=12+8+len(js)+8+len(newbin)
open(dst,'wb').write(b'glTF'+struct.pack('<II',2,total)+struct.pack('<I',len(js))+b'JSON'+js+struct.pack('<I',len(newbin))+b'BIN\x00'+bytes(newbin))
print('written',dst,len(d)//1024,'KB →',(total)//1024,'KB')
