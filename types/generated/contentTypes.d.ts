import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiAiTokenAiToken extends Schema.CollectionType {
  collectionName: 'ai_tokens';
  info: {
    description: 'AI\u4EE3\u5E01\u914D\u7F6E\u4FE1\u606F';
    displayName: 'AI\u4EE3\u5E01';
    pluralName: 'ai-tokens';
    singularName: 'ai-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: false;
    };
  };
  attributes: {
    contract_address: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::ai-token.ai-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text;
    is_active: Attribute.Boolean & Attribute.DefaultTo<true>;
    logo_url: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    price_api_id: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    price_source: Attribute.Enumeration<
      ['coingecko', 'binance', 'dexscreener']
    > &
      Attribute.Required;
    symbol: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::ai-token.ai-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    weight: Attribute.Integer &
      Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Attribute.DefaultTo<20>;
  };
}

export interface ApiChoujiangJiLuChoujiangJiLu extends Schema.CollectionType {
  collectionName: 'choujiang_ji_lus';
  info: {
    description: '\u7528\u6237\u62BD\u5956\u5386\u53F2\u8BB0\u5F55';
    displayName: '\u62BD\u5956\u8BB0\u5F55';
    pluralName: 'choujiang-ji-lus';
    singularName: 'choujiang-ji-lu';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: false;
    };
  };
  attributes: {
    chance: Attribute.Relation<
      'api::choujiang-ji-lu.choujiang-ji-lu',
      'manyToOne',
      'api::choujiang-jihui.choujiang-jihui'
    > &
      Attribute.Required;
    clientIp: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 45;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::choujiang-ji-lu.choujiang-ji-lu',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    drawTime: Attribute.DateTime & Attribute.Required;
    ipAddress: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 45;
      }>;
    isWon: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<false>;
    jiangpin: Attribute.Relation<
      'api::choujiang-ji-lu.choujiang-ji-lu',
      'manyToOne',
      'api::choujiang-jiangpin.choujiang-jiangpin'
    > &
      Attribute.Required;
    prizeSnapshot: Attribute.JSON;
    prizeValue: Attribute.Decimal;
    shippingOrder: Attribute.Relation<
      'api::choujiang-ji-lu.choujiang-ji-lu',
      'oneToOne',
      'api::shipping-order.shipping-order'
    >;
    sourceOrder: Attribute.Relation<
      'api::choujiang-ji-lu.choujiang-ji-lu',
      'manyToOne',
      'api::dinggou-dingdan.dinggou-dingdan'
    >;
    sourceType: Attribute.Enumeration<
      ['investment_redeem', 'daily_login', 'invitation', 'admin_grant', 'other']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'other'>;
    traceId: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        maxLength: 36;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::choujiang-ji-lu.choujiang-ji-lu',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::choujiang-ji-lu.choujiang-ji-lu',
      'manyToOne',
      'plugin::users-permissions.user'
    > &
      Attribute.Required;
    userAgent: Attribute.Text;
  };
}

export interface ApiChoujiangJiangpinChoujiangJiangpin
  extends Schema.CollectionType {
  collectionName: 'choujiang_jiangpins';
  info: {
    description: '\u62BD\u5956\u7CFB\u7EDF\u4E2D\u7684\u5956\u54C1\u914D\u7F6E';
    displayName: '\u62BD\u5956\u5956\u54C1';
    pluralName: 'choujiang-jiangpins';
    singularName: 'choujiang-jiangpin';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: false;
    };
  };
  attributes: {
    category: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::choujiang-jiangpin.choujiang-jiangpin',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    currentQuantity: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    description: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    group: Attribute.Relation<
      'api::choujiang-jiangpin.choujiang-jiangpin',
      'manyToOne',
      'api::lottery-group.lottery-group'
    >;
    image: Attribute.Media<'images'>;
    imageThumb: Attribute.Media<'images'>;
    jiangpinType: Attribute.Enumeration<
      ['usdt', 'ai_token', 'physical', 'virtual']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'usdt'>;
    kaiQi: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<true>;
    maxQuantity: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    minUserLevel: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 100;
        minLength: 1;
      }>;
    paiXuShunXu: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    probability_test: Attribute.Decimal &
      Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    rarity: Attribute.Enumeration<['common', 'rare', 'epic', 'legendary']> &
      Attribute.Required &
      Attribute.DefaultTo<'common'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::choujiang-jiangpin.choujiang-jiangpin',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    validUntil: Attribute.DateTime;
    value: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          max: 999999.99;
          min: 0;
        },
        number
      >;
    zhongJiangLv: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<1>;
  };
}

export interface ApiChoujiangJihuiChoujiangJihui extends Schema.CollectionType {
  collectionName: 'choujiang_jihuis';
  info: {
    description: '\u7528\u6237\u62BD\u5956\u673A\u4F1A\u7BA1\u7406';
    displayName: '\u62BD\u5956\u673A\u4F1A';
    pluralName: 'choujiang-jihuis';
    singularName: 'choujiang-jihui';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: false;
    };
  };
  attributes: {
    count: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Attribute.DefaultTo<1>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::choujiang-jihui.choujiang-jihui',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<true>;
    jiangpin: Attribute.Relation<
      'api::choujiang-jihui.choujiang-jihui',
      'manyToOne',
      'api::choujiang-jiangpin.choujiang-jiangpin'
    >;
    reason: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    sourceInviteRecord: Attribute.Relation<
      'api::choujiang-jihui.choujiang-jihui',
      'manyToOne',
      'api::yaoqing-jiangli.yaoqing-jiangli'
    >;
    sourceOrder: Attribute.Relation<
      'api::choujiang-jihui.choujiang-jihui',
      'manyToOne',
      'api::dinggou-dingdan.dinggou-dingdan'
    >;
    type: Attribute.Enumeration<
      ['investment_redeem', 'daily_login', 'invitation', 'admin_grant', 'other']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'other'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::choujiang-jihui.choujiang-jihui',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    usedCount: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    user: Attribute.Relation<
      'api::choujiang-jihui.choujiang-jihui',
      'manyToOne',
      'plugin::users-permissions.user'
    > &
      Attribute.Required;
    validUntil: Attribute.DateTime;
  };
}

export interface ApiDinggouDingdanDinggouDingdan extends Schema.CollectionType {
  collectionName: 'dinggou_dingdans';
  info: {
    description: '\u6295\u8D44\u8BA4\u8D2D\u8BA2\u5355\u7BA1\u7406';
    displayName: '\u8BA4\u8D2D\u8BA2\u5355';
    pluralName: 'dinggou-dingdans';
    singularName: 'dinggou-dingdan';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: false;
    };
  };
  attributes: {
    amount: Attribute.Decimal & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::dinggou-dingdan.dinggou-dingdan',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    cycle_days: Attribute.Integer & Attribute.Required;
    end_at: Attribute.DateTime & Attribute.Required;
    jiangli: Attribute.Relation<
      'api::dinggou-dingdan.dinggou-dingdan',
      'oneToOne',
      'api::yaoqing-jiangli.yaoqing-jiangli'
    >;
    jihua: Attribute.Relation<
      'api::dinggou-dingdan.dinggou-dingdan',
      'manyToOne',
      'api::dinggou-jihua.dinggou-jihua'
    > &
      Attribute.Required;
    payout_amount: Attribute.Decimal;
    principal: Attribute.Decimal & Attribute.Required;
    redeemed_at: Attribute.DateTime;
    start_at: Attribute.DateTime & Attribute.Required;
    status: Attribute.Enumeration<
      ['pending', 'running', 'finished', 'cancelled', 'redeemable']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'pending'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::dinggou-dingdan.dinggou-dingdan',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::dinggou-dingdan.dinggou-dingdan',
      'manyToOne',
      'plugin::users-permissions.user'
    > &
      Attribute.Required;
    yield_rate: Attribute.Decimal & Attribute.Required;
  };
}

export interface ApiDinggouJihuaDinggouJihua extends Schema.CollectionType {
  collectionName: 'dinggou_jihuas';
  info: {
    description: '\u6295\u8D44\u8BA4\u8D2D\u8BA1\u5212\u7BA1\u7406';
    displayName: '\u8BA4\u8D2D\u8BA1\u5212';
    pluralName: 'dinggou-jihuas';
    singularName: 'dinggou-jihua';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: false;
    };
  };
  attributes: {
    aiBili: Attribute.Decimal & Attribute.Required;
    benjinUSDT: Attribute.Decimal & Attribute.Required & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::dinggou-jihua.dinggou-jihua',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    current_slots: Attribute.Integer & Attribute.DefaultTo<0>;
    daily_order_count: Attribute.Integer & Attribute.DefaultTo<0>;
    daily_order_limit: Attribute.Integer & Attribute.DefaultTo<100>;
    description: Attribute.Text;
    dingdanList: Attribute.Relation<
      'api::dinggou-jihua.dinggou-jihua',
      'oneToMany',
      'api::dinggou-dingdan.dinggou-dingdan'
    >;
    end_date: Attribute.DateTime;
    jihuaCode: Attribute.String & Attribute.Required & Attribute.Unique;
    jingtaiBili: Attribute.Decimal & Attribute.Required;
    kaiqi: Attribute.Boolean & Attribute.DefaultTo<true>;
    last_reset_date: Attribute.Date;
    lottery_chances: Attribute.Integer & Attribute.DefaultTo<0>;
    lottery_prize_id: Attribute.Integer;
    max_slots: Attribute.Integer & Attribute.DefaultTo<100>;
    name: Attribute.String & Attribute.Required;
    start_date: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::dinggou-jihua.dinggou-jihua',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    zhouQiTian: Attribute.Integer & Attribute.Required;
  };
}

export interface ApiLotteryGroupLotteryGroup extends Schema.CollectionType {
  collectionName: 'lottery_groups';
  info: {
    description: '\u62BD\u5956\u5956\u6C60\u5206\u7EC4\u7BA1\u7406';
    displayName: '\u5956\u6C60\u7EC4';
    pluralName: 'lottery-groups';
    singularName: 'lottery-group';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: false;
    };
  };
  attributes: {
    config: Attribute.JSON;
    coverImage: Attribute.Media<'images'>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::lottery-group.lottery-group',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    endAt: Attribute.DateTime;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    prizes: Attribute.Relation<
      'api::lottery-group.lottery-group',
      'oneToMany',
      'api::choujiang-jiangpin.choujiang-jiangpin'
    >;
    sort: Attribute.Integer & Attribute.DefaultTo<0>;
    startAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::lottery-group.lottery-group',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    visible: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<true>;
  };
}

export interface ApiNoticeNotice extends Schema.CollectionType {
  collectionName: 'notices';
  info: {
    description: '\u7CFB\u7EDF\u516C\u544A';
    displayName: 'Notice';
    pluralName: 'notices';
    singularName: 'notice';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    content: Attribute.Text;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::notice.notice',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    priority: Attribute.Integer & Attribute.DefaultTo<0>;
    publishedAt: Attribute.DateTime;
    title: Attribute.String & Attribute.Required;
    type: Attribute.Enumeration<['info', 'success', 'warning', 'error']> &
      Attribute.DefaultTo<'info'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::notice.notice',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiQianbaoYueQianbaoYue extends Schema.CollectionType {
  collectionName: 'qianbao_yues';
  info: {
    description: '\u7528\u6237\u94B1\u5305\u4F59\u989D\u7BA1\u7406';
    displayName: '\u94B1\u5305\u4F59\u989D';
    pluralName: 'qianbao-yues';
    singularName: 'qianbao-yue';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: false;
    };
  };
  attributes: {
    aiTokenBalances: Attribute.JSON & Attribute.DefaultTo<{}>;
    aiYue: Attribute.Decimal & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::qianbao-yue.qianbao-yue',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::qianbao-yue.qianbao-yue',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    usdtYue: Attribute.Decimal & Attribute.DefaultTo<0>;
    user: Attribute.Relation<
      'api::qianbao-yue.qianbao-yue',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiRechargeChannelRechargeChannel
  extends Schema.CollectionType {
  collectionName: 'recharge_channels';
  info: {
    description: '\u7BA1\u7406\u5145\u503C\u63D0\u73B0\u901A\u9053\u7CFB\u7EDF';
    displayName: '\u5145\u503C\u901A\u9053';
    pluralName: 'recharge-channels';
    singularName: 'recharge-channel';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    asset: Attribute.String & Attribute.Required & Attribute.DefaultTo<'USDT'>;
    channelType: Attribute.Enumeration<['recharge', 'withdrawal', 'both']> &
      Attribute.DefaultTo<'both'>;
    confirmations: Attribute.Integer & Attribute.DefaultTo<12>;
    contractAddress: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::recharge-channel.recharge-channel',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    dailyLimit: Attribute.Decimal & Attribute.DefaultTo<'50000.00'>;
    decimals: Attribute.Integer & Attribute.DefaultTo<18>;
    feeRate: Attribute.Decimal & Attribute.DefaultTo<'0.001'>;
    fixedFee: Attribute.Decimal & Attribute.DefaultTo<'1.00'>;
    maxAmount: Attribute.Decimal & Attribute.DefaultTo<'10000.00'>;
    minAmount: Attribute.Decimal & Attribute.DefaultTo<'10.00'>;
    name: Attribute.String & Attribute.Required & Attribute.Unique;
    network: Attribute.Enumeration<['BSC', 'ETH', 'TRON', 'POLYGON']> &
      Attribute.DefaultTo<'BSC'>;
    rechargeOrders: Attribute.Relation<
      'api::recharge-channel.recharge-channel',
      'oneToMany',
      'api::recharge-order.recharge-order'
    >;
    scanInterval: Attribute.Integer & Attribute.DefaultTo<30>;
    status: Attribute.Enumeration<['active', 'inactive', 'maintenance']> &
      Attribute.DefaultTo<'active'>;
    totalRechargeAmount: Attribute.Decimal & Attribute.DefaultTo<'0.00'>;
    totalTransactions: Attribute.Integer & Attribute.DefaultTo<0>;
    totalWithdrawalAmount: Attribute.Decimal & Attribute.DefaultTo<'0.00'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::recharge-channel.recharge-channel',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    walletAddress: Attribute.String & Attribute.Required;
    walletPrivateKey: Attribute.Text & Attribute.Private;
    withdrawalOrders: Attribute.Relation<
      'api::recharge-channel.recharge-channel',
      'oneToMany',
      'api::withdrawal-order.withdrawal-order'
    >;
  };
}

export interface ApiRechargeOrderRechargeOrder extends Schema.CollectionType {
  collectionName: 'recharge_orders';
  info: {
    description: '\u7528\u6237\u5145\u503C\u8BA2\u5355\u8BB0\u5F55';
    displayName: '\u5145\u503C\u8BA2\u5355';
    pluralName: 'recharge-orders';
    singularName: 'recharge-order';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    actualAmount: Attribute.Decimal & Attribute.DefaultTo<'0.00'>;
    amount: Attribute.Decimal & Attribute.Required;
    blockNumber: Attribute.BigInteger;
    channel: Attribute.Relation<
      'api::recharge-order.recharge-order',
      'manyToOne',
      'api::recharge-channel.recharge-channel'
    >;
    completedTime: Attribute.DateTime;
    confirmations: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::recharge-order.recharge-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    currency: Attribute.Enumeration<['USDT', 'USDC', 'BTC', 'ETH']> &
      Attribute.DefaultTo<'USDT'>;
    expectedTime: Attribute.DateTime;
    fee: Attribute.Decimal & Attribute.DefaultTo<'0.00'>;
    metadata: Attribute.JSON;
    orderNo: Attribute.String & Attribute.Required & Attribute.Unique;
    receiveAddress: Attribute.String & Attribute.Required;
    receivedTime: Attribute.DateTime;
    remark: Attribute.Text;
    status: Attribute.Enumeration<
      ['pending', 'processing', 'completed', 'failed', 'cancelled']
    > &
      Attribute.DefaultTo<'pending'>;
    txHash: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::recharge-order.recharge-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::recharge-order.recharge-order',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiShippingOrderShippingOrder extends Schema.CollectionType {
  collectionName: 'shipping_orders';
  info: {
    description: '\u5B9E\u7269\u5956\u54C1\u53D1\u8D27\u7BA1\u7406';
    displayName: '\u53D1\u8D27\u8BA2\u5355';
    pluralName: 'shipping-orders';
    singularName: 'shipping-order';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: false;
    };
  };
  attributes: {
    address: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    carrier: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    city: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::shipping-order.shipping-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    deliveredAt: Attribute.DateTime;
    district: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    log: Attribute.JSON;
    mobile: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    province: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    receiverName: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    record: Attribute.Relation<
      'api::shipping-order.shipping-order',
      'oneToOne',
      'api::choujiang-ji-lu.choujiang-ji-lu'
    > &
      Attribute.Required;
    remark: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    shippedAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['pending', 'processing', 'shipped', 'delivered', 'failed']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'pending'>;
    trackingNo: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::shipping-order.shipping-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    zipCode: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 10;
      }>;
  };
}

export interface ApiShopCartShopCart extends Schema.CollectionType {
  collectionName: 'shop_carts';
  info: {
    description: '\u8D2D\u7269\u8F66\u5546\u54C1';
    displayName: 'Shop Cart';
    pluralName: 'shop-carts';
    singularName: 'shop-cart';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::shop-cart.shop-cart',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    product: Attribute.Relation<
      'api::shop-cart.shop-cart',
      'manyToOne',
      'api::shop-product.shop-product'
    >;
    quantity: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Attribute.DefaultTo<1>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::shop-cart.shop-cart',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::shop-cart.shop-cart',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiShopOrderShopOrder extends Schema.CollectionType {
  collectionName: 'shop_orders';
  info: {
    description: '\u5546\u57CE\u8BA2\u5355';
    displayName: 'Shop Order';
    pluralName: 'shop-orders';
    singularName: 'shop-order';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::shop-order.shop-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    orderNumber: Attribute.String & Attribute.Required & Attribute.Unique;
    paymentMethod: Attribute.String & Attribute.DefaultTo<'usdt'>;
    product: Attribute.Relation<
      'api::shop-order.shop-order',
      'manyToOne',
      'api::shop-product.shop-product'
    >;
    productName: Attribute.String;
    productPrice: Attribute.Decimal;
    quantity: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    shippingAddress: Attribute.JSON;
    status: Attribute.Enumeration<
      ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
    > &
      Attribute.DefaultTo<'pending'>;
    totalAmount: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::shop-order.shop-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::shop-order.shop-order',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiShopProductShopProduct extends Schema.CollectionType {
  collectionName: 'shop_products';
  info: {
    description: '\u5546\u57CE\u5546\u54C1';
    displayName: 'Shop Product';
    pluralName: 'shop-products';
    singularName: 'shop-product';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    category: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::shop-product.shop-product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text;
    images: Attribute.Media<'images', true>;
    isPhysical: Attribute.Boolean & Attribute.DefaultTo<true>;
    name: Attribute.String & Attribute.Required;
    price: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    status: Attribute.Enumeration<['active', 'inactive']> &
      Attribute.DefaultTo<'active'>;
    stock: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::shop-product.shop-product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiShopShippingOrderShopShippingOrder
  extends Schema.CollectionType {
  collectionName: 'shop_shipping_orders';
  info: {
    description: '\u5546\u57CE\u5B9E\u7269\u5546\u54C1\u53D1\u8D27\u7BA1\u7406';
    displayName: '\u5546\u57CE\u53D1\u8D27\u8BA2\u5355';
    pluralName: 'shop-shipping-orders';
    singularName: 'shop-shipping-order';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: false;
    };
  };
  attributes: {
    address: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    carrier: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    city: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::shop-shipping-order.shop-shipping-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    deliveredAt: Attribute.DateTime;
    district: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    log: Attribute.JSON;
    mobile: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    orderNumber: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    product: Attribute.Relation<
      'api::shop-shipping-order.shop-shipping-order',
      'oneToOne',
      'api::shop-product.shop-product'
    > &
      Attribute.Required;
    province: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    quantity: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    receiverName: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    remark: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    shippedAt: Attribute.DateTime;
    shopOrder: Attribute.Relation<
      'api::shop-shipping-order.shop-shipping-order',
      'oneToOne',
      'api::shop-order.shop-order'
    > &
      Attribute.Required;
    status: Attribute.Enumeration<
      ['pending', 'processing', 'shipped', 'delivered', 'failed']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'pending'>;
    trackingNo: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::shop-shipping-order.shop-shipping-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::shop-shipping-order.shop-shipping-order',
      'manyToOne',
      'plugin::users-permissions.user'
    > &
      Attribute.Required;
    zipCode: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 10;
      }>;
  };
}

export interface ApiSystemConfigSystemConfig extends Schema.CollectionType {
  collectionName: 'system_configs';
  info: {
    description: '\u7CFB\u7EDF\u914D\u7F6E\u8868';
    displayName: 'System Config';
    pluralName: 'system-configs';
    singularName: 'system-config';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::system-config.system-config',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    key: Attribute.String & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::system-config.system-config',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    value: Attribute.Text & Attribute.Required;
  };
}

export interface ApiUserFcmTokenUserFcmToken extends Schema.CollectionType {
  collectionName: 'user_fcm_tokens';
  info: {
    description: '\u5B58\u50A8\u7528\u6237\u7684Firebase Cloud Messaging token';
    displayName: 'User FCM Token';
    pluralName: 'user-fcm-tokens';
    singularName: 'user-fcm-token';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::user-fcm-token.user-fcm-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    deviceType: Attribute.Enumeration<['android', 'ios']> &
      Attribute.DefaultTo<'android'>;
    fcmToken: Attribute.Text & Attribute.Required;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::user-fcm-token.user-fcm-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    userId: Attribute.Integer & Attribute.Required;
  };
}

export interface ApiUserNotificationReadUserNotificationRead
  extends Schema.CollectionType {
  collectionName: 'user_notification_reads';
  info: {
    description: '\u7528\u6237\u901A\u77E5\u8BFB\u53D6\u8BB0\u5F55';
    displayName: 'User Notification Read';
    pluralName: 'user-notification-reads';
    singularName: 'user-notification-read';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::user-notification-read.user-notification-read',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    noticeId: Attribute.Integer & Attribute.Required;
    readAt: Attribute.DateTime & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::user-notification-read.user-notification-read',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::user-notification-read.user-notification-read',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiUserNotificationSettingsUserNotificationSettings
  extends Schema.CollectionType {
  collectionName: 'user_notification_settings';
  info: {
    description: '\u7528\u6237\u901A\u77E5\u8BBE\u7F6E';
    displayName: 'User Notification Settings';
    pluralName: 'user-notification-settings-list';
    singularName: 'user-notification-settings';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::user-notification-settings.user-notification-settings',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    emailNotifications: Attribute.Boolean & Attribute.DefaultTo<false>;
    marketingNotifications: Attribute.Boolean & Attribute.DefaultTo<false>;
    pushNotifications: Attribute.Boolean & Attribute.DefaultTo<true>;
    systemNotifications: Attribute.Boolean & Attribute.DefaultTo<true>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::user-notification-settings.user-notification-settings',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::user-notification-settings.user-notification-settings',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiWithdrawalOrderWithdrawalOrder
  extends Schema.CollectionType {
  collectionName: 'withdrawal_orders';
  info: {
    description: '\u7528\u6237\u63D0\u73B0\u8BA2\u5355\u8BB0\u5F55';
    displayName: '\u63D0\u73B0\u8BA2\u5355';
    pluralName: 'withdrawal-orders';
    singularName: 'withdrawal-order';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    actualAmount: Attribute.Decimal & Attribute.DefaultTo<'0.00'>;
    amount: Attribute.Decimal & Attribute.Required;
    blockNumber: Attribute.BigInteger;
    channel: Attribute.Relation<
      'api::withdrawal-order.withdrawal-order',
      'manyToOne',
      'api::recharge-channel.recharge-channel'
    >;
    completedTime: Attribute.DateTime;
    confirmations: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::withdrawal-order.withdrawal-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    currency: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'USDT'>;
    fee: Attribute.Decimal & Attribute.DefaultTo<'0.00'>;
    metadata: Attribute.JSON;
    orderNo: Attribute.String & Attribute.Required & Attribute.Unique;
    processTime: Attribute.DateTime;
    remark: Attribute.Text;
    requestTime: Attribute.DateTime;
    reviewedBy: Attribute.Relation<
      'api::withdrawal-order.withdrawal-order',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    reviewRemark: Attribute.Text;
    reviewTime: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected']
    > &
      Attribute.DefaultTo<'pending'>;
    txHash: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::withdrawal-order.withdrawal-order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::withdrawal-order.withdrawal-order',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    withdrawAddress: Attribute.String & Attribute.Required;
    withdrawNetwork: Attribute.Enumeration<['BSC', 'ETH', 'TRON', 'POLYGON']> &
      Attribute.DefaultTo<'BSC'>;
  };
}

export interface ApiYaoqingJiangliYaoqingJiangli extends Schema.CollectionType {
  collectionName: 'yaoqing-jiangli';
  info: {
    displayName: '\u9080\u8BF7\u5956\u52B1';
    pluralName: 'yaoqing-jianglis';
    singularName: 'yaoqing-jiangli';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-api': {
      enabled: true;
    };
  };
  attributes: {
    calculation: Attribute.Text;
    childPrincipal: Attribute.String;
    commissionablePrincipal: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::yaoqing-jiangli.yaoqing-jiangli',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    laiyuanDan: Attribute.Relation<
      'api::yaoqing-jiangli.yaoqing-jiangli',
      'oneToOne',
      'api::dinggou-dingdan.dinggou-dingdan'
    >;
    laiyuanRen: Attribute.Relation<
      'api::yaoqing-jiangli.yaoqing-jiangli',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    parentTier: Attribute.String;
    rewardLevel: Attribute.Integer & Attribute.DefaultTo<1>;
    rewardType: Attribute.Enumeration<['referral', 'team', 'bonus']> &
      Attribute.DefaultTo<'referral'>;
    shouyiUSDT: Attribute.String & Attribute.Required;
    tuijianRen: Attribute.Relation<
      'api::yaoqing-jiangli.yaoqing-jiangli',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::yaoqing-jiangli.yaoqing-jiangli',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    inviteCode: Attribute.String & Attribute.Unique;
    invitedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    invitedUsers: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    qianbao: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::qianbao-yue.qianbao-yue'
    >;
    resetPasswordToken: Attribute.String & Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user_notification_reads: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::user-notification-read.user-notification-read'
    >;
    user_notification_settings: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::user-notification-settings.user-notification-settings'
    >;
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::ai-token.ai-token': ApiAiTokenAiToken;
      'api::choujiang-ji-lu.choujiang-ji-lu': ApiChoujiangJiLuChoujiangJiLu;
      'api::choujiang-jiangpin.choujiang-jiangpin': ApiChoujiangJiangpinChoujiangJiangpin;
      'api::choujiang-jihui.choujiang-jihui': ApiChoujiangJihuiChoujiangJihui;
      'api::dinggou-dingdan.dinggou-dingdan': ApiDinggouDingdanDinggouDingdan;
      'api::dinggou-jihua.dinggou-jihua': ApiDinggouJihuaDinggouJihua;
      'api::lottery-group.lottery-group': ApiLotteryGroupLotteryGroup;
      'api::notice.notice': ApiNoticeNotice;
      'api::qianbao-yue.qianbao-yue': ApiQianbaoYueQianbaoYue;
      'api::recharge-channel.recharge-channel': ApiRechargeChannelRechargeChannel;
      'api::recharge-order.recharge-order': ApiRechargeOrderRechargeOrder;
      'api::shipping-order.shipping-order': ApiShippingOrderShippingOrder;
      'api::shop-cart.shop-cart': ApiShopCartShopCart;
      'api::shop-order.shop-order': ApiShopOrderShopOrder;
      'api::shop-product.shop-product': ApiShopProductShopProduct;
      'api::shop-shipping-order.shop-shipping-order': ApiShopShippingOrderShopShippingOrder;
      'api::system-config.system-config': ApiSystemConfigSystemConfig;
      'api::user-fcm-token.user-fcm-token': ApiUserFcmTokenUserFcmToken;
      'api::user-notification-read.user-notification-read': ApiUserNotificationReadUserNotificationRead;
      'api::user-notification-settings.user-notification-settings': ApiUserNotificationSettingsUserNotificationSettings;
      'api::withdrawal-order.withdrawal-order': ApiWithdrawalOrderWithdrawalOrder;
      'api::yaoqing-jiangli.yaoqing-jiangli': ApiYaoqingJiangliYaoqingJiangli;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
