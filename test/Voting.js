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

    it('should have 0 voters', async () => {
      expect(await contract.totalVoters()).to.equal(0);
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

    it('should be allowed for the chair person only', async () => {
      expect(await contract.totalCandidates()).to.equal(0);

      await expect(contract.connect(addr1).addCandidate('John Doe'))
        .to.be.revertedWith('Only the chair person allowed!');

      expect(await contract.totalCandidates()).to.equal(0);
    })

    it('should be rejected when the voting time has started', async () => {
      const start = parseInt(Date.now() / 1000) - (60*60);
      const end = parseInt(Date.now() / 1000) + (60*60);
      await contract.setVotingTime(start, end);

      await expect(contract.addCandidate('John Doe'))
        .to.be.revertedWith('Voting has been started!');
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

    it('should be allowed for the chair person only', async () => {
      const initialVoters = parseInt(await contract.totalVoters());

      await expect(contract.connect(addr1).addVoter(addr1.address))
        .to.be.revertedWith('Only the chair person allowed!');

      const totalVoters = parseInt(await contract.totalVoters());
      expect(totalVoters).to.equal(initialVoters)
    })

    it('should be rejected when the voting time has started', async () => {
      const start = parseInt(Date.now() / 1000) - (60*60);
      const end = parseInt(Date.now() / 1000) + (60*60);
      await contract.setVotingTime(start, end);

      await expect(contract.addVoter(addr1.address))
        .to.be.revertedWith('Voting has been started!');
    })
  })

  describe('Election', () => {
    beforeEach(async () => {
      await contract.addCandidate('John Doe');
      await contract.addCandidate('Jane Doe');

      await contract.addVoter(addr1.address);
      await contract.addVoter(addr2.address);
      await contract.addVoter(addr3.address);

      const start = parseInt(Date.now() / 1000);
      const end = start + 60*60;
      await contract.setVotingTime(start, end);
    })

    it('should have 2 candidates and 3 voters', async () => {
      expect(await contract.totalCandidates()).to.equal(2);
      expect(await contract.totalVoters()).to.equal(3);
    })

    it('should allow voters to vote', async () => {
      await contract.connect(addr1).vote(0);
      await contract.connect(addr2).vote(1);
      await contract.connect(addr3).vote(0);

      let name, totalVotes;

      // John Doe should received 2 votes 
      [name, totalVotes] = await contract.getCandidate(0);
      expect(name).to.equal('John Doe');
      expect(totalVotes).to.equal(2);

      // Jane Doe should received 1 vote
      [name, totalVotes] = await contract.getCandidate(1);
      expect(name).to.equal('Jane Doe');
      expect(totalVotes).to.equal(1);

      // John Doe should be declared as the winner
      expect(await contract.getWinningCandidate()).to.equal('John Doe');
    })

    it('should allow each voter to vote only once', async () => {
      await contract.connect(addr1).vote(0);
      await expect(contract.connect(addr1).vote(1))
        .to.be.revertedWith('The voter has already voted.');
    })

    it('should not allow voting beyond the voting time', async () => {
      const start = parseInt(Date.now() / 1000) - (3600*24);
      const end = start + 3600;
      await contract.setVotingTime(start, end);

      await expect(contract.connect(addr1).vote(1))
        .to.be.revertedWith('Voting time has ended.');
    })

    it('should not allow addition of new candidates when the voting has started.', async () => {
      expect(await contract.isVotingTime()).to.equal(true);

      await expect(contract.addCandidate('Jack'))
        .to.be.revertedWith('Voting has been started!');
    })
  })

})
