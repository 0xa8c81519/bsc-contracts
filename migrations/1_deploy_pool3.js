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
    let usdcAddress = config.usdc;
    let busdAddress = config.busd;
    let usdtAddress = config.usdt;
    let _owner = config.owner;
    let stableCoins = [usdcAddress, busdAddress, usdtAddress];
    let A = config.pool3.A;
    let fee = config.pool3.fee; // 0.003
    let adminFee = config.pool3.adminFee; // 2/3
    let name = config.pool3.name;
    let symbol = config.pool3.symbol;
    return deployer.deploy(BStablePool, name, symbol, stableCoins, A, fee, adminFee, _owner).then(res => {
        console.log('constructor[0]:' + name);
        console.log('constructor[1]:' + symbol);
        console.log('constructor[2]:' + JSON.stringify(stableCoins));
        console.log('constructor[3]:' + A);
        console.log('constructor[4]:' + fee);
        console.log('constructor[5]:' + adminFee);
        console.log('constructor[6]:' + _owner);
    });

};
