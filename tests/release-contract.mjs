import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [manifest, packageText, lockText, readme, changelog, installGuide, workflow, buildScript] = await Promise.all([
  read('AndroidManifest.xml'),
  read('package.json'),
  read('package-lock.json'),
  read('README.md'),
  read('CHANGELOG.md'),
  read('docs/INSTALL.md'),
  read('.github/workflows/release.yml'),
  read('build.sh')
]);

const pkg = JSON.parse(packageText);
const lock = JSON.parse(lockText);
const version = pkg.version;
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};

check(/^\d+\.\d+\.\d+$/.test(version), 'package version must be semantic');
check(lock.version === version && lock.packages[''].version === version, 'package-lock version differs from package.json');
check(manifest.includes(`android:versionName="${version}"`), 'manifest versionName differs from package.json');
check(/android:versionCode="\d+"/.test(manifest), 'manifest versionCode is missing');
check(manifest.includes('android.intent.category.LAUNCHER'), 'manifest must remain launchable');
check(!manifest.includes('android.intent.category.HOME'), 'application must not claim the Android Home role');
check(readme.includes(`TTRPG Control Deck ${version}`), 'README version is stale');
check(changelog.includes(`## ${version} —`), 'dated changelog entry is missing');
check(readme.includes('releases/latest/download/TTRPG-Control-Deck.apk'), 'README lacks the direct APK download');
check(installGuide.includes('TTRPG-Control-Deck.apk.sha256'), 'installation guide lacks checksum verification');
check(installGuide.includes('adb install -r TTRPG-Control-Deck.apk'), 'installation guide lacks the upgrade-safe install command');
check(workflow.includes('ANDROID_SIGNING_KEY_BASE64'), 'release workflow lacks protected signing-key input');
check(workflow.includes('gh release create'), 'release workflow lacks publication step');
check(buildScript.includes('GMDECK_KEYSTORE'), 'build script lacks configurable signing-key support');
await read(`docs/RELEASE-NOTES-${version}.md`);

console.log(JSON.stringify({ version, releaseContract: 'passed' }, null, 2));
