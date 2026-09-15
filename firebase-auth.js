import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
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
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAojhXeQ2af6arwoAEoiRXnCCHeyIqItuQ",
  authDomain: "roumu-119cd.firebaseapp.com",
  projectId: "roumu-119cd",
  storageBucket: "roumu-119cd.firebasestorage.app",
  messagingSenderId: "424158429227",
  appId: "1:424158429227:web:176ebf4d76d0fb2fa36a6e",
  measurementId: "G-DHP8D33YYM"
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
let cloudModule=null;

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
  try{await loadScript('time-snapshot-import.js?v=1')}catch(e){console.warn('TIME snapshot helper load skipped',e)}
  await loadScript('app.js?v=2.1.5-exactauth-20260914');
}
function authErrorMessage(err){
  const c=err?.code||'';
  if(c.includes('unauthorized-domain'))return 'このURLがFirebaseの承認済みドメインに登録されていません。';
  if(c.includes('popup-closed-by-user'))return 'ログイン画面が閉じられました。もう一度お試しください。';
  if(c.includes('network-request-failed'))return 'ネットワーク接続を確認してください。';
  return `ログインに失敗しました${c?`（${c}）`:''}`;
}

/* v2.1.0cでPC・スマホ双方のログイン動作確認が取れた順序をそのまま使用 */
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
  try{cloudModule?.stopPortalCloud?.()}catch(e){}
  await signOut(auth);
  location.reload();
});

onAuthStateChanged(auth,async user=>{
  if(!user){
    portal.classList.add('auth-hidden');gate.classList.remove('auth-hidden');
    loginBtn.disabled=false;status('ログインしてください');return;
  }

  status('ログイン確認済み。クラウドデータを確認しています…');

  try{
    cloudModule = await import('./firestore-sync.js?v=2.1.6-time-firebase-20260915');
    const ok = await cloudModule.initPortalCloud({
      firebaseApp: app,
      user,
      loadPortal,
      showPortal: ()=>{
        document.getElementById('loginUser').textContent=user.email||user.displayName||'ログイン中';
        gate.classList.add('auth-hidden');portal.classList.remove('auth-hidden');
        status('');
      },
      showAuthError:(msg)=>status(msg,true)
    });

    // Firestore側の問題で認証成功後まで閉じ込めない。
    // 認証が成功していればローカルポータルは開ける。
    if(!ok){
      await loadPortal();
      document.getElementById('loginUser').textContent=user.email||user.displayName||'ログイン中';
      gate.classList.add('auth-hidden');portal.classList.remove('auth-hidden');
    }
  }catch(e){
    console.error('cloud init after auth failed',e);
    try{
      await loadPortal();
      document.getElementById('loginUser').textContent=user.email||user.displayName||'ログイン中';
      gate.classList.add('auth-hidden');portal.classList.remove('auth-hidden');
      status('');
      const cs=document.getElementById('cloudStatus');
      if(cs){cs.textContent='クラウド接続失敗';cs.classList.add('error')}
    }catch(e2){
      console.error(e2);
      status('ポータルの読み込みに失敗しました。ページを再読み込みしてください。',true);
    }
  }
});
