# ベースイメージを指定
FROM ruby:3.2.2

# 必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
  nodejs \
  yarn \
  && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリの設定
WORKDIR /app

# GemfileとGemfile.lockをコピーして依存関係をインストール
COPY Gemfile Gemfile.lock /app/
RUN bundle install

# アプリケーションのファイルをコピー
COPY . /app

# entrypoint.shのコピーと実行権限の付与
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh

# エントリーポイントの設定
ENTRYPOINT ["entrypoint.sh"]

# ポートのエクスポート
EXPOSE 3000

# Railsサーバーの起動コマンド
CMD ["rails", "server", "-b", "0.0.0.0"]
