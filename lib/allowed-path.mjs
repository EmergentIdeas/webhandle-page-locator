
export default function allowedPath(path) {
	if (path.indexOf('..') > -1) {
		return false
	}

	return true
}