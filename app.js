
const PKEY='companyScheduleProjectsV04';
const TKEY='companyScheduleTasksV04';

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

let projects=JSON.parse(localStorage.getItem(PKEY)||'null')||seedProjects;
let tasks=JSON.parse(localStorage.getItem(TKEY)||'null')||seedTasks;

function save(){localStorage.setItem(PKEY,JSON.stringify(projects));localStorage.setItem(TKEY,JSON.stringify(tasks))}
function statusText(s){return{confirmed:'確定',pending:'確認待ち',provisional:'仮予定',unassigned:'未割当'}[s]}
function pillClass(s){return s==='confirmed'?'bc':s==='pending'?'bp':s==='provisional'?'bv':'bu'}
function num(t){const[a,b]=t.split(':').map(Number);return a+b/60}
function nextTaskId(){for(let c=65;c<=90;c++){let x=String.fromCharCode(c);if(!tasks.some(t=>t.id===x))return x}return'?'}
function nextProjectId(){
 let max=0;
 projects.forEach(p=>{const m=p.id.match(/PJ-2026-(\d+)/);if(m)max=Math.max(max,Number(m[1]))});
 return 'PJ-2026-'+String(max+1).padStart(4,'0');
}
function projectById(id){return projects.find(p=>p.id===id)}
function taskClass(t){if(t.status!=='confirmed')return t.status;if(['社内製作','設計','見積','段取り','整備'].includes(t.type))return'internal';return'confirmed'}
function taskPill(t){return `<div class="pill ${t.status}">${t.id} ${t.name}<br><span class=small>${t.assignee} ${t.start}-${t.end}</span></div>`}

function renderSummary(){
 const c=tasks.filter(t=>t.status==='confirmed').length;
 const p=tasks.filter(t=>t.status==='pending').length;
 const v=tasks.filter(t=>t.status==='provisional').length;
 const u=tasks.filter(t=>t.status==='unassigned'||t.assignee==='未割当').length;
 summary.innerHTML=
 `<div class=card>案件数<br><b>${projects.length}</b></div>
  <div class=card>確定予定<br><b>${c}</b></div>
  <div class=card>確認待ち<br><b style="color:#ef4444">${p}</b></div>
  <div class=card>仮予定<br><b style="color:#f59e0b">${v}</b></div>
  <div class=card>未割当<br><b style="color:#ef4444">${u}</b></div>`;
}

function renderProjects(){
 let cards=projects.map(p=>`
  <div class=project-card>
   <h4>${p.id}　${p.customer}</h4>
   <div><b>${p.name}</b> <span class="badge bblue">${p.status}</span></div>
   <div class=small>期間 ${p.start} ～ ${p.deadline} / 予定 ${p.hours}h / ${p.people}名 / 主担当 ${p.owner}</div>
   <div class=small>${p.note||''}</div>
   <div style="margin-top:8px">
    <button class=ghost data-project="${p.id}" data-action="open">この案件で予定追加</button>
    <button class=danger data-project="${p.id}" data-action="delete">削除</button>
   </div>
  </div>`).join('');

 projects.innerHTML=`
 <div class=project-layout>
  <div class=panel>
   <h3>案件台帳</h3>
   ${cards||'<p>案件がありません。</p>'}
  </div>
  <div class=panel>
   <h3>案件を登録</h3>
   <div class=form>
    <div><label>案件ID</label><input id=pId value="${nextProjectId()}"></div>
    <div><label>状態</label><select id=pStatus><option>引合</option><option>見積中</option><option selected>受注</option><option>進行中</option><option>完了</option></select></div>
    <div><label>顧客名</label><input id=pCustomer placeholder="例：○○食品株式会社"></div>
    <div><label>案件名</label><input id=pName placeholder="例：コンベア改造"></div>
    <div><label>開始日</label><input id=pStart type=date value="2026-09-09"></div>
    <div><label>納期</label><input id=pDeadline type=date value="2026-11-30"></div>
    <div><label>予定工数</label><input id=pHours type=number value=80 min=0></div>
    <div><label>必要人員</label><input id=pPeople type=number value=2 min=1></div>
    <div><label>主担当</label><select id=pOwner>${people.map(x=>`<option>${x[0]}</option>`).join('')}</select></div>
    <div><label>備考</label><input id=pNote placeholder="現調、製作、据付など"></div>
   </div>
   <p><button id=addProject class=primary>＋ 案件登録</button></p>
   <p class=small>登録した案件は年・四半期・月の各画面に反映され、日画面の予定登録でも選択できます。</p>
  </div>
 </div>`;

 addProject.onclick=()=>{
   const p={id:pId.value.trim(),customer:pCustomer.value.trim(),name:pName.value.trim(),status:pStatus.value,start:pStart.value,deadline:pDeadline.value,hours:Number(pHours.value||0),people:Number(pPeople.value||1),owner:pOwner.value,note:pNote.value.trim()};
   if(!p.id||!p.customer||!p.name||!p.start||!p.deadline)return alert('案件ID・顧客名・案件名・開始日・納期は必須です');
   if(projects.some(x=>x.id===p.id))return alert('同じ案件IDが既にあります');
   if(p.deadline<p.start)return alert('納期は開始日以降にしてください');
   projects.push(p);save();renderAll();
 };

 document.querySelectorAll('[data-action="delete"]').forEach(b=>b.onclick=()=>{
   if(confirm(`${b.dataset.project} を削除しますか？\n関連予定は残ります。`)){projects=projects.filter(p=>p.id!==b.dataset.project);save();renderAll()}
 });
 document.querySelectorAll('[data-action="open"]').forEach(b=>b.onclick=()=>{
   document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
   document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));
   document.querySelector('[data-view="day"]').classList.add('active');day.classList.remove('hidden');
   setTimeout(()=>{if(window.fProject)fProject.value=b.dataset.project},0);
 });
}

function renderYear(){
 const months=[7,8,9,10,11,12];
 let html=`<div class=panel><h3>2026年 年フォーカス</h3><table class=timeline-table><tr><th>案件</th>${months.map(m=>`<th>${m}月</th>`).join('')}<th>納期</th></tr>`;
 projects.forEach(p=>{
   html+=`<tr><td><b>${p.id}</b><br>${p.customer}<br>${p.name}</td>`;
   months.forEach(m=>{
     const inRange=(new Date(2026,m,0)>=new Date(p.start) && new Date(2026,m-1,1)<=new Date(p.deadline));
     const ts=tasks.filter(t=>t.project===p.id && Number(t.date.slice(5,7))===m);
     html+=`<td class=monthcell>${inRange?`<div class="pill confirmed">${p.status}<br>${p.hours}h / ${p.people}名</div>`:''}${ts.map(taskPill).join('')}</td>`;
   });
   html+=`<td>${p.deadline}</td></tr>`;
 });
 html+='</table></div>';year.innerHTML=html;
}

function renderQuarter(){
 const qs=[{name:'Q3 7-9月',months:[7,8,9]},{name:'Q4 10-12月',months:[10,11,12]}];
 let html='';
 qs.forEach(q=>{
   const qProjects=projects.filter(p=>{
     const sm=Number(p.start.slice(5,7)), dm=Number(p.deadline.slice(5,7));
     return q.months.some(m=>m>=sm&&m<=dm);
   });
   html+=`<div class=panel><h3>${q.name}</h3><table><tr><th>案件</th><th>期間</th><th>予定工数</th><th>必要人員</th><th>主担当</th><th>状態</th><th>未確定予定</th></tr>`;
   qProjects.forEach(p=>{
     const incomplete=tasks.filter(t=>t.project===p.id && t.status!=='confirmed').length;
     html+=`<tr><td><b>${p.id}</b><br>${p.customer}<br>${p.name}</td><td>${p.start}<br>～ ${p.deadline}</td><td>${p.hours}h</td><td>${p.people}名</td><td>${p.owner}</td><td>${p.status}</td><td>${incomplete?`<span class="badge bp pending">${incomplete}件</span>`:'0件'}</td></tr>`;
   });
   html+='</table></div>';
 });
 quarter.innerHTML=html;
}

function renderMonth(){
 const y=2026,m=9,last=new Date(y,m,0).getDate(),first=new Date(y,m-1,1).getDay();
 let cells='';for(let i=0;i<first;i++)cells+='<div></div>';
 for(let d=1;d<=last;d++){
   const date=`${y}-09-${String(d).padStart(2,'0')}`;
   const ts=tasks.filter(t=>t.date===date);
   const starts=projects.filter(p=>p.start===date);
   const deadlines=projects.filter(p=>p.deadline===date);
   cells+=`<div class=daycell><div class=daynum>${d}</div>
     ${starts.map(p=>`<div class="pill confirmed">開始 ${p.id}<br>${p.name}</div>`).join('')}
     ${deadlines.map(p=>`<div class="pill provisional">納期 ${p.id}<br>${p.name}</div>`).join('')}
     ${ts.map(taskPill).join('')}</div>`;
 }
 month.innerHTML=`<div class=panel><h3>2026年9月 月フォーカス</h3><div class=calendar>${cells}</div></div>`;
}

function timeOptions(selected){
 let s='';for(let h=7;h<=18;h++)for(let m of [0,30]){if(h===18&&m===30)continue;const t=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');s+=`<option ${t===selected?'selected':''}>${t}</option>`}return s;
}

function renderDay(){
 const date='2026-09-09',dayTasks=tasks.filter(t=>t.date===date);
 let rows=`<div class="grow head"><div class=name>氏名</div><div class=vehicle>車両</div><div class=track>${[7,8,9,10,11,12,13,14,15,16,17].map(h=>`<div class=hour>${h}</div>`).join('')}</div></div>`;
 people.forEach(p=>{
   let bars='';
   dayTasks.filter(t=>t.assignee===p[0]).forEach(t=>{
     const left=((num(t.start)-7)/11)*100,width=((num(t.end)-num(t.start))/11)*100;
     bars+=`<div class="bar ${taskClass(t)}" style="left:${left}%;width:${width}%">${t.id} ${t.start}-${t.end} ${t.name}</div>`;
   });
   rows+=`<div class=grow><div class=name><b>${p[0]}</b></div><div class=vehicle>${p[1]}</div><div class=track>${bars}</div></div>`;
 });
 let trs=dayTasks.map(t=>`<tr><td><b>${t.id}</b></td><td>${t.start}-${t.end}</td><td>${t.name}</td><td>${t.project}</td><td>${t.assignee}</td><td>${t.vehicle}</td><td><span class="badge ${pillClass(t.status)} ${t.status}">${statusText(t.status)}</span></td><td><button class=ghost data-task="${t.id}">削除</button></td></tr>`).join('');
 const projectOptions=`<option>社内</option>${projects.map(p=>`<option value="${p.id}">${p.id} ${p.customer} ${p.name}</option>`).join('')}`;
 day.innerHTML=`<div class=panel><h3>2026年9月9日 日フォーカス</h3><div class=gantt><div class=gantt-inner>${rows}</div></div><p class=small>点滅＝未完成。前日まで、理想は前週までに点滅を消す。</p></div>
 <div class=daylayout>
  <div class=panel><h3>本日のタスク</h3><table><tr><th>ID</th><th>時間</th><th>タスク</th><th>案件</th><th>担当</th><th>車両</th><th>状態</th><th></th></tr>${trs}</table></div>
  <div class=panel><h3>予定・タスク追加</h3><div class=form>
   <div><label>タスク名</label><input id=fName value="現調"></div>
   <div><label>種別</label><select id=fType><option>現調</option><option>客先修理</option><option>商談</option><option>現地工事</option><option>社内製作</option><option>設計</option><option>見積</option><option>段取り</option><option>整備</option><option>その他</option></select></div>
   <div><label>開始</label><select id=fStart>${timeOptions('13:00')}</select></div>
   <div><label>終了</label><select id=fEnd>${timeOptions('16:00')}</select></div>
   <div><label>担当</label><select id=fAssignee>${people.map(p=>`<option>${p[0]}</option>`).join('')}<option>未割当</option></select></div>
   <div><label>車両</label><select id=fVehicle><option>-</option><option>ハイエース①</option><option>ハイエース②</option><option>プロボックス</option><option>軽バン</option></select></div>
   <div><label>案件</label><select id=fProject>${projectOptions}</select></div>
   <div><label>状態</label><select id=fStatus><option value=confirmed>確定</option><option value=pending>確認待ち</option><option value=provisional>仮予定</option><option value=unassigned>未割当</option></select></div>
  </div><p><button id=addTask class=primary>＋予定追加</button></p></div>
 </div>`;
 document.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>{tasks=tasks.filter(t=>t.id!==b.dataset.task);save();renderAll()});
 addTask.onclick=()=>{
   let project=fProject.value;
   const p=projectById(project);
   const taskName=p ? `${p.customer.replace('株式会社','')} ${fName.value||fType.value}` : (fName.value||fType.value);
   const t={id:nextTaskId(),date,name:taskName,type:fType.value,project,assignee:fAssignee.value,vehicle:fVehicle.value,start:fStart.value,end:fEnd.value,status:fStatus.value};
   if(num(t.end)<=num(t.start))return alert('終了時刻を開始より後にしてください');
   if(t.assignee==='未割当')t.status='unassigned';
   tasks.push(t);save();renderAll();
 };
}

function renderAll(){renderSummary();renderProjects();renderYear();renderQuarter();renderMonth();renderDay()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
 document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));
 b.classList.add('active');document.getElementById(b.dataset.view).classList.remove('hidden');
});
resetBtn.onclick=()=>{localStorage.removeItem(PKEY);localStorage.removeItem(TKEY);projects=[...seedProjects];tasks=[...seedTasks];save();renderAll()};
renderAll();
