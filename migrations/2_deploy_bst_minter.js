const BSTMinter = artifacts.require("BSTMinter");
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
    let dev = config.dev;
    let dDay = new Date();
    dDay.setFullYear(config.dDay[0], config.dDay[1], config.dDay[2]);
    dDay.setHours(10, 5, 0, 0);
    let now = new Date();
    let blocks = Math.floor((Math.floor(dDay.getTime() / 1000) - Math.floor(now.getTime() / 1000)) / 3);
    return web3.eth.getBlock('latest').then(latestBlock => {
        let startBlock = latestBlock.number + blocks; // farming will start 
        return deployer.deploy(BSTMinter, dev, startBlock, accounts[0]).then(res => {
            console.log('constructor[0]:' + dev);
            console.log('constructor[1]:' + startBlock);
            console.log('constructor[2]:' + accounts[0]);
        });
    });
};
