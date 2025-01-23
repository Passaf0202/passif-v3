// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DisputeManager is Ownable {
    struct Dispute {
        bool isActive;
        address initiator;
        uint256 timestamp;
        string reason;
    }

    mapping(bytes32 => Dispute) public disputes;

    event DisputeRaised(bytes32 indexed transactionId, address initiator, string reason);
    event DisputeResolved(bytes32 indexed transactionId, address resolver, address recipient);

    function raiseDispute(bytes32 _transactionId, string memory _reason) external {
        require(!disputes[_transactionId].isActive, "Dispute already exists");
        
        disputes[_transactionId] = Dispute({
            isActive: true,
            initiator: msg.sender,
            timestamp: block.timestamp,
            reason: _reason
        });

        emit DisputeRaised(_transactionId, msg.sender, _reason);
    }

    function resolveDispute(bytes32 _transactionId, address _recipient) external onlyOwner {
        require(disputes[_transactionId].isActive, "No active dispute");
        
        disputes[_transactionId].isActive = false;
        emit DisputeResolved(_transactionId, msg.sender, _recipient);
    }

    function getDispute(bytes32 _transactionId) external view returns (Dispute memory) {
        return disputes[_transactionId];
    }
}