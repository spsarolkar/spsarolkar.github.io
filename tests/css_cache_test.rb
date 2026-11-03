require 'liquid'
require 'tmpdir'
require 'fileutils'
require_relative '../_plugins/cache-bust'

filter = Object.new.extend(Jekyll::CacheBust)
Dir.mktmpdir('portfolio-css-cache-') do |directory|
  Dir.chdir(directory) do
    FileUtils.mkdir_p(['_sass', 'assets/css'])
    File.write('_sass/_theme.scss', '$ink: #123;')
    File.write('assets/css/main.scss', '@import "theme";')
    original = filter.bust_css_cache('/assets/css/main.css')
    raise 'CSS URL must fingerprint the real Sass inputs' if original.end_with?(Digest::MD5.hexdigest(''))
    raise 'Unchanged inputs must have a stable CSS URL' unless original == filter.bust_css_cache('/assets/css/main.css')

    File.write('_sass/_theme.scss', '$ink: #456;')
    changed_theme = filter.bust_css_cache('/assets/css/main.css')
    raise 'Editing a theme partial must change the CSS URL' if original == changed_theme

    File.write('assets/css/main.scss', '@import "theme"; body { margin: 0; }')
    raise 'Editing the Sass entry point must change the CSS URL' if changed_theme == filter.bust_css_cache('/assets/css/main.css')
  end
end
puts 'CSS cache checks passed: real inputs, stable URL, partial and entry-point changes.'
