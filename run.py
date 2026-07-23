"""
MovieMind AI - Single Command Launcher
Run this from anywhere:
    python run.py
"""
import subprocess
import sys
import os

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_DIR, "backend")
DIST_DIR = os.path.join(PROJECT_DIR, "dist")

print("=" * 50)
print("  MovieMind AI - Starting Application")
print("=" * 50)

# Step 1: Build frontend if dist/ is missing or stale
if not os.path.exists(DIST_DIR):
    print("\n[1/2] Building React frontend...")
    node_bin = os.path.join(PROJECT_DIR, ".node-local", "node-v20.18.1-win-x64")
    env = os.environ.copy()
    if os.path.exists(node_bin):
        env["PATH"] = node_bin + ";" + env.get("PATH", "")
    env["COREPACK_ENABLE_STRICT"] = "0"
    subprocess.run(["npx", "vite", "build"], cwd=PROJECT_DIR, env=env, check=True)
    print("  Frontend built!")
else:
    print("\n[1/2] Frontend already built (delete dist/ to rebuild)")

# Step 2: Start uvicorn
print("\n[2/2] Starting server on http://localhost:8000\n")
print("  Open http://localhost:8000 in your browser\n")
subprocess.run(
    [sys.executable, "-m", "uvicorn", "backend.main:app",
     "--host", "0.0.0.0", "--port", "8000"],
    cwd=PROJECT_DIR,
)
