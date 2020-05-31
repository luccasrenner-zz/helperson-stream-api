let _self;

class Camera {

    constructor( DOMMirror ) {
        this.DOMMirror = document.querySelector( DOMMirror );
        this.facingMode = "user"; // Can be 'user' or 'environment' to access back or front camera (NEAT!)
        this.constraints = {
            audio: true,
            video: {
                facingMode: this.facingMode,
                //width: { min: 10, ideal: 10, max: 10 },
                //height: { min: 10, ideal: 10, max: 10 }
                width: { max: 100 },
                height: { max: 100 },
                frameRate: { max: 14 },
            },
            
        };

        _self = this;

    }

    getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    getMyUser(){
        return this.getParameterByName('my');
    }
    getFriendUser(){
        return this.getParameterByName('FriendUser');
    }
    site_session() {
        return this.getParameterByName('session');
    }

    askForPermision() {
        const myUser =  this.getMyUser();
        const friendUser =  this.getFriendUser();
        const chat_session = this.site_session();

        navigator.mediaDevices.getUserMedia(this.constraints).then(function success(stream) {

            const userData = {
                userId : myUser,
                friendUser: friendUser,
                session: chat_session
            }

            _self.DOMMirror.srcObject = stream;
            _self.DOMMirror.muted = true;
            _self.DOMMirror.setAttribute('muted', true);
            
            const socket = io.connect( '/', {transports: ['websocket']} );


                var mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.onstart = function(e) { 
                    this.chunks = []; 
                };
                mediaRecorder.ondataavailable = function(e) { this.chunks.push(e.data); }
                mediaRecorder.onstop = function(e) {
                    var blob = new Blob(this.chunks, { 'type' : 'video/x-matroska;codecs=avc1' });
                    socket.emit('sendStream', blob);   
                };

                 // Start recording
                mediaRecorder.start();

                // Stop recording after 5 seconds and broadcast it to server
                setInterval(function() {
                    mediaRecorder.stop()
                    mediaRecorder.start()
                }, 6000);




//------------------------------------------------------------------------
//RESPONSE
socket.on('voice', function(arrayBuffer) {
    console.log(arrayBuffer[1])
    var blob = new Blob([arrayBuffer[0]], { 'type' : 'video/x-matroska;codecs=avc1' });
    var video = document.querySelector('#myMirror-1');
    video.src = window.URL.createObjectURL(blob);
    video.play();
});
















            function setStreamID( id ) {
                userData.sessionID = id;
                socket.emit('sessionJoin', userData);
            }


            _self.DOMMirror.onloadedmetadata = function(e) {
                // Ready to go. Do some stuff.
                setStreamID(stream.id)
                
            };

            //------------------------------------------------------------------------


            //Emit the user ID


        });

    }
    
}

export default Camera;
