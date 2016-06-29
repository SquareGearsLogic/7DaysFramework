var moFs = require('fs');

module.exports = {
    /**
     * Removes directory with subdirectories and files, like 
     * 'rm -rf folder_or_file'
     **/
    rmrf: function(path) {
        if (moFs.existsSync(path)) {
            moFs.readdirSync(path).forEach(function(file, index) {
                var curPath = path + "/" + file;
                if (moFs.lstatSync(curPath).isDirectory()) { // recurse
                    this.rmrf(curPath);
                }
                else { // delete file
                    moFs.unlinkSync(curPath);
                }
            });
            moFs.rmdirSync(path);
        }
    },

};
