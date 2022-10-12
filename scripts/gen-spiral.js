const fs = require('fs')

let buffer = `GOCAD PLine 1.0
HEADER {
    name: spiral
}
PROPERTIES a
`

const scale = 0.1
const n = 720
for (let i=0; i< n; i++) {
    const angle = 0.1 * i
    const x = (2+angle**2)*Math.cos(angle)*scale
    const y = (2+angle**2)*Math.sin(angle)*scale
    const a = Math.sqrt(x**2+y**2) // attribute to plot
    buffer += `PVRTX ${i} ${x} ${y} 0 ${a}\n`
}

for (let i=0; i< n-1; i++) {
    buffer += `SEG ${i} ${i+1}\n`
}

buffer += 'END\n'

fs.writeFileSync('../data/spiral.pl', buffer, 'utf8')
