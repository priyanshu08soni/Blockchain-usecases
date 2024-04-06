//Test go  here...
const { expect } = require('chai');
const { ethers } = require('hardhat');


//by using mocha framework

describe('Counter',()=>{
    let counter
    beforeEach(async()=>{
        const Counter=await ethers.getContractFactory('Counter');
        counter=await Counter.deploy('My Counter',1);
    })
    describe('Deployment',()=>{
        it('sets the initial count',async()=>{
            expect(await counter.count()).to.equal(1);
        });
        it('sets the initial name',async()=>{
            const name=await counter.name()
            expect(name).to.equal("My Counter");
        });
    });
    describe('Counting',()=>{
        let transaction
        it('reads the count from the "count" public variable',async()=>{
            expect(await counter.count()).to.equal(1);
        })
        it('reads the count from getCount() function',async()=>{
            expect(await counter.getCount()).to.equal(1);
        })

        it('increments thee count',async()=>{
            transaction=await counter.increment();
            await  transaction.wait();
            expect(await counter.count()).to.equal(2)

            transaction=await counter.increment();
            await  transaction.wait();
            expect(await counter.count()).to.equal(3)

        })
        it('decrements the count',async()=>{
            transaction=await counter.decrement();
            await  transaction.wait();
            expect(await counter.count()).to.equal(0)

            //Cannot decrement count below 0
            await expect(counter.decrement()).to.be.reverted

        });


        it('reads the name from the "name" public variable',async()=>{
            expect(await counter.name()).to.equal("My Counter");
        })
        it('reads the name from getName() function',async()=>{
            expect(await counter.getName()).to.equal("My Counter");
        })
        it('set Name',async()=>{
            transaction=await counter.setName("New Name");
            await transaction.wait();
            expect(await counter.name()).to.equal("New Name");
        })
    })
})