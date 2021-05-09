const LiquidityFarmingProxy = artifacts.require("LiquidityFarmingProxy");
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
    return deployer.deploy(LiquidityFarmingProxy, accounts[0]).then(res => {
        console.log('constructor[0]:' + accounts[0]);
    });

};
