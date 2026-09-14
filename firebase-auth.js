import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIlE1txZ YXdCc0Jt_siYYW0JtAi0aCKgU".replace(/ /g,''),
  authDomain: "portal-31d10.firebaseapp.com",
  projectId: "portal-31d10",
  storageBucket: "portal-31d10.firebasestorage.app",
  messagingSenderId: "684112341136",
  appId: "1:684112341136:web:3ade6e4459a71bb778d015",
  measurementId: "G-Q0QZ7ZZR69"
};

const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const provider=new GoogleAuthProvider();
provider.setCustomParameters({prompt:'select_account'});

const gate=document.getElementById('authGate');
const portal=document.getElementById('portalApp');
const statusEl=document.getElementById('authStatus');
const loginBtn=document.getElementById('googleLoginBtn');
let portalLoaded=false;

function status(text,isError=false){
  statusEl.textContent=text||'';
  statusEl.classList.toggle('error',!!isError);
}
function loadScript(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s);
  });
}
async function loadPortal(){
  if(portalLoaded)return;
  portalLoaded=true;
  // customer-master-data.js is intentionally NOT shipped/loaded in v2.1.0.
  // Existing localStorage data on the current PC remains untouched.
  try{await loadScript('time-snapshot-import.js?v=1')}catch(e){console.warn('TIME snapshot helper load skipped',e)}
  await loadScript('app.js?v=2.1.0-login');
}
function authErrorMessage(err){
  const c=err?.code||'';
  if(c.includes('unauthorized-domain'))return 'このURLがFirebaseの承認済みドメインに登録されていません。';
  if(c.includes('popup-closed-by-user'))return 'ログイン画面が閉じられました。もう一度お試しください。';
  if(c.includes('network-request-failed'))return 'ネットワーク接続を確認してください。';
  return `ログインに失敗しました${c?`（${c}）`:''}`;
}

await setPersistence(auth,browserLocalPersistence);
try{await getRedirectResult(auth)}catch(e){console.warn(e);status(authErrorMessage(e),true)}

loginBtn.addEventListener('click',async()=>{
  loginBtn.disabled=true;status('Googleログインを開いています…');
  try{
    await signInWithPopup(auth,provider);
  }catch(e){
    if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment'].includes(e?.code)){
      await signInWithRedirect(auth,provider);return;
    }
    status(authErrorMessage(e),true);loginBtn.disabled=false;
  }
});

document.getElementById('logoutBtn').addEventListener('click',async()=>{
  await signOut(auth);
  location.reload();
});

onAuthStateChanged(auth,async user=>{
  if(!user){
    portal.classList.add('auth-hidden');gate.classList.remove('auth-hidden');
    loginBtn.disabled=false;status('ログインしてください');return;
  }
  status('ログイン確認済み。ポータルを読み込んでいます…');
  try{
    await loadPortal();
    document.getElementById('loginUser').textContent=user.email||user.displayName||'ログイン中';
    gate.classList.add('auth-hidden');portal.classList.remove('auth-hidden');
  }catch(e){
    console.error(e);status('ポータルの読み込みに失敗しました。ページを再読み込みしてください。',true);
  }
});
