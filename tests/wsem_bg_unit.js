// 研討室 A（WSEM：法律倫理、刑事判決研討、公法判決研討，大四上）門口上課的背景（BB 10:24；使用者 10:3x「考試教室都沒人也很怪」）——不需要瀏覽器。
//   1. 上課那一堂：ADV 背景＝wancai_seminar（法律系館B・研討室），不是模糊
//   2. 期末考那一堂：也是 wancai_seminar；S.DOOR_EXAM_LINE 有字時開頭說那一句（AA 寫）
//   3. 共同、普通、博思、體育館的門口上課照舊（不在 DOOR_BG）
// 修改前（dea6b1944）：1、2 FAIL。用法：node tests/wsem_bg_unit.js
const H=require('./pg_harness.js'); const {check,GM}=H, J=JSON.stringify;
(async()=>{
  const want=OUT.bg('wancai_seminar'), id=x=>x&&typeof x==='object'?x.image:x;
  const b0=ADV.begin, s0=ADV.setBg; let cur=null; ADV.begin=function(o){ cur=o&&o.background; return b0.apply(this,arguments); }; ADV.setBg=function(b){ cur=b; return s0.apply(this,arguments); };
  const sb0=GM.sceneBegin; GM.sceneBegin=function(o){ if(o&&o.adv) ADV.begin({background:o.background||'blur'}); };   /* 照 game3d.js 的 sceneBegin：opts.adv＝開 ADV */
  const sayBg=[]; const say0=GM.say; GM.say=async function(w,t){ sayBg.push([id(cur),String(t)]); return say0.apply(this,arguments); };
  const c=COURSES.list.find(x=>x.id==='legal_ethics'); check('0. 法律倫理在 WSEM（門口上課）',!!c&&c.room==='WSEM');
  H.fresh('2028-09-12',13,'wancai',{}); H.G.flags.Y4_PATH='bar';
  const items=CLS.dayItems?CLS.dayItems(H.G).filter(it=>it.c.id==='legal_ethics'):[]; const it=items[0];
  check('0. 那一天有法律倫理',!!it,J(items.map(x=>x.key)));
  if(it){ H.G.hour=it.t0-0.1; cur=null; sayBg.length=0; await CLS.attend(GM,it,{door:true});
    check('1. 上課：ADV 背景＝wancai_seminar（不是模糊）',id(cur)!=='blur'&&sayBg.length>0&&sayBg.every(x=>x[0]===id(want)),J(sayBg.slice(0,3))); }
  /* 期末考那一堂 */
  const ex=(()=>{ for(let d=H.G.day;d<H.G.day+140;d++){ const L=(CLS.dayItems(Object.assign(H.G,{day:d}))||[]).filter(x=>x.c.id==='legal_ethics'&&x.exam); if(L.length) return L[0]; } return null; })();
  check('0. 找得到法律倫理的期末考那一堂',!!ex);
  if(ex){ H.G.day=ex.day; H.G.hour=ex.t0-0.1; cur=null; sayBg.length=0; await CLS.attend(GM,ex,{door:true});
    check('2. 期末考：背景 wancai_seminar；第一句是 AA_578 第 7 節的旁白（{課名}＝法律倫理）',sayBg.length>0&&sayBg.every(x=>x[0]===id(want))&&sayBg[0][1]==='（法律系館B 的研討室。法律倫理只有十幾個人，大家圍著長桌坐，老師坐在桌子的另一頭，手邊一疊考卷。）',J(sayBg.slice(0,3))); }
  check('3. 共同、普通、博思、體育館不在 DOOR_BG',['common','putong','boya','gym'].every(k=>!CLS.DOOR_BG[k]));
  ADV.begin=b0; ADV.setBg=s0; GM.say=say0; GM.sceneBegin=sb0; H.done();
})();
