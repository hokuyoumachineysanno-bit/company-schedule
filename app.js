
const $=id=>document.getElementById(id);

const PKEY='companyScheduleProjectsV05';
const TKEY='companyScheduleTasksV05';
const HKEY='companyScheduleHolidaysV05';

const people=[['社長','-'],['専務','ハイエース①'],['山田','プロボックス'],['佐藤','ハイエース②'],['鈴木','-']];

const seedProjects=[
{id:'PJ-2026-0042',customer:'○○食品株式会社',name:'コンベア改造',status:'受注',start:'2026-09-09',deadline:'2026-11-20',hours:120,people:2,owner:'山田',note:'現調→設計→製作→現地工事'},
{id:'PJ-2026-0048',customer:'△△食品株式会社',name:'洗浄機更新',status:'見積中',start:'2026-09-15',deadline:'2026-12-10',hours:240,people:3,owner:'専務',note:'メーカー実機検証あり'}
];
const seedTasks=[
{id:'A',date:'2026-09-09',name:'○○食品 現調',type:'現調',project:'PJ-2026-0042',assignee:'社長',vehicle:'-',start:'08:00',end:'10:00',status:'confirmed'},
{id:'B',date:'2026-09-09',name:'社内打合せ',type:'その他',project:'社内',assignee:'社長',vehicle:'-',start:'11:00',end:'12:00',status:'pending'},
{id:'C',date:'2026-09-09',name:'△△食品 商談',type:'商談',project:'PJ-2026-0048',assignee:'社長',vehicle:'-',start:'13:00',end:'15:00',status:'confirmed'},
{id:'D',date:'2026-09-09',name:'□□工業 修理',type:'客先修理',project:'社内',assignee:'専務',vehicle:'ハイエース①',start:'08:30',end:'12:00',status:'confirmed'},
{id:'E',date:'2026-09-09',name:'見積作成',type:'見積',project:'PJ-2026-0048',assignee:'専務',vehicle:'-',start:'13:00',end:'16:00',status:'provisional'},
{id:'F',date:'2026-09-09',name:'架台組立',type:'社内製作',project:'PJ-2026-0042',assignee:'山田',vehicle:'-',start:'09:00',end:'12:00',status:'confirmed'}
];
const seedHolidays=[
{id:'H1',date:'2026-09-21',type:'statutory',name:'法定休日'},
{id:'H2',date:'2026-09-23',type:'company',name:'所定休日'}
];

let projects=JSON.parse(localStorage.getItem(PKEY)||'null')||seedProjects;
let tasks=JSON.parse(localStorage.getItem(TKEY)||'null')||seedTasks;
let holidays=JSON.parse(localStorage.getItem(HKEY)||'null')||seedHolidays;
let currentDay='2026-09-09';
let currentMonth='2026-09';

function save(){localStorage.setItem(PKEY,JSON.stringify(projects));localStorage.setItem(TKEY,JSON.stringify(tasks));localStorage.setItem(HKEY,JSON.stringify(holidays))}
function statusText(s){return{confirmed:'確定',pending:'確認待ち',provisional:'仮予定',unassigned:'未割当'}[s]}
function pillClass(s){return s==='confirmed'?'bc':s==='pending'?'bp':s==='provisional'?'bv':'bu'}
function num(t){const[a,b]=t.split(':').map(Number);return a+b/60}
function nextTaskId(){for(let c=65;c<=90;c++){let x=String.fromCharCode(c);if(!tasks.some(t=>t.id===x))return x}return'T'+(tasks.length+1)}
function nextProjectId(){let max=0;projects.forEach(p=>{const m=p.id.match(/PJ-2026-(\d+)/);if(m)max=Math.max(max,Number(m[1]))});return'PJ-2026-'+String(max+1).padStart(4,'0')}
function projectById(id){return projects.find(p=>p.id===id)}
function taskClass(t){if(t.status!=='confirmed')return t.status;if(['社内製作','設計','見積','段取り','整備'].includes(t.type))return'internal';return'confirmed'}
function taskPill(t){return `<div class="pill ${t.status}">${t.id} ${t.name}<br><span class=small>${t.assignee} ${t.start}-${t.end}</span></div>`}
function holidayByDate(date){return holidays.filter(h=>h.date===date)}
function dateLabel(date){const d=new Date(date+'T00:00:00');const w=['日','月','火','水','木','金','土'][d.getDay()];return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${w}）`}
function addDays(date,n){const d=new Date(date+'T00:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}

function renderSummary(){
 const c=tasks.filter(t=>t.status==='confirmed').length,p=tasks.filter(t=>t.status==='pending').length,v=tasks.filter(t=>t.status==='provisional').length,u=tasks.filter(t=>t.status==='unassigned'||t.assignee==='未割当').length;
 $('summary').innerHTML=`<div class=card>案件数<br><b>${projects.length}</b></div><div class=card>確定予定<br><b>${c}</b></div><div class=card>確認待ち<br><b style="color:#ef4444">${p}</b></div><div class=card>仮予定<br><b style="color:#f59e0b">${v}</b></div><div class=card>法定休日<br><b>${holidays.filter(h=>h.type==='statutory').length}</b></div><div class=card>所定休日<br><b>${holidays.filter(h=>h.type==='company').length}</b></div>`;
}

function renderProjects(){
 const cards=projects.map(p=>`
 <div class=project-card>
  <h4>${p.id}　${p.customer}</h4>
  <div><b>${p.name}</b> <span class="badge bblue">${p.status}</span></div>
  <div class=small>期間 ${p.start} ～ ${p.deadline} / 予定 ${p.hours}h / ${p.people}名 / 主担当 ${p.owner}</div>
  <div class=small>${p.note||''}</div>
  <div class=project-actions>
   <button class=ghost data-action="edit" data-project="${p.id}">編集</button>
   <button class=ghost data-action="open" data-project="${p.id}">この案件で予定追加</button>
   <button class=danger data-action="delete" data-project="${p.id}">削除</button>
  </div>
 </div>`).join('');
 $('projects').innerHTML=`
 <div class=project-layout>
  <div class=panel><h3>案件台帳</h3>${cards||'<p>案件がありません。</p>'}</div>
  <div class=panel>
   <h3 id=projectFormTitle>案件を登録</h3>
   <input type=hidden id=pEditOriginal>
   <div class=form>
    <div><label>案件ID</label><input id=pId value="${nextProjectId()}"></div>
    <div><label>状態</label><select id=pStatus><option>引合</option><option>見積中</option><option selected>受注</option><option>進行中</option><option>保留</option><option>完了</option></select></div>
    <div><label>顧客名</label><input id=pCustomer placeholder="例：○○食品株式会社"></div>
    <div><label>案件名</label><input id=pName placeholder="例：コンベア改造"></div>
    <div><label>開始日</label><input id=pStart type=date value="${currentDay}"></div>
    <div><label>納期</label><input id=pDeadline type=date value="${addDays(currentDay,30)}"></div>
    <div><label>予定工数</label><input id=pHours type=number value=80 min=0></div>
    <div><label>必要人員</label><input id=pPeople type=number value=2 min=1></div>
    <div><label>主担当</label><select id=pOwner>${people.map(x=>`<option>${x[0]}</option>`).join('')}</select></div>
    <div><label>備考</label><input id=pNote placeholder="現調、製作、据付など"></div>
   </div>
   <p><button id=saveProject class=primary>＋ 案件登録</button> <button id=cancelEdit class=ghost style="display:none">編集取消</button></p>
  </div>
 </div>`;
 $('saveProject').onclick=()=>{
   const p={id:$('pId').value.trim(),customer:$('pCustomer').value.trim(),name:$('pName').value.trim(),status:$('pStatus').value,start:$('pStart').value,deadline:$('pDeadline').value,hours:Number($('pHours').value||0),people:Number($('pPeople').value||1),owner:$('pOwner').value,note:$('pNote').value.trim()};
   if(!p.id||!p.customer||!p.name||!p.start||!p.deadline)return alert('案件ID・顧客名・案件名・開始日・納期は必須です');
   if(p.deadline<p.start)return alert('納期は開始日以降にしてください');
   const original=$('pEditOriginal').value;
   if(original){
     if(p.id!==original && projects.some(x=>x.id===p.id))return alert('同じ案件IDが既にあります');
     const idx=projects.findIndex(x=>x.id===original);
     if(idx>=0){projects[idx]=p;tasks=tasks.map(t=>t.project===original?{...t,project:p.id}:t)}
   }else{
     if(projects.some(x=>x.id===p.id))return alert('同じ案件IDが既にあります');
     projects.push(p);
   }
   save();renderAll();
 };
 $('cancelEdit').onclick=()=>renderProjects();
 document.querySelectorAll('[data-action="edit"]').forEach(b=>b.onclick=()=>{
   const p=projectById(b.dataset.project); if(!p)return;
   $('pEditOriginal').value=p.id; $('pId').value=p.id; $('pStatus').value=p.status; $('pCustomer').value=p.customer; $('pName').value=p.name; $('pStart').value=p.start; $('pDeadline').value=p.deadline; $('pHours').value=p.hours; $('pPeople').value=p.people; $('pOwner').value=p.owner; $('pNote').value=p.note||'';
   $('projectFormTitle').textContent='案件を編集'; $('saveProject').textContent='変更を保存'; $('cancelEdit').style.display='inline-block';
 });
 document.querySelectorAll('[data-action="delete"]').forEach(b=>b.onclick=()=>{if(confirm(`${b.dataset.project} を削除しますか？\n関連予定は残ります。`)){projects=projects.filter(p=>p.id!==b.dataset.project);save();renderAll()}});
 document.querySelectorAll('[data-action="open"]').forEach(b=>b.onclick=()=>{
   showView('day'); setTimeout(()=>{const fp=$('fProject'); if(fp) fp.value=b.dataset.project},0);
 });
}

function renderYear(){
 const months=[7,8,9,10,11,12];
 let html=`<div class=panel><h3>2026年 年フォーカス</h3><table class=timeline-table><tr><th>案件</th>${months.map(m=>`<th>${m}月</th>`).join('')}<th>納期</th></tr>`;
 projects.forEach(p=>{
   html+=`<tr><td><b>${p.id}</b><br>${p.customer}<br>${p.name}</td>`;
   months.forEach(m=>{
     const monthStart=new Date(`2026-${String(m).padStart(2,'0')}-01T00:00:00`), monthEnd=new Date(2026,m,0);
     const active=monthEnd>=new Date(p.start+'T00:00:00') && monthStart<=new Date(p.deadline+'T00:00:00');
     const ts=tasks.filter(t=>t.project===p.id && Number(t.date.slice(5,7))===m);
     html+=`<td class=monthcell>${active?`<div class="pill confirmed">${p.status}<br>${p.hours}h / ${p.people}名</div>`:''}${ts.map(taskPill).join('')}</td>`;
   });
   html+=`<td>${p.deadline}</td></tr>`;
 });
 html+='</table></div>'; $('year').innerHTML=html;
}

function renderQuarter(){
 const qs=[{name:'Q3 7-9月',months:[7,8,9]},{name:'Q4 10-12月',months:[10,11,12]}];
 let html='';
 qs.forEach(q=>{
   const qProjects=projects.filter(p=>{
     const s=new Date(p.start+'T00:00:00'),d=new Date(p.deadline+'T00:00:00');
     return q.months.some(m=>{const ms=new Date(`2026-${String(m).padStart(2,'0')}-01T00:00:00`),me=new Date(2026,m,0);return me>=s&&ms<=d});
   });
   html+=`<div class=panel><h3>${q.name}</h3><table><tr><th>案件</th><th>期間</th><th>予定工数</th><th>必要人員</th><th>主担当</th><th>状態</th><th>未確定予定</th></tr>`;
   qProjects.forEach(p=>{
     const inc=tasks.filter(t=>t.project===p.id&&t.status!=='confirmed').length;
     html+=`<tr><td><b>${p.id}</b><br>${p.customer}<br>${p.name}</td><td>${p.start}<br>～ ${p.deadline}</td><td>${p.hours}h</td><td>${p.people}名</td><td>${p.owner}</td><td>${p.status}</td><td>${inc?`<span class="badge bp pending">${inc}件</span>`:'0件'}</td></tr>`;
   });
   html+='</table></div>';
 });
 $('quarter').innerHTML=html;
}

function renderMonth(){
 const [y,m]=currentMonth.split('-').map(Number),last=new Date(y,m,0).getDate(),first=new Date(y,m-1,1).getDay();
 let cells='';for(let i=0;i<first;i++)cells+='<div></div>';
 for(let d=1;d<=last;d++){
   const date=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
   const ts=tasks.filter(t=>t.date===date), starts=projects.filter(p=>p.start===date), deadlines=projects.filter(p=>p.deadline===date), hs=holidayByDate(date);
   const hcls=hs.some(h=>h.type==='statutory')?'holiday-bg':hs.some(h=>h.type==='company')?'company-bg':'';
   cells+=`<div class="daycell ${hcls}" data-date="${date}"><div class=daynum>${d}</div>
   ${hs.map(h=>`<div class="pill ${h.type==='statutory'?'holiday':'companyHoliday'}">${h.name}</div>`).join('')}
   ${starts.map(p=>`<div class="pill confirmed">開始 ${p.id}<br>${p.name}</div>`).join('')}
   ${deadlines.map(p=>`<div class="pill provisional">納期 ${p.id}<br>${p.name}</div>`).join('')}
   ${ts.map(taskPill).join('')}</div>`;
 }
 $('month').innerHTML=`<div class=panel>
 <div class=daynav><button id=prevMonth class=ghost>← 前月</button><div class=datebox>${y}年${m}月</div><button id=nextMonth class=ghost>翌月 →</button></div>
 <div class=calendar-head>${['日','月','火','水','木','金','土'].map(x=>`<div>${x}</div>`).join('')}</div>
 <div class=calendar>${cells}</div></div>`;
 $('prevMonth').onclick=()=>{const d=new Date(`${currentMonth}-01T00:00:00`);d.setMonth(d.getMonth()-1);currentMonth=d.toISOString().slice(0,7);renderMonth()};
 $('nextMonth').onclick=()=>{const d=new Date(`${currentMonth}-01T00:00:00`);d.setMonth(d.getMonth()+1);currentMonth=d.toISOString().slice(0,7);renderMonth()};
 document.querySelectorAll('[data-date]').forEach(c=>c.onclick=()=>{currentDay=c.dataset.date;showView('day');renderDay()});
}

function timeOptions(selected){
 let s='';for(let h=7;h<=18;h++)for(let m of [0,30]){if(h===18&&m===30)continue;const t=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');s+=`<option ${t===selected?'selected':''}>${t}</option>`}return s;
}

function renderDay(){
 const date=currentDay, dayTasks=tasks.filter(t=>t.date===date), hs=holidayByDate(date);
 let rows=`<div class="grow head"><div class=name>氏名</div><div class=vehicle>車両</div><div class=track>${[7,8,9,10,11,12,13,14,15,16,17].map(h=>`<div class=hour>${h}</div>`).join('')}</div></div>`;
 people.forEach(p=>{
   let bars=''; dayTasks.filter(t=>t.assignee===p[0]).forEach(t=>{const left=((num(t.start)-7)/11)*100,width=((num(t.end)-num(t.start))/11)*100;bars+=`<div class="bar ${taskClass(t)}" style="left:${left}%;width:${width}%">${t.id} ${t.start}-${t.end} ${t.name}</div>`});
   rows+=`<div class=grow><div class=name><b>${p[0]}</b></div><div class=vehicle>${p[1]}</div><div class=track>${bars}</div></div>`;
 });
 let trs=dayTasks.map(t=>`<tr><td><b>${t.id}</b></td><td>${t.start}-${t.end}</td><td>${t.name}</td><td>${t.project}</td><td>${t.assignee}</td><td>${t.vehicle}</td><td><span class="badge ${pillClass(t.status)} ${t.status}">${statusText(t.status)}</span></td><td><button class=ghost data-edit-task="${t.id}">編集</button> <button class=ghost data-task="${t.id}">削除</button></td></tr>`).join('');
 const projectOptions=`<option>社内</option>${projects.map(p=>`<option value="${p.id}">${p.id} ${p.customer} ${p.name}</option>`).join('')}`;
 const holidayBanner=hs.map(h=>`<div class="holiday-banner ${h.type==='statutory'?'stat':'company'}">${h.name}</div>`).join('');
 $('day').innerHTML=`<div class=panel>
 <div class=daynav><button id=prevDay class=ghost>← 前日</button><div class=datebox>${dateLabel(date)}</div><button id=nextDay class=ghost>翌日 →</button></div>
 ${holidayBanner}
 <h3>人員タイムバー</h3><div class=gantt><div class=gantt-inner>${rows}</div></div><p class=small>点滅＝未完成。前日まで、理想は前週までに点滅を消す。</p></div>
 <div class=daylayout>
  <div class=panel><h3>この日のタスク</h3><table><tr><th>ID</th><th>時間</th><th>タスク</th><th>案件</th><th>担当</th><th>車両</th><th>状態</th><th></th></tr>${trs}</table></div>
  <div class=panel><h3 id=taskFormTitle>予定・タスク追加</h3><input type=hidden id=fEditTask><div class=form>
   <div><label>タスク名</label><input id=fName value="現調"></div><div><label>種別</label><select id=fType><option>現調</option><option>客先修理</option><option>商談</option><option>現地工事</option><option>社内製作</option><option>設計</option><option>見積</option><option>段取り</option><option>整備</option><option>その他</option></select></div>
   <div><label>開始</label><select id=fStart>${timeOptions('13:00')}</select></div><div><label>終了</label><select id=fEnd>${timeOptions('16:00')}</select></div>
   <div><label>担当</label><select id=fAssignee>${people.map(p=>`<option>${p[0]}</option>`).join('')}<option>未割当</option></select></div>
   <div><label>車両</label><select id=fVehicle><option>-</option><option>ハイエース①</option><option>ハイエース②</option><option>プロボックス</option><option>軽バン</option></select></div>
   <div><label>案件</label><select id=fProject>${projectOptions}</select></div><div><label>状態</label><select id=fStatus><option value=confirmed>確定</option><option value=pending>確認待ち</option><option value=provisional>仮予定</option><option value=unassigned>未割当</option></select></div>
  </div><p><button id=addTask class=primary>＋予定追加</button> <button id=cancelTaskEdit class=ghost style="display:none">編集取消</button></p></div>
 </div>`;
 $('prevDay').onclick=()=>{currentDay=addDays(currentDay,-1);renderDay()};
 $('nextDay').onclick=()=>{currentDay=addDays(currentDay,1);renderDay()};
 document.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>{tasks=tasks.filter(t=>t.id!==b.dataset.task);save();renderAll();showView('day')});
 document.querySelectorAll('[data-edit-task]').forEach(b=>b.onclick=()=>{
   const t=tasks.find(x=>x.id===b.dataset.editTask);
   if(!t)return;
   $('fEditTask').value=t.id;
   $('fName').value=t.name;
   $('fType').value=t.type;
   $('fStart').value=t.start;
   $('fEnd').value=t.end;
   $('fAssignee').value=t.assignee;
   $('fVehicle').value=t.vehicle;
   $('fProject').value=t.project;
   $('fStatus').value=t.status;
   $('taskFormTitle').textContent='予定・タスク編集';
   $('addTask').textContent='変更を保存';
   $('cancelTaskEdit').style.display='inline-block';
 });
 $('cancelTaskEdit').onclick=()=>renderDay();
 $('addTask').onclick=()=>{
   let project=$('fProject').value,p=projectById(project),rawName=$('fName').value||$('fType').value;
   let taskName=rawName;
   if(p && !rawName.includes(p.customer.replace('株式会社',''))) taskName=`${p.customer.replace('株式会社','')} ${rawName}`;
   let t={id:$('fEditTask').value||nextTaskId(),date:currentDay,name:taskName,type:$('fType').value,project,assignee:$('fAssignee').value,vehicle:$('fVehicle').value,start:$('fStart').value,end:$('fEnd').value,status:$('fStatus').value};
   if(num(t.end)<=num(t.start))return alert('終了時刻を開始より後にしてください');
   if(t.assignee==='未割当')t.status='unassigned';
   if($('fEditTask').value){
     const idx=tasks.findIndex(x=>x.id===$('fEditTask').value);
     if(idx>=0) tasks[idx]=t;
   }else{
     tasks.push(t);
   }
   save();renderAll();showView('day');
 };
}

function renderHolidays(){
 $('holidays').innerHTML=`<div class=project-layout>
  <div class=panel><h3>休日一覧</h3><table><tr><th>日付</th><th>区分</th><th>名称</th><th></th></tr>
   ${holidays.map(h=>`<tr><td>${h.date}</td><td><span class="badge ${h.type==='statutory'?'bholiday':'bcompany'}">${h.type==='statutory'?'法定休日':'所定休日'}</span></td><td>${h.name}</td><td><button class=ghost data-h="${h.id}">削除</button></td></tr>`).join('')}
  </table></div>
  <div class=panel><h3>休日を追加</h3><div class=form>
   <div><label>日付</label><input id=hDate type=date value="${currentDay}"></div>
   <div><label>区分</label><select id=hType><option value=statutory>法定休日</option><option value=company>所定休日</option></select></div>
   <div><label>名称</label><input id=hName value="法定休日"></div>
  </div><p><button id=addHoliday class=primary>＋休日追加</button></p>
  <p class=small>追加した休日は月・日フォーカスへ反映されます。</p></div>
 </div>`;
 $('addHoliday').onclick=()=>{if(!$('hDate').value)return alert('日付を選択してください');const exists=holidays.some(h=>h.date===$('hDate').value&&h.type===$('hType').value);if(exists)return alert('同じ日付・区分の休日が既にあります');holidays.push({id:'H'+Date.now(),date:$('hDate').value,type:$('hType').value,name:$('hName').value|| ($('hType').value==='statutory'?'法定休日':'所定休日')});save();renderAll();showView('holidays')};
 document.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{holidays=holidays.filter(h=>h.id!==b.dataset.h);save();renderAll();showView('holidays')});
 $('hType').onchange=()=>{$('hName').value=$('hType').value==='statutory'?'法定休日':'所定休日'};
}

function showView(name){
 document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===name));
 document.querySelectorAll('.view').forEach(x=>x.classList.toggle('hidden',x.id!==name));
}
function renderAll(){renderSummary();renderProjects();renderYear();renderQuarter();renderMonth();renderDay();renderHolidays()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showView(b.dataset.view));
$('resetBtn').onclick=()=>{localStorage.removeItem(PKEY);localStorage.removeItem(TKEY);localStorage.removeItem(HKEY);projects=[...seedProjects];tasks=[...seedTasks];holidays=[...seedHolidays];currentDay='2026-09-09';currentMonth='2026-09';save();renderAll();showView('projects')};
renderAll();
