// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TradecoinerEscrow is ReentrancyGuard {
    address public owner;
    uint256 public escrowFee = 25; // 0.25% fee
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant DISPUTE_PERIOD = 3 days;

    struct Transaction {
        address buyer;
        address seller;
        uint256 amount;
        uint256 fee;
        uint256 releaseTime;
        bool isToken;
        address tokenAddress;
        bool buyerConfirmed;
        bool sellerConfirmed;
        bool isDisputed;
        bool isCompleted;
        bool isRefunded;
    }

    mapping(bytes32 => Transaction) public transactions;
    
    event TransactionCreated(
        bytes32 indexed transactionId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        bool isToken,
        address tokenAddress
    );
    event TransactionCompleted(bytes32 indexed transactionId);
    event TransactionDisputed(bytes32 indexed transactionId);
    event TransactionRefunded(bytes32 indexed transactionId);
    event BuyerConfirmed(bytes32 indexed transactionId);
    event SellerConfirmed(bytes32 indexed transactionId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyBuyer(bytes32 transactionId) {
        require(msg.sender == transactions[transactionId].buyer, "Not buyer");
        _;
    }

    modifier onlySeller(bytes32 transactionId) {
        require(msg.sender == transactions[transactionId].seller, "Not seller");
        _;
    }

    function createTransaction(
        address seller,
        bool isToken,
        address tokenAddress
    ) external payable returns (bytes32) {
        require(seller != address(0), "Invalid seller");
        require(msg.value > 0 || isToken, "No funds sent");

        uint256 amount = msg.value;
        if (isToken) {
            require(tokenAddress != address(0), "Invalid token");
            IERC20 token = IERC20(tokenAddress);
            amount = token.balanceOf(msg.sender);
            require(amount > 0, "No tokens to transfer");
            require(
                token.transferFrom(msg.sender, address(this), amount),
                "Token transfer failed"
            );
        }

        uint256 fee = (amount * escrowFee) / FEE_DENOMINATOR;
        bytes32 transactionId = keccak256(
            abi.encodePacked(
                msg.sender,
                seller,
                amount,
                block.timestamp
            )
        );

        transactions[transactionId] = Transaction({
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            fee: fee,
            releaseTime: block.timestamp + DISPUTE_PERIOD,
            isToken: isToken,
            tokenAddress: tokenAddress,
            buyerConfirmed: false,
            sellerConfirmed: false,
            isDisputed: false,
            isCompleted: false,
            isRefunded: false
        });

        emit TransactionCreated(
            transactionId,
            msg.sender,
            seller,
            amount,
            isToken,
            tokenAddress
        );

        return transactionId;
    }

    function confirmDelivery(bytes32 transactionId) 
        external 
        onlyBuyer(transactionId) 
        nonReentrant 
    {
        Transaction storage transaction = transactions[transactionId];
        require(!transaction.isCompleted, "Already completed");
        require(!transaction.isRefunded, "Already refunded");
        
        transaction.buyerConfirmed = true;
        emit BuyerConfirmed(transactionId);
        
        if (transaction.sellerConfirmed) {
            _completeTransaction(transactionId);
        }
    }

    function confirmShipment(bytes32 transactionId) 
        external 
        onlySeller(transactionId) 
        nonReentrant 
    {
        Transaction storage transaction = transactions[transactionId];
        require(!transaction.isCompleted, "Already completed");
        require(!transaction.isRefunded, "Already refunded");
        
        transaction.sellerConfirmed = true;
        emit SellerConfirmed(transactionId);
        
        if (transaction.buyerConfirmed) {
            _completeTransaction(transactionId);
        }
    }

    function initiateDispute(bytes32 transactionId) 
        external 
        nonReentrant 
    {
        Transaction storage transaction = transactions[transactionId];
        require(
            msg.sender == transaction.buyer || msg.sender == transaction.seller,
            "Not authorized"
        );
        require(!transaction.isCompleted, "Already completed");
        require(!transaction.isRefunded, "Already refunded");
        require(!transaction.isDisputed, "Already disputed");

        transaction.isDisputed = true;
        emit TransactionDisputed(transactionId);
    }

    function resolveDispute(
        bytes32 transactionId,
        address payable recipient
    ) external onlyOwner nonReentrant {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.isDisputed, "Not disputed");
        require(!transaction.isCompleted, "Already completed");
        require(!transaction.isRefunded, "Already refunded");
        
        if (transaction.isToken) {
            IERC20 token = IERC20(transaction.tokenAddress);
            require(
                token.transfer(recipient, transaction.amount),
                "Token transfer failed"
            );
        } else {
            (bool success, ) = recipient.call{value: transaction.amount}("");
            require(success, "Transfer failed");
        }

        transaction.isCompleted = true;
        emit TransactionCompleted(transactionId);
    }

    function _completeTransaction(bytes32 transactionId) internal {
        Transaction storage transaction = transactions[transactionId];
        uint256 sellerAmount = transaction.amount - transaction.fee;

        if (transaction.isToken) {
            IERC20 token = IERC20(transaction.tokenAddress);
            require(
                token.transfer(transaction.seller, sellerAmount),
                "Token transfer to seller failed"
            );
            require(
                token.transfer(owner, transaction.fee),
                "Fee transfer failed"
            );
        } else {
            (bool successSeller, ) = payable(transaction.seller).call{
                value: sellerAmount
            }("");
            require(successSeller, "Transfer to seller failed");
            
            (bool successOwner, ) = payable(owner).call{
                value: transaction.fee
            }("");
            require(successOwner, "Fee transfer failed");
        }

        transaction.isCompleted = true;
        emit TransactionCompleted(transactionId);
    }

    function updateEscrowFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        escrowFee = newFee;
    }

    function withdrawFees() external onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}