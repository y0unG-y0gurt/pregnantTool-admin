
uni-vote-admin是全端的、开源的、云端一体的问卷投票项目模板管理端。

## 介绍

uni-vote：用户端，包含问卷列表和问题列表。[插件地址](https://ext.dcloud.net.cn/plugin?name=uni-vote)

uni-vote-admin：管理端，属于uni-admin插件，包含问卷管理、问题管理、问题选项管理、问卷结果统计等。


- 开源免费，支持多端，包括小程序、Web、App等，自动兼容pc宽屏。
- 基于uniCloud，serverless，无需复杂的服务器部署，无需关心服务器运维。
- 问卷：可以设置有效期，默认是不限制，在admin端发布问卷时可以选择。
- 问卷问题：支持发布单选或多选问题（多选可包含【其他】项，用户输入内容），应用场景：问卷、投票等。
- 问卷规则：统一在`uniCloud/cloudfunctions/uni-vote-co/checkRule.js`，目前默认包含的规则：
	> 可根据自己应用场景开启/关闭对应规则、添加自定义规则
	- 新用户投票时间限制，比如：禁止注册时间在4小时内的新用户投票
	- 投票时间段限制，比如：晚上8点后到早上8点，期间不能投票
	- 多问题问卷投票次数限制，比如：每个问卷每个用户只能投票1次
	- 单问题问卷投票次数限制，比如：每个问卷每个用户，1个月内，最多投票2次
- 问卷结果统计图在admin端查看。



## 案例体验

DCloud的产品投票，都是基于uni-vote开发的，体验地址：[https://vote.dcloud.net.cn/](https://vote.dcloud.net.cn/)




## 管理端界面


**问卷列表**


![](https://qiniu-web-assets.dcloud.net.cn/ext/uni-vote/uni-vote-admin-01.jpg)


**创建问卷**

![](https://qiniu-web-assets.dcloud.net.cn/ext/uni-vote/uni-vote-admin-02.jpg)




**创建问题和选项**

![](https://qiniu-web-assets.dcloud.net.cn/ext/uni-vote/uni-vote-admin-04.jpg)

**问卷问题**

![](https://qiniu-web-assets.dcloud.net.cn/ext/uni-vote/uni-vote-admin-05.jpg)

**问卷问题选项**

![](https://qiniu-web-assets.dcloud.net.cn/ext/uni-vote/uni-vote-admin-06.jpg)


**问卷结果**

![](https://qiniu-web-assets.dcloud.net.cn/ext/uni-vote/uni-vote-admin-03-new.png)





## 使用指南


> 说明：本插件依赖于[uni-id-pages](https://ext.dcloud.net.cn/plugin?id=8577)用户注册登录。

1. 安装`uni-vote-admin`管理端插件
	- 在插件市场打开本插件页面，在右侧点击`使用 HBuilderX 导入插件`，选择你的 `uni-admin`管理端项目点击确定导入。
3. 在uniCloud目录上右键，点击关联云服务空间或项目，注意管理端和用户端是两个项目，但是连接同一个服务空间。
4. 初始化数据库、上传云函数
	- 如果是导入新项目，在uniCloud右键`云服务空间初始化向导`
	- 如果是导入已有项目
		- 在项目uniCloud--》cloudfunctions目录，上传云对象`uni-vote-co`。
		- 在项目uniCloud--》database目录，上传
			- `uni-vote.schema.json`、
			- `uni-vote-questions.schema.json`、
			- `uni-vote-questions-options.schema.json`、
			- `uni-vote-records.schema.json`、
			- `uni-vote-questions-records.schema.json`。
5. 运行启动`uni-admin`，在web管理后台，点击左侧菜单栏的菜单管理，添加“投票管理”菜单，注意开启菜单。导入后刷新页面，在`uni-admin`左侧菜单，可看到投票管理的菜单项，点击即可进入相关页面添加问卷问题。
6. 在插件市场中找到`uni-vote`用户端插件[https://ext.dcloud.net.cn/plugin?name=uni-vote](https://ext.dcloud.net.cn/plugin?name=uni-vote)，将插件导入至`uni-app`用户端项目中，用户端关联管理端项目，共用一个服务空间。
7. 在admin端添加完问卷和问题后，在用户端运行至相应平台即可体验。
8. 问卷规则限制，在`uniCloud/cloudfunctions/uni-vote-co/checkRule.js`根据自己应用场景开启对应规则或者添加规则，配置完成后在`uni-vote-co`右键上传部署。






## 架构说明和二次开发

uni-vote，有问卷、问卷问题和问卷问题选项这3个概念。问卷问题下的选项可以是单选，也可以是多选。

- 每个问卷下只有单个问题时，应用场景：需求投票等。
- 每个问卷下多个问题时，所有问题组成一个问卷，回答所有问题后提交答案，应用场景：问卷调查等。


uni-vote目前没有的功能：
1. 投票结果打分。目前只支持统计票数，不支持答案正确对比，不支持计分。
2. 投票问题发起只能在admin端，不支持用户自己发起投票问题。



> 如果目前的 uni-vote 不能满足你的需求，你可以基于 uni-vote 进行二次开发。

- 问卷查询投票等逻辑在`uniCloud/cloudfunctions/uni-vote-co/index.obj.js`中，可结合自己业务场景在_before添加自定义前置规则。
- 问卷的所有规则在`uniCloud/cloudfunctions/uni-vote-co/checkRule.js`中，可根据自己业务场景开启/关闭已有规则或者添加自定义规则。


### 目录结构

#### uni-vote 用户端插件

```text
uni-vote                                // uni-vote 插件
├── pages                               // 页面
│   ├── vote                              
│   │   └── vote.vue                    // 投票问题页面
│   └── vote-items                        
│       └── vote-items.vue              // 投票项页面
├── pages_init.json                     // 页面初始化配置
├── package.json                        // 插件配置
├── changelog.md                        // 插件更新日志
├── readme.md                           // 插件文档
└── uniCloud                            
   ├── cloudfunctions                   // 云函数
   │   └── uni-vote-co                  // uni-vote云对象
   │   │   ├── checkRule.js             // 问卷规则
   │   │   ├── index.js                 // 云对象入口
   │   │   └── package.json    
   └── database                                      // 数据库
       ├── uni-vote.schema.json                      // 问卷表
       ├── uni-vote-questions.schema.json            // 问题表
       ├── uni-vote-questions-options.schema.json    // 问题选项表
       ├── uni-vote-records.schema.json              // 问卷记录表
       └── uni-vote-questions-records.schema.json    // 问题回答记录表
```


#### uni-vote-admin 管理端插件

```text
uni-vote-admin                         // uni-vote-admin 管理端插件
├── menu.json                          // 菜单初始化配置，通过menu.json注册动态菜单
├── package.json                       // 插件配置
├── changelog.md                       // 插件更新日志
├── readme.md                          // 插件文档
├── pages                              // 页面   
│   ├── uni-vote                       // 问卷管理
│   │   ├── add.vue                    // 添加问卷
│   │   ├── edit.vue                   // 编辑问卷
│   │   └── list.vue                   // 问卷列表
│   ├── uni-vote-questions             // 问题管理
│   │   ├── add.vue                    // 添加问题
│   │   ├── edit.vue                   // 编辑问题
│   │   └── list.vue                   // 问题列表
│   ├── uni-vote-questions-options     // 问题项管理
│   │   ├── add.vue                    // 添加问题项
│   │   ├── edit.vue                   // 编辑问题项
│   │   └── list.vue                   // 问题项列表
│   └── uni-vote-records               // 问卷记录管理
│       ├── detail.vue                 // 其他选项内容
│       └── list.vue                   // 问卷结果统计
└── uniCloud                           // 云函数
    ├── cloudfunctions       
    │   ├── uni-vote-co                // uni-vote云对象
    │   │   ├── checkRule.js           // 问卷规则
    │   │   ├── index.obj.js           // 云对象入口
    │   │   └── package.json    
    │   │── common                     // 公共模块
    │   │   ├── uni-config-center      // 服务端配置中心
    │   │   │   └── uni-id             //uni-id模块配置目录
    │   │   │       └── config.json    // uni-id对应的配置数据
    │   │   ├── index.js               // config-center入口文件
    │   │   └── package.json      
    └── database                                    // 数据库
       ├── uni-vote.schema.json                     // 问卷表
       ├── uni-vote-questions.schema.json           // 问题表
       ├── uni-vote-questions-options.schema.json   // 问题选项表
       ├── uni-vote-records.schema.json             // 问卷记录表
       └── uni-vote-questions-records.schema.json   // 问题回答记录表
```





