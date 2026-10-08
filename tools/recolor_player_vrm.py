"""把 Seed-san 的科幻服裝貼圖改成素色大學生穿搭（VRM Public License 1.0 允許修改再散布）。
上衣 → 墨綠 T-shirt；褲子 → 炭灰長褲；黑色機械袖／手套 → 膚色。用法：python3 tools/recolor_player_vrm.py in.vrm out.vrm"""
import struct,json,io,sys
import numpy as np
from PIL import Image
src,dst=sys.argv[1],sys.argv[2]
d=open(src,'rb').read(); ln=struct.unpack('<I',d[12:16])[0]; j=json.loads(d[20:20+ln])
off=20+ln; bl=struct.unpack('<I',d[off:off+4])[0]; binb=bytearray(d[off+8:off+8+bl])
def tint(img,box,rgb):
    a=np.array(img).astype(np.float32); x0,y0,x1,y1=box; reg=a[y0:y1,x0:x1,:3]
    lum=reg.mean(axis=2,keepdims=True)/255.0
    reg[:]=np.clip(lum*np.array(rgb,dtype=np.float32),0,255)
    a[y0:y1,x0:x1,:3]=reg; return Image.fromarray(a.astype(np.uint8),img.mode)
def paint(img,box,rgb):
    a=np.array(img); x0,y0,x1,y1=box; a[y0:y1,x0:x1,:3]=rgb; return Image.fromarray(a,img.mode)
newimgs={}
for i,im in enumerate(j['images']):
    bv=j['bufferViews'][im['bufferView']]; b=bytes(binb[bv['byteOffset']:bv['byteOffset']+bv['byteLength']]); name=im.get('name','')
    if name not in ('wear','body'): continue
    pil=Image.open(io.BytesIO(b)).convert('RGBA'); W,H=pil.size; s=W/1024
    if name=='wear':
        pil=tint(pil,(0,0,int(660*s),int(462*s)),(46,86,74))       # 上衣＋袖子：墨綠
        pil=tint(pil,(0,int(462*s),int(660*s),int(890*s)),(70,72,80)) # 褲子：炭灰
        pil=paint(pil,(int(660*s),0,W,H),(238,205,182))                # 其餘機械配件 UV（袖口等殘留）→ 膚色
        pil=paint(pil,(0,int(890*s),W,H),(70,72,80))                   # 底部靴子／配件 → 炭灰
    else:
        skin=(238,205,182)
        pil=paint(pil,(int(600*s),0,W,int(262*s)),skin)               # 手套 → 膚色
        pil=paint(pil,(int(780*s),int(460*s),W,int(690*s)),skin)      # 黑袖 → 膚色
    out=io.BytesIO(); pil.save(out,'PNG',optimize=True); newimgs[i]=out.getvalue()
img_by_bv={j['images'][i]['bufferView']:i for i in newimgs}
newbin=bytearray()
for k,bv in enumerate(j['bufferViews']):
    data=newimgs[img_by_bv[k]] if k in img_by_bv else bytes(binb[bv['byteOffset']:bv['byteOffset']+bv['byteLength']])
    while len(newbin)%4: newbin.append(0)
    bv['byteOffset']=len(newbin); bv['byteLength']=len(data); newbin+=data
while len(newbin)%4: newbin.append(0)
j['buffers'][0]['byteLength']=len(newbin)
j.setdefault('asset',{}).setdefault('extras',{})['recolor']='outfit textures recolored to plain T-shirt/pants for the game (modification allowed by VRM Public License 1.0; credit: Seed-san by VirtualCast, Inc.)'
js=json.dumps(j,separators=(',',':')).encode()
while len(js)%4: js+=b' '
total=12+8+len(js)+8+len(newbin)
open(dst,'wb').write(b'glTF'+struct.pack('<II',2,total)+struct.pack('<I',len(js))+b'JSON'+js+struct.pack('<I',len(newbin))+b'BIN\x00'+bytes(newbin))
print('written',dst,total//1024,'KB')
