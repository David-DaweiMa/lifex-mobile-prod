# PowerShell script to deploy Supabase Edge Function for AI Chat

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LifeX - AI Chat Function Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "[1/5] Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCli) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Supabase CLI first:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "[2/5] Checking Supabase authentication..." -ForegroundColor Yellow
$loginStatus = supabase status 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in to Supabase" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Attempting to login..." -ForegroundColor Yellow
    supabase login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Authenticated" -ForegroundColor Green
Write-Host ""

# Check if project is linked
Write-Host "[3/5] Checking project link..." -ForegroundColor Yellow
$projectLinked = Test-Path ".\.supabase\config.toml"

if (-not $projectLinked) {
    Write-Host "⚠️  Project not linked" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please enter your Supabase project reference (from dashboard URL):" -ForegroundColor Yellow
    Write-Host "Example: if URL is https://app.supabase.com/project/abcdef123456" -ForegroundColor Gray
    Write-Host "Then project-ref is: abcdef123456" -ForegroundColor Gray
    Write-Host ""
    $projectRef = Read-Host "Project reference"
    
    if ([string]::IsNullOrWhiteSpace($projectRef)) {
        Write-Host "❌ Project reference is required" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Linking project..." -ForegroundColor Yellow
    supabase link --project-ref $projectRef
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to link project" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Project linked" -ForegroundColor Green
Write-Host ""

# Deploy the function
Write-Host "[4/5] Deploying chat function..." -ForegroundColor Yellow
Write-Host "This may take a minute..." -ForegroundColor Gray
Write-Host ""

supabase functions deploy chat

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Check that supabase/functions/chat/index.ts exists" -ForegroundColor White
    Write-Host "  2. Verify you have permissions on the Supabase project" -ForegroundColor White
    Write-Host "  3. Check Supabase CLI is up to date: npm update -g supabase" -ForegroundColor White
    exit 1
}

Write-Host "✅ Function deployed successfully" -ForegroundColor Green
Write-Host ""

# Set secrets
Write-Host "[5/5] Configuring secrets..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please enter your OpenAI API Key:" -ForegroundColor Yellow
Write-Host "(Get it from: https://platform.openai.com/api-keys)" -ForegroundColor Gray
Write-Host ""
$openaiKey = Read-Host "OpenAI API Key" -AsSecureString
$openaiKeyPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($openaiKey))

if ([string]::IsNullOrWhiteSpace($openaiKeyPlain)) {
    Write-Host "⚠️  Skipping OpenAI API key configuration" -ForegroundColor Yellow
    Write-Host "You can set it later with: supabase secrets set OPENAI_API_KEY=your_key" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "Setting OpenAI API key..." -ForegroundColor Yellow
    $env:OPENAI_API_KEY = $openaiKeyPlain
    supabase secrets set OPENAI_API_KEY="$openaiKeyPlain"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ OpenAI API key configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Failed to set API key" -ForegroundColor Yellow
        Write-Host "You can set it manually: supabase secrets set OPENAI_API_KEY=your_key" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Setting OpenAI model..." -ForegroundColor Yellow
supabase secrets set OPENAI_MODEL=gpt-4o-mini

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Model configured (gpt-4o-mini)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Verify your .env file has EXPO_PUBLIC_SUPABASE_URL set" -ForegroundColor White
Write-Host "  2. Test the chat in the app" -ForegroundColor White
Write-Host "  3. Monitor usage at: https://platform.openai.com/usage" -ForegroundColor White
Write-Host ""
Write-Host "To view function logs:" -ForegroundColor Yellow
Write-Host "  supabase functions logs chat" -ForegroundColor White
Write-Host ""
Write-Host "To update the function:" -ForegroundColor Yellow
Write-Host "  supabase functions deploy chat" -ForegroundColor White
Write-Host ""








