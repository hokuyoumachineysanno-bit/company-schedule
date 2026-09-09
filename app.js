
const $=id=>document.getElementById(id);
const KEY='companyPortalV06';

const seed={
 employees:[
  {id:'EMP-001',name:'社長',role:'社長',active:true,attendance:true,start:'08:00',end:'17:00',order:1},
  {id:'EMP-002',name:'専務',role:'専務',active:true,attendance:true,start:'08:00',end:'17:00',order:2},
  {id:'EMP-003',name:'山田',role:'社員',active:true,attendance:true,start:'08:00',end:'17:00',order:3},
  {id:'EMP-004',name:'佐藤',role:'社員',active:true,attendance:true,start:'08:00',end:'17:00',order:4},
  {id:'EMP-005',name:'鈴木',role:'社員',active:true,attendance:true,start:'08:00',end:'17:00',order:5}
 ],
 vehicles:[
  {id:'CAR-001',name:'ハイエース①',type:'ハイエース',number:'富山100 あ 1234',active:true,note:''},
  {id:'CAR-002',name:'ハイエース②',type:'ハイエース',number:'富山100 あ 5678',active:true,note:''},
  {id:'CAR-003',name:'プロボックス',type:'プロボックス',number:'富山500 い 1111',active:true,note:''}
 ],
 customers:[
  {id:'CUS-001',name:'○○食品株式会社',short:'○○食品',address:'富山県',contact:'田中様',phone:'',active:true},
  {id:'CUS-002',name:'△△食品株式会社',short:'△△食品',address:'石川県',contact:'佐々木様',phone:'',active:true}
 ],
 projects:[
  {id:'PJ-2026-0042',customerId:'CUS-001',name:'コンベア改造',status:'受注',start:'2026-09-09',deadline:'2026-11-20',hours:120,people:2,ownerId:'EMP-003',note:'現調→設計→製作→現地工事'},
  {id:'PJ-2026-0048',customerId:'CUS-002',name:'洗浄機更新',status:'見積中',start:'2026-09-15',deadline:'2026-12-10',hours:240,people:3,ownerId:'EMP-002',note:'メーカー実機検証あり'}
 ],
 tasks:[
  {id:'A',date:'2026-09-09',name:'現調',type:'現調',projectId:'PJ-2026-0042',employeeId:'EMP-001',vehicleId:'',start:'08:00',end:'10:00',status:'confirmed'},
  {id:'B',date:'2026-09-09',name:'社内打合せ',type:'その他',projectId:'',employeeId:'EMP-001',vehicleId:'',start:'11:00',end:'12:00',status:'pending'},
  {id:'C',date:'2026-09-09',name:'商談',type:'商談',projectId:'PJ-2026-0048',employeeId:'EMP-001',vehicleId:'',start:'13:00',end:'15:00',status:'confirmed'},
  {id:'D',date:'2026-09-09',name:'客先修理',type:'客先修理',projectId:'',employeeId:'EMP-002',vehicleId:'CAR-001',start:'08:30',end:'12:00',status:'confirmed'},
  {id:'E',date:'2026-09-09',name:'見積作成',type:'見積',projectId:'PJ-2026-0048',employeeId:'EMP-002',vehicleId:'',start:'13:00',end:'16:00',status:'provisional'},
  {id:'F',date:'2026-09-09',name:'架台組立',type:'社内製作',projectId:'PJ-2026-0042',employeeId:'EMP-003',vehicleId:'',start:'09:00',end:'12:00',status:'confirmed'}
 ],
 holidays:[
  {id:'H1',date:'2026-09-13',type:'statutory',name:'法定休日'},
  {id:'H2',date:'2026-09-19',type:'company',name:'所定休日'},
  {id:'H3',date:'2026-09-20',type:'statutory',name:'法定休日'}
 ],
 attendance:[
  {employeeId:'EMP-001',date:'2026-09-09',type:'出勤',work:8.5,overtime:0.5,paidLeave:0},
  {employeeId:'EMP-002',date:'2026-09-09',type:'出勤',work:9.0,overtime:1.0,paidLeave:0},
  {employeeId:'EMP-003',date:'2026-09-09',type:'出勤',work:8.0,overtime:0,paidLeave:0},
  {employeeId:'EMP-004',date:'2026-09-09',type:'有休',work:0,overtime:0,paidLeave:1},
  {employeeId:'EMP-005',date:'2026-09-09',type:'出勤',work:8.0,overtime:0,paidLeave:0}
 ],
 attendanceSummary:[
  {employeeId:'EMP-001',annualHolidays:110,holidaysTaken:71,paidLeaveTaken:3,annualWork:1450,overtime:185,agreementPct:51},
  {employeeId:'EMP-002',annualHolidays:110,holidaysTaken:69,paidLeaveTaken:2,annualWork:1510,overtime:218,agreementPct:61},
  {employeeId:'EMP-003',annualHolidays:110,holidaysTaken:75,paidLeaveTaken:4,annualWork:1420,overtime:146,agreementPct:41},
  {employeeId:'EMP-004',annualHolidays:110,holidaysTaken:78,paidLeaveTaken:5,annualWork:1390,overtime:98,agreementPct:27},
  {employeeId:'EMP-005',annualHolidays:110,holidaysTaken:80,paidLeaveTaken:3,annualWork:1370,overtime:86,agreementPct:24}
 ]
};

let db=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(seed);
let currentDay='2026-09-09';
let currentMonth='2026-09';
let masterType='employees';

function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function emp(id){return db.employees.find(x=>x.id===id)}
function veh(id){return db.vehicles.find(x=>x.id===id)}
function cust(id){return db.customers.find(x=>x.id===id)}
function proj(id){return db.projects.find(x=>x.id===id)}
function empName(id){return emp(id)?.name||'未割当'}
function vehName(id){return veh(id)?.name||'-'}
function custName(id){return cust(id)?.name||''}
function projectLabel(id){const p=proj(id);return p?`${p.id} ${cust(p.customerId)?.short||custName(p.customerId)} ${p.name}`:'社内'}
function statusText(s){return{confirmed:'確定',pending:'確認待ち',provisional:'仮予定',unassigned:'未割当'}[s]}
function statusBadge(s){return s==='confirmed'?'bc':s==='pending'?'bp':s==='provisional'?'bv':'bu'}
function taskClass(t){if(t.status!=='confirmed')return t.status;if(['社内製作','設計','見積','段取り','整備'].includes(t.type))return'internal';return'confirmed'}
function timeNum(t){const[a,b]=t.split(':').map(Number);return a+b/60}
function nextTaskId(){for(let c=65;c<=90;c++){const x=String.fromCharCode(c);if(!db.tasks.some(t=>t.id===x))return x}return'T'+(db.tasks.length+1)}
function addDays(date,n){const d=new Date(date+'T00:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function dateLabel(date){const d=new Date(date+'T00:00:00'),w=['日','月','火','水','木','金','土'][d.getDay()];return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${w}）`}
function showView(name){document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===name));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('hidden',x.id!==name))}
function activeEmployees(){return db.employees.filter(x=>x.active).sort((a,b)=>a.order-b.order)}
function timeOptions(sel){let s='';for(let h=7;h<=18;h++)for(let m of [0,30]){if(h===18&&m===30)continue;const t=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');s+=`<option ${t===sel?'selected':''}>${t}</option>`}return s}

function renderSummary(){
 const p=db.tasks.filter(t=>t.status==='pending').length,v=db.tasks.filter(t=>t.status==='provisional').length;
 $('summary').innerHTML=`
 <div class=card>進行案件<br><b>${db.projects.filter(p=>p.status!=='完了').length}</b></div>
 <div class=card>社員<br><b>${db.employees.filter(x=>x.active).length}</b></div>
 <div class=card>車両<br><b>${db.vehicles.filter(x=>x.active).length}</b></div>
 <div class=card>顧客<br><b>${db.customers.filter(x=>x.active).length}</b></div>
 <div class=card>確認待ち<br><b style="color:#ef4444">${p}</b></div>
 <div class=card>仮予定<br><b style="color:#f59e0b">${v}</b></div>`;
}

function renderDashboard(){
 const incomplete=db.tasks.filter(t=>t.status!=='confirmed').length;
 const upcoming=db.projects.filter(p=>p.status!=='完了').sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,5);
 const avgOt=Math.round(db.attendanceSummary.reduce((a,x)=>a+x.overtime,0)/db.attendanceSummary.length);
 $('dashboard').innerHTML=`
 <div class=grid3>
  <div class=panel><h3>予定の完成度</h3><div class=kpirow>
   <div class=kpi><span class=small>未確定</span><br><strong>${incomplete}</strong>件</div>
   <div class=kpi><span class=small>今週の点滅</span><br><strong>${db.tasks.filter(t=>t.status!=='confirmed'&&t.date>='2026-09-07'&&t.date<='2026-09-13').length}</strong>件</div>
  </div><p class=small>前日まで、理想は前週までに点滅をゼロへ。</p></div>
  <div class=panel><h3>労務サマリー</h3><div class=kpirow>
   <div class=kpi><span class=small>平均年間時間外</span><br><strong>${avgOt}</strong>h</div>
   <div class=kpi><span class=small>36協定 最大進捗</span><br><strong>${Math.max(...db.attendanceSummary.map(x=>x.agreementPct))}</strong>%</div>
  </div></div>
  <div class=panel><h3>マスタ</h3><p>社員 ${db.employees.length} / 車両 ${db.vehicles.length} / 顧客 ${db.customers.length}</p><button class=primary onclick="masterType='employees';renderMasters();showView('masters')">マスタを開く</button></div>
 </div>
 <div class=panel><h3>直近の案件</h3><div class=tablewrap><table><tr><th>案件</th><th>顧客</th><th>納期</th><th>予定工数</th><th>主担当</th><th>状態</th></tr>
 ${upcoming.map(p=>`<tr><td><b>${p.id}</b><br>${p.name}</td><td>${custName(p.customerId)}</td><td>${p.deadline}</td><td>${p.hours}h</td><td>${empName(p.ownerId)}</td><td>${p.status}</td></tr>`).join('')}
 </table></div></div>`;
}

function renderProjects(){
 const cards=db.projects.map(p=>`<div class=project-card>
 <h4>${p.id}　${custName(p.customerId)}</h4><div><b>${p.name}</b> <span class="badge bblue">${p.status}</span></div>
 <div class=small>${p.start} ～ ${p.deadline} / ${p.hours}h / ${p.people}名 / 主担当 ${empName(p.ownerId)}</div><div class=small>${p.note||''}</div>
 <div class=actions><button class=ghost data-pe="${p.id}">編集</button><button class=ghost data-po="${p.id}">この案件で予定</button><button class=danger data-pd="${p.id}">削除</button></div></div>`).join('');
 const cid=db.customers.filter(x=>x.active).map(x=>`<option value="${x.id}">${x.id} ${x.name}</option>`).join('');
 const eid=activeEmployees().map(x=>`<option value="${x.id}">${x.name}</option>`).join('');
 const next=(()=>{let m=0;db.projects.forEach(p=>{const a=p.id.match(/PJ-2026-(\d+)/);if(a)m=Math.max(m,+a[1])});return'PJ-2026-'+String(m+1).padStart(4,'0')})();
 $('projects').innerHTML=`<div class=grid2><div class=panel><h3>案件台帳</h3>${cards}</div><div class=panel>
 <h3 id=pFormTitle>案件登録</h3><input type=hidden id=pOrig>
 <div class=form><div><label>案件ID</label><input id=pId value="${next}"></div><div><label>状態</label><select id=pStatus><option>引合</option><option>見積中</option><option selected>受注</option><option>進行中</option><option>保留</option><option>完了</option></select></div>
 <div><label>顧客</label><select id=pCustomer>${cid}</select></div><div><label>案件名</label><input id=pName></div>
 <div><label>開始日</label><input id=pStart type=date value="${currentDay}"></div><div><label>納期</label><input id=pDeadline type=date value="${addDays(currentDay,30)}"></div>
 <div><label>予定工数</label><input id=pHours type=number value=80></div><div><label>必要人員</label><input id=pPeople type=number value=2></div>
 <div><label>主担当</label><select id=pOwner>${eid}</select></div><div><label>備考</label><input id=pNote></div></div>
 <p><button id=pSave class=primary>＋案件登録</button> <button id=pCancel class=ghost style="display:none">取消</button></p></div></div>`;
 $('pSave').onclick=()=>{const p={id:$('pId').value.trim(),customerId:$('pCustomer').value,name:$('pName').value.trim(),status:$('pStatus').value,start:$('pStart').value,deadline:$('pDeadline').value,hours:+$('pHours').value||0,people:+$('pPeople').value||1,ownerId:$('pOwner').value,note:$('pNote').value.trim()};if(!p.id||!p.name)return alert('案件IDと案件名は必須です');const o=$('pOrig').value;if(o){const i=db.projects.findIndex(x=>x.id===o);db.projects[i]=p;db.tasks.forEach(t=>{if(t.projectId===o)t.projectId=p.id})}else{if(db.projects.some(x=>x.id===p.id))return alert('案件IDが重複しています');db.projects.push(p)}save();renderAll();showView('projects')};
 $('pCancel').onclick=()=>renderProjects();
 document.querySelectorAll('[data-pe]').forEach(b=>b.onclick=()=>{const p=proj(b.dataset.pe);$('pOrig').value=p.id;$('pId').value=p.id;$('pStatus').value=p.status;$('pCustomer').value=p.customerId;$('pName').value=p.name;$('pStart').value=p.start;$('pDeadline').value=p.deadline;$('pHours').value=p.hours;$('pPeople').value=p.people;$('pOwner').value=p.ownerId;$('pNote').value=p.note||'';$('pFormTitle').textContent='案件編集';$('pSave').textContent='変更を保存';$('pCancel').style.display='inline-block'});
 document.querySelectorAll('[data-pd]').forEach(b=>b.onclick=()=>{if(confirm('案件を削除しますか？')){db.projects=db.projects.filter(x=>x.id!==b.dataset.pd);save();renderAll();showView('projects')}});
 document.querySelectorAll('[data-po]').forEach(b=>b.onclick=()=>{showView('day');setTimeout(()=>{const e=$('tProject');if(e)e.value=b.dataset.po},0)});
}

function renderYear(){
 const months=[7,8,9,10,11,12];
 let rows=db.projects.map(p=>`<tr><td><b>${p.id}</b><br>${cust(p.customerId)?.short||custName(p.customerId)}<br>${p.name}</td>${months.map(m=>{const ms=new Date(`2026-${String(m).padStart(2,'0')}-01`),me=new Date(2026,m,0),active=me>=new Date(p.start)&&ms<=new Date(p.deadline),ts=db.tasks.filter(t=>t.projectId===p.id&&+t.date.slice(5,7)===m);return`<td>${active?`<div class="pill confirmed">${p.status}<br>${p.hours}h/${p.people}名</div>`:''}${ts.map(t=>`<div class="pill ${t.status}">${t.id} ${t.name}</div>`).join('')}</td>`}).join('')}<td>${p.deadline}</td></tr>`).join('');
 let labor=db.attendanceSummary.map(x=>`<tr><td>${empName(x.employeeId)}</td><td>${x.holidaysTaken}/${x.annualHolidays}</td><td>${x.paidLeaveTaken}</td><td>${x.annualWork}h</td><td>${x.overtime}h</td><td>${x.agreementPct}%</td></tr>`).join('');
 $('year').innerHTML=`<div class=grid2><div class=panel><h3>年間案件</h3><div class=tablewrap><table><tr><th>案件</th>${months.map(m=>`<th>${m}月</th>`).join('')}<th>納期</th></tr>${rows}</table></div></div>
 <div class=panel><h3>年間労務</h3><div class=tablewrap><table><tr><th>社員</th><th>休日</th><th>有休</th><th>就労</th><th>時間外</th><th>36協定</th></tr>${labor}</table></div><p class=small>※現状は勤怠v8.0の連携先を模したサンプル値。</p></div></div>`;
}

function renderQuarter(){
 const qs=[['Q3 7-9月',[7,8,9]],['Q4 10-12月',[10,11,12]]];
 $('quarter').innerHTML=qs.map(([name,months])=>`<div class=panel><h3>${name}</h3><div class=tablewrap><table><tr><th>案件</th><th>期間</th><th>工数</th><th>人員</th><th>主担当</th><th>未確定</th></tr>${db.projects.filter(p=>months.some(m=>{const ms=new Date(`2026-${String(m).padStart(2,'0')}-01`),me=new Date(2026,m,0);return me>=new Date(p.start)&&ms<=new Date(p.deadline)})).map(p=>`<tr><td><b>${p.id}</b><br>${custName(p.customerId)}<br>${p.name}</td><td>${p.start}<br>～${p.deadline}</td><td>${p.hours}h</td><td>${p.people}名</td><td>${empName(p.ownerId)}</td><td>${db.tasks.filter(t=>t.projectId===p.id&&t.status!=='confirmed').length}</td></tr>`).join('')}</table></div></div>`).join('');
}

function renderMonth(){
 const [y,m]=currentMonth.split('-').map(Number),last=new Date(y,m,0).getDate(),first=new Date(y,m-1,1).getDay();
 let cells='';for(let i=0;i<first;i++)cells+='<div></div>';
 for(let d=1;d<=last;d++){const date=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,hs=db.holidays.filter(h=>h.date===date),ts=db.tasks.filter(t=>t.date===date),leaves=db.attendance.filter(a=>a.date===date&&a.type!=='出勤');const cls=hs.some(h=>h.type==='statutory')?'holiday-bg':hs.length?'company-bg':'';cells+=`<div class="daycell ${cls}" data-date="${date}"><div class=daynum>${d}</div>${hs.map(h=>`<div class="pill ${h.type==='statutory'?'holiday':'companyHoliday'}">${h.name}</div>`).join('')}${leaves.map(a=>`<div class="pill companyHoliday">${empName(a.employeeId)} ${a.type}</div>`).join('')}${ts.map(t=>`<div class="pill ${t.status}">${t.id} ${t.name}<br>${empName(t.employeeId)}</div>`).join('')}</div>`}
 $('month').innerHTML=`<div class=panel><div class=daynav><button id=mPrev class=ghost>←前月</button><div class=datebox>${y}年${m}月</div><button id=mNext class=ghost>翌月→</button></div><div class=calendar-scroll><div class=calendar-head>${['日','月','火','水','木','金','土'].map(x=>`<div>${x}</div>`).join('')}</div><div class=calendar>${cells}</div></div></div>`;
 $('mPrev').onclick=()=>{const d=new Date(currentMonth+'-01');d.setMonth(d.getMonth()-1);currentMonth=d.toISOString().slice(0,7);renderMonth()};$('mNext').onclick=()=>{const d=new Date(currentMonth+'-01');d.setMonth(d.getMonth()+1);currentMonth=d.toISOString().slice(0,7);renderMonth()};
 document.querySelectorAll('[data-date]').forEach(c=>c.onclick=()=>{currentDay=c.dataset.date;renderDay();showView('day')});
}

function renderDay(){
 const ts=db.tasks.filter(t=>t.date===currentDay),hs=db.holidays.filter(h=>h.date===currentDay),attendance=db.attendance.filter(a=>a.date===currentDay);
 let rows=`<div class="grow head"><div class=gname>氏名</div><div class=gvehicle>車両</div><div class=track>${[7,8,9,10,11,12,13,14,15,16,17].map(h=>`<div class=hour>${h}</div>`).join('')}</div></div>`;
 activeEmployees().forEach(e=>{let bars='';const a=attendance.find(x=>x.employeeId===e.id);if(a&&a.type!=='出勤')bars+=`<div class="bar leave" style="left:9.09%;width:81.8%">${a.type}</div>`;ts.filter(t=>t.employeeId===e.id).forEach(t=>{const l=((timeNum(t.start)-7)/11)*100,w=((timeNum(t.end)-timeNum(t.start))/11)*100;bars+=`<div class="bar ${taskClass(t)}" style="left:${l}%;width:${w}%">${t.id} ${t.start}-${t.end} ${t.name}</div>`});const car=ts.find(t=>t.employeeId===e.id&&t.vehicleId)?.vehicleId||'';rows+=`<div class=grow><div class=gname><b>${e.name}</b></div><div class=gvehicle>${vehName(car)}</div><div class=track>${bars}</div></div>`});
 const projectOpts='<option value="">社内</option>'+db.projects.filter(p=>p.status!=='完了').map(p=>`<option value="${p.id}">${projectLabel(p.id)}</option>`).join('');
 const empOpts=activeEmployees().map(e=>`<option value="${e.id}">${e.name}</option>`).join('');
 const carOpts='<option value="">-</option>'+db.vehicles.filter(v=>v.active).map(v=>`<option value="${v.id}">${v.name}</option>`).join('');
 const tr=ts.map(t=>`<tr><td><b>${t.id}</b></td><td>${t.start}-${t.end}</td><td>${t.name}</td><td>${projectLabel(t.projectId)}</td><td>${empName(t.employeeId)}</td><td>${vehName(t.vehicleId)}</td><td><span class="badge ${statusBadge(t.status)} ${t.status}">${statusText(t.status)}</span></td><td><button class=ghost data-te="${t.id}">編集</button> <button class=ghost data-td="${t.id}">削除</button></td></tr>`).join('');
 $('day').innerHTML=`<div class=panel><div class=daynav><button id=dPrev class=ghost>←前日</button><div class=datebox>${dateLabel(currentDay)}</div><button id=dNext class=ghost>翌日→</button></div>${hs.map(h=>`<div class="banner ${h.type==='statutory'?'stat':'company'}">${h.name}</div>`).join('')}<h3>人員タイムバー</h3><div class=gantt><div class=gantt-inner>${rows}</div></div><p class=small>点滅＝未完成。紫＝勤怠側の休暇。</p></div>
 <div class=grid2><div class=panel><h3>この日のタスク</h3><div class=tablewrap><table><tr><th>ID</th><th>時間</th><th>タスク</th><th>案件</th><th>担当</th><th>車両</th><th>状態</th><th></th></tr>${tr}</table></div></div>
 <div class=panel><h3 id=tFormTitle>タスク追加</h3><input type=hidden id=tOrig><div class=form><div><label>タスク名</label><input id=tName value="現調"></div><div><label>種別</label><select id=tType><option>現調</option><option>客先修理</option><option>商談</option><option>現地工事</option><option>社内製作</option><option>設計</option><option>見積</option><option>段取り</option><option>整備</option><option>その他</option></select></div><div><label>開始</label><select id=tStart>${timeOptions('13:00')}</select></div><div><label>終了</label><select id=tEnd>${timeOptions('16:00')}</select></div><div><label>担当</label><select id=tEmployee>${empOpts}</select></div><div><label>車両</label><select id=tVehicle>${carOpts}</select></div><div><label>案件</label><select id=tProject>${projectOpts}</select></div><div><label>状態</label><select id=tStatus><option value=confirmed>確定</option><option value=pending>確認待ち</option><option value=provisional>仮予定</option><option value=unassigned>未割当</option></select></div></div><p><button id=tSave class=primary>＋追加</button> <button id=tCancel class=ghost style="display:none">取消</button></p></div></div>`;
 $('dPrev').onclick=()=>{currentDay=addDays(currentDay,-1);renderDay()};$('dNext').onclick=()=>{currentDay=addDays(currentDay,1);renderDay()};
 $('tSave').onclick=()=>{let t={id:$('tOrig').value||nextTaskId(),date:currentDay,name:$('tName').value.trim()||$('tType').value,type:$('tType').value,projectId:$('tProject').value,employeeId:$('tEmployee').value,vehicleId:$('tVehicle').value,start:$('tStart').value,end:$('tEnd').value,status:$('tStatus').value};if(timeNum(t.end)<=timeNum(t.start))return alert('終了時刻を確認してください');if($('tOrig').value){db.tasks[db.tasks.findIndex(x=>x.id===$('tOrig').value)]=t}else db.tasks.push(t);save();renderAll();showView('day')};
 $('tCancel').onclick=()=>renderDay();
 document.querySelectorAll('[data-te]').forEach(b=>b.onclick=()=>{const t=db.tasks.find(x=>x.id===b.dataset.te);$('tOrig').value=t.id;$('tName').value=t.name;$('tType').value=t.type;$('tStart').value=t.start;$('tEnd').value=t.end;$('tEmployee').value=t.employeeId;$('tVehicle').value=t.vehicleId;$('tProject').value=t.projectId;$('tStatus').value=t.status;$('tFormTitle').textContent='タスク編集';$('tSave').textContent='変更を保存';$('tCancel').style.display='inline-block'});
 document.querySelectorAll('[data-td]').forEach(b=>b.onclick=()=>{db.tasks=db.tasks.filter(x=>x.id!==b.dataset.td);save();renderAll();showView('day')});
}

function renderAttendance(){
 const rows=db.attendanceSummary.map(x=>`<tr><td>${empName(x.employeeId)}</td><td>${x.holidaysTaken}/${x.annualHolidays}</td><td>${x.paidLeaveTaken}</td><td>${x.annualWork}h</td><td>${x.overtime}h</td><td>${x.agreementPct}%</td></tr>`).join('');
 $('attendance').innerHTML=`<div class="banner info">勤怠管理 v8.0 連携イメージ：会社カレンダー・社員ID・年間就労・時間外・有休・36協定進捗をこの画面へ取り込む。</div>
 <div class=panel><h3>勤怠サマリー</h3><div class=tablewrap><table><tr><th>社員</th><th>休日取得</th><th>有休</th><th>年間就労</th><th>時間外</th><th>36協定</th></tr>${rows}</table></div></div>
 <div class=panel><h3>当日勤怠（サンプル）</h3><div class=tablewrap><table><tr><th>社員</th><th>日付</th><th>勤務区分</th><th>就労</th><th>時間外</th></tr>${db.attendance.filter(a=>a.date===currentDay).map(a=>`<tr><td>${empName(a.employeeId)}</td><td>${a.date}</td><td>${a.type}</td><td>${a.work}h</td><td>${a.overtime}h</td></tr>`).join('')}</table></div><p class=small>現段階はサンプル。Firebase化後に勤怠v8.0と共通データ化する前提。</p></div>`;
}

function renderMasters(){
 const tabs=`<div class=master-tabs><button class="master-tab ${masterType==='employees'?'active':''}" data-mt=employees>社員</button><button class="master-tab ${masterType==='vehicles'?'active':''}" data-mt=vehicles>車両</button><button class="master-tab ${masterType==='customers'?'active':''}" data-mt=customers>顧客</button></div>`;
 let body='';
 if(masterType==='employees'){
  body=`<div class=grid2><div class=panel><h3>社員マスタ</h3>${db.employees.sort((a,b)=>a.order-b.order).map(x=>`<div class=master-card><h4>${x.id} ${x.name} ${x.active?'':'[無効]'}</h4><div class=small>${x.role} / ${x.start}-${x.end} / 勤怠対象:${x.attendance?'はい':'いいえ'} / 表示順:${x.order}</div><div class=actions><button class=ghost data-ee="${x.id}">編集</button><button class=ghost data-ea="${x.id}">${x.active?'無効化':'有効化'}</button></div></div>`).join('')}</div><div class=panel><h3 id=eTitle>社員登録</h3><input type=hidden id=eOrig><div class=form><div><label>社員ID</label><input id=eId value="EMP-${String(db.employees.length+1).padStart(3,'0')}"></div><div><label>氏名</label><input id=eName></div><div><label>役職</label><input id=eRole value="社員"></div><div><label>表示順</label><input id=eOrder type=number value="${db.employees.length+1}"></div><div><label>標準開始</label><input id=eStart type=time value="08:00"></div><div><label>標準終了</label><input id=eEnd type=time value="17:00"></div></div><p><button id=eSave class=primary>保存</button></p></div></div>`;
 }else if(masterType==='vehicles'){
  body=`<div class=grid2><div class=panel><h3>車両マスタ</h3>${db.vehicles.map(x=>`<div class=master-card><h4>${x.id} ${x.name} ${x.active?'':'[無効]'}</h4><div class=small>${x.type} / ${x.number}</div><div class=actions><button class=ghost data-ve="${x.id}">編集</button><button class=ghost data-va="${x.id}">${x.active?'無効化':'有効化'}</button></div></div>`).join('')}</div><div class=panel><h3>車両登録</h3><input type=hidden id=vOrig><div class=form><div><label>車両ID</label><input id=vId value="CAR-${String(db.vehicles.length+1).padStart(3,'0')}"></div><div><label>呼称</label><input id=vName></div><div><label>車種</label><input id=vType></div><div><label>ナンバー</label><input id=vNumber></div><div><label>備考</label><input id=vNote></div></div><p><button id=vSave class=primary>保存</button></p></div></div>`;
 }else{
  body=`<div class=grid2><div class=panel><h3>顧客マスタ</h3>${db.customers.map(x=>`<div class=master-card><h4>${x.id} ${x.name} ${x.active?'':'[無効]'}</h4><div class=small>${x.short} / ${x.address} / ${x.contact}</div><div class=actions><button class=ghost data-ce="${x.id}">編集</button><button class=ghost data-ca="${x.id}">${x.active?'無効化':'有効化'}</button></div></div>`).join('')}</div><div class=panel><h3>顧客登録</h3><input type=hidden id=cOrig><div class=form><div><label>顧客ID</label><input id=cId value="CUS-${String(db.customers.length+1).padStart(3,'0')}"></div><div><label>会社名</label><input id=cName></div><div><label>略称</label><input id=cShort></div><div><label>所在地</label><input id=cAddress></div><div><label>担当者</label><input id=cContact></div><div><label>電話</label><input id=cPhone></div></div><p><button id=cSave class=primary>保存</button></p></div></div>`;
 }
 $('masters').innerHTML=tabs+body;
 document.querySelectorAll('[data-mt]').forEach(b=>b.onclick=()=>{masterType=b.dataset.mt;renderMasters()});
 if(masterType==='employees'){
  $('eSave').onclick=()=>{const x={id:$('eId').value.trim(),name:$('eName').value.trim(),role:$('eRole').value.trim(),active:true,attendance:true,start:$('eStart').value,end:$('eEnd').value,order:+$('eOrder').value||99};const o=$('eOrig').value;if(!x.id||!x.name)return alert('IDと氏名は必須');if(o){const i=db.employees.findIndex(a=>a.id===o);x.active=db.employees[i].active;db.employees[i]=x;db.tasks.forEach(t=>{if(t.employeeId===o)t.employeeId=x.id});db.projects.forEach(p=>{if(p.ownerId===o)p.ownerId=x.id})}else db.employees.push(x);save();renderAll();showView('masters')};
  document.querySelectorAll('[data-ee]').forEach(b=>b.onclick=()=>{const x=emp(b.dataset.ee);$('eOrig').value=x.id;$('eId').value=x.id;$('eName').value=x.name;$('eRole').value=x.role;$('eOrder').value=x.order;$('eStart').value=x.start;$('eEnd').value=x.end});
  document.querySelectorAll('[data-ea]').forEach(b=>b.onclick=()=>{emp(b.dataset.ea).active=!emp(b.dataset.ea).active;save();renderAll();showView('masters')});
 }else if(masterType==='vehicles'){
  $('vSave').onclick=()=>{const x={id:$('vId').value.trim(),name:$('vName').value.trim(),type:$('vType').value.trim(),number:$('vNumber').value.trim(),note:$('vNote').value.trim(),active:true};const o=$('vOrig').value;if(!x.id||!x.name)return alert('IDと呼称は必須');if(o){const i=db.vehicles.findIndex(a=>a.id===o);x.active=db.vehicles[i].active;db.vehicles[i]=x;db.tasks.forEach(t=>{if(t.vehicleId===o)t.vehicleId=x.id})}else db.vehicles.push(x);save();renderAll();showView('masters')};
  document.querySelectorAll('[data-ve]').forEach(b=>b.onclick=()=>{const x=veh(b.dataset.ve);$('vOrig').value=x.id;$('vId').value=x.id;$('vName').value=x.name;$('vType').value=x.type;$('vNumber').value=x.number;$('vNote').value=x.note||''});
  document.querySelectorAll('[data-va]').forEach(b=>b.onclick=()=>{veh(b.dataset.va).active=!veh(b.dataset.va).active;save();renderAll();showView('masters')});
 }else{
  $('cSave').onclick=()=>{const x={id:$('cId').value.trim(),name:$('cName').value.trim(),short:$('cShort').value.trim(),address:$('cAddress').value.trim(),contact:$('cContact').value.trim(),phone:$('cPhone').value.trim(),active:true};const o=$('cOrig').value;if(!x.id||!x.name)return alert('IDと会社名は必須');if(o){const i=db.customers.findIndex(a=>a.id===o);x.active=db.customers[i].active;db.customers[i]=x;db.projects.forEach(p=>{if(p.customerId===o)p.customerId=x.id})}else db.customers.push(x);save();renderAll();showView('masters')};
  document.querySelectorAll('[data-ce]').forEach(b=>b.onclick=()=>{const x=cust(b.dataset.ce);$('cOrig').value=x.id;$('cId').value=x.id;$('cName').value=x.name;$('cShort').value=x.short;$('cAddress').value=x.address;$('cContact').value=x.contact;$('cPhone').value=x.phone||''});
  document.querySelectorAll('[data-ca]').forEach(b=>b.onclick=()=>{cust(b.dataset.ca).active=!cust(b.dataset.ca).active;save();renderAll();showView('masters')});
 }
}

function renderHolidays(){
 $('holidays').innerHTML=`<div class=grid2><div class=panel><h3>会社カレンダー</h3><div class=tablewrap><table><tr><th>日付</th><th>区分</th><th>名称</th><th></th></tr>${db.holidays.sort((a,b)=>a.date.localeCompare(b.date)).map(h=>`<tr><td>${h.date}</td><td><span class="badge ${h.type==='statutory'?'bu':'bv'}">${h.type==='statutory'?'法定休日':'所定休日'}</span></td><td>${h.name}</td><td><button class=ghost data-hd="${h.id}">削除</button></td></tr>`).join('')}</table></div></div><div class=panel><h3>休日追加</h3><div class=form><div><label>日付</label><input id=hDate type=date value="${currentDay}"></div><div><label>区分</label><select id=hType><option value=statutory>法定休日</option><option value=company>所定休日</option></select></div><div><label>名称</label><input id=hName value="法定休日"></div></div><p><button id=hSave class=primary>＋追加</button></p><p class=small>勤怠v8.0と連携する際は、この会社カレンダーを共通データ化。</p></div></div>`;
 $('hSave').onclick=()=>{db.holidays.push({id:'H'+Date.now(),date:$('hDate').value,type:$('hType').value,name:$('hName').value.trim()||($('hType').value==='statutory'?'法定休日':'所定休日')});save();renderAll();showView('holidays')};
 $('hType').onchange=()=>{$('hName').value=$('hType').value==='statutory'?'法定休日':'所定休日'};
 document.querySelectorAll('[data-hd]').forEach(b=>b.onclick=()=>{db.holidays=db.holidays.filter(h=>h.id!==b.dataset.hd);save();renderAll();showView('holidays')});
}

function renderAll(){renderSummary();renderDashboard();renderProjects();renderYear();renderQuarter();renderMonth();renderDay();renderAttendance();renderMasters();renderHolidays()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showView(b.dataset.view));
$('resetBtn').onclick=()=>{localStorage.removeItem(KEY);db=structuredClone(seed);currentDay='2026-09-09';currentMonth='2026-09';save();renderAll();showView('dashboard')};
renderAll();
