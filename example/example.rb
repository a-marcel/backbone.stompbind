#!/usr/bin/env ruby

$:.unshift File.dirname(__FILE__)

require 'rubygems'

require 'eventmachine'
require 'backbonestomp/stompconnection'
require 'backbonestomp/httpconnection'

include BackboneStomp

EventMachine.run {
  stomp = EventMachine.connect("localhost", 61613, StompConnection, :login => "backbonestomp", :passcode => "backbonestomp")
  http = HttpConnection.new(File.join(File.dirname(__FILE__), "public"), 1226)
  http.start()
}
