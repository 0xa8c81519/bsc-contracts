const BStablePayment = artifacts.require("BStablePayment");
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
    let busdAddress = config.busd;
    return BStablePayment.deployed().then(payment => {
        return payment.addCoins(busdAddress, 1);
    });

};
