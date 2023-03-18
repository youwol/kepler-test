
function doLines(plines) {
    const promises = []

    if (plines) {
        plines.forEach( pline => {
            if (pline.show) {
                const promise = doPLine(pline)
                if (promise) {
                    if (Array.isArray(promise)) {
                        promises.push(...promise)
                    }
                    else {
                        promises.push(promise)
                    }
                }
            }
        })
    }

    return promises
}

function doPLine(plineInfo) {
    if (plineInfo.url === undefined) return []
    if (Array.isArray(plineInfo.url) && plineInfo.url.length===0) return []
    if (Array.isArray(plineInfo.url)) {
        const promises = []
        plineInfo.url.forEach( url => {
            const promise = doOnePline(url)
            if (promise) promises.push(promise)
        })
        return promises
    }
    else {
        return doOnePline(plineInfo.url)
    }

    function doOnePline(url) {
        const promise = fetch(url)
            .then( res => {
                if ( res.ok ) return res.text()
                return undefined
            })
            .then( buffer => {
                if (! buffer) return undefined

                const filter = io.IOFactory.getFilter(url)
                if (filter) {
                    const dfs = filter.decode(buffer, {shared: false, merge: true})
                    dfs.forEach( df => {
                        lineDataframe.push(df)
                        createGlLine(df, plineInfo)

                        if (plineInfo.show) {

                            let position = df.series.positions
                            if (plineInfo.translate) {
                                const t = plineInfo.translate
                                df.series.positions = dataframe.apply(df.series.positions, p => [p[0]+t[0], p[1]+t[1], p[2]+t[2]])
                            }
                            // console.log('min-max position pointset:', math.minMax(position) )

                            const manager = new dataframe.Manager(df, {
                                decomposers: [
                                    new math.PositionDecomposer,       // x y z
                                    new math.ComponentDecomposer,      // Ux Uy Uz Sxx Sxy Sz Syy Syz Szz
                                    new math.VectorNormDecomposer,     // U
                                    new math.EigenValuesDecomposer,    // S1 S2 S3
                                    new math.EigenVectorsDecomposer,   // S1 S2 S3
                                ],
                                dimension: 3
                            })

                            let skin = undefined
                            if (plineInfo.useTube !== undefined && plineInfo.useTube) {
                                skin = kepler.createLineset2({
                                    position: df.series.positions,
                                    parameters: {
                                        width: plineInfo.width?plineInfo.width:1,
                                        color: plineInfo.color,
                                        opacity   : plineInfo.opacity  !==undefined ? plineInfo.opacity   : 1,
                                        dashed    : plineInfo.dashed   !==undefined ? plineInfo.dashed    : false,
                                        dashScale : plineInfo.dashScale!==undefined ? plineInfo.dashScale : 0.1
                                    }
                                })
                            }
                            else {
                                skin = kepler.createLineset({
                                    position: df.series.positions,
                                    parameters: {
                                        lineWidth : plineInfo.width?plineInfo.width:1,
                                        color     : plineInfo.color,
                                        opacity   : plineInfo.opacity  !==undefined ? plineInfo.opacity   : 1,
                                        dashed    : plineInfo.dashed   !==undefined ? plineInfo.dashed    : false,
                                        dashScale : plineInfo.dashScale!==undefined ? plineInfo.dashScale : 0.1
                                    }
                                })
                            }
                            group.add( skin )

                            if (plineInfo.attr) {
                                const attrName = plineInfo.attr
                                const attr = manager.serie(1, attrName)
                                if (attr) {
                                    // const mM = math.minMaxArray(attr.array)
                                    // console.log('attr :', attrName)
                                    // console.log('min  :', mM[0].toFixed(3))
                                    // console.log('max  :', mM[1].toFixed(3))
                                    kepler.paintAttribute(skin, attr, new kepler.PaintParameters({
                                        atVertex  : true,
                                        lut       : plineInfo.lut!==undefined?plineInfo.lut: 'insar',
                                        reverseLut: plineInfo.reverseLut!==undefined?plineInfo.reverseLut: false
                                    }))
                                }
                            }
                        }
                    })
                }
            })
        return promise
    }
}

function updateLines() {
    lines.clear()
    lineDataframe.forEach( df => createGlLine(df, plines) )
}

function createGlLine(df, plineInfo) {
    const manager = new dataframe.Manager(df, {
        decomposers: [
            new math.PositionDecomposer,       // x y z
            new math.ComponentDecomposer,      // Ux Uy Uz Sxx Sxy Sz Syy Syz Szz
            new math.VectorNormDecomposer,     // U
            new math.EigenValuesDecomposer,    // S1 S2 S3
            new math.EigenVectorsDecomposer,   // S1 S2 S3
        ],
        dimension: 3
    })

    let skin = kepler.createLineset2({
        position: df.series.positions,
        parameters: {
            width  : plineInfo.width,
            color  : plineInfo.color,
            opacity: plineInfo.opacity
        }
    })
    lines.add( skin )

    if (plineInfo.attr) {
        const attrName = plineInfo.attr
        const attr = manager.serie(1, attrName)
        if (attr) {
            kepler.paintAttribute(skin, attr, new kepler.PaintParameters({
                atVertex  : true,
                lut       : plineInfo.lut!==undefined?plineInfo.lut: 'insar',
                reverseLut: plineInfo.reverseLut!==undefined?plineInfo.reverseLut: false
            }))
        }
    }
}