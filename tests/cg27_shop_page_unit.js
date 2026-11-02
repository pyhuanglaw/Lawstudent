// CG-27（BB 2026-11-02 19:20 交件、AA 確認）：以安心意邀約第二次「你要看嗎？」選好以後的第一拍是手帳特寫；檔案在、有登錄、有授權紀錄
const fs=require('fs'), path=require('path'), R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||info===undefined?'':'  → '+info)); if(!ok) fails++; };
const adv=R('src/adv3d.js'), tl=R('src/data/termend_lines.js'), lic=R('LICENSES.md');
const m=adv.match(/cg_shop_page_check_heroine01:\{file:'([^']+)',title:'([^']+)'\}/);
check('1. CG_REGISTRY 有 cg_shop_page_check_heroine01、標題「……勾了。」',!!m&&m[2]==='……勾了。',m&&m[2]);
check('2. 圖檔存在',!!m&&fs.existsSync(path.join(__dirname,'..',m[1])),m&&m[1]);
const s=tl.match(/she2Yes:\[(.*?)\],/);
check('3. she2Yes 第一拍是 CG、接著是翻手帳那句旁白、最後「……勾了。」',!!s&&/^\{cg:'cg_shop_page_check_heroine01'\},\{narr:'（她把手帳翻到「想去的店」那一頁/.test(s[1])&&/'……勾了。'$/.test(s[1]),s&&s[1].slice(0,120));
check('4. 只出現在 she2Yes 一處',(tl.match(/cg_shop_page_check_heroine01/g)||[]).length===1);
check('5. LICENSES.md 有 CG-27 那一列',/CG-27[^\n]*cg_shop_page_check\.webp/.test(lic));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
