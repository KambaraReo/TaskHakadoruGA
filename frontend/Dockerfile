FROM node:21.7.1

ENV TZ Asia/Tokyo

# 作業ディレクトリの設定
RUN mkdir /app
WORKDIR /app

# 依存関係インストール
COPY package*.json ./
RUN npm install

# ソースコードを追加
COPY . .

# Next.js dev server を起動（ホストに公開）
EXPOSE 3000
CMD ["npm","run","dev"]
