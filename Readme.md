# AntColony部署文档
- [本地下载编译源码](#本地下载编译源码)
- [服务器环境安装](#服务器环境安装)
    - [服务器配置](#服务器配置)
    - [安装nodejs](#安装nodejs)
    - [安装pm2](#安装pm2)
    - [安装Mongodb](#安装Mongodb)
    - [部署AntColony](#部署AntColony)
- [运行](#运行)
    - [修改配置文件](#修改配置文件)
    - [启动](#启动)
- [问题](#问题)
    - [服务器带宽](#服务器带宽)
    - [多久有数据](#多久有数据)
    - [其他](#其他)
  
## 本地下载编译源码

这里要求本地已安装nodejs，git。  
下载源码：
确保启动mongodb 
```shell
https://github.com/ssstk/manget2torrent.git
cd manget2torrent
npm install 
npm start 
```

## 服务器环境安装

#### 服务器配置

下面的示例安装，是在一台VPS上执行的，配置如下：

- Memory: 2G
- Disk: 40G SSD
- Processor: 2 Core
- Image: Centos6.5 x64
  
#### 安装nodejs

nodejs版本：8.11.3  
  
### 安装pm2

pm2版本（**最新版本，以代码方式启动不了**）


```shell
npm install pm2 -g 
```


#### 安装Mongodb

mongodb版本：3.4.0  

#### manget2torrent

上传至服务器，安装依赖包：

```shell
npm install 
```

因为要以代码的方式调用pm2，所以还要在当前目录安装，

    npm install pm2 -g

## 运行

#### 修改配置文件

运行之前先修改配置文件`config.js`

```
mongodbHost: '127.0.0.1',
mongodbPort: 27017,

```

  
#### 启动

启动manget2torrent ：

```shell
yarn start 
```


## 问题

#### 服务器带宽
带宽太小容易跑满

#### 多久有数据

这个不一定，和网络等都有关系。不过这次部署，很快就有数据了：

```json
{
    "db" : "antcolony",
    "collections" : 3,
    "objects" : 74,
    "avgObjSize" : 676.7567567567568,
    "dataSize" : 50080,
    "storageSize" : 188416,
    "numExtents" : 5,
    "indexes" : 1,
    "indexSize" : 8176,
    "fileSize" : 67108864,
    "nsSizeMB" : 16,
    "dataFileVersion" : {
        "major" : 4,
        "minor" : 5
    },
    "extentFreeList" : {
        "num" : 0,
        "totalSize" : 0
    },
    "ok" : 1
}
```
  


#### 其他
有其他问题请[新建issue](https://github.com/ssstk/manget2torrent/issues)交流。



