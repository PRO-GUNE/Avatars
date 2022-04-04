// Configuration file
const description = "This is an nft art generator that generates art using given set of layers"
const baseURI = ""

// The order of the layers
const layersOrder = [
    { name:"Background" },
    { name:"Sweater" },
    { name:"Face"},
    { name:"Hat Top"},
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
const editionSize = 10

module.exports = {
    description,
    baseURI,
    layersOrder,
    format,
    uniqueDNATolerance,
    editionSize
}