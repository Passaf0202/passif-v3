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

    modifier onlyBuyerOrSeller() {
        require(msg.sender == buyer || msg.sender == seller, "Not authorized");
        _;
    }

    modifier fundsNotReleased() {
        require(!fundsReleased, "Funds already released");
        _;
    }

    constructor(address _seller) payable {
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Seller cannot be buyer");
        require(msg.value > 0, "Amount must be greater than 0");
        
        buyer = msg.sender;
        seller = _seller;
        amount = msg.value;
        
        emit FundsDeposited(buyer, seller, amount);
    }

    function confirmTransaction() public onlyBuyerOrSeller fundsNotReleased {
        if (msg.sender == buyer) {
            require(!buyerConfirmed, "Buyer already confirmed");
            buyerConfirmed = true;
        } else {
            require(!sellerConfirmed, "Seller already confirmed");
            sellerConfirmed = true;
        }

        emit TransactionConfirmed(msg.sender);

        if (buyerConfirmed && sellerConfirmed) {
            fundsReleased = true;
            payable(seller).transfer(amount);
            emit FundsReleased(seller, amount);
        }
    }

    function getStatus() public view returns (
        bool _buyerConfirmed,
        bool _sellerConfirmed,
        bool _fundsReleased
    ) {
        return (buyerConfirmed, sellerConfirmed, fundsReleased);
    }

    receive() external payable {}
    fallback() external payable {}
}