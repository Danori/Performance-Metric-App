# Performance Metrics App

The application has a few dependencies or order to get working:

Emotiv App: https://www.emotiv.com/emotiv-bci/

node.js:    https://nodejs.org/en/

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
