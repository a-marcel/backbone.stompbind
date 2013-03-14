# Backbone.stompBind

Backbone.stompBind allows you to bind stomp message events to backbone model & collection events.
Also includes `backbone.stompsync.js`, a drop in replacement for `Backbone.sync` that uses stomp.js.

This project (including this documentation) is just a few modifications on the excellent backbone.ioBind (for socket.io) by Jake Luer.

The example has been rewritten to use ruby on the server side instead of node.js.
Note that this example currently connects to an external broker which speaks STOMP over websocket, which is not included. I used ActiveMQ.

This is all quite experimental.

#### Quick Links


#### Dependencies

* [stomp.js](https://github.com/jmesnil/stomp-websocket/)
* [Backbone](http://documentcloud.github.com/backbone/)

### Usage

Download and include in your projects.

```html
<script src="/js/backbone.stompsync.js"></script>
<script src="/js/backbone.stompbind.js"></script>
```

Or use the minimized versions.

```html
<script src="/js/backbone.stompsync.min.js"></script>
<script src="/js/backbone.stompbind.min.js"></script>
```

### Where to Get Help

Please post issues to [GitHub Issues](https://github.com/ajf8/backbone.stompbind/issues).

## Using the Backbone.sync Replacement for stomp.js

The Backbone.sync replacement, `backbone.stompsync.js`, is a drop-in replacement for Backbone.sync that
will make Backbone use socket.io for all normal CRUD operations. By this, anytime you `save` a model,
`fetch` a collection, `remove` a model, or other database operation, STOMP will be used as the
transport.

### Namespaces / Urls / Topics

Backbone has a dedicated attribute, `urlRoot` for models, and `url` for collections, that is used
by the default sync method to direct AJAX request. stompSync uses this same attribute to build
the queue/topic names.

*For Example:* If your collection url is '/topic/yourapp.posts', the topics to subscribe to on the server-side will be:

* `/topic/yourapp.posts.create`
* `/topic/yourapp.posts.read`
* `/topic/yourapp.posts.update`
* `/topic/yourapp.posts.delete`

As with the default sync method, for a given model, stompSync will default to the `url` of the collection
that model is a part of, else it will use the models `urlRoot`.

Backbone.Model.prototype.url is overridden so that the '.' symbol is used to when constructing queue names
instead of '/'.

/topic/yourapp.model.create - Clients can send a JSON string containing an object.
Must be without an id attribute, the server will assign one.

The server will echo it back with an ID, which the client(s) will add to their collection.

Whenever a model.create topic is subscribed to, a private variant will also be subscribed to. This is because
a client will want to receive models for the first time, without them being sent to other clients.

The private topic is /topic/yourapp.model.create.<client ID>.

The client ID should be set as the clientId attribute on the STOMP client, which you must add. See the example.js.
All STOMP messages sent by stompSync send this as the 'clientId' header.

/topic/yourapp.model.read - Clients request models on this topic, replies will be sent on the private queue
determined by the clientId header.

## Using Backbone.stompBind for Custom Events

The primary function for Backbone.stompBind is to make it easy to create client-side listeners
for server-side STOMP messages. The most likely use case for this is to broadcast changes
made by one client to all other clients watching a particular data object.

The example app demonstrates a very basic usage scenario.

### stompBind

The stompBind function is available for both Models and Collections, and behaves almost identically in both scenarios

The primary difference between `stompBind` on Models and Collection is the event string that is listened for.
On models, the topic string includes the Model `id`, whereas on collection it is simply the collection namespace.

/topic/yourapp.model.<id>.delete
/topic/yourapp.model.<id>.update

### Usage Guidelines

*Model binding without ID:* Do NOT bind to Models that do NOT have an `id` assigned. This will cause for extra listeners
and cause potentially large memory leak problems. See the example app for one possible workaround.

*Namespace construction:* When constructing the namespace, as with the the stompSync method, for a given model stompBind
will default to the `url` of the collection that model is a part of, else it will use the models `urlRoot`.

*Reserved events:* Do NOT bind to reserved backbone events, such as `change`, `remove`, and `add`. Proxy these
events using different event tags such as `update`, `delete`, and `create`.

## Building

Clone this repo:

`$ git clone https://github.com/ajf8/backbone.stompbind`

Install development/build dependencies

`$ npm install`

Run make to build the library

`$ make`

Run make serve to bundle install the ruby dependencies for the example
application.

`$ make serve`

#### Example Tasks Application

There is an example application demonstrating the basics of using the
`stompSync` and `stompBind` components. It is a tasks application that will keep itself syncronized across all open
browser instances.

The app is found in the `example` folder.

## Other Frameworks

- [Backbone.realtimeBind](https://github.com/andreisebastianc/Backbone.js-Cometd-RealtimeBind) - ioBind for CometD by [@andreisebastianc](https://github.com/andreisebastianc/).

## Protip

Works great with the awesome [backbone.modelbinding](https://github.com/derickbailey/backbone.modelbinding).

## License

(The MIT License)

Copyright (c) 2011 Jake Luer <jake@alogicalparadox.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
