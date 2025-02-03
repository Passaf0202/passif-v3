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
    uint256 public platformFee;

    event TransactionCreated(uint256 indexed txnId, address buyer, address seller, uint256 amount);
    event TransactionConfirmed(uint256 indexed txnId, address confirmer);
    event FundsReleased(uint256 indexed txnId, address seller, uint256 amount);
    event Debug(string message, uint256 value);
    event DebugAddress(string message, address addr);

    error InvalidSeller();
    error InvalidAmount();
    error TransactionNotFound();
    error NotAuthorized();
    error AlreadyConfirmed();
    error TransferFailed();

    constructor(address _platform, uint256 _platformFee) {
        require(_platform != address(0), "Invalid platform address");
        require(_platformFee <= 100, "Invalid platform fee");
        platform = _platform;
        platformFee = _platformFee;
    }

    function createTransaction(address _seller) external payable returns (uint256) {
        if (_seller == address(0)) revert InvalidSeller();
        if (_seller == msg.sender) revert InvalidSeller();
        if (msg.value == 0) revert InvalidAmount();

        uint256 txnId = nextTransactionId++;
        
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
        emit DebugAddress("Seller address", _seller);
        emit Debug("Amount", msg.value);
        
        return txnId;
    }

    function confirmTransaction(uint256 _txnId) external {
        Transaction storage txn = transactions[_txnId];
        
        if (txn.amount == 0) revert TransactionNotFound();
        if (txn.fundsReleased) revert("Funds already released");
        if (msg.sender != txn.buyer && msg.sender != txn.seller) revert NotAuthorized();

        if (msg.sender == txn.buyer) {
            if (txn.buyerConfirmed) revert AlreadyConfirmed();
            txn.buyerConfirmed = true;
        } else {
            if (txn.sellerConfirmed) revert AlreadyConfirmed();
            txn.sellerConfirmed = true;
        }

        emit TransactionConfirmed(_txnId, msg.sender);
        emit Debug("Confirmation received for transaction", _txnId);
        emit DebugAddress("Confirmed by", msg.sender);

        if (txn.buyerConfirmed && txn.sellerConfirmed) {
            txn.fundsReleased = true;
            uint256 fee = (txn.amount * platformFee) / 100;
            uint256 sellerAmount = txn.amount - fee;
            
            (bool platformSuccess,) = platform.call{value: fee}("");
            if (!platformSuccess) revert TransferFailed();
            
            (bool sellerSuccess,) = txn.seller.call{value: sellerAmount}("");
            if (!sellerSuccess) revert TransferFailed();
            
            emit FundsReleased(_txnId, txn.seller, sellerAmount);
            emit Debug("Funds released for transaction", _txnId);
            emit Debug("Amount sent to seller", sellerAmount);
            emit Debug("Fee sent to platform", fee);
        }
    }

    function getTransaction(uint256 _txnId) external view returns (
        address buyer,
        address seller,
        uint256 amount,
        bool buyerConfirmed,
        bool sellerConfirmed,
        bool fundsReleased
    ) {
        Transaction storage txn = transactions[_txnId];
        return (
            txn.buyer,
            txn.seller,
            txn.amount,
            txn.buyerConfirmed,
            txn.sellerConfirmed,
            txn.fundsReleased
        );
    }

    receive() external payable {
        emit Debug("Received funds", msg.value);
    }
}