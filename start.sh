#!/bin/bash

source .env

# Exit immediately if a command exits with a non-zero status
set -e

# Function to initialize and update the MONAI Label submodule
initialize_submodule() {
    # Check if the submodule directory exists
    if [ ! -d "monailabel" ]; then
        echo "Adding MONAI Label as a submodule..."
        git submodule add https://github.com/QTIM-Lab/segmentationMonaiLabel monailabel
    else
        echo "Submodule exists. Updating..."
        git submodule update --init --recursive
        git submodule update --remote --merge  # Fetch the latest changes from the submodule
    fi
}

# Run the initialization function
initialize_submodule

# Optionally, you can also add commands to build or run your Docker containers
echo "Starting Docker containers... with docker compose up -d."
echo "If you get a docker compose error try with 'docker-compose'."
docker compose up -d  # or include specific files if necessary