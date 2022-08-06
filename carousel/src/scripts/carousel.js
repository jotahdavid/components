const CLASS_NAME_ACTIVE = '--active';
const CLASS_NAME_NEXT = '--next';
const CLASS_NAME_PREV = '--prev';
const CLASS_NAME_START = '--start';
const CLASS_NAME_END = '--end';

const SELECTOR_ITEM = '.carousel__item';
const SELECTOR_INDICATORS = '.carousel__indicators';
const SELECTOR_ACTIVE = '.--active';

const TRANSITION_END = 'transitionend';

class Carousel {
  /**
   * @param {string} selector
   */
  constructor(selector) {
    const element = document.querySelector(selector);
    if (!element) {
      throw new ReferenceError(`${selector} element does not exists`);
    }

    this._element = element;
    this._indicatorsElement = this._element.querySelector(SELECTOR_INDICATORS);
    this._activeElement = null;
    this._isSliding = false;
    this.addEventListener();
  }

  /**
   * @param {number} index
   */
  to(index) {
    index = Number(index);

    const items = this.getItems();
    if (index > items.length - 1 || index < 0 || isNaN(index)) {
      return;
    }

    const activeIndex = this.getItemIndex(this.getActive());
    if (activeIndex === index) {
      return;
    }

    const order = index > activeIndex ? 'next' : 'prev';

    this.slide(order, items[index]);
  }

  /**
   * @returns {Element[]}
   */
  getItems() {
    return Array.from(this._element.querySelectorAll(SELECTOR_ITEM));
  }

  /**
   * @param {Element} element
   */
  getItemIndex(element) {
    return this.getItems().indexOf(element);
  }

  /**
   * @returns {Element | null}
   */
  getActive() {
    return this._element.querySelector(SELECTOR_ITEM + SELECTOR_ACTIVE);
  }

  /**
   * @param {"next" | "prev"} order
   * @param {Element} nextElement
   */
  slide(order, element = null) {
    if (this._isSliding) {
      return;
    }

    const activeElement = this.getActive();
    const isNext = order === 'next';
    const nextElement = element ?? this.getNextActiveElement(this.getItems(), activeElement, isNext);

    if (activeElement === nextElement) {
      return;
    }

    const nextElementIndex = this.getItemIndex(nextElement);

    this._isSliding = true;
    this.setActiveIndicatorElement(nextElementIndex);

    const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
    const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;

    nextElement.classList.add(orderClassName);
    this.reflow(nextElement);
    activeElement.classList.add(directionalClassName);
    nextElement.classList.add(directionalClassName);

    const callback = () => {
      nextElement.classList.remove(directionalClassName, orderClassName);
      nextElement.classList.add(CLASS_NAME_ACTIVE);
      activeElement.classList.remove(CLASS_NAME_ACTIVE, orderClassName, directionalClassName);
      this._isSliding = false;
    };

    this.executeAfterTransition(callback, activeElement);
  }

  /**
   * @param {Element} element
   */
  reflow(element) {
    element.offsetHeight;
  }

  /**
   * @param {Element[]} list
   * @param {Element} activeElement
   * @param {boolean} shouldGetNext
   * @returns {Element}
   */
  getNextActiveElement(list, activeElement, shouldGetNext) {
    const listLength = list.length;
    let index = list.indexOf(activeElement);

    if (index === -1) {
      return list[0];
    }

    index += shouldGetNext ? 1 : -1;
    index = (index + listLength) % listLength;

    return list[Math.max(0, Math.min(index, listLength - 1))];
  }

  /**
   * @param {Function} callback
   * @param {Element} element
   */
  executeAfterTransition(callback, element) {
    const emulatedDuration = this.getTransitionDurationFromElement(element) + 5;

    let called = false;

    const handler = ({ target }) => {
      if (target !== element) {
        return;
      }

      called = true;
      element.removeEventListener(TRANSITION_END, handler);
      callback();
    };

    element.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        element.dispatchEvent(new Event(TRANSITION_END));
      }
    }, emulatedDuration);
  }

  /**
   * @param {Element} element
   */
  getTransitionDurationFromElement(element) {
    if (!element) {
      return 0;
    }

    let { transitionDuration, transitionDelay } = window.getComputedStyle(element);

    transitionDuration = transitionDuration.split(',')[0];
    transitionDelay = transitionDelay.split(',')[0];

    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * 1000;
  }

  /**
   * @param {number} index
   */
  setActiveIndicatorElement(index) {
    if (!this._indicatorsElement) {
      return;
    }

    const activeIndicator = this._indicatorsElement.querySelector(SELECTOR_ACTIVE);
    activeIndicator.classList.remove(CLASS_NAME_ACTIVE);

    const newActiveIndicator = this._indicatorsElement.querySelector(`[data-slide-to="${index}"]`);

    if (newActiveIndicator) {
      newActiveIndicator.classList.add(CLASS_NAME_ACTIVE);
    }
  }

  next() {
    this.slide('next');
  }

  prev() {
    this.slide('prev');
  }

  addEventListener() {
    const carousel = this;

    this._element.querySelectorAll('[data-slide-to]').forEach((item) => {
      item.addEventListener('click', handleSlide);
    });

    this._element.querySelectorAll('[data-slide]').forEach((item) => {
      item.addEventListener('click', handleSlide);
    });

    function handleSlide(event) {
      event.preventDefault();

      const slideIndex = this.getAttribute('data-slide-to');

      if (slideIndex) {
        carousel.to(slideIndex);
        return;
      }

      if (this.getAttribute('data-slide') === 'next') {
        carousel.next();
        return;
      }

      carousel.prev();
    }
  }
}

export default Carousel;
