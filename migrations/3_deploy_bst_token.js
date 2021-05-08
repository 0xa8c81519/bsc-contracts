const BSTToken = artifacts.require("BSTToken");
const BSTMinter = artifacts.require("BSTMinter");
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
    return BSTMinter.deployed().then(minter => {
        return deployer.deploy(BSTToken, accounts[0], minter.address, config.investors).then(res => {
            console.log('constructor[0]:' + accounts[0]);
            console.log('constructor[1]:' + minter.address);
            console.log('constructor[2]:' + JSON.stringify(config.investors));
        });
    });
};
