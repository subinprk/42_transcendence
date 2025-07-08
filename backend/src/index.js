const fastify = require('fastify')({ logger: true });

fastify.get('/', async (request, reply) => {
  return { message: 'Hello from Fastify in Docker!' };
});

fastify.get('/php', async (request, reply) => {
  const { exec } = require('child_process');

  exec('php /php/index.php', (error, stdout, stderr) => {
    if (error) {
      reply.status(500).send({ error: stderr });
    } else {
      reply.send({ output: stdout.trim() });
    }
  });
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
