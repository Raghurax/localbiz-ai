# LocalBiz AI - Production Full-Stack Launcher
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Starting LocalBiz AI Full-Stack Platform   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Start FastAPI Backend on port 8000
Start-Process -FilePath "cmd.exe" -ArgumentList '/k "cd /d C:\Users\Lenovo\OneDrive\Attachments\Desktop\localmak\backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"'

Write-Host "[+] Backend running on http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "[+] Swagger docs available at http://127.0.0.1:8000/docs" -ForegroundColor Green

# 2. Start Vite Frontend on port 5173
Start-Process -FilePath "cmd.exe" -ArgumentList '/k "cd /d C:\Users\Lenovo\OneDrive\Attachments\Desktop\localmak\frontend && npm run dev -- --host 127.0.0.1 --port 5173"'

Write-Host "[+] Frontend running on http://127.0.0.1:5173" -ForegroundColor Green
Write-Host "LocalBiz AI is ready! Open http://127.0.0.1:5173 in your browser." -ForegroundColor Yellow