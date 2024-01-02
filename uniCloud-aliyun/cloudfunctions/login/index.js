'use strict';

const {appId,appSecret} = require('wx-common')

exports.main = async (event, context) => {
	const { code } = event;
	
    console.log(appId);
    
	//GET https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
	const res = await uniCloud.httpclient.request(
		`https://api.weixin.qq.com/sns/jscode2session?appid=`+appId+`&secret=`+appSecret+`&js_code=`+code+`&grant_type=authorization_code`,
		{
			dataType:"json"
		}
	)
	
	const openid = res.data.openid;
    
    console.log(res);
    
    return event
};
