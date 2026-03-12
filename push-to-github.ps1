# Push pet-verse-social to https://github.com/framvieiralima-byte/new
# Run in PowerShell from project root: .\push-to-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path .git)) {
  git init
  git branch -M main
}
git remote remove origin 2>$null
git remote add origin https://github.com/framvieiralima-byte/new.git
git add .
git status
git commit -m "Add pet-verse 3D simulator (React Three Fiber, Supabase)" 2>$null
git push -u origin main
