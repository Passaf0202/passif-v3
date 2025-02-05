event DebugValue(string message, uint256 value);

function createTransaction(address _seller) external payable returns (uint256) {
    require(_seller != address(0), "Invalid seller address");
    require(_seller != msg.sender, "Seller cannot be buyer");
    require(msg.value > 0, "Amount must be greater than 0");

    emit DebugValue("Received value in contract:", msg.value);

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
    return txnId;
}
