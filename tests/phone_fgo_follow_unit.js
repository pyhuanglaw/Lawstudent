// 「直接過去」到了以後人還不在眼前（校園裡「走走」的人沒有確切位置、落在快速地點）：直接站到他旁邊，不再接「帶我去」畫路線
// （原本 PHONE-UNIFY-1030 是自動接帶我去；使用者 2026-11-03 23:0x：「不需要再有帶我去這個功能不管是手機裡的還是地圖上的都不需要我要直接過去」「如果說我花時間就能過去的也不需要再帶我去了直接過去」——MAP-FRIEND-GO-1103）。
//   從 src/game3d.js 抽出 snapNear＋goFollow 原樣執行：同一區、離玩家 8 m 以上＝轉場、站到離他 1.1 m 站得住的地方、面向他、照距離加走路的時間；8 m 以內不動；不在這一區、找不到人＝不做。
// 用法：node tests/phone_fgo_follow_unit.js
const fs=require('fs'), path=require('path');
const SRC=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const m=SRC.match(/\n  GM\.FGO_NEAR=8;\n[\s\S]*?\n  GM\.goFollow=goFollow;/);
check('0. game3d.js 有 snapNear、goFollow（GM.FGO_NEAR 8 m）；goFollow 不再叫 findPerson',!!m&&/async function snapNear\(id\)/.test(m[0])&&!/findPerson\(/.test(m[0]));
if(!m){ console.log('FAILED '+fails); process.exit(1); }
(async()=>{
  const mk=()=>{ const st={fades:[],adv:0,placed:null}; const GM={npc:{}}, G={zone:'campus'}, player={obj:{position:{x:0,z:0},rotation:{y:0}},lv:0};
    const E={player,canStand:()=>true,placeAt:(ent,x,z,lv)=>{ st.placed={x,z,lv}; ent.obj.position.x=x; ent.obj.position.z=z; },unstick:()=>{}};
    const STORY={whereIs:(gm,id)=>st.where&&st.where[id]};
    const f=new Function('GM','G','E','STORY','fade','advance',m[0]+'\n return {snapNear,goFollow};');
    return {st,GM,G,E,api:f(GM,G,E,STORY,async on=>st.fades.push(on),h=>{ st.adv+=h; })}; };
  { const t=mk(); t.st.where={zheng:{zone:'campus'}}; t.GM.npc.zheng={obj:{position:{x:80,z:0}},lv:0};
    const ok=await t.api.goFollow('zheng'); const p=t.st.placed, d=p&&Math.hypot(p.x-80,p.z-0);
    check('1. 同一區、離 80 m：轉場（fade 進出）、站到他旁邊（約 1.1 m）、加走路的時間',ok&&t.st.fades.join()==='true,false'&&d>0.9&&d<1.3&&t.st.adv>0,JSON.stringify({p,adv:t.st.adv})); }
  { const t=mk(); t.st.where={zheng:{zone:'campus'}}; t.GM.npc.zheng={obj:{position:{x:5,z:0}},lv:0};
    const ok=await t.api.goFollow('zheng'); check('2. 8 m 以內：不動（不轉場）',ok&&!t.st.placed&&!t.st.fades.length); }
  { const t=mk(); t.st.where={zheng:{zone:'gongguan'}}; t.GM.npc.zheng={obj:{position:{x:80,z:0}},lv:0};
    check('3. 不在這一區：不做',!(await t.api.goFollow('zheng'))&&!t.st.placed); }
  { const t=mk(); t.st.where={zheng:{zone:'campus'}};
    check('4. 這一區沒有他的人物：不做',!(await t.api.goFollow('zheng'))&&!t.st.placed); }
  check('5. 「直接過去」按下去：quickGo 走到以後 await goFollow(id)（站到他旁邊）',/await quickGo\(fg\.pl,\{force:true\}\); await goFollow\(id\)/.test(SRC));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('ERR',e.stack); process.exit(1); });
