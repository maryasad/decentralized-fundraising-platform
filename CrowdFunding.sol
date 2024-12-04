// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CrowdFunding
 * @dev A smart contract for creating and managing fundraising campaigns
 */
contract CrowdFunding {
    struct Campaign {
        address creator;
        string title;
        string description;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        bool claimed;
        mapping(address => uint256) contributions;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    
    event CampaignCreated(uint256 campaignId, address creator, string title, uint256 goal);
    event ContributionMade(uint256 campaignId, address contributor, uint256 amount);
    event FundsClaimed(uint256 campaignId, address creator, uint256 amount);
    event RefundIssued(uint256 campaignId, address contributor, uint256 amount);

    /**
     * @dev Creates a new fundraising campaign
     * @param _title Campaign title
     * @param _description Campaign description
     * @param _goal Funding goal in wei
     * @param _durationInDays Campaign duration in days
     */
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays
    ) external {
        require(_goal > 0, "Goal must be greater than 0");
        require(_durationInDays > 0, "Duration must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");

        uint256 campaignId = campaignCount++;
        Campaign storage campaign = campaigns[campaignId];
        
        campaign.creator = msg.sender;
        campaign.title = _title;
        campaign.description = _description;
        campaign.goal = _goal;
        campaign.deadline = block.timestamp + (_durationInDays * 1 days);
        campaign.amountRaised = 0;
        campaign.claimed = false;

        emit CampaignCreated(campaignId, msg.sender, _title, _goal);
    }

    /**
     * @dev Allows users to contribute to a campaign
     * @param _campaignId ID of the campaign
     */
    function contribute(uint256 _campaignId) external payable {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");

        campaign.contributions[msg.sender] += msg.value;
        campaign.amountRaised += msg.value;

        emit ContributionMade(_campaignId, msg.sender, msg.value);
    }

    /**
     * @dev Allows campaign creator to claim funds if goal is reached
     * @param _campaignId ID of the campaign
     */
    function claimFunds(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(msg.sender == campaign.creator, "Only creator can claim funds");
        require(block.timestamp >= campaign.deadline, "Campaign is still ongoing");
        require(campaign.amountRaised >= campaign.goal, "Goal not reached");
        require(!campaign.claimed, "Funds already claimed");

        campaign.claimed = true;
        payable(campaign.creator).transfer(campaign.amountRaised);

        emit FundsClaimed(_campaignId, campaign.creator, campaign.amountRaised);
    }

    /**
     * @dev Allows contributors to get refund if campaign goal is not reached
     * @param _campaignId ID of the campaign
     */
    function getRefund(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(block.timestamp >= campaign.deadline, "Campaign is still ongoing");
        require(campaign.amountRaised < campaign.goal, "Goal was reached");
        
        uint256 amount = campaign.contributions[msg.sender];
        require(amount > 0, "No contribution found");
        
        campaign.contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit RefundIssued(_campaignId, msg.sender, amount);
    }

    /**
     * @dev Returns campaign details
     * @param _campaignId ID of the campaign
     */
    function getCampaign(uint256 _campaignId) external view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 goal,
        uint256 deadline,
        uint256 amountRaised,
        bool claimed
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.creator,
            campaign.title,
            campaign.description,
            campaign.goal,
            campaign.deadline,
            campaign.amountRaised,
            campaign.claimed
        );
    }

    /**
     * @dev Returns contribution amount for a specific address
     * @param _campaignId ID of the campaign
     * @param _contributor Address of the contributor
     */
    function getContribution(uint256 _campaignId, address _contributor) external view returns (uint256) {
        return campaigns[_campaignId].contributions[_contributor];
    }
}
