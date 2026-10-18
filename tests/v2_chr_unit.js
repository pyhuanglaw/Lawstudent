// V2-CHR（2026-10-16）：經濟系的朋友盧正勳（阿勳）、曾品妤進 characters.js（BB-B 02:00 的人物資料；id 照企劃 syllabus 的 econ_*，AA_140 G40）；
// BB 台詞的稱呼（speaker '阿勳'、'品妤'）＝這個人：立繪照 id、對話框的名字照原文（EVENTS.speakerId）。修改前沒有這兩個人（第 1 項失敗）。用法：node tests/v2_chr_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/characters.js'),'utf8').replace(/^const (CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS)\s*=/mg,'globalThis.$1='),{filename:'characters.js'});
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/portrait_manifest.js'),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:'portrait_manifest.js'});
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/events3d.js'),'utf8').replace(/^const EVENTS\s*=/m,'globalThis.EVENTS='),{filename:'events3d.js'});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const X=CHARACTERS.econ_zhengxun, P=CHARACTERS.econ_pinyu;
check('1. 兩個人都在：盧正勳（經濟系、180 cm、男）、曾品妤（經濟系、158 cm、女）',!!X&&!!P&&X.name==='盧正勳'&&X.height===180&&X.gender==='m'&&P.name==='曾品妤'&&P.height===158&&P.gender==='f');
check('2. 立繪：assets/portraits/<id>/campus/neutral.webp 存在、manifest 有',['econ_zhengxun','econ_pinyu'].every(id=>fs.existsSync(path.join(ROOT,'assets/portraits',id,'campus/neutral.webp'))&&JSON.stringify(globalThis.PORTRAIT_FILES||{}).includes(id)));
check('3. 稱呼對到人：阿勳→econ_zhengxun、品妤→econ_pinyu；人物 id 本身不變；沒有 alias 的照原樣',EVENTS.speakerId('阿勳')==='econ_zhengxun'&&EVENTS.speakerId('品妤')==='econ_pinyu'&&EVENTS.speakerId('heroine_01')==='heroine_01'&&EVENTS.speakerId('大伯')==='大伯');
const ev=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8');
check('4. P4d 的台詞照原文（speaker 還是 BB 寫的「阿勳」「品妤」，沒有改字；2026-10-16 起沒聯絡過的才說這句，BB_96 10-1 AB-46）',ev.includes("speaker:'阿勳',text:'盧正勳。你經濟系那年的室友。……你該不會連我都忘了。'}")&&ev.includes("speaker:'品妤',text:'曾品妤。經濟系，可昕以前的室友。'"));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
