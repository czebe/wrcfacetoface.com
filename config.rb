
set :css_dir, '/css'
set :js_dir, '/js'
set :images_dir, '/i'

ignore "/i/sprites/*"
ignore "/scss/*"
ignore "/race-photos/*"
ignore "_backup/*"
#ignore "_original/*"

configure :build do
	#activate :minify_html
	ignore "/js/*"
end