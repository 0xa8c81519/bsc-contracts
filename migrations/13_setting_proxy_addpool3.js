const BStableProxyV2 = artifacts.require("BStableProxyV2");
const BStablePool = artifacts.require("BStablePool");

module.exports = function (deployer, network, accounts) {

    return BStablePool.deployed().then(pool3 => {
        return BStableProxyV2.deployed().then(proxy => {
            return proxy.add(40, pool3.address, false);
        });
    });

};
