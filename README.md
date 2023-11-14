# @webhandle/page-locator


Finds "pages" within a directory by examining a url. A page is a template
and an optional metadata file which corresponds to a url. The template may
be selected in one of three ways.

1. The URL is exactly the name of the template. This would be a url like
`/products/my-cool-product.html` or `/products/my-cool-product.tri`. This method
finds the template and metadata but does NOT look for alternatives (more on 
that later).

2. The URL refers to a directory. This would be something like `/products`. In
this case the directory will be searched for the first file matching one of the
index bases names `this.indexNames` and having a valid extension
`this.templateExtensions`. The resulting template is likely to have a relative
path like `products/index.html`. Metadata and alternatives will be found.

3. The URL refers to a "page" but not a specific file (the typical case). This
would be a URL like `/products/my-cool-product`. Here the PageLocator trys to
find a matching file in the parent directory (`/products` in this example).
This file will be any file with the base name (like `my-cool-product`) and an
extension from `this.templateExtensions`. Metadata and alternatives will be found.  

Alternatives are alternate version of the page for different purposes or
environments. Common uses might be for a/b testing or for having the same "page"
available in different languages. Which alternative is actually used is up
to the calling component.


## Install

```bash
npm install @webhandle/page-locator
```


## Usage

```js
import FileSink from 'file-sink'
import PageLocator from '@webhandle/page-locator'

let sink = new FileSink('/path/to/page/data')
let locator = new PageLocator({
	sink
})


let info = await locator.locate('/')
// or
info = await locator.locate('/two.html')
// or
info = await locator.locate('/three/four')

```

`info` is a structure that looks like:

```js
{
	template: 'index.tri',
	alternatives: {
		en: {
			template: 'index_en.tri',
			metadata: 'index_en.json',
			metadataExists: false
		}
	},
	metadata: 'index.json',
	metadataExists: true
}	

```


## Options

```js
import FileSink from 'file-sink'
import PageLocator from '@webhandle/page-locator'

let sink = new FileSink('/path/to/page/data')
let locator = new PageLocator({
	sink: sink  					// A FileSink object
	, indexNames: ['index']			// basenames of directory index files
	, templateExtensions: ['tri', 'html']	// extensions for template files
})
