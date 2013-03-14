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

require 'thin'
require 'rack'

module BackboneStomp
    class HttpConnection
      attr_accessor :builder
      
      def initialize(wwwroot, port, serve = ["/images", "/js", "/css"])
        @port = port
        @builder = Rack::Builder.new do
          use Rack::CommonLogger
          use Rack::ShowExceptions
          use Rack::Static,
            :cache_control => 'no-cache, must-revalidate',
            :urls => serve,
            :root => wwwroot

          run lambda { |env|
            [
              200,
              {
                'Content-Type'  => 'text/html',
                'Cache-Control' => 'no-cache, must-revalidate'
              },
              File.open(File.join(wwwroot, 'index.html'), File::RDONLY)
            ]
          }
      end

      end

      def start()
        Rack::Handler::Thin.run(@builder, :port => @port)
      end
    end
  end
