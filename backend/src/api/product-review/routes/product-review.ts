/**
 * product-review router
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/product-reviews',
      handler: 'product-review.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/product-reviews/:id',
      handler: 'product-review.findOne',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
