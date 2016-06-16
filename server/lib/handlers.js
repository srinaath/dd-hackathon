const uuid = require('uuid'),
  Joi = require('joi'),
  Boom = require('boom'),
  fs = require('fs');
  Twitter = require('twitter');

var CardStore=require('./cardStore');
var Handlers = {};

var cardSchema = Joi.object().keys({
  name: Joi.string().min(3).max(30).required(),
  recipient_email: Joi.string().email()
});

Handlers.newCardHandler = function(request, reply) {
  if(request.method === 'get') {
    reply.view('new.html');
  } else {
    Joi.validate(request.payload, cardSchema, function(err, val) {
      if(err) {
        reply(Boom.badRequest(err.details[0].message));
      } else {
        var card = {
          name: request.payload.name,
          recipient_email: request.payload.recipient_email,
          sender_name: request.payload.sender_name,
          sender_email: request.payload.sender_email,
          card_image: request.payload.card_image
        };
        saveCard(card);
        reply.redirect('/cards');
      }

    });
  }
}

Handlers.tweetHandler=function(request,reply){

  var client = new Twitter({
                  consumer_key: 'A73excZpMzHfK7joKs7bvKj4u',
                  consumer_secret: 'Dn0oosJMIRfQvUULwVBWXjAtmQLeCWSIgPhVbYVdwQl1FRM32q',
                  access_token_key: '2825341537-imsrd2knXZNlgscxNc9ccoYM6NkFoT8EMAYijPX',
                  access_token_secret: 'Ocu2TahdxSQZXwzjUsFEJgKKNacKObe1Sl2DNpOyMZ1xa'
                });
                

                var searchTerm = request.paramsArray[0];
                var geocode=request.paramsArray[1] + ',' + request.paramsArray[2] + ','+ request.paramsArray[3];
                
                console.log('My radius is' + geocode);
                
                 
                var params = 
                {
                    q: searchTerm,
                    geocode: geocode,
                    count:'100'
                };
                client.get('search/tweets', params, function(error, tweets, response){
                  if (!error) {
                    console.log(tweets);
                    reply(tweets);
                  }
                  else{
                    console.log("error");
                    reply(error);
                  }
                });    
}

Handlers.deleteCardHandler = function(request, reply) {
  delete CardStore.cards[request.params.id];
}

Handlers.cardsHandler = function(request, reply) {
  return reply.view('cards.html', { cards: CardStore.cards });
}

function saveCard(card) {
  var id = uuid.v1();
  card.id = id;
  CardStore.cards[id] = card;
}

module.exports = Handlers;
