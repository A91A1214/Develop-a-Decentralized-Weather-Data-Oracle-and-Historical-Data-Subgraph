const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WeatherOracle", function () {
    let WeatherOracle;
    let weatherOracle;
    let owner;
    let addr1;
    const linkTokenAddr = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia LINK
    const oracleAddr = "0x6090149791d654a000460114444033221006114a"; // Sepolia Oracle
    const jobId = ethers.utils.toUtf8Bytes("ca98366cc37d4222aadd18d8b1d0303a");
    const fee = ethers.utils.parseEther("0.1");

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        WeatherOracle = await ethers.getContractFactory("WeatherOracle");
        // Note: In real tests, we would mock the LINK token and Oracle
        weatherOracle = await WeatherOracle.deploy(linkTokenAddr, oracleAddr, jobId, fee);
        await weatherOracle.deployed();
    });

    it("Should set the right owner", async function () {
        expect(await weatherOracle.owner()).to.equal(owner.address);
    });

    it("Should allow owner to update oracle and jobId", async function () {
        const newOracle = "0x0000000000000000000000000000000000000001";
        const newJobId = ethers.utils.toUtf8Bytes("newjobid");

        await weatherOracle.setChainlinkOracle(newOracle);
        await weatherOracle.setJobId(newJobId);

        expect(await weatherOracle.oracle()).to.equal(newOracle);
        expect(await weatherOracle.jobId()).to.equal(ethers.utils.hexlify(newJobId));
    });

    it("Should emit WeatherRequested event", async function () {
        // This will fail without funding the contract with LINK if we had the actual check
        // But for unit testing the logic of emission:
        await expect(weatherOracle.requestWeather("London"))
            .to.emit(weatherOracle, "WeatherRequested");
    });
});
