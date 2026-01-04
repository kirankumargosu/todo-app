FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1

# # Install system dependencies for dlib / face_recognition
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     cmake \
#     libboost-all-dev \
#     libgtk-3-dev \
#     libglib2.0-0 \
#     libsm6 \
#     libxext6 \
#     libxrender-dev \
#     && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install --no-cache-dir uv

# Copy only dependency files first (for caching)
COPY pyproject.toml uv.lock ./

# Install Python dependencies via uv
RUN uv sync --frozen && rm -rf /root/.cache

# Copy the application code
COPY . .


# Run the cleanser service
CMD ["uv", "run", "main.py"]
