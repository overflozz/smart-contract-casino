var Roulette = artifacts.require("Roulette");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(Roulette);
};
