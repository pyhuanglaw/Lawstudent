// 轉角唱片：約可昕和大家一樣（AA_941，11-13：原本 AA-B 11-07 的「可昕只排週末」whoDays 是照外校前提寫的，同系同屆以後拿掉；CORNER-IN-1107 原本的四項改成反過來驗）——不需要瀏覽器（D131）。
// 檢查：1 週三約可昕：今天、明天的時間照常列（和以安一樣）；2 INV.dayOk：可昕週三、週六都 true；3 轉角唱片沒有 whoDays.kexin。用法：node tests/corner_kexin_weekend_unit.js
const H=require('./pg_harness.js'); const {check}=H; const J=JSON.stringify;
const P=INVITE_DATA.places.find(p=>p.id==='corner_records');
(async()=>{
  if(!P){ check('0. 轉角唱片是邀約地點',false); H.done(); }
  { const G=H.fresh('2025-10-22',10,'campus'); G.visited={corner_records:1};   // 2025-10-22＝週三
    const kx=INV.timeOptions(G,false,P,'kexin'), an=INV.timeOptions(G,false,P,'heroine_01');
    check('1. 週三約可昕：今天、明天的時間照常列，和以安一樣',G.weekday===3&&kx.length>0&&J(kx.map(q=>[q.day,q.h]))===J(an.map(q=>[q.day,q.h])),J({kx:kx.map(q=>q.t),an:an.map(q=>q.t)}));
    const ok=typeof INV.dayOk==='function'?[INV.dayOk(G,P,'kexin',G.day),INV.dayOk(G,P,'kexin',G.day+3)]:[true,true];
    check('2. 可昕週三、週六都排得到',ok[0]===true&&ok[1]===true,J(ok));
    check('3. 轉角唱片沒有 whoDays.kexin',!(P.whoDays&&P.whoDays.kexin),J(P.whoDays||null)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
