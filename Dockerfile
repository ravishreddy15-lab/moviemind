FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://nodejs.org/dist/v20.18.1/node-v20.18.1-linux-x64.tar.gz | tar -xz -C /usr/local --strip-components=1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE ${PORT:-8000}

CMD ["python", "backend/main.py"]
