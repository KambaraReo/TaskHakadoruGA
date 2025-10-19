FROM node:18

ENV TZ Asia/Tokyo

# 作業ディレクトリの設定
RUN mkdir /app
WORKDIR /app

# 依存関係インストール
COPY package*.json ./
RUN npm install

# ソースコードを追加
COPY . .

# 権限を設定
RUN chown -R node:node /app

USER node

# Next.js dev server を起動（ホストに公開）
EXPOSE 3001
CMD ["npm","run","dev"]
