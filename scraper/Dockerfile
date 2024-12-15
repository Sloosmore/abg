# Use Python 3.9 slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app/scraper

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the source code
COPY . .

# Run the script
CMD ["python", "main.py"]