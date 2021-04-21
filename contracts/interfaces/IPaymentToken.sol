pragma solidity ^0.6.0;

import "./IBEP20.sol";

interface IPaymentToken is IBEP20 {
    function transferMinterTo(address _minter) external;

    function mintTo(address to, uint256 amount) external;
}
