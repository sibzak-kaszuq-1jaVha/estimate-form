# 概算見積もりフォーム（ローカル試作品）

この試作品は、イラスト / Live2D依頼向けの「概算見積もり」をブラウザ上で確認するためのものです。  
このページでは概算算出のみ行い、正式送信はGoogleフォーム側で行う想定です。

## ファイル構成

- `index.html`: 画面の本体（入力欄、概算表示、Googleフォーム導線）
- `style.css`: 見た目（レイアウト、色、余白）
- `script.js`: 料金計算、内訳表示、問い合わせ本文生成、コピー機能
- `prices.json`: 料金マスタ（単価・係数・追加料金）
- `schedule-config.json`: 着手予定日の設定
- `README.md`: この説明ファイル

## 使い方（macOS）

公開ページで確認する場合は、そのままブラウザで開いて使えます。

ローカルで確認する場合は、Finderで `index.html` を直接開くと、ブラウザの制限で `prices.json` や `schedule-config.json` が読み込めないことがあります。<br>
その場合は、ターミナルで次のように開いてください。

```bash
cd /Users/tanaka/Documents/Codex/estimate-form
python3 -m http.server 8000
```

そのあと、ブラウザで次のURLを開きます。

```text
http://localhost:8000/
```

使い方:

1. 各項目を選択・入力する
2. 「概算見積もり」と「内訳」が更新されることを確認する
3. 問い合わせ本文の「コピー」ボタンでクリップボードにコピーする

## 料金の変更場所

料金や納期を変更する場合は、`prices.json` だけを編集してください。  
`script.js` の中には料金表を持たせていないため、価格変更のために `script.js` を編集する必要はありません。

例: `base.standing.price` を `15000` から `16000` に変更すると、立ち絵カテゴリの基本料金が変わります。

## 着手予定日の変更方法

クライアントに見せる「着手予定日」と「納品予定日」は、`schedule-config.json` で変更します。<br>
フォーム画面には日付入力欄を出していないため、クライアント側では変更できません。

編集する場所は、`startDate` の日付部分だけです。

```json
{
  "startDate": "2026-07-01"
}
```

日付は `YYYY-MM-DD` の形で入力してください。<br>
例: 2026年7月1日にしたい場合は `2026-07-01` と入力します。

設定した日付がページを開いた日より前になった場合は、ページを開いた端末の日付を基準に、自動で「明日」を着手予定日の起点にします。<br>
設定日が今日または未来の日付なら、設定した日付をそのまま使います。`schedule-config.json` の内容自体は自動で書き換えません。

例: `startDate` が `2026-08-01` のままでも、2026年8月17日にページを開くと、着手予定日は2026年8月18日からの範囲になります。

表示例:

- 着手予定日: 2026年7月1日~7月7日ごろ
- 納品予定日: 2026年7月29日~8月4日ごろ

この日付は概算です。正式な着手日・納品日ではありません。

## GitHubへの反映方法

GitHub上で日付を変更する場合の手順です。

1. GitHubでリポジトリ `estimate-form` を開く
2. `schedule-config.json` を開く
3. 右上の鉛筆アイコン（Edit this file）を押す
4. `"startDate": "2026-07-01"` の日付部分だけを変更する（過去日のままでも、表示上は自動で明日が起点になります）
5. 画面下の `Commit changes` を押す
6. 公開ページを開き直して、日付表示が変わっているか確認する

`Commit changes` は「GitHubに変更を保存して反映する」操作です。<br>
公開ページへの反映には少し時間がかかることがあります。

### 確認するときの注意

`index.html` をFinderから直接開いた場合、ブラウザの制限で `prices.json` や `schedule-config.json` が読み込まれないことがあります。<br>
クライアントに見せる実際の表示は、GitHub Pagesの公開ページで確認してください。

## ローカルで更新してGitHubへ反映する方法

`schedule-config.json` と `prices.json` は、GitHub上で直接変更される可能性があります。<br>
そのため、ローカルで編集する前に、まずGitHub側の最新版を取り込んでください。

ここで使う `pull` は「GitHubの最新版をローカルに取り込む」操作です。<br>
`push` は「ローカルの変更をGitHubへ送る」操作です。

### 1. ローカルファイルを最新にする

ターミナルで、このプロジェクトのフォルダへ移動します。

```bash
cd /Users/tanaka/Documents/Codex/estimate-form
```

次に、GitHub側の最新版を取り込みます。

```bash
git pull origin main
```

この操作を先に行うと、GitHub上で変更された `schedule-config.json` や `prices.json` と、ローカルの内容がずれにくくなります。

### 2. ローカルでファイルを編集する

日付を変える場合は、`schedule-config.json` の `startDate` だけを変更します。

```json
{
  "startDate": "2026-08-01"
}
```

料金を変える場合は、`prices.json` の `price` や `weeks` の数字だけを変更します。<br>
項目名（例: `loop_animation`、`commercial` など）は、画面側のコードとつながっているため変更しないでください。

### 3. 変更内容を確認する

どのファイルを変更したか確認します。

```bash
git status
```

変更内容の詳細を確認します。

```bash
git diff
```

### 4. GitHubへpushする

変更したファイルだけをGitに追加します。

```bash
git add schedule-config.json prices.json
```

変更内容に名前をつけて保存します。

```bash
git commit -m "Update schedule and prices"
```

GitHubへ送ります。

```bash
git push origin main
```

### 5. pushできない場合

`fetch first` や `rejected` と表示された場合は、GitHub側に新しい変更があります。<br>
その場合は、もう一度最新版を取り込んでからpushします。

```bash
git pull origin main
git push origin main
```

もし `git pull` のあとに見慣れない表示が出た場合は、無理に進めず、どのファイルで止まっているか確認してください。

## GoogleフォームURLの設定

`script.js` の `GOOGLE_FORM_URL` を、あなたのGoogleフォームURLに変更してください。  
例: `https://forms.gle/xxxxxx`

## 注意

- 表示金額は概算です
- 送信のみでは依頼確定になりません
- このページ自体には送信機能を持たせず、最終送信はGoogleフォームで行います

## 戻し方（失敗した場合）

1. 変更前にファイルを複製してバックアップを作る  
   例: `prices.json` を `prices_backup.json` として保存
2. 問題が出たら、バックアップファイルの内容を元に戻す
3. どこを変更したか分からなくなった場合は、`prices.json` の `price` と `weeks` の数字を先に元の値へ戻して確認する

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

1. ターミナルで `cd /Users/tanaka/Documents/Codex/estimate-form` を実行する
2. `python3 -m http.server 8000` を実行する
3. ブラウザで `http://localhost:8000/` を開く
4. 項目を選ぶと概算金額が表示される
5. 「コピー」ボタンで問い合わせ本文をコピーできる

### 戻し方（失敗時）

- 追加した自動公開を止めたい場合: `.github/workflows/deploy-pages.yml` を無効化（リネーム）または削除
- README追記を戻したい場合: Gitの履歴から `README.md` を以前の状態に戻す
