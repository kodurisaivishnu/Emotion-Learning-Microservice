FROM python:3.10-slim

WORKDIR /app

# Install dependencies for OpenCV and DeepFace
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY ./app ./app

# Use uvicorn to start FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "6000"]
