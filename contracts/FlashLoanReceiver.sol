// SPDX-License-Identifier: Unlicense


// Contract inspired by Damn Vulnerable DeFi
// Original Contract:
// https://github.com/OpenZeppelin/damn-vulnerable-defi/blob/master/contracts/unstoppable/UnstoppableLender.sol

pragma solidity ^0.8.25;

import "hardhat/console.sol";
import "./FlashLoan.sol";
contract FlashLoanReceiver {
    FlashLoan private pool;

    event LoanReceived(address token , uint256 amount);

    address private owner;
    constructor(address _poolAddress){
        //save the smart contract inside the pool
        pool=FlashLoan(_poolAddress);
        //msg.sender call out to person who call this function first
        owner=msg.sender;
    }

    function receiveTokens(address _tokenAddress,uint256 _amount)external{
        require(msg.sender==address(pool),"Sender must be pool");
        //require funds received
        require(Token(_tokenAddress).balanceOf(address(this))==_amount,"Failed to get loan.");
        //emitting the event
        emit LoanReceived(_tokenAddress, _amount);
        //Do stuff with the money...
        //Return funds to pool
        require(Token(_tokenAddress).transfer(msg.sender,_amount),"Transfer of tokens failed");
    }

    //function to take out the flash loan first
    function executeFlashLoan(uint _amount)external{
        require(msg.sender==owner,"Only owner can execute flash loan");
        pool.flashLoan(_amount);
    }
}
