import bindings from 'bindings';
import serverChat from './chat';

const n = bindings('native-sockets');
serverChat(n);

