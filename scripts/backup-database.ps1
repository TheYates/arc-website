# Database Backup Script for Windows PowerShell
# Usage: .\scripts\backup-database.ps1 [backup-name]

param(
    [string]$BackupName = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

# Load environment variables from .env file
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$BackupDir = "backups"
$BackupFile = "$BackupDir\$BackupName.sql"

# Create backups directory if it doesn't exist
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir
}

Write-Host "🔄 Creating database backup..." -ForegroundColor Yellow
Write-Host "📁 Backup location: $BackupFile" -ForegroundColor Cyan

# Extract database connection details from DATABASE_URL
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

# Set password environment variable for pg_dump
$env:PGPASSWORD = $DbPass

try {
    # Create backup using pg_dump
    & pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName --verbose --no-owner --no-privileges --format=plain --file=$BackupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup created successfully: $BackupFile" -ForegroundColor Green
        $BackupSize = (Get-Item $BackupFile).Length / 1KB
        Write-Host "📊 Backup size: $($BackupSize.ToString('F2')) KB" -ForegroundColor Green
        
        # List recent backups
        Write-Host ""
        Write-Host "📋 Recent backups:" -ForegroundColor Cyan
        Get-ChildItem "$BackupDir\*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 5 | ForEach-Object {
            $size = ($_.Length / 1KB).ToString('F2')
            Write-Host "   $($_.Name) - $size KB - $($_.LastWriteTime)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Backup failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error during backup: $_" -ForegroundColor Red
    Write-Host "💡 Make sure pg_dump is installed and in your PATH" -ForegroundColor Yellow
    Write-Host "   You can install it with PostgreSQL client tools" -ForegroundColor Yellow
    exit 1
}
