import CONFIG from './_config';
import { GatewayClient } from '../_lib/gateway';

export default function (name) {
    return new GatewayClient(name, CONFIG.PORTS.TERRACE);
};
