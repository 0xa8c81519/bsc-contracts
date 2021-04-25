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
        let usdtAddress = '0x55d398326f99059ff775485246999027b3197955';
        return BStablePayment.deployed().then(payment => {
            return payment.addCoins(usdtAddress, 2);
        });
        //return BStablePayment.at('').then(payment => {
        //     return payment.addCoins(usdtAddress, 2);
        // });
    } else if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        let usdtAddress = '0x55d398326f99059ff775485246999027b3197955';
        return BStablePayment.deployed().then(payment => {
            return payment.addCoins(usdtAddress, 2);
        });
        //return BStablePayment.at('').then(payment => {
        //     return payment.addCoins(usdtAddress, 2);
        // });
    } else {

    }

};
