// Contains the utility functions for parsing filenames

// Rarity convention
const rarities = [
    {key:'', val:'original'},
    {key:'_r', val:'rare'},
    {key:'_sr', val:'super rare'},
]

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

    let rarity;
    rarities.forEach((r)=>{
        if(_filename.includes(r.key)){
            rarity = r.val
        }
    })
    
    return rarity
}   

module.exports = {
    cleanName, getRarity
}
