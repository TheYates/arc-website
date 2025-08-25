# Always run this before making database changes!
# Usage: .\scripts\backup-before-changes.ps1 "description-of-changes"

param(
    [string]$Description = "manual-changes"
)

$BackupName = "backup-before-$Description-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "🛡️  Safety First: Creating backup before changes" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Create backup
.\scripts\backup-database.ps1 $BackupName

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
    Write-Host "💾 Backup saved as: backups\$BackupName.sql" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔒 Your data is now safe. You can proceed with changes." -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 If something goes wrong, restore with:" -ForegroundColor Yellow
    Write-Host "   .\scripts\restore-database.ps1 backups\$BackupName.sql" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Backup failed! Do NOT proceed with changes." -ForegroundColor Red
    Write-Host "🛑 Fix backup issues first to protect your data." -ForegroundColor Red
    exit 1
}
