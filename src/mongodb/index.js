'use strict'
const mongoose = require('mongoose')
const promise = mongoose.connect('127.0.0.1:27000')
const moment = require('moment')
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema

var MagnetSchema = new Schema({
  infohash: { type: String, required: true },
  name: String,
  type: String,
  size: {
    type: Number,
    default: 0
  },
  subList: [{
    _id: false,
    name: { type: String },
    size: { type: Number, default: 0 }
  }],
  hot: {
    type: Number,
    default: 1
  },
  hots: [{
    _id: false,
    date: { type: Date },
    // 热度值
    val: { type: Number, default: 1 }
  }],
  disable: { type: Boolean, default: false },
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

const date = (hots) => {
  let now = Date.now()
  if (moment.utc(now).isSame(hots[0].date, 'day')) {
    ++hots[0].val;
  } else {
    hots.unshift({ date: now, val: 1 });
  }

  for (var i = hots.length - 1; i >= 0; i--) {
    if (moment.utc(hots[i].date).isBefore(moment.utc().subtract(14, 'day'))) {
      hots.splice(i, 1);
    }
  }
  return hots
}


MagnetSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
    this.hots = [{
      date: Date.now(),
      val: 1
    }]
  } else {
    this.meta.updatedAt = Date.now()
    this.hot = this.hot + 1
    this.hots = date(this.hots)
  }

  next()
})


MagnetSchema = mongoose.model('Magnet', MagnetSchema)
module.exports = MagnetSchema