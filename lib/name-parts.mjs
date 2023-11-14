import trimUp from "./trim-up.mjs"
export default function nameParts(path) {
	path = trimUp(path)

	let parts = path.split('/')
	let name
	let parent
	if (parts.length > 1) {
		name = parts.pop()
		parent = parts.join('/')
	}
	else {
		parent = ''
		name = parts.join('/')
	}
	return [parent, name]

}