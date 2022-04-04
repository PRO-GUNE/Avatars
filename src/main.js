///////////////////////////// Dependencies //////////////////////////////////

// File system operations
const fs = require('fs')
const path = require('path')
const console = require('console')

// Canvas to create images: 
//      *)  createCanvas function to create the canvas to draw the image
//      *)  loadImage function to load image data of the layers
const {createCanvas, loadImage} = require('canvas')

// Set the basePath of the current directory and load the local dependencies
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);

const {
    description,
    baseURI,
    layersOrder,
    format,
    uniqueDNATolerance,
    editionSize
} = require(`${basePath}\\src\\config.js`)

const {cleanName, getRarity} = require(`${basePath}\\utils\\parse.js`)

// Required directories
const buildDir = `${basePath}\\build`
const layersDir = `${basePath}\\layers`

// Data attributes
const metadataList = []
const attributesList = []
const dnaList = []

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
            rarity:getRarity(name) 
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
            elements: getElements(`${layersDir}\\${layerObj.name}`)
        })
    )
    return layers
}

///////////////////////////////////////////////////////////////////////

//////////////////// Drawing Images on Canvas /////////////////////////

const canvas = createCanvas(format.width, format.height)
const ctx = canvas.getContext("2d")

// Save a drawn layer
const saveImage = (_edition) =>{
    /**
     * Saves the drawn layer onto the canvas
     * @param _edition The curren edition being drawn
     */
    fs.writeFileSync(`${buildDir}\\${_edition}.png`, canvas.toBuffer("image/png"))
}

// Load layers onto the canvas
const loadLayer = async (_layer) =>{
    return new Promise (async (resolve, reject)=>{
        let element = _layer.elements[Math.floor(Math.random() * _layer.elements.length)]
        const image = await loadImage(`${layersDir}\\${_layer.name}\\${element.filename}`)
        resolve(image)
    })
}


// drawing the layers on the canvas
const drawLayer = async (image, _edition) =>{
    /**
     * Draws a single layer onto the canvas
     * @param image The image to be drawn on the canvas
     * @param _edition The edition of the layer being drawn
     */

    ctx.drawImage(image, 0, 0, format.width, format.height)
}

//////////////////////////////////////////////////////////////////////


const createEdition = async () => {
    //  Create the build folder
    buildFolder()
    const layers  = layerSetup(layersOrder)

    // Create the editions and save to the 
    for(let _edition=1; _edition<=editionSize; _edition++){
        
        let loadedLayers = []

        layers.forEach(_layer =>{
            loadedLayers.push(loadLayer(_layer))
        })

        await Promise.all(loadedLayers).then((layers)=>{
            ctx.clearRect(0, 0, format.width, format.height)
            layers.forEach((layerImage)=>{
                drawLayer(layerImage, _edition)
            })

            saveImage(_edition)
        })

    }
}


module.exports = {
    createEdition
}