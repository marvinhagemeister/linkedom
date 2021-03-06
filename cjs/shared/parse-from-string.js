'use strict';
const HTMLParser2 = require('htmlparser2');

const {SVG_NAMESPACE} = require('./constants.js');
const {CUSTOM_ELEMENTS} = require('./symbols.js');
const {Mime} = require('./mime.js');
const {keys} = require('./object.js');

const {Parser} = HTMLParser2;

const VOID_SOURCE = Mime['text/html'].voidElements.source.slice(4, -2);
const VOID_ELEMENTS = new RegExp(`<(${VOID_SOURCE})([^>]*?)>`, 'gi');
const VOID_SANITIZER = (_, $1, $2) => `<${$1}${$2}${/\/$/.test($2) ? '' : ' /'}>`;
const voidSanitizer = html => html.replace(VOID_ELEMENTS, VOID_SANITIZER);

let notParsing = true;

const isNotParsing = () => notParsing;
exports.isNotParsing = isNotParsing;

const parseFromString = (document, isHTML, markupLanguage) => {
  const {active, registry} = document[CUSTOM_ELEMENTS];

  let node = document;
  let ownerSVGElement = null;

  notParsing = false;

  const content = new Parser({
    // <!DOCTYPE ...>
    onprocessinginstruction(name, data) {
      if (name.toLowerCase() === '!doctype')
        document.doctype = data.slice(name.length).trim();
    },

    // <tagName>
    onopentag(name, attributes) {
      let create = true;
      if (isHTML) {
        if (ownerSVGElement) {
          node = node.appendChild(document.createElementNS(SVG_NAMESPACE, name));
          node.ownerSVGElement = ownerSVGElement;
          create = false;
        }
        else if (name === 'svg' || name === 'SVG') {
          ownerSVGElement = document.createElementNS(SVG_NAMESPACE, name);
          node = node.appendChild(ownerSVGElement);
          create = false;
        }
        else if (active) {
          const ce = name.includes('-') ? name : (attributes.is || '');
          if (ce && registry.has(ce)) {
            const {Class} = registry.get(ce);
            node = node.appendChild(new Class);
            create = false;
            delete attributes.is;
          }
        }
      }

      if (create)
        node = node.appendChild(document.createElement(name));

      for (const name of keys(attributes))
        node.setAttribute(name, attributes[name]);
    },

    // #text, #comment
    oncomment(data) { node.appendChild(document.createComment(data)); },
    ontext(text) { node.appendChild(document.createTextNode(text)); },

    // </tagName>
    onclosetag() {
      if (isHTML && node === ownerSVGElement)
        ownerSVGElement = null;
      node = node.parentNode;
    }
  }, {
    decodeEntities: true,
    xmlMode: true
  });

  content.write(isHTML ? voidSanitizer(markupLanguage) : markupLanguage);
  content.end();

  notParsing = true;

  return document;
};
exports.parseFromString = parseFromString;
