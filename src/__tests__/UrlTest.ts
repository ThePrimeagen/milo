import Url from "../Url";

describe('Url', () => {
    'use strict';

    const assume = require('assume');
    const parse = (str?: string, base?: string|Url) => { return new Url(str, base); };

    it('exposes parse as a function', () => {
        assume(parse).is.a('function');
    });

    // it('exposes the querystring module', () => {
    //     assume(parse.qs).equals(require('querystringify'));
    // });

    // it('exposes the location function', () => {
    //     assume(parse.location).is.a('function');
    // });

    // it('exposes the extractScheme function', () => {
    //     assume(parse.extractScheme).is.a('function');
    // });

    it('defaults to empty address to return valid URL instance', () => {
        const url = parse();

        assume(url).to.be.an('object');
        assume(url.path).to.be.a('string');
        assume(url.host).to.be.an('undefined');
        assume(url.hostname).to.be.an('undefined');
    });

    // it('works when the global variable is not defined', () => {
    //     const globalVar = global;
    //     global = undefined;
    //     const url = parse('http://google.com/?foo=bar', true);

    //     assume(url).to.be.an('object');
    //     assume(url.path).to.be.a('string');
    //     assume(url.host).to.be.a('string');
    //     assume(url.hostname).to.be.a('string');

    //     global = globalVar;
    // });

    // describe('trimLeft', () => {
    //     it('is a function', () => {
    //         assume(parse.trimLeft).is.a('function');
    //     });

    //     it('removes whitespace on the left', () => {
    //         assume(parse.trimLeft('  lol')).equals('lol');
    //     });

    //     it('calls toString on a given value', () => {
    //         //
    //         // When users pass in `window.location` it's not an actual string
    //         // so you can't replace on it. So it needs to be cast to a string.
    //         //
    //         const fake = {
    //             toString: () => {
    //                 return 'wat';
    //             }
    //         };

    //         assume(parse.trimLeft(fake)).equals('wat');
    //     });
    // });

    // describe('extractScheme', () => {
    //     it('extracts the scheme data', () => {
    //         assume(parse.extractScheme('http://example.com')).eql({
    //             slashes: true,
    //             scheme: 'http:',
    //             rest: 'example.com'
    //         });
    //     });

    //     it('extracts the scheme data for nothing', () => {
    //         assume(parse.extractScheme('')).eql({
    //             slashes: false,
    //             scheme: '',
    //             rest: ''
    //         });
    //     });

    //     it('does not truncate the input string', () => {
    //         const input = 'foo\nbar\rbaz\u2028qux\u2029';

    //         assume(parse.extractScheme(input)).eql({
    //             slashes: false,
    //             scheme: '',
    //             rest: input
    //         });
    //     });

    //     it('trimsLeft', () => {
    //         assume(parse.extractScheme(' javascript://foo')).eql({
    //             slashes: true,
    //             scheme: 'javascript:',
    //             rest: 'foo'
    //         });
    //     });
    // });

    // it('parses the query string into an object', () => {
    //     const url = 'http://google.com/?foo=bar'
    //     const data = parse(url, true);

    //     assume(data.query).is.a('object');
    //     assume(data.query.foo).equals('bar');

    //     url = 'http://google.com/';
    //     data = parse(url, true);

    //     assume(data.query).is.a('object');
    //     assume(data.query).is.empty();
    // });

    it('does not add question mark to href if query string is empty', () => {
        const url = 'http://google.com/'
        const data = parse(url);

        assume(data.href).equals(url);
    });

    // it('allows a custom function as parser', () => {
    //     const url = 'http://google.com/?foo=bar'
    //     const data = parse(url, () => { return '1337'; });

    //     assume(data.query).equals('1337');
    // });

    // it('allows a custom stringify function', () => {
    //     const url = 'http://google.com/?foo=bar'
    //     const data = parse(url, true)
    //     const str = data.toString(() => { return 'lolcakes'; });
    //     assume(str).equals('http://google.com/?lolcakes');
    // });

    it('allows a custom location object', () => {
        const url = '/foo?foo=bar'
        const data = parse(url, parse('http://google.com'));

        assume(data.href).equals('http://google.com/foo?foo=bar');
    });

    it('allows a custom location string', () => {
        const url = '/foo?foo=bar'
        const data = parse(url, 'http://google.com');

        assume(data.href).equals('http://google.com/foo?foo=bar');
    });


    // it('is blob: location aware', () => {
    //     const blob = {
    //         'href': 'blob:https%3A//gist.github.com/3f272586-6dac-4e29-92d0-f674f2dde618',
    //         'path': 'https%3A//gist.github.com/3f272586-6dac-4e29-92d0-f674f2dde618',
    //         'origin': 'https://gist.github.com',
    //         'scheme': 'blob:',
    //         'hostname': '',
    //         'search': '',
    //         'fragment': '',
    //         'host': '',
    //         'port': ''
    //     };

    //     const url = '/unshiftio/url-parse'
    //     const data = parse(url, blob);

    //     assume(data.href).equals('https://gist.github.com/unshiftio/url-parse');
    // });

    it('can parse complex urls multiple times without errors', () => {
        const url = 'https://www.mozilla.org/en-US/firefox/34.0/whatsnew/?oldversion=33.1';

        for (let i = 0; i < 100; i++) {
            parse(url);
        }
    });

    it('converts hostname to lowercase', () => {
        const url = 'HTTP://fOo.eXaMPle.com';

        require("fs").writeFileSync("/tmp/shit", parse(url).hostname);
        // console.log(parse(url).hostname);

        assume(parse(url).hostname).equals('foo.example.com');
    });

    it('does not lowercase the path', () => {
        const url = 'HTTP://X.COM/Y/Z';

        assume(parse(url).path).equals('/Y/Z');
    });

    // it('removes default port numbers', () => {
    //     const url = 'http://example.com:80'
    //     const parsed = parse(url);

    //     assume(parsed.port).equals('');
    //     assume(parsed.host).equals('example.com');
    //     assume(parsed.hostname).equals('example.com');
    //     assume(parsed.href).equals('http://example.com');
    // });

    it('understands an / as path', () => {
        const url = 'http://example.com:80/'
        const parsed = parse(url);

        // assume(parsed.port).equals('');
        assume(parsed.username).equals(undefined);
        assume(parsed.password).equals(undefined);
        assume(parsed.path).equals('/');
        assume(parsed.host).equals('example.com:80');
        assume(parsed.hostname).equals('example.com');
        assume(parsed.href).equals('http://example.com:80/');
    });

    it('does not care about spaces', () => {
        const url = 'http://x.com/path?that\'s#all, folks'
        const parsed = parse(url);

        assume(parsed.port).equals(undefined);
        assume(parsed.username).equals(undefined);
        assume(parsed.password).equals(undefined);
        assume(parsed.path).equals('/path');
        assume(parsed.fragment).equal('#all, folks');
        assume(parsed.query).equal('?that\'s');
        assume(parsed.host).equals('x.com');
        assume(parsed.hostname).equals('x.com');
    });

    it('accepts + in the url', () => {
        const url = 'http://x.y.com+a/b/c'
        const parsed = parse(url);

        assume(parsed.scheme).equals('http:');
        assume(parsed.host).equals('x.y.com+a');
        assume(parsed.hostname).equals('x.y.com+a');
        assume(parsed.path).equals('/b/c');
    });

    // it('ignores \\ in paths', () => {
    //     const url = 'http://google.com:80\\@yahoo.com/#what\\is going on'
    //     let parsed = parse(url);

    //     assume(parsed.port).equals(undefined);
    //     assume(parsed.username).equals(undefined);
    //     assume(parsed.password).equals(undefined);
    //     assume(parsed.hostname).equals('google.com');
    //     assume(parsed.fragment).equals('#what\\is going on');

    //     parsed = parse('//\\what-is-up.com');
    //     assume(parsed.path).equals('/what-is-up.com');
    // });

    it('correctly ignores multiple slashes //', () => {
        const url = '////what-is-up.com'
        const parsed = parse(url);

        assume(parsed.host).equals(undefined);
        assume(parsed.hostname).equals(undefined);
    });

    describe('origin', () => {
        it('generates an origin property', () => {
            const url = 'http://google.com:80/path'
            const parsed = parse(url);

            assume(parsed.origin).equals('http://google.com');
        });

        it('is lowercased', () => {
            const url = 'HTTP://gOogle.cOm:80/path'
            const parsed = parse(url);

            assume(parsed.origin).equals('http://google.com');
        });

        it('sets null if no hostname is specified', () => {
            const url = 'http://'
            const parsed = parse(url, new Url());

            assume(parsed.origin).equals('null');
        });

        it('removes default ports for http', () => {
            let o = parse('http://google.com:80/path');
            assume(o.origin).equals('http://google.com');

            o = parse('http://google.com:80');
            assume(o.origin).equals('http://google.com');

            o = parse('http://google.com');
            assume(o.origin).equals('http://google.com');

            o = parse('https://google.com:443/path');
            assume(o.origin).equals('https://google.com');

            o = parse('http://google.com:443/path');
            assume(o.origin).equals('http://google.com:443');

            o = parse('https://google.com:80/path');
            assume(o.origin).equals('https://google.com:80');
        });

        it('handles file:// based urls as null', () => {
            const o = parse('file://google.com/path');
            assume(o.origin).equals('null');
        });

        it('removes default ports for ws', () => {
            let o = parse('ws://google.com:80/path');
            assume(o.origin).equals('ws://google.com');

            o = parse('wss://google.com:443/path');
            assume(o.origin).equals('wss://google.com');

            o = parse('ws://google.com:443/path');
            assume(o.origin).equals('ws://google.com:443');

            o = parse('wss://google.com:80/path');
            assume(o.origin).equals('wss://google.com:80');
        });

        it('maintains the port number for non-default port numbers', () => {
            const parsed = parse('http://google.com:8080/path');

            assume(parsed.host).equals('google.com:8080');
            assume(parsed.href).equals('http://google.com:8080/path');
        });
    });

    describe('scheme', () => {
        it('extracts the right scheme from a url', () => {
            const testData = [
                {
                    href: 'http://example.com',
                    scheme: 'http:',
                    path: ''
                },
                {
                    href: 'mailto:test@example.com',
                    path: 'test@example.com',
                    scheme: 'mailto:'
                },
                {
                    href: 'data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E',
                    path: 'text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E',
                    scheme: 'data:'
                },
                {
                    href: 'sip:alice@atlanta.com',
                    path: 'alice@atlanta.com',
                    scheme: 'sip:'
                }
            ];

            let data;
            for (let i = 0, len = testData.length; i < len; ++i) {
                data = parse(testData[i].href);
                assume(data.scheme).equals(testData[i].scheme);
                assume(data.path).equals(testData[i].path);
            }
        });

        it('converts scheme to lowercase', () => {
            const url = 'HTTP://example.com';

            assume(parse(url).scheme).equals('http:');
        });

        // it('correctly adds ":" to scheme in final url string', () => {
        //     const data = parse('google.com/foo', {});
        //     data.set('scheme', 'https');
        //     assume(data.href).equals('https://google.com/foo');

        //     data = parse('https://google.com/foo');
        //     data.scheme = 'http';
        //     assume(data.toString()).equals('http://google.com/foo');

        //     data = parse('http://google.com/foo');
        //     data.set('scheme', 'https:');
        //     assume(data.href).equals('https://google.com/foo');
        // });
    });

    describe('ip', () => {
        it('parses ipv6', () => {
            const url = 'http://[1080:0:0:0:8:800:200C:417A]:61616/foo/bar?q=z'
            const parsed = parse(url);

            assume(parsed.port).equals('61616');
            assume(parsed.query).equals('?q=z');
            assume(parsed.scheme).equals('http:');
            assume(parsed.hostname).equals('[1080:0:0:0:8:800:200c:417a]');
            assume(parsed.path).equals('/foo/bar');
            assume(parsed.href).equals('http://[1080:0:0:0:8:800:200c:417a]:61616/foo/bar?q=z');
        });

        it('parses ipv6 with auth', () => {
            const url = 'http://user:password@[3ffe:2a00:100:7031::1]:8080'
            const parsed = parse(url);

            assume(parsed.username).equals('user');
            assume(parsed.password).equals('password');
            assume(parsed.host).equals('[3ffe:2a00:100:7031::1]:8080');
            assume(parsed.hostname).equals('[3ffe:2a00:100:7031::1]');
            assume(parsed.href).equals(url);
        });

        it('parses ipv4', () => {
            const url = 'http://222.148.142.13:61616/foo/bar?q=z'
            const parsed = parse(url);

            assume(parsed.port).equals('61616');
            assume(parsed.query).equals('?q=z');
            assume(parsed.scheme).equals('http:');
            assume(parsed.hostname).equals('222.148.142.13');
            assume(parsed.path).equals('/foo/bar');
            assume(parsed.href).equals(url);
        });
    });

    describe('auth', () => {
        it('does not lowercase the USER:PASS', () => {
            const url = 'HTTP://USER:PASS@EXAMPLE.COM'
            const parsed = parse(url);

            assume(parsed.username).equals('USER');
            assume(parsed.password).equals('PASS');
            assume(parsed.scheme).equals('http:');
            assume(parsed.host).equals('example.com');
            assume(parsed.hostname).equals('example.com');
        });

        it('accepts @ in paths', () => {
            const url = 'http://mt0.google.com/vt/lyrs=m@114&hl=en&src=api&x=2&y=2&z=3&s='
            const parsed = parse(url);

            assume(parsed.path).equals('/vt/lyrs=m@114&hl=en&src=api&x=2&y=2&z=3&s=');
            assume(parsed.username).equals(undefined);
            assume(parsed.password).equals(undefined);
        });

        it('does not require passwords for auth', () => {
            const url = 'http://user@www.example.com/'
            const parsed = parse(url);

            assume(parsed.password).equals(undefined);
            assume(parsed.path).equals('/');
            assume(parsed.username).equals('user');
            assume(parsed.scheme).equals('http:');
            assume(parsed.hostname).equals('www.example.com');
            assume(parsed.href).equals(url);
        });
    });

    it('accepts multiple ???', () => {
        const url = 'http://mt0.google.com/vt/lyrs=m@114???&hl=en&src=api&x=2&y=2&z=3&s=';
        assume(parse(url).query).equals('???&hl=en&src=api&x=2&y=2&z=3&s=');
    });

    it('accepts a string as source argument', () => {
        const data = parse('/foo', 'http://sub.example.com/bar?foo=bar#fragment');

        assume(data.port).equals(undefined);
        assume(data.host).equals('sub.example.com');
        assume(data.href).equals('http://sub.example.com/foo');
    });

    describe('inheritance', () => {
        it('does not inherit port numbers for non relative urls', () => {
            const data = parse('http://localhost', parse('http://sub.example.com:808/'));

            assume(data.port).equals(undefined);
            assume(data.host).equals('localhost');
            assume(data.href).equals('http://localhost');
        });

        it('inherits port numbers for relative urls', () => {
            const data = parse('/foo', parse('http://sub.example.com:808/'));

            assume(data.port).equals('808');
            assume(data.hostname).equals('sub.example.com');
            assume(data.host).equals('sub.example.com:808');
            assume(data.href).equals('http://sub.example.com:808/foo');
        });

        // it('inherits slashes for relative urls', () => {
        //     const data = parse('/foo', {
        //         fragment: '',
        //         host: 'example.com',
        //         hostname: 'example.com',
        //         href: 'http://example.com/',
        //         origin: 'http://example.com',
        //         password: '',
        //         path: '/',
        //         port: '',
        //         scheme: 'http:',
        //         search: ''
        //     });

        //     assume(data.slashes).equals(true);
        //     assume(data.href).equals('http://example.com/foo');

        //     data = parse('/foo', {
        //         auth: null,
        //         fragment: null,
        //         host: 'example.com',
        //         hostname: 'example.com',
        //         href: 'http://example.com/',
        //         path: '/',
        //         port: null,
        //         scheme: 'http:',
        //         query: null,
        //         search: null,
        //         slashes: true
        //     });

        //     assume(data.slashes).equals(true);
        //     assume(data.href).equals('http://example.com/foo');
        // });

        it('inherits scheme for relative schemes', () => {
            const data = parse('//foo.com/foo', parse('http://sub.example.com:808/'));

            assume(data.port).equals(undefined);
            assume(data.host).equals('foo.com');
            assume(data.scheme).equals('http:');
            assume(data.href).equals('http://foo.com/foo');
        });

        it('does not inherit path for non relative urls', () => {
            const data = parse('http://localhost', parse('http://foo:bar@sub.example.com/bar?foo=bar#fragment'));

            assume(data.port).equals(undefined);
            assume(data.host).equals('localhost');
            assume(data.href).equals('http://localhost');
        });

        it('resolves path for relative urls', () => {
            let data;
            let i = 0;
            const tests = [
                ['', 'http://foo.com', ''],
                ['', 'http://foo.com/', '/'],
                ['', 'http://foo.com/a', '/a'],
                ['a', 'http://foo.com', '/a'],
                ['a/', 'http://foo.com', '/a/'],
                ['b/c', 'http://foo.com/a', '/b/c'],
                ['b/c', 'http://foo.com/a/', '/a/b/c'],
                ['.', 'http://foo.com', '/'],
                ['./', 'http://foo.com', '/'],
                ['./.', 'http://foo.com', '/'],
                ['.', 'http://foo.com/a', '/'],
                ['.', 'http://foo.com/a/', '/a/'],
                ['./', 'http://foo.com/a/', '/a/'],
                ['./.', 'http://foo.com/a/', '/a/'],
                ['./b', 'http://foo.com/a/', '/a/b'],
                ['..', 'http://foo.com', '/'],
                ['../', 'http://foo.com', '/'],
                ['../..', 'http://foo.com', '/'],
                ['..', 'http://foo.com/a/b', '/'],
                ['..', 'http://foo.com/a/b/', '/a/'],
                ['../..', 'http://foo.com/a/b', '/'],
                ['../..', 'http://foo.com/a/b/', '/'],
                ['../../../../c', 'http://foo.com/a/b/', '/c'],
                ['./../d', 'http://foo.com/a/b/c', '/a/d'],
                ['d/e/f/./../../g', 'http://foo.com/a/b/c', '/a/b/d/g']
            ];

            for (; i < tests.length; i++) {
                data = parse(tests[i][0], tests[i][1]);
                assume(data.path).equals(tests[i][2]);
            }
        });

        it('does not inherit fragmentes and query strings from source object', () => {
            const data = parse('/foo', parse('http://sub.example.com/bar?foo=bar#fragment'));

            assume(data.port).equals(undefined);
            assume(data.host).equals('sub.example.com');
            assume(data.href).equals('http://sub.example.com/foo');
        });

        it('does not inherit auth from source object', () => {
            const base = parse('http://foo:bar@sub.example.com')
            const data = parse('/foo', base);

            assume(data.port).equals(undefined);
            assume(data.username).equals(undefined);
            assume(data.password).equals(undefined);
            assume(data.host).equals('sub.example.com');
            assume(data.href).equals('http://sub.example.com/foo');
        });
    });

    // describe('#set', () => {
    //     it('correctly updates the host when setting port', () => {
    //         const data = parse('http://google.com/foo');

    //         assume(data.set('port', 8080)).equals(data);

    //         assume(data.host).equals('google.com:8080');
    //         assume(data.href).equals('http://google.com:8080/foo');
    //     });

    //     it('correctly updates the host when setting port (IPv6)', () => {
    //         const data = parse('http://[7886:3423::1233]/foo');

    //         assume(data.set('port', 8080)).equals(data);

    //         assume(data.host).equals('[7886:3423::1233]:8080');
    //         assume(data.href).equals('http://[7886:3423::1233]:8080/foo');
    //     });

    //     it('removes querystring and fragment', () => {
    //         const data = parse('https://thisanurl.com/?swag=yolo#representing');

    //         data.set('query', '');
    //         data.set('fragment', '');

    //         assume(data.href).equals('https://thisanurl.com/');
    //     });

    //     it('only sets port when its not default', () => {
    //         const data = parse('http://google.com/foo');

    //         assume(data.set('port', 80)).equals(data);

    //         assume(data.host).equals('google.com');
    //         assume(data.href).equals('http://google.com/foo');

    //         assume(data.set('port', 443)).equals(data);
    //         assume(data.host).equals('google.com:443');
    //         assume(data.href).equals('http://google.com:443/foo');
    //     });

    //     it('only sets port when its not default (IPv6)', () => {
    //         const data = parse('http://[7886:3423::1233]/foo');

    //         assume(data.set('port', 80)).equals(data);

    //         assume(data.host).equals('[7886:3423::1233]');
    //         assume(data.href).equals('http://[7886:3423::1233]/foo');

    //         assume(data.set('port', 443)).equals(data);
    //         assume(data.host).equals('[7886:3423::1233]:443');
    //         assume(data.href).equals('http://[7886:3423::1233]:443/foo');
    //     });

    //     it('prepends / to path', () => {
    //         const url = parse();

    //         url
    //             .set('scheme', 'http')
    //             .set('host', 'example.com:80')
    //             .set('path', 'will/get/slash/prepended');

    //         assume(url.path).equals('/will/get/slash/prepended');
    //         assume(url.href).equals('http://example.com:80/will/get/slash/prepended');

    //         url.set('path', '');

    //         assume(url.path).equals(undefined);
    //         assume(url.href).equals('http://example.com:80');

    //         url.set('path', '/has/slash');

    //         assume(url.path).equals('/has/slash');
    //         assume(url.href).equals('http://example.com:80/has/slash');
    //     });

    //     // it('updates query with object', () => {
    //     //     const data = parse('http://google.com/?foo=bar');

    //     //     assume(data.set('query', { bar: 'foo' })).equals(data);

    //     //     assume(data.query.foo).equals(undefined);
    //     //     assume(data.query.bar).equals('foo');

    //     //     assume(data.href).equals('http://google.com/?bar=foo');
    //     // });

    //     // it('updates query with a string', () => {
    //     //     const data = parse('http://google.com/?foo=bar');

    //     //     assume(data.set('query', 'bar=foo')).equals(data);

    //     //     assume(data.query.foo).equals(undefined);
    //     //     assume(data.query.bar).equals('foo');

    //     //     assume(data.href).equals('http://google.com/?bar=foo');

    //     //     assume(data.set('query', '?baz=foo')).equals(data);

    //     //     assume(data.query.bar).equals(undefined);
    //     //     assume(data.query.baz).equals('foo');

    //     //     assume(data.href).equals('http://google.com/?baz=foo');
    //     // });

    //     // it('allows custom parser when updating query', () => {
    //     //     const data = parse('http://google.com/?foo=bar');

    //     //     assume(data.set('query', 'bar=foo', () => { return '1337'; })).equals(data);

    //     //     assume(data.query).equals('1337');

    //     //     assume(data.href).equals('http://google.com/?1337');
    //     // });

    //     // it('throws error when updating query, if custom parser is not a function', () => {
    //     //     const data = parse('http://google.com/?foo=bar');

    //     //     assume(() => {
    //     //         data.set('query', 'bar=foo', '1337');
    //     //     }).throws(Error);

    //     //     //
    //     //     // `data` is unchanged.
    //     //     //
    //     //     assume(data.href).equals('http://google.com/?foo=bar');
    //     // });

    //     it('prepends # to fragment', () => {
    //         const data = parse('http://example.com');

    //         data.set('fragment', 'usage');

    //         assume(data.fragment).equals('#usage');
    //         assume(data.href).equals('http://example.com#usage');

    //         data.set('fragment', '#license');

    //         assume(data.fragment).equals('#license');
    //         assume(data.href).equals('http://example.com#license');
    //     });

    //     it('updates the port when updating host', () => {
    //         const data = parse('http://google.com/?foo=bar');

    //         assume(data.set('host', 'yahoo.com:808')).equals(data);

    //         assume(data.hostname).equals('yahoo.com');
    //         assume(data.host).equals('yahoo.com:808');
    //         assume(data.port).equals('808');

    //         assume(data.href).equals('http://yahoo.com:808/?foo=bar');
    //     });

    //     it('updates the port when updating host (IPv6)', () => {
    //         const data = parse('http://google.com/?foo=bar');

    //         assume(data.set('host', '[56h7::1]:808')).equals(data);

    //         assume(data.hostname).equals('[56h7::1]');
    //         assume(data.host).equals('[56h7::1]:808');
    //         assume(data.port).equals('808');

    //         assume(data.href).equals('http://[56h7::1]:808/?foo=bar');
    //     });

    //     it('unsets the port when port is missing (IPv6)', () => {
    //         const data = parse('http://google.com/?foo=bar');

    //         assume(data.set('host', '[56h7::1]')).equals(data);

    //         assume(data.hostname).equals('[56h7::1]');
    //         assume(data.host).equals('[56h7::1]');
    //         assume(data.port).equals(undefined);

    //         assume(data.href).equals('http://[56h7::1]/?foo=bar');
    //     });

    //     it('unsets the port when the port is missing from host', () => {
    //         const data = parse('http://google.com:8000/?foo=bar');

    //         assume(data.set('host', 'yahoo.com')).equals(data);

    //         assume(data.hostname).equals('yahoo.com');
    //         assume(data.host).equals('yahoo.com');
    //         assume(data.port).equals(undefined);

    //         assume(data.href).equals('http://yahoo.com/?foo=bar');
    //     });

    //     it('updates the host when updating hostname', () => {
    //         const data = parse('http://google.com:808/?foo=bar');

    //         assume(data.set('hostname', 'yahoo.com')).equals(data);

    //         assume(data.hostname).equals('yahoo.com');
    //         assume(data.host).equals('yahoo.com:808');
    //         assume(data.port).equals('808');

    //         assume(data.href).equals('http://yahoo.com:808/?foo=bar');
    //     });

    //     it('updates slashes when updating scheme', () => {
    //         const data = parse('sip:alice@atlanta.com');

    //         assume(data.set('scheme', 'https')).equals(data);

    //         assume(data.href).equals('https://alice@atlanta.com');

    //         assume(data.set('scheme', 'mailto', true)).equals(data);

    //         assume(data.href).equals('mailto:alice@atlanta.com');
    //     });

    //     it('updates other values', () => {
    //         const data = parse('http://google.com/?foo=bar');

    //         assume(data.set('scheme', 'https:')).equals(data);
    //         assume(data.scheme).equals('https:');
    //         assume(data.href).equals('https://google.com/?foo=bar');

    //         data.set('username', 'foo');

    //         assume(data.username).equals('foo');
    //         assume(data.href).equals('https://foo@google.com/?foo=bar');
    //     });

    //     it('lowercases the required values', () => {
    //         const data = parse('http://google.com/?foo=bar');

    //         data.set('scheme', 'HTTPS:');
    //         assume(data.scheme).equals('https:');
    //         assume(data.href).equals('https://google.com/?foo=bar');

    //         data.set('host', 'GOOGLE.LOL');
    //         assume(data.host).equals('google.lol');
    //         assume(data.href).equals('https://google.lol/?foo=bar');

    //         data.set('hostname', 'YAhOo.COm');
    //         assume(data.hostname).equals('yahoo.com');
    //         assume(data.href).equals('https://yahoo.com/?foo=bar');
    //     });

    //     it('correctly updates the origin when host/scheme/port changes', () => {
    //         const data = parse('http://google.com/?foo=bar');

    //         data.set('scheme', 'HTTPS:');
    //         assume(data.scheme).equals('https:');
    //         assume(data.origin).equals('https://google.com');

    //         data.set('port', '1337');
    //         assume(data.port).equals('1337');
    //         assume(data.origin).equals('https://google.com:1337');

    //         data.set('scheme', 'file:');
    //         assume(data.scheme).equals('file:');
    //         assume(data.origin).equals('null');
    //     });
    // });

    describe('fuzzy', () => {
        const fuzz = require('./fuzzy')
        const times = 10;

        for (let i = 0; i < times; i++) {
            ((spec) => {
                it('parses: ' + spec.href, () => {
                    const url = parse(spec.href)
                    let prop;

                    for (prop in spec) {
                        if (spec.hasOwnProperty(prop)) {
                            // @ts-ignore
                            const urlProp = url[prop];

                            assume(urlProp).equals(spec[prop]);
                        }
                    }
                });
            })(fuzz());
        }
    });
});
// @ts-format=false
