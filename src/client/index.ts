import bindings from 'bindings';
import clientChat from './chat';

const n = bindings('native-sockets');
clientChat(n);

