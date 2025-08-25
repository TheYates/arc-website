# Quick Recovery Script - Restore essential functionality after database reset
# Usage: .\scripts\quick-recovery.ps1

Write-Host "Quick Database Recovery" -ForegroundColor Red
Write-Host "======================" -ForegroundColor Red
Write-Host ""

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Apply current database schema" -ForegroundColor Gray
Write-Host "2. Seed common medications" -ForegroundColor Gray
Write-Host "3. Create an admin user" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Proceed with recovery? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Recovery cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Step 1: Applying database schema..." -ForegroundColor Yellow
try {
    & npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Migration failed, trying db push..." -ForegroundColor Red
        & npx prisma db push
    }
    Write-Host "Schema applied successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to apply schema: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Generating Prisma client..." -ForegroundColor Yellow
try {
    & npx prisma generate
    Write-Host "Prisma client generated" -ForegroundColor Green
} catch {
    Write-Host "Failed to generate client: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 3: Seeding common medications..." -ForegroundColor Yellow
try {
    # Try to seed medications using Prisma
    & npx tsx scripts/seed-common-medications.ts
    Write-Host "Medications seeded successfully" -ForegroundColor Green
} catch {
    Write-Host "Medication seeding failed, but continuing..." -ForegroundColor Yellow
    Write-Host "   You can add medications manually through the UI" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 4: Creating admin user..." -ForegroundColor Yellow
try {
    if (Test-Path "scripts/create-admin.ts") {
        & npx tsx scripts/create-admin.ts
        Write-Host "Admin user created successfully" -ForegroundColor Green
    } else {
        Write-Host "Admin creation script not found" -ForegroundColor Yellow
        Write-Host "   You can create an admin user manually" -ForegroundColor Gray
    }
} catch {
    Write-Host "Admin user creation failed" -ForegroundColor Yellow
    Write-Host "   You may need to create one manually" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Recovery completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test your application login" -ForegroundColor Gray
Write-Host "2. Add any missing data manually" -ForegroundColor Gray
Write-Host "3. Set up automatic backups using the backup scripts" -ForegroundColor Gray
Write-Host ""
Write-Host "For future database changes, use:" -ForegroundColor Yellow
Write-Host "   .\scripts\backup-database.ps1" -ForegroundColor Gray
Write-Host "   # then make your changes" -ForegroundColor Gray
Write-Host ""
