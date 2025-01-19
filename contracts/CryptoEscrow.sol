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
    event DepositAttempt(address sender, address seller, uint256 value);
    event DepositError(string reason);

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

    function deposit(address _seller) external payable {
        emit DepositAttempt(msg.sender, _seller, msg.value);
        
        if (_seller == address(0)) {
            emit DepositError("Invalid seller address");
            revert("Invalid seller address");
        }
        if (_seller == msg.sender) {
            emit DepositError("Seller cannot be buyer");
            revert("Seller cannot be buyer");
        }
        if (msg.value == 0) {
            emit DepositError("Amount must be greater than 0");
            revert("Amount must be greater than 0");
        }
        if (amount > 0) {
            emit DepositError("Funds already deposited");
            revert("Funds already deposited");
        }
        
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
}