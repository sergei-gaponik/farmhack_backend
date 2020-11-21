const crypto = require('crypto');

const secureHash = (password, salt) => crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");

module.exports.passwordHash = password => secureHash(password,  process.env.SALT);

module.exports.passwordVerify = (hash, password) => {
    return crypto.timingSafeEqual(
        Buffer.from(secureHash(password, process.env.SALT)), Buffer.from(hash)
    )
}
