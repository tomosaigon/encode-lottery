import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "Lottery" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployLottery: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  // string memory tokenName,
  // string memory tokenSymbol,
  // uint256 _purchaseRatio,
  // uint256 _betPrice,
  // uint256 _betFee
  await deploy("Lottery", {
    from: deployer,
    // Contract constructor arguments
    args: ["WBTC", "WBTC", 10000, hre.ethers.utils.parseEther("50"), hre.ethers.utils.parseEther("1")],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  const Lottery = await hre.ethers.getContract("Lottery", deployer);
  await Lottery.transferOwnership("0xE3c382A8B72643CC3756D532e967Eb44e885c619");
};

export default deployLottery;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Lottery
deployLottery.tags = ["Lottery"];
