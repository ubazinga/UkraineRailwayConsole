var moment = require('moment');

var apiService = require('./apiService')();

module.exports = (function() {
    function TrainsService() {
        this.search = function(data) {
            return apiService.post('/train_search/', data).map(function(response) {
                return response.data.list;
            });
        }
    }

    return new TrainsService;
});