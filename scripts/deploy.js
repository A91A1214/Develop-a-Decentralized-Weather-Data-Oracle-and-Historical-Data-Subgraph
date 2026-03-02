const hre = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const linkToken = process.env.LINK_TOKEN;
    const oracle = process.env.CHAINLINK_ORACLE;
    const jobId = hre.ethers.utils.toUtf8Bytes(process.env.CHAINLINK_JOB_ID.replace(/-/g, ""));
    const fee = hre.ethers.utils.parseEther("0.1"); // 0.1 LINK

    if (!linkToken || !oracle || !jobId) {
        console.error("Please set LINK_TOKEN, CHAINLINK_ORACLE, and CHAINLINK_JOB_ID in .env");
        process.exit(1);
    }

    const WeatherOracle = await hre.ethers.getContractFactory("WeatherOracle");
    const weatherOracle = await WeatherOracle.deploy(linkToken, oracle, jobId, fee);

    await weatherOracle.deployed();

    console.log("WeatherOracle deployed to:", weatherOracle.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
