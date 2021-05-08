const BStablePool = artifacts.require("BStablePool");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config;
    if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        config = data[97];
    } else if (deployer.network_id == 56) {
        config = data[56];
    } else {
        return;
    }
    let _owner = config.owner;
    return BStablePool.deployed().then(pool => {
        pool.transferOwnership(_owner);
    });

};
