const config = require("../configs/main.js");

module.exports = {
    LOG
}

function LOG(txt) {
    if(config.debug)
        console.log(txt);
}