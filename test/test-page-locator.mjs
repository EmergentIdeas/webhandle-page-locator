import mocha from "mocha";
import { assert } from 'chai'
import FileSink from 'file-sink'
import PageLocator from '../lib/page-locator.mjs'

let sink = new FileSink('./test-data')
let locator = new PageLocator({
	sink
})

describe("locating pages from various urls", function () {

	it("top level index", async function () {

		try {

			let info = await locator.locate('/')
			assert.equal(info.template, 'index.tri')
			assert.equal(info.metadata, 'index.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('')
			assert.equal(info.template, 'index.tri')
			assert.equal(info.metadata, 'index.json')
			assert.isTrue(info.metadataExists)
		}
		catch (e) {
			console.error(e)
		}
	})
	it("top level index, with alts", async function () {

		let info = await locator.locate('/')
		assert.equal(info.template, 'index.tri')
		assert.equal(info.metadata, 'index.json')
		assert.isTrue(info.metadataExists)

		assert.equal(info.alternatives['en'].template, 'index_en.tri')
		assert.equal(info.alternatives['en'].metadata, 'index_en.json')
		assert.equal(info.alternatives['en'].metadataExists, false)

	})

	it("directory level index", async function () {

		let info = await locator.locate('/three')
		assert.equal(info.template, 'three/index.tri')
		assert.equal(info.metadata, 'three/index.json')
		assert.isTrue(info.metadataExists)

		info = await locator.locate('three')
		assert.equal(info.template, 'three/index.tri')
		assert.equal(info.metadata, 'three/index.json')
		assert.isTrue(info.metadataExists)

		info = await locator.locate('/three/')
		assert.equal(info.template, 'three/index.tri')
		assert.equal(info.metadata, 'three/index.json')
		assert.isTrue(info.metadataExists)
	})
	it("directory level index, no metadata", async function () {

		let info = await locator.locate('/nine')
		assert.equal(info.template, 'nine/index.tri')
		assert.equal(info.metadata, 'nine/index.json')
		assert.isFalse(info.metadataExists)
		assert.equal(Object.keys(info.alternatives).length, 0)

	})

	it("directory level index html", async function () {

		let info = await locator.locate('/five')
		assert.equal(info.template, 'five/index.html')
		assert.equal(info.metadata, 'five/index.json')
		assert.isTrue(info.metadataExists)

		info = await locator.locate('five')
		assert.equal(info.template, 'five/index.html')
		assert.equal(info.metadata, 'five/index.json')
		assert.isTrue(info.metadataExists)

		info = await locator.locate('/five/')
		assert.equal(info.template, 'five/index.html')
		assert.equal(info.metadata, 'five/index.json')
		assert.isTrue(info.metadataExists)
	})

	it("empty directory index", async function () {
		let info
		try {
			info = await locator.locate('/six')
		}
		catch (e) {
			// this is good
		}

		// if we got a result that would be bad, since that directory has no index
		assert.isUndefined(info)
	})

	it("non-existant path", async function () {
		let info
		try {
			info = await locator.locate('/sixasldfkjaf')
		}
		catch (e) {
			// this is good
		}
		// if we got a result that would be bad, since that directory has no index
		assert.isUndefined(info)

		try {
			info = await locator.locate('sixasldfkjaf')
		}
		catch (e) {
			// this is good
		}
		assert.isUndefined(info)

		try {
			info = await locator.locate('sixasldfkjaf/alsdkfj/alsdkfj')
		}
		catch (e) {
			// this is good
		}
		assert.isUndefined(info)
	})
	it("top level page", async function () {

		try {
			let info = await locator.locate('/one')
			assert.equal(info.template, 'one.tri')
			assert.equal(info.metadata, 'one.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('/one/')
			assert.equal(info.template, 'one.tri')
			assert.equal(info.metadata, 'one.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('one')
			assert.equal(info.template, 'one.tri')
			assert.equal(info.metadata, 'one.json')
			assert.isTrue(info.metadataExists)

			assert.equal(info.alternatives['fr'].template, 'one_fr.html')
			assert.equal(info.alternatives['fr'].metadata, 'one_fr.json')
			assert.equal(info.alternatives['fr'].metadataExists, true)



		}
		catch (e) {
			console.error(e)
			throw e
		}

	})
	it("top level page - no metadata", async function () {

		try {
			let info = await locator.locate('/two')
			assert.equal(info.template, 'two.tri')
			assert.equal(info.metadata, 'two.json')
			assert.isFalse(info.metadataExists)

			info = await locator.locate('/two/')
			assert.equal(info.template, 'two.tri')
			assert.equal(info.metadata, 'two.json')
			assert.isFalse(info.metadataExists)

			info = await locator.locate('two')
			assert.equal(info.template, 'two.tri')
			assert.equal(info.metadata, 'two.json')
			assert.isFalse(info.metadataExists)

		}
		catch (e) {
			console.error(e)
			throw e
		}

	})
	it("sub level page", async function () {

		try {
			let info = await locator.locate('/three/four')
			assert.equal(info.template, 'three/four.tri')
			assert.equal(info.metadata, 'three/four.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('/three/four/')
			assert.equal(info.template, 'three/four.tri')
			assert.equal(info.metadata, 'three/four.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('three/four/')
			assert.equal(info.template, 'three/four.tri')
			assert.equal(info.metadata, 'three/four.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('three/four')
			assert.equal(info.template, 'three/four.tri')
			assert.equal(info.metadata, 'three/four.json')
			assert.isTrue(info.metadataExists)

			assert.equal(info.alternatives['de'].template, 'three/four_de.tri')
			assert.equal(info.alternatives['de'].metadata, 'three/four_de.json')
			assert.equal(info.alternatives['de'].metadataExists, false)
		}
		catch (e) {
			console.error(e)
			throw e
		}
	})
	it("sub level page html", async function () {

		try {
			let info = await locator.locate('/three/five')
			assert.equal(info.template, 'three/five.html')
			assert.equal(info.metadata, 'three/five.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('/three/five/')
			assert.equal(info.template, 'three/five.html')
			assert.equal(info.metadata, 'three/five.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('three/five/')
			assert.equal(info.template, 'three/five.html')
			assert.equal(info.metadata, 'three/five.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('three/five')
			assert.equal(info.template, 'three/five.html')
			assert.equal(info.metadata, 'three/five.json')
			assert.isTrue(info.metadataExists)
		}
		catch (e) {
			console.error(e)
			throw e
		}

	})

	it("sub sub level page", async function () {

		try {
			let info = await locator.locate('/three/seven/eight')
			assert.equal(info.template, 'three/seven/eight.tri')
			assert.equal(info.metadata, 'three/seven/eight.json')
			assert.isFalse(info.metadataExists)

			info = await locator.locate('/three/seven/eight/')
			assert.equal(info.template, 'three/seven/eight.tri')
			assert.equal(info.metadata, 'three/seven/eight.json')
			assert.isFalse(info.metadataExists)

			info = await locator.locate('three/seven/eight/')
			assert.equal(info.template, 'three/seven/eight.tri')
			assert.equal(info.metadata, 'three/seven/eight.json')
			assert.isFalse(info.metadataExists)

			info = await locator.locate('three/seven/eight')
			assert.equal(info.template, 'three/seven/eight.tri')
			assert.equal(info.metadata, 'three/seven/eight.json')
			assert.isFalse(info.metadataExists)
		}
		catch (e) {
			console.error(e)
			throw e
		}

	})

	it("top level file", async function () {

		try {
			let info = await locator.locate('/one.tri')
			assert.equal(info.template, 'one.tri')
			assert.equal(info.metadata, 'one.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('/one.tri/')
			assert.equal(info.template, 'one.tri')
			assert.equal(info.metadata, 'one.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('one.tri')
			assert.equal(info.template, 'one.tri')
			assert.equal(info.metadata, 'one.json')
			assert.isTrue(info.metadataExists)

		}
		catch (e) {
			console.error(e)
			throw e
		}

	})
	it("sub level file", async function () {

		try {
			let info = await locator.locate('/five/index.html')
			assert.equal(info.template, 'five/index.html')
			assert.equal(info.metadata, 'five/index.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('/five/index.html/')
			assert.equal(info.template, 'five/index.html')
			assert.equal(info.metadata, 'five/index.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('five/index.html/')
			assert.equal(info.template, 'five/index.html')
			assert.equal(info.metadata, 'five/index.json')
			assert.isTrue(info.metadataExists)

			info = await locator.locate('five/index.html/')
			assert.equal(info.template, 'five/index.html')
			assert.equal(info.metadata, 'five/index.json')
			assert.isTrue(info.metadataExists)


		}
		catch (e) {
			console.error(e)
			throw e
		}

	})
})
