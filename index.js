"use strict";
const { EventEmitter } = require( 'node:events' );
const __empty = function () {
    do {
        this.shift();
    } while ( this.length && this[0].index !== 0 );
    this.pause = true;
};
class JobsQueue extends Array {
    constructor( ...jobList ) {
        super( ...jobList );
        this.nextJobList = 0;
        this.started = false;
        this.pause = true;
        this.emitter = new EventEmitter();
        this.emitter.on( 'finished', async ( ...results ) => {
            try {
                if ( this.pause ) {
                    this.pause = false;
                } else {
                    this.shift();
                    if ( !this.length ) {
                        this.pause = true;
                        return;
                    }
                }
                if ( this[0].index === 0 ) results = [];
                await new Promise( r => setTimeout( r, 0 ) );
                try {
                    await this[0].job(
                        async ( ...newResults ) => { this.emitter.emit( 'finished', ...newResults ); },
                        async () => {
                            __empty.call( this );
                            this.emitter.emit( 'finished' );
                        },
                        ...results
                    );
                } catch ( err ) {
                    __empty.call( this );
                    for ( let i = 0; i < this.__errCallbacks.length; i++ ) {
                        try {
                            this.__errCallbacks[i]( err, { jobList: this[0].jobList, job: this[0].index } );
                        } catch ( err ) {
                            console.log( err );
                        }
                    }
                    if ( this.length ) {
                        this.pause = true;
                        this.emitter.emit( 'finished' );
                    }
                }
            } catch ( err ) {
                __empty.call( this );
                throw err;
            }
        } );
        this.emitter.on( 'pushed', () => {
            if ( this.pause && this.started ) {
                this.emitter.emit( 'finished' );
            }
        } );
    }
    push( ...jobList ) {
        if ( jobList.length ) {
            jobList = jobList.map( ( e, i ) => {
                return { job: e, index: i, jobList: this.nextJobList };
            } );
            super.push( ...jobList );
            this.emitter.emit( 'pushed' );
            return this.nextJobList++;
        }
    }
    start() {
        if ( !this.started ) {
            this.started = true;
            if ( this.length ) this.emitter.emit( 'finished' );
        }
    }
    onError( callback ) {
        if ( typeof this.__errCallbacks === 'undefined' ) this.__errCallbacks = [];
        this.__errCallbacks.push( callback );
    }
};

const jobsQueues = ( started = true, ...jobList ) => {
    const queue = new JobsQueue();
    if ( jobList.length ) queue.push( ...jobList );
    if ( started ) queue.start();
    return queue;
}

module.exports = jobsQueues;