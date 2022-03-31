;(function($, window, document) {
    var pluginName = 'carouselCircular';
    var defaults = {
        current: 1,
        circleClass: '.carousel--circular__circle',
        itemClass: '.carousel--circular__item',
        itemActiveClass: '.carousel--circular__item--current',
        itemFadeoutClass: '.carousel--circular__item--fadeout',
        anchorClass: '.carousel--circular__anchor',
        anchorActiveClass: '.carousel--circular__anchor--current',
        navClass: '.carousel--circular__nav',
        navItemClass: '.carousel--circular__nav-item',
        navActiveItemClass: '.carousel--circular__nav-item--current',
        navLinkClass: '.carousel--circular__nav-link',
    };
    var initSelector = '.carousel--circular';

    /**
     * CarouselCircular.
     *
     * @class
     * @param {HTMLElement} element - The HTML element the CarouselCircular should be bound to.
     * @param {Object} options - An option map.
     */
    function CarouselCircular(element, options) {
        this.element = element;
        this.$element = $(this.element);
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.$circle = $('<div class="' + this.options.circleClass.substr(1) + '"></div>');
        this.rotateDay = 0;
        this.rotateNight = 0;
        this.switchFadeDelay = 150;
        this.current = this.options.current;

        this._init();
    }

    /**
     * Initialize the plugin.
     *
     * @function init
     * @private
     * @returns {void}
     */
    CarouselCircular.prototype._init = function() {
        this._setHTML();
        this._bindEvents();
        this.setCurrent(this.current);
    };

    /**
     * Set up HTML for carousel.
     *
     * @function _setHTML
     * @private
     * @returns {void}
     */
    CarouselCircular.prototype._setHTML = function() {
        this.$element.find(this.options.itemClass).each(this._generateNav.bind(this));
        this.$element.prepend(this.$circle);
        this.$element.prepend(this.$list);
    };

    /**
     * Remove HTML that has been set by plugin.
     *
     * @function _unsetHTML
     * @private
     * @returns {void}
     */
    CarouselCircular.prototype._unsetHTML = function() {
        this.$list.remove();
        this.$circle.remove();
    };

    /**
     * Generate nav and anchor for an item.
     *
     * @function _generateNav
     * @private
     * @param   {integer} index - Index.
     * @param   {HTMLElement} target - Target element.
     * @returns {void}
     */
    CarouselCircular.prototype._generateNav = function(index, target) {
        index += 1;
        $(target).attr('data-id', index);
        $(target).find(this.options.anchorClass).clone().attr('data-id', index).appendTo(this.$circle);

        $('<li class="' + this.options.navItemClass.substr(1) + '"><a href="#" class="' + this.options.navLinkClass.substr(1) + '" data-id="' + index + '">' + $(target).data('title') + '</a></li>').appendTo(this.$list);
    };

    /**
     * Bind events.
     *
     * @function bindEvents
     * @private
     * @returns {void}
     */
    CarouselCircular.prototype._bindEvents = function() {
        this.$circle.on('click.carouselCircular', this.options.anchorClass, this._anchorClick.bind(this));
        this.$element.on('click.carouselCircular', this.options.navLinkClass, this._navClick.bind(this));
        this.$element.on('click.carouselCircular', this.options.nextClass, this.next.bind(this));
        this.$element.on('click.carouselCircular', this.options.prevClass, this.prev.bind(this));
        $(window).on('resize.carouselCircular', this._resizeHandler.bind(this));
    };

    /**
     * Set current element on anchor click.
     *
     * @function _anchorClick
     * @private
     * @param   {Event} event - Event.
     * @returns {void}
     */
    CarouselCircular.prototype._anchorClick = function(event) {
        var id = $(event.currentTarget).data('id');

        event.preventDefault();
        this.setCurrent(id);
    };

    /**
     * Set current element on nav click.
     *
     * @function _navClick
     * @private
     * @param   {Event} event - Event.
     * @returns {void}
     */
    CarouselCircular.prototype._navClick = function(event) {
        var trigger = event.currentTarget;
        var id = $(trigger).data('id');

        event.preventDefault();
        $(this.options.navClass).find(this.options.navActiveItemClass).removeClass(this.options.navActiveItemClass.substr(1));
        $(trigger).parent().addClass(this.options.navActiveItemClass.substr(1));
        this.setCurrent(id);
    };

    /**
     * Set current element again on resize.
     *
     * @function _resizeHandler
     * @private
     * @returns {void}
     */
    CarouselCircular.prototype._resizeHandler = function() {
        this.setCurrent(this.getCurrent());
    };

    /**
     * Get ID of current item.
     *
     * @function getCurrent
     * @returns {integer} Current item ID.
     */
    CarouselCircular.prototype.getCurrent = function() {
        return this.current ? Number(this.current) : this._getMin();
    };

    /**
     * Set current item to ID.
     *
     * @function setCurrent
     * @param   {integer} id - Current element id.
     * @returns {void}
     */
    CarouselCircular.prototype.setCurrent = function(id) {
        var prev = this.getCurrent();

        this.current = id;
        this.$element.find(this.options.navLinkClass + '[data-id="' + id + '"]').parent().addClass(this.options.navActiveItemClass.substr(1)).siblings().removeClass(this.options.navActiveItemClass.substr(1));
        this.$element.find(this.options.anchorClass + '[data-id="' + id + '"]').addClass(this.options.anchorActiveClass.substr(1)).siblings().removeClass(this.options.anchorActiveClass.substr(1));

        var prevItem = this.$element.find(this.options.itemActiveClass);
        var nextItem = this.$element.find(this.options.itemClass + '[data-id="' + id + '"]');

        if (id != prev) {
            prevItem.removeClass(this.options.itemActiveClass.substr(1));
            setTimeout(fadeOutComplete.bind(this), this.switchFadeDelay);
        } else {
            prevItem.removeClass(this.options.itemActiveClass.substr(1));
            nextItem.addClass(this.options.itemActiveClass.substr(1));
        }

        this._setCarouselTransforms(prev);
        this.$circle.find(this.options.anchorClass).each(this._setAnchorTransforms.bind(this, prev));

        /**
         * Add class if fade out is complete.
         *
         * @returns {void}
         */
        function fadeOutComplete() {
            nextItem.addClass(this.options.itemActiveClass.substr(1));
            nextItem.parent().siblings().children().removeClass(this.options.itemActiveClass.substr(1));
        }
    };

    /**
     * Go to next element.
     *
     * @function next
     * @param   {Event} event - Event.
     * @returns {void}
     */
    CarouselCircular.prototype.next = function(event) {
        event.preventDefault();
        this.setCurrent(this._getNext());
    };

    /**
     * Go to previous element.
     *
     * @function prev
     * @param   {Event} event - Event.
     * @returns {void}
     */
    CarouselCircular.prototype.prev = function(event) {
        event.preventDefault();
        this.setCurrent(this._getPrevious());
    };

    /**
     * Get maximum element count.
     *
     * @function _getMax
     * @private
     * @returns {void}
     */
    CarouselCircular.prototype._getMax = function() {
        return Number(this.$circle.find(this.options.anchorClass).length);
    };

    /**
     * Get minimum element count.
     *
     * @function _getMin
     * @private
     * @returns {void}
     */
    CarouselCircular.prototype._getMin = function() {
        return 1;
    };

    /**
     * Get previous element ID.
     *
     * @function _getPrevious
     * @private
     * @returns {integer} Previous element ID.
     */
    CarouselCircular.prototype._getPrevious = function() {
        var current = this.getCurrent();

        if (current == this._getMin()) {
            current = this._getMax();
        } else {
            current--;
        }

        return current;
    };

    /**
     * Get next element ID.
     *
     * @function _getNext
     * @private
     * @returns {integer} Next element ID.
     */
    CarouselCircular.prototype._getNext = function() {
        var current = this.getCurrent();

        if (current == this._getMax()) {
            current = this._getMin();
        } else {
            current++;
        }

        return current;
    };

    /**
     * Get the distance between two elements.
     *
     * @function _getDistance
     * @private
     * @param   {integer} previous - Previous element width.
     * @param   {integer} current - Current element width.
     * @returns {integer} Distance between previous and current.
     */
    CarouselCircular.prototype._getDistance = function(previous, current) {
        var distance = previous - current;

        if (Math.abs(distance) > this._getMax() / 2) {
            distance = this._getMax() - Number(current) + Number(previous);
        }
        if (Math.abs(distance) > this._getMax() / 2) {
            distance = Number(previous) - Number(current) - this._getMax();
        }

        return distance;
    };

    /**
     * Get circle width.
     *
     * @function _getCircleWidth
     * @private
     * @returns {integer} Circle width.
     */
    CarouselCircular.prototype._getCircleWidth = function() {
        return parseInt(getComputedStyle(this.$circle[0], null).getPropertyValue('width'));
    };

    /**
     * Set carousel rotation.
     *
     * @function _setCarouselTransforms
     * @private
     * @param   {integer} previous - Previous element width.
     * @returns {void}
     */
    CarouselCircular.prototype._setCarouselTransforms = function(previous) {
        var angle = 360 / this._getMax();
        var distance = this._getDistance(previous, this.getCurrent());
        var beforeRotate = this.rotateNight;

        this.rotateDay = beforeRotate + (distance * (angle / 2));
        this.rotateNight = this.rotateDay;

        this.$circle.css({
            '-webkit-transform': 'rotate(' + this.rotateDay + 'deg)',
            '-moz-transform': 'rotate(' + this.rotateDay + 'deg)',
            '-ms-transform': 'rotate(' + this.rotateDay + 'deg)',
            '-o-transform': 'rotate(' + this.rotateDay + 'deg)',
            transform: 'rotate(' + this.rotateDay + 'deg)'
        });
    };

    /**
     * Set transforms for one anchor.
     *
     * @function _setAnchorTransforms
     * @private
     * @param   {integer} previous - Previous element width.
     * @param   {integer} index - Index.
     * @param   {HTMLElement} target - Target element.
     * @returns {void}
     */
    CarouselCircular.prototype._setAnchorTransforms = function(previous, index, target) {
        var self = $(target);
        var current = this.getCurrent();
        var translate = this._getCircleWidth() / 2;
        var angle = 360 / this._getMax();
        var rotateCont = this.rotateDay;
        var distance = this._getDistance(previous, current);
        var d = Math.abs(distance);
        var sign = Math.sign(distance);
        var id = Number(self.data('id'));
        var rotate = (id - 1) * angle;
        var match = current - (Math.floor(this._getMax() / 2) * sign);
        var m;
        var array = [];
        var j;
        var hasActiveClass = self.hasClass('carousel--circular__anchor--current');

        if (!self.data('rotate')) {
            if (id > 1 + this._getMax() / 2) {
                rotate = (rotate / 2) + 180;
            } else {
                rotate = (id - 1) * (angle / 2);
            }
            self.data('rotate', rotate);
        }
        rotate = Number(self.data('rotate'));
        if (distance < 0) {
            if (match > this._getMax()) {
                match -= this._getMax();
            }

            for (j = 1; j <= d; j++) {
                m = match;
                array.push(m);
                match--;
                if (match < 1) {
                    match = this._getMax();
                }
            }
        } else {
            if (match < this._getMin()) {
                match += this._getMax();
            }

            for (j = 1; j <= d; j++) {
                m = match;
                array.push(m);
                match++;
                if (match > this._getMax()) {
                    match = this._getMin();
                }
            }
        }

        if ($.inArray(id, array) >= 0) {
            rotate += 180 * sign;
        }

        self.data('rotate', rotate);
        var rotateBack = 0 - rotate - rotateCont;

        var scale = hasActiveClass ? 1 : 0.5;

        self.css({
            '-webkit-transform': 'rotate(' + rotate + 'deg) translateY(-' + translate + 'px) rotate(' + rotateBack + 'deg) scale(' + scale + ')',
            '-moz-transform': 'rotate(' + rotate + 'deg) translateY(-' + translate + 'px) rotate(' + rotateBack + 'deg) scale(' + scale + ')',
            '-ms-transform': 'rotate(' + rotate + 'deg) translateY(-' + translate + 'px) rotate(' + rotateBack + 'deg) scale(' + scale + ')',
            '-o-transform': 'rotate(' + rotate + 'deg) translateY(-' + translate + 'px) rotate(' + rotateBack + 'deg) scale(' + scale + ')',
            transform: 'rotate(' + rotate + 'deg) translateY(-' + translate + 'px) rotate(' + rotateBack + 'deg) scale(' + scale + ')'
        });
        
    };

    /**
     * Initialize slick plugin.
     *
     * @function destroy
     * @returns {void}
     */
    CarouselCircular.prototype.destroy = function() {
        this._unsetHTML();
        this.$circle.off('click.carouselCircular');
        this.$element.off('click.carouselCircular');
        this.$element.off('click.carouselCircular');
        this.$element.off('click.carouselCircular');
        $(window).off('resize.carouselCircular');
        this.$element.removeData('plugin_' + pluginName);
    };

    /**
     * Create jQuery plugin.
     *
     * @param {Object} options - Extended options.
     * @listens carouselCircular
     * @returns {Array<CarouselCircular>} Array of CarouselCirculars.
     */
    $.fn[pluginName] = function(options) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function() {
            var instance = $.data(this, 'plugin_' + pluginName);

            if (!instance) {
                if (options === 'destroy') {
                    return;
                }

                $.data(this, 'plugin_' + pluginName, new CarouselCircular(this, options));
            } else if (typeof options === 'string') {
                instance[options].apply(instance, args);
            }
        });
    };

    /**
     * @param {Event} event
     * @event enhance.carouselCircular
     */
    $(document).on('enhance.carouselCircular', function(event) {
        $(event.target).find(initSelector).addBack(initSelector)[pluginName]();
    });

    /**
     * @param {Event} event
     * @event destroy.carouselCircular
     */
    $(document).on('destroy.carouselCircular', function(event) {
        $(event.target).find(initSelector).addBack(initSelector)[pluginName]('destroy');
    });
})(jQuery, window, document);

/**
 * Auto-init the plugin on DOM ready.
 * @fires enhance.carouselCircular
 */
$(function() {
    $(document).trigger('enhance.carouselCircular');
});

// secpond carousel
var flipContainer = $('.flipster'),
    flipItemContainer = flipContainer.find('.flip-items'),
    flipItem = flipContainer.find('li');

flipContainer.flipster({
    itemContainer: flipItemContainer,
    itemSelector: flipItem,
    loop: 2,
    start: 2,
    style: 'infinite-carousel',
    spacing: 0,
    scrollwheel: false,
    //nav: 'after',
    buttons: false
});
