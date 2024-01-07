import { ethers } from "hardhat";
import { BasicNFT, NftMarketPlace } from "../typechain-types";

const PRICE = ethers.utils.parseEther("0.1");

async function mintAndList() {
  const nftMarketPlace: NftMarketPlace = await ethers.getContract(
    "NftMarketPlace"
  );
  const basicNft: BasicNFT = await ethers.getContract("BasicNFT");
  console.log("Minting");

  const mintTx = await basicNft.mintNFT();
  const mintTxReceipt = await mintTx.wait(1);
  // const tokenId = mintTxReceipt.events?[0].args.tokenId;
  const tokenId = mintTxReceipt.events![0].args![2].toString();

  console.log("Approving Nft...", tokenId);

  const approveTx = await basicNft.approve(nftMarketPlace.address, tokenId);
  await approveTx.wait(1);
  console.log("Listing NFT...");
  const tx = await nftMarketPlace.listItem(basicNft.address, tokenId, PRICE);
  await tx.wait(1);

  console.log("Listed");
}

mintAndList()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
