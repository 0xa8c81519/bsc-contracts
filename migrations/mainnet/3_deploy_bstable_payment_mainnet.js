const BStablePayment = artifacts.require("BStablePayment");

module.exports =  function (deployer, network, accounts) {
    
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
        // after setting, then tranfer owner 
        return deployer.deploy(BStablePayment, "BStable Payment Contract", "BSP-V1", accounts[0]).then(res => {
        });
    } else if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        // after setting, then tranfer owner 
        return deployer.deploy(BStablePayment, "BStable Payment Contract", "BSP-V1", accounts[0]).then(res => {
        });
    } else {

    }

};
