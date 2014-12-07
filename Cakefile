fs = require 'fs'
{print} = require 'sys'
{spawn, exec} = require 'child_process'

build = (watch, callback) ->
	if typeof watch is 'function'
		callback = watch
		watch = false
	options = ['-c', '-j', 'javascripts/main.js', 'coffeescripts']
	if watch
		print 'start watching\n'
		options.unshift '-w'

	coffee = spawn 'coffee', options
	coffee.stdout.on 'data', (data) ->
		print data.toString()
		callback?()
	coffee.stderr.on 'data', (data) -> print data.toString()

reloadBlowser = () ->
	#print 'reloading blowser'
	exec "open ./index.html"
	exec "cp -r . ~/Dropbox/Public/tmp_project/"

task 'cbuild', 'observe code and reload blowser after compile', ->
  build true, reloadBlowser
