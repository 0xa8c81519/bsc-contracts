const BStableProxyV2 = artifacts.require("BStableProxyV2");
const BStablePool = artifacts.require("BStablePool");

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
        BStablePool.deployed().then(pool3 => {
            return BStableProxyV2.deployed().then(proxy => {
                return proxy.add(40, pool3.address, fasle);
            });
        });
        // BStablePool.at('').then(pool3 => {
        //     return BStableProxyV2.at('').then(proxy => {
        //         return proxy.add(40, pool3.address, fasle);
        //     });
        // });

    } else if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        BStablePool.deployed().then(pool3 => {
            return BStableProxyV2.deployed().then(proxy => {
                return proxy.add(40, pool3.address, fasle);
            });
        });
        // BStablePool.at('').then(pool3 => {
        //     return BStableProxyV2.at('').then(proxy => {
        //         return proxy.add(40, pool3.address, fasle);
        //     });
        // });
    } else {

    }

};
