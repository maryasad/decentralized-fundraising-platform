const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CrowdFunding", function () {
  let crowdFunding;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get test accounts
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    crowdFunding = await CrowdFunding.deploy();
    await crowdFunding.waitForDeployment();
  });

  describe("Campaign Creation", function () {
    it("Should create a new campaign", async function () {
      const title = "Test Campaign";
      const description = "Test Description";
      const goal = ethers.parseEther("1"); // 1 ETH
      const duration = 30; // 30 days

      await crowdFunding.createCampaign(title, description, goal, duration);
      
      const campaign = await crowdFunding.getCampaign(0);
      
      expect(campaign[1]).to.equal(title); // title is at index 1
      expect(campaign[2]).to.equal(description); // description is at index 2
      expect(campaign[3]).to.equal(goal); // goal is at index 3
      expect(campaign[0]).to.equal(owner.address); // creator is at index 0
    });
  });

  describe("Contributions", function () {
    beforeEach(async function () {
      await crowdFunding.createCampaign(
        "Test Campaign",
        "Test Description",
        ethers.parseEther("1"),
        30
      );
    });

    it("Should accept contributions", async function () {
      const contribution = ethers.parseEther("0.5");
      await crowdFunding.connect(addr1).contribute(0, { value: contribution });
      
      const contributionAmount = await crowdFunding.getContribution(0, addr1.address);
      expect(contributionAmount).to.equal(contribution);
    });
  });

  describe("Fund Claiming", function () {
    beforeEach(async function () {
      await crowdFunding.createCampaign(
        "Test Campaign",
        "Test Description",
        ethers.parseEther("1"),
        30
      );
    });

    it("Should allow creator to claim funds when goal is reached", async function () {
      // Contribute enough to reach goal
      await crowdFunding.connect(addr1).contribute(0, {
        value: ethers.parseEther("1")
      });

      // Fast forward time
      await time.increase(time.duration.days(31));

      // Check balance before claiming
      const beforeBalance = await ethers.provider.getBalance(owner.address);

      // Claim funds
      await crowdFunding.claimFunds(0);

      // Check balance after claiming
      const afterBalance = await ethers.provider.getBalance(owner.address);
      expect(afterBalance).to.be.greaterThan(beforeBalance);
    });
  });

  describe("Refunds", function () {
    beforeEach(async function () {
      await crowdFunding.createCampaign(
        "Test Campaign",
        "Test Description",
        ethers.parseEther("2"),
        30
      );
    });

    it("Should allow refunds if goal is not reached", async function () {
      // Contribute less than the goal
      const contribution = ethers.parseEther("0.5");
      await crowdFunding.connect(addr1).contribute(0, { value: contribution });

      // Fast forward time
      await time.increase(time.duration.days(31));

      // Check balance before refund
      const beforeBalance = await ethers.provider.getBalance(addr1.address);

      // Get refund
      await crowdFunding.connect(addr1).getRefund(0);

      // Check balance after refund
      const afterBalance = await ethers.provider.getBalance(addr1.address);
      expect(afterBalance).to.be.greaterThan(beforeBalance);
    });
  });
});
