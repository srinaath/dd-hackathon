const uuid = require('uuid'),
  Joi = require('joi'),
  Boom = require('boom'),
  fs = require('fs');

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
