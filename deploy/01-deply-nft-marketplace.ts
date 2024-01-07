import { deployments, getNamedAccounts, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { developmentChains } from "../helper-hardhat-config";
import verify from "../utils/verify";
const deploy: DeployFunction = async function () {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const args: never[] = [];
  const nftMarketPlace = await deploy("NftMarketPlace", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: 1,
  });

  if (!developmentChains.includes(network.name)) {
    log("Verifying contract..,");
    await verify(nftMarketPlace.address, args);
  }
  log("----------------------------------------");
};

export default deploy;
deploy.tags = ["all", "nftmarketplace"];
