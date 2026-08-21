import subprocess, sys, os

DETACHED = subprocess.DETACHED_PROCESS | subprocess.CREATE_NO_WINDOW

proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"],
    cwd=r"C:\Users\ravis\OneDrive\Documents\Default Project\moviemind",
    creationflags=DETACHED,
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
)
print(f"Server started with PID {proc.pid}")
