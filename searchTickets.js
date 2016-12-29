#!/usr/bin/env nodejs

var Rx = require('rx');
var request = require('request');
var _ = require('lodash');
var moment = require('moment');
var colors = require('colors');
var readlineSync = require('readline-sync');
var ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser({
    version: '0.0.1',
    addHelp:true,
    description: 'Tickets finder booking.uz.gov.ua'
});

parser.addArgument([ '-f', '--from' ], {
    help: 'Dispatch station'
});
parser.addArgument([ '-t', '--to' ], {
    help: 'Arrival station'
});
parser.addArgument([ '-d', '--date' ], {
    help: 'Departure date',
});

var args = parser.parseArgs();

var tranisService = require('./services/trainsService')();
var wagonsService = require('./services/trainWagonsService')();
var stationService = require('./services/stationService')();

var travelFrom = args.from ? args.from : readlineSync.question('> Станция отправления: ');

Rx.Observable.create((observer) => {
    stationService.search(travelFrom).subscribe((stationsList) => {
        var index = (stationsList.length > 1)
            ? readlineSync.keyInSelect(_.values(_.mapValues(stationsList, (station) => station.label)), 'Выберите станцию отправления')
            : 0;

        var station = stationsList[index];

        observer.onNext(station);
        observer.onCompleted();
    });
}).subscribe((stationFrom) => {
    var travelTo  = args.to ? args.to : readlineSync.question('> Станция прибытия: ');

    Rx.Observable.create((observer) => {
        stationService.search(travelTo).subscribe((stationsList) => {
            var index = (stationsList.length > 1)
                        ? readlineSync.keyInSelect(_.values(_.mapValues(stationsList, (station) => station.label)), 'Выберите станцию прибытия')
                        : 0;

            var station = stationsList[index];

            observer.onNext(station);
            observer.onCompleted();
        });
    }).subscribe((stationTo) => {

        var travelDate = args.date ? args.date : readlineSync.question('> Дата отправления: ');

        var trainsNeeded = ['097К', '043К', '099К'],
            travelDateFormated = travelDate ? moment(travelDate, 'DD.MM.YYYY').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

        var trainsOptions = {
            date: travelDateFormated,
            from: stationFrom.value,
            time: '00:00',
            to: stationTo.value
        };

        console.info(colors.blue(`> Поиск мест со станции ${colors.bold(stationFrom.label)} до станции ${colors.bold(stationTo.label)} на ${colors.bold(travelDate)} число`));

        tranisService.search(trainsOptions).subscribe(function(findedTrains) {
            var trains = [];

            _.forEach(findedTrains, function(train) {
                // if(trainsNeeded.indexOf(train.num) >= 0) {
                //     trains.push(train);
                // }

                trains.push(train);
            });

            if(trains.length == 0) {
                console.info(colors.red('> Мест на эту дату нету.'));
            }

            _.forEach(trains, (train, index) => {
                wagonData = {
                    from: stationFrom.value,
                    to: stationTo.value,
                    train: train.num,
                    date: travelDateFormated,
                    model: 0
                };

                wagonsService.search(wagonData).subscribe(function(wagons) {
                    console.info(
                        colors.yellow(`  Поезд ${colors.bold(train.num)}, Дата отправления ${colors.bold(train.from.date)}, Дата прибытия ${colors.bold(train.to.date)}`)
                    );

                    _.forEach(wagons, (wagon) => {
                        console.info(`  • Тип вагона ${colors.bold(wagon.title)}, свободных мест ${colors.green.bold(wagon.free)}`)
                    });

                    if(index < trains.length-1) {
                        console.info('');
                    }
                });
            });
        });

    });
});