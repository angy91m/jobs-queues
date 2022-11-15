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
        this.started = false;
        this.pause = true;
        this.emitter = new EventEmitter();
        this.emitter.on( 'finished', async ( ...results ) => {
            if ( this.pause ) {
                this.pause = false;
            } else {
                if ( typeof this[1] === 'undefined' || this[1].index === 0 ) {
                    this[0].emitter.emit( 'end', ...results );
                }
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
                    async ( err ) => {
                        const em = this[0].emitter;
                        __empty.call( this );
                        em.emit( 'error', err );
                        this.pause = true;
                        if ( this.length ) {
                            this.emitter.emit( 'finished' );
                        }
                    },
                    ...results
                );
            } catch ( err ) {
                const em = this[0].emitter;
                __empty.call( this );
                em.emit( 'error', err );
                this.pause = true;
                if ( this.length ) {
                    this.emitter.emit( 'finished' );
                }
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
            const jobListEmitter = new EventEmitter();
            jobList = jobList.map( ( e, i ) => {
                return { job: e, index: i, emitter: jobListEmitter };
            } );
            super.push( ...jobList );
            this.emitter.emit( 'pushed' );
            return jobListEmitter;
        }
    }
    start() {
        if ( !this.started ) {
            this.started = true;
            if ( this.length ) this.emitter.emit( 'finished' );
        }
    }
};

const jobsQueues = ( started = true, ...jobList ) => {
    const queue = new JobsQueue();
    if ( jobList.length ) queue.push( ...jobList );
    if ( started ) queue.start();
    return queue;
}

module.exports = jobsQueues;