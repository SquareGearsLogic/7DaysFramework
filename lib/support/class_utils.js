
module.exports = {
    /**
     * Searches for a given property within object
     *          obj - where to search.
     *          propertyName - a property within obj. could be comething like 
     *                          'foo.bar.baz'.
     * returns: link to the property or null if property doesn't 
     *          exist within given object.
     **/
    getProperty: function(obj, propertyName) {
        if (!propertyName)
            return null;
        
        var hasProperty = true;
        var arr = propertyName.toString().split(".");
        var prop = obj;
        for (var i in arr) {
            if (prop.hasOwnProperty(arr[i])) {
                prop = prop[arr[i]];
            }
            else {
                hasProperty = false;
                break;
            }
        }
        if (!hasProperty)
            return null;
        return prop;
    },

};
