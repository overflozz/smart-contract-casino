var Web3 = require('web3');
const contract = require('truffle-contract');
const rouletteJson = require('./contracts/Roulette.json');

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

    web3.eth.defaultAccount = web3.eth.accounts[0];
    abi = [ { constant: false,
        inputs: [],
        name: 'launch',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function' },
      { constant: true,
        inputs: [ [Object] ],
        name: 'bets',
        outputs: [ [Object], [Object], [Object], [Object] ],
        payable: false,
        stateMutability: 'view',
        type: 'function' },
      { constant: true,
        inputs: [ [Object] ],
        name: 'getPayoutForType',
        outputs: [ [Object] ],
        payable: false,
        stateMutability: 'view',
        type: 'function' },
      { constant: true,
        inputs: [],
        name: 'nextRoundTimestamp',
        outputs: [ [Object] ],
        payable: false,
        stateMutability: 'view',
        type: 'function' },
      { constant: false,
        inputs: [ [Object] ],
        name: 'betSingle',
        outputs: [],
        payable: true,
        stateMutability: 'payable',
        type: 'function' },
      { constant: true,
        inputs: [],
        name: 'lastRoundTimestamp',
        outputs: [ [Object] ],
        payable: false,
        stateMutability: 'view',
        type: 'function' },
      { constant: false,
        inputs: [],
        name: 'betEven',
        outputs: [],
        payable: true,
        stateMutability: 'payable',
        type: 'function' },
      { constant: true,
        inputs: [],
        name: 'getBetsCountAndValue',
        outputs: [ [Object], [Object] ],
        payable: false,
        stateMutability: 'view',
        type: 'function' },
      { inputs: [ [Object] ],
        payable: true,
        stateMutability: 'payable',
        type: 'constructor' },
      { anonymous: false,
        inputs: [ [Object], [Object] ],
        name: 'Finished',
        type: 'event' } ]
    

    
        //alert(web3.fromWei(web3.eth.getBalance(contratRouletteInstance.address), "ether").toNumber());
    //alert(web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), "ether").toNumber());
    var contratRoulette = web3.eth.contract(rouletteJson);
    //var contratRouletteInstance = contratRoulette.at(web3.eth.accounts[0]);
    contratRoulette.new(10, { from: web3.eth.accounts[0], value: web3.toWei(100, "ether") }).then(function(_contract) { contratRouletteInstance = _contract; });



    function actualiserInfos(){
      $("#choixUser select").empty();
      $("#recapAccounts tbody").empty();

      $.each( web3.eth.accounts, function( index, value ) {
        $("#choixUser select").append('<option value="'+value+'">'+ value +'</option>');
        $("#recapAccounts tbody").append("<tr><td class='mdl-data-table__cell--non-numeric'>"+value+"</td><td>25</td><td>" + web3.fromWei(web3.eth.getBalance(value), "ether").toNumber() + "</td></tr>");
    
      });

      $("#soldeContrat").empty().append(web3.fromWei(web3.eth.getBalance(contratRouletteInstance.address), "ether").toNumber())

}

function miserroulette(){
    var parieur = $("#choixUser select").val();
    var mise = $("#mise").value;
    var nombre = $("#nombre").value;
    // creation of contract object


    // on affiche le solde 
    //alert(web3.fromWei(web3.eth.getBalance(contratRouletteInstance.address), "ether").toNumber());
    //on pari sur pair :
    contratRouletteInstance.betEven({ from: parieur, value: web3.toWei(mise, "ether") });
    actualiserInfos();
}
function lancerroulette(){
  contratRouletteInstance.launch({ from: web3.eth.accounts[0] });
  actualiserInfos();
}
$(document).ready(function() {
    actualiserInfos();
    

});