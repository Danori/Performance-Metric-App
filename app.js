const WebSocket = require('ws');
const http = require('http');

/**
 * Cortex: Class
 */
class Cortex {
    constructor (user, socketUrl) {
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
        this.socket = new WebSocket(socketUrl)
        this.user = user
        this.data = ""
    }

    queryHeadsetId() {
        const QUERY_HEADSET_ID = 2
        let socket = this.socket
        let queryHeadsetRequest = {
            "jsonrpc": "2.0", 
            "id": QUERY_HEADSET_ID,
            "method": "queryHeadsets",
            "params": {}
        }

        return new Promise(function(resolve, reject) {
            socket.send(JSON.stringify(queryHeadsetRequest));
            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id'] == QUERY_HEADSET_ID) {
                        // console.log(data)
                        // console.log(JSON.parse(data)['result'].length)
                        if (JSON.parse(data)['result'].length > 0) {
                            let headsetId = JSON.parse(data)['result'][0]['id']
                            resolve(headsetId)
                        }
                        else {
                            console.log('No headset connected to Emotiv Apps, please ensure headset is properly connected.')
                        }
                    }
                   
                } catch (error) { }
            })
        })
    }

    requestAccess() {
        let socket = this.socket
        let user = this.user

        return new Promise(function(resolve, reject) {
            const REQUEST_ACCESS_ID = 1
            let requestAccessRequest = {
                "jsonrpc": "2.0", 
                "method": "requestAccess", 
                "params": { 
                    "clientId": user.clientId, 
                    "clientSecret": user.clientSecret
                },
                "id": REQUEST_ACCESS_ID
            }

            // console.log('start send request: ',requestAccessRequest)
            socket.send(JSON.stringify(requestAccessRequest));

            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id']==REQUEST_ACCESS_ID) {
                        resolve(data)
                    }
                } catch (error) { }
            })
        })
    }

    authorize() {
        let socket = this.socket
        let user = this.user

        return new Promise(function(resolve, reject) {
            const AUTHORIZE_ID = 4
            let authorizeRequest = { 
                "jsonrpc": "2.0", "method": "authorize", 
                "params": { 
                    "clientId": user.clientId, 
                    "clientSecret": user.clientSecret, 
                    "license": user.license, 
                    "debit": user.debit
                },
                "id": AUTHORIZE_ID
            }
            socket.send(JSON.stringify(authorizeRequest))
            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id']==AUTHORIZE_ID) {
                        let cortexToken = JSON.parse(data)['result']['cortexToken']
                        resolve(cortexToken)
                    }
                } catch (error) { }
            })
        })
    }

    controlDevice(headsetId) {
        let socket = this.socket
        const CONTROL_DEVICE_ID = 3
        let controlDeviceRequest = {
            "jsonrpc": "2.0",
            "id": CONTROL_DEVICE_ID,
            "method": "controlDevice",
            "params": {
                "command": "connect",
                "headset": headsetId
            }
        }

        return new Promise(function(resolve, reject) {
            socket.send(JSON.stringify(controlDeviceRequest));
            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id']==CONTROL_DEVICE_ID) {
                        resolve(data)
                    }
                } catch (error) { }
            })
        }) 
    }

    createSession(authToken, headsetId) {
        let socket = this.socket
        const CREATE_SESSION_ID = 5
        let createSessionRequest = { 
            "jsonrpc": "2.0",
            "id": CREATE_SESSION_ID,
            "method": "createSession",
            "params": {
                "cortexToken": authToken,
                "headset": headsetId,
                "status": "active"
            }
        }

        return new Promise(function(resolve, reject) {
            socket.send(JSON.stringify(createSessionRequest));
            socket.on('message', (data) => {
                // console.log(data)
                try {
                    if (JSON.parse(data)['id']==CREATE_SESSION_ID) {
                        let sessionId = JSON.parse(data)['result']['id']
                        resolve(sessionId)
                    }
                } catch (error) { }
            })
        })
    }

    startRecord(authToken, sessionId, recordName) {
        let socket = this.socket
        const CREATE_RECORD_REQUEST_ID = 11

        let createRecordRequest = {
            "jsonrpc": "2.0", 
            "method": "updateSession", 
            "params": {
                "cortexToken": authToken,
                "session": sessionId,
                "status": "startRecord",
                "title": recordName,
                "description":"test_marker",
                "groupName": "QA"
            }, 
            "id": CREATE_RECORD_REQUEST_ID
        }

        return new Promise(function(resolve, reject) {
            socket.send(JSON.stringify(createRecordRequest));
            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id']==CREATE_RECORD_REQUEST_ID) {
                        console.log('CREATE RECORD RESULT --------------------------------')
                        console.log(data)
                        resolve(data)
                    }
                } catch (error) { }
            })
        })
    }

    stopRecord(authToken, sessionId, recordName){
        let socket = this.socket
        const STOP_RECORD_REQUEST_ID = 12
        let stopRecordRequest = {
            "jsonrpc": "2.0", 
            "method": "updateSession", 
            "params": {
                "cortexToken": authToken,
                "session": sessionId,
                "status": "stopRecord",
                "title": recordName,
                "description":"test_marker",
                "groupName": "QA"
            }, 
            "id": STOP_RECORD_REQUEST_ID
        }

        return new Promise(function(resolve, reject){
            socket.send(JSON.stringify(stopRecordRequest));
            socket.on('message', (data)=>{
                try {
                    if(JSON.parse(data)['id']==STOP_RECORD_REQUEST_ID){
                        console.log('STOP RECORD RESULT --------------------------------')
                        console.log(data)
                        resolve(data)
                    }
                } catch (error) { }
            })
        })
    }

    subRequest(stream, authToken, sessionId){
        let socket = this.socket
        const SUB_REQUEST_ID = 6 
        let subRequest = { 
            "jsonrpc": "2.0", 
            "method": "subscribe", 
            "params": { 
                "cortexToken": authToken,
                "session": sessionId,
                "streams": stream
            }, 
            "id": SUB_REQUEST_ID
        }
        // console.log('sub eeg request: ', subRequest)
        socket.send(JSON.stringify(subRequest))
        socket.on('message', (data)=>{
            try {
                // if(JSON.parse(data)['id']==SUB_REQUEST_ID){
                //  console.log('SUB REQUEST RESULT --------------------------------')
                //  console.log(data)
                //  console.log('\r\n')
                // }
            } catch (error) { }
        })
    }

    /**
     * - query headset infor
     * - connect to headset with control device request
     * - authentication and get back auth token
     * - create session and get back session id
     */
    async querySessionInfo(){
        let headsetId=""
        await this.queryHeadsetId().then((headset)=>{headsetId = headset})
        this.headsetId = headsetId

        let ctResult=""
        await this.controlDevice(headsetId).then((result)=>{ctResult=result})
        this.ctResult = ctResult
        console.log(ctResult)

        let authToken=""
        await this.authorize().then((auth)=>{authToken = auth})
        this.authToken = authToken

        let sessionId = ""
        await this.createSession(authToken, headsetId).then((result)=>{sessionId=result})
        this.sessionId = sessionId

        console.log('HEADSET ID -----------------------------------')
        console.log(this.headsetId)
        console.log('\r\n')
        console.log('CONNECT STATUS -------------------------------')
        console.log(this.ctResult)
        console.log('\r\n')
        console.log('AUTH TOKEN -----------------------------------')
        console.log(this.authToken)
        console.log('\r\n')
        console.log('SESSION ID -----------------------------------')
        console.log(this.sessionId)
        console.log('\r\n')
    }

    /**
     * - check if user logined
     * - check if app is granted for access
     * - query session info to prepare for sub and train
     */
    async checkGrantAccessAndQuerySessionInfo(){
        let requestAccessResult = ""
        await this.requestAccess().then((result)=>{requestAccessResult=result})

        let accessGranted = JSON.parse(requestAccessResult)
    
        // check if user is logged in CortexUI
        if ("error" in accessGranted) {
            console.log('You must login on CortexUI before request for grant access then rerun')
            throw new Error('You must login on CortexUI before request for grant access')
        }
        else {
            console.log(accessGranted['result']['message'])
            // console.log(accessGranted['result'])
            if (accessGranted['result']['accessGranted']) {
                await this.querySessionInfo()
            }
            else {
                console.log('You must accept access request from this app on CortexUI then rerun')
                throw new Error('You must accept access request from this app on CortexUI')
            }
        }   
    }


    /**
     * 
     * - check login and grant access
     * - subcribe for stream
     * - logout data stream to console or file
     */
    subscribe(streams) {
        this.socket.on('open', async () => {
            await this.checkGrantAccessAndQuerySessionInfo()
            this.subRequest(streams, this.authToken, this.sessionId)

            this.socket.on('message', (data) => {
                this.data = data;
            });

            wss.on('connection', (ws) => {
                ws.on('message', (message) => {
                    console.log("Received:", message)
                });
                
                ws.send(this.data);
            });
        })
    }

    setupProfile(authToken, headsetId, profileName, status) {
        const SETUP_PROFILE_ID = 7
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
        }
        // console.log(setupProfileRequest)
        let socket = this.socket;
        return new Promise(function(resolve, reject) {
            socket.send(JSON.stringify(setupProfileRequest));
            socket.on('message', (data) => {
                if (status=='create') {
                    resolve(data)
                }
                try {
                    // console.log('inside setup profile', data)
                    if (JSON.parse(data)['id']==SETUP_PROFILE_ID) {
                        if (JSON.parse(data)['result']['action'] == status) {
                            console.log('SETUP PROFILE -------------------------------------')
                            console.log(data)
                            console.log('\r\n')
                            resolve(data)
                        }
                    }
                } catch (error) { }
            })
        })
    }

    queryProfileRequest(authToken) {
        const QUERY_PROFILE_ID = 9
        let queryProfileRequest = {
            "jsonrpc": "2.0",
            "method": "queryProfile",
            "params": {
              "cortexToken": authToken
            },
            "id": QUERY_PROFILE_ID
        }

        let socket = this.socket
        return new Promise(function(resolve, reject) {
            socket.send(JSON.stringify(queryProfileRequest))
            socket.on('message', (data) => {
                try {
                    if (JSON.parse(data)['id']==QUERY_PROFILE_ID) {
                        // console.log(data)
                        resolve(data)
                    }
                } catch (error) { }
            })
        })
    }
}

const streams = ["pow"];
const cortexSocketUrl = "wss://localhost:6868";
const user = {
    "license":"",
    "clientId":"epeHxh9VCDR3o6w6zCe7B0rsWvkzhXpvziV2FpH4",
    "clientSecret":"NO3fh9Z6Hb93M3eAodoifXicvK4mwyTT7fm5CaifRFFr8A7phFZtan9kmsfkNAXixizGOjtlXCv96k6ZA3VkKaJuhQDOLBbeWTo1ltKd1pBVIDgI1Luj6bYlynjGHf1f",
    "debit":100
};

const wss = new WebSocket.Server({
    port: 8080
});

const cortex = new Cortex(user, cortexSocketUrl);
cortex.subscribe(streams);
