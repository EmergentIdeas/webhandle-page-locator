import allowedPath from "./allowed-path.mjs"
import pathTools from "path"
import reduceEntriesToNames from "./reduce-entries-to-names.mjs"
import removeExt from "./remove-ext.mjs"
import trimUp from "./trim-up.mjs"
import nameParts from "./name-parts.mjs"
import addMetadata from "./add-metadata.mjs"

/**
 * Finds "pages" within a directory by examining a url. A page is a template
 * and an optional metadata file which corresponds to a url. The template may
 * be selected in one of three ways.
 * 
 * 1. The URL is exactly the name of the template. This would be a url like
 * `/products/my-cool-product.html` or `/products/my-cool-product.tri`. This method
 * finds the template and metadata but does NOT look for alternatives (more on 
 * that later).
 * 
 * 2. The URL refers to a directory. This would be something like `/products`. In
 * this case the directory will be search for the first file matching one of the
 * index bases names `this.indexNames` and having a valid extension
 * `this.templateExtensions`. The resulting template is likely to have a relative
 * path like `products/index.html`. Metadata and alternatives will be found.
 * 
 * 3. The URL refers to a "page" but not a specific file (the typical case). This
 * would be a URL like `/products/my-cool-product`. Here the PageLocator trys to
 * find a matching file in the parent directory (`/products` in this example).
 * This file will be any file with the base name (like `my-cool-product`) and an
 * extension from `this.templateExtensions`. Metadata and alternatives will be found.  
 * 
 * Alternatives are alternate version of the page for different purposes or
 * environments. Common uses might be for a/b testing or for having the same "page"
 * available in different languages. Which alternative is actually used is up
 * to the calling component.
 * 
 */
export default class PageLocator {

	/**
	 * 
	 * @param {object} options PageLocator options 
	 * @param {FileSink} options.sink File sink for the pages directory
	 */
	constructor(options) {
		Object.assign(this, {
			indexNames: ['index']
			, templateExtensions: ['tri', 'html']
		}, options)

	}

	*candidateNamesGenerator(baseNames) {

		for (let name of baseNames) {
			for (let ext of this.templateExtensions) {
				yield `${name}.${ext}`
			}
		}
	}
	_getAltKey(fileName, base) {
		if (!fileName.startsWith(base + '_')) {
			return null
		}
		let name = removeExt(fileName)
		return name.substring(base.length + 1)
	}

	isTemplateFilename(name) {
		for (let ext of this.templateExtensions) {
			if (name.endsWith('.' + ext)) {
				return true
			}
		}
		return false
	}

	_addInformationForFound(found, namedSiblings) {
		let result = {
			template: namedSiblings[found].relPath
			, alternatives: {}
		}

		let [parentFilePath] = nameParts(result.template)
		let base = removeExt(found)
		let baseWithUnderscore = base + '_'

		addMetadata(result, base, parentFilePath, namedSiblings)

		// Get a list of all the alternate versions.
		// Alternates have the pattern basename_altkey.ext
		let alts = Array.from(new Set(
			Object.keys(namedSiblings)
				.filter(name => name.startsWith(baseWithUnderscore))
				.filter(this.isTemplateFilename.bind(this))
		))

		// Let's see if we can find any alternatives. These could be for a/b testing
		// or the same "page" in a different language.
		for (let altName of alts) {
			let altKey = this._getAltKey(altName, base)
			let alt = {
				template: namedSiblings[altName].relPath
			}
			result.alternatives[altKey] = alt
			addMetadata(alt, base + '_' + altKey, parentFilePath, namedSiblings)
		}

		return result
	}

	/**
	 * Gets the files representing a page for a given url. An error is thrown if no match can
	 * be found.
	 * @param {string} url The url of the page to locate
	 * @returns {object} Where the keys are `template` and `metadata` giving the
	 * relative paths of the template and metadata json files as well as an indication of 
	 * whether the metadata exists and if there are alternative versions of the page.
	 * 
	 * Ex:
	 * ```
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
	 */
	async locate(url) {
		url = trimUp(url)
		let p = new Promise(async (resolve, reject) => {
			let filePath = decodeURI(url)
			if (!allowedPath(filePath)) {
				return reject(401)
			}
			let info
			try {
				info = await this.sink.getFullFileInfo(filePath)
			}
			catch (e) { }

			if (info && !info.directory) {
				// we've got reference to a real file
				let [parentFilePath, fileName] = nameParts(filePath)
				let base = removeExt(fileName)

				let result = {
					template: info.relPath
				}
				try {
					let metaPath = pathTools.join(parentFilePath, base + '.json')
					result.metadata = metaPath
					await this.sink.getFullFileInfo(metaPath)
					result.metadataExists = true
				}
				catch (e) {
					// just means there's no metadata for this file
					result.metadataExists = false
				}
				resolve(result)
			}
			else {
				let parent
				let namesGen
				if (info) {
					// we must be referencing a directory
					parent = info
					namesGen = this.candidateNamesGenerator(this.indexNames)
				}
				else {
					// We've to a page path so we need to get the parent and its
					// children
					let [parentFilePath, fileName] = nameParts(filePath)
					try {
						parent = await this.sink.getFullFileInfo(parentFilePath)
					}
					catch (e) {
						return reject(404)
					}
					namesGen = this.candidateNamesGenerator([removeExt(fileName)])

				}
				let named = parent.children.reduce(reduceEntriesToNames, {})
				let names = Object.keys(named)
				let found

				for (let name of namesGen) {
					if (names.includes(name)) {
						found = name
						break
					}
				}
				if (!found) {
					return reject(404)
				}
				resolve(this._addInformationForFound(found, named))
			}
		})
		return p
	}
}






