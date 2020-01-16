import {
    select,
    Socket,
    fd_set,
} from '../types';

export default function onSelect(selectFn: select, sockfd: Socket, fdSet: fd_set) {
    return new Promise((res, rej) => {
        selectFn(sockfd, fdSet, (err, value) => {
            if (err) {
                rej(err);
                return;
            }
            res(value);
            return;
        });
    });
};

