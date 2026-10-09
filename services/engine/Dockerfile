ARG BASE_IMAGE=python:3.13-slim
FROM ${BASE_IMAGE}

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app

COPY pyproject.toml README.md ./
COPY src ./src
COPY catalog ./catalog
RUN pip install --no-cache-dir . && useradd --create-home engine
USER engine

ENV ENGINE_CATALOG=/app/catalog/series.yaml
EXPOSE 8080
CMD ["uvicorn", "engine.api:app", "--host", "0.0.0.0", "--port", "8080"]
