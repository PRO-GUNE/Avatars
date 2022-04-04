///////////////////////////// Dependencies //////////////////////////////////

// File system operations
const fs = require('fs')
const sharp = require('sharp')
const console = require('console')

// Set the basePath of the current directory and load the local dependencies
const {
    description,
    baseURI,
    buildDir, 
    layersDir,
    layersOrder,
    format,
    adjectives,
    uniqueDNATolerance,
    editionSize,
    rarityDelimiter
} = require('./config.js')

// Data attributes
const dnaGenerated = {}
const namesGenerated = {}

/////////////////////////////////////////////////////////////////////////////

//////////////////////// File/Folder Operations ////////////////////////////

// Create the build folder
const buildFolder = () =>{
    /**
     *  Removes the build folder if it exists and creates a new
     *  build folder
    */
    if(fs.existsSync(`${buildDir}`)){
        fs.rmSync(`${buildDir}`, {recursive: true})
    }

    fs.mkdirSync(`${buildDir}`)
}


///////////////////////////////////////////////////////////////////////

//////////////////////// Helper functions /////////////////////////////

// Clean the filename of the file extension
const cleanName = (_filename) =>{
    /**
     * Cleans the filename of the file extension and returns the name
     * Also rarity symbols are removed from the filename
     * @param _filename The name of the file
     */

    let name =  _filename.slice(0,-4)
    if(name.includes('_')){
        name = name.split('_')[0]
    }
    
    return name
}

// Get the rarity of the element
const getRarity = (_filename) =>{
    /**
     * Get the rarity of the element according to the given convention
     * @param _filename The name of the file
     */
    let rarity=1

    if(_filename.includes(rarityDelimiter)){
        rarity = parseInt(_filename.split(rarityDelimiter)[1].slice(0,2))/100
    }
    
    return 1
}  

// Calculate overall rarity
const calcRarity = (_elements)=>{
    let rarity=0
    _elements.forEach((e)=>{
        rarity*=e.rarity
    })
    return rarity
}

// Get the elements within each _layer sub folder
const getElements = (path) =>{
    /**
     *   Gets the elements within the path specified
     *   @param path The path to the folder containing the elements  
    */

    const filenames = fs.readdirSync(path)
    return filenames.map((name, index)=>{
         return {
            id: index+1,
            name: cleanName(name),
            filename: name,
            rarity: getRarity(name) 
         }
    })
}

// Setting up the layers using the layerOrder
const layerSetup = (layersOrder) =>{
    /**
     * Create the list of layers with a comprehensive _layer object 
     * for each _layer
     * @param layersOrder list of names of the layers
     */

    let layers = layersOrder.map((layerObj, index)=>({
            id: index,
            name: layerObj.name,
            path: `${layersDir}/${layerObj.name}`,
            elements: getElements(`${layersDir}/${layerObj.name}`)
        })
    )
    return layers
}

////////////////////////////////////////////////////////////////////////

//////////////////// Save Image as SVG and PNG /////////////////////////

// SVG template to create an image
const svgTemplate = `<svg width="${format.width}" height="${format.height}" viewBox="0 0 ${format.width} ${format.height}" fill="none" xmlns="http://www.w3.org/2000/svg">
${layersOrder.map((_layer)=>"<!--"+_layer.name+"-->").join('\n')}
</svg>`

const randomIndex = (_length)=>(Math.floor(Math.random()*_length))

const getRandomElement = (_elements) =>{
    const index = randomIndex(_elements.length)
    let element = _elements[index]
    if(Math.random()<element.rarity){
        return {'index':index, 'element':element}
    }

    return getRandomElement(_elements)

}

// Choose random layers
const getRandomLayers = (_layers) =>{
    let selectedElements = []
    _layers.forEach(_layer =>{
        selectedElements.push({ 'layer':_layer, 
                                'element':getRandomElement(_layer.elements).element, 
                                'index':getRandomElement(_layer.elements).index
                            })
    })
    const randomLayers = selectedElements.map((item)=>loadLayer(item))
    const dna = selectedElements.map((item)=>item.index).join('')

    if (dnaGenerated[dna]){
        return getRandomLayers(_layers)
    }

    dnaGenerated[dna]=dna
    return randomLayers
}

// Load layers onto the canvas
const loadLayer = (item) => {
    /**
     * Load the required layer and returns a Promise that resolves to the image data
     * @param item a mapping containing the layer and the chosen element
     */
    let {layer, element} = item 
    const svg = fs.readFileSync(`${layer.path}/${element.filename}`, 'utf-8');
    const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
    const returnlayer = svg.match(re)[0];

    return {element:element, svg:returnlayer}
}

// generate a random name
const randomName = (_name)=>{
    let _adjective = adjectives[randomIndex(adjectives.length)]
    let name =`${_adjective}-${_name}`
    if(namesGenerated[name]){
        return randomName(_name)
    }
    namesGenerated[name] = name
    return name
}

// drawing the layers on the canvas
const renderImage = (_selectedLayers, _edition) =>{
    /**
     * Draws a single layer onto the canvas
     * @param _selectedLayers The layers selected to be rendered
     * @param _edition The edition of the layer being drawn
     */
    let template = svgTemplate
    const names = _selectedLayers.map(_layer => _layer.element.name)
    const svgPaths = _selectedLayers.map(_layer => _layer.svg)
    const elements = _selectedLayers.map(_layer => _layer.element)

    layersOrder.forEach((_layer, index) => {
        template = template.replace(`<!--${_layer.name}-->`, svgPaths[index])
    })

    const name = randomName(names[2])
    console.log(name);

    const rarity = calcRarity(elements)

    const meta = {
        name,
        description: `${names[2]} feeling ${names[0]} wearing a ${names[1]} and a ${names[3]}`,
        image: `${_edition}.png`,
        attributes: {
            rarity
        }
    }

    const path = `./${buildDir}/${_edition}`
    fs.writeFileSync(`${path}.json`, JSON.stringify(meta))
    fs.writeFileSync(`${path}.svg`, template)
    savetoPNG(path) 
}

// Save to PNG format
const savetoPNG = async (path)=>{
    const svg = `${path}.svg`
    const png = `${path}.png`

    const img = await sharp(svg);
    const resized = await img.resize(1024);
    await resized.toFile(png);
}

//////////////////////////////////////////////////////////////////////


const createEdition = async () => {
    //  Create the build folder
    buildFolder()
    const layers  = layerSetup(layersOrder)

    // Create the editions and save to the 
    for(let _edition=1; _edition<=editionSize; _edition++){
        let selectedLayers = getRandomLayers(layers)
        renderImage(selectedLayers, _edition)
    } 
}


module.exports = {
    createEdition
}