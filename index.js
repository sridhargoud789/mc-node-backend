const {startServer} = require('./src/app')
;(async () => {
  global.project_dir = __dirname;
  await startServer();
})();
