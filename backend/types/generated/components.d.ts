import type { Schema, Attribute } from '@strapi/strapi';

export interface OrderOrderContact extends Schema.Component {
  collectionName: 'components_order_order_contacts';
  info: {
    displayName: 'Order Contact';
    icon: 'book';
    description: '';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    phone_number: Attribute.String & Attribute.Required;
    email: Attribute.Email & Attribute.Required;
    address: Attribute.String & Attribute.Required;
    state: Attribute.String & Attribute.Required;
    city: Attribute.String & Attribute.Required;
    zip_code: Attribute.String & Attribute.Required;
    country: Attribute.String & Attribute.Required;
  };
}

export interface OrderOrderProductItem extends Schema.Component {
  collectionName: 'components_order_order_product_items';
  info: {
    displayName: 'Order Product Item';
    icon: 'arrowRight';
    description: '';
  };
  attributes: {
    product: Attribute.Relation<
      'order.order-product-item',
      'oneToOne',
      'api::product.product'
    >;
    quantity: Attribute.Integer & Attribute.Required;
    price: Attribute.Decimal & Attribute.Required;
    total: Attribute.Decimal & Attribute.Required;
    variant: Attribute.String;
    product_name: Attribute.String;
  };
}

export interface OrderOrderProducts extends Schema.Component {
  collectionName: 'components_order_order_products';
  info: {
    displayName: 'Order Products';
    icon: 'grid';
    description: '';
  };
  attributes: {
    items: Attribute.Component<'order.order-product-item', true>;
  };
}

export interface ProductVariantInformation extends Schema.Component {
  collectionName: 'components_product_variant_informations';
  info: {
    displayName: 'Variant Information';
    icon: 'apps';
    description: '';
  };
  attributes: {
    variant_name: Attribute.String & Attribute.Required;
    variant_price: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    length: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<1>;
    width: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<1>;
    height: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<1>;
    weight: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<1>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'order.order-contact': OrderOrderContact;
      'order.order-product-item': OrderOrderProductItem;
      'order.order-products': OrderOrderProducts;
      'product.variant-information': ProductVariantInformation;
    }
  }
}
