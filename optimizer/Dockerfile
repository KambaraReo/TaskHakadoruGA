FROM python:3.11-slim

ENV TZ Asia/Tokyo

# 必ビルドツールを追加
RUN apt-get update && apt-get install -y \
  build-essential \
  libatlas-base-dev \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
