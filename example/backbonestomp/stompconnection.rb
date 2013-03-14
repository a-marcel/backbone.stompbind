# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

require 'logger'
require 'eventmachine'
require 'json'

module BackboneStomp
  class StompConnection < EventMachine::Connection
    include EM::Protocols::Stomp

    TOPIC_PREFIX = "/topic/backbonestomp"
    PING_QUEUE = TOPIC_PREFIX + ".ping"
    PING_MSG = "ping"
    PING_PERIOD = 4*60

    def initialize(*args)
      super(*args)
      @conn_headers = (Hash === args.last) ? args.pop : {}
      @connected = false
      @data_received = []
      timer = EventMachine::PeriodicTimer.new(PING_PERIOD) do
        if @connected
          send(PING_QUEUE, PING_MSG)
        end
      end
      @todos = Hash.new
      @todos_serial = 0
      @logger = Logger.new STDOUT
    end

    def post_init
      @logger.debug("#{self} post_init done")
    end

    def connection_completed
      connect @conn_headers
      @logger.debug("#{self} connection_completed done")
    end

    def delete(id)
      @logger.info("deleting #{id}")
      if @todos.has_key?(id)
        @logger.info("found id #{id}")
      @todos.delete(id)
      else
        @logger.warn("could not find #{id}")
      end
    end

    def update(j, id)
      for item in j
        item.delete('id')
        @logger.info("updating #{id}")
        if @todos.has_key?(id)
          @todos[id].merge!(item)
        end
      end
    end

    def read(msg)
      reply = Array.new
      for todo in @todos.values
        reply.push(todo)
      end
      
      send(TOPIC_PREFIX + ".todos.create." + msg.header['clientId'], reply.to_json, { :fromServer => true })
    end

    def create(msg, j)
      if msg.header['fromServer'].nil?
        for item in j
          @logger.info("creating: #{item.inspect}")
          newId = @todos_serial=@todos_serial+1
          item['id'] = newId
          @todos[newId.to_s] = item
          send(TOPIC_PREFIX+".todos.create", j.to_json, { :fromServer => true })          
        end
      end
    end

    def dummy_item
      { :title => "dummyitem", :completed => false }.to_json
    end

    def receive_msg(msg)
      if msg.command == "CONNECTED"
        @logger.debug("#{self} received CONNECTED : #{msg.inspect}")
        @connected = true

        subscribe(TOPIC_PREFIX+".todos.>")
      elsif msg.command == "ERROR"
        @logger.error("There was an error from the STOMP broker.")
      @logger.error(msg)
      else
        @logger.info("got a message")
        j = JSON.parse(msg.body)
        if msg.header['destination'] == TOPIC_PREFIX+".todos.read"
          read(msg)
        elsif msg.header['destination'] == TOPIC_PREFIX+".todos.create"
          create(msg, j)
        elsif msg.header['destination'] =~ /\/topic\/backbonestomp.todos.(.+).delete/
          delete($1)
        elsif msg.header['destination'] =~ /\/topic\/backbonestomp.todos.(.+).update/
          update(j, $1)
        end

        @logger.debug("got a message: #{msg.inspect}")
      end
    end

    def subscribe(dest, ack=false)
      @logger.debug "#{self} subscribing to #{dest}"
      super(dest,ack)
    end

    def disconnect()
      send_data("DISCONNECT\n\n\x00")
    end

    def connected?
      @connected
    end
  end

end
