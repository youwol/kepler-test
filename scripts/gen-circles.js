const fs = require('fs')

class LinesBuilder {
    constructor() {
        this.clear()
    }
    clear() {
        this.s       = ''
        this.id      = 0
        this.beginId = 0
        this.endId   = 0
    }
    startLine() {
        this.id = 0
        this.s += `GOCAD PLine 1.0
        HEADER {
            name: circle
        }
        `
    }
    add(x,y,z) {
        this.s += `VRTX ${this.id} ${x} ${y} ${z}\n`
        this.id++
    }
    endLine() {
        for (let i=0; i<this.id-1; ++i) {
            this.s += `SEG ${i} ${i+1}\n`
        }
        this.s += 'END\n'
    }
    get buffer() {
        return this.s
    }
}

const r = 1.001
const l = new LinesBuilder()

l.startLine()
for (let i=0; i<360; i++) {
    const a = i*Math.PI/180
    l.add(r*Math.cos(a), r*Math.sin(a), 0)
}
l.endLine()

l.startLine()
for (let i=0; i<360; i++) {
    const a = i*Math.PI/180
    l.add(r*Math.cos(a), 0, r*Math.sin(a))
}
l.endLine()

l.startLine()
for (let i=0; i<360; i++) {
    const a = i*Math.PI/180
    l.add(0, r*Math.cos(a), r*Math.sin(a))
}
l.endLine()

fs.writeFileSync('../data/circles.pl', l.buffer, 'utf8')
