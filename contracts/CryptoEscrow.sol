// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IEscrow.sol";
import "./FeeManager.sol";
import "./DisputeManager.sol";

contract CryptoEscrow is IEscrow, ReentrancyGuard {
    FeeManager public feeManager;
    DisputeManager public disputeManager;
    
    address public buyer;
    address public seller;
    address public token;
    uint256 public amount;
    uint256 public platformFee;
    bool public buyerConfirmed;
    bool public sellerConfirmed;
    bool public fundsReleased;
    bool public disputed;
    bytes32 public transactionId;
    
    modifier onlyBuyerOrSeller() {
        require(msg.sender == buyer || msg.sender == seller, "Not authorized");
        _;
    }

    modifier fundsNotReleased() {
        require(!fundsReleased, "Funds already released");
        _;
    }

    constructor(
        address _seller,
        address _platform,
        address _token,
        uint256 _platformFeePercent
    ) payable {
        require(_seller != address(0), "Invalid seller address");
        require(_platform != address(0), "Invalid platform address");
        require(_seller != msg.sender, "Seller cannot be buyer");
        
        buyer = msg.sender;
        seller = _seller;
        token = _token;
        
        // Initialize managers
        feeManager = new FeeManager(_platform, _platformFeePercent);
        disputeManager = new DisputeManager();
        
        // Generate unique transaction ID
        transactionId = keccak256(abi.encodePacked(
            block.timestamp,
            buyer,
            seller,
            amount
        ));
        
        if (_token == address(0)) {
            // Native token (MATIC) payment
            require(msg.value > 0, "Amount must be greater than 0");
            amount = msg.value;
            platformFee = feeManager.calculateFee(amount);
        }
        
        emit FundsDeposited(buyer, seller, token, amount);
    }

    function deposit(
        address _seller,
        uint256 _amount,
        uint256 _platformFeePercent
    ) external payable override nonReentrant {
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Seller cannot be buyer");
        require(_amount > 0, "Amount must be greater than 0");
        require(amount == 0, "Funds already deposited");
        
        buyer = msg.sender;
        seller = _seller;
        amount = _amount;
        platformFee = feeManager.calculateFee(_amount);
        
        if (token == address(0)) {
            // Native token (MATIC) payment
            require(msg.value == _amount, "Incorrect MATIC amount sent");
        } else {
            // ERC20 token payment
            require(msg.value == 0, "ETH value must be 0 for token transfers");
            require(
                IERC20(token).transferFrom(msg.sender, address(this), _amount),
                "Token transfer failed"
            );
        }
        
        emit FundsDeposited(buyer, seller, token, amount);
    }

    function confirmTransaction() external override onlyBuyerOrSeller fundsNotReleased nonReentrant {
        require(!disputed, "Transaction is disputed");
        
        if (msg.sender == buyer) {
            require(!buyerConfirmed, "Buyer already confirmed");
            buyerConfirmed = true;
        } else {
            require(!sellerConfirmed, "Seller already confirmed");
            sellerConfirmed = true;
        }

        emit TransactionConfirmed(msg.sender);

        if (buyerConfirmed && sellerConfirmed) {
            _releaseFunds();
        }
    }

    function raiseDispute() external override onlyBuyerOrSeller fundsNotReleased {
        require(!disputed, "Dispute already raised");
        disputed = true;
        disputeManager.raiseDispute(transactionId, "Dispute raised by user");
        emit DisputeRaised(msg.sender);
    }

    function resolveDispute(address payable recipient) external override fundsNotReleased {
        require(msg.sender == address(disputeManager), "Only dispute manager can resolve");
        require(disputed, "No dispute raised");
        require(recipient == buyer || recipient == seller, "Invalid recipient");
        
        if (recipient == seller) {
            _releaseFunds();
        } else {
            // Refund buyer
            fundsReleased = true;
            if (token == address(0)) {
                (bool success, ) = buyer.call{value: amount}("");
                require(success, "MATIC transfer failed");
            } else {
                require(IERC20(token).transfer(buyer, amount), "Token transfer failed");
            }
        }
        
        emit DisputeResolved(msg.sender, recipient);
    }

    function _releaseFunds() private {
        fundsReleased = true;
        uint256 sellerAmount = amount - platformFee;
        address platformAddress = feeManager.platformAddress();
        
        if (token == address(0)) {
            // Release MATIC
            (bool successSeller, ) = seller.call{value: sellerAmount}("");
            require(successSeller, "MATIC transfer to seller failed");
            
            (bool successPlatform, ) = platformAddress.call{value: platformFee}("");
            require(successPlatform, "MATIC transfer to platform failed");
        } else {
            // Release ERC20 tokens
            require(
                IERC20(token).transfer(seller, sellerAmount),
                "Token transfer to seller failed"
            );
            require(
                IERC20(token).transfer(platformAddress, platformFee),
                "Token transfer to platform failed"
            );
        }
        
        emit FundsReleased(seller, sellerAmount, platformFee);
    }

    function getStatus() external view override returns (
        bool _buyerConfirmed,
        bool _sellerConfirmed,
        bool _fundsReleased,
        bool _disputed,
        address _token,
        uint256 _amount,
        uint256 _platformFee
    ) {
        return (
            buyerConfirmed,
            sellerConfirmed,
            fundsReleased,
            disputed,
            token,
            amount,
            platformFee
        );
    }

    // Add receive function to accept MATIC
    receive() external payable {}

    // Add fallback function to accept MATIC with data
    fallback() external payable {}
}