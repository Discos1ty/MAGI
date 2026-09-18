import subprocess
import uvicorn
import atexit
import os


BASE_DIR = os.path.dirname(os.path.abspath(__file__))     
PROJECT_ROOT = os.path.dirname(BASE_DIR)                 

def start_frontend():
    return subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=PROJECT_ROOT,
    )

if __name__ == "__main__":
    frontend_process = start_frontend()
    atexit.register(frontend_process.terminate)

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )