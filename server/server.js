const Hapi = require('hapi');
const Path = require('path');
const Hoek = require('hoek');
var CardStore = require('./lib/cardStore');

CardStore.initialize();

const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, './')
      },
      cors: true
    }
  }
});
server.register(require('inert'), (err) => {

  if(err) {
    throw err;
  }
});

server.register(require('vision'), (err) => {

  Hoek.assert(!err, err);
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'templates'
  });
});

server.connection({ port: 3000 });


server.ext('onRequest', function(request, reply) {
  console.log('Request received' + request.path);
  reply.continue();
});

server.ext('onPreResponse', function(request, reply) {
  if(request.response.isBoom) {
    return reply.view('error', request.response);
  }
  reply.continue();
});


server.route(require('./lib/routes'));

server.start(function() {
  console.log('Listening on ' + server.info.uri);
});
