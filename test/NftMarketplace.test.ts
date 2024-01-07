import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { NftMarketPlace } from "../typechain-types";
import { BasicNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PromiseOrValue } from "../typechain-types/common";
import { assert } from "chai";
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("NFTMarketplace", function () {
      let nftMarketplace: NftMarketPlace,
        basicNft: BasicNFT,
        deployer: PromiseOrValue<string>,
        player: SignerWithAddress;

      const PRICE = ethers.utils.parseEther("0.01");
      const TOKEN_ID = 0;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        const accounts = await ethers.getSigners();
        player = accounts[1];
        await deployments.fixture(["nftmarketplace", "basicNFT"]);
        nftMarketplace = await ethers.getContract("NftMarketPlace");
        basicNft = await ethers.getContract("BasicNFT");
        await basicNft.mintNFT();
        await basicNft.approve(nftMarketplace.address, TOKEN_ID);
      });

      it("should list and can be bought", async function () {
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        const playerConnectedNftMarketplace = nftMarketplace.connect(player);
        await playerConnectedNftMarketplace.buyItem(
          basicNft.address,
          TOKEN_ID,
          {
            value: PRICE,
          }
        );
        const newOwner = await basicNft.ownerOf(TOKEN_ID);
        const deployerProceeds = await nftMarketplace.getProceeds(deployer);
        assert(newOwner.toString(), player.toString());
        assert(deployerProceeds.toString() == PRICE.toString());
      });
    });
