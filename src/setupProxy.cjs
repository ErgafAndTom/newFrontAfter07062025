// src/setupProxy.cjs  (или setupProxy.cjs, если "type":"module")
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Проксируем WS на /ws/uploads → :5555
  app.use(
    createProxyMiddleware('/ws/uploads', {
      target: 'http://localhost:5555',
      changeOrigin: true,
      ws: true,
      // включи лог, чтобы видеть [proxy][WS] upgrade → ...
      logLevel: 'debug',
    })
  );

  // (опционально) обычный HTTP API
  // app.use(
  //   '/api',
  //   createProxyMiddleware({
  //     target: 'http://localhost:5555',
  //     changeOrigin: true,
  //     logLevel: 'debug',
  //   })
  // );
};
