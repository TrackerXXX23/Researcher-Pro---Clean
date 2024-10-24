#!/bin/bash

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from .env.example. Please update with your actual values."
fi

# Create Prometheus multiproc directory
mkdir -p /tmp/prometheus_multiproc
export PROMETHEUS_MULTIPROC_DIR=/tmp/prometheus_multiproc

echo "Development environment setup complete!"
echo "Please update .env file with your actual configuration values."
echo "Run 'source venv/bin/activate' to activate the virtual environment."
