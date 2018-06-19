'use strict';

const fs = require('fs')
const path = require('path')
const filePath = path.join('last-repair-time.txt')
const elasticsearch = require('elasticsearch')
const Resource = require('./src/mongodb/product')
const moment = require('moment')
const config = require('./config')
const client = new elasticsearch.Client({
    host: config.elasticsearchHost,
    log: 'error'
})

const createTime = fs.readFileSync(filePath).toString()
var count = 0;

const run = async() => {
    console.log('start')

    if (!createTime) {
        const res = await Resource.find({}).sort({ 'm.createdAt': 1 }).select('_id name size type meta').limit(1).exec()
        try {

            const response = await client.bulk({
                index: 'antcolony',
                type: 'resource',
                body: formatData(res)
            })

            createTime = moment(res[0].meta.createdAt).valueOf()

            fs.writeFileSync(filePath, createTime);
        } catch (error) {
            console.log(error)
        }
    }

    try {

        const data = await Resource.find({ 'meta.createdAt': { $gt: createTime } }).sort({ 'meta.createdAt': 1 }).select('_id name size type meta').limit(10).exec()
        console.log(count, createTime)
        if (data.length <= 0) {
            console.log('Done!');
            fs.writeFileSync(filePath, createTime);
            return;
        }

        const response = await client.bulk({
            index: 'antcolony',
            type: 'resource',
            body: formatData(data)
        })

        count += 10;

        process.nextTick(run);
        createTime = moment(data[data.length - 1].meta.createdAt).valueOf()

        fs.writeFileSync(filePath, createTime);
    } catch (error) {
        console.log(error)
    }

}

function formatData(data) {
    var result = [];
    for (var i = 0, j = data.length; i < j; i++) {
        var item = data[i].toJSON();
        item.createdAt = item.meta.createdAt
        item.updatedAt = item.meta.updatedAt
        result.push({ create: { _id: item._id } });
        delete item._id;
        delete item.meta;
        result.push(item);
    }
    return result;
}

console.log('Running......');
run();