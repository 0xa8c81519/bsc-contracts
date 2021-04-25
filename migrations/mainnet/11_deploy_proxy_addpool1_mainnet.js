const BStableProxyV2 = artifacts.require("BStableProxyV2");

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
        let pool1 = '0x9c00954a8a58f5dda8c011d6233093763f13c8da';
        BStableProxyV2.deployed().then(proxy => {
            return proxy.add(5, pool1, fasle);
        });
        // BStableProxyV2.at('').then(proxy => {
        //     return proxy.add(5, pool1, fasle);
        // });
    } else if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        let pool1 = '0x9c00954a8a58f5dda8c011d6233093763f13c8da';
        BStableProxyV2.deployed().then(proxy => {
            return proxy.add(5, pool1, fasle);
        });
        // BStableProxyV2.at('').then(proxy => {
        //     return proxy.add(5, pool1, fasle);
        // });
    } else {

    }

};
