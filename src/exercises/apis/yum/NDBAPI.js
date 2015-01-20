// Instructions
// ============
//
// 1. Implement the NDBAPI.prototype._makeRequest function that will handle the functionality
//    common to all API requests. When you are ready, run checkMakeRequest() for feedback.
// 2. Implement NDBAPI.prototype.search. Run checkSearch() for feedback.
// 3. Implement NDBAPI.prototype.getReport. Run checkGetReport() for feedback.
//
// Hint: if you encounter errors during checking, run the checker function and then examine
//       the request parameters and response in the "Network" tab of your browser dev tools


/**
 * Creates a new NDB API binding using the specified API key
 */
function NDBAPI( apiKey ) {
    this.key = apiKey
    this.apiBaseUrl = 'https://api.data.gov/usda/ndb'
}

NDBAPI.prototype = {
    /**
     * Makes a GET request to the specified endpoint with the given parameters
     * Automatically adds API key and API base url
     * @param {String} endpoint the endpoint relative to the API base URL
     *  e.g. for search, endpoint would be /search
     * @param {Object} params request parameters as key: value pairs
     * @return {jqXHR} the jQuery XHR object representing the sent request
     */
    _makeRequest: function( endpoint, params ) {
        var reqUrl = this.apiBaseUrl + endpoint

        // add the API key to the request parameters
        params.api_key = this.key
        params.format = 'json'

        // your code here. Hint: try making an AJAX request
    },

    /**
     * Binding for the Search endpoint (http://ndb.nal.usda.gov/ndb/doc/apilist/API-SEARCH.md)
     * @param {String} terms - the search query string
     * @param {String} foodGroup - Optional. The desired food's group. Helps narrow down results.
     * @param {Number} pageNumber - Optional. The page number of the result set.
     * @param {Number} resultsPerPage - Optional. The number of the results per page.
     * @return {jqXHR} the jQuery XHR object representing this request
     */
    search: function( terms, foodGroup, pageNumber, resultsPerPage ) {
        var endpoint = '/search',
            offset = resultsPerPage * (pageNumber - 1) || 0, // default to zero using OR expression
            params = {
                q: terms
                // your code here
            }

        // your code here. Hint: try using the method you just made
    },

    /**
     * Binding for the Report endpoint (http://ndb.nal.usda.gov/ndb/doc/apilist/API-FOOD-REPORT.md)
     * Provides basic nutrition information suitable for nutrition facts display.
     * @param {String} ndbno - the NDB ID of the food item
     * @return {jqXHR} the jQuery XHR object representing this request
     */
    getReport: function( ndbno ) {
        // your code here
    }
}
