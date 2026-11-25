Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting StudyScout - AI Research Agent for Students" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Set-Location -Path "$PSScriptRoot\server"
node --import tsx src/index.ts
