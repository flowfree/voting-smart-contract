const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Voting Contract', () => {
  let owner, addr1, addr2, addr3;
  let contract;

  beforeEach(async () => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory('Voting');
    contract = await Voting.deploy();
  });

  describe('Deployment', () => {
    it('should set the deployer as chairperson', async () => {
      expect(await contract.chairperson()).to.equal(owner.address);
    })

    it('should have 0 candidates', async () => {
      expect(await contract.totalCandidates()).to.equal(0);
    })

    it('should have 1 voter', async () => {
      expect(await contract.totalVoters()).to.equal(1);
    })
  })

  describe('Adding candidates', () => {
    it('should add the candidates to the list', async () => {
      await contract.addCandidate('John Doe');
      await contract.addCandidate('Jane Doe');

      expect(await contract.totalCandidates()).to.equal(2);

      let name, voteCount;

      [name, voteCount] = await contract.getCandidate(0);
      expect(name).to.equal('John Doe');
      expect(voteCount).to.equal(ethers.BigNumber.from(0));

      [name, voteCount] = await contract.getCandidate(1);
      expect(name).to.equal('Jane Doe');
      expect(voteCount).to.equal(ethers.BigNumber.from(0));
    })

    it('allowed for the chair person only', async () => {
      expect(await contract.totalCandidates()).to.equal(0);

      await expect(contract.connect(addr1).addCandidate('John Doe'))
        .to.be.revertedWith('Only the chair person allowed!');

      expect(await contract.totalCandidates()).to.equal(0);
    })
  })

  describe('Retrieving candidates', () => {
    const candidates = ['John Doe', 'Jane Doe', 'Jane Smith'];

    beforeEach(() => {
      candidates.forEach(async (name) => {
        await contract.addCandidate(name);
      })
    })

    it('should return a single candidate', async () => {
      const [name, voteCount] = await contract.getCandidate(2);

      expect(name).to.equal('Jane Smith');
      expect(voteCount).to.equal(ethers.BigNumber.from(0));
    })

    it('should returns all candidates', async () => {
      const [names, voteCounts] = await contract.getCandidates();

      names.forEach((name, index) => {
        expect(name).to.equal(candidates[index]);
        expect(voteCounts[index]).to.equal(ethers.BigNumber.from(0));
      })
    })
  })

  describe('Adding Voters', () => {
    it('should add the new voter to the list', async () => {
      const initialVoters = parseInt(await contract.totalVoters());

      await contract.addVoter(addr1.address);
      await contract.addVoter(addr2.address);
      await contract.addVoter(addr3.address);

      expect(await contract.totalVoters()).to.equal(initialVoters + 3);
    })

    it('allowed for the chair person only', async () => {
      const initialVoters = parseInt(await contract.totalVoters());

      await expect(contract.connect(addr1).addVoter(addr1.address))
        .to.be.revertedWith('Only the chair person allowed!');

      const totalVoters = parseInt(await contract.totalVoters());
      expect(totalVoters).to.equal(initialVoters)
    })
  })

})
