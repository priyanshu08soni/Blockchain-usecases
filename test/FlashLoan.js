//Test go  here...
const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens=(n)=>{
    return ethers.parseUnits(n.toString(),'ether');
}
const ether=tokens
describe("FlashLoan",()=>{
    let token,flashLoan,flashLoanReceiver
    let deployer
    let accounts=[]
    beforeEach(async()=>{
        //Setup Accounts
        accounts=await ethers.getSigners();
        deployer=accounts[0];


        //Load Accounts
        const FlashLoan=await ethers.getContractFactory('FlashLoan');
        const FlashLoanReceiver=await ethers.getContractFactory('FlashLoanReceiver');
        const Token=await ethers.getContractFactory('Token')

        //On deploy the token to block chain we gets 1000000
        //tokens on blockchain that is assigned to deployer.
        token = await Token.deploy('Priyanshu','Soni','1000000');

        //Deploy Flash Loan Pool
        flashLoan=await FlashLoan.deploy(token.target)

        //Approve tokens before depositing
        let transaction=await token.connect(deployer).approve(flashLoan.target,tokens(1000000));
        await transaction.wait();

        //Deposit tokens into the pool
        transaction=await flashLoan.connect(deployer).depositTokens(ether(1000000));
        await transaction.wait()

        //First we have to save the address of flash loan contract
        //Deploy Flash Loan Receiver
        flashLoanReceiver=await FlashLoanReceiver.deploy(flashLoan.target);

    })
    describe('Deployment',()=>{
        it('Sends tokens to the flash loan pool contract',async()=>{
            expect(await token.balanceOf(flashLoan.target)).to.equal(tokens(1000000));
        })
    })
    describe('Borrowing funds',()=>{
        it('borrows funds from the pool',async()=>{
            let amount=tokens(100);
            let transaction= await flashLoanReceiver.connect(deployer).executeFlashLoan(amount);
            await expect(transaction).to.emit(flashLoanReceiver,"LoanReceived")
            .withArgs(token.target,amount);
        })
    })
})