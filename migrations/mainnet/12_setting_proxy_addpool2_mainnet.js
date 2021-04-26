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
        let pool2 = '0x27f545300f7b93c1c0184979762622db043b0805';
        return BStableProxyV2.deployed().then(proxy => {
            return proxy.add(5, pool2, false);
        });
    } else if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        let pool2 = '0x2552c1801d9891Fbf56Ea5Cf5AC61089a1D1c1d8';
        return  BStableProxyV2.deployed().then(proxy => {
            return proxy.add(5, pool2, false);
        });
    } else {

    }

};
