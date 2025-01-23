// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CryptoEscrow is ReentrancyGuard {
    address public buyer;
    address public seller;
    address public platform;
    address public token;
    uint256 public amount;
    uint256 public platformFee;
    bool public buyerConfirmed;
    bool public sellerConfirmed;
    bool public fundsReleased;
    bool public disputed;
    
    event FundsDeposited(address buyer, address seller, address token, uint256 amount);
    event TransactionConfirmed(address confirmer);
    event FundsReleased(address seller, uint256 amount, uint256 fee);
    event DisputeRaised(address raiser);
    event DisputeResolved(address resolver, address recipient);
    
    modifier onlyBuyerOrSeller() {
        require(msg.sender == buyer || msg.sender == seller, "Not authorized");
        _;
    }

    modifier onlyPlatform() {
        require(msg.sender == platform, "Only platform can call this");
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
        platform = _platform;
        token = _token;
        
        if (_token == address(0)) {
            // Native token (MATIC) payment
            require(msg.value > 0, "Amount must be greater than 0");
            amount = msg.value;
            platformFee = (amount * _platformFeePercent) / 100;
        }
        
        emit FundsDeposited(buyer, seller, token, amount);
    }

    function deposit(
        address _seller,
        uint256 _amount,
        uint256 _platformFeePercent
    ) external payable nonReentrant {
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Seller cannot be buyer");
        require(_amount > 0, "Amount must be greater than 0");
        require(amount == 0, "Funds already deposited");
        
        buyer = msg.sender;
        seller = _seller;
        amount = _amount;
        platformFee = (_amount * _platformFeePercent) / 100;
        
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

    function confirmTransaction() public onlyBuyerOrSeller fundsNotReleased nonReentrant {
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

    function raiseDispute() external onlyBuyerOrSeller fundsNotReleased {
        require(!disputed, "Dispute already raised");
        disputed = true;
        emit DisputeRaised(msg.sender);
    }

    function resolveDispute(address payable recipient) external onlyPlatform fundsNotReleased {
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
        
        if (token == address(0)) {
            // Release MATIC
            (bool successSeller, ) = seller.call{value: sellerAmount}("");
            require(successSeller, "MATIC transfer to seller failed");
            
            (bool successPlatform, ) = platform.call{value: platformFee}("");
            require(successPlatform, "MATIC transfer to platform failed");
        } else {
            // Release ERC20 tokens
            require(
                IERC20(token).transfer(seller, sellerAmount),
                "Token transfer to seller failed"
            );
            require(
                IERC20(token).transfer(platform, platformFee),
                "Token transfer to platform failed"
            );
        }
        
        emit FundsReleased(seller, sellerAmount, platformFee);
    }

    function getStatus() public view returns (
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