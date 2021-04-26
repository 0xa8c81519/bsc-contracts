const BStablePayment = artifacts.require("BStablePayment");
const BStablePool = artifacts.require("BStablePool");

module.exports = function (deployer, network, accounts) {

    return BStablePool.deployed().then(pool => {
        return BStablePayment.deployed().then(payment => {
            return payment.setPool(pool.address);
        });
    });

};
