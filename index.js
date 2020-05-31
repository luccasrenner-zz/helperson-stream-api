var express = require("express");
const cors = require('cors');
var app = express();

app.use(cors());

var server = app.listen(8768,'0.0.0.0',function(){
    console.log("App server up and running on %s and port %s",server.address().address ,server.address().port);
});


const io = require('socket.io')(server, { origins: '*:*'});

const activeUsers = {

}


io.on('connection', client => {

    client.on( 'sessionJoin', ( usersData ) => {
        
        const {
            userId,
            friendUser,
            sessionID,
            session
        } = usersData; 
    

        console.log('------------------------------------------')
        console.table(activeUsers[session])


        //Add activeUser to object
        if( activeUsers[session] ) {
            //console.table(activeUsers[session]['USERS'])
            if( activeUsers[session]['USERS'][1] == userId ) {
                activeUsers[session]['USERS'][1].push( client.id );
                console.log(  'SOY EL MEJOR CARAJO!!'  )
            }

            
        }else {
            activeUsers[session] = {
                'CHAT_SESSION' : session,
                'USERS' : [ 
                            [ userId, client.id ],
                            [ friendUser ]
                          ]
            }
        }
           

    } );


    client.on('sendStream', function(blob) {
        
        const objectKeys = Object.keys(activeUsers);
        objectKeys.forEach( sessions => {

            if(activeUsers[sessions]['USERS'][0][1] !== client.id) {
                io.to(
                    activeUsers[sessions]['USERS'][0][1]
                ).emit('voice', [ blob,client.id ])
            }else {
                io.to(
                    activeUsers[sessions]['USERS'][1][1]
                ).emit('voice', [ blob,client.id ])
            }

        } );    

        //client.emit('voice', [ blob,client.id ]);        
    });

    


    client.on('disconnect', ( e ) => { 
    
        if( e == "transport close" ) {
            /*
                const objectKeys = Object.keys(activeUsers);
                objectKeys.forEach( sessions => {
                    activeUsers[sessions]['USERS'] = activeUsers[sessions]['USERS'].filter( USERS => {
                        return USERS[1] != undefined;
                    } )
                });        
                console.log('user disconnected');
            */
        }//
        
        
    });

});
