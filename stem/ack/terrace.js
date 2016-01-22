import CONFIG from './_api/_config';
import { GatewayServer } from './_lib/gateway';

GatewayServer('terrace', CONFIG.PORTS.TERRACE);
