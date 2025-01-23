// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CryptoEscrow is ReentrancyGuard {
    address public buyer;
    address public seller;
    address public token;
    uint256 public amount;
    uint256 public platformFee;
    bool public buyerConfirmed;
    bool public sellerConfirmed;
    bool public fundsReleased;
    
    event FundsDeposited(address buyer, address seller, address token, uint256 amount);
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

    constructor(address _seller, address _token) payable {
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Seller cannot be buyer");
        
        buyer = msg.sender;
        seller = _seller;
        token = _token;
        
        if (_token == address(0)) {
            // Native token (MATIC) payment
            require(msg.value > 0, "Amount must be greater than 0");
            amount = msg.value;
        }
        
        emit FundsDeposited(buyer, seller, token, amount);
    }

    function deposit(address _seller, address _token, uint256 _amount) external payable nonReentrant {
        emit DepositAttempt(msg.sender, _seller, _amount);
        
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Seller cannot be buyer");
        require(_amount > 0, "Amount must be greater than 0");
        require(amount == 0, "Funds already deposited");
        
        buyer = msg.sender;
        seller = _seller;
        token = _token;
        amount = _amount;
        
        if (_token == address(0)) {
            // Native token (MATIC) payment
            require(msg.value == _amount, "Incorrect MATIC amount sent");
        } else {
            // ERC20 token payment
            require(msg.value == 0, "ETH value must be 0 for token transfers");
            require(IERC20(_token).transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        }
        
        emit FundsDeposited(buyer, seller, token, amount);
    }

    function confirmTransaction() public onlyBuyerOrSeller fundsNotReleased nonReentrant {
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
            if (token == address(0)) {
                // Release MATIC
                (bool success, ) = seller.call{value: amount}("");
                require(success, "MATIC transfer failed");
            } else {
                // Release ERC20 tokens
                require(IERC20(token).transfer(seller, amount), "Token transfer failed");
            }
            emit FundsReleased(seller, amount);
        }
    }

    function getStatus() public view returns (
        bool _buyerConfirmed,
        bool _sellerConfirmed,
        bool _fundsReleased,
        address _token,
        uint256 _amount
    ) {
        return (buyerConfirmed, sellerConfirmed, fundsReleased, token, amount);
    }

    // Add receive function to accept MATIC
    receive() external payable {}

    // Add fallback function to accept MATIC with data
    fallback() external payable {}
}