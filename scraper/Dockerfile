FROM python:3.9-slim

# Set working directory
WORKDIR /app/scraper

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the source code
COPY . .

# Set environment variable for Cloud Run
ENV PORT=8080

# Install Flask for basic web server
RUN pip install flask

# Create a wrapper script
COPY <<EOF ./wrapper.py
from flask import Flask
import subprocess
import os

app = Flask(__name__)

@app.route('/')
def run_scraper():
    try:
        subprocess.run(['python', 'main.py'])
        return 'Scraper completed successfully', 200
    except Exception as e:
        return f'Error running scraper: {str(e)}', 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
EOF

# Run the Flask server
CMD ["python", "wrapper.py"]