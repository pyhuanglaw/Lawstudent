// 可昕的 3D 是她自己的模型（2026-10-18 使用者在醉月湖：「終於看到杜可昕本人，原來她是男的？」「照她本人畫啊」「不是有 2D 圖」）——不需要瀏覽器。
// 原因：characters.js 的 kexin 沒有 char3d，game3d.js 的 spawnCharacter 掉到 STORY.extraSpec(7)（id x7、男生）＝路人男生的底模。
// 檢查：① kexin 有 char3d（spec.id kexin、女生、model char.kexin）② 照 spawnCharacter 的做法建出來＝char.kexin（LAWWW2 照參考圖做的 VRM）
//       ③ 每個有名字的人物都有 char3d（沒有的會變成路人男生）④ 女生的 char3d 不是男生的 spec。修改前 ① ② 失敗。用法：node tests/kexin_model_unit.js
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..','src/data/characters.js'),'utf8').replace(/^const CHARACTERS\s*=/m,'global.CHARACTERS='));
(async()=>{
  const c=CHARACTERS.kexin; const s=c.char3d&&c.char3d.spec;
  check('① 可昕有 char3d：spec.id kexin、女生、model char.kexin',!!s&&s.id==='kexin'&&s.sex==='f'&&c.char3d.model==='char.kexin',s&&[s.id,s.sex,c.char3d.model].join(','));
  await preload(['char.kexin']);
  const spec=Object.assign({},s); spec.name=c.name; spec.model=c.char3d.model; spec.height=c.char3d.height;   // game3d.js spawnCharacter
  const h=CHAR.build(spec); const u=h.userData; check('② 建出來是她自己的 VRM（char.kexin）',u.driver==='vrm'&&u.key==='char.kexin',u.driver+' '+u.key);
  const no=Object.entries(CHARACTERS).filter(([k,x])=>!x.char3d).map(([k])=>k); check('③ 每個有名字的人物都有 char3d',!no.length,no.join(','));
  const bad=Object.entries(CHARACTERS).filter(([k,x])=>x.gender==='f'&&x.char3d&&x.char3d.spec&&typeof x.char3d.spec==='object'&&x.char3d.spec.sex==='m').map(([k])=>k); check('④ 女生的 3D spec 不是男生',!bad.length,bad.join(','));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
