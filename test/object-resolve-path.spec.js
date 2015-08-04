var expect = require('chai').expect;

var resolve = require('../object-resolve-path');

var testObj = {
  a: 'b',
  'hyph"en': 10,
  "hy[ph]en": 11,
  b: {
    c: [1, 2, 3],
    d: ['h', 'ch'],
    e: [{}, {f: 'g'}],
    f: 'i'
  }
};

var testArr = [1,2,3];

describe('object-resolve-path', function() {
  it('should return a property with dot notation', function() {
    expect(resolve(testObj, 'b.f')).to.equal('i');
  });
  it('should return a property with a bracket notation', function() {
    expect(resolve(testArr, '[1]')).to.equal(2);
    expect(resolve(testObj, "['hyph\"en']")).to.equal(10);
  });
  it('should return a property with a mixed notation', function() {
    expect(resolve(testObj, 'b.c[0]')).to.equal(1);
  });
  it('should return a whole object when passed empty string', function() {
    expect(resolve(testObj, '')).to.equal(testObj);
  });

  it('should return undefined when path does not exist', function() {
    expect(resolve(testObj, 'x')).to.equal(undefined);
  });

  it('should be able to get a path when it contains brackets inside', function(){
    expect(resolve(testObj, "['hy[ph]en']")).to.equal(11);
  });

  it('should throw when path is not a string', function() {
    expect(function() {
      resolve(testObj, null);
    }).to.throw();

    expect(function() {
      resolve(undefined, 'x');
    }).to.throw();
  });

  it('should throw when string is invalid path', function(){
    expect(function() {
      resolve(testObj, '.');
    }).to.throw();
  });
});