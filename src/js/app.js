window.App = {
  web3Provider: null,
  contracts: {},
  instances:{},
  listeInstances: [],
  ownerInstance: "",

  init: function() {


    return App.initWeb3();
  },

  initWeb3: function() {
      // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    // We load the Contract.
    $.getJSON('Roulette.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var RouletteArtifact = data;
      App.contracts.Roulette = TruffleContract(RouletteArtifact);
      App.contracts.Roulette.setProvider(App.web3Provider);
    });

    return App.listeTransactions();     
  },

  loadContract: function(address) {
    // We will load the instance we want to play with.
      App.contracts.Roulette
      .at(address) //Address of the contract
      .then(instance =>{
        App.instances.roulette = instance;
        // We now look for the Owner.
        App.instances.roulette.contract.getOwner(function(result, error){
          if(error){
            console.log(error);
          }
          else{
            App.ownerInstance = result;
            // Then we refresh the display.
            return App.actualiserInfos();
          }
        });
      });
    
  },

  createContract: function(){
    // This will create a new instance of Roulette Contract.
    var parieur = $("#choixUser select").val();
    App.contracts.Roulette.new(0, { from: parieur, value: web3.toWei(10, "ether") , gas: 6000000}).then(function(instance){
      App.instances.roulette = instance;
      App.listeTransactions();
      App.actualiserInfos();

    });
  },

  actualiserInfos: function (){
    console.log("Refreshing...");
    
    $("#choixUser select").empty();
    $("#recapAccounts tbody").empty();


    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
    $.each( accounts, function( index, value ) {
  
      $("#choixUser select").append('<option value="'+value+'">'+ value +'</option>');
      web3.eth.getBalance(value, function (error, result) {
        if(error){
          console.error(error);
        }else{
          $("#recapAccounts tbody").append("\
          <tr>\
            <td class='mdl-data-table__cell--non-numeric'>"+value+"</td>\
            <td>25</td>\
            <td>" + web3.fromWei(result, "ether").toNumber() + "</td>\
          </tr>\
          ");
        }
      });
      
    });
    
    web3.eth.getBalance(App.instances.roulette.contract.address, function (error, result) {
      if(error){
        console.error(error);
      }else{
        $("#soldeContrat").empty().append(web3.fromWei(result, "ether").toNumber());
      }
    });
    App.instances.roulette.contract.getResultNumber(function(error, result) {
      if(error){
        console.log(error);
      }else{
        $("#resultatContrat").empty().append(result.toNumber());
      }

    });        
      
    });

    return App.refreshingListeInstances();
  },
  refreshingListeInstances: function(){
    // We want to know, during the callack, the indice of the contract ( to attach the address to the button).
    // So we need to count how many callbacks have been called until now.
    var callsOverCount = 0;
    // We delete the existing list.
    console.log("Refreshing List Instances ...");
    $("#listeInstances").empty();
    for (var i in App.listeInstances){
      // For each instances we retrieve the balance and show it.
      web3.eth.getBalance(App.listeInstances[i].address, function (error, result) {
        if(error){
          console.error(error);
        }else{
          //Callback and converting to get the balance.
          var balance = web3.fromWei(result, "ether").toNumber();
          // Append in the front page.
          $("#listeInstances").append("\
          <div class='col s3'>\
          <div class='card blue-grey darken-1 center white-text'><br />\
          Banque :\
          <h3> "+ balance  +"</h3><br />\
          <a class='waves-effect waves-light btn black-text white' onclick='App.loadContract(\""+App.listeInstances[callsOverCount].address+"\")'><i class='material-icons left'>cloud</i>button</a><br />\
          </div>\
          ");
          callsOverCount += 1;

        }
      });
    }   
  },
  miserroulette: function (){
    var parieur = $("#choixUser select").val();
    var mise = $("#mise")["0"].value;
    var nombre = $("#nombre")["0"].value;
    //creation de la transaction pour le betEven.
    App.instances.roulette.betEven({ from: parieur, value: web3.toWei(mise, "ether") , gas: 2000000}).then(function(result, error){
      console.log(result);
      App.actualiserInfos();
      
    });
     
      
  },

  lancerroulette: function (){
    var parieur = $("#choixUser select").val();
    
    //on lance la transaction pour lancer la roulette
      App.instances.roulette.launch({ from:parieur, gas: 2000000}).then(function(result, error){
        if(error){
          
          console.log(error);
        }else{
          console.log(result);
          // we actualise informations.
          App.actualiserInfos();
        }
      });
      
      
  },
  listeTransactions: function(){
    var n = 0; // n will be the number of blocks.
    // The main problem of this function is that calls to transactions are non synchronous.
    // But we want to wait for results before refreshing the display of the list of contracts.
    // That's why we count the number of emitted calls to the blockchain.
    // Thanks to the callbacks we also count the number of finished calls.
    // When both counts are equal, we have finish our call, so we can start refreshing the display.
    // Without doing that, the display functions would have been called several times
    // and with the non synchronous calls in it, it would have been a problem.
    var callsCount = 0;
    var callsOverCount = 0;
    var callsrefreshList = 0;
    web3.eth.getBlockNumber(function(error, result) {
      if (error) {
        console.log(error);
      }else{
        var n = result;

        var instances = []; // This will be the list of contracts addresses.
        for(var i = 0; i < n; i++) {
          web3.eth.getBlock(i, true, function(error, result){
            var block = result; 
            // We look at all transactions in the block.
            for (var i in block.transactions){           
              // We check if it is a contract creation by looking at the "to" parameter.
                if(block.transactions[i]["to"]=="0x0"){
              // we open the transaction receipt at the address of the transaction
              // to get the address of the contract.
                web3.eth.getTransactionReceipt(block.transactions[i]["hash"],function(error, result){
                  if(error){
                    console.log(error);
                  }else{
                    // We now have the address.
                    var address = result["contractAddress"];
                    // We load the instance of Roulette Contract with the address we've just found.
                    App.contracts.Roulette
                    .at(address)
                    .then(instance =>{
                      // We add the instance to the contracts list.
                      instances.push(instance);
                      // We increase the number of calls that are finished.
                      callsOverCount += 1;
                      // We have reached the last call so we can launch the display refresh.
                      if(callsOverCount == callsCount){
                        App.refreshingListeInstances();
                      }
                      
                    });
                    callsCount += 1;
                  }              
                });
              }
            }
          });
        }
        console.log(instances);
        
        App.listeInstances = instances;
        
      }
     
     
      
    });
    
    
  }
  
};



$(function() {
  $(window).load(function() {
    App.init();
  });
  
});


