const BStablePool = artifacts.require("BStablePool");
const StableCoin = artifacts.require("StableCoin");
const BStableProxyV2 = artifacts.require("BStableProxyV2");
const PaymentToken = artifacts.require("PaymentToken");
const BStablePayment = artifacts.require("BStablePayment");
const BEP20 = artifacts.require("BEP20");
const config = {
    // owner: '',
    // dev: ''
};

module.exports = async function (deployer, network, accounts) {
    let owner;
    let dev;
    if (config && config.owner) {
        owner = config.owner;
    } else {
        owner = accounts[0];
    }
    if (config && config.dev) {
        dev = config.dev;
    } else {
        dev = accounts[0];
    }
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
        let usdcAddress = '';
        let busdAddress = '';
        let usdtAddress = '';
        let _owner='';
        let stableCoins = [usdcAddress, busdAddress, usdtAddress];
        let A = 1000;
        let fee = '30000000'; // 0.003
        let adminFee = '6666666667'; // 2/3
        BStablePool.new("BStable Pool (USDC / BUSD / USDT)", "BSLP-03", stableCoins, A, fee, adminFee, _owner);
    } else if (deployer.network_id == 5777 || deployer.network_id == 97) { //dev or bsc_test
        let daiAddress;
        let busdAddress;
        let usdtAddress;
        let btcbAddress;
        let renBtcAddress;
        let anyBtcAddress;
        let usdcAddress;
        let qusdAddress;
        let p1Address;
        let p2Address;
        let p3Address;
        deployer.then(() => {
            let totalSupply = web3.utils.toWei('100000000', 'ether');
            return StableCoin.new("tDAI for BStable test", "tDAI", totalSupply);
        }).then(dai => {
            daiAddress = dai.address;
            let totalSupply = web3.utils.toWei('100000000', 'ether');
            return StableCoin.new("tBUSD for BStable test", "tBUSD", totalSupply);
        }).then(busd => {
            busdAddress = busd.address;
            let totalSupply = web3.utils.toWei('100000000', 'ether');
            return StableCoin.new("tUSDT for BStable test", "tUSDT", totalSupply);
        }).then(usdt => { // pool1
            usdtAddress = usdt.address;
            let stableCoins = [daiAddress, busdAddress, usdtAddress];
            let A = 1000;
            let fee = '30000000'; // 0.003
            let adminFee = '6666666667'; // 2/3
            return BStablePool.new("BStable Pool (tDAI/tBUSD/tUSDT) for test", "BSLP-01", stableCoins, A, fee, adminFee, owner);
        }).then(pool => {
            let totalSupply = web3.utils.toWei('100000000', 'ether');
            p1Address = pool.address;
            return StableCoin.new("tQUSD for BStable test", "tQUSD", totalSupply);
        }).then(qusd => {
            let totalSupply = web3.utils.toWei('100000000', 'ether');
            qusdAddress = qusd.address;
            return StableCoin.new("tUSDC for BStable test", "tUSDC", totalSupply);
        }).then(usdc => { // pool2
            usdcAddress = usdc.address;
            let stableCoins = [qusdAddress, busdAddress, usdtAddress];
            let A = 1000;
            let fee = '30000000'; // 0.003
            let adminFee = '6666666667'; // 2/3
            return BStablePool.new("BStable Pool (tQUSD/tBUSD/tUSDT) for test", "BSLP-02", stableCoins, A, fee, adminFee, owner);
        }).then(pool => { // pool3
            p2Address = pool.address;
            let stableCoins = [usdcAddress, busdAddress, usdtAddress];
            let A = 1000;
            let fee = '30000000'; // 0.003
            let adminFee = '6666666667'; // 2/3
            return BStablePool.new("BStable Pool (tUSDC/tBUSD/tUSDT) for test", "BSLP-03", stableCoins, A, fee, adminFee, owner);
        }).then(async pool => {
            p3Address = pool.address;
            let paymentTokenInstance = await PaymentToken.new("BStable Payment Token", "BSPT", owner);
            let paymentConstractInstance = await BStablePayment.new("BStable Payment Contract", "BPC-V1-Beta", owner);
            await paymentTokenInstance.setMinter(paymentConstractInstance.address);
            await paymentConstractInstance.addCoins(usdcAddress, 0);
            await paymentConstractInstance.addCoins(busdAddress, 1);
            await paymentConstractInstance.addCoins(usdtAddress, 2);
            await paymentConstractInstance.setPool(p3Address);
            // console.log('Payment token: ' + paymentTokenInstance.address);
            console.log('Payment Contract: ' + paymentConstractInstance.address);
            await paymentConstractInstance.setPaymentToken(paymentTokenInstance.address);
            return paymentTokenInstance;
        }).then(async paymentToken => {
            let latestBlock = await web3.eth.getBlock('latest');
            let tokenPerBlock = web3.utils.toWei('2', 'ether');
            // let startBlock = latestBlock.number + 60 / 3 * 60 * 24; // farming will start after 24h
            let startBlock = latestBlock.number + 60 / 3 * 60 * 12; // farming will start after 12h
            let bonusPeriod = 60 / 3 * 60 * 24 * 180;// 180 days
            console.log('Bonus period(blocks): ' + bonusPeriod);
            let bonusEndBlock = startBlock + bonusPeriod; // one day, 1 block/3 sec
            let investors = [
                "0x13B9d7375b134d0903f809505d41A6483c39F759",
                "0x4E9F49BE3feD5833C0A8e401fcbda76c38DA9b89",
                "0x9db99155182E5cccb03D267B56DC6E7867703c15",
                "0x75cCF9dF980A261D116abD660940FbBB5eD59e4E",
                "0x10299E238D238128119fB96705d669A20B09B114",
                "0xec0D02dd0ACBb3a7Ef22D5fA2Bd1d59985dAf2bF",
                "0x347702b59206D362bCb4694DB9fd8A07366fC32B",
                "0x3c09AAAb05371581730BED12D6372313d2B44ca7",
                "0xA04c97c1c00300CcfA230a1D1b4E8Dc241861A3e",
                "0x76EFD6e0A9322a7b9dCA70a1972453814A5687c4"
            ];

            let proxy = await BStableProxyV2.new(dev, tokenPerBlock, startBlock, bonusEndBlock, investors, owner);
            // await proxy.createWallet();
            let bstAddress = await proxy.getTokenAddress();
            // console.log("Token's address: " + bstAddress);
            console.log("Proxy's address: " + proxy.address);
            await proxy.add(5, p1Address, false);
            await proxy.add(5, p2Address, false);
            await proxy.add(40, p3Address, false);
            await proxy.add(50, paymentToken.address, false);
        });
    } else {

    }

};
