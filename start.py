#!/usr/bin/env python3
"""
Startup script for Railway deployment
Handles PORT environment variable properly
"""
import os
import subprocess
import sys

def main():
    # Get port from environment variable, default to 8000
    port = os.getenv('PORT', '8000')
    
    print(f"🚀 Starting Routing AI Agent on port {port}")
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print(f"PYTHONPATH: {os.getenv('PYTHONPATH', 'not set')}")
    
    # Start uvicorn with the correct port
    cmd = [
        'uvicorn',
        'app.main:app',
        '--host', '0.0.0.0',
        '--port', str(port)
    ]
    
    print(f"Executing: {' '.join(cmd)}")
    
    # Execute uvicorn
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("🛑 Server stopped by user")
        sys.exit(0)

if __name__ == '__main__':
    main()
