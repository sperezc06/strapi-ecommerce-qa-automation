module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/orders',
      handler: 'order.create',
      config: {
        auth: false, // Permitir acceso sin autenticación para testing
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/orders/checkout/count-price',
      handler: 'order.countPrice',
    },
    {
      method: 'POST',
      path: '/orders/checkout/validate-address',
      handler: 'order.validateAddress',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/orders/checkout/shipping-rate',
      handler: 'order.shippingRate',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/orders/checkout/webhook-stripe',
      handler: 'order.webhookStripe',
    },
    {
      method: 'GET',
      path: '/orders/transaction/:code',
      handler: 'order.getOrderWithCode',
    },
    {
      method: 'GET',
      path: '/orders/me/transaction',
      handler: 'order.getMyOrder',
      // Por defecto requiere autenticación, no necesita config.auth
    },
    {
      method: 'GET',
      path: '/orders/me/transaction/:code',
      handler: 'order.getOrderById',
      // Por defecto requiere autenticación, no necesita config.auth
    },
  ]
}