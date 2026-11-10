/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {config: 'e2e/jest.config.js'},
    jest: {setupTimeout: 120000},
  },
  apps: {
    'android.debug': {
      type: 'android.apk',
      build: 'cd android && gradlew.bat assembleDebug assembleAndroidTest -DtestBuildType=debug',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
    },
  },
  devices: {
    emulator: {
      type: 'android.emulator',
      device: {avdName: process.env.DETOX_AVD_NAME || 'GPIS_API_35'},
    },
  },
  configurations: {
    'android.emu.debug': {device: 'emulator', app: 'android.debug'},
  },
};
