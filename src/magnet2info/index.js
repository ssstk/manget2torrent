const hat = require('hat')
const pws = require('./peer-wire-swarm')
const path = require('path')
const events = require('events')
const fs = require('fs')
const os = require('os')
const parseTorrent = require('parse-torrent')
var bncode = require('bncode')
var net = require('net');
const _ = require('lodash')

const DHT = require('bittorrent-dht')

var ut_metadata = require('./metadata')
var HANDSHAKE_TIMEOUT = 1000 * 10;

const DEFAULT_PORT = 6881

require('events').EventEmitter.prototype._maxListeners = 100

const getFileType = function(list) {

    let subList = _.filter(list, function(o) { return o.name.indexOf('请升级到BitComet') === -1 })
    let maxobj = _.maxBy(subList, 'length')
    let type = ''
    if(maxobj.name){
        type = maxobj.name.substring(maxobj.name.lastIndexOf('.') + 1)
    } 

    list = subList.map((item, index) => {
        return {
            name: item.name,
            size: item.length
        }
    })

    return { type, list }
};


const magnet2torrent = (infoHash, opts) => {
    return new Promise(function(resolve, reject) {
        var dht = new DHT()
        var connectTimeout;

        dht.listen(2000, () => {
            console.log('start')
        })
        if (!opts) opts = {}
        if (!opts.id) opts.id = '-TS0008-' + hat(48)
        if (!opts.name) opts.name = 'torrent-stream'
        if (!opts.flood) opts.flood = 0 // Pulse defaults:
        if (!opts.pulse) opts.pulse = Number.MAX_SAFE_INTEGER // Do not pulse
        var engine = new events.EventEmitter()
        engine.infoHash = infoHash
        engine.handshakeTimeout = HANDSHAKE_TIMEOUT
        var swarm = pws(infoHash, opts.id, { size: (opts.connections || opts.size), speed: 10, utp: false })
        // var torrentPath = path.join(opts.tmp, opts.name, infoHash + '.torrent')

        connectTimeout = setTimeout(function() {
            dht.destroy()
            swarm.destroy()
            reject({ info: 'timeout', infoHash })
        }, 3000);

        dht.on('peer', function(peer, infoHash, from) {
            swarm.add(peer.host + ':' + peer.port)
        })
        // find peers for the given torrent info hash
        dht.lookup(infoHash)

        var exchange = ut_metadata(engine, function(metadata) {
            clearTimeout(connectTimeout);
            var buf = bncode.encode({
                info: bncode.decode(metadata),
                'announce-list': []
            })
            var torrent = parseTorrent(buf)

            const {type, list} =  getFileType(torrent.files)
            let obj = {
                infohash: infoHash.toUpperCase(),
                name: torrent.name,
                type: type,
                subList: list,
                size: torrent.length,
            }
            dht.destroy()
            swarm.destroy()
            resolve(obj)
        })

        swarm.on('wire', function(wire) {
            exchange(wire)
            if (connectTimeout) {
                clearTimeout(connectTimeout);
            }
            connectTimeout = setTimeout(function() {
                dht.destroy()
                swarm.destroy()
                reject({ info: 'downtimeout', infoHash })
            }, 3000);
        });
    })

}

module.exports = magnet2torrent
