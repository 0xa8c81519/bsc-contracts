// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../lib/SafeBEP20.sol";
import "../interfaces/IBEP20.sol";
import "../interfaces/IBStableToken.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BStableTokenV2_1.sol";

contract BSTMinter is Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    // Info of each proxy.
    struct ProxyInfo {
        address farmingProxy; // Address of farming contract.
        uint256 allocPoint; // How many allocation points assigned to this proxy. BSTs to distribute per block.
        uint256 lastRewardBlock; // Last block number that BSTs distribution occurs.
    }
    IBStableToken public token;
    // Dev address.
    address public devaddr;
    // Block number when bonus BST period ends.
    uint256 public bonusEndBlock;
    // BST tokens created per block.
    uint256 public tokenPerBlock = 6_500_000_000_000_000_000; // 6.5 bst/block
    // Info of each proxy.
    ProxyInfo[] public proxyInfo;
    // Total allocation poitns. Must be the sum of all allocation points in all proxys.
    uint256 public totalAllocPoint = 0;
    // The block number when BST mining starts.
    uint256 startBlock;

    uint256 public halvingPeriod = 2_628_000;
    uint256 public HALVING_COEFFICIENT = 1_189_207_115_002_721_024;

    constructor(
        address _devaddr,
        uint256 _startBlock,
        uint256 _bonusEndBlock,
        address ownerAddress
    ) public {
        devaddr = _devaddr;
        bonusEndBlock = _bonusEndBlock;
        startBlock = _startBlock;
        transferOwnership(ownerAddress);
    }

    function setToken(IBStableToken _token) public onlyOwner {
        token = _token;
    }

    function setHalvingPeriod(uint256 _block) public onlyOwner {
        halvingPeriod = _block;
    }

    function proxyLength() external view returns (uint256) {
        return proxyInfo.length;
    }

    // Add a new lp to the proxy. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(
        uint256 _allocPoint,
        address _farmingProxy,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdateProxys();
        }
        uint256 lastRewardBlock =
            block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        proxyInfo.push(
            ProxyInfo({
                farmingProxy: _farmingProxy,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock
            })
        );
    }

    // Update the given proxy's BST allocation point. Can only be called by the owner.
    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdateProxys();
        }
        totalAllocPoint = totalAllocPoint.sub(proxyInfo[_pid].allocPoint).add(
            _allocPoint
        );
        proxyInfo[_pid].allocPoint = _allocPoint;
    }

    /// @notice At what phase
    function phase(uint256 blockNumber) public view returns (uint256) {
        if (halvingPeriod == 0) {
            return 0;
        }
        if (blockNumber > startBlock) {
            return (blockNumber.sub(startBlock).sub(1)).div(halvingPeriod);
        }
        return 0;
    }

    function phase() public view returns (uint256) {
        return phase(block.number);
    }

    /// @notice Get proxy's amount of total reward
    /// @param _pid the proxy's index.
    /// @return return the amount of bst should be mint.
    function getReward(uint256 _pid) public view returns (uint256) {
        ProxyInfo storage proxy = proxyInfo[_pid];
        if (block.number <= proxy.lastRewardBlock) {
            return 0;
        }
        require(
            proxy.lastRewardBlock <= block.number,
            "BSTMinter: must little than the current block number"
        );
        uint256 _lastRewardBlock = proxy.lastRewardBlock;
        uint256 blockReward = 0;
        uint256 n = phase(_lastRewardBlock);
        uint256 m = phase(block.number);
        uint256 _bstPerBlock = tokenPerBlock;
        // If it crosses the cycle
        while (n < m) {
            n++;
            // Get the last block of the previous cycle
            uint256 r = n.mul(halvingPeriod).add(startBlock);
            _bstPerBlock = _bstPerBlock.mul(10**18).div(HALVING_COEFFICIENT);
            // Get rewards from previous periods
            blockReward = blockReward.add(
                r
                    .sub(_lastRewardBlock)
                    .mul(_bstPerBlock)
                    .mul(proxy.allocPoint)
                    .div(totalAllocPoint)
            );
            _lastRewardBlock = r;
        }
        blockReward = blockReward.add(
            (block.number.sub(_lastRewardBlock))
                .mul(_bstPerBlock)
                .mul(proxy.allocPoint)
                .div(totalAllocPoint)
        );
        return blockReward;
    }

    // Update reward vairables for all proxys. Be careful of gas spending!
    function massUpdateProxys() public {
        uint256 length = proxyInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updateProxy(pid, 1, 1);
        }
    }

    /// @notice Update reward variables of the given proxy to be up-to-date.
    function updateProxy(
        uint256 _pid,
        uint256 _allocPoint,
        uint256 _totalAllocPoint
    ) public returns (uint256) {
        ProxyInfo storage proxy = proxyInfo[_pid];
        if (block.number <= proxy.lastRewardBlock) {
            return 0;
        }
        uint256 tokenReward =
            getReward(_pid).mul(_allocPoint).div(_totalAllocPoint);
        token.mint(devaddr, tokenReward.div(10));
        token.mint(proxy.farmingProxy, tokenReward);
        proxy.lastRewardBlock = block.number;
        return tokenReward;
    }

    // Update dev address by the previous dev.
    function dev(address _devaddr) public onlyOwner {
        devaddr = _devaddr;
    }

    function getTokenAddress() external view returns (address) {
        return address(token);
    }

    function getStartBlock() external view returns (uint256) {
        return startBlock;
    }
}
