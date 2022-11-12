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
queue.push(                                             //Push a job list
    ( finish ) => {
                                                        // Any job
        setTimeout( () => {
            console.log( 'First job finished' );
            finish( true, 'Hello world!' )              // At the end call finish() with your results
        }, 2500 );
    },

    ( finish, empty, ...results ) => {
                                                        // Another job
        if ( results[0] ) {
            finish( results[1] );                       // Call finish() with your result
        } else {                                        // OR
            empty();                                    // Stop this job list
        }
        console.log( 'Second job finished' );
    },
    async ( finish, empty, result ) => {
                                                        // Another job
        await new Promise( r => setTimeout( r, 500 ) );
        console.log( result );
        finish();                                       // Call finish()
    }
);
queue.push(
    ( finish ) => {
        console.log( 'Another job list' );
        finish();
    }
);

queue.onError( ( err, refs ) => {
    console.log( { err, refs } );
} );

```

## Constructor
```javascript
jobsQueues( started = true [, ...jobList: Function] );
```

#### Parameters

* `started` Default `true` - Set to `false` if you want to start your jobs later
* `jobList` Optional - Any function that accepts three parameters:
  * `finish` Required - A callback you have to call at the end of every job. It accepts `...results` and pass them to the next job in the same job list
  * `empty` Optional - A callback you have to call to stop the jobs in the same job list
  * `...results` Optional - Any result yo have passed in the `finish()` of the previous one job in the same job list

#### Return

A `JobsQueues` instance that extends `Array`

## Methods

### `push`
```javascript
queue.push( ...jobList );
```

#### Return

The index of the job list as `Integer`

### `start`
```javascript
queue.start();
```

### `onError`
```javascript
queue.onError( callback );
```

#### Parameters

* `callback` Required - A function that accepts `error` and `referements` of the interrupted job list index and job index (in the order you've pushed them)

## Note
A job list is not directly related with errors of another. It runs in anyway when the previous one exits.