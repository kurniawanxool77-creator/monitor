$f = Get-Content 'C:\Users\linta\Pictures\simpel\src\app\components\pages\AnggaranRealisasi.jsx' -Encoding UTF8

$f[40] = "  const paguTotal = globalPagu[selectedYear] || 0;"
$f[41] = ""
$f[42] = "  // Hitung total realization dari dataUraian (leaf nodes)"
$f[43] = "  const leafUraian = dataUraian.filter(u => {"
$f[44] = "    const hasChildren = dataUraian.some(child => child.kode.startsWith(u.kode + '.') && child.kode !== u.kode);"
$f[45] = "    return !hasChildren && u.level > 1;"
$f[46] = "  });"
$f[47] = ""
$f[48] = "  const totalRealisasiFromUraian = leafUraian.reduce((sum, u) => sum + (u.realisasi || 0), 0);"
$f[49] = ""
$f[50] = "  const realizationsPerBulan = Array(12).fill(0);"

$f | Set-Content 'C:\Users\linta\Pictures\simpel\src\app\components\pages\AnggaranRealisasi.jsx' -Encoding UTF8

Write-Host "Done!"
