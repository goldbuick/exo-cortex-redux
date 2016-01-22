import CONFIG from './_config';
import { GatewayListen } from '../_lib/gateway';

export default function () {
    return new GatewayListen(CONFIG.PORTS.TERRACE);
};
