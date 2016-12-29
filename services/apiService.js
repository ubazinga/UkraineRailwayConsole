var Rx = require('rx');
var _ = require('lodash');
var request = require('request');
var querystring = require('querystring');

module.exports = (function() {
    function ApiService() {
        this.post = function(path, data, options) {
            var localOptions = {
                method: 'POST',
                form: data
            };

            return this.callApi(path, _.extend(options, localOptions))
        };

        this.get = function(path, data, options) {
            var localOptions = {
                method: 'GET',
                qs: data
            };

            return this.callApi(path, _.extend(options, localOptions))
        };

        this.callApi = function(path, options) {
            options = _.extend(options, {
                url: 'http://booking.uz.gov.ua/ru/mobile' + path,
            });

            return Rx.Observable.create(function (observer) {
                request(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        observer.onNext(JSON.parse(body));
                        observer.onCompleted();
                    }
                });
            });
        };
    }

    return new ApiService;
});

