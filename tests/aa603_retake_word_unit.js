// AA_603（企劃線 e9675475a；使用者 2026-11-02「不是重修生，是重考生吧。」）：祐廷經原是再上一次、不是重修——畫面文字換掉，程式名稱（retake、P4D_ANSWER、ev_p4_retake）不動。用法：node tests/aa603_retake_word_unit.js
const fs=require('fs'), path=require('path'), R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||info===undefined?'':'  → '+info)); if(!ok) fails++; };
const ev=R('src/data/events.js'), st=R('src/story3d.js'), cl=R('src/classes3d.js'), ch=R('src/data/characters.js'), zq=R('src/zrzq3d.js');
const strs=s=>[...s.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m=>m[1]);   /* 只看字串，不看註解 */
const all=[ev,st,cl,ch].flatMap(strs);
check('1. 字串裡沒有「重修生」「重修的第一堂」「重修的經濟學原理」「「重修。」」',!all.some(t=>/重修生|重修的第一堂|重修的經濟學原理|^「重修。」$/.test(t)),all.filter(t=>/重修生|重修的第一堂|重修的經濟學原理|^「重修。」$/.test(t)).join(' / '));
/* 2～4. 舊序章人物的事件、經原第一堂那幾場的字（CANON-NO-ECON-1112 第三批：這一項拿掉）*/
{ global.window=global; const m=zq.match(/S\.courseName=(c=>[^;]*?);/); const f=m?eval(m[1]):null;
  check('5. courseName：經原 retake:true 不加「（重修）」；其他真的重修的課照加',!!f&&f({id:'econ_principles_y1',name:'經濟學原理（上）',retake:true})==='經濟學原理（上）'&&f({id:'civil_general',name:'民法總則（上）',retake:true})==='民法總則（重修）',f&&JSON.stringify([f({id:'econ_principles_y1',name:'經濟學原理（上）',retake:true}),f({id:'civil_general',name:'民法總則（上）',retake:true})])); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
