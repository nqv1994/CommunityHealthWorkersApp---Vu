Community Health Workers Application
==========

The code is based on the Ionic Framework.

This repository is a fork of VolunteerManagementApp located [here](https://github.com/DataAnalyticsinStudentHands/VolunteerManagementApp).

###Development Prerequisites:

bower `npm install -g bower`

gulp `npm install -g gulp`

npm packages `npm install`


###Getting started:

1. Run `ionic serve`. This uses `ionic.xml` and will serve as local node server. Live updates when you make changes to the code. This works with Phonegap Developer App.

2. `phonegap serve`
Works both in browser and with the Phone Gap developer app. Also updates when you make changes.



##Required Cordova Plugins

cordova plugin add cordova-plugin-camera

cordova plugin add cordova-plugin-device

cordova plugin add cordova-plugin-file

cordova plugin add cordova-plugin-whitelist

cordova plugin add cordova-plugin-inappbrowser

###Starting Development:

1. Run `bower install`. Reads bower.json and installs local dependencies into the folder `www/bower_components`. ng-notify js has been modified and is in `dist/ngnotify`
2. Copy only necessary files to `www/dist` using the folder structure present in `www/bower_components`

###Changes after fork from VolunteerManagementApp
- Added Core Competencies
- Locations and Classes are newly added.
