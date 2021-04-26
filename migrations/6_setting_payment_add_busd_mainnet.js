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
        let busdAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
        return BStablePayment.deployed().then(payment => {
            return payment.addCoins(busdAddress, 1);
        });
    } else if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        let busdAddress = '0xa2157E2Ca201a157776494Cbd02723A121359794';
        return BStablePayment.deployed().then(payment => {
            return payment.addCoins(busdAddress, 1);
        });
    } else {

    }

};
