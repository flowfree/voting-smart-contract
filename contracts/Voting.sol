// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract Voting {

    struct Voter {
        bool canVote;
        bool hasVoted;  
        int vote;          
    }

    struct Candidate {
        string name;       
        uint voteCount;   
    }

    Candidate[] public candidates;
    uint public totalCandidates;

    mapping(address => Voter) public voters;
    uint public totalVoters;

    address public chairperson;

    constructor() {
        chairperson = msg.sender;
    }

    function addCandidate(string memory name) external {
        require(msg.sender == chairperson, 'Only the chair person allowed!');
        candidates.push(Candidate(name, 0));
        totalCandidates++;
    }

    function getCandidate(uint index) public view returns (string memory, uint) {
        Candidate memory candidate = candidates[index];
        return (candidate.name, candidate.voteCount);
    }

    function getCandidates() public view returns (string[] memory, uint[] memory) {
        string[] memory names = new string[](totalCandidates);
        uint[] memory voteCounts = new uint[](totalCandidates);
        for (uint i = 0; i < totalCandidates; i++) {
            names[i] = candidates[i].name;
            voteCounts[i] = candidates[i].voteCount;
        }
        return (names, voteCounts);
    }

    function addVoter(address addr) external {
        require(msg.sender == chairperson, 'Only the chair person allowed!');
        require(voters[addr].canVote == false, 'The voter already exist.');
        require(voters[addr].hasVoted == false, 'The voter already voted.');

        voters[addr].canVote = true;
        voters[addr].vote = -1;
        totalVoters++;
    }

    function vote(uint candidateIndex) external {
        require(voters[msg.sender].hasVoted == false, 'The voter has already voted.');

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].vote = int(candidateIndex);
        candidates[candidateIndex].voteCount++;
    }

    function getWinningCandidate() public view returns (string memory name) {
        uint winningVoteCount = 0;
        for (uint i = 0; i < totalCandidates; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                name = candidates[i].name;
            }
        }
    }
}
