import CONFIG from './_lib/config';
import { server } from './_lib/gateway';

server('terrace', CONFIG.PORTS.TERRACE);
