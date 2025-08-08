import { HybridPushService } from '../../../services/push/hybrid-push';

export default ({ strapi }) => new HybridPushService(strapi); 