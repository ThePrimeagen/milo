export default function wait(ms: number): Promise<undefined> {
    return new Promise(res => {
        setTimeout(res, ms);
    });
};

