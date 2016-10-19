
/**
 * Test dependencies.
 */

var parser = require('../../lib/');
var expect = require('expect.js');

/**
 * Shortcuts
 */
var encode = parser.encodePacket;
var decode = parser.decodePacket;
var encPayload = parser.encodePayload;
var decPayload = parser.decodePayload;
var encPayloadB = parser.encodePayloadAsBinary;
var decPayloadB = parser.decodePayloadAsBinary;

/**
 * Tests.
 */

describe('parser', function() {
  it('should encode a binary message', function(done) {
    var data = new Buffer(5);
    for (var i = 0; i < data.length; i++) { data[i] = i; }
    encode({ type: 'message', data: data }, function(encoded) {
      expect(decode(encoded)).to.eql({ type: 'message', data: data }); 
      done();
    });
  });

  it('should encode/decode mixed binary and string contents as b64', function(done) {
    var data = new Buffer(5);
    for (var i = 0; i < data.length; i++) data[i] = i;
    encPayload([{ type: 'message', data: data }, { type: 'message', data: 'hello' }], function(encoded) {
      decPayload(encoded,
        function(packet, index, total) {
          var isLast = index + 1 == total;
          expect(packet.type).to.eql('message');
          if (!isLast) {
            expect(packet.data).to.eql(data);
          } else {
            expect(packet.data).to.eql('hello');
            done();
          }
        });
    });
  });

  it('should encode binary contents as binary', function(done) {
    var firstBuffer = new Buffer(5);
      for (var i = 0; i < firstBuffer.length; i++) firstBuffer[i] = i;
      var secondBuffer = new Buffer(4);
      for (var i = 0; i < secondBuffer.length; i++) secondBuffer[i] = firstBuffer.length + i;

      encPayloadB([{ type: 'message', data: firstBuffer }, { type: 'message', data: secondBuffer }], function(data) {
        decPayloadB(data,
          function(packet, index, total) {
            var isLast = index + 1 == total;
            expect(packet.type).to.eql('message');
            if (!isLast) {
              expect(packet.data).to.eql(firstBuffer);
            } else {
              expect(packet.data).to.eql(secondBuffer);
              done();
            }
          });
      });
  });

  it('should encode mixed binary and string contents as binary', function(done) {
    var firstBuffer = new Buffer(123);
    for (var i = 0; i < firstBuffer.length; i++) firstBuffer[i] = i;

    encPayloadB([{ type: 'message', data: firstBuffer }, { type: 'message', data: 'hello' }, { type: 'close' } ], function(data) {
      decPayloadB(data,
        function(packet, index, total) {
          if (index == 0) {
            expect(packet.type).to.eql('message');
            expect(packet.data).to.eql(firstBuffer);
          } else if (index == 1) {
            expect(packet.type).to.eql('message');
            expect(packet.data).to.eql('hello');
          } else {
            expect(packet.type).to.eql('close');
            done();
          }
        });
    });
  });

  it('should encode/decode an ArrayBuffer as b64', function(done) {
    var buffer = new ArrayBuffer(4);
    var dataview = new DataView(buffer);
    for (var i = 0; i < buffer.byteLength ; i++) dataview.setInt8(i, i);

    encode({ type: 'message', data: buffer }, function(encoded) {
      var decoded = decode(encoded, 'arraybuffer');
      expect(decoded).to.eql({ type: 'message', data: buffer });
      expect(new Uint8Array(decoded.data)).to.eql(new Uint8Array(buffer));
      done();
    });
  });

  it('should encode/decode an ArrayBuffer as binary', function(done) {
    var buffer = new ArrayBuffer(4);
    var dataview = new DataView(buffer);
    for (var i = 0; i < buffer.byteLength ; i++) dataview.setInt8(i, i);

    encode({ type: 'message', data: buffer }, true, function(encoded) {
      var decoded = decode(encoded, 'arraybuffer');
      expect(decoded).to.eql({ type: 'message', data: buffer });
      expect(new Uint8Array(decoded.data)).to.eql(new Uint8Array(buffer));
      done();
    });
  });

  it('should decode an ArrayBuffer/Buffer with undeclared type as binary', function() {
    var buffer1 = new ArrayBuffer(4);
    var dataview = new DataView(buffer1);
    var buffer2 = new Buffer(4);
    for (var i = 0; i < buffer1.byteLength ; i++) {
      dataview.setInt8(i, 4-i);
      buffer2[i] = 4-i;
    }

    var decoded1 = decode(buffer1, null);
    var decoded2 = decode(buffer2, null);
    expect(decoded1).to.eql({ type: 'message', data: new Buffer([3,2,1])});
    expect(new Uint8Array(decoded1.data)).to.eql(new Uint8Array(buffer1.slice(1)));
    expect(decoded2).to.eql({ type: 'message', data: new Buffer(buffer2.slice(1))});
    expect(new Uint8Array(decoded2.data)).to.eql(new Uint8Array(buffer2.slice(1)));
  });

  it('should decode an ArrayBuffer/Buffer as binary of type ArrayBuffer', function() {
    var buffer1 = new ArrayBuffer(4);
    var dataview = new DataView(buffer1);
    var buffer2 = new Buffer(4);
    for (var i = 0; i < buffer1.byteLength ; i++) {
      dataview.setInt8(i, 4-i);
      buffer2[i] = 4-i;
    }

    var decoded1 = decode(buffer1, 'arraybuffer');
    var decoded2 = decode(buffer2, 'arraybuffer');
    expect(decoded1).to.eql({ type: 'message', data: buffer1.slice(1)});
    expect(new Uint8Array(decoded1.data)).to.eql(new Uint8Array(buffer1.slice(1)));
      
    var testBuffer = new ArrayBuffer(decoded2.data.byteLength);
    var decoded2view = new DataView(decoded2.data);
    var testBufferview = new DataView(testBuffer);
    for (var i = 0; i < decoded2view.byteLength ; i++) {
        testBufferview.setInt8(i, decoded2view.getInt8(i));
    }
    expect(decoded2).to.eql({ type: 'message', data:  testBuffer});
    expect(new Uint8Array(decoded2.data)).to.eql(new Uint8Array(buffer2.slice(1)));
  });

  it('should encode/decode a typed array as binary', function(done) {
    var buffer = new ArrayBuffer(32);
    var typedArray = new Int32Array(buffer, 4, 2);
    typedArray[0] = 1;
    typedArray[1] = 2;

    encode({ type: 'message', data: typedArray }, true, function(encoded) {
      var decoded = decode(encoded, 'arraybuffer');
      expect(decoded.type).to.eql('message');
      expect(areArraysEqual(new Int32Array(decoded.data), typedArray)).to.eql(true);
      done();
    });
  });

});

function areArraysEqual(x, y) {
  if (x.length != y.length) return false;
  for (var i = 0, l = x.length; i < l; i++) {
    if (x[i] !== y[i]) return false;
  }
  return true;
}
