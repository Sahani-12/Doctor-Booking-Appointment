<!-- src/
│
├── assets/                # Images, icons, logos
│
├── components/            # Reusable UI components (Buttons, Inputs, Dropdowns)
│   ├── common/            # Generic components used everywhere
│   ├── LoginSignup/       # Only Login/Signup specific UI
│   └── Layout/            # Navbar, Footer, Sidebar etc
│
├── pages/                 # Route level components
│   ├── Home.jsx
│   ├── DoctorSearch.jsx
│   ├── AppointmentSchedule.jsx
│   ├── UserDashboard.jsx
│   └── ...               
│
├── context/               # Context API Files (Global State)
│   ├── AuthContext.jsx
│   └── StateContext.jsx
│
├── constants/             # Static Data, Configs, Enums
│
├── services/              # API Calling functions (axios fetch calls)
│   └── userService.js
│
├── hooks/                 # Custom Hooks
│   └── useAuth.js
│
├── utils/                 # Helper functions, Formatters, Validators
│
├── App.jsx                # Root Component
├── main.jsx               # Entry Point
└── index.css              # Global CSS -->



<h1 align="center"> Medconnect Documentation</h1> <br>



<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Feedback](#feedback)
- [Contributors](#contributors)
- [Build Process](#build-process)
- [Backers](#backers-)
- [Sponsors](#sponsors-)
- [Acknowledgments](#acknowledgments)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introduction


Book appointments, consult doctors, and manage your health effortlessly — future updates will bring smart prescriptions, real-time chat, health records, and AI-powered recommendations, all in one secure platform.

## Upcomming features

* Search engine using machine learning.
* QR Code Scanner for individual Profiles.* Video, audio or live chat.
* Optimized backend with help of rate limitizer and kafka etc.
* Last seen profile feature.
* Location fetching to recommend nearest doctors.
* Notify me, when a specific doctor is available.
* Feedback enabling.
* Comment feature as feedback.
<!-- 

## Features

Upcomming Features: 

- A faster, more reliable backend powered by tools like Kafka and rate limiting
- Last seen profile feature.
- Location-based suggestions to help you find doctors nearby
- Notifications when your preferred doctor becomes available
- An intelligent search engine that learns and improves over time
- A QR code scanner to instantly view doctor profiles
- Support for video, audio, or live chat consultations
- A feedback system so you can share your experience after each appointment
- Commenting on feedback to add more context or start a conversation
 -->
<!-- 
<p align="center">
  <img src = "http://i.imgur.com/IkSnFRL.png" width=700>
</p>

<p align="center">
  <img src = "http://i.imgur.com/0iorG20.png" width=700>
</p>

## Feedback

Feel free to send us feedback on [Twitter](https://twitter.com/gitpointapp) or [file an issue](https://github.com/gitpoint/git-point/issues/new). Feature requests are always welcome. If you wish to contribute, please take a quick look at the [guidelines](./CONTRIBUTING.md)!

If there's anything you'd like to chat about, please feel free to join our [Gitter chat](https://gitter.im/git-point)!

## Contributors

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification and is brought to you by these [awesome contributors](./CONTRIBUTORS.md).

## Build Process

- Follow the [React Native Guide](https://facebook.github.io/react-native/docs/getting-started.html) for getting started building a project with native code. **A Mac is required if you wish to develop for iOS.**
- Clone or download the repo
- `yarn` to install dependencies
- `yarn run link` to link react-native dependencies
- `yarn start:ios` to start the packager and run the app in the iOS simulator (`yarn start:ios:logger` will boot the application with [redux-logger](<https://github.com/evgenyrodionov/redux-logger>))
- `yarn start:android` to start the packager and run the app in the the Android device/emulator (`yarn start:android:logger` will boot the application with [redux-logger](https://github.com/evgenyrodionov/redux-logger))

Please take a look at the [contributing guidelines](./CONTRIBUTING.md) for a detailed process on how to build your application as well as troubleshooting information.

**Development Keys**: The `CLIENT_ID` and `CLIENT_SECRET` in `api/index.js` are for development purposes and do not represent the actual application keys. Feel free to use them or use a new set of keys by creating an [OAuth application](https://github.com/settings/applications/new) of your own. Set the "Authorization callback URL" to `gitpoint://welcome`.

## Backers [![Backers on Open Collective](https://opencollective.com/git-point/backers/badge.svg)](#backers)

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/git-point#backer)]

<a href="https://opencollective.com/git-point#backers" target="_blank"><img src="https://opencollective.com/git-point/backers.svg?width=890"></a>

## Sponsors [![Sponsors on Open Collective](https://opencollective.com/git-point/sponsors/badge.svg)](#sponsors)

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/git-point#sponsor)]

<a href="https://opencollective.com/git-point/sponsor/0/website" target="_blank"><img src="https://opencollective.com/git-point/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/git-point/sponsor/1/website" target="_blank"><img src="https://opencollective.com/git-point/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/git-point/sponsor/2/website" target="_blank"><img src="https://opencollective.com/git-point/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/git-point/sponsor/3/website" target="_blank"><img src="https://opencollective.com/git-point/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/git-point/sponsor/4/website" target="_blank"><img src="https://opencollective.com/git-point/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/git-point/sponsor/5/website" target="_blank"><img src="https://opencollective.com/git-point/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/git-point/sponsor/6/website" target="_blank"><img src="https://opencollective.com/git-point/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/git-point/sponsor/7/website" target="_blank"><img src="https://opencollective.com/git-point/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/git-point/sponsor/8/website" target="_blank"><img src="https://opencollective.com/git-point/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/git-point/sponsor/9/website" target="_blank"><img src="https://opencollective.com/git-point/sponsor/9/avatar.svg"></a> -->


