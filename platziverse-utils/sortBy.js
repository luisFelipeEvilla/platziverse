'use strict'

module.exports = function sortBy(property) {
    return (a, b) => {
        let aProp = a[property]
        let bProp = b[property]

        if (aProp < bProp) {
            return -1
        } else if (aProp > bProp) {
            return 1
        } else {
            return 0
        }
    }
}    
