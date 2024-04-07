//Test go  here...
const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens=(n)=>{
    return ethers.parseUnits(n.toString(),'ether');
}
const ether=tokens
describe('RealEstate',async()=>{
    let realEstate,escrow
    let deployer,seller,buyer,lender,inspector
    let nftID=1
    let accounts=[]
    let purchasePrice=ether(100);
    let escrowAmount=ether(20);
    beforeEach(async()=>{
        //setup accounts
        accounts = await ethers.getSigners()
        deployer=accounts[0]
        seller=deployer
        buyer=accounts[1]
        inspector=accounts[2]
        lender=accounts[3]

        //Load contracts 
        const RealEstate= await ethers.getContractFactory('RealEstate');
        const Escrow=await ethers.getContractFactory('Escrow');

        //Deploy COntracts
        realEstate=await RealEstate.deploy();
        escrow=await Escrow.deploy(
            realEstate.target,
            nftID,
            purchasePrice,
            escrowAmount,
            seller.address,
            buyer.address,
            inspector.address,
            lender.address
        )
        //Seller Approves NFT
        transaction=await realEstate.connect(seller).approve(escrow.target,nftID)
        await transaction.wait()
    })
    describe('Deployment',async()=>{
        it('sends on NFT to the seller / deployer', async()=>{
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)
        })
    })
    describe('Selling real estate',async()=>{
        let balance,transaction
        it('executes a successful transaction', async()=>{
            //Expect seller to be NFT owner before the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)
            
            //Check escrow balance
            balance=await escrow.getBalance()
            console.log("escrow balance:",ethers.formatEther(balance));
            
            //Buyer deposits the earnest
            transaction=await escrow.connect(buyer).depositEarnest({value:ether(20)})
            await transaction.wait();
            console.log("Buyer deposits earnest money");
            
            balance=await escrow.getBalance()
            console.log("escrow balance:",ethers.formatEther(balance));

            //INspector updates status
            transaction= await escrow.connect(inspector).updateInspectionStatus(true);
            console.log("Inspector updates status");

            //Approved by buyer
            transaction=await escrow.connect(buyer).approveSale()
            await transaction.wait();
            console.log("Buyer approves sale");

            //Approved by seller
            transaction=await escrow.connect(seller).approveSale()
            await transaction.wait();
            console.log("Seller approves sale");

            //Lender funds sale
            transaction= await lender.sendTransaction({to:escrow.target,value:ether(80)});

            //Approved by lender
            transaction=await escrow.connect(lender).approveSale()
            await transaction.wait();
            console.log("Lender approves sale");

            //Finalize the sale
            transaction=await escrow.connect(buyer).finalizeSale()
            await transaction.wait();
            console.log("Buyer finalizes sale");
            
            //Expect buyer to be NFT owner before the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);

            //Expect seller to receive funds
            balance=await ethers.provider.getBalance(seller.address)
            console.log("Seller Balance:",ethers.formatEther(balance));
            expect(balance).to.be.above(ether(10099))
        })
    })
})