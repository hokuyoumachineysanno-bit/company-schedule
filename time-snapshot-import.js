// time-snapshot-import.js
// 社内業務ポータル側。TIMEスナップショットは読み取り専用。
(function(){
  "use strict";
  const SNAPSHOT_KEY="hokuyou.time.snapshot.v1";
  const PORTAL_CACHE_KEY="hokuyou.portal.attendance.cache.v1";

  function readSnapshot(){
    try{return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||"null")}catch{return null}
  }
  function flatten(snapshot){
    const attendance=[];
    if(!snapshot)return {attendance,calendar:[],exportedAt:null};
    for(const [employeeId,emp] of Object.entries(snapshot.employees||{})){
      for(const [date,r] of Object.entries(emp.records||{})){
        attendance.push({
          employeeId,date,
          type:r.type||"",
          start:r.start||"",
          end:r.end||"",
          out:r.out||"",
          back:r.back||"",
          note:r.note||"",
          elapsedMinutes:r.elapsedMinutes,
          source:"TIME",
          readOnly:true
        });
      }
    }
    const calendar=Object.values(snapshot.calendar||{});
    return {attendance,calendar,exportedAt:snapshot.exportedAt};
  }
  function importNow(){
    const snapshot=readSnapshot();
    const flat=flatten(snapshot);
    localStorage.setItem(PORTAL_CACHE_KEY,JSON.stringify(flat));
    window.HokuyouTimeSnapshotData=flat;
    window.dispatchEvent(new CustomEvent("hokuyou-time-snapshot-imported",{detail:flat}));
    return flat;
  }
  window.addEventListener("storage",e=>{if(e.key===SNAPSHOT_KEY)importNow()});
  window.addEventListener("pageshow",importNow);
  window.addEventListener("focus",importNow);
  importNow();

  window.HokuyouTimeSnapshot={
    key:SNAPSHOT_KEY,
    cacheKey:PORTAL_CACHE_KEY,
    read:importNow
  };
})();