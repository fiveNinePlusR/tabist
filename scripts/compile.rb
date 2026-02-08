#! /usr/bin/env ruby

require 'erb'
require 'rubyshell'

def clean_and_make_dirs
 ["dist", "dist-firefox", "dist-chrome"].each do |dir|
    if Dir.exist?(dir)
      # ask "destroy '#{dir}'?"
      trash dir
    end

    # ask "make '#{dir}'?"
    mkdir dir
  end
end

def compile_js
  npm("run", "dev:compile")
end

def compile_erb
  template = File.read("./src/manifest/manifest.json.erb");
  renderer = ERB.new(template)

  is_firefox = true
  File.write('./dist-firefox/manifest.json', renderer.result(binding))

  is_firefox = false
  File.write('./dist-chrome/manifest.json', renderer.result(binding))
end

def do_copy
  ["./dist-firefox", "./dist-chrome"].each do |basepath|
    cp("-r", "tabist/*", "#{basepath}/");

    cp("src/js/lib/utils.js", "#{basepath}/lib/js/utils.js");
    cp("src/js/background.js", "#{basepath}/lib/js/background.js");
    cp("dist/tabs.js", "#{basepath}/tabs.js");
    cp("dist/options.js", "#{basepath}/options.js");
    cp("dist/tabs.css", "#{basepath}/tabs.css");
  end
end


def ask(prompt)
  loop do
    puts prompt
    yesno = gets.chomp
    if ["y", "ye", "yes", ""].include? yesno.downcase
      puts "yes"
      return
    elsif ["n", "no"].include? yesno.downcase
      puts "no"
      exit(1)
    end
  end
end

sh do
 clean_and_make_dirs
 compile_erb
 compile_js
 do_copy
end