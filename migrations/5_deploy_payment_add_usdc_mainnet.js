const BStablePayment = artifacts.require("BStablePayment");

module.exports = function (deployer, network, accounts) {

    if (deployer.network.indexOf('skipMigrations') > -1) { // skip migration
        return;
    }
    if (deployer.network.indexOf('_test') > -1) { // skip migration
        return;
    }
    if (deployer.network.indexOf('kovan_oracle') > -1) { // skip migration
        return;
    }
    if (deployer.network_id == 4) { // Rinkeby
    } else if (deployer.network_id == 1) { // main net
    } else if (deployer.network_id == 42) { // kovan
    } else if (deployer.network_id == 56) { // bsc main net
        let usdcAddress = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
        BStablePayment.deployed().then(payment => {
            return payment.addCoins(usdcAddress, 0);
        });
        // BStablePayment.at('').then(payment => {
        //     return payment.addCoins(usdcAddress, 0);
        // });
    } else if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        let usdcAddress = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
        BStablePayment.deployed().then(payment => {
            return payment.addCoins(usdcAddress, 0);
        });
        // BStablePayment.at('').then(payment => {
        //     return payment.addCoins(usdcAddress, 0);
        // });
    } else {

    }

};
