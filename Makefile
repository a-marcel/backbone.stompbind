
all:
	@node support/compile.js

serve:
	@cd example; bundle install; cd ..; ruby example/example.rb

.PHONY: all serve
