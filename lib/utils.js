/**
 * Utility functions here.
 *
 * @author Sandeep Prasad <s3g007@gmail.com>
 *
 */

var Q = require('q');

/**
 * The extract data function is used to strip out any functions within an object
 * and return all the non-function types within it.
 *
 * This function is recursive in that it will traverse till the depth of the object
 * to process the values.
 */
var extractData = function(value) {
    var result = {};

    for(var key in value) {
        if(typeof value[key] === 'object' && value[key].constructor === Object) {
            var middle = extractData(value[key]);

            if(Object.keys(middle).length !== 0) {
                result[key] = middle;
            }
        } else if(typeof value[key] !== 'function') {
            result[key] = value[key];
        } else {
            // Do nothing.
        }
    }

    return result;
};

/**
 * Function to return a pure promise. Due to the nature of this project, it is
 * necessary to wrap synchronous calls in a promise just so that the consumer of the
 * code does not assume it to be synchronous for that one case and asynchronous for
 * other cases, which can cause a lot of confusion.
 */
var pure = function(value, fail, timeout) {
    var deferred = Q.defer();

    // Simulating a delay. Making it look like a real promise.
    setTimeout(function() {
        if(!fail) {
            deferred.resolve(value);
        } else {
            deferred.reject(value);
        }
    }, timeout || 4);

    return deferred.promise;
};

// Export the utility functions.
module.exports = {
    pure: pure,
    extractData: extractData
};
