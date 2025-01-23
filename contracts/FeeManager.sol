// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FeeManager is Ownable {
    uint256 public platformFeePercent;
    address public platformAddress;

    event FeeUpdated(uint256 newFeePercent);
    event PlatformAddressUpdated(address newPlatformAddress);

    constructor(address _platformAddress, uint256 _platformFeePercent) {
        require(_platformAddress != address(0), "Invalid platform address");
        require(_platformFeePercent <= 100, "Fee cannot exceed 100%");
        
        platformAddress = _platformAddress;
        platformFeePercent = _platformFeePercent;
    }

    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 100, "Fee cannot exceed 100%");
        platformFeePercent = _newFeePercent;
        emit FeeUpdated(_newFeePercent);
    }

    function updatePlatformAddress(address _newPlatformAddress) external onlyOwner {
        require(_newPlatformAddress != address(0), "Invalid platform address");
        platformAddress = _newPlatformAddress;
        emit PlatformAddressUpdated(_newPlatformAddress);
    }

    function calculateFee(uint256 _amount) public view returns (uint256) {
        return (_amount * platformFeePercent) / 100;
    }
}