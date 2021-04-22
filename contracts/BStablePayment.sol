// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./interfaces/IBEP20.sol";
import "./interfaces/IPaymentToken.sol";
import "./interfaces/IBStablePool.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BEP20.sol";
import "./lib/TransferHelper.sol";

contract BStablePayment is BEP20, Ownable {
    using SafeMath for uint256;

    IPaymentToken public paymentToken;

    IBStablePool public pool;

    struct CoinInfo {
        uint256 index;
        bool available;
    }

    mapping(address => CoinInfo) public coins;

    event Pay(
        address payToken,
        address receiptToken,
        address payer,
        address recipt
    );

    constructor(
        string memory _name,
        string memory _symbol,
        address _owner
    ) public BEP20(_name, _symbol) {
        transferOwnership(_owner);
    }

    function addCoins(address _coin, uint32 index) public onlyOwner {
        require(!coins[_coin].available, "Payment: coins dumplicated.");
        coins[_coin] = CoinInfo({index: index, available: true});
    }

    function removeCoins(address _coin) public onlyOwner {
        require(coins[_coin].available == true, "Payment: coin no exists.");
        coins[_coin].available = false;
    }

    function setPaymentToken(IPaymentToken _paymentToken) public onlyOwner {
        paymentToken = _paymentToken;
    }

    function transferMinterTo(address _to) public onlyOwner {
        paymentToken.transferMinterTo(_to);
    }

    function setPool(IBStablePool _pool) public onlyOwner {
        pool = _pool;
    }

    function pay(
        address receiptToken,
        address receipt,
        uint256 amt
    ) external {
        require(
            amt <= IBEP20(receiptToken).balanceOf(msg.sender),
            "Payment: insufficient balance."
        );
        TransferHelper.safeTransferFrom(receiptToken, msg.sender, receipt, amt);
        paymentToken.mintTo(msg.sender, 1_000_000_000_000_000_000);
        emit Pay(receiptToken, receiptToken, msg.sender, receipt);
    }

    function payWithSwap(
        address payToken,
        address receiptToken,
        uint256 payAmt,
        uint256 receiptAmt,
        address receipt
    ) external {
        require(payToken != receiptToken, "Payment: the same token.");
        uint256 i = coins[payToken].index;
        uint256 j = coins[receiptToken].index;
        TransferHelper.safeTransferFrom(
            payToken,
            msg.sender,
            address(this),
            payAmt
        );
        TransferHelper.safeApprove(payToken, address(pool), payAmt);
        uint256 _originalBalance =
            IBEP20(receiptToken).balanceOf(address(this));
        pool.exchange(i, j, payAmt, receiptAmt);
        uint256 returnAmt =
            IBEP20(receiptToken).balanceOf(address(this)).sub(_originalBalance);
        require(returnAmt >= receiptAmt, "Payment: swap amt insufficient.");
        TransferHelper.safeTransfer(receiptToken, receipt, receiptAmt);
        TransferHelper.safeTransfer(
            receiptToken,
            msg.sender,
            returnAmt.sub(receiptAmt)
        );
        paymentToken.mintTo(msg.sender, 1_000_000_000_000_000_000);
        emit Pay(payToken, receiptToken, msg.sender, receipt);
    }
}
