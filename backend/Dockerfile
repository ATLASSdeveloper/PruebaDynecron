FROM python:3.11-slim

WORKDIR /app

# Dependencias esenciales del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Instalacion en capas
RUN pip install --no-cache-dir --no-deps \
    torch==2.0.1 \
    torchvision==0.15.2 \
    torchaudio==2.0.2 \
    --index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir \
    "numpy<2" \
    fastapi==0.104.1 \
    uvicorn==0.24.0

RUN pip install --no-cache-dir \
    pydantic==2.5.0 \
    aiohttp==3.9.3 \
    requests==2.31.0\
    aiofiles==23.2.1

RUN pip install --no-cache-dir \
    slowapi==0.1.8 \
    limits==4.8.0

RUN pip install --no-cache-dir \
    python-multipart==0.0.6 \
    python-dotenv==1.0.0 \
    chromadb==0.4.15

RUN pip install --no-cache-dir \
    sentence-transformers==2.2.2 \
    huggingface-hub==0.16.4

RUN pip install --no-cache-dir \
    pdfplumber==0.10.3 \
    pypdfium2==4.25.0 \
    pypdf2==3.0.1

COPY app/ ./app/

# Limpieza final para reducir tamaño
RUN apt-get remove -y gcc g++ \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* \
    && pip cache purge

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]