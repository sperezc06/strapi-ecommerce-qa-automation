/**
 * product-review controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::product-review.product-review', ({ strapi }) => ({
  async reviewCount(ctx) {
    try {
    const { slug } = ctx.params;
      
      if (!slug) {
        return ctx.badRequest("Product slug is required");
      }
    
    const reviews = await strapi.services['api::product-review.product-review'].find({
      pagination: {
        limit: -1
      },
      filters: {
        show_review: {
          $eq: true
        },
        product: {
          slug: {
            $eq: slug
          }
        }
        },
        populate: ['product']
    })

    let totalReviews = 0;
    let totalRating = 0;

      const reviewsData = reviews.results || []

    if (reviewsData && reviewsData.length > 0) {
      totalReviews = reviewsData.length;
        const sumRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0);
        totalRating = sumRating / totalReviews;
    }

    return {
      totalReviews,
        averageRating: totalRating || 0,
      };
    } catch (error) {
      console.error("Error in reviewCount:", error);
      // Return default values on error
      return {
        totalReviews: 0,
        averageRating: 0,
    };
    }
  },
}));
