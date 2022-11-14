"use strict";
const jobsQueues = require( './index' );
const queue = jobsQueues();
const jobList = queue.push(
    ( finish ) => {
        setTimeout( () => {
            console.log( 'First job finished' );
            finish( true, 'Hello world!' );
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
        finish( result );
    }
);
const jobList2 = queue.push(
    ( finish, empty ) => {
        finish( 'Another job list' );
    }
);

jobList.on( 'end', data => console.log( data ) );
jobList.on( 'error', err => console.log( err ) );
jobList2.on( 'end', data => console.log( data ) );
jobList2.on( 'error', err => console.log( err ) );