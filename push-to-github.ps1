# Push pet-verse-social to https://github.com/framvieiralima-byte/new
# Run in PowerShell from project root: .\push-to-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path .git)) {
  git init
  git branch -M main
}
try { git remote remove origin } catch {}
git remote add origin https://github.com/framvieiralima-byte/new.git
git add .
$status = git status --porcelain
if ($status) { git commit -m "Add pet-verse 3D simulator (React Three Fiber, Supabase)" }
# Pull remote (e.g. initial README) and merge, then push
git pull origin main --allow-unrelated-histories --no-edit 2>$null
git push -u origin main
