// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEscrow {
    event FundsDeposited(address buyer, address seller, address token, uint256 amount);
    event TransactionConfirmed(address confirmer);
    event FundsReleased(address seller, uint256 amount, uint256 fee);
    event DisputeRaised(address raiser);
    event DisputeResolved(address resolver, address recipient);

    function deposit(address _seller, uint256 _amount, uint256 _platformFeePercent) external payable;
    function confirmTransaction() external;
    function raiseDispute() external;
    function resolveDispute(address payable recipient) external;
    function getStatus() external view returns (
        bool _buyerConfirmed,
        bool _sellerConfirmed,
        bool _fundsReleased,
        bool _disputed,
        address _token,
        uint256 _amount,
        uint256 _platformFee
    );
}