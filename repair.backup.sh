#! /bin/sh

# create by hetiulin

# crontab 定时任务同步更新
# 37 07 * * * sh repair.backup.sh >> logs/mylog.log 2>&1

node ./repair.js