# jobs-queues

Plugin that gives you sequential queues for your jobs as Array-like Objects in [Express](https://www.npmjs.com/package/express) style

## Installation

```bash
npm i jobs-queues
```

## Test
```bash
npm test
```

## Usage

```javascript
const jobsQueues = require( 'jobs-queues' );
const queue = jobsQueues();
const jobList = queue.push(                             //Push a job list and return emitter
                                                        // Any job
    ( finish ) => {
        setTimeout( () => {
            console.log( 'First job finished' );
            finish( true, 'Hello world!' );             // At the end call finish() 
        }, 2500 );
    },

    ( finish, empty, ...results ) => {
                                                        // Another job
        if ( results[0] ) {
            finish( results[1] );                       // Call finish() with your result
        } else {                                        // OR
            empty( new Error( 'Some message' ) );       // Stop this job list
        }
        console.log( 'Second job finished' );
    },
    async ( finish, empty, result ) => {
                                                        // Last job in the job list
        finish( result );                               // Call finish() and emit "end" passing result
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

```

## Constructor
```javascript
jobsQueues( started = true );
```

#### Parameters

`started` Default `true` - Set to `false` if you want to start your jobs later

#### Return

A `JobsQueues` instance that extends `Array`

## Methods

### `push`
```javascript
queue.push( ...jobList: Function );
```

#### Parameters

`jobList` Optional - Any function that accepts three parameters:
  * `finish` Required - A callback you have to call at the end of every job. It accepts `...results` and pass them to the next job in the same job list or to the `end` event of the job list emitter
  * `empty` Optional - A callback you have to call to stop all the jobs in the same job list and to emit an `error`
  * `...results` Optional - Any result yo have passed in the `finish()` of the previous one job in the same job list

#### Return

An emitter related to the job list that can emit:
* `end` If the last job in job list call `finish()`
* `error` If `empy()` was called or if an error occurs

### `start`
```javascript
queue.start();
```

## Note
A job list is not directly related with errors of another. It runs in anyway when the previous one exits.