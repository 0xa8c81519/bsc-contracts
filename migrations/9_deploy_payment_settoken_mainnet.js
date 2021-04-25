const BStablePayment = artifacts.require("BStablePayment");
const PaymentToken = artifacts.require("PaymentToken");

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
        PaymentToken.deployed().then(token => {
            BStablePayment.deployed().then(payment => {
                return payment.setPaymentToken(pool.address);
            });
        });
        // PaymentToken.at('').then(token => {
        //     BStablePayment.at('').then(payment => {
        //         return payment.setPaymentToken(pool.address);
        //     });
        // });
    } else if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        PaymentToken.deployed().then(token => {
            BStablePayment.deployed().then(payment => {
                return payment.setPaymentToken(pool.address);
            });
        });
        // PaymentToken.at('').then(token => {
        //     BStablePayment.at('').then(payment => {
        //         return payment.setPaymentToken(pool.address);
        //     });
        // });
    } else {

    }

};
