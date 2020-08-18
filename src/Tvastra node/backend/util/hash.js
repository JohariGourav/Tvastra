const bcrypt = require("bcrypt");

// create password HASH
function generatePasswordHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

// validate password hash
const validatePasswordHash = function(user, password) {
    return bcrypt.compareSync(password, user.password);
}

module.exports = {
    generatePasswordHash: generatePasswordHash,
    validatePasswordHash: validatePasswordHash
};