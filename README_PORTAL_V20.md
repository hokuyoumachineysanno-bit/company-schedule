# 社内業務ポータル v2.0 TIME参照専用版

ポータルはTIMEを編集しません。

`hokuyou.time.snapshot.v1` を読み、
`hokuyou.portal.attendance.cache.v1` とポータルDBへコピーして格納します。

勤怠タブは参照専用です。
- EMP別勤務区分
- 出退勤
- 外出/戻り
- 経過時間
- 備考
- TIME最終取込日時

## 反映先
既存の社内業務ポータルのリポジトリ（例: company-schedule）へ、
このZIPの中身を上書きしてください。

TIMEとポータルが同じ `https://hokuyoumachineysanno-bit.github.io` 配下なら、
パスが `/time/` と `/company-schedule/` に分かれていても同じlocalStorageを参照できます。
