import sys
root=sys.argv[1]
p=root+'/src/story3d.js'; s=open(p).read()
old="    await GM.walkTo(P,it.seat.x,it.seat.z+0.5); GM.sitAt(P,it.seat); await GM.sleep(300); GM.advance(0.5); if(typeof EAT!=='undefined') await EAT.ordered(GM,'阿鳳麵店'"
assert s.count(old)==1, 'story'
new="    { const ap=GM.seatApproach?GM.seatApproach(it.seat):[it.seat.x,it.seat.z+0.5]; await GM.walkTo(P,ap[0],ap[1]); }   /* NOODLE-AP-1105（BB-C 10:27 V21R_reach：shaola v7 椅子後面 0.5 m 站不住）：和 deskScene、「坐下」一樣走到 seatApproach */ GM.sitAt(P,it.seat); await GM.sleep(300); GM.advance(0.5); if(typeof EAT!=='undefined') await EAT.ordered(GM,'阿鳳麵店'"
s=s.replace(old,new); open(p,'w').write(s)
p=root+'/tests/reachability_all.py'; s=open(p).read()
old="...(zone==='dorm'&&GAME.seatApproach?GAME.seatApproach(it.seat):[it.seat.x,it.seat.z+0.5])]); }"
assert s.count(old)==1, 'reach'
s=s.replace(old,"...(GAME.seatApproach?GAME.seatApproach(it.seat):[it.seat.x,it.seat.z+0.5])]); }   /* 麵店也走 seatApproach（NOODLE-AP-1105） */")
open(p,'w').write(s); print('ok')
