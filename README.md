Ginsberg.io Cordova App
=======================================

The Ginsberg Cordova App demonstrates the full life cycle of interacting with the Ginsberg.io SDK, with a cross platform easily updatable product. See [SDK](https://github.com/ProjectGinsberg/SDK) for more specific documentation on the SDKs usage. The end result is currently available online for [iOS](https://itunes.apple.com/app/id973390854) and [Android](https://play.google.com/store/apps/details?id=com.scotgov.ginsberg&hl=en_GB).

## Contents

- [Requirements](#requirements)
- [Implementation](#implementation)

## Requirements

### All Platforms
* [Cordova 4 or later](http://cordova.apache.org/docs/en/4.0.0//guide_cli_index.md.html#The%20Command-Line%20Interface)

### iOS
* Xcode 6 and iOS SDK 8 or later
* iOS 6.0+ device for deployment

### Android
* Android SDK 4.0 or later
* Android 4.0+ device for deployment

### Windows Universal
* Windows 8.1 SDK or later
* Windows 8.1+ Phone, or Windows 8.1+ Desktop for deployment

### BlackBerry
* BlackBerry10 10.0.0 SDK or later
* BlackBerry 10.0.0+ device for deployment

## Implementation
You will require your own `client_id` and `client_secret` values for the application. You can obtain these Ginsberg API credentials by visiting the [Applications page](https://platform.ginsberg.io/app) on the Ginsberg Developer site and logging in with your Ginsberg account. Register as a developer, if not done already, and select new app. The page will then show you the client_id and client_secret strings to embed into your application. The app also makes use of Localytics which you can enter the respective codes for if wish to use this services. All these values should replace the example ones stored in mobile-cordova-open\www\js\modules\services\platform-service.js.

Due to office network issues, and externally introduced bugs in a couple of the open source projects during development, we used local static copies of the native plugins. To switch back to the default online versions, copy the 'package-online.json' file over 'package.json' file before building.