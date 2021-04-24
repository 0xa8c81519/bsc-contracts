pragma solidity ^0.6.0;

import "../BEP20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

///@title BStable payment Token
///@dev All data's decimal is 18.
contract PaymentToken is BEP20, Ownable {
    using SafeMath for uint256;
    address minter;

    event SetMinter(address minter);

    constructor(
        string memory _name,
        string memory _symbol,
        address ownerAddress
    ) public BEP20(_name, _symbol) {
        transferOwnership(ownerAddress);
    }

    function setMinter(address _minter) external onlyOwner {
        require(
            minter == address(0),
            "PaymentToken: can set the minter only once, at creation"
        );
        require(_minter != address(0), "address(0) can't be minter");
        minter = _minter;
        emit SetMinter(_minter);
    }

    function transferMinterTo(address _minter) public {
        require(
            msg.sender == minter,
            "PaymentToken: only minter can transfer minter"
        );
        require(
            _minter != address(0),
            "PaymentToken: address(0) can't be minter"
        );
        minter = _minter;
        emit SetMinter(_minter);
    }

    function mintTo(address to, uint256 amount) public {
        require(msg.sender == minter, "only minter can transfer minter");
        _mint(to, amount);
    }
}
