FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend

RUN groupadd --system --gid 10001 careerops \
    && useradd --system --uid 10001 --gid careerops --home-dir /app/backend --no-create-home careerops \
    && mkdir -p /app/backend/uploads /app/backend/exports \
    && chown -R careerops:careerops /app/backend/uploads /app/backend/exports

WORKDIR /app/backend

ENV HOME=/app/backend \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

USER 10001:10001

CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]