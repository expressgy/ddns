/**
 *
 * 此文件为DDNS域名解析程序
 *
 * CC：NIE
 *
 * Time：2021.11.04
 *
 * Learn：Aliyun
 *
 * */

const Core = require('@alicloud/pop-core');
const request = require('request');
const moment = require('moment');

class DDNS{
    myIP = '';
    myDomainRecordsList;
    constructor(callback){
        const ACCESSKEYID = 'LTAI5tSb*****oXs2L8T3tkm';//我的ACCESS信息
        const ACCESSKEYSECRET = 'gmUSeZepP*****WFTbnkdLukUx8nYf';
        const endpoint = 'https://alidns.aliyuncs.com';//阿里云 DNS API的服务接入地址

        const client = new Core({
            accessKeyId: ACCESSKEYID,
            accessKeySecret: ACCESSKEYSECRET,
            // securityToken: '<your-sts-token>', // use STS Token
            endpoint: endpoint,
            apiVersion: '2015-01-09'
        });
        this.client = client;
        this.getMyIP(host => {
            if(host.host){
                this.myIP = host.host
                callback()
            }else{
                console.log('获取公网ip出错！')
            }
        })
    }

    getDomainRecords(callback){
        let params = {
            "DomainName": "togy.top"
        };
        let requestOption = {
            method: 'POST'
        };
        this.client.request('DescribeDomainRecords', params, requestOption).then((result) => {
            //  以下为自定义格式转化
            let aRecordList = result.DomainRecords
            let aRecord_DomainName = aRecordList.Record
            let autoDomainNameList = [];//JSON格式
            for(let i in aRecord_DomainName){
                autoDomainNameList[autoDomainNameList.length] = JSON.parse(JSON.stringify(aRecord_DomainName[i]))
            }
            this.myDomainRecordsList = autoDomainNameList;
            callback('ok')
        }, (ex) => {
            callback(ex);
        })
    }

    getMyIP(callback){
        request('http://ifconfig.me/ip', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(body) // Show the HTML for the baidu homepage.
                callback({host:body.replace(/(^\s*)|(\s*$)/g, "")})
            }else{
                callback({host:0})
            }
        })
    }
    UpdateDomainRecord(domainName,callback){
        let timesss =moment().format('YYYY-MM-DD HH:mm:ss');
        for(let i in this.myDomainRecordsList){
            if(this.myDomainRecordsList[i].RR == domainName.toUpperCase() || this.myDomainRecordsList[i].RR == domainName.toLowerCase()){
                if(this.myDomainRecordsList[i].Value != this.myIP){
                    let params = {
                        "RecordId": this.myDomainRecordsList[i].RecordId,
                        "RR": "www",
                        "Type": "A",
                        "Value": this.myIP,
                        "TTL": 1200
                    }
                    let requestOption = {
                        method: 'POST'
                    };
                    this.client.request('UpdateDomainRecord', params, requestOption).then((result) => {
                        // console.log(JSON.stringify(result));
                        console.log('更新成功',timesss)
                    }, (ex) => {
                        console.log(ex);
                    })
                    break
                }else {
                    console.log('不存在记录或者记录无需修改',timesss)
                }
            }
        }
    }
    getLog(){
        let params = {
            "DomainName": "togy.top"
        };
        let requestOption = {
            method: 'POST'
        };
        this.client.request('DescribeRecordLogs', params, requestOption).then((result) => {
            console.log('LOG',result.RecordLogs.RecordLog);
        }, (ex) => {
            console.log(ex);
        })
    }
}


function start(){
    const myDDNS = new DDNS(()=>{
        // console.log(myDDNS.myIP)
        myDDNS.getDomainRecords(list => {
            // console.log(myDDNS.myDomainRecordsList)
            myDDNS.UpdateDomainRecord('www')
        })
    });
}



start()
setInterval(()=>{
    start()
},120*60*1000)

//
// const myDDNS2 = new DDNS(() => {
//     myDDNS2.getLog()
// })
