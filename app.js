
const STORAGE='companyScheduleV03';
const people=[['社長','-'],['専務','ハイエース①'],['山田','プロボックス'],['佐藤','ハイエース②'],['鈴木','-']];

const seedTasks=[
{id:'A',date:'2026-09-09',name:'○○食品 現調',type:'現調',project:'PJ-2026-0042',assignee:'社長',vehicle:'-',start:'08:00',end:'10:00',status:'confirmed'},
{id:'B',date:'2026-09-09',name:'社内打合せ',type:'その他',project:'社内',assignee:'社長',vehicle:'-',start:'11:00',end:'12:00',status:'pending'},
{id:'C',date:'2026-09-09',name:'△△食品 商談',type:'商談',project:'PJ-2026-0048',assignee:'社長',vehicle:'-',start:'13:00',end:'15:00',status:'confirmed'},
{id:'D',date:'2026-09-09',name:'□□工業 修理',type:'客先修理',project:'PJ-2026-0051',assignee:'専務',vehicle:'ハイエース①',start:'08:30',end:'12:00',status:'confirmed'},
{id:'E',date:'2026-09-09',name:'見積作成',type:'見積',project:'PJ-2026-0048',assignee:'専務',vehicle:'-',start:'13:00',end:'16:00',status:'provisional'},
{id:'F',date:'2026-09-09',name:'架台組立',type:'社内製作',project:'PJ-2026-0042',assignee:'山田',vehicle:'-',start:'09:00',end:'12:00',status:'confirmed'},
{id:'G',date:'2026-10-14',name:'○○食品 製作',type:'社内製作',project:'PJ-2026-0042',assignee:'山田',vehicle:'-',start:'08:00',end:'17:00',status:'confirmed'},
{id:'H',date:'2026-11-18',name:'○○食品 現地工事',type:'現地工事',project:'PJ-2026-0042',assignee:'山田',vehicle:'プロボックス',start:'08:00',end:'17:00',status:'provisional'},
{id:'I',date:'2026-12-03',name:'△△食品 据付',type:'現地工事',project:'PJ-2026-0048',assignee:'専務',vehicle:'ハイエース①',start:'08:00',end:'17:00',status:'pending'},
];

let tasks=JSON.parse(localStorage.getItem(STORAGE)||'null')||seedTasks;
function save(){localStorage.setItem(STORAGE,JSON.stringify(tasks))}
function statusText(s){return{confirmed:'確定',pending:'確認待ち',provisional:'仮予定',unassigned:'未割当'}[s]}
function pillClass(s){return s==='confirmed'?'bc':s==='pending'?'bp':s==='provisional'?'bv':'bu'}
function num(t){const[a,b]=t.split(':').map(Number);return a+b/60}
function nextId(){for(let c=65;c<=90;c++){let x=String.fromCharCode(c);if(!tasks.some(t=>t.id===x))return x}return'?'}
function barClass(t){if(t.status!=='confirmed')return t.status;if(['社内製作','設計','見積','段取り','整備'].includes(t.type))return'internal';return'confirmed'}
function renderSummary(){
 const c=tasks.filter(t=>t.status==='confirmed').length,p=tasks.filter(t=>t.status==='pending').length,v=tasks.filter(t=>t.status==='provisional').length,u=tasks.filter(t=>t.status==='unassigned'||t.assignee==='未割当').length;
 summary.innerHTML=`<div class=card>確定<br><b>${c}</b></div><div class=card>確認待ち<br><b style="color:#ef4444">${p}</b></div><div class=card>仮予定<br><b style="color:#f59e0b">${v}</b></div><div class=card>未割当<br><b style="color:#ef4444">${u}</b></div>`;
}
function taskPill(t){return `<div class="pill ${t.status}">${t.id} ${t.name}<br><span class=small>${t.assignee} ${t.start}-${t.end}</span></div>`}

function renderYear(){
 const months=[7,8,9,10,11,12];
 let html=`<div class=panel><h3>2026年 年フォーカス</h3><table class=timeline-table><tr><th>案件 / 行事</th>${months.map(m=>`<th>${m}月</th>`).join('')}</tr>`;
 const projects=[...new Set(tasks.map(t=>t.project))];
 projects.forEach(p=>{
   html+=`<tr><td><b>${p}</b></td>`;
   months.forEach(m=>{
     const ts=tasks.filter(t=>t.project===p && Number(t.date.slice(5,7))===m);
     html+=`<td class=monthcell>${ts.map(taskPill).join('')}</td>`;
   });
   html+='</tr>';
 });
 html+='</table></div>';
 year.innerHTML=html;
}

function renderQuarter(){
 const qs=[
  {name:'Q3 7-9月',months:[7,8,9]},
  {name:'Q4 10-12月',months:[10,11,12]}
 ];
 let html='';
 qs.forEach(q=>{
   const ts=tasks.filter(t=>q.months.includes(Number(t.date.slice(5,7))));
   html+=`<div class=panel><h3>${q.name}</h3><table class=tasktable><tr><th>案件</th><th>タスク</th><th>日付</th><th>担当</th><th>状態</th></tr>`;
   ts.forEach(t=>html+=`<tr><td>${t.project}</td><td>${t.id} ${t.name}</td><td>${t.date}</td><td>${t.assignee}</td><td><span class="badge ${pillClass(t.status)} ${t.status}">${statusText(t.status)}</span></td></tr>`);
   html+='</table></div>';
 });
 quarter.innerHTML=html;
}

function renderMonth(){
 const y=2026,m=9,last=new Date(y,m,0).getDate(),first=new Date(y,m-1,1).getDay();
 let cells=''; for(let i=0;i<first;i++)cells+='<div></div>';
 for(let d=1;d<=last;d++){
   const date=`${y}-09-${String(d).padStart(2,'0')}`;
   const ts=tasks.filter(t=>t.date===date);
   cells+=`<div class=daycell><div class=daynum>${d}</div>${ts.map(taskPill).join('')}</div>`;
 }
 month.innerHTML=`<div class=panel><h3>2026年9月 月フォーカス</h3><div class=calendar>${cells}</div></div>`;
}

function renderDay(){
 const date='2026-09-09', dayTasks=tasks.filter(t=>t.date===date);
 let rows=`<div class="grow head"><div class=name>氏名</div><div class=vehicle>車両</div><div class=track>${[7,8,9,10,11,12,13,14,15,16,17].map(h=>`<div class=hour>${h}</div>`).join('')}</div></div>`;
 people.forEach(p=>{
   let bars='';
   dayTasks.filter(t=>t.assignee===p[0]).forEach(t=>{
     const left=((num(t.start)-7)/11)*100,width=((num(t.end)-num(t.start))/11)*100;
     bars+=`<div class="bar ${barClass(t)}" style="left:${left}%;width:${width}%">${t.id} ${t.start}-${t.end} ${t.name}</div>`;
   });
   rows+=`<div class=grow><div class=name><b>${p[0]}</b></div><div class=vehicle>${p[1]}</div><div class=track>${bars}</div></div>`;
 });
 let trs=dayTasks.map((t,i)=>`<tr><td><b>${t.id}</b></td><td>${t.start}-${t.end}</td><td>${t.name}</td><td>${t.project}</td><td>${t.assignee}</td><td>${t.vehicle}</td><td><span class="badge ${pillClass(t.status)} ${t.status}">${statusText(t.status)}</span></td><td><button class=ghost data-id="${t.id}">削除</button></td></tr>`).join('');
 day.innerHTML=`<div class=panel><h3>2026年9月9日 日フォーカス</h3><div class=gantt><div class=gantt-inner>${rows}</div></div><p class=small>点滅しているバーは未完成。前日まで、理想は前週までに点滅を消す。</p></div>
 <div class=daylayout>
 <div class=panel><h3>本日のタスク</h3><table class=tasktable><tr><th>ID</th><th>時間</th><th>タスク</th><th>案件</th><th>担当</th><th>車両</th><th>状態</th><th></th></tr>${trs}</table></div>
 <div class=panel><h3>予定・タスク追加</h3>
 <div class=form>
 <div><label>タスク名</label><input id=fName value="○○食品 現調"></div>
 <div><label>種別</label><select id=fType><option>現調</option><option>客先修理</option><option>商談</option><option>現地工事</option><option>社内製作</option><option>設計</option><option>見積</option><option>段取り</option><option>整備</option><option>その他</option></select></div>
 <div><label>開始</label><select id=fStart>${timeOptions('13:00')}</select></div>
 <div><label>終了</label><select id=fEnd>${timeOptions('16:00')}</select></div>
 <div><label>担当</label><select id=fAssignee>${people.map(p=>`<option>${p[0]}</option>`).join('')}<option>未割当</option></select></div>
 <div><label>車両</label><select id=fVehicle><option>-</option><option>ハイエース①</option><option>ハイエース②</option><option>プロボックス</option><option>軽バン</option></select></div>
 <div><label>案件ID</label><input id=fProject value="PJ-2026-0042"></div>
 <div><label>状態</label><select id=fStatus><option value=confirmed>確定</option><option value=pending>確認待ち</option><option value=provisional>仮予定</option><option value=unassigned>未割当</option></select></div>
 </div><p><button id=addTask class=primary>＋追加</button></p></div></div>`;
 document.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{tasks=tasks.filter(t=>t.id!==b.dataset.id);save();renderAll()});
 addTask.onclick=()=>{
   const t={id:nextId(),date,name:fName.value||'無題',type:fType.value,project:fProject.value||'社内',assignee:fAssignee.value,vehicle:fVehicle.value,start:fStart.value,end:fEnd.value,status:fStatus.value};
   if(num(t.end)<=num(t.start))return alert('終了時刻を開始より後にしてください');
   if(t.assignee==='未割当')t.status='unassigned';
   tasks.push(t);save();renderAll();
 };
}
function timeOptions(selected){
 let s='';for(let h=7;h<=18;h++)for(let m of [0,30]){if(h===18&&m===30)continue;const t=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');s+=`<option ${t===selected?'selected':''}>${t}</option>`}return s
}
function renderAll(){renderSummary();renderYear();renderQuarter();renderMonth();renderDay()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));b.classList.add('active');document.getElementById(b.dataset.view).classList.remove('hidden')});
resetBtn.onclick=()=>{localStorage.removeItem(STORAGE);tasks=[...seedTasks];save();renderAll()};
renderAll();
