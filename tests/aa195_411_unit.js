// 第一週舊句（AA_195 4-11，AA-B 2026-10-17 00:46）＋阿凱 9/3 那句（BB_168 第 4 節、6-1）——原始碼檢查（這幾段在 talkProf／anAfter／talkKai／introDorm 裡，不需要瀏覽器）。
// 修改前全部 FAIL。用法：node tests/aa195_411_unit.js
// 第 3 項的期待值照 AA_522 第 1-1 節改（企劃線 fcc93126e，AA-C 定稿，D100e；NPC-STORY2-1028）：「週三下午我都在」→「週四下課以後我都在」（研究室事件是週四他的課下課以後）；
//   只在他有課的學期說、其他學期聊兩句天氣的行為測試在 tests/aa522_prof_office_unit.js。
const fs=require('fs'), path=require('path');
const st=fs.readFileSync(path.join(__dirname,'..','src','story3d.js'),'utf8'), ev=fs.readFileSync(path.join(__dirname,'..','src','data','events.js'),'utf8');
let fails=0; const check=(n,ok)=>{ console.log((ok?'PASS ':'FAIL ')+n); if(!ok) fails++; };
check('1. 周教授（答得好、新局）：「下週從第一條開始，先把總則的目錄看過。」；舊局照舊',/week1Start\(G\)\?'。今天回答得不錯。下週從第一條開始，先把總則的目錄看過。':'。今天回答得不錯。下週的錯誤與撤銷，先看八十八和九十一。'/.test(st));
check('2. 周教授（沒讀）：「案例要讀。下週我還會點人。」（拿掉「這不是威脅，是預告」）',st.includes("'。案例要讀。下週我還會點人。'")&&!st.includes('這不是威脅，是預告'));
check('3. 周教授（其他）：「有問題可以來研究室。週四下課以後我都在。」（拿掉格言收尾；AA_522 1-1：原本「週三下午我都在」）',st.includes("'有問題可以來研究室。週四下課以後我都在。'")&&!st.includes('週三下午我都在')&&!/talkProf[\s\S]{0,900}法律不是背的，是想的/.test(st));
check('4. 以安（新局）三句拿掉「報告」，留 Café 回聲',st.includes("w1?'你說的那個『無過失』，我回去查了一下。課本後面才會講。'")&&st.includes("w1?'你說的『後果自己承擔』，我後來想了一下。……還是覺得不太公平。'")&&st.includes("w1?'你那個『不能賠十倍』的講法，我記在筆記旁邊了。'"));
check('5. 阿凱（新局）選項「同學。去咖啡廳念書。」→「（笑）念書喔。好喔。」',st.includes("t:w1?'同學。去咖啡廳念書。':'同學。寫報告。'")&&st.includes("w1?'（笑）念書喔。好喔。'"));
check('6. 選課備忘：「備取，等第二階段退選」（沒有人工加簽）',ev.includes("備取，等第二階段退選'")&&!ev.includes('打算加簽'));
check('7. 阿凱 9/3（BB_168 第 4 節，新舊局）：「（拿下一邊耳機…）你們才開學三天就要讀這麼多喔？」、兩個選項的新回應；沒有「我室友上學期」',st.includes('你們才開學三天就要讀這麼多喔？')&&st.includes("'喔，那你看。我戴耳機。'")&&st.includes("'我們這週都在講課程大綱。'")&&!st.includes('我室友上學期就是這樣'));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
