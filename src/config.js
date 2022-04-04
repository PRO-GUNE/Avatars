// Configuration file
const description = "This is an nft art generator that generates art using given set of layers"
const baseURI = "ipfs://"

// Directories
const layersDir = './layers'
const buildDir = './build'

// The order of the layers
const layersOrder = [
    { name:"Background" },
    { name:"Sweater" },
    { name:"Face"},
    { name:"Hat Bottom"}
]

// Image format
const format = {
    width:512,
    height:512
}

// Repetitions tolerated
const uniqueDNATolerance = 200

// Number of nfts in the edition
const editionSize = 20

// Delimiter to state rarity. 
// Note: The rarity is given in the filename as a percentage value (i.e 20% = filename_20.svg)
const rarityDelimiter = '_'

// Adjectives to create unique names for meta data
const adjectives = "thankful,awful,jolly,adventurous,jealous,black,talented,thankful,motionless,tasty,obnoxious,quaint,breakable,gleaming,unusual,combative,unsightly,zealous,scary,helpful,wandering,glamorous,agreeable,aggressive,shy,nutty,lively,tender,shiny,arrogant,fair,upset,pleasant,tame,defeated,victorious,alive,relieved,brave,embarrassed,panicky,zany,nervous,repulsive,elated,blushing,gentle,lazy,modern,dark".split(',')

module.exports = {
    baseURI,
    buildDir, 
    layersDir,
    layersOrder,
    format,
    adjectives,
    uniqueDNATolerance,
    editionSize,
    rarityDelimiter
}