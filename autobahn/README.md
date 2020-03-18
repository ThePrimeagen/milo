### Getting started
Running the autobahn tests are annoying, but this library should take all the
suck out of it.

#### Start the autobahn server
you can choose what tests to run by editing your .env file.  CASES is the same
as it is in the fuzzingserver config file.


##### Start Server
```
npx ts-node autobahn/start.ts
```

##### Start Client
```
npx ts-node autobahn/milo.ts
```

#### Viewing Results
Go to localhost:8080 to review the results of the run.  `start` has to be
running for you to view the results.
