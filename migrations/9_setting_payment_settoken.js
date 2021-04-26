const BStablePayment = artifacts.require("BStablePayment");
const PaymentToken = artifacts.require("PaymentToken");

module.exports = function (deployer, network, accounts) {

    return PaymentToken.deployed().then(token => {
        return BStablePayment.deployed().then(payment => {
            return payment.setPaymentToken(token.address);
        });
    });

};
