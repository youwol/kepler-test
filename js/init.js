function init() {
    const three = globalThis['THREE']
    const extra = globalThis['@youwol/three-extra']

    kepler.getColorMapNames().forEach( name => {
        kepler.ColorMap.addColorMap(name, kepler.getColorMap(name, 40, false).colors)
    })
    console.log('List of color tables:\n', kepler.colorMapNames())
    
    scene = new three.Scene
    group = new three.Group
    scene.add(group)
    lights = undefined

    camera = new three.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.01, 100000 )
    camera.position.z = 100

    renderer = new three.WebGLRenderer({alpha: true})
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize( window.innerWidth, window.innerHeight )
    renderer.shadowMap.enabled = true
    document.body.appendChild( renderer.domElement )

    renderFct = new extra.RenderFunctions({renderer, scene, camera})

    window.addEventListener( 'resize', onWindowResize )

    controls = new three.TrackballControls( camera, renderer.domElement )
    controls.rotateSpeed = 3.0
    // controls.zoomSpeed = 1.2
    // controls.panSpeed = 0.8
    renderFct.add( controls.update )

    cube = new extra.installNavigationCube(
        new extra.NavigationCubeParameters({
            scene, 
            camera, 
            renderer,
            controls, 
            renderFunctions: renderFct, // will also add the cube in renderFct
            labels: ['Right', 'Left', 'Up', 'Down', 'Front', 'Back'],
            // labels: ['East', 'West', 'Up', 'Down', 'South', 'North'],
            // labels: ['Y', '-Y', 'Z', '-Z', 'X', '-X'],

            domElement : document.getElementById('orientCubeWrapper'),
            domHome    : document.getElementById('goHome'), 
            domSaveHome: document.getElementById('saveHome')
        })
    )
}

function btnSVGExport() {
    const rendererSVG = new THREE.SVGRenderer()
    rendererSVG.setSize(window.innerWidth, window.innerHeight)
    rendererSVG.render(scene, camera)
    exportToSVG(rendererSVG, "test.svg")
}
  
function exportToSVG(rendererSVG, filename) {
    const XMLS = new XMLSerializer()
    const svgfile = XMLS.serializeToString(rendererSVG.domElement)
    const svgData = svgfile
    const preface = '<?xml version="1.0" standalone="no"?>\r\n'
    const svgBlob = new Blob([preface, svgData], {
        type: "image/svg+xml;charset=utf-8"
    })
    const svgUrl = URL.createObjectURL(svgBlob)
    const downloadLink = document.createElement("a")
    
    downloadLink.href = svgUrl
    downloadLink.download = filename
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
}

function takeScreenshot() {
    // open in new window like this
    //
    const w = window.open('', '')
    w.document.title = "Screenshot"
    const img = new Image()
    // Without 'preserveDrawingBuffer' set to true, we must render now
    renderer.render(scene, camera)
    img.src = renderer.domElement.toDataURL()
    w.document.body.appendChild(img)
}
