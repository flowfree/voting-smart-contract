// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract Voting {

    struct Voter {
        bool alreadyVoted;  
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
        voters[msg.sender] = Voter(false, -1);
        totalVoters++;
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
}
