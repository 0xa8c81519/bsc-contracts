const BStableProxyV2 = artifacts.require("BStableProxyV2");
const PaymentToken = artifacts.require("PaymentToken");

module.exports = function (deployer, network, accounts) {

    return PaymentToken.deployed().then(paymentToken => {
        return BStableProxyV2.deployed().then(proxy => {
            return proxy.add(50, paymentToken.address, false);
        });
    });

};
