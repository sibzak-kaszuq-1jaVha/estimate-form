# 概算見積もりフォーム（ローカル試作品）

この試作品は、イラスト / Live2D依頼向けの「概算見積もり」をブラウザ上で確認するためのものです。  
このページでは概算算出のみ行い、正式送信はGoogleフォーム側で行う想定です。

## ファイル構成

- `index.html`: 画面の本体（入力欄、概算表示、Googleフォーム導線）
- `style.css`: 見た目（レイアウト、色、余白）
- `script.js`: 料金計算、内訳表示、問い合わせ本文生成、コピー機能
- `README.md`: この説明ファイル

## 使い方（macOS）

1. `index.html` をFinderからダブルクリックしてブラウザで開く
2. 各項目を選択・入力する
3. 「概算見積もり」と「内訳」が更新されることを確認する
4. 問い合わせ本文の「コピー」ボタンでクリップボードにコピーする

## 料金の変更場所

`script.js` の先頭にある `PRICE_TABLE` を編集してください。  
例: `requestType.standing` を `14000` から `16000` に変更すると、立ち絵カテゴリの料金が変わります。

## GoogleフォームURLの設定

`script.js` の `GOOGLE_FORM_URL` を、あなたのGoogleフォームURLに変更してください。  
例: `https://forms.gle/xxxxxx`

## 注意

- 表示金額は概算です
- 送信のみでは依頼確定になりません
- このページ自体には送信機能を持たせず、最終送信はGoogleフォームで行います

## 戻し方（失敗した場合）

1. 変更前にファイルを複製してバックアップを作る  
   例: `script.js` を `script_backup.js` として保存
2. 問題が出たら、バックアップファイルの内容を元に戻す
3. どこを変更したか分からなくなった場合は、`PRICE_TABLE` だけ先に元の値へ戻して確認する

---

## 公開して使う手順（GitHub Pages）

このプロジェクトは `HTML/CSS/JavaScript` だけで動くため、GitHub Pages でそのまま公開できます。

### 1回だけ必要な設定

1. GitHubでリポジトリ `estimate-form` を開く
2. `Settings` → `Pages` を開く
3. `Source` を **GitHub Actions** に変更して保存

これで公開準備は完了です。

### 以後の自動更新

- `main` ブランチに更新を反映すると、GitHub Actions が自動で公開ページを更新します。
- 追加した設定ファイル: `.github/workflows/deploy-pages.yml`

### 公開URL

- `https://sibzak-kaszuq-1jaVha.github.io/estimate-form/`

※ 現在このURLは `404` だったため、まだ公開設定前です。上の「1回だけ必要な設定」を行うと表示されるようになります。

### ローカルでの使用（公開前でも可）

1. `index.html` をブラウザで開く
2. 項目を選ぶと概算金額が表示される
3. 「コピー」ボタンで問い合わせ本文をコピーできる

### 戻し方（失敗時）

- 追加した自動公開を止めたい場合: `.github/workflows/deploy-pages.yml` を無効化（リネーム）または削除
- README追記を戻したい場合: Gitの履歴から `README.md` を以前の状態に戻す
