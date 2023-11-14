
export default function trimUp(path) {
	if (!path || typeof path !== 'string') {
		return path
	}
	path = path.trim()
	while (path.startsWith('/')) {
		path = path.substring(1)
	}
	while (path.endsWith('/')) {
		path = path.slice(0, -1)
	}
	return (path)
}
