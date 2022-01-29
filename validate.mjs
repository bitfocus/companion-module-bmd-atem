// #!/usr/bin/env zx

import semver from 'semver'

if (process.env.GITHUB_REF_TYPE !== 'tag') {
	console.error(`Release can only be performed for tags`)
	process.exit(1)
}

const pkgJsonStr = await fs.readFile('./package.json')
const pkgJson = JSON.parse(pkgJsonStr)

const refName = process.env.GITHUB_REF_NAME

if (!semver.eq(pkgJson.version, refName)) {
	console.error(`Version in package does not match tag (Got "${pkgJson.version}", expected "${refName}")`)
	process.exit(1)
}

console.log('Looks OK to release')
