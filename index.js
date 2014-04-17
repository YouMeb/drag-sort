'use strict';

var prevent = require('prevent');
var Emitter = require('emitter');
var events = require('events');
var inlineStyle = require('inline-style');
var autoprefix = require('inline-style-auto-prefix');
var traverse = require('traverse');
var proto = Controller.prototype;

Emitter(proto);

module.exports = dragsort;

var defaultOptions = {
  handler: '.drag-sort-handler',
  item: '.drag-sort-item'
};

function dragsort(container, options) {
  return new Controller(container, options);
}

function Controller(container, options) {
  this.container = container;
  this.options = getOptions(options);
  this.events = events(container, this);
  this._start = false;
  this._target = null;
  this._startPosition = null;
  this.addHandlers();
}

proto.addHandlers = function () {
  var events = this.events;
  var options = this.options;
  events.bind('mousedown ' + options.handler, 'dragstart');
  events.bind('mousemove', 'drag');
  events.bind('mouseup', 'drop');
  events.bind('mouseleave', 'drop');
};

proto.dragstart = function (e) {
  prevent(e);
  
  var el = traverse('parentElement', e.target, this.options.item)[0];

  if (el) {
    if (!el._inlineStyle) {
      el._inlineStyle = inlineStyle(el);
      el._inlineStyle.use(autoprefix());
    }
    this._start = true;
    this._target = el;
    this._startPosition = {
      x: e.clientX,
      y: e.clientY
    };
  }
};

proto.drag = function (e) {
  if (this._start) {
    var pos = {
      x: e.clientX,
      y: e.clientY
    };

    var start = this._startPosition;
    var target = this._target;

    target._inlineStyle
      .set('transform', 'translate3d(0px, ' + (pos.y - start.y) + 'px, 0)')
      .render();
  }
};

proto.drop = function () {
  if (!this._start) {
    return;
  }

  this._start = false;

  var container = this.container;
  var items = container.querySelectorAll(this.options.item);
  var i = 0;
  var item, pos;
  var len = items.length;
  var target = this._target;
  var targetPos = target.getBoundingClientRect();
  var found = false;

  for (; i < len; i += 1) {
    item = items[i];
    pos = item.getBoundingClientRect();
    if (pos.top > targetPos.top) {
      found = true;
      break;
    }
  }

  if (found) {
    container.insertBefore(target, item);
  } else {
    container.appendChild(target);;
  }

  target._inlineStyle
    .set('transform', 'translate3d(0, 0, 0)')
    .render();

  this._target = null;
  
  items = container.querySelectorAll(this.options.item);
  
  this.emit('change', items);
};

function getOptions(options) {
  var prop;
  for (prop in defaultOptions) {
    if (defaultOptions.hasOwnProperty(prop) && !options.hasOwnProperty(prop)) {
      options[prop] = defaultOptions[prop];
    }
  }
  return options;
}
