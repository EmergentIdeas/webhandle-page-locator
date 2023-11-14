
export default function reduceEntriesToNames(acc, child) {
	acc[child.name] = child
	return acc
}