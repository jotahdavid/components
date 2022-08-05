const SELECTOR_ITEM = '.carousel__item';
const SELECTOR_ARROW_PREV = '.carousel__control.--prev';
const SELECTOR_ARROW_NEXT = '.carousel__control.--next';
const SELECTOR_INDICATORS = '.carousel__indicators';
const SELECTOR_ACTIVE = '.--active';

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
    const nextElement =
      element ?? this.getNextActiveElement(this.getItems(), activeElement, isNext);

    if (activeElement === nextElement) {
      return;
    }

    const nextElementIndex = this.getItemIndex(nextElement);

    this.getActive().classList.remove(SELECTOR_ACTIVE.slice(1));
    nextElement.classList.add(SELECTOR_ACTIVE.slice(1));

    this.setActiveIndicatorElement(nextElementIndex);
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
   * @param {number} index
   */
  setActiveIndicatorElement(index) {
    if (!this._indicatorsElement) {
      return;
    }

    const activeIndicator = this._indicatorsElement.querySelector(SELECTOR_ACTIVE);
    activeIndicator.classList.remove(SELECTOR_ACTIVE.slice(1));

    const newActiveIndicator = this._indicatorsElement.querySelector(`[data-slide-to="${index}"]`);

    if (newActiveIndicator) {
      newActiveIndicator.classList.add(SELECTOR_ACTIVE.slice(1));
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
