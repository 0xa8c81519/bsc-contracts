// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../lib/SafeBEP20.sol";
import "../interfaces/IBEP20.sol";
import "../interfaces/IBStableToken.sol";

interface IBSTMinter {
    function setToken(IBStableToken _token) external;

    function setHalvingPeriod(uint256 _block) external;

    function proxyLength() external view returns (uint256);

    function add(
        uint256 _allocPoint,
        address _farmingProxy,
        bool _withUpdate
    ) external;

    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) external;

    function phase(uint256 blockNumber) external view returns (uint256);

    function phase() external view returns (uint256);

    function getReward(uint256 _pid) external view returns (uint256);

    function massUpdateProxys() external;

    function updateProxy(
        uint256 _pid,
        uint256 _allocPoint,
        uint256 _totalPoints
    ) external returns (uint256);

    function dev(address _devaddr) external;

    function getTokenAddress() external view returns (address);

    function getStartBlock() external view returns (uint256);
}
