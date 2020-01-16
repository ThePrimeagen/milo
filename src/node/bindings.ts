import bindings from 'bindings';

import {
    NativeSocketInterface
} from './types'

// Special case handling for node native layer.
// @ts-ignore
const b = bindings('native-sockets') as NativeSocketInterface;

export default b;
