import { expect, assert } from 'chai';

import {
    StableCoinContract,
    StableCoinInstance,
    BStablePoolContract,
    BStablePoolInstance,
    PaymentTokenContract,
    PaymentTokenInstance,
    BStablePaymentContract,
    BStablePaymentInstance,
    BStableProxyV2Contract,
    BStableProxyV2Instance,
} from '../build/types/truffle-types';
// Load compiled artifacts
const tokenContract: StableCoinContract = artifacts.require('StableCoin.sol');
const poolContract: BStablePoolContract = artifacts.require('BStablePool.sol');
const paymentTokenContract: PaymentTokenContract = artifacts.require('PaymentToken.sol');
const paymentContract: BStablePaymentContract = artifacts.require('BStablePayment.sol');
const proxyContract: BStableProxyV2Contract = artifacts.require('BStableProxyV2.sol');
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
import { BigNumber } from 'bignumber.js';
import { config } from './config';

contract('BStable Payment', async accounts => {

    let usdc: StableCoinInstance;
    let busd: StableCoinInstance;
    let usdt: StableCoinInstance;
    let payment: BStablePaymentInstance;
    let paymentToken: PaymentTokenInstance;
    let pool: BStablePoolInstance;
    let proxy: BStableProxyV2Instance;
    let bst: StableCoinInstance;

    let denominator = new BigNumber(10).exponentiatedBy(18);

    before('Initialize Contracts', async () => {
        payment = await paymentContract.at(config.paymentAddress);
        let poolAddress = await payment.pool();
        pool = await poolContract.at(poolAddress);
        let paymentTokenAddress = await payment.paymentToken();
        paymentToken = await paymentTokenContract.at(paymentTokenAddress);
        let usdcAddress = await pool.coins(0);
        let busdAddress = await pool.coins(1);
        let usdtAddress = await pool.coins(2);
        usdc = await tokenContract.at(usdcAddress);
        busd = await tokenContract.at(busdAddress);
        usdt = await tokenContract.at(usdtAddress);
        proxy = await proxyContract.at(config.proxyAddress);
        let bstAddress = await proxy.token();
        bst = await tokenContract.at(bstAddress);
    });


    describe('Test Payment', () => {

        async function showStatus() {
            let usdcBal_1 = new BigNumber(await usdc.balanceOf(accounts[1])).div(denominator);
            let busdBal_1 = new BigNumber(await busd.balanceOf(accounts[1])).div(denominator);
            let usdtBal_1 = new BigNumber(await usdt.balanceOf(accounts[1])).div(denominator);
            let usdcBal_2 = new BigNumber(await usdc.balanceOf(accounts[2])).div(denominator);
            let busdBal_2 = new BigNumber(await busd.balanceOf(accounts[2])).div(denominator);
            let usdtBal_2 = new BigNumber(await usdt.balanceOf(accounts[2])).div(denominator);
            let payTokenBal_1 = new BigNumber(await paymentToken.balanceOf(accounts[1])).div(denominator);
            let bstBal_1 = new BigNumber(await bst.balanceOf(accounts[1])).div(denominator);
            console.log('accounts[1] usdc balance: ' + usdcBal_1.toFormat(18, BigNumber.ROUND_DOWN));
            console.log('accounts[1] busd balance: ' + busdBal_1.toFormat(18, BigNumber.ROUND_DOWN));
            console.log('accounts[1] usdt balance: ' + usdtBal_1.toFormat(18, BigNumber.ROUND_DOWN));
            console.log('accounts[1] paymentToken\'s balance: ' + payTokenBal_1.toFormat(18, BigNumber.ROUND_DOWN));
            console.log('accounts[1] BST\'s balance: ' + bstBal_1.toFormat(18, BigNumber.ROUND_DOWN));
            console.log('accounts[2] usdc balance: ' + usdcBal_2.toFormat(18, BigNumber.ROUND_DOWN));
            console.log('accounts[2] busd balance: ' + busdBal_2.toFormat(18, BigNumber.ROUND_DOWN));
            console.log('accounts[2] usdt balance: ' + usdtBal_2.toFormat(18, BigNumber.ROUND_DOWN));
        }

        it('Show status.', async () => {
            await showStatus();
        }).timeout(84600 * 1000);
        it('Transfer coins and Add liquidity to tUSDC / tBUSD / tUSDT', async () => {
            let amt = web3.utils.toWei('10000', 'ether');
            await usdc.transfer(accounts[1], amt);
            await busd.transfer(accounts[1], amt);
            await usdt.transfer(accounts[1], amt);
            await usdc.approve(pool.address, amt);
            await busd.approve(pool.address, amt);
            await usdt.approve(pool.address, amt);
            await pool.add_liquidity([amt, amt, amt], '0');
            console.log('accounts[0] LP: ' + new BigNumber(await pool.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
        });
        // it('Show status.', async () => {
        //     await showStatus();
        // }).timeout(84600 * 1000);
        // it('Pay', async () => {
        //     let amt = web3.utils.toWei('10', 'ether');
        //     await usdc.approve(payment.address, amt, { from: accounts[1] });
        //     await payment.pay(usdc.address, accounts[2], amt, { from: accounts[1] });
        // });
        // it('Show status.', async () => {
        //     await showStatus();
        // }).timeout(84600 * 1000);
        // it('Pay with swap', async () => { // need pay 10usdc, but use busd.
        //     let amt = web3.utils.toWei('10', 'ether');
        //     // asume can acceptable slippage is 0.05
        //     let accutalPay = new BigNumber(amt).multipliedBy(1 + 0.05).toFixed(0, BigNumber.ROUND_DOWN);
        //     await busd.approve(payment.address, accutalPay, { from: accounts[1] });
        //     await payment.payWithSwap(busd.address, usdc.address, accutalPay, amt, accounts[2], { from: accounts[1] });
        // });
        // it('Show status.', async () => {
        //     await showStatus();
        // }).timeout(84600 * 1000);
        // it('Stake payment token', async () => { // need pay 10usdc, but use busd.
        //     let paymentTokenBal = await paymentToken.balanceOf(accounts[1]);
        //     await paymentToken.approve(proxy.address, proxy.address, { from: accounts[1] });
        //     await proxy.deposit('3', paymentTokenBal, { from: accounts[1] });
        // });
        // it('Show status.', async () => {
        //     await showStatus();
        // }).timeout(84600 * 1000);
        // it('Get pending BST', async () => { // need pay 10usdc, but use busd.
        //     await proxy.withdraw('3', '0', { from: accounts[1] });
        // });
        // it('Show status.', async () => {
        //     await showStatus();
        // }).timeout(84600 * 1000);
    });
});
