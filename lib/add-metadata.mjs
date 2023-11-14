import pathTools from "path"

export default function addMetadata(result, base, parentFilePath, namedSiblings) {
	let metaFile = namedSiblings[base + '.json']
	if (metaFile) {
		result.metadata = metaFile.relPath
		result.metadataExists = true
	}
	else {
		result.metadata = pathTools.join(parentFilePath, base + '.json')
		result.metadataExists = false
	}
	return result
}