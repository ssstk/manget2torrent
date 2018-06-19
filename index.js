'use strict'
const spider = new(require('./src/spider'))
const fs = require("fs")
const moment = require('moment')
const magnet2torrent = require('./src/magnet2info')
const Mongodb = require('./src/mongodb')

let infoHashArr = []

let SUCCESSTOTAL = 0
let TIMEOUTTOTAL = 0

const maxInfoHashLength = 5000
const minInfoHashLength = 1000

// 爬取磁力infohash
spider.on('ensureHash', (infoHash, addr) => {
    if (infoHashArr.indexOf(infoHash) !== -1) {
        return
    }
    infoHashArr.push(infoHash)
    if (infoHashArr.length > maxInfoHashLength) {
        spider.destroy()
        let joinInterval = setInterval(() => {
            if (infoHashArr.length < minInfoHashLength) {
                joinInterval && clearInterval(joinInterval)
                spider.listen()
            }
        }, 60000)

    }
})
spider.listen()

// 解析磁力infohash 并入库
const startParse = async function() {
    let infohash = infoHashArr.pop()
    if (!infohash) {
        setTimeout(function() {
            startParse()
        }, 1000);
        return
    }

    let res = await Mongodb.findOne({ infohash: infohash.toLocaleUpperCase() })

    if (res) {
        res = new Mongodb(res)
        res.save()
        process.nextTick(startParse);
        console.log('upd ------ secc ---- ' + infohash + ' ----' + SUCCESSTOTAL)

    } else {

        try {
            res = await magnet2torrent(infohash.toLowerCase())
            res = new Mongodb(res)
            res.save()
            SUCCESSTOTAL++
            console.log('m2t ------ secc ---- ' + infohash + ' ----' + SUCCESSTOTAL)
            // 所以以下代码不会被执行了

        } catch (err) {
            console.error(err)
            TIMEOUTTOTAL++
            console.error('timeout:%', TIMEOUTTOTAL)
        }

        process.nextTick(startParse);

    }

};


startParse()