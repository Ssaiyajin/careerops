FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 10001 careerops \
    && useradd --system --uid 10001 --gid careerops --home-dir /app --no-create-home careerops

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY alembic.ini ./alembic.ini
COPY alembic ./alembic

RUN mkdir -p uploads exports \
    && chown -R careerops:careerops /app/uploads /app/exports

ENV HOME=/app \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

USER 10001:10001

CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
