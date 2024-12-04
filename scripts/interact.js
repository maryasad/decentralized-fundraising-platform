const main = async () => {
    // Get the contract factory
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    
    // Deploy the contract
    const crowdFunding = await CrowdFunding.deploy();
    await crowdFunding.waitForDeployment();
    console.log("Contract deployed to:", await crowdFunding.getAddress());

    // Get signers (accounts)
    const [owner, addr1] = await ethers.getSigners();
    
    // Create a campaign
    const createTx = await crowdFunding.createCampaign(
        "Test Campaign",
        "This is a test campaign",
        ethers.parseEther("1"), // 1 ETH goal
        30 // 30 days duration
    );
    await createTx.wait();
    console.log("Campaign created");

    // Get campaign details
    const campaign = await crowdFunding.getCampaign(0);
    console.log("Campaign details:", {
        creator: campaign[0],
        title: campaign[1],
        description: campaign[2],
        goal: ethers.formatEther(campaign[3]),
        deadline: new Date(Number(campaign[4]) * 1000).toLocaleString(),
        amountRaised: ethers.formatEther(campaign[5]),
        claimed: campaign[6]
    });

    // Make a contribution
    const contributeTx = await crowdFunding.connect(addr1).contribute(0, {
        value: ethers.parseEther("0.5")
    });
    await contributeTx.wait();
    console.log("Contribution made");

    // Check contribution
    const contribution = await crowdFunding.getContribution(0, addr1.address);
    console.log("Contribution amount:", ethers.formatEther(contribution), "ETH");
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
