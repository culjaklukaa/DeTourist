# Offline Map Assets

Place your map fonts and sprites here. 

For full offline rendering, MapLibre requires fonts (glyphs) and icons (sprites) to be bundled with the application.

## Directory Structure
- `fonts/{fontstack}/{range}.pbf`
- `sprites/sprite.json`, `sprites/sprite.png`, `sprites/sprite@2x.json`, `sprites/sprite@2x.png`

## Expo Prebuild
To bundle these assets into the native Android and iOS apps, you will need to add an Expo Config Plugin to copy this `map-assets` directory into the native `android/app/src/main/assets/map-assets` and the iOS Xcode project's `Main.bundle` during `npx expo prebuild`. 

Then MapLibre will successfully resolve them using the `asset://map-assets/` URL scheme in the `styleJSON`.
