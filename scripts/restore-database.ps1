# Database Restore Script for Windows PowerShell
# Usage: .\scripts\restore-database.ps1 <backup-file>

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

if (!(Test-Path $BackupFile)) {
    Write-Host "❌ Backup file not found: $BackupFile" -ForegroundColor Red
    Write-Host "📋 Available backups:" -ForegroundColor Cyan
    $backups = Get-ChildItem "backups\*.sql" -ErrorAction SilentlyContinue
    if ($backups) {
        $backups | ForEach-Object { Write-Host "   $($_.Name)" -ForegroundColor Gray }
    } else {
        Write-Host "   No backups found" -ForegroundColor Gray
    }
    exit 1
}

# Load environment variables from .env file
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

Write-Host "⚠️  WARNING: This will replace ALL data in your database!" -ForegroundColor Red
Write-Host "📁 Backup file: $BackupFile" -ForegroundColor Cyan
$BackupSize = (Get-Item $BackupFile).Length / 1KB
Write-Host "📊 Backup size: $($BackupSize.ToString('F2')) KB" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Are you sure you want to continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Restore cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host "🔄 Restoring database from backup..." -ForegroundColor Yellow

# Extract database connection details
$DatabaseUrl = $env:DATABASE_URL

if ($DatabaseUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)") {
    $DbUser = $matches[1]
    $DbPass = $matches[2]
    $DbHost = $matches[3]
    $DbPort = $matches[4]
    $DbName = $matches[5]
} else {
    Write-Host "❌ Could not parse DATABASE_URL" -ForegroundColor Red
    exit 1
}

# Set password environment variable
$env:PGPASSWORD = $DbPass

try {
    # Restore using psql
    & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $BackupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database restored successfully from $BackupFile" -ForegroundColor Green
    } else {
        Write-Host "❌ Restore failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error during restore: $_" -ForegroundColor Red
    Write-Host "💡 Make sure psql is installed and in your PATH" -ForegroundColor Yellow
    exit 1
}
