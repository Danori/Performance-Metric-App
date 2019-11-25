const WebSocket = require('ws');

/**
 * - Cortex class to interface with the Emotiv Insight.
 */
class Cortex {
    constructor (user, socketUrl) {
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
        this.socket = new WebSocket(socketUrl);
        this.user = user;
        this.data = "";
    }

    /**
     * - Query the Emotiv App and retrieve the headset ID.
     */
    queryHeadsetId() {
        const QUERY_HEADSET_ID = 2;
        let socket = this.socket;
        let queryHeadsetRequest = {
            "jsonrpc": "2.0", 
            "id": QUERY_HEADSET_ID,
            "method": "queryHeadsets",
            "params": {}
        };

        return new Promise((resolve, reject) => {
            socket.send(JSON.stringify(queryHeadsetRequest));
            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id'] == QUERY_HEADSET_ID) {
                        if (JSON.parse(data)['result'].length > 0) {
                            let headsetId = JSON.parse(data)['result'][0]['id'];
                            resolve(headsetId);
                        }
                        else {
                            console.log('No headset connected to Emotiv Apps, please ensure headset is properly connected.');
                        }
                    }
                   
                } catch (error) { }
            });
        });
    }

    /**
     * - Request access for the cortex application using the user ID and secret.
     */
    requestAccess() {
        const REQUEST_ACCESS_ID = 1;
        let socket = this.socket;
        let user = this.user;
        let requestAccessRequest = {
            "jsonrpc": "2.0", 
            "method": "requestAccess", 
            "params": { 
                "clientId": user.clientId, 
                "clientSecret": user.clientSecret
            },
            "id": REQUEST_ACCESS_ID
        };

        return new Promise((resolve, reject) => {
            socket.send(JSON.stringify(requestAccessRequest));
            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id']==REQUEST_ACCESS_ID) {
                        resolve(data);
                    }
                } catch (error) { }
            });
        });
    }

    /**
     * - Authorize the user and retrieve the cortex token for the session.
     */
    authorize() {
        const AUTHORIZE_ID = 4;
        let socket = this.socket;
        let user = this.user;
        let authorizeRequest = { 
            "jsonrpc": "2.0", "method": "authorize", 
            "params": { 
                "clientId": user.clientId, 
                "clientSecret": user.clientSecret, 
                "license": user.license, 
                "debit": user.debit
            },
            "id": AUTHORIZE_ID
        };

        return new Promise((resolve, reject) => {
            socket.send(JSON.stringify(authorizeRequest));
            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id']==AUTHORIZE_ID) {
                        let cortexToken = JSON.parse(data)['result']['cortexToken'];
                        resolve(cortexToken);
                    }
                } catch (error) { }
            });
        });
    }

    /**
     * - Request control for the device to subscribe to data streams. 
     */
    controlDevice(headsetId) {
        const CONTROL_DEVICE_ID = 3;
        let socket = this.socket;
        let controlDeviceRequest = {
            "jsonrpc": "2.0",
            "id": CONTROL_DEVICE_ID,
            "method": "controlDevice",
            "params": {
                "command": "connect",
                "headset": headsetId
            }
        };

        return new Promise((resolve, reject) => {
            socket.send(JSON.stringify(controlDeviceRequest));
            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id']==CONTROL_DEVICE_ID) {
                        resolve(data);
                    }
                } catch (error) { }
            });
        });
    }

    /**
     * - Create a session to interface with the device.
     */
    createSession(authToken, headsetId) {
        const CREATE_SESSION_ID = 5;
        let socket = this.socket;
        let createSessionRequest = { 
            "jsonrpc": "2.0",
            "id": CREATE_SESSION_ID,
            "method": "createSession",
            "params": {
                "cortexToken": authToken,
                "headset": headsetId,
                "status": "active"
            }
        };

        return new Promise((resolve, reject) => {
            socket.send(JSON.stringify(createSessionRequest));
            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id']==CREATE_SESSION_ID) {
                        let sessionId = JSON.parse(data)['result']['id'];
                        resolve(sessionId);
                    }
                } catch (error) { }
            });
        });
    }

    /**
     * - Request for the passed data streams from the device.
     */
    subRequest(stream, authToken, sessionId) {
        const SUB_REQUEST_ID = 6;
        let socket = this.socket;
        let subRequest = { 
            "jsonrpc": "2.0", 
            "method": "subscribe", 
            "params": { 
                "cortexToken": authToken,
                "session": sessionId,
                "streams": stream
            }, 
            "id": SUB_REQUEST_ID
        };
        
        socket.send(JSON.stringify(subRequest));
        socket.on('message', (data) => {
            try {

            } catch (error) { }
        });
    }

    /**
     * - query headset information
     * - connect to headset with control device request
     * - authentication and get back auth token
     * - create session and get back session id
     */
    async querySessionInfo() {
        let headsetId = "";
        await this.queryHeadsetId().then((headset)=>{headsetId = headset});
        this.headsetId = headsetId;

        let ctResult = "";
        await this.controlDevice(headsetId).then((result)=>{ctResult=result});
        this.ctResult = ctResult;
        console.log(ctResult);

        let authToken = ""
        await this.authorize().then((auth)=>{authToken = auth});
        this.authToken = authToken;

        let sessionId = "";
        await this.createSession(authToken, headsetId).then((result)=>{sessionId=result});
        this.sessionId = sessionId;

        console.log('HEADSET ID -----------------------------------');
        console.log(this.headsetId);
        console.log('\r\n');
        console.log('CONNECT STATUS -------------------------------');
        console.log(this.ctResult);
        console.log('\r\n');
        console.log('AUTH TOKEN -----------------------------------');
        console.log(this.authToken);
        console.log('\r\n');
        console.log('SESSION ID -----------------------------------');
        console.log(this.sessionId);
        console.log('\r\n');
    }

    /**
     * - check if user logged in
     * - check if app is granted for access
     * - query session info to prepare for sub and train
     */
    async checkGrantAccessAndQuerySessionInfo() {
        let requestAccessResult = "";
        await this.requestAccess().then((result)=>{requestAccessResult=result});

        let accessGranted = JSON.parse(requestAccessResult);
    
        // check if user is logged in CortexUI
        if ("error" in accessGranted) {
            console.log('You must login on CortexUI before request for grant access then rerun');
            throw new Error('You must login on CortexUI before request for grant access');
        }
        else {
            console.log(accessGranted['result']['message']);
            if (accessGranted['result']['accessGranted']) {
                await this.querySessionInfo();
            }
            else {
                console.log('You must accept access request from this app on CortexUI then rerun');
                throw new Error('You must accept access request from this app on CortexUI');
            }
        }   
    }


    /**
     * - check login and grant access
     * - subscribe To the passed streams
     * - Send data to web app and log requests.
     */
    subscribe(streams) {
        this.socket.on('open', async () => {
            await this.checkGrantAccessAndQuerySessionInfo();
            this.subRequest(streams, this.authToken, this.sessionId);

            this.socket.on('message', (data) => {
                this.data = data;
            });

            wss.on('connection', (ws) => {
                ws.on('message', (message) => {
                    console.log("Received:", message);
                    ws.send(this.data);
                });
            });
        });
    }

    /**
     * - Set up user profile passed off all prior requests / validations.
     */
    setupProfile(authToken, headsetId, profileName, status) {
        const SETUP_PROFILE_ID = 7;
        let socket = this.socket;
        let setupProfileRequest = {
            "jsonrpc": "2.0",
            "method": "setupProfile",
            "params": {
              "cortexToken": authToken,
              "headset": headsetId,
              "profile": profileName,
              "status": status
            },
            "id": SETUP_PROFILE_ID
        };

        return new Promise((resolve, reject) => {
            socket.send(JSON.stringify(setupProfileRequest));
            socket.on('message', (data) => {
                if (status=='create') {
                    resolve(data);
                }
                try {
                    if (JSON.parse(data)['id']==SETUP_PROFILE_ID) {
                        if (JSON.parse(data)['result']['action'] == status) {
                            console.log('SETUP PROFILE -------------------------------------');
                            console.log(data);
                            console.log('\r\n');
                            resolve(data);
                        }
                    }
                } catch (error) { }
            });
        });
    }

    /**
     * 
     */
    queryProfileRequest(authToken) {
        const QUERY_PROFILE_ID = 9;
        let socket = this.socket;
        let queryProfileRequest = {
            "jsonrpc": "2.0",
            "method": "queryProfile",
            "params": {
              "cortexToken": authToken
            },
            "id": QUERY_PROFILE_ID
        };

        return new Promise((resolve, reject) => {
            socket.send(JSON.stringify(queryProfileRequest));
            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id']==QUERY_PROFILE_ID) {
                        resolve(data);
                    }
                } catch (error) { }
            });
        });
    }
}

// Define which streams to subscribe to.
const streams = ["pow"];
// Define the port.
const cortexSocketUrl = "wss://localhost:6868";
const user = {
    "license": "",
    "clientId": "", // Enter your client ID here.
    "clientSecret": "", // Enter you client secret here.
    "debit": 100
};

// Set up a websocket server on port 8080.
const wss = new WebSocket.Server({
    port: 8080
});

// Create a cortex interface object.
const cortex = new Cortex(user, cortexSocketUrl);
// Subscribe to the relevent streams.
cortex.subscribe(streams);
