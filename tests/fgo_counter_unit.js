// 「直接過去」不把玩家放進吧台裡面（FGO-COUNTER-1105；使用者 2026-11-05 07:4x「我從地圖直接過去林芷若在的地方 結果就在吧台卡住」）。
//   芷若在 2:30 AM 上班＝站在吧台後面 (−2.5, −5.15)（story3d.js act 'barista'）；舊的 snapNear 只看「站得住」，吧台後面站得住 → 玩家被放進吧台裡、走不出來。
//   新的：還要從玩家現在的位置走得到（E.simWalk 移動模擬）；1.1 m 一圈不行往外找，都不行就留在原地。
//   做法：從 src/game3d.js 抽出 snapNear 原樣執行；假的場地＝吧台檯面 z −4.6～−3.4 站不住，吧台後面（z < −4.6）站得住、但從店門口走不到。
//   SNAP_SRC＝別的檔案（例：git show <舊版>:src/game3d.js 存下來）可以拿舊版跑：舊版第 1 項 FAIL。用法：node tests/fgo_counter_unit.js
const fs=require('fs'), path=require('path');
const SRC=fs.readFileSync(process.env.SNAP_SRC||path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const m=SRC.match(/\n  async function snapNear\(id\)[\s\S]*?\n  GM\.snapNear=snapNear;/);
check('0. game3d.js 有 snapNear',!!m); if(!m){ console.log('FAILED '+fails); process.exit(1); }
const COUNTER=(x,z)=>x>-6&&x<2&&z>-4.6&&z<-3.4, BEHIND=(x,z)=>x>-6&&x<2&&z<=-4.6;
(async()=>{
  const mk=(o)=>{ const st={placed:null,adv:0}; const GM={npc:{zhiruo:{obj:{position:{x:-2.5,z:-5.15}},lv:0}},FGO_NEAR:8}, player={obj:{position:{x:0,z:5},rotation:{y:0}},lv:0};
    const E={player,canStand:(x,z)=>!COUNTER(x,z),placeAt:(ent,x,z)=>{ st.placed={x,z}; ent.obj.position.x=x; ent.obj.position.z=z; },unstick:()=>{},
      simWalk:(x0,z0,x,z)=>({ok:!(o&&o.noFront)&&!BEHIND(x,z)&&!COUNTER(x,z)})};
    const f=new Function('GM','E','fade','advance',m[0]+'\n return snapNear;');
    return {st,E,snap:f(GM,E,async()=>{},h=>{ st.adv+=h; })}; };
  { const t=mk(); await t.snap('zhiruo'); const p=t.st.placed;
    check('1. 芷若在吧台後面：玩家放在吧台前面（不是吧台裡、也不是檯面上），離她 3.5 m 以內',!!p&&!BEHIND(p.x,p.z)&&!COUNTER(p.x,p.z)&&Math.hypot(p.x+2.5,p.z+5.15)<=3.6,JSON.stringify(p)); }
  { const t=mk({noFront:true}); await t.snap('zhiruo'); const p=t.E.player.obj.position;
    check('2. 附近都走不到：留在原地（不放進封起來的地方）',!t.st.placed&&p.x===0&&p.z===5,JSON.stringify(t.st.placed)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('ERR',e.stack); process.exit(1); });
