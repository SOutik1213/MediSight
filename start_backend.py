#!/usr/bin/env python3
"""
Startup script for the MediSight backend server
"""
import subprocess
import sys
import os

def main():
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    
    print("Starting MediSight Backend Server...")
    print("Backend will be available at: http://localhost:5000")
    print("API endpoints:")
    print("  - Health check: GET /api/health")
    print("  - Prediction: POST /api/predict")
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        # Start the Flask server
        subprocess.run([sys.executable, 'app.py'], check=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

