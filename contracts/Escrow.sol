//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.25;

//to transfer the nft from seller to buyer
interface IERC721{
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow{ 
    address public nftAddress;
    uint256 public nftID;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    //using payable is means using funds like ethers for transactions.
    address payable public seller;
    address payable public  buyer;
    address public lender;
    address public inspector;

    modifier onlyBuyer(){
        require(msg.sender == buyer,"Only buyer can call the function");
        //by _; executes the function after thiscondition
        _;
    }
    modifier onlyInspector(){
        require(msg.sender == inspector,"Only inspector can call the function");
        //by _; executes the function after thiscondition
        _;
    }

    bool public inspectionPassed=false;

    receive() external payable{

    }

    mapping(address=>bool)public approval;

    constructor(
            address _nftAddress,
            uint256 _nftID,
            uint256 _purchasePrice,
            uint256 _escrowAmount,
            address payable _seller,
            address payable _buyer,
            address _inspector,
            address _lender
        ){
        nftAddress=_nftAddress;
        nftID=_nftID;
        purchasePrice=_purchasePrice;
        lender=_lender;
        inspector=_inspector;
        escrowAmount=_escrowAmount;
        seller=_seller;
        buyer=_buyer;
    }
    

    //function that when calls can pay ethers as payment
    function depositEarnest() public payable onlyBuyer {
        //msg is global variable value=crypto value
        require(msg.value>=escrowAmount);
    }

    function updateInspectionStatus(bool _passed)public onlyInspector{
        inspectionPassed=_passed;
    }

    function approveSale()public{
        approval[msg.sender]=true;
    }

    //address converts the contract(this) to address and then find the value of balance
    function getBalance() public view returns(uint){
        return address(this).balance;
    }
    function cancelSale() public{
        if(inspectionPassed==false){
            payable(buyer).transfer(address(this).balance);
        }else{
            payable(seller).transfer(address(this).balance);
        }
    }
    function finalizeSale() public{
        require(inspectionPassed,"MUST PASS INSPECTION");
        require(approval[buyer],"Must be approved by buyer");
        require(approval[seller],"Must be approved by seller");
        require(approval[lender],"Must be approved by lender");
        require(address(this).balance>=purchasePrice,'must have enough ether for sale');

        (bool success,)=payable(seller).call{value:address(this).balance}("");
        require(success);

        //Transfer owneership of property
        IERC721(nftAddress).transferFrom(seller,buyer,nftID);
    }

}