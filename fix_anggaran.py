import re

with open('C:\\Users\\linta\\Pictures\\simpel\\src\\app\\components\\pages\\AnggaranRealisasi.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the section
old_pattern = r'const paguTotal = globalPagu\[selectedYear\] \|\| 0;\n\nconst realizationsPerBulan = Array\(12\)\.fill\(0\);'
new_content = '''const paguTotal = globalPagu[selectedYear] || 0;

  // Hitung total realization dari dataUraian (leaf nodes)
  const leafUraian = dataUraian.filter(u => {
    const hasChildren = dataUraian.some(child => child.kode.startsWith(u.kode + '.') && child.kode !== u.kode);
    return !hasChildren && u.level > 1;
  });

  const totalRealisasiFromUraian = leafUraian.reduce((sum, u) => sum + (u.realisasi || 0), 0);

  const realizationsPerBulan = Array(12).fill(0);'''

content = re.sub(old_pattern, new_content, content)

# Also update the totalRealisasi calculation
old_total = r'const totalRealisasi = realizationsPerBulan\.reduce\(\(sum, v\) => sum \+ v, 0\);'
new_total = 'const totalRealisasi = totalRealisasiFromUraian + realizationsPerBulan.reduce((sum, v) => sum + v, 0);'

content = re.sub(old_total, new_total, content)

with open('C:\\Users\\linta\\Pictures\\simpel\\src\\app\\components\\pages\\AnggaranRealisasi.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
