pragma solidity ^0.6.0;

import "../BEP20.sol";
import "./BStableTokenWallet.sol";
import "../interfaces/IBEP20.sol";
import "../interfaces/IBStablePool.sol";
import "../interfaces/IBStableProxy.sol";
import "../interfaces/IBStableToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../lib/TransferHelper.sol";

// Proxy
contract BStableProxy is IBStableProxy, BEP20, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    struct PoolInfo {
        address poolAddress;
        address[] coins;
        uint256 allocPoint;
        uint256 accTokenPerShare;
        uint256 shareRewardRate; //  share reward percent of total release amount. wei
        uint256 swapRewardRate; //  swap reward percent of total release amount.  wei
        uint256 totalVolAccPoints; // total volume accumulate points. wei
        uint256 totalVolReward; // total volume reword. wei 
        uint256 lastUpdateTime;
    }
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        uint256 volume; // swap volume.
        uint256 rewardDebt; // Reward debt. See explanation below.
        uint256 volReward;
        uint256 farmingReward;
    }

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    // state data
    PoolInfo[] pools;
    mapping(uint256 => address[]) poolUsers;
    uint256 totalAllocPoint = 0;
    address tokenAddress;
    mapping(uint256 => mapping(address => UserInfo)) userInfo;

    bool _openMigration = false;
    address migrateFrom;

    BStableTokenWallet walletShare;
    BStableTokenWallet walletSwap;
    BStableTokenWallet walletLPStaking;

    address devAddress;
    address amcAddress;
    uint256 devPoints = 10;
    uint256 amcPoints = 15;
    uint256 communityPoints = 72;
    uint256 mintTotalPoints = 97;

    modifier noOpenMigration() {
        require(!_openMigration, "a migration is open.");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _tokenAddress,
        address _amcAddress,
        address ownerAddress
    ) public BEP20(_name, _symbol) {
        tokenAddress = _tokenAddress;
        createWallet();
        devAddress = msg.sender;
        amcAddress = _amcAddress;
        transferOwnership(ownerAddress);
    }

    function getDevAddress() public view returns (address) {
        return devAddress;
    }

    function getAmcAddress() public view returns (address) {
        return amcAddress;
    }

    function createWallet() internal {
        require(
            address(walletShare) == address(0) &&
                address(walletSwap) == address(0) &&
                address(walletLPStaking) == address(0),
            "wallet not empty"
        );
        walletShare = new BStableTokenWallet(
            "BStable Token Wallet for LP farming reward",
            "BTWL",
            address(this),
            address(this)
        );
        walletSwap = new BStableTokenWallet(
            "BStable Token Wallet for LP swap reward",
            "BTWS",
            address(this),
            address(this)
        );
        walletLPStaking = new BStableTokenWallet(
            "BStable Token Wallet for LP staking",
            "BTWLP",
            address(this),
            address(this)
        );
    }

    function getWallets()
        public
        view
        override
        returns (
            BStableTokenWallet wsAddress,
            BStableTokenWallet weAddress,
            BStableTokenWallet wstakingAddress
        )
    {
        return (walletLPStaking, walletSwap, walletLPStaking);
    }

    function getPoolInfo(uint256 _pid)
        public
        view
        override
        returns (
            address _poolAddress,
            address[] memory _coins,
            uint256 _allocPoint,
            uint256 _accTokenPerShare,
            uint256 _shareRewardRate,
            uint256 _swapRewardRate,
            uint256 _totalVolAccPoints,
            uint256 _totalVolReward,
            uint256 _lastUpdateTime,
            uint256[] memory arrData
        )
    {
        arrData = new uint256[](7);
        _poolAddress = pools[_pid].poolAddress;
        _coins = pools[_pid].coins;
        _allocPoint = pools[_pid].allocPoint;
        arrData[0] = pools[_pid].allocPoint;
        _accTokenPerShare = pools[_pid].accTokenPerShare;
        arrData[1] = pools[_pid].accTokenPerShare;
        _shareRewardRate = pools[_pid].shareRewardRate;
        arrData[2] = pools[_pid].shareRewardRate;
        _swapRewardRate = pools[_pid].swapRewardRate;
        arrData[3] = pools[_pid].swapRewardRate;
        _totalVolAccPoints = pools[_pid].totalVolAccPoints;
        arrData[4] = pools[_pid].totalVolAccPoints;
        _totalVolReward = pools[_pid].totalVolReward;
        arrData[5] = pools[_pid].totalVolReward;
        _lastUpdateTime = pools[_pid].lastUpdateTime;
        arrData[6] = pools[_pid].lastUpdateTime;
    }

    function getTokenAddress() public view override returns (address taddress) {
        taddress = tokenAddress;
    }

    function getUserInfo(uint256 _pid, address user)
        public
        view
        override
        returns (
            uint256 _amount,
            uint256 _volume,
            uint256 _rewardDebt,
            uint256 _volReward,
            uint256 _farmingReward
        )
    {
        _amount = userInfo[_pid][user].amount;
        _volume = userInfo[_pid][user].volume;
        _rewardDebt = userInfo[_pid][user].rewardDebt;
        _volReward = userInfo[_pid][user].volReward;
        _farmingReward = userInfo[_pid][user].farmingReward;
    }

    function getPoolUsers(uint256 _pid)
        public
        view
        override
        returns (address[] memory _users)
    {
        _users = poolUsers[_pid];
    }

    function getPoolsLength() public view override returns (uint256 l) {
        l = pools.length;
    }

    function getTotalAllocPoint() public view override returns (uint256 r) {
        r = totalAllocPoint;
    }

    function isMigrationOpen() external view override returns (bool r) {
        r = _openMigration;
    }

    function getMigrateFrom() public view override returns (address _a) {
        _a = migrateFrom;
    }

    function exchange(
        uint256 _pid,
        uint256 i,
        uint256 j,
        uint256 dx,
        uint256 min_dy
    ) external nonReentrant noOpenMigration {
        require(
            pools[_pid].poolAddress != address(0),
            "address(0) can't be a pool"
        );
        bool exists = false;
        for (uint256 index = 0; index < poolUsers[_pid].length; index++) {
            if (poolUsers[_pid][index] == msg.sender) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            poolUsers[_pid].push(msg.sender);
        }
        updatePool(_pid);
        uint256 bali = IBEP20(pools[_pid].coins[i]).balanceOf(address(this));
        TransferHelper.safeTransferFrom(
            pools[_pid].coins[i],
            msg.sender,
            address(this),
            dx
        );
        dx = IBEP20(pools[_pid].coins[i]).balanceOf(address(this)).sub(bali);
        TransferHelper.safeApprove(
            pools[_pid].coins[i],
            pools[_pid].poolAddress,
            dx
        );
        uint256 balj = IBEP20(pools[_pid].coins[j]).balanceOf(address(this));
        IBStablePool(pools[_pid].poolAddress).exchange(i, j, dx, min_dy);
        uint256 dy =
            IBEP20(pools[_pid].coins[j]).balanceOf(address(this)).sub(balj);
        require(dy > 0, "no coin out");
        userInfo[_pid][msg.sender].volume = userInfo[_pid][msg.sender]
            .volume
            .add(dy.mul(dy).div(dx));
        require(dy.mul(dy).div(dx) > 0, "accumulate points is 0");
        uint256 tokenAmt = IBEP20(tokenAddress).balanceOf(address(walletSwap));
        uint256 rewardAmt;
        if (
            pools[_pid].totalVolAccPoints > 0 && pools[_pid].totalVolReward > 0
        ) {
            rewardAmt = pools[_pid].totalVolReward.mul(dy.mul(dy).div(dx)).div(
                pools[_pid].totalVolAccPoints
            );
        } else {
            rewardAmt = tokenAmt.div(10);
        }
        if (rewardAmt > tokenAmt) {
            userInfo[_pid][msg.sender].volReward = userInfo[_pid][msg.sender]
                .volReward
                .add(tokenAmt);
            pools[_pid].totalVolReward = pools[_pid].totalVolReward.add(
                tokenAmt
            );
            walletSwap.approveTokenToProxy(tokenAddress, tokenAmt);
            TransferHelper.safeTransferFrom(
                tokenAddress,
                address(walletSwap),
                msg.sender,
                tokenAmt
            );
        } else {
            userInfo[_pid][msg.sender].volReward = userInfo[_pid][msg.sender]
                .volReward
                .add(rewardAmt);
            pools[_pid].totalVolReward = pools[_pid].totalVolReward.add(
                rewardAmt
            );
            walletSwap.approveTokenToProxy(tokenAddress, rewardAmt);
            TransferHelper.safeTransferFrom(
                tokenAddress,
                address(walletSwap),
                msg.sender,
                rewardAmt
            );
        }
        pools[_pid].totalVolAccPoints = pools[_pid].totalVolAccPoints.add(
            dy.mul(dy).div(dx)
        );
        TransferHelper.safeTransfer(pools[_pid].coins[j], msg.sender, dy);
    }

    function getPoolAddress(uint256 _pid)
        external
        view
        noOpenMigration
        returns (address _poolAddress)
    {
        _poolAddress = pools[_pid].poolAddress;
    }

    function pendingReward(uint256 _pid, address _user)
        external
        view
        noOpenMigration
        returns (uint256)
    {
        PoolInfo storage pool = pools[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accSushiPerShare = pool.accTokenPerShare;
        uint256 lpSupply =
            IBEP20(pool.poolAddress).balanceOf(address(walletLPStaking));
        if (lpSupply != 0) {
            uint256 releaseAmt =
                IBStableToken(tokenAddress).availableSupply().sub(
                    IBStableToken(tokenAddress).totalSupply()
                );
            uint256 reward =
                releaseAmt
                    .mul(pool.shareRewardRate)
                    .div(10**18)
                    .mul(pool.allocPoint)
                    .div(totalAllocPoint);
            accSushiPerShare = accSushiPerShare.add(
                reward.mul(10**18).div(lpSupply)
            );
        }
        uint256 pending =
            user.amount.mul(accSushiPerShare).div(10**18).sub(user.rewardDebt);
        return pending;
    }

    function massUpdatePools() external noOpenMigration {
        uint256 length = pools.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    function updatePool(uint256 _pid) public noOpenMigration {
        PoolInfo storage pool = pools[_pid];
        if (block.timestamp <= pool.lastUpdateTime) {
            return;
        }
        uint256 lpSupply =
            IBEP20(pool.poolAddress).balanceOf(address(walletLPStaking));
        if (lpSupply == 0) {
            pool.lastUpdateTime = block.timestamp;
            return;
        }
        uint256 releaseAmt =
            IBStableToken(tokenAddress).availableSupply().sub(
                IBStableToken(tokenAddress).totalSupply()
            );
        uint256 mintAmt = releaseAmt.mul(pool.allocPoint).div(totalAllocPoint);
        uint256 rewardTotal = mintAmt.mul(communityPoints).div(mintTotalPoints);
        uint256 devAmt = mintAmt.mul(devPoints).div(mintTotalPoints);
        uint256 amcAmt = mintAmt.mul(amcPoints).div(mintTotalPoints);
        uint256 rewardShare = rewardTotal.mul(pool.shareRewardRate).div(10**18);
        uint256 rewardSwap = rewardTotal.mul(pool.swapRewardRate).div(10**18);
        IBStableToken(tokenAddress).mint(devAddress, devAmt.sub(1));
        IBStableToken(tokenAddress).mint(amcAddress, amcAmt.sub(1));
        IBStableToken(tokenAddress).mint(
            address(walletShare),
            rewardShare.sub(1)
        );
        IBStableToken(tokenAddress).mint(
            address(walletSwap),
            rewardSwap.sub(1)
        );
        pool.accTokenPerShare = pool.accTokenPerShare.add(
            rewardShare.mul(10**18).div(lpSupply)
        );
        pool.lastUpdateTime = block.timestamp;
    }

    function deposit(uint256 _pid, uint256 _amount) external noOpenMigration {
        UserInfo storage user = userInfo[_pid][msg.sender];
        bool exists = false;
        for (uint256 i = 0; i < poolUsers[_pid].length; i++) {
            if (poolUsers[_pid][i] == msg.sender) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            poolUsers[_pid].push(msg.sender);
        }
        updatePool(_pid);
        PoolInfo storage pool = pools[_pid];
        if (user.amount > 0) {
            uint256 pending =
                user.amount.mul(pool.accTokenPerShare).div(10**18).sub(
                    user.rewardDebt
                );
            if (pending > 0) {
                uint256 tokenBal =
                    IBEP20(tokenAddress).balanceOf(address(walletShare));
                if (tokenBal >= pending) {
                    userInfo[_pid][msg.sender].farmingReward = userInfo[_pid][
                        msg.sender
                    ]
                        .farmingReward
                        .add(pending);
                    walletShare.approveTokenToProxy(tokenAddress, pending);
                    TransferHelper.safeTransferFrom(
                        tokenAddress,
                        address(walletShare),
                        msg.sender,
                        pending
                    );
                } else {
                    userInfo[_pid][msg.sender].farmingReward = userInfo[_pid][
                        msg.sender
                    ]
                        .farmingReward
                        .add(tokenBal);
                    walletShare.approveTokenToProxy(tokenAddress, tokenBal);
                    TransferHelper.safeTransferFrom(
                        tokenAddress,
                        address(walletShare),
                        msg.sender,
                        tokenBal
                    );
                }
            }
        }
        if (_amount > 0) {
            uint256 lpBal =
                IBEP20(pool.poolAddress).balanceOf(address(walletLPStaking));
            TransferHelper.safeTransferFrom(
                pool.poolAddress,
                msg.sender,
                address(walletLPStaking),
                _amount
            );
            _amount = IBEP20(pool.poolAddress)
                .balanceOf(address(walletLPStaking))
                .sub(lpBal);
            user.amount = user.amount.add(_amount);
        }
        user.rewardDebt = user.amount.mul(pool.accTokenPerShare).div(10**18);
        emit Deposit(msg.sender, _pid, _amount);
    }

    function withdraw(uint256 _pid, uint256 _amount) external noOpenMigration {
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);
        PoolInfo storage pool = pools[_pid];
        uint256 pending =
            user.amount.mul(pool.accTokenPerShare).div(10**18).sub(
                user.rewardDebt
            );
        if (pending > 0) {
            uint256 tokenBal =
                IBEP20(tokenAddress).balanceOf(address(walletShare));
            if (tokenBal >= pending) {
                userInfo[_pid][msg.sender].farmingReward = userInfo[_pid][
                    msg.sender
                ]
                    .farmingReward
                    .add(pending);
                walletShare.approveTokenToProxy(tokenAddress, pending);
                TransferHelper.safeTransferFrom(
                    tokenAddress,
                    address(walletShare),
                    msg.sender,
                    pending
                );
            } else {
                userInfo[_pid][msg.sender].farmingReward = userInfo[_pid][
                    msg.sender
                ]
                    .farmingReward
                    .add(tokenBal);
                walletShare.approveTokenToProxy(tokenAddress, tokenBal);
                TransferHelper.safeTransferFrom(
                    tokenAddress,
                    address(walletShare),
                    msg.sender,
                    tokenBal
                );
            }
        }
        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);
            walletLPStaking.approveTokenToProxy(pool.poolAddress, _amount);
            TransferHelper.safeTransferFrom(
                pool.poolAddress,
                address(walletLPStaking),
                address(msg.sender),
                _amount
            );
        }
        user.rewardDebt = user.amount.mul(pool.accTokenPerShare).div(10**18);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    function emergencyWithdraw(uint256 _pid) external {
        PoolInfo storage pool = pools[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        walletLPStaking.approveTokenToProxy(pool.poolAddress, amount);
        TransferHelper.safeTransferFrom(
            pool.poolAddress,
            address(walletLPStaking),
            address(msg.sender),
            amount
        );
        emit EmergencyWithdraw(msg.sender, _pid, amount);
    }

    function openMigration() external onlyOwner {
        _openMigration = true;
    }

    function closeMigration() external onlyOwner {
        _openMigration = false;
    }

    function addPool(
        address _poolAddress,
        address[] calldata _coins,
        uint256 _allocPoint
    ) external onlyOwner {
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        pools.push(
            PoolInfo({
                poolAddress: _poolAddress,
                coins: _coins,
                allocPoint: _allocPoint,
                accTokenPerShare: 0,
                shareRewardRate: 500_000_000_000_000_000,
                swapRewardRate: 500_000_000_000_000_000,
                totalVolAccPoints: 0,
                totalVolReward: 0,
                lastUpdateTime: block.timestamp
            })
        );
    }

    function setPoolRewardRate(
        uint256 _pid,
        uint256 shareRate,
        uint256 swapRate
    ) external onlyOwner {
        require(
            shareRate.add(swapRate) <= 1_000_000_000_000_000_000,
            "sum rate lower then 100%"
        );
        pools[_pid].shareRewardRate = shareRate;
        pools[_pid].swapRewardRate = swapRate;
    }

    function setPoolCoins(uint256 _pid, address[] calldata _coins)
        external
        onlyOwner
    {
        pools[_pid].coins = _coins;
    }

    function setPoolAllocPoint(uint256 _pid, uint256 _allocPoint)
        external
        onlyOwner
    {
        totalAllocPoint = totalAllocPoint.sub(pools[_pid].allocPoint).add(
            _allocPoint
        );
        pools[_pid].allocPoint = _allocPoint;
    }

    function migratePoolInfo(IBStableProxy from) internal {
        address _poolAddress;
        address[] memory _coins;
        uint256[] memory _data;
        for (uint256 pid = 0; pid < from.getPoolsLength(); pid++) {
            (_poolAddress, _coins, , , , , , , , _data) = from.getPoolInfo(pid);
            totalAllocPoint = totalAllocPoint.add(_data[0]);
            pools.push(
                PoolInfo({
                    poolAddress: _poolAddress,
                    coins: _coins,
                    allocPoint: _data[0],
                    accTokenPerShare: _data[1],
                    shareRewardRate: _data[2],
                    swapRewardRate: _data[3],
                    totalVolAccPoints: _data[4],
                    totalVolReward: _data[5],
                    lastUpdateTime: _data[6]
                })
            );
        }
    }

    function transferMinterTo(address to) external override onlyOwner {
        require(_openMigration, "on allow when migration is open");
        IBStableToken(tokenAddress).transferMinterTo(to);
    }

    function approveTokenTo(address nMinter) external override onlyOwner {
        IBStableToken token = IBStableToken(tokenAddress);
        require(
            token.getMinter() == nMinter,
            "only allow to approve token to a minter."
        );
        uint256 balance = token.balanceOf(address(this));
        TransferHelper.safeApprove(tokenAddress, nMinter, balance);
    }

    function migrate(address _from) external onlyOwner {
        _openMigration = true;
        IBStableProxy from = IBStableProxy(_from);
        require(from.isMigrationOpen(), "from's migration not open.");
        require(migrateFrom == address(0), "migration only once.");
        migratePoolInfo(from);
        // tokenAddress = from.getTokenAddress();
        // uint256 tokenBal = IBEP20(tokenAddress).balanceOf(_from);
        // TransferHelper.safeTransferFrom(
        //     tokenAddress,
        //     _from,
        //     address(this),
        //     tokenBal
        // );

        migrateFrom = _from;
    }

    function setDevAddress(address nDevAddress) public onlyOwner {
        devAddress = nDevAddress;
    }

    function setAmcAddress(address nAmcAddress) public onlyOwner {
        amcAddress = nAmcAddress;
    }

    function setAllocPoints(
        uint256 _devPoints,
        uint256 _amcPoints,
        uint256 _communityPoints,
        uint256 _totalPoints
    ) public onlyOwner {
        devPoints = _devPoints;
        amcPoints = _amcPoints;
        communityPoints = _communityPoints;
        mintTotalPoints = _totalPoints;
    }
}
