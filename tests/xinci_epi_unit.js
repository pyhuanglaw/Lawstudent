// 芯慈交往中的尾聲與畢業禮物（AA_548 第 9 節，取代 AA_537 第 6 節；XINCI-EPI-FEST-1031 前半）——不需要瀏覽器。
//   1 尾聲（PG.epiLine）交往中：「我們每週三還是去巷口家常菜。」「我又點回番茄炒蛋了。……今天想吃的就是它。」；沒交往照舊（工作是國際所）
//   2 畢業禮物：桌上多「（一本她的筆記，最後一頁空白，上面貼著一張便利貼：「這一頁你寫。」）」；沒交往沒有；座位與 CG 不換（epiPartner 不含芯慈）
//   3 禁用句型「不是……是……」那一句不在
// 修改前（開發分支 cbe655915）：1、2 FAIL。用法：node tests/xinci_epi_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check}=H, J=JSON.stringify, XC='classmate_xinci';
const G=H.fresh('2034-06-01',20,'campus',{}); H.FRIEND(XC);
const base=PG.epiLine(G,XC); G.flags['dating_'+XC]=true;
const dat=PG.epiLine(G,XC);
check('1. 尾聲交往中：芯慈「我們每週三還是去巷口家常菜。」「我又點回番茄炒蛋了。……今天想吃的就是它。」',J(dat)===J([[XC,'我們每週三還是去巷口家常菜。'],[XC,'我又點回番茄炒蛋了。……今天想吃的就是它。']]),J(dat));
check('1. 沒交往照舊（國際所那句）',J(base)===J([[XC,'我在國際所做併購。昨天追劇追到三點，今天早上差點起不來。']]),J(base));
const it=PG.epiItems(G); const gift='（一本她的筆記，最後一頁空白，上面貼著一張便利貼：「這一頁你寫。」）';
delete G.flags['dating_'+XC]; const it0=PG.epiItems(G);
check('2. 畢業禮物：交往中桌上多「'+gift+'」；沒交往沒有；epiPartner 不含芯慈（座位、CG 不換）',it.includes(gift)&&!it0.includes(gift)&&PG.epiPartner(Object.assign({},G,{flags:Object.assign({},G.flags,{['dating_'+XC]:true})}))!==XC,J([it,it0]));
const src=fs.readFileSync(path.join(H.ROOT,'src/data/postgrad_lines.js'),'utf8');
check('3. 「不是因為不敢換。是我喜歡。」不在',!/不是因為不敢換/.test(src));
H.done();
