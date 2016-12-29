var moment = require('moment');

var apiService = require('./apiService')();

module.exports = (function() {
    function TrainWagonsService() {
        this.search = function(data) {
            return apiService.post('/train_wagons/', data).map(function(response) {
                return response.data.wagons;
            });
        };
    }

    return new TrainWagonsService;
});