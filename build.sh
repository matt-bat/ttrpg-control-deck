#!/usr/bin/env bash
set -euo pipefail

app_root="$(cd "$(dirname "$0")" && pwd)"
build_dir="$app_root/build"
android_jar="/usr/lib/android-sdk/platforms/android-23/android.jar"
key_store="${GMDECK_KEYSTORE:-$app_root/gmdeck-release.jks}"
key_alias="${GMDECK_KEY_ALIAS:-gmdeck}"
store_password="${GMDECK_STORE_PASSWORD:-gmdeck-local-key}"
key_password="${GMDECK_KEY_PASSWORD:-$store_password}"

mkdir -p "$build_dir/classes"
find "$build_dir/classes" -type f -delete

javac -source 8 -target 8 -bootclasspath "$android_jar" \
  -d "$build_dir/classes" \
  "$app_root/src/com/local/gmdeck/"*.java

dalvik-exchange --dex --output="$build_dir/classes.dex" "$build_dir/classes"

aapt package -f -M "$app_root/AndroidManifest.xml" -A "$app_root/assets" -S "$app_root/res" \
  -I "$android_jar" -F "$build_dir/gmdeck-unsigned.apk"

cd "$build_dir"
aapt add gmdeck-unsigned.apk classes.dex
zipalign -f 4 gmdeck-unsigned.apk gmdeck-aligned.apk

if [[ ! -f "$key_store" ]]; then
  keytool -genkeypair -noprompt -keystore "$key_store" -storepass "$store_password" \
    -keypass "$key_password" -alias "$key_alias" -keyalg RSA -keysize 2048 \
    -validity 9125 -dname "CN=Local TTRPG Control Deck, OU=Tabletop, O=Local, C=CA"
fi

apksigner sign --ks "$key_store" --ks-pass "pass:$store_password" \
  --key-pass "pass:$key_password" --ks-key-alias "$key_alias" \
  --out "$app_root/TTRPG-Control-Deck.apk" gmdeck-aligned.apk
apksigner verify --verbose --print-certs "$app_root/TTRPG-Control-Deck.apk"
