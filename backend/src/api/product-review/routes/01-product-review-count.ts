module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/product-reviews/:slug/count', // Only match when the URL parameter is composed of lowercase letters
      handler: 'product-review.reviewCount',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    }
  ]
}