var moFs = require('fs');
    
module.exports = {
  rmrf: function(path) {
      if( moFs.existsSync(path) ) {
        moFs.readdirSync(path).forEach(function(file,index){
          var curPath = path + "/" + file;
          if(moFs.lstatSync(curPath).isDirectory()) { // recurse
            this.rmrf(curPath);
          } else { // delete file
            moFs.unlinkSync(curPath);
          }
        });
        moFs.rmdirSync(path);
      }
  },
       
};
