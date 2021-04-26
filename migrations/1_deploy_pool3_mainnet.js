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
        let usdcAddress = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
        let busdAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
        let usdtAddress = '0x55d398326f99059ff775485246999027b3197955';
        let _owner = '0xB0d88027F5dEd975fF6Df7A62952033D67Df277f';
        let stableCoins = [usdcAddress, busdAddress, usdtAddress];
        let A = 1000;
        let fee = '30000000'; // 0.003
        let adminFee = '6666666667'; // 2/3
        let name = "BStable Pool (USDC / BUSD / USDT)";
        let symbol = "BSLP-03";
        return deployer.deploy(BStablePool, name, symbol, stableCoins, A, fee, adminFee, _owner).then(res => {
            console.log('constructor[0]:' + name);
            console.log('constructor[1]:' + symbol);
            console.log('constructor[2]:' + stableCoins);
            console.log('constructor[3]:' + A);
            console.log('constructor[4]:' + fee);
            console.log('constructor[5]:' + adminFee);
            console.log('constructor[6]:' + _owner);
        });
    } else if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        let usdcAddress = '0x45374DB08D851B9Fc254d9BF0e67E1607876a7E7';
        let busdAddress = '0xa2157E2Ca201a157776494Cbd02723A121359794';
        let usdtAddress = '0xD94905fc832754Ea85bCa67C6Ab5FAa66066E12C';
        let _owner = '0xB0d88027F5dEd975fF6Df7A62952033D67Df277f';
        let stableCoins = [usdcAddress, busdAddress, usdtAddress];
        let A = 1000;
        let fee = '30000000'; // 0.003
        let adminFee = '6666666667'; // 2/3
        let name = "BStable Pool (USDC / BUSD / USDT)";
        let symbol = "BSLP-03";
        return deployer.deploy(BStablePool, name, symbol, stableCoins, A, fee, adminFee, _owner).then(res => {
            console.log('constructor[0]:' + name);
            console.log('constructor[1]:' + symbol);
            console.log('constructor[2]:' + stableCoins);
            console.log('constructor[3]:' + A);
            console.log('constructor[4]:' + fee);
            console.log('constructor[5]:' + adminFee);
            console.log('constructor[6]:' + _owner);
        });
    } else {

    }

};
