/**
 * featured-sneaker controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::featured-sneaker.featured-sneaker', ({ strapi }) => ({
  async find(ctx) {
    try {
      const { query } = ctx;
      
      const entity = await strapi.services['api::featured-sneaker.featured-sneaker'].find({
        ...query,
        populate: query.populate || ['products.images', 'products.thumbnail', 'products.product_variant', 'products.brand', 'products.category'],
      });

      // If no featured sneaker found, return empty products array
      if (!entity || !entity.results || entity.results.length === 0) {
        return {
          data: {
            products: [],
          },
        };
      }

      const featuredSneaker = entity.results[0];
      
      return {
        data: {
          products: featuredSneaker.products || [],
        },
      };
    } catch (error) {
      console.error("Error in featured-sneaker find:", error);
      // Return empty products array on error
      return {
        data: {
          products: [],
        },
      };
    }
  },
}));
