const BStableProxyV2 = artifacts.require("BStableProxyV2");
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
    return BStableProxyV2.deployed().then(proxy => {
        return proxy.transferOwnership(_owner);
    });

};
