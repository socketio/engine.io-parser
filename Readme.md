
# Engine.IO Parser

[![Build Status](https://secure.travis-ci.org/LearnBoost/engine.io-parser.png)](http://travis-ci.org/LearnBoost/engine.io-parser)
[![NPM version](https://badge.fury.io/js/engine.io-parser.png)](http://badge.fury.io/js/engine.io-parser)

This is the JavaScript parser for the engine.io protocol encoding,
shared by both
[engine.io-client](https://github.com/LearnBoost/engine.io-client) and
[engine.io-server](https://github.com/LearnBoost/engine.io-server).

## How to use

### Standalone

The parser can encode/decode packets, payloads, and payloads as binary
with the following methods: `encodePacket`, `decodePacket`, `encodePayload`,
`decodePayload`, `encodePayloadAsBinary`, `decodePayloadAsBinar`.

The browser-side parser also includes `encodePayloadAsArrayBuffer` and `encodePayloadAsBlob`.

Example:

```js
var parser = require('engine.io-parser');

var data = new Buffer(5);
for (var i = 0; i < data.length; i++) { data[i] = i; }

parser.encodePacket({ type: 'message', data: data }, function(encoded) {
  var decodedData = parser.decodePacket(encoded); // { type: 'message', data: data }
});
```

### With browserify

Engine.IO Parser is a commonjs module, which means you can include it by using
`require` on the browser and package using [browserify](http://browserify.org/):

1. install the parser package

    ```shell
    npm install engine.io-client
    npm install engine.io-parser
    ```

1. write your app code

    ```js
    var socket = require('engine.io-client')('ws://localhost');
    var parser = require('engine.io-parser');

    var testBuffer = new Int8Array(10);
    for (var i = 0; i < testBuffer.length; i++) testBuffer[i] = i;

    var packets = [{ type: 'message', data: testBuffer.buffer }, { type: 'message', data: 'hello' }];

    socket.on('open', function(){
      parser.encodePayload(packets, function(encoded) {
        parser.decodePayload(encoded,
          function(packet, index, total) {
            var isLast = index + 1 == total;
            if (!isLast) {
              var buffer = new Int8Array(packet.data); // testBuffer
            } else {
              var message = packet.data; // 'hello'
            }
          });
      });

      socket.on('message', function(data){});
      socket.on('close', function(){});
    });
    ```

1. build your app bundle

    ```bash
    $ browserify app.js > bundle.js
    ```

1. include on your page

    ```html
    <script src="/path/to/bundle.js"></script>
    ```

## Features

- Runs on browser and node.js seamlessly
- Runs inside HTML5 WebWorker
- Can send and receive binary data
  - Receives as ArrayBuffer or Blob when in browser, and Buffer or ArrayBuffer
    in Node
  - With browsers that don't support ArrayBuffer, an object { base64: true,
    data: dataAsBase64String } is emitted on the `message` event.

## API

### Node

- `encodePacket`
    - Encodes a packet.
    - **Parameters**
      - `Object`: the packet to encode, has `type` and `data`
      - `Boolean`: optional, binary support
      - `Function`: callback, returns the encoded packet (`String`)
- `decodePacket`
    - Decodes a packet. Data also available as an ArrayBuffer if requested.
    - **Parameters**
      - `String` | `ArrayBuffer`: the packet to decode, has `type` and `data`
      - `String`: optional, the binary type

----

- `encodeBase64Packet`
    - Encodes a packet with binary data in a base64 string (`String`)
    - **Parameters**
      - `Object`: the packet to encode, has `type` and `data`
      - `Function`: callback, returns the base64 encoded message (`String`)
- `decodeBase64Packet`
    - Decodes a packet encoded in a base64 string.
    - **Parameters**
      - `String`: the base64 encoded message
      - `String`: optional, the binary type

----

- `encodePayload`
    - Encodes multiple messages (payload).
    - If any contents are binary, they will be encoded as base64 strings. Base64
      encoded strings are marked with a b before the length specifier
    - **Parameters**
      - `Array`: an array of packets
      - `Boolean`: optional, binary support
      - `Function`: callback, returns the encoded payload (`String`)
- `decodePayload`
    - Decodes data when a payload is maybe expected. Possible binary contents are
      decoded from their base64 representation.
    - **Parameters**
      - `String`: the payload
      - `String`: optional, the binary type
      - `Function`: callback, returns (`Object`: packet, `Number`:packet index, `Number`:packet total)

----

- `encodePayloadAsBinary`
    - Encodes multiple messages (payload) as binary.
    - **Parameters**
      - `Array`: an array of packets
      - `Function`: callback, returns the encoded payload (`Buffer`)
- `decodePayloadAsBinary`
    - Decodes data when a payload is maybe expected. Strings are decoded by
      interpreting each byte as a key code for entries marked to start with 0. See
      description of encodePayloadAsBinary.
    - **Parameters**
      - `Buffer`: the buffer
      - `String`: optional, the binary type
      - `Function`: callback, returns the decoded packet (`Object`)

### Browser

- `encodePayloadAsArrayBuffer`
    - Encodes multiple messages (payload) as binary.
    - **Parameters**
      - `Array`: an array of packets
      - `Function`: callback, returns the encoded payload (`ArrayBuffer`)
- `encodePayloadAsBlob`
    - Encodes multiple messages (payload) as blob.
    - **Parameters**
      - `Array`: an array of packets
      - `Function`: callback, returns the encoded payload (`Blob`)

## Tests

`engine.io-parser` is used to test
[engine](http://github.com/learnboost/engine.io). Running the `engine.io` and
`engine.io-client` test suite ensures the parser works and vice-versa.

Browser tests are run using [zuul](https://github.com/defunctzombie/zuul). You can
run the tests locally using the following command.

```
./node_modules/.bin/zuul --local 8080 -- test/index.js
```

Additionally, `engine.io-parser` has a standalone test suite you can run
with `make test` which will run node.js and browser tests. You must have zuul setup with
a saucelabs account.

## Support

The support channels for `engine.io-parser` are the same as `socket.io`:
  - irc.freenode.net **#socket.io**
  - [Google Groups](http://groups.google.com/group/socket_io)
  - [Website](http://socket.io)

## Development

To contribute patches, run tests or benchmarks, make sure to clone the
repository:

```bash
git clone git://github.com/LearnBoost/engine.io-parser.git
```

Then:

```bash
cd engine.io-parser
npm install
```

See the `Tests` section above for how to run tests before submitting any patches.

## License

MIT - Copyright (c) 2014 Automattic, Inc.
