const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
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
    let name = config.payment.name;
    let symbol = config.payment.symbol;
    let dev = config.dev;
    return deployer.deploy(PaymentFarmingProxy, name, symbol, accounts[0], dev).then(res => {
        console.log('constructor[0]:' + name);
        console.log('constructor[1]:' + symbol);
        console.log('constructor[2]:' + accounts[0]);
    });

};
