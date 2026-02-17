/**
 * Request an idle callback or fallback to setTimeout
 * @returns {function} The requestIdleCallback function
 */
export const requestIdleCallback =
  typeof window.requestIdleCallback == 'function' ? window.requestIdleCallback : setTimeout;

/**
 * Returns a promise that resolves after yielding to the main thread.
 * @see https://web.dev/articles/optimize-long-tasks#scheduler-yield
 */
export const yieldToMainThread = () => {
  if ('yield' in scheduler) {
    // @ts-ignore - TypeScript doesn't recognize the yield method yet.
    return scheduler.yield();
  }

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0);
    });
  });
};

/**
 * Tells if we are on a low power device based on the number of CPU cores and RAM
 * @returns {boolean} True if the device is a low power device, false otherwise
 */
export function isLowPowerDevice() {
  return Number(navigator.hardwareConcurrency) <= 2 || Number(navigator.deviceMemory) <= 2;
}

/**
 * Check if the browser supports View Transitions API
 * @returns {boolean} True if the browser supports View Transitions API, false otherwise
 */
export function supportsViewTransitions() {
  return typeof document.startViewTransition === 'function';
}

/**
 * The current view transition
 * @type {{ current: Promise<void> | undefined }}
 */
export const viewTransition = {
  current: undefined,
};

/**
 * Functions to run when a view transition of a given type is started
 * @type {{ [key: string]: () => Promise<(() => void) | undefined> }}
 */
const viewTransitionTypes = {
  'product-grid': async () => {
    const grid = document.querySelector('.product-grid');
    const productCards = /** @type {HTMLElement[]} */ ([
      ...document.querySelectorAll('.product-grid .product-grid__item'),
    ]);

    if (!grid || !productCards.length) return;

    await new Promise((resolve) =>
      requestIdleCallback(() => {
        const cardsToAnimate = getCardsToAnimate(grid, productCards);

        productCards.forEach((card, index) => {
          if (index < cardsToAnimate) {
            card.style.setProperty('view-transition-name', `product-card-${card.dataset.productId}`);
          } else {
            card.style.setProperty('content-visibility', 'hidden');
          }
        });

        resolve(null);
      })
    );

    return () =>
      productCards.forEach((card) => {
        card.style.removeProperty('view-transition-name');
        card.style.removeProperty('content-visibility');
      });
  },
};

/**
 * Starts a view transition
 * @param {() => void} callback The callback to call when the view transition starts
 * @param {string[]} [types] The types of view transition to use
 * @returns {Promise<void>} A promise that resolves when the view transition finishes
 */
export function startViewTransition(callback, types) {
  // Check if the API is supported and transitions are desired
  if (!supportsViewTransitions() || isLowPowerDevice() || prefersReducedMotion()) {
    callback();
    return Promise.resolve();
  }

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    let cleanupFunctions = [];

    if (types) {
      for (const type of types) {
        if (viewTransitionTypes[type]) {
          const cleanupFunction = await viewTransitionTypes[type]();
          if (cleanupFunction) cleanupFunctions.push(cleanupFunction);
        }
      }
    }

    const transition = document.startViewTransition(callback);

    if (!viewTransition.current) {
      viewTransition.current = transition.finished;
    }

    if (types) types.forEach((type) => transition.types.add(type));

    transition.finished.then(() => {
      viewTransition.current = undefined;
      cleanupFunctions.forEach((cleanupFunction) => cleanupFunction());
      resolve();
    });
  });
}

/**
 * @typedef {{ [key: string]: string | undefined }} Headers
 */

/**
 * @typedef {Object} FetchConfig
 * @property {string} method
 * @property {Headers} headers
 * @property {string | FormData | undefined} [body]
 */

/**
 * Creates a fetch configuration object
 * @param {string} [type] The type of response to expect
 * @param {Object} [config] The config of the request
 * @param {FetchConfig['body']} [config.body] The body of the request
 * @param {FetchConfig['headers']} [config.headers] The headers of the request
 * @returns {RequestInit} The fetch configuration object
 */
export function fetchConfig(type = 'json', config = {}) {
  /** @type {Headers} */
  const headers = { 'Content-Type': 'application/json', Accept: `application/${type}`, ...config.headers };

  if (type === 'javascript') {
    headers['X-Requested-With'] = 'XMLHttpRequest';
    delete headers['Content-Type'];
  }

  return {
    method: 'POST',
    headers: /** @type {HeadersInit} */ (headers),
    body: config.body,
  };
}

/**
 * Creates a debounced function that delays calling the provided function (fn)
 * until after wait milliseconds have elapsed since the last time
 * the debounced function was invoked. The returned function has a .cancel()
 * method to cancel any pending calls.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn The function to debounce
 * @param {number} wait The time (in milliseconds) to wait before calling fn
 * @returns {T & { cancel(): void }} A debounced version of fn with a .cancel() method
 */
export function debounce(fn, wait) {
  /** @type {number | undefined} */
  let timeout;

  /** @param {...any} args */
  function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  }

  // Add the .cancel method:
  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return /** @type {T & { cancel(): void }} */ (debounced);
}

/**
 * Creates a throttled function that calls the provided function (fn) at most once per every wait milliseconds
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn The function to throttle
 * @param {number} delay The time (in milliseconds) to wait before calling fn
 * @returns {T & { cancel(): void }} A throttled version of fn with a .cancel() method
 */
export function throttle(fn, delay) {
  let lastCall = 0;

  /** @param {...any} args */
  function throttled(...args) {
    const now = performance.now();
    // If the time since the last call exceeds the delay, execute the callback
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  }

  throttled.cancel = () => {
    lastCall = performance.now();
  };

  return /** @type {T & { cancel(): void }} */ (throttled);
}

/**
 * A media query for reduced motion
 * @type {MediaQueryList}
 */
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Check if the user prefers reduced motion
 * @returns {boolean} True if the user prefers reduced motion, false otherwise
 */
export function prefersReducedMotion() {
  return reducedMotion.matches;
}

/**
 * Normalize a string
 * @param {string} str The string to normalize
 * @returns {string} The normalized string
 */
export function normalizeString(str) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Format a money value
 * @param {string} value The value to format
 * @returns {string} The formatted value
 */
export function formatMoney(value) {
  let valueWithNoSpaces = value.replace(' ', '');
  if (valueWithNoSpaces.indexOf(',') === -1) return valueWithNoSpaces;
  if (valueWithNoSpaces.indexOf(',') < valueWithNoSpaces.indexOf('.')) return valueWithNoSpaces.replace(',', '');
  if (valueWithNoSpaces.indexOf('.') < valueWithNoSpaces.indexOf(','))
    return valueWithNoSpaces.replace('.', '').replace(',', '.');
  if (valueWithNoSpaces.indexOf(',') !== -1) return valueWithNoSpaces.replace(',', '.');

  return valueWithNoSpaces;
}

/**
 * Check if the document is ready/loaded and call the callback when it is.
 * @param {() => void} callback The function to call when the document is ready.
 */
export function onDocumentLoaded(callback) {
  if (document.readyState === 'complete') {
    callback();
  } else {
    window.addEventListener('load', callback);
  }
}

/**
 * Check if the DOM is ready and call the callback when it is.
 * This fires when the DOM is fully parsed but before all resources are loaded.
 * @param {() => void} callback The function to call when the DOM is ready.
 */
export function onDocumentReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Removes will-change from an element after an animation ends.
 * Intended to be used as an animationend event listener.
 * @param {AnimationEvent} event The animation event.
 */
export function removeWillChangeOnAnimationEnd(event) {
  const target = event.target;
  if (target && target instanceof HTMLElement) {
    target.style.setProperty('will-change', 'unset');
    target.removeEventListener('animationend', removeWillChangeOnAnimationEnd);
  }
}

/**
 * Wait for all animations to finish before calling the callback.
 * @param {Element | Element[]} elements The element(s) whose animations to wait for.
 * @param {() => void} [callback] The function to call when all animations are finished.
 * @param {Object} [options] The options to pass to `Element.getAnimations`.
 * @returns {Promise<void>} A promise that resolves when all animations are finished.
 */
export function onAnimationEnd(elements, callback, options = { subtree: true }) {
  const animations = Array.isArray(elements)
    ? elements.flatMap((element) => element.getAnimations(options))
    : elements.getAnimations(options);
  const animationPromises = animations.reduce((acc, animation) => {
    // Ignore ViewTimeline animations
    if (animation.timeline instanceof DocumentTimeline) {
      acc.push(animation.finished);
    }

    return acc;
  }, /** @type {Promise<Animation>[]} */ ([]));

  return Promise.allSettled(animationPromises).then(callback);
}

/**
 * Check if the click is outside the element.
 * @param {MouseEvent} event The mouse event.
 * @param {Element} element The element to check.
 * @returns {boolean} True if the click is outside the element, false otherwise.
 */
export function isClickedOutside(event, element) {
  if (event.target instanceof HTMLDialogElement || !(event.target instanceof Element)) {
    return !isPointWithinElement(event.clientX, event.clientY, element);
  }

  return !element.contains(event.target);
}

/**
 * Check if a point is within an element.
 * @param {number} x The x coordinate of the point.
 * @param {number} y The y coordinate of the point.
 * @param {Element} element The element to check.
 * @returns {boolean} True if the point is within the element, false otherwise.
 */
export function isPointWithinElement(x, y, element) {
  const { left, right, top, bottom } = element.getBoundingClientRect();

  return x >= left && x <= right && y >= top && y <= bottom;
}

/**
 * A media query for large screens
 * @type {MediaQueryList}
 */
export const mediaQueryLarge = matchMedia('(min-width: 750px)');

/**
 * Check if the current breakpoint is mobile
 * @returns {boolean} True if the current breakpoint is mobile, false otherwise
 */
export function isMobileBreakpoint() {
  return !mediaQueryLarge.matches;
}

/**
 * Check if the current breakpoint is desktop
 * @returns {boolean} True if the current breakpoint is desktop, false otherwise
 */
export function isDesktopBreakpoint() {
  return mediaQueryLarge.matches;
}

/**
 * Clamps a number between a minimum and maximum value.
 * @param {number} value - The input number to clamp.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

/**
 * Calculates the center point of an element along the specified axis.
 * @param {Element} element - The DOM element to find the center of.
 * @param {'x' | 'y'} [axis] - The axis ('x' or 'y') to get the center for. If not provided, returns both axes.
 * @template {('x' | 'y')} T
 * @param {T} [axis]
 * @returns {T extends ('x' | 'y') ? number : {x: number, y: number}} The center point along the axis or an object with x and y coordinates.
 */
export function center(element, axis) {
  const { left, width, top, height } = element.getBoundingClientRect();
  const point = {
    x: left + width / 2,
    y: top + height / 2,
  };

  if (axis) return /**  @type {any} */ (point[axis]);

  return /**  @type {any} */ (point);
}

/**
 * Calculates the start point of an element along the specified axis.
 * @param {Element} element - The DOM element to find the start of.
 * @param {'x' | 'y'} [axis] - The axis ('x' or 'y') to get the start for. If not provided, returns both axes.
 * @returns {number | {x: number, y: number}} The start point along the axis or an object with x and y coordinates.
 */
export function start(element, axis) {
  const { left, top } = element.getBoundingClientRect();
  const point = { x: left, y: top };

  if (axis) return /**  @type {any} */ (point[axis]);

  return /**  @type {any} */ (point);
}

/**
 * Finds the value in an array that is closest to a target value.
 * @param {number[]} values - An array of numbers.
 * @param {number} target - The target number to find the closest value to.
 * @returns {number} The value from the array closest to the target.
 */
export function closest(values, target) {
  return values.reduce(function (prev, curr) {
    return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
  });
}

/**
 * Prevents the default action of an event.
 * @param {Event} event - The event to prevent the default action of.
 */
export function preventDefault(event) {
  event.preventDefault();
}

/**
 * Get the visible elements within a root element.
 * @template {Element} T
 * @param {Element} root - The element within which elements should be visible.
 * @param {T[] | undefined} elements - The elements to check for visibility.
 * @param {number} [ratio=1] - The minimum percentage of the element that must be visible.
 * @param {'x' | 'y'} [axis] - Whether to only check along 'x' axis, 'y' axis, or both if undefined.
 * @returns {T[]} An array containing the visible elements.
 */
export function getVisibleElements(root, elements, ratio = 1, axis) {
  if (!elements?.length) return [];
  const rootRect = root.getBoundingClientRect();

  return elements.filter((element) => {
    const { width, height, top, right, left, bottom } = element.getBoundingClientRect();

    if (ratio < 1) {
      const intersectionLeft = Math.max(rootRect.left, left);
      const intersectionRight = Math.min(rootRect.right, right);
      const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);

      if (axis === 'x') {
        return width > 0 && intersectionWidth / width >= ratio;
      }

      const intersectionTop = Math.max(rootRect.top, top);
      const intersectionBottom = Math.min(rootRect.bottom, bottom);
      const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);

      if (axis === 'y') {
        return height > 0 && intersectionHeight / height >= ratio;
      }

      const intersectionArea = intersectionWidth * intersectionHeight;
      const elementArea = width * height;

      // Check that at least the specified ratio of the element is visible
      return elementArea > 0 && intersectionArea / elementArea >= ratio;
    }

    const isWithinX = left >= rootRect.left && right <= rootRect.right;
    if (axis === 'x') {
      return isWithinX;
    }

    const isWithinY = top >= rootRect.top && bottom <= rootRect.bottom;
    if (axis === 'y') {
      return isWithinY;
    }

    return isWithinX && isWithinY;
  });
}

export function getIOSVersion() {
  const { userAgent } = navigator;
  const isIOS = /(iPhone|iPad)/i.test(userAgent);

  if (!isIOS) return null;

  const version = userAgent.match(/OS ([\d_]+)/)?.[1];
  const [major, minor] = version?.split('_') || [];
  if (!version || !major) return null;

  return {
    fullString: version.replace('_', '.'),
    major: parseInt(major, 10),
    minor: minor ? parseInt(minor, 10) : 0,
  };
}

/**
 * Determines which grid items should be animated during a transition.
 * It makes an estimation based on the zoom-out card size because it's
 * the common denominator for both transition states. I.e. transitioning either
 * from 10 to 20 cards the other way around, both need 20 cards to be animated.
 * @param {Element} grid - The grid element
 * @param {Element[]} cards - The cards to animate
 * @returns {number} - Number of cards that should be animated
 */
function getCardsToAnimate(grid, cards) {
  if (!grid || !cards || cards.length === 0) return 0;

  const itemSample = cards[0];
  if (!itemSample) return 0;

  // Calculate the visible area of the grid for the Y axis. Assume X is always fully visible:
  const gridRect = grid.getBoundingClientRect();
  const visibleArea = {
    top: Math.max(0, gridRect.top),
    bottom: Math.min(window.innerHeight, gridRect.bottom),
  };

  const visibleHeight = Math.round(visibleArea.bottom - visibleArea.top);
  if (visibleHeight <= 0) return 0;

  /** @type {import('product-card').ProductCard | null} */
  const cardSample = itemSample.querySelector('product-card');
  const gridStyle = getComputedStyle(grid);

  const galleryAspectRatio = cardSample?.refs?.cardGallery?.style.getPropertyValue('--gallery-aspect-ratio') || '';
  let aspectRatio = parseFloat(galleryAspectRatio) || 0.5;
  if (galleryAspectRatio?.includes('/')) {
    const [width = '1', height = '2'] = galleryAspectRatio.split('/');
    aspectRatio = parseInt(width, 10) / parseInt(height, 10);
  }

  const cardGap = parseInt(cardSample?.refs?.productCardLink?.style.getPropertyValue('--product-card-gap') || '') || 12;
  const gridGap = parseInt(gridStyle.getPropertyValue('--product-grid-gap')) || 12;

  // Assume only a couple of lines of text in the card details (title and price).
  // If the title wraps into more lines, we might just animate more cards, but that's fine.
  const detailsSize = ((parseInt(gridStyle.fontSize) || 16) + 2) * 2;

  const isMobile = window.innerWidth < 750;

  // Always use the zoom-out state card width
  const cardWidth = isMobile ? Math.round((gridRect.width - gridGap) / 2) : 100;
  const cardHeight = Math.round(cardWidth / aspectRatio) + cardGap + detailsSize;

  // Calculate the number of cards that fit in the visible area:
  // - The width estimation is pretty accurate, we can ignore decimals.
  // - The height estimation needs to account for peeking rows, so we round up.
  const columnsInGrid = isMobile ? 2 : Math.floor((gridRect.width + gridGap) / (cardWidth + gridGap));
  const rowsInGrid = Math.ceil((visibleHeight - gridGap) / (cardHeight + gridGap));

  return columnsInGrid * rowsInGrid;
}

/**
 * Preloads an image
 * @param {string} src - The source of the image to preload
 */
export function preloadImage(src) {
  const image = new Image();
  image.src = src;
}

export class TextComponent extends HTMLElement {
  shimmer() {
    this.setAttribute('shimmer', '');
  }
}

if (!customElements.get('text-component')) {
  customElements.define('text-component', TextComponent);
}

/**
 * Resets the shimmer attribute on all elements in the container.
 * @param {Element} [container] - The container to reset the shimmer attribute on.
 */
export function resetShimmer(container = document.body) {
  const shimmer = container.querySelectorAll('[shimmer]');
  shimmer.forEach((item) => item.removeAttribute('shimmer'));
}

/**
 * Change the meta theme color of the browser.
 * @param {string} color - The color value (e.g., 'rgb(255, 255, 255)')
 */
export function changeMetaThemeColor(color) {
  const metaThemeColor = document.head.querySelector('meta[name="theme-color"]');
  if (metaThemeColor && color) {
    metaThemeColor.setAttribute('content', color);
  }
}

/**
 * Gets the `view` URL search parameter value, if it exists.
 * Useful for Section Rendering API calls to get HTML markup for the correct template view.
 * Primarily used in testing alternative template views.
 * @returns {string | null} The view parameter value, or null if it doesn't exist
 */
export function getViewParameterValue() {
  return new URLSearchParams(window.location.search).get('view');
}

/**
 * Helper to parse integer with a default fallback
 * Handles the case where 0 is a valid value (not falsy)
 * @template {number|null} T
 * @param {string|number|null|undefined} value - The value to parse
 * @param {T} defaultValue - The default value (number or null)
 * @returns {number|T} The parsed integer or default value
 */
export function parseIntOrDefault(value, defaultValue) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value.toString());
  return isNaN(parsed) ? defaultValue : parsed;
}

class Scheduler {
  /** @type {Set<() => void>} */
  #queue = new Set();
  /** @type {boolean} */
  #scheduled = false;

  /** @param {() => void} task */
  schedule = async (task) => {
    this.#queue.add(task);

    if (!this.#scheduled) {
      this.#scheduled = true;

      // Wait for any in-progress view transitions to finish
      if (viewTransition.current) await viewTransition.current;

      requestAnimationFrame(this.flush);
    }
  };

  flush = () => {
    for (const task of this.#queue) {
      setTimeout(task, 0);
    }

    this.#queue.clear();
    this.#scheduled = false;
  };
}

export const scheduler = new Scheduler();

/**
 * Executes a callback once per session when in the Shopify theme editor
 * @param {HTMLElement} element - The element to check for the shopify editor block id
 * @param {string} sessionKeyName - Unique key for the session storage
 * @param {() => void} callback - Function to execute
 * @returns {void} - Void if the callback was executed, undefined if it wasn't
 */
export function oncePerEditorSession(element, sessionKeyName, callback) {
  const isInThemeEditor = window.Shopify?.designMode;
  const shopifyEditorSectionId = JSON.parse(element.dataset.shopifyEditorSection || '{}').id;
  const shopifyEditorBlockId = JSON.parse(element.dataset.shopifyEditorBlock || '{}').id;
  const editorId = shopifyEditorSectionId || shopifyEditorBlockId;
  const uniqueSessionKey = `${sessionKeyName}-${editorId}`;

  if (isInThemeEditor && sessionStorage.getItem(uniqueSessionKey)) return;

  callback();

  if (isInThemeEditor) sessionStorage.setItem(uniqueSessionKey, 'true');

  return;
}

/**
 * A custom ResizeObserver that only calls the callback when the element is resized.
 * By default the ResizeObserver callback is called when the element is first observed.
 */
export class ResizeNotifier extends ResizeObserver {
  #initialized = false;

  /**
   * @param {ResizeObserverCallback} callback
   */
  constructor(callback) {
    super((entries) => {
      if (this.#initialized) return callback(entries, this);
      this.#initialized = true;
    });
  }

  disconnect() {
    this.#initialized = false;
    super.disconnect();
  }
}

// Header calculation functions for maintaining CSS variables
export function calculateHeaderGroupHeight(
  header = document.querySelector('#header-component'),
  headerGroup = document.querySelector('#header-group')
) {
  if (!headerGroup) return 0;

  let totalHeight = 0;
  const children = headerGroup.children;
  for (let i = 0; i < children.length; i++) {
    const element = children[i];
    if (element === header || !(element instanceof HTMLElement)) continue;
    totalHeight += element.offsetHeight;
  }

  // If the header is transparent and has a sibling section, add the height of the header to the total height
  if (header instanceof HTMLElement && header.hasAttribute('transparent') && header.parentElement?.nextElementSibling) {
    return totalHeight + header.offsetHeight;
  }

  return totalHeight;
}

/**
 * Updates CSS custom properties for transparent header offset calculation
 * Avoids expensive :has() selectors
 */
function updateTransparentHeaderOffset() {
  const header = document.querySelector('#header-component');
  const headerGroup = document.querySelector('#header-group');
  const hasHeaderSection = headerGroup?.querySelector('.header-section');
  if (!hasHeaderSection || !header?.hasAttribute('transparent')) {
    document.body.style.setProperty('--transparent-header-offset-boolean', '0');
    return;
  }

  const hasImmediateSection = hasHeaderSection.nextElementSibling?.classList.contains('shopify-section');

  const shouldApplyOffset = !hasImmediateSection ? '1' : '0';
  document.body.style.setProperty('--transparent-header-offset-boolean', shouldApplyOffset);
}

/**
 * Initialize and maintain header height CSS variables.
 */
function updateHeaderHeights() {
  const header = document.querySelector('header-component');

  // Early exit if no header - nothing to do
  if (!(header instanceof HTMLElement)) return;

  // Calculate initial heights
  const headerHeight = header.offsetHeight;
  const headerGroupHeight = calculateHeaderGroupHeight(header);

  document.body.style.setProperty('--header-height', `${headerHeight}px`);
  document.body.style.setProperty('--header-group-height', `${headerGroupHeight}px`);
}

export function updateAllHeaderCustomProperties() {
  updateHeaderHeights();
  updateTransparentHeaderOffset();
}

// Theme is not defined in some layouts, like the gift card page
if (typeof Theme !== 'undefined') {
  Theme.utilities = {
    ...Theme.utilities,
    scheduler: scheduler,
  };
}

import { requestIdleCallback } from '@theme/utilities';

/*
 * Declarative shadow DOM is only initialized on the initial render of the page.
 * If the component is mounted after the browser finishes the initial render,
 * the shadow root needs to be manually hydrated.
 */
export class DeclarativeShadowElement extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const template = this.querySelector(':scope > template[shadowrootmode="open"]');

      if (!(template instanceof HTMLTemplateElement)) return;

      const shadow = this.attachShadow({ mode: 'open' });
      shadow.append(template.content.cloneNode(true));
    }
  }
}

/**
 * @typedef {Record<string, Element | Element[] | undefined>} Refs
 */

/**
 * @template {Refs} T
 * @typedef {T & Refs} RefsType
 */

/**
 * Base class that powers our custom web components.
 *
 * Manages references to child elements with `ref` attributes and sets up mutation observers to keep
 * the refs updated when the DOM changes. Also handles declarative event listeners using.
 *
 * @template {Refs} [T=Refs]
 * @extends {DeclarativeShadowElement}
 */
export class Component extends DeclarativeShadowElement {
  /**
   * An object holding references to child elements with `ref` attributes.
   *
   * @type {RefsType<T>}
   */
  refs = /** @type {RefsType<T>} */ ({});

  /**
   * An array of required refs. If a ref is not found, an error will be thrown.
   *
   * @type {string[] | undefined}
   */
  requiredRefs;

  /**
   * Gets the root node of the component, which is either its shadow root or the component itself.
   *
   * @returns {(ShadowRoot | Component<T>)[]} The root nodes.
   */
  get roots() {
    return this.shadowRoot ? [this, this.shadowRoot] : [this];
  }

  /**
   * Called when the element is connected to the document's DOM.
   *
   * Initializes event listeners and refs.
   */
  connectedCallback() {
    super.connectedCallback();
    registerEventListeners();

    this.#updateRefs();

    requestIdleCallback(() => {
      for (const root of this.roots) {
        this.#mutationObserver.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['ref'],
          attributeOldValue: true,
        });
      }
    });
  }

  /**
   * Called when the element is re-rendered by the Section Rendering API.
   */
  updatedCallback() {
    this.#mutationObserver.takeRecords();
    this.#updateRefs();
  }

  /**
   * Called when the element is disconnected from the document's DOM.
   *
   * Disconnects the mutation observer.
   */
  disconnectedCallback() {
    this.#mutationObserver.disconnect();
  }

  /**
   * Updates the `refs` object by querying all descendant elements with `ref` attributes and storing references to them.
   *
   * This method is called to keep the `refs` object in sync with the DOM.
   */
  #updateRefs() {
    const refs = /** @type any */ ({});
    const elements = this.roots.reduce((acc, root) => {
      for (const element of root.querySelectorAll('[ref]')) {
        if (!this.#isDescendant(element)) continue;
        acc.add(element);
      }

      return acc;
    }, /** @type {Set<Element>} */ (new Set()));

    for (const ref of elements) {
      const refName = ref.getAttribute('ref') ?? '';
      const isArray = refName.endsWith('[]');
      const path = isArray ? refName.slice(0, -2) : refName;

      if (isArray) {
        const array = Array.isArray(refs[path]) ? refs[path] : [];

        array.push(ref);
        refs[path] = array;
      } else {
        refs[path] = ref;
      }
    }

    if (this.requiredRefs?.length) {
      for (const ref of this.requiredRefs) {
        if (!(ref in refs)) {
          throw new MissingRefError(ref, this);
        }
      }
    }

    this.refs = /** @type {RefsType<T>} */ (refs);
  }

  /**
   * MutationObserver instance to observe changes in the component's DOM subtree and update refs accordingly.
   *
   * @type {MutationObserver}
   */
  #mutationObserver = new MutationObserver((mutations) => {
    if (
      mutations.some(
        (m) =>
          (m.type === 'attributes' && this.#isDescendant(m.target)) ||
          (m.type === 'childList' && [...m.addedNodes, ...m.removedNodes].some(this.#isDescendant))
      )
    ) {
      this.#updateRefs();
    }
  });

  /**
   * Checks if a given node is a descendant of this component.
   *
   * @param {Node} node - The node to check.
   * @returns {boolean} True if the node is a descendant of this component.
   */
  #isDescendant = (node) => getClosestComponent(getAncestor(node)) === this;
}

/**
 * Get the ancestor of a given node.
 *
 * @param {Node} node - The node to get the ancestor of.
 * @returns {Node | null} The ancestor of the node or null if none is found.
 */
function getAncestor(node) {
  if (node.parentNode) return node.parentNode;

  const root = node.getRootNode();
  if (root instanceof ShadowRoot) return root.host;

  return null;
}

/**
 * Recursively finds the closest ancestor that is an instance of `Component`.
 *
 * @param {Node | null} node - The starting node to search from.
 * @returns {HTMLElement | null} The closest ancestor `Component` instance or null if none is found.
 */
function getClosestComponent(node) {
  if (!node) return null;
  if (node instanceof Component) return node;
  if (node instanceof HTMLElement && node.tagName.toLowerCase().endsWith('-component')) return node;

  const ancestor = getAncestor(node);
  if (ancestor) return getClosestComponent(ancestor);

  return null;
}

/**
 * Initializes the event listeners for custom event handling.
 *
 * Sets up event listeners for specified events and delegates the handling of those events
 * to methods defined on the closest `Component` instance, based on custom attributes.
 */
let initialized = false;

function registerEventListeners() {
  if (initialized) return;
  initialized = true;

  const events = ['click', 'change', 'select', 'focus', 'blur', 'submit', 'input', 'keydown', 'keyup', 'toggle'];
  const shouldBubble = ['focus', 'blur'];
  const expensiveEvents = ['pointerenter', 'pointerleave'];

  for (const eventName of [...events, ...expensiveEvents]) {
    const attribute = `on:${eventName}`;

    document.addEventListener(
      eventName,
      (event) => {
        const element = getElement(event);

        if (!element) return;

        const proxiedEvent =
          event.target !== element
            ? new Proxy(event, {
                get(target, property) {
                  if (property === 'target') return element;

                  const value = Reflect.get(target, property);

                  if (typeof value === 'function') {
                    return value.bind(target);
                  }

                  return value;
                },
              })
            : event;

        const value = element.getAttribute(attribute) ?? '';
        let [selector, method] = value.split('/');
        // Extract the last segment of the attribute value delimited by `?` or `/`
        // Do not use lookback for Safari 16.0 compatibility
        const matches = value.match(/([\/\?][^\/\?]+)([\/\?][^\/\?]+)$/);
        const data = matches ? matches[2] : null;
        const instance = selector
          ? selector.startsWith('#')
            ? document.querySelector(selector)
            : element.closest(selector)
          : getClosestComponent(element);

        if (!(instance instanceof Component) || !method) return;

        method = method.replace(/\?.*/, '');

        const callback = /** @type {any} */ (instance)[method];

        if (typeof callback === 'function') {
          try {
            /** @type {(Event | Data)[]} */
            const args = [proxiedEvent];

            if (data) args.unshift(parseData(data));

            callback.call(instance, ...args);
          } catch (error) {
            console.error(error);
          }
        }
      },
      { capture: true }
    );
  }

  /** @param {Event} event */
  function getElement(event) {
    const target = event.composedPath?.()[0] ?? event.target;

    if (!(target instanceof Element)) return;

    if (target.hasAttribute(`on:${event.type}`)) {
      return target;
    }

    if (expensiveEvents.includes(event.type)) {
      return null;
    }

    return event.bubbles || shouldBubble.includes(event.type) ? target.closest(`[on\\:${event.type}]`) : null;
  }
}

/**
 * Parses a string to extract data based on a delimiter.
 *
 * @param {string} str - The string to parse.
 * @returns {Object|Array<string|number>|string} The parsed data.
 */
function parseData(str) {
  const delimiter = str[0];
  const data = str.slice(1);

  return delimiter === '?'
    ? Object.fromEntries(
        Array.from(new URLSearchParams(data).entries()).map(([key, value]) => [key, parseValue(value)])
      )
    : parseValue(data);
}

/**
 * @typedef {Object|Array<string|number>|string} Data
 */

/**
 * Parses a string value to its appropriate type.
 *
 * @param {string} str - The string to parse.
 * @returns {Data} The parsed value.
 */
function parseValue(str) {
  if (str === 'true') return true;
  if (str === 'false') return false;

  const maybeNumber = Number(str);
  if (!isNaN(maybeNumber) && str.trim() !== '') return maybeNumber;

  return str;
}

/**
 * Throws a formatted error when a required ref is not found in the component.
 */
class MissingRefError extends Error {
  /**
   * @param {string} ref
   * @param {Component} component
   */
  constructor(ref, component) {
    super(`Required ref "${ref}" not found in component ${component.tagName.toLowerCase()}`);
  }
}
