export default function close(socketId: number) {
    process.on('SIGINT', function() {
        console.log("Caught interrupt signal");

        close(socketId);
        process.exit();
    });

    process.on('uncaughtException', function (err) {
        console.log(err);

        close(socketId);

        // Do I get an infinite loop here?
        process.exit(1);
    });
};

