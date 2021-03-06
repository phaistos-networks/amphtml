/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as dom from '../../src/dom';
import * as sinon from 'sinon';


describe('DOM', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    dom.setScopeSelectorSupportedForTesting(undefined);
    sandbox.restore();
  });

  it('should remove all children', () => {
    const element = document.createElement('div');
    element.appendChild(document.createElement('div'));
    element.appendChild(document.createTextNode('ABC'));
    expect(element.children.length).to.equal(1);
    expect(element.firstChild).to.not.equal(null);
    expect(element.textContent).to.equal('ABC');

    dom.removeChildren(element);
    expect(element.children.length).to.equal(0);
    expect(element.firstChild).to.equal(null);
    expect(element.textContent).to.equal('');
  });

  it('should copy all children', () => {
    const element = document.createElement('div');
    element.appendChild(document.createElement('div'));
    element.appendChild(document.createTextNode('ABC'));

    const other = document.createElement('div');
    dom.copyChildren(element, other);

    expect(element.children.length).to.equal(1);
    expect(element.firstChild).to.not.equal(null);
    expect(element.textContent).to.equal('ABC');

    expect(other.children.length).to.equal(1);
    expect(other.firstChild).to.not.equal(null);
    expect(other.firstChild.tagName).to.equal('DIV');
    expect(other.textContent).to.equal('ABC');
  });

  it('closest should find itself', () => {
    const element = document.createElement('div');

    const child = document.createElement('div');
    element.appendChild(child);

    expect(dom.closest(child, () => true)).to.equal(child);
    expect(dom.closestByTag(child, 'div')).to.equal(child);
    expect(dom.closestByTag(child, 'DIV')).to.equal(child);
  });

  it('closest should find first match', () => {
    const parent = document.createElement('parent');

    const element = document.createElement('element');
    parent.appendChild(element);

    const child = document.createElement('child');
    element.appendChild(child);

    expect(dom.closest(child, e => e.tagName == 'CHILD')).to.equal(child);
    expect(dom.closestByTag(child, 'child')).to.equal(child);

    expect(dom.closest(child, e => e.tagName == 'ELEMENT')).to.equal(element);
    expect(dom.closestByTag(child, 'element')).to.equal(element);

    expect(dom.closest(child, e => e.tagName == 'PARENT')).to.equal(parent);
    expect(dom.closestByTag(child, 'parent')).to.equal(parent);
  });

  it('closest should find first match', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element');
    parent.appendChild(element1);

    const element2 = document.createElement('element');
    parent.appendChild(element2);

    expect(dom.elementByTag(parent, 'element')).to.equal(element1);
    expect(dom.elementByTag(parent, 'ELEMENT')).to.equal(element1);
  });


  it('childElement should find first match', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    parent.appendChild(element2);

    expect(dom.childElement(parent, () => true)).to.equal(element1);
    expect(dom.childElement(parent, e => e.tagName == 'ELEMENT1'))
        .to.equal(element1);
    expect(dom.childElement(parent, e => e.tagName == 'ELEMENT2'))
        .to.equal(element2);
    expect(dom.childElement(parent, e => e.tagName == 'ELEMENT3'))
        .to.be.null;
  });

  function testChildElementByTag() {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    parent.appendChild(element2);

    const element3 = document.createElement('element3');
    element1.appendChild(element3);

    expect(dom.childElementByTag(parent, 'element1')).to.equal(element1);
    expect(dom.childElementByTag(parent, 'element2')).to.equal(element2);
    expect(dom.childElementByTag(parent, 'element3')).to.be.null;
    expect(dom.childElementByTag(parent, 'element4')).to.be.null;
  }

  it('childElementByTag should find first match', testChildElementByTag);

  it('childElementByTag should find first match (polyfill)', () => {
    dom.setScopeSelectorSupportedForTesting(false);
    testChildElementByTag();
  });

  function testChildElementByAttr() {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    element1.setAttribute('attr1', '1');
    element1.setAttribute('attr12', '1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    element2.setAttribute('attr2', '2');
    element2.setAttribute('attr12', '2');
    parent.appendChild(element2);

    const element3 = document.createElement('element2');
    element3.setAttribute('on-child', '');
    element2.appendChild(element3);

    expect(dom.childElementByAttr(parent, 'attr1')).to.equal(element1);
    expect(dom.childElementByAttr(parent, 'attr2')).to.equal(element2);
    expect(dom.childElementByAttr(parent, 'attr12')).to.equal(element1);
    expect(dom.childElementByAttr(parent, 'attr3')).to.be.null;
    expect(dom.childElementByAttr(parent, 'on-child')).to.be.null;
  }

  it('childElementByAttr should find first match', testChildElementByAttr);

  it('childElementByAttr should find first match', () => {
    dom.setScopeSelectorSupportedForTesting(false);
    testChildElementByAttr();
  });

  describe('contains', () => {
    let connectedElement;
    let connectedChild;
    let disconnectedElement;
    let disconnectedChild;

    beforeEach(() => {
      connectedElement = document.createElement('div');
      connectedChild = document.createElement('div');
      disconnectedElement = document.createElement('div');
      disconnectedChild = document.createElement('div');

      connectedElement.appendChild(connectedChild);
      disconnectedElement.appendChild(disconnectedChild);
      document.body.appendChild(connectedElement);
    });

    afterEach(() => {
      dom.removeElement(connectedElement);
    });

    it('should use document.contains or fallback as available', () => {
      expect(dom.documentContains(document, connectedElement)).to.be.true;
      expect(dom.documentContains(document, connectedChild)).to.be.true;
      expect(dom.documentContains(document, disconnectedElement)).to.be.false;
      expect(dom.documentContains(document, disconnectedChild)).to.be.false;
    });

    it('should polyfill document.contains', () => {
      expect(dom.documentContainsPolyfillInternal_(
          document, connectedElement)).to.be.true;
      expect(dom.documentContainsPolyfillInternal_(
          document, connectedChild)).to.be.true;
      expect(dom.documentContainsPolyfillInternal_(
          document, disconnectedElement)).to.be.false;
      expect(dom.documentContainsPolyfillInternal_(
          document, disconnectedChild)).to.be.false;
    });

    it('should be inclusionary for documentElement', () => {
      expect(dom.documentContains(
          document, document.documentElement)).to.be.true;
      expect(dom.documentContainsPolyfillInternal_(
          document, document.documentElement)).to.be.true;
    });

    it('should be inclusionary for document itself', () => {
      expect(dom.documentContains(
          document, document)).to.be.true;
      expect(dom.documentContainsPolyfillInternal_(
          document, document)).to.be.true;
    });
  });

  describe('waitFor', () => {
    let parent;
    let child;

    beforeEach(() => {
      parent = document.createElement('div');
      child = document.createElement('div');
    });

    function contains() {
      return parent.contains(child);
    }

    it('should immediately return if child is available', () => {
      parent.appendChild(child);
      const spy = sandbox.spy();
      dom.waitForChild(parent, contains, spy);
      expect(spy.callCount).to.equal(1);
    });

    it('should wait until child is available', () => {
      const spy = sandbox.spy();
      dom.waitForChild(parent, contains, spy);
      expect(spy.callCount).to.equal(0);

      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (spy.callCount > 0) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
        parent.appendChild(child);
      }).then(() => {
        expect(spy.callCount).to.equal(1);
      });
    });

    it('should prefer MutationObserver and disconnect when done', () => {
      let mutationCallback;
      const mutationObserver = {
        observe: sandbox.spy(),
        disconnect: sandbox.spy(),
      };
      const parent = {
        ownerDocument: {
          defaultView: {
            MutationObserver: callback => {
              mutationCallback = callback;
              return mutationObserver;
            },
          },
        },
      };
      let checkFuncValue = false;
      const checkFunc = () => checkFuncValue;
      const spy = sandbox.spy();

      dom.waitForChild(parent, checkFunc, spy);
      expect(spy.callCount).to.equal(0);
      expect(mutationObserver.observe.callCount).to.equal(1);
      expect(mutationObserver.observe.firstCall.args[0]).to.equal(parent);
      expect(mutationObserver.observe.firstCall.args[1])
          .to.deep.equal({childList: true});
      expect(mutationCallback).to.exist;

      // False callback.
      mutationCallback();
      expect(spy.callCount).to.equal(0);
      expect(mutationObserver.disconnect.callCount).to.equal(0);

      // True callback.
      checkFuncValue = true;
      mutationCallback();
      expect(spy.callCount).to.equal(1);
      expect(mutationObserver.disconnect.callCount).to.equal(1);
    });

    it('should fallback to polling without MutationObserver', () => {
      let intervalCallback;
      const win = {
        setInterval: callback => {
          intervalCallback = callback;
          return 123;
        },
        clearInterval: sandbox.spy(),
      };
      const parent = {
        ownerDocument: {
          defaultView: win,
        },
      };
      let checkFuncValue = false;
      const checkFunc = () => checkFuncValue;
      const spy = sandbox.spy();

      dom.waitForChild(parent, checkFunc, spy);
      expect(spy.callCount).to.equal(0);
      expect(intervalCallback).to.exist;

      // False callback.
      intervalCallback();
      expect(spy.callCount).to.equal(0);
      expect(win.clearInterval.callCount).to.equal(0);

      // True callback.
      checkFuncValue = true;
      intervalCallback();
      expect(spy.callCount).to.equal(1);
      expect(win.clearInterval.callCount).to.equal(1);
    });

    it('should wait for body', () => {
      return dom.waitForBodyPromise(document).then(() => {
        expect(document.body).to.exist;
      });
    });
  });
});
