const PaymentToken = artifacts.require("PaymentToken");
const BStablePayment = artifacts.require("BStablePayment");

module.exports = function (deployer, network, accounts) {

    return BStablePayment.deployed().then(payment => {
        return PaymentToken.deployed().then(paymentToken => {
            return paymentToken.setMinter(payment.address);
        });
    });

};
