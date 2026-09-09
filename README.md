# 社内予定・案件管理 v0.4

## 追加機能
- 「案件」タブを追加
- 案件ID、顧客名、案件名、期間、納期、予定工数、必要人員、主担当を登録
- 登録案件が年・四半期・月ビューへ反映
- 日ビューの予定登録時に登録済み案件を選択可能
- 案件に紐づいた予定は全ビューへ共通反映
- localStorage保存

## GitHubへの更新方法
既存 company-schedule リポジトリで
Add file → Upload files
から index.html / style.css / app.js / README.md をアップロードし、
既存ファイルを置き換えて Commit changes。

GitHub Pagesは設定変更不要です。

## 注意
現段階はブラウザごとの保存です。
複数PCで共有するには次段階で Firebase / Firestore を接続します。
