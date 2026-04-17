import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LANGUAGES, translateLegacyString } from './translations';

const translateTextNode = (node, language) => {
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  if (!node.nodeValue || !node.nodeValue.trim()) return;

  const parentTag = node.parentElement?.tagName;
  if (['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parentTag)) return;

  if (!node.__oxOriginalText) {
    node.__oxOriginalText = node.nodeValue;
  }

  const nextValue =
    language === LANGUAGES.RU
      ? node.__oxOriginalText
      : translateLegacyString(language, node.__oxOriginalText);

  if (nextValue !== node.nodeValue) {
    node.nodeValue = nextValue;
  }
};

const translateElementAttributes = (element, language) => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

  if (!element.__oxOriginalAttrs) {
    element.__oxOriginalAttrs = {};
  }

  ['placeholder', 'title', 'aria-label'].forEach(attr => {
    const current = element.getAttribute(attr);
    if (!current) return;

    if (!(attr in element.__oxOriginalAttrs)) {
      element.__oxOriginalAttrs[attr] = current;
    }

    const next =
      language === LANGUAGES.RU
        ? element.__oxOriginalAttrs[attr]
        : translateLegacyString(language, element.__oxOriginalAttrs[attr]);

    if (next !== current) {
      element.setAttribute(attr, next);
    }
  });

  if (
    element instanceof HTMLInputElement &&
    ['button', 'submit', 'reset'].includes(element.type)
  ) {
    if (!('value' in element.__oxOriginalAttrs)) {
      element.__oxOriginalAttrs.value = element.value;
    }

    const next =
      language === LANGUAGES.RU
        ? element.__oxOriginalAttrs.value
        : translateLegacyString(language, element.__oxOriginalAttrs.value);

    if (next !== element.value) {
      element.value = next;
    }
  }
};

const walkAndTranslate = (root, language) => {
  if (!root) return;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );

  let current = walker.currentNode;
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      translateTextNode(current, language);
    } else {
      translateElementAttributes(current, language);
    }
    current = walker.nextNode();
  }
};

const LocalizationProvider = ({ children }) => {
  const language = useSelector(state => state.settings.language || LANGUAGES.RU);

  useEffect(() => {
    document.documentElement.lang = language;
    walkAndTranslate(document.body, language);

    if (window?.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.invoke('set-language', language).catch(() => {});
      } catch {
        // no-op outside Electron
      }
    }

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'characterData') {
          translateTextNode(mutation.target, language);
          return;
        }

        if (mutation.type === 'attributes') {
          translateElementAttributes(mutation.target, language);
          return;
        }

        mutation.addedNodes.forEach(node => {
          walkAndTranslate(node, language);
        });
      });
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label', 'value']
    });

    return () => observer.disconnect();
  }, [language]);

  return children;
};

export default LocalizationProvider;
