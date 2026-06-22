Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

$root = "C:\Users\linta\Pictures\simpel"
$frontend = "$root\frontend"

Remove-Item -Recurse -Force "$root\src" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$root\dist" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$root\node_modules" -ErrorAction SilentlyContinue

$filesToDelete = @("index.html", "package.json", "package-lock.json", "vite.config.ts", "tsconfig.json", "postcss.config.mjs", "pnpm-workspace.yaml", "setup.sh", "ts_errors.txt", "errors.txt", ".gitignore")
foreach ($f in $filesToDelete) {
    Remove-Item -Force "$root\$f" -ErrorAction SilentlyContinue
}

Rename-Item -Path "$frontend\src_js" -NewName "src" -ErrorAction SilentlyContinue

$vitePath = "$frontend\vite.config.js"
if (Test-Path $vitePath) {
    $viteContent = Get-Content -Path $vitePath -Raw
    $viteContent = $viteContent -replace "'./src_js'", "'./src'"
    Set-Content -Path $vitePath -Value $viteContent
}

$indexPath = "$frontend\index.html"
if (Test-Path $indexPath) {
    $indexContent = Get-Content -Path $indexPath -Raw
    $indexContent = $indexContent -replace "/src_js/", "/src/"
    Set-Content -Path $indexPath -Value $indexContent
}

Get-ChildItem -Path $frontend | Move-Item -Destination $root -Force
Remove-Item -Recurse -Force $frontend
