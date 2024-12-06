const { CONFIG } = require("../../dist/config/index.js");

module.exports = {
    development: CONFIG.DATABASE.development,
    test: CONFIG.DATABASE.test,
    production: CONFIG.DATABASE.production,
};
