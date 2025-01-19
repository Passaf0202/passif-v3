// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoEscrow {
    address public buyer;
    address public seller;
    uint256 public amount;
    bool public buyerConfirmed;
    bool public sellerConfirmed;
    bool public fundsReleased;

    event FundsDeposited(address buyer, address seller, uint256 amount);
    event TransactionConfirmed(address confirmer);
    event FundsReleased(address seller, uint256 amount);

    constructor(address _seller) payable {
        require(msg.value > 0, "Amount must be greater than 0");
        buyer = msg.sender;
        seller = _seller;
        amount = msg.value;
        emit FundsDeposited(buyer, seller, amount);
    }

    function deposit(address _seller) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        buyer = msg.sender;
        seller = _seller;
        amount = msg.value;
        emit FundsDeposited(buyer, seller, amount);
    }

    function confirmTransaction() public {
        require(msg.sender == buyer || msg.sender == seller, "Not authorized");
        require(!fundsReleased, "Funds already released");

        if (msg.sender == buyer) {
            buyerConfirmed = true;
        }
        if (msg.sender == seller) {
            sellerConfirmed = true;
        }

        emit TransactionConfirmed(msg.sender);

        if (buyerConfirmed && sellerConfirmed) {
            fundsReleased = true;
            payable(seller).transfer(amount);
            emit FundsReleased(seller, amount);
        }
    }

    function getStatus() public view returns (bool, bool, bool) {
        return (buyerConfirmed, sellerConfirmed, fundsReleased);
    }
}