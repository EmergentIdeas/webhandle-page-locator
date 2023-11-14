export default function removeExt(name) {
	let parts = name.split('.')
	if (parts.length > 1) {
		parts.pop()
	}

	return parts.join('.')
}