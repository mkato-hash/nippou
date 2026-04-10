# セットアップガイド

## クイックスタート（Docker Compose 推奨）

### ステップ 1: Docker と Docker Compose のインストール

Docker がまだインストールされていない場合は、[Docker Desktop](https://www.docker.com/products/docker-desktop)をダウンロードしてインストールしてください。

### ステップ 2: サービスを起動

```bash
# プロジェクトディレクトリに移動
cd sample003

# 全サービスを起動
docker-compose up

# または、バックグラウンドで起動
docker-compose up -d
```

初回起動時は依存関係のインストールと DB マイグレーションが自動的に行われます（1-2 分かかる可能性があります）。

### ステップ 3: テストユーザーを作成

Backend API が起動したら、以下のコマンドでテストユーザーを作成します：

```bash
# 新人ユーザーを作成
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainee@example.com",
    "password": "password123",
    "name": "新人太郎",
    "role": "TRAINEE"
  }'

# メンターユーザーを作成
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mentor@example.com",
    "password": "password123",
    "name": "メンター花子",
    "role": "MENTOR"
  }'
```

### ステップ 4: アプリケーションにアクセス

各サービスは以下の URL でアクセスできます：

**Web 管理画面（メンター向け）**
- URL: http://localhost:3002
- Email: `mentor@example.com`
- Password: `password123`

**Backend API（開発者向け）**
- URL: http://localhost:3000/api
- Health Check: http://localhost:3000/health

**Analytics API（開発者向け）**
- URL: http://localhost:3001
- Health Check: http://localhost:3001/health

### ステップ 5: モバイルアプリを起動（iOS シミュレーター）

別のターミナルウィンドウで：

```bash
cd mobile
npm install
npm run ios
```

モバイルアプリで以下のログイン情報を使用してください：
- Email: `trainee@example.com`
- Password: `password123`

---

## 手動セットアップ（Node.js/Python をローカルで実行）

Docker を使わずにローカルで実行する場合は、以下の手順に従ってください。

### 前提条件

- Node.js 20 以上
- Python 3.11 以上
- npm 9 以上
- pip

### Backend API のセットアップ

```bash
cd backend

# 依存パッケージをインストール
npm install

# .env ファイルを作成（.env.example をコピー）
cp .env.example .env

# Prisma データベースマイグレーション
npm run prisma:migrate

# 開発サーバーを起動（ターミナル 1）
npm run dev
```

Backend は http://localhost:3000 で起動します。

### Web 管理画面のセットアップ

別のターミナルで：

```bash
cd web

# 依存パッケージをインストール
npm install

# .env.local ファイルを作成
cp .env.example .env.local

# 開発サーバーを起動（ターミナル 2）
npm run dev
```

Web 管理画面は http://localhost:3000 で起動します（ポート競合を避けるため、.env.local で別ポートを設定してください）。

### Analytics サービスのセットアップ

別のターミナルで：

```bash
cd analytics

# Python 仮想環境を作成
python -m venv venv

# 仮想環境を有効化
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate  # Windows

# 依存パッケージをインストール
pip install -r requirements.txt

# サーバーを起動（ターミナル 3）
python main.py
```

Analytics サービスは http://localhost:3001 で起動します。

### モバイルアプリのセットアップ

別のターミナルで：

```bash
cd mobile

# 依存パッケージをインストール
npm install

# .env ファイルを作成
cp .env.example .env

# Expo サーバーを起動（ターミナル 4）
npm start

# iOS シミュレーターで起動（別ウィンドウ）
npm run ios
```

---

## API テスト

### curl を使った API テスト

#### 1. ログイン

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainee@example.com",
    "password": "password123"
  }'
```

レスポンス例：
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "新人太郎",
    "email": "trainee@example.com",
    "role": "TRAINEE"
  }
}
```

#### 2. 日報を提出

トークンを使用して日報を提出します：

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "trainingContent": "本日は React のフック について学習しました",
    "progressStatus": "フック の基礎を理解し、簡単な例を実装した",
    "problems": "useEffect の依存配列がまだ理解しきれていない",
    "tomorrowPlan": "useEffect の詳細を学習し、さらに複雑な例に取り組む"
  }'
```

#### 3. 日報一覧を取得（メンター）

```bash
curl -X GET http://localhost:3000/api/reports \
  -H "Authorization: Bearer MENTOR_TOKEN_HERE"
```

---

## トラブルシューティング

### Docker のトラブルシューティング

#### ログを確認する

```bash
# 全サービスのログを確認
docker-compose logs

# 特定サービスのログを確認
docker-compose logs backend
docker-compose logs web
docker-compose logs analytics
```

#### サービスを停止・削除する

```bash
# 全サービスを停止
docker-compose down

# 全サービスを停止してボリュームも削除
docker-compose down -v
```

#### コンテナーを再構築する

```bash
# 全コンテナーを再構築
docker-compose up --build

# 特定サービスを再構築
docker-compose up --build backend
```

### ローカル実行のトラブルシューティング

#### ポート競合エラー

別のアプリケーションがポートを使用している場合：

```bash
# macOS/Linux で使用中のプロセスを確認
lsof -i :3000
lsof -i :3001
lsof -i :3002

# Windows で使用中のプロセスを確認
netstat -ano | findstr :3000

# プロセスを終了
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### npm install エラー

```bash
# node_modules とロックファイルを削除
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

#### Python 仮想環境エラー

```bash
# 仮想環境を削除
rm -rf venv

# 新規作成
python -m venv venv
source venv/bin/activate

# 再インストール
pip install -r requirements.txt
```

### モバイルアプリが API に接続できない

ローカルで実行している場合、モバイルアプリがホストマシンに接続できるように IP アドレスを設定する必要があります。

#### 1. ホストマシンの IP アドレスを確認

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

#### 2. .env ファイルを更新

`mobile/.env` ファイルで API URL をホスト IP に変更します：

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

#### 3. アプリを再起動

```bash
npm run ios
```

---

## 次のステップ

### 本番環境への展開

1. **データベースを PostgreSQL に変更**
   - `prisma/schema.prisma` の datasource を変更
   - 環境変数 `DATABASE_URL` を PostgreSQL 接続文字列に設定

2. **JWT_SECRET を強力な値に変更**
   - 本番環境では強力なランダム文字列を使用してください

3. **CORS 設定を調整**
   - `backend/src/index.ts` の CORS オプションを環境に合わせて設定

4. **環境変数を安全に管理**
   - `.env` ファイルはバージョン管理から除外
   - CI/CD パイプラインで環境変数を注入

### 機能拡張

- メンターからのフィードバック機能
- 日報のタグ・カテゴリ分類
- 検索・フィルタ機能の拡張
- 通知機能（メール、プッシュ通知）
- 複数のメンター割当機能
- 進捗の可視化（グラフ・チャート）

---

## サポート

問題が発生した場合は、README.md のトラブルシューティングセクションを確認してください。
