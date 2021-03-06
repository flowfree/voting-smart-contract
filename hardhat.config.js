require('@nomiclabs/hardhat-waffle')
require('dotenv').config()

const { ALCHEMY_API_KEY, RINKEBY_PRIVATE_KEY } = process.env;

const config = {
  solidity: "0.8.13",
  networks: {}
}

if (ALCHEMY_API_KEY && RINKEBY_PRIVATE_KEY) {
  config.networks.rinkeby = {
    url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    accounts: [`${RINKEBY_PRIVATE_KEY}`]
  }
}

module.exports = config;
