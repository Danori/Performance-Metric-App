# Performance Metrics App

Download the GitHub repository .zip above and extract it into a directory of your choosing. Open a terminal window and navigate to the respective directory.

The application has a few dependencies or order to get working:

Google Chrome: https://www.google.com/chrome/

Google chrome is the preferred web browser to run our web application.

An Emotiv Account: https://www.emotiv.com/my-account/

Create an Emotiv account, and login. Once logged in, navigate to the "Cortex Apps" tab, and register a new application. Be sure to write down or save your client ID and client secret, these will be required in order to properly interface with the Performance Metrics App, since we did not purchase a license for this application.

Emotiv App: https://www.emotiv.com/emotiv-bci/

Once the Emotiv applications are installed, there will be one named "Emotiv App". This will be used to interface with the Emotiv Insight device itself.

node.js: https://nodejs.org/en/

With node.js, you should also install the node package manager (npm). In the terminal, type the following command:

```
npm install ws
```

This will install the node websocket library used by the cortex application. Connect to your Emotiv Insight via the Emotiv App. The dongle should be connected and the device should appear under the "Devices" tab. At lines ~350 of the app.js source file, enter your cliend ID and secret in the specified entried of the user JSON. This will authorize you the use the application. Then, in the same directory as before, type the following:

```
node app
```

This will run the server which will communicate with the device. However, it will provide an error the first run, and will ask you to approve the PerformanceMetrics app. Navigate to the Emotiv app again and approve the cortex app. With the terminal selected and the app approved press ctrl+C to terminate the server process. Rerun:

```
node app
```

Note: Be sure to always have the server running before opening the html file, or you may encounter errors.

This time, the server should start successfully and provide you with a session ID. The app may require permission from your operating system to access a port, allow it. Open the html file provided in this repository, and you should be able to see you performance metrics in real time!
