# Performance Metrics App

Download the GitHub repository .zip above and extract it into a directory of your choosing. Open a terminal window and navigate to the respective directory.

The application has a few dependencies or order to get working:

An Emotiv Account: https://www.emotiv.com/my-account/

Create an Emotiv account, and login. Once logged in, navigate to the "Cortex Apps" tab, and register a new application. Be sure to write down or save your client ID and client secret, these will be required in order to properly interface with the Performance Metrics App, since we did not purchase a license for this application.

Emotiv App: https://www.emotiv.com/emotiv-bci/

node.js: https://nodejs.org/en/

With node.js, you should also install the node package manager (npm). Navigate to the directory containing the GitHub clone, and type the following:

```
npm install ws
```


Connect your Emotiv Insight via the Emotiv App. The dongle should be connected and the device should appear under the "Devices" tab.
Then, in the same directory as before, type the following:

```
node app
```

This will run the server which will communicate with the device. However, it will provide an error the first run, and will ask you to approve the PerformanceMetrics app, navigate to the Emotiv app and approve the app. Rerun:

```
node app
```

Note: Be sure to always have the server running before opening the html file, or you may encounter errors.

This time, the server should start successfully and provide you with a session ID. The app may require permission from your operating system to access a port, allow it. Open the html file provided in this repository, and you should be able to see you performance metrics in real time! 
