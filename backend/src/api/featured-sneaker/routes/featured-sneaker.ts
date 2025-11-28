/**
 * featured-sneaker router
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/featured-sneaker',
      handler: 'featured-sneaker.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
