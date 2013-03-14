/*!
 * backbone.iobind - Model
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Version
 */
Backbone.Model.prototype.stompBindVersion = '@VERSION';

/**
 * # .stompBind(event, callback, [context])
 *
 * Bind and handle trigger of socket.io events for models.
 *
 * ### Guidelines
 *
 * Do NOT bind to reserved backbone events, such as `change`, `remove`, and `add`.
 * Proxy these events using different event tags such as `update`, `delete`, and `create`.
 *
 * The socket.io socket must either exist at `window.socket`, `Backbone.socket`, or
 * `this.socket` or it must be passed as the second argument.
 *
 * ### Example
 *
 * * Model definition has url: `my_model`
 * * Model instance has id: `abc123`
 *
 * #### Create a new bind (client-side):
 *
 *     model.stompBind('update', window.io, this.updateView, this);
 *
 * #### Send socket.io message (server-side)
 *
 *     socket.emit( 'my_model/abc123:update', { title: 'My New Title' } );
 *
 * @name stompBind
 * @param {String} eventName
 * @param {Object} io from active socket.io connection (optional)
 * @param {Function} callback
 * @param {Object} context (optional) object to interpret as this on callback
 * @api public
 */

Backbone.Model.prototype.stompBind = function(eventName, stomp, callback, context) {
	var ioEvents = this._ioEvents || (this._ioEvents = {});
	var globalName = this.url() + '.' + eventName, self = this;
	if ('function' == typeof stomp) {
		context = callback;
		callback = stomp;
		stomp = this.stomp || window.stomp || Backbone.stomp;
	}
	var event = {
		name : eventName,
		global : globalName,
		cbLocal : callback,
		cbGlobal : function() {
			var args = [eventName];
			var responses = [];
			for (var i = 0; i < arguments.length; i++) {
				parsed = JSON.parse(arguments[i].body)
				if (parsed.id !== undefined) {
					responses.push(parsed);
				}
			}
			if (responses.length > 0) {
				args.push.apply(args, responses);
				self.trigger.apply(self, args);
			}
		}
	};
	this.bind(event.name, event.cbLocal, (context || self));
	event.subId = stomp.subscribe(event.global, $.proxy(event.cbGlobal, context || self));
	if (!ioEvents[event.name]) {
		ioEvents[event.name] = [event];
	} else {
		ioEvents[event.name].push(event);
	}
	return this;
};

/**
 * # .stompUnbind(event, [callback])
 *
 * Unbind model triggers and stop listening for server events for a specific
 * event and optional callback.
 *
 * The socket.io socket must either exist at `window.socket`, `Backbone.socket`,
 * or `this.socket` or it must be passed as the second argument.
 *
 * @name stompUnbind
 * @param {String} eventName
 * @param {Object} io from active socket.io connection
 * @param {Function} callback (optional) If not provided will remove all callbacks for eventname.
 * @api public
 */

Backbone.Model.prototype.url = function() {
	var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
	if (this.isNew())
		return base;
	return base + (base.charAt(base.length - 1) === '.' ? '' : '.') + encodeURIComponent(this.id);
};

Backbone.Model.prototype.stompUnbind = function(eventName, stomp, callback) {
	var ioEvents = this._ioEvents || (this._ioEvents = {});
	var globalName = this.url() + '.' + eventName;
	if ('function' == typeof stomp) {
		callback = stomp;
	}	
	stomp = stomp || this.stomp || window.stomp || Backbone.stomp;
	var events = ioEvents[eventName];
	if (!_.isEmpty(events)) {
		if (callback && 'function' === typeof callback) {
			for (var i = 0, l = events.length; i < l; i++) {
				if (callback == events[i].cbLocal) {
					this.unbind(events[i].name, events[i].cbLocal);
					stomp.unsubscribe(events[i].subId);
					events[i] = false;
				}
			}
			events = _.compact(events);
		} else {
			this.unbind(eventName);
			//stomp.unsubscribe(globalName)
			//io.removeAllListeners(globalName);
		}
		if (events.length === 0) {
			delete ioEvents[eventName];
		}
	}
	return this;
};

/**
 * # .stompUnbindAll()
 *
 * Unbind all callbacks and server listening events for the given model.
 *
 * The socket.io socket must either exist at `window.socket`, `Backbone.socket`,
 * or `this.socket` or it must be passed as the only argument.
 *
 * @name stompUnbindAll
 * @param {Object} io from active socket.io connection
 * @api public
 */

Backbone.Model.prototype.stompUnbindAll = function(stomp) {
	var ioEvents = this._ioEvents || (this._ioEvents = {});
	if (!stomp)
		stomp = this.stomp || window.stomp || Backbone.stomp;
	for (var evName in ioEvents) {
		var ev = ioEvents[evName];
		for (var i = 0; i < ev.length; i++) {
			var sub = ev[i];
			this.stompUnbind(evName, stomp, sub.cbLocal);
		}
	}
	return this;
};
