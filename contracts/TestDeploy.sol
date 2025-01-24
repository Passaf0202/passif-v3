// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestDeploy {
    address public owner;

    constructor() payable {
        owner = msg.sender;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public {
        require(msg.sender == owner, "Not owner");
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
}