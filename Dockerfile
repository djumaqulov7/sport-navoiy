FROM python:3.11-slim

WORKDIR /app

# Loyiha fayllarini nusxalash
COPY . /app

# Muhit o'zgaruvchilari
ENV PORT=8000
EXPOSE 8000

# Serverni ishga tushirish
CMD ["python", "server.py"]
