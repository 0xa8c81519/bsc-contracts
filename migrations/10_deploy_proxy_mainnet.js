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
        let dDay = new Date();
        dDay.setFullYear(2021, 4, 3); // May 3th 2021
        dDay.setHours(10, 0, 0, 0);
        let now = new Date();
        let blocks = Math.floor((Math.floor(dDay.getTime() / 1000) - Math.floor(now.getTime() / 1000)) / 3);
        // todo: _dev address to get dev bst
        let _dev = '';
        return web3.eth.getBlock('latest').then(latestBlock => {
            // 2 bst per block
            let tokenPerBlock = web3.utils.toWei('2', 'ether');
            let startBlock = latestBlock.number + blocks; // farming will start 
            let bonusPeriod = 60 / 3 * 60 * 24 * 180;// 180 days
            console.log('Bonus period(blocks): ' + bonusPeriod);
            let bonusEndBlock = startBlock + bonusPeriod; // one day, 1 block/3 sec
            // todo: investors address
            let investors = [
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                ''
            ];
            return deployer.deploy(BStableProxyV2, _dev, tokenPerBlock, startBlock, bonusEndBlock, investors, accounts[0]).then(res => {
                console.log('constructor[0]:' + _dev);
                console.log('constructor[1]:' + tokenPerBlock);
                console.log('constructor[2]:' + startBlock);
                console.log('constructor[3]:' + bonusEndBlock);
                console.log('constructor[4]:' + investors);
                console.log('constructor[5]:' + accounts[0]);
            });
        });

    } else if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        let dDay = new Date();
        dDay.setFullYear(2021, 4, 3); // May 3th 2021
        dDay.setHours(10, 0, 0, 0);
        let now = new Date();
        let blocks = Math.floor((Math.floor(dDay.getTime() / 1000) - Math.floor(now.getTime() / 1000)) / 3);
        let _dev = '0xB0d88027F5dEd975fF6Df7A62952033D67Df277f';
        return web3.eth.getBlock('latest').then(latestBlock => {
            // 2 bst per block
            let tokenPerBlock = web3.utils.toWei('2', 'ether');
            let startBlock = latestBlock.number + blocks; // farming will start 
            let bonusPeriod = 60 / 3 * 60 * 24 * 180;// 180 days
            console.log('Bonus period(blocks): ' + bonusPeriod);
            let bonusEndBlock = startBlock + bonusPeriod; // one day, 1 block/3 sec
            let investors = [
                '0x13B9d7375b134d0903f809505d41A6483c39F759',
                '0x4E9F49BE3feD5833C0A8e401fcbda76c38DA9b89',
                '0x9db99155182E5cccb03D267B56DC6E7867703c15',
                '0x75cCF9dF980A261D116abD660940FbBB5eD59e4E',
                '0x10299E238D238128119fB96705d669A20B09B114',
                '0xec0D02dd0ACBb3a7Ef22D5fA2Bd1d59985dAf2bF',
                '0x347702b59206D362bCb4694DB9fd8A07366fC32B',
                '0x3c09AAAb05371581730BED12D6372313d2B44ca7',
                '0xA04c97c1c00300CcfA230a1D1b4E8Dc241861A3e',
                '0x76EFD6e0A9322a7b9dCA70a1972453814A5687c4'
            ];
            return deployer.deploy(BStableProxyV2, _dev, tokenPerBlock, startBlock, bonusEndBlock, investors, accounts[0]).then(res => {
                console.log('constructor[0]:' + _dev);
                console.log('constructor[1]:' + tokenPerBlock);
                console.log('constructor[2]:' + startBlock);
                console.log('constructor[3]:' + bonusEndBlock);
                console.log('constructor[4]:' + investors);
                console.log('constructor[5]:' + accounts[0]);
            });
        });

    } else {

    }

};
