//Test go  here...
const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens=(n)=>{
    return ethers.parseUnits(n.toString(),'ether');
}
const ether=tokens

describe("Reentrancy",()=>{
    let deployer
    let bank,attackerContract
    beforeEach(async()=>{
        //First signer got saved as deployer
        [deployer,user,attacker]=await ethers.getSigners();

        //connect to deployer
        const Bank=await ethers.getContractFactory('Bank',deployer);
        bank= await Bank.deploy();
        await bank.deposit({value : ethers.parseEther('100')})
        await bank.connect(user).deposit({value : ethers.parseEther('50')})

        const Attacker=await ethers.getContractFactory('Attacker',attacker);
        attackerContract=await Attacker.deploy(bank.target);
    })
    describe('facilitates deposits and withdraws',()=>{
        it('accepts deposits',async()=>{
            //Check deposit balance
            const deployBalance= await bank.balanceOf(deployer.address);
            expect(deployBalance).to.equal(ethers.parseEther('100'))

            //Check user Balance
            const userBalance=await bank.balanceOf(user.address);
            expect(userBalance).to.equal(ethers.parseEther('50'));

        })
        it('accepts withdraws',async()=>{
            await bank.withdraw()
            const deployerBalnce=await bank.balanceOf(deployer.address);
            const userBalance=await bank.balanceOf(user.address);
            expect(deployerBalnce).to.equal(0);
            expect(userBalance).to.equal(ethers.parseEther('50'));
        })
        it('allows attacker to drain funds from #withdrawn()',async()=>{
            //calculate total ethers in balance
            //Log before
            console.log(`Bank Balance is:${ethers.formatEther(await ethers.provider.getBalance(bank.target))}`);
            console.log(`Attacker Balance is:${ethers.formatEther(await ethers.provider.getBalance(attacker.address))}`);

            await attackerContract.attack({value:ethers.parseEther('10')})

            //Log after
            console.log(`Bank Balance is:${ethers.formatEther(await ethers.provider.getBalance(bank.target))}`);
            console.log(`Attacker Balance is:${ethers.formatEther(await ethers.provider.getBalance(attacker.address))}`);
            
            //Check bank balance has been drained
            expect(await ethers.provider.getBalance(bank.target)).to.equal(0);

        })
    })
})