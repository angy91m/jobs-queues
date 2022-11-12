"use strict";
const jobsQueues = require( './index' );
const queue = jobsQueues();
queue.push(
    ( finish ) => {
        setTimeout( () => {
            console.log( 'First job finished' );
            finish( true, 'Hello world!' )
        }, 2500 );
    },
    ( finish, empty, ...results ) => {
        if ( results[0] ) {
            finish( results[1] );
        } else {
            empty();
        }
        console.log( 'Second job finished' );
    },
    async ( finish, empty, result ) => {
        await new Promise( r => setTimeout( r, 0 ) );
        console.log( result );
        finish();
    }
);
queue.push(
    ( finish, empty ) => {
        console.log( 'Another job list' );
        finish();
    }
);

queue.onError( ( err, ref ) => {
    console.log( {err, ref} )
} )