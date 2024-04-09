// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Bank is ReentrancyGuard {
    using Address for address payable;

    mapping(address=>uint256) public balanceOf;

    //deposit ether funds 
    //withdraw ether funds
    function deposit()external payable{
        balanceOf[msg.sender] += msg.value;
    }

    function withdraw()external  nonReentrant{
        //vunrability
        uint256 depositedAmount= balanceOf[msg.sender];
        payable(msg.sender).sendValue(depositedAmount);
        balanceOf[msg.sender]=0;
    }
}