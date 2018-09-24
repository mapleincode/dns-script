'use strict';

const async = require('async');
const config = require('configw');
const DDns = require('wm-ddns');
const domain = new DDns(config.email, config.password, config.domain);

let list = [];
const records = config.records;

domain.recordList(function(err, _list) {
    if(err) {
        throw err;
    }

    for(const i of _list) {
        if(records.indexOf(i.name) > -1) {
            list.push(i);
        }
    }
});

setTimeout(() => {
    setInterval(() => {
        domain.getIP(function(err, ip) {
            if(err) {
                throw err;
            }
            async.eachSeries(list, function(q, callback) {
                if(q.value !== ip) {
                    console.log(`[${q.name}] SET IP: ${q.value}`);
                    q.setDns(ip, callback);
                } else {
                    console.log(`[${q.name}] IP: ${q.value}`);
                    return callback();
                }
            }, function(err) {
                if(err) {
                    throw err;
                }
            });
        });
        
    }, 10000)
}, 5000);
