# ACFun-Live-Helper
弹幕显示助手

## 支持的功能
* 房间观众管理
* 拉黑观众
* 房管管理
* 弹幕透明浏览器显示
* 弹幕发送
* 弹幕发送置顶窗
* 直播开关播
* 开播时封面和标题修改

## 截图
![使用截图](https://raw.githubusercontent.com/ShigemoriHakura/ACFun-Live-Helper/master/screenshots/1.png) 

## 更新日志
* 0.2.3 加入直播标题和封面修改（独家！我先找到的接口！）。
* 0.2.2 修复关闭直播的bug。
* 0.2.1 全部重构！业务逻辑重新优化。

## 下载
1. [Releases](https://github.com/ShigemoriHakura/ACFun-Live-Helper/releases)

## 编译
* npm install
* npm run electron:build 

## 网页开播逻辑
* 上传封面：
* https://member.acfun.cn/common/api/getQiniuToken 获取token
* https://upload.qiniup.com/ token用base64解码，直接axios就ok
* 上传封面完成
* 开播流检测：
* https://api.kuaishouzt.com/rest/zt/live/web/obs/transcodeInfo 获取转码信息,可以忽略
* https://api.kuaishouzt.com/rest/zt/live/web/obs/config 获取推流地址和密钥
* https://api.kuaishouzt.com/rest/zt/live/web/obs/startpush 开始推流，需要用got的buffer（暂时没找到更方便的）
* 关播：
* https://api.kuaishouzt.com/rest/zt/live/web/obs/stoppush 关闭推流