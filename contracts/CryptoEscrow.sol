
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoEscrow {
    struct Transaction {
        address buyer;
        address seller;
        uint256 amount;
        bool buyerConfirmed;
        bool sellerConfirmed;
        bool fundsReleased;
    }

    mapping(uint256 => Transaction) public transactions;
    uint256 public nextTransactionId;
    address public platform;
    uint256 public platformFee = 5; // 5% platform fee

    event TransactionCreated(uint256 indexed txnId, address buyer, address seller, uint256 amount);
    event TransactionConfirmed(uint256 indexed txnId, address confirmer);
    event FundsReleased(uint256 indexed txnId, address seller, uint256 amount);
    event Debug(string message, uint256 value);
    event DebugAddress(string message, address value);

    constructor() {
        platform = msg.sender;
    }

    function createTransaction(address _seller) external payable returns (uint256) {
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Seller cannot be buyer");
        require(msg.value > 0, "Amount must be greater than 0");

        uint256 txnId = nextTransactionId;
        nextTransactionId += 1;

        transactions[txnId] = Transaction({
            buyer: msg.sender,
            seller: _seller,
            amount: msg.value,
            buyerConfirmed: false,
            sellerConfirmed: false,
            fundsReleased: false
        });

        emit TransactionCreated(txnId, msg.sender, _seller, msg.value);
        emit Debug("Transaction created with ID", txnId);
        emit DebugAddress("Buyer address", msg.sender);
        emit DebugAddress("Seller address", _seller);

        return txnId;
    }

    function confirmTransaction(uint256 _txnId) external {
        emit Debug("Confirming transaction", _txnId);
        emit DebugAddress("Confirmer address", msg.sender);

        require(_txnId < nextTransactionId, "Invalid transaction ID");
        
        Transaction storage txn = transactions[_txnId];
        
        require(txn.amount > 0, "Transaction does not exist");
        emit Debug("Transaction amount", txn.amount);
        
        require(!txn.fundsReleased, "Funds already released");
        require(msg.sender == txn.buyer || msg.sender == txn.seller, "Not authorized");
        
        if (msg.sender == txn.buyer) {
            require(!txn.buyerConfirmed, "Buyer already confirmed");
            txn.buyerConfirmed = true;
            emit Debug("Buyer confirmed", _txnId);
        } else {
            require(!txn.sellerConfirmed, "Seller already confirmed");
            txn.sellerConfirmed = true;
            emit Debug("Seller confirmed", _txnId);
        }

        emit TransactionConfirmed(_txnId, msg.sender);

        if (txn.buyerConfirmed && txn.sellerConfirmed) {
            emit Debug("Both parties confirmed, releasing funds", _txnId);
            
            txn.fundsReleased = true;
            uint256 fee = (txn.amount * platformFee) / 100;
            uint256 sellerAmount = txn.amount - fee;
            
            (bool platformSuccess,) = platform.call{value: fee}("");
            require(platformSuccess, "Platform fee transfer failed");
            emit Debug("Platform fee transferred", fee);
            
            (bool sellerSuccess,) = txn.seller.call{value: sellerAmount}("");
            require(sellerSuccess, "Seller transfer failed");
            emit Debug("Seller amount transferred", sellerAmount);
            
            emit FundsReleased(_txnId, txn.seller, sellerAmount);
        }
    }

    function getTransaction(uint256 _txnId) public view returns (
        address buyer,
        address seller,
        uint256 amount,
        bool buyerConfirmed,
        bool sellerConfirmed,
        bool fundsReleased
    ) {
        require(_txnId < nextTransactionId, "Invalid transaction ID");
        Transaction storage txn = transactions[_txnId];
        require(txn.amount > 0, "Transaction does not exist");
        
        return (
            txn.buyer,
            txn.seller,
            txn.amount,
            txn.buyerConfirmed,
            txn.sellerConfirmed,
            txn.fundsReleased
        );
    }
}
