# 新人研修向け日報アプリ

研修中の新人エンジニア向けの日報管理システムです。新人がモバイルアプリで日報を提出し、メンターが Web 管理画面で確認・管理できます。

## プロジェクト構成

```
sample003/
├── backend/          # Node.js/Express REST API
├── mobile/           # React Native (Expo) iOS アプリ
├── web/              # Next.js メンター用管理画面
├── analytics/        # Python FastAPI 集計・レポートサービス
└── docker-compose.yml
```

## 技術スタック

| コンポーネント | 技術 |
|---|---|
| Backend API | Node.js 20, Express.js, TypeScript, Prisma ORM, SQLite |
| Mobile App | React Native, Expo, TypeScript |
| Web Admin | Next.js, React, TypeScript |
| Analytics | Python 3.11, FastAPI, pandas |
| Orchestration | Docker, Docker Compose |

## 機能一覧

### モバイルアプリ（新人向け）
- ✅ ユーザーログイン
- ✅ 日報提出（本日の研修内容、進捗状況、問題・困ったこと、明日の予定）
- ✅ 提出履歴の閲覧
- ✅ プロフィール表示

### Web 管理画面（メンター向け）
- ✅ ユーザーログイン
- ✅ 提出された日報一覧表示
- ✅ 日報詳細表示
- ✅ 既読マーク機能
- ✅ 統計ダッシュボード

### Analytics サービス
- ✅ 週次集計レポート
- ✅ CSV エクスポート機能

## セットアップ手順

### 前提条件
- Docker & Docker Compose
- または
- Node.js 20+
- Python 3.11+
- npm

### Docker Compose を使う場合（推奨）

```bash
# プロジェクトディレクトリに移動
cd sample003

# 全サービスを起動
docker-compose up

# バックグラウンド起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

サービスは以下のポートで起動します：
- **Backend API**: http://localhost:3000
- **Web Admin**: http://localhost:3002
- **Analytics**: http://localhost:3001

### 手動セットアップ

#### 1. Backend API の起動

```bash
cd backend

# 依存パッケージをインストール
npm install

# Prisma データベースマイグレーション
npm run prisma:migrate

# 開発サーバー起動
npm run dev
```

#### 2. Web Admin の起動

別のターミナルウィンドウで：

```bash
cd web

# 依存パッケージをインストール
npm install

# 開発サーバー起動
npm run dev
```

#### 3. Analytics サービスの起動

別のターミナルウィンドウで：

```bash
cd analytics

# Python 仮想環境を作成
python -m venv venv
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate  # Windows

# 依存パッケージをインストール
pip install -r requirements.txt

# サーバー起動
python main.py
```

#### 4. Mobile App の起動

別のターミナルウィンドウで：

```bash
cd mobile

# 依存パッケージをインストール
npm install

# Expo サーバー起動
npm start

# iOS シミュレーターで起動
npm run ios

# または Android エミュレーターで起動
npm run android
```

## 初期ユーザー設定

### テストユーザーの作成

Backend がローカルで起動している場合、以下の API で新規ユーザーを作成できます：

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainee@example.com",
    "password": "password123",
    "name": "新人太郎",
    "role": "TRAINEE"
  }'

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mentor@example.com",
    "password": "password123",
    "name": "メンター花子",
    "role": "MENTOR"
  }'
```

### ログイン

**新人アプリ:**
- Email: `trainee@example.com`
- Password: `password123`

**メンター Web:**
- Email: `mentor@example.com`
- Password: `password123`

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `POST /api/auth/register` - ユーザー登録

### 日報
- `POST /api/reports` - 日報提出（新人）
- `GET /api/reports` - 日報一覧取得（メンター）
- `GET /api/reports/:id` - 日報詳細取得
- `PATCH /api/reports/:id/read` - 既読マーク（メンター）
- `GET /api/reports/me/reports` - 自分の日報一覧取得（新人）

### 集計・分析
- `GET /api/analytics/weekly` - 週次集計レポート
- `GET /api/analytics/export/csv` - CSV エクスポート

## 環境変数設定

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret_key_here"
PORT=3000
NODE_ENV="development"
```

### Web (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Mobile (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Analytics
```env
API_BASE_URL=http://localhost:3000/api
JWT_SECRET="your_jwt_secret_key_here"
```

## トラブルシューティング

### Backend が起動しない

```bash
# node_modules をリセット
rm -rf node_modules package-lock.json
npm install

# Prisma を再生成
npm run prisma:generate
```

### ポートが既に使用されている

```bash
# macOS/Linux で使用中のプロセスを確認・終了
lsof -i :3000
kill -9 <PID>

# または別のポートで起動するよう .env を編集
```

### モバイルアプリが API に接続できない

1. ホストマシンの IP アドレスを確認
2. `mobile/.env` の `EXPO_PUBLIC_API_URL` をホスト IP に変更
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
   ```

## 開発メモ

- Database: SQLite（開発用）→ 本番環境では PostgreSQL への移行を推奨
- Authentication: JWT トークンベース
- UI: シンプルで新人向けの わかりやすい設計
- モバイル: iOS のみ（React Native で クロスプラットフォーム対応可能）

## ライセンス

MIT
