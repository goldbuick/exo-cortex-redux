import CONFIG from './_lib/config';
import { GatewayServer } from './_lib/gateway';

GatewayServer('terrace', CONFIG.PORTS.TERRACE);
