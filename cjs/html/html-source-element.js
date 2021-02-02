'use strict';
const {stringAttribute, registerHTMLClass} = require('../utils.js');
const {HTMLElement} = require('./html-element.js');

const tagName = 'source';

/**
 * @implements globalThis.HTMLSourceElement
 */
class HTMLSourceElement extends HTMLElement {
  constructor(ownerDocument, localName = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get src() { return stringAttribute.get(this, 'src'); }
  set src(value) { stringAttribute.set(this, 'src', value); }

  get srcset() { return stringAttribute.get(this, 'srcset'); }
  set srcset(value) { stringAttribute.set(this, 'srcset', value); }

  get sizes() { return stringAttribute.get(this, 'sizes'); }
  set sizes(value) { stringAttribute.set(this, 'sizes', value); }

  get type() { return stringAttribute.get(this, 'type'); }
  set type(value) { stringAttribute.set(this, 'type', value); }
  /* c8 ignore stop */
}

registerHTMLClass(tagName, HTMLSourceElement);

exports.HTMLSourceElement = HTMLSourceElement;
