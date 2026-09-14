# 社内業務ポータル v2.1.0 Googleログイン確認版

## 目的
Firebase AuthenticationのGoogleログインを先行導入し、PC/スマホ双方で認証できることを確認する版です。

## 重要
- この版はまだFirestore同期を行いません。データ保存は従来どおり各端末のlocalStorageです。
- customer-master-data.js はZIPから除外しました。実顧客一覧を静的ファイルとしてGitHub Pagesへ公開しないためです。
- 現在PCブラウザのlocalStorageにある既存データはそのまま利用されます。
- 新しいスマホでは、Firestore同期前なのでPCの実データはまだ表示されません。これは正常です。
- Googleログインだけでは「特定社員だけ」の最終制限にはなりません。次工程でFirestore users/UID の許可リストとSecurity Rulesを入れます。

## Firebase
Project: portal-31d10
Authentication: Google
Authorized domain: hokuyoumachineysanno-bit.github.io

## 配置
ZIP内のファイルを company-schedule リポジトリの公開ルートへ上書きします。
