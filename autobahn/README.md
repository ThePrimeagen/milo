### Getting started
To get started please make sure you have docker completely installed and
working on your system.

#### .env
The `.env` drives the basic values for the autobahn server and client.  If you
wish to override those values create and reassign the values in a file called
`.milo-test-env`.

##### Properties
To control your experience using the autobahn tester, here are the variables
you need to have.

###### CASES
Cases determines which tests to run.

*Running a specific case*

CASES=1.1.1

*Running a set of cases*

CASES=1.*

*Running Several Cases*

CASES=1.*,2.*

*Running all cases*

CASES=*

###### NRDP
NRDP has to be defined (the command used to execute NRDP, `pvm current run --`
is a good example of a possible value of NRDP.

###### SELF_MANAGED_AUTOBAHN
If you wish to run your own server, set this value `false` in `.milo-test-env`.
This is a good variable to set false when developing or debugging against
autobahn

### Developing/Debuging Against Autobahn
To develop against autobahn, follow these steps.

1. Set `SELF_MANAGED_AUTOBAHN` to false in your `.milo-test-env`.
2. Set `CASES` to the set of tests you wish to run against in you `.milo-test-env`.
3. Start the server to test against.  `npx ts-node autobahn/start.ts`
4. In a new terminal window start the client.  I would suggest building before
   running. `npm run node && npx ts-node autobahn/test-harness.ts`
5. When the tests have ran, the output will be saved and viewable at
   [http://localhost:8080](http://localhost:8080).  Click the `Client Reports` link.

#### Debugger
If you wish to launch the node debugger, run the `test-harness` with `node
--inspect ./node_modules/.bin/ts-node autobahn/test-hardness.ts`.  This will
still launch the node tester with a node debugger.

#### NRDP
If you wish to run NRDP as the client, you need to slightly modify the `client` command, step 4.

*NRDP Version*
4. In a new terminal window start the client.  I would suggest building before
   running. `npm run nrdp && npx ts-node autobahn/test-harness.ts nrdp`

#### Viewing Results
All results are viewable at [http://localhost:8080](http://localhost:8080), but
to view them you must have your server started.

If you wish to clean your results and start fresh then you need to do the
following.

1. Stop your server.
2. Delete the reports directory, `rm -rf autobahn-testsuite/docker/reports`
3. Start your server back up.
