// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoEscrow {
    address public buyer;
    address public seller;
    address public platform;
    uint256 public amount;
    uint256 public platformFee;
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

    constructor(
        address _seller,
        address _platform,
        uint256 _platformFee
    ) payable {
        require(_seller != address(0), "Invalid seller address");
        require(_platform != address(0), "Invalid platform address");
        require(_seller != msg.sender, "Seller cannot be buyer");
        require(msg.value > 0, "Amount must be greater than 0");
        require(_platformFee <= 100, "Invalid platform fee");
        
        buyer = msg.sender;
        seller = _seller;
        platform = _platform;
        amount = msg.value;
        platformFee = _platformFee;
        
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
            uint256 fee = (amount * platformFee) / 100;
            uint256 sellerAmount = amount - fee;
            
            (bool platformSuccess,) = platform.call{value: fee}("");
            require(platformSuccess, "Platform fee transfer failed");
            
            (bool sellerSuccess,) = seller.call{value: sellerAmount}("");
            require(sellerSuccess, "Seller transfer failed");
            
            emit FundsReleased(seller, sellerAmount);
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