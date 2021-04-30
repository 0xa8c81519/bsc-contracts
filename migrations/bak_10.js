const BStableProxyV2 = artifacts.require("BStableProxyV2");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config;
    if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        config = data[97];
    } else if (deployer.network_id == 56) {
        config = data[56];
    } else {
        return;
    }
    let dDay = new Date();
    dDay.setFullYear(2021, 4, 3); // May 3th 2021
    dDay.setHours(10, 0, 0, 0);
    let now = new Date();
    // let blocks = Math.floor((Math.floor(dDay.getTime() / 1000) - Math.floor(now.getTime() / 1000)) / 3);
    let blocks = 60 / 3 * 30; // start after 10 minutes.
    let _dev = config.proxy.dev;
    return web3.eth.getBlock('latest').then(latestBlock => {
        // 2 bst per block
        let tokenPerBlock = web3.utils.toWei(config.proxy.tokenPerBlock, 'ether');
        let startBlock = latestBlock.number + blocks; // farming will start 
        let bonusPeriod = 60 / 3 * 60 * 24 * 180;// 180 days
        console.log('Bonus period(blocks): ' + bonusPeriod);
        let bonusEndBlock = startBlock + bonusPeriod; // one day, 1 block/3 sec
        let investors = config.proxy.investors;
        return deployer.deploy(BStableProxyV2, _dev, tokenPerBlock, startBlock, bonusEndBlock, investors, accounts[0]).then(res => {
            console.log('constructor[0]:' + _dev);
            console.log('constructor[1]:' + tokenPerBlock);
            console.log('constructor[2]:' + startBlock);
            console.log('constructor[3]:' + bonusEndBlock);
            console.log('constructor[4]:' + JSON.stringify(investors));
            console.log('constructor[5]:' + accounts[0]);
        });
    });

};
