// 轉角唱片：約可昕只排週末（AA-B 11-07 15:36「平日下午她在木柵上課；平日那一格不出現就好，不用另外寫婉拒」；CORNER-IN-1107）——不需要瀏覽器（D131）。
// 檢查：1 週三約可昕：「今天／明天」的時間都不列（週三、週四），只剩「其他日子…」；別人照常列；2 「其他日子…」只列週六、週日；
//       3 週五約可昕：「明天」（週六）列、「今天」（週五）不列；4 INV.dayOk：可昕週三 false、週六 true，別人都 true。修改前 FAIL。用法：node tests/corner_kexin_weekend_unit.js
const H=require('./pg_harness.js'); const {check,GM}=H; const J=JSON.stringify;
const P=INVITE_DATA.places.find(p=>p.id==='corner_records');
const wd=(G,d)=>((G.weekday+(d-G.day))%7+7)%7;
(async()=>{
  if(!P){ check('0. 轉角唱片是邀約地點',false); H.done(); }
  { const G=H.fresh('2025-10-22',10,'campus'); G.visited={corner_records:1};   // 2025-10-22＝週三
    const kx=INV.timeOptions(G,false,P,'kexin'), an=INV.timeOptions(G,false,P,'heroine_01');
    check('1. 週三約可昕：今天、明天（週三、週四）的時間都不列；以安照常列',G.weekday===3&&kx.length===0&&an.length>0&&an.some(q=>q.day===G.day),J({wd:G.weekday,kx,an:an.map(q=>q.t)}));
    const shown=[]; const ch0=GM.choose; GM.choose=async o=>{ if(!shown.length) shown.push(o.map(x=>x.t)); return o.length-1; }; await INV.pickDay(GM,'kexin',P); GM.choose=ch0;
    const days=(shown[0]||[]).slice(0,-1);
    check('2. 「其他日子…」只列週六、週日',days.length>0&&days.every(t=>/（週[六日]）$/.test(t)),J(days));
    check('4. INV.dayOk：可昕週三 false、週六 true；以安都 true',INV.dayOk(G,P,'kexin',G.day)===false&&INV.dayOk(G,P,'kexin',G.day+3)===true&&wd(G,G.day+3)===6&&INV.dayOk(G,P,'heroine_01',G.day)===true); }
  { const G=H.fresh('2025-10-24',10,'campus'); G.visited={corner_records:1};   // 週五
    const kx=INV.timeOptions(G,false,P,'kexin');
    check('3. 週五約可昕：明天（週六）的時間列、今天（週五）的不列',G.weekday===5&&kx.length>0&&kx.every(q=>q.day===G.day+1),J(kx.map(q=>q.t))); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
