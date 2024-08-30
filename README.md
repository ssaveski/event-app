# Events App

A React Native application using EXPO for managing events with Firebase integration, authorization, biometrics, email verification, async storage and a custom UI.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Setup](#setup)
- [Running the Application](#running-the-application)
- [Potential Improvements](#potential-improvements)

## Requirements

- **React Native**: Version `0.74.5`
- **Expo**: Version `~51.0.28`
- **TypeScript**: Version `^5.5.4`
- **Firebase**: Version `^10.13.0`
- **Node.js**: Recommended version `16.x` or `18.x`
- **npm**: Version `8.x` or higher

## Installation

1. **Clone the Repository**

   ```bash
   https://github.com/ssaveski/event-app.git
   cd events-app
   git checkout -b master

2. **Install dependencies**

   Make sure you have Node.js and npm installed. Then run:
   ```bash
   npm install

## Running the application

1. **Running the Application start the development server - You need emulator XCode setup**
   ```bash
   npx expo prebuild --clean
   npx expo run:ios

2. **Or you can start it using expoGo for quick start but than you won't be able to use the functionality to 
sync the Google Calendar as '@react-native-google-signin/google-signin' currently only
works using dev-client start**

3. **As we have separate firestore/events implementation you can also save the events only on
   using Android/IOS on the firestore without syncing it to Google Calendar**

4. **Tested on smaller devices with and without notches**

## Potential Improvements

1. To enable Google Calendar Sync on Android we just need to android specific google cloud configuration. 

