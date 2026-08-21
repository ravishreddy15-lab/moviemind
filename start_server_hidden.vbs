Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\ravis\OneDrive\Documents\Default Project\moviemind"
WshShell.Run "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000", 0, False
