var filestream = require('fs');
var CardStore={};

CardStore.cards={};

CardStore.initialize= function(){
CardStore.cards=loadCards();
};


function loadCards() {
  var file = filestream.readFileSync('./cards.json');
  console.log(file.toString());
  return JSON.parse(file.toString());
}

module.exports = CardStore;