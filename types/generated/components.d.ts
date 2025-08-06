import type { Attribute, Schema } from '@strapi/strapi';

export interface ProductBenefit extends Schema.Component {
  collectionName: 'components_product_benefits';
  info: {
    description: '\u4EA7\u54C1\u529F\u6548';
    displayName: 'Benefit';
  };
  attributes: {
    description: Attribute.Text;
    icon: Attribute.String;
    order: Attribute.Integer & Attribute.DefaultTo<0>;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ProductIngredient extends Schema.Component {
  collectionName: 'components_product_ingredients';
  info: {
    description: '\u4EA7\u54C1\u6210\u5206';
    displayName: 'Ingredient';
  };
  attributes: {
    benefits: Attribute.Text;
    description: Attribute.Text;
    hasPatent: Attribute.Boolean & Attribute.DefaultTo<false>;
    isImported: Attribute.Boolean & Attribute.DefaultTo<false>;
    name: Attribute.String & Attribute.Required;
    patentInfo: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'product.benefit': ProductBenefit;
      'product.ingredient': ProductIngredient;
    }
  }
}
