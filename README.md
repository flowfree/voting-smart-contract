Voting Smart Contract
=====================

![Unit tests](https://github.com/flowfree/voting-smart-contract/actions/workflows/main.yml/badge.svg)

Sample smart contract for voting system on top of the Ethereum blockchain.

**Problem statement:**

> Electronic voting systems have replaced paper-based systems, but even now, people doubt the voting system’s ability to secure the data and defend against any attacks. The blockchain-based system can ensure transparent and publicly verifiable elections in the country. If implemented successfully, voting can be done using a mobile application that is attached to a blockchain system.

**Specifications:**

- The owner of the contract can input one or more choices to be voted by people.
- The owner of the contract can specify the start time and end time for the voting period.
- A voter can vote for any choices set by the contract owner during the voting period.
- A voter can only vote once during the voting period.
- The smart contract can return the number of votes for each choice.
- TODO: Anyone can set up a voting system through the same smart contract.
- TODO: After the voting period, pick a random voter from the highest voted choice, and send 0.1 ETH reward.


Prerequisites
-------------
Make sure you have the latest version of Node.js installed on your system.


Deployment on local Ethereum node
---------------------------------
In this section I will show you how to compile and deploy the smart contract on your local machine. 
We will be using Hardhat Network as the local Ethereum network for development.

1.  Install the required packages:

        npm install --save-dev

1.  Compile the smart contract:

        npx hardhat compile

1.  Open a second terminal and run the Hardhat Network:

        npx hardhat node

    Keep the command running on its own terminal.

1.  Now we need to deploy the smart contract to our local Ethereum node. To do this, run the 
    `scripts/deploy.js` script with `localhost` as the target network:

        npx hardhat run scripts/deploy.js --network localhost

    You will see the following output similar like this:

        Deploying contract with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        Account balance: 10000000000000000000000
        Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3

Take a note of the contract address shown in the output (in my case it is `0x5FbDB...`) as you 
will need it to interact with the smart contract later.


Interacting with the smart contract
-----------------------------------
Now that you have deployed the smart contract to the local Ethereum node, lets see how we can 
interact with the deployed smart contract. Hardhat comes built-in with an interactive Javascript 
console, and we will use the console to interact with the smart contract.

**Note:** if you have stopped the Hardhat Node, you need to run it again on another terminal and 
redeploy the smart contract.

1.  Open the Hardhat console and connect to the `localhost` network:

        npx hardhat console --network localhost

1.  Get the available accounts (or `Signer` in ethers.js lingo):

        > const [owner, addr1, addr2, addr3] = await ethers.getSigners()

1.  Create an instance of `Voting`, and attach to the deployed contract:

        > const Voting = await ethers.getContractFactory('Voting')
        > const contract = await Voting.attach('<contract address>')

    Replace `<contact address>` with the address shown after the deployment above.

1.  Add some candidates:

        > await contract.addCandidate('John Doe')
        > await contract.addCandidate('Jane Doe)

1.  Give voting right to the voters:

        > await contract.addVoter(addr1.address)
        > await contract.addVoter(addr2.address)
        > await contract.addVoter(addr3.address)

1.  Set the election period. For example, to set the election period from now for 1 hour:

        > const start = parseInt(Date.now() / 1000)
        > const end = start + (60*60)
        > await contract.setVotingTime(start, end)

    Note that after you set the election period, you are no longer able to add new candidates 
    or new voters.

1.  Do some votings. For example, 2 users voted for "John Doe" and 1 user voted for "Jane Doe":

        > await contract.connect(addr1).vote(0)   // 0 = index of "John Doe"
        > await contract.connect(addr2).vote(0)
        > await contract.connect(addr3).vote(1)   // 1 = index of "Jane Doe"

1.  Check the election result with this code:

        > const [names, totalVotes] = await contract.getCandidates()
        > for (let i = 0; i < names.length; i++) {
        ...   console.log(`Name = ${names[i]}, total votes = ${totalVotes[i]}`)
        ... }

    Output:

        Name = John Doe, total votes = 2
        Name = Jane Doe, total votes = 1

1.  You can also see the winner using a single line of code:

        > await contract.getWinningCandidate()
        'John Doe'

1.  Type CTRL+C to exit the console.


Deploying to Ethereum mainnet/testnet
-------------------------------------
To deploy the smart contract to the real Ethereum networks (mainnet or testnet), we will use 
[Alchemy](https://alchemy.com). Create an account on Alchemy and get your API key. 

You also need to [get your private key from Metamask](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key) since you will need to pay the gas feed 
when deploying and making transactions. Put both of your private key and API key in a safe place 
and never share them.

Here is the steps to deploy the smart contract to the Rinkeby network:

1.  Create a new `.env` file to store the keys:

        cp .env.sample .env

2.  Open `.env` file and fill in both variables:

        ALCHEMY_API_KEY=<your API key>
        RINKEBY_PRIVATE_KEY=<your metamask private key>

3.  Compile the project:

        npx hardhat compile

4.  Deploy to Rinkeby:

        npx hardhat run scripts/deploy.js --network rinkeby

    Sample output:

        Deploying contract with the account: 0x76D0912B34c52400A47E32614193ac0e0142f237
        Account balance: 8868315484446809
        Contract address: 0x261a393cA0c0a1aDc532e54a15F04A24420E3218

You can use Hardhat console to interact to the deployed smart contract, but most likely you will need 
a dedicated frontend for the smart contract since this is a semi-production deployment.


Run the unit tests
------------------
Type the following from your terminal:

    npx hardhat test

It will run the tests and displays the output like this:

    Compiled 1 Solidity file successfully

    Voting Contract
      Deployment
        ✔ should set the deployer as chairperson
        ✔ should have 0 candidates
        ✔ should have 0 voters
      Adding candidates
        ✔ should add the candidates to the list (44ms)
        ✔ should be allowed for the chair person only (43ms)
        ✔ should be rejected when the voting time has started
      Retrieving candidates
        ✔ should return a single candidate
        ✔ should returns all candidates
      Adding Voters
        ✔ should add the new voter to the list
        ✔ should be allowed for the chair person only
        ✔ should be rejected when the voting time has started
      Election
        ✔ should have 2 candidates and 3 voters
        ✔ should allow voters to vote
        ✔ should allow each voter to vote only once
        ✔ should not allow voting with invalid candidate
        ✔ should not allow voting beyond the voting time
        ✔ should not allow addition of new candidates when the voting has started.


Some cautions for users
-----------------------
This project was developed to demonstrate the possibility of using Ethereum blockchain for 
Election or Voting. The smart contract is meant to be simple and easy to extend, and I avoid 
using too complex code or scenarios. 

With this limitation, it is possible that the smart contract will fail on some edge cases.
For example, it is possible that the owner/chairperson modify the voting period in the past date 
and the contract currently doesn't have the mechanism to blacklist the users.

If you find an issue that you feel need to be addressed immediately, feel free to open a Github 
issue or submit a PR.

License
-------
MIT License

Copyright &copy; 2022 Nashruddin Amin
