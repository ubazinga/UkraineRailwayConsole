var apiService = require('./apiService')();

module.exports = (function() {
    function TrainWagonsService() {
        this.search = function(term) {
            return apiService.get('/train_search/station/', {term: term}).map(function(response) {
                return response;
            });
        };
    }

    return new TrainWagonsService;
});