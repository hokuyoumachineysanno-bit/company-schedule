# v2.1.6 TIME共通Firebase版
- TIMEと同じ Firebase project `roumu-119cd`
- TIMEと同じ Firebase SDK 12.11.0
- Google認証は popup-first / 必要時redirect
- Portal保存先 `shared/portal-main`
- TIME保存先 `shared/attendance-main` とは分離
- 既存Firestore rules `/shared/**` をそのまま利用
- `users/{uid}.active` の追加チェックは廃止
