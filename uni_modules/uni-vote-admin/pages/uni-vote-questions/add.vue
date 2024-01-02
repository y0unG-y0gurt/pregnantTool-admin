<template>
	<view class="uni-container">
		<view class="title">新增问卷的问题</view>
		<uni-forms ref="form" :model="formData" validateTrigger="bind">
			<uni-forms-item name="type" label="选项类型" required label-width="80px">
				<uni-data-checkbox v-model="formData.type" :localdata="formOptions.type_localdata"></uni-data-checkbox>
			</uni-forms-item>
			<uni-forms-item name="title" label="问题" required label-width="80px">
				<uni-easyinput placeholder="问卷或投票项问题、需求描述" v-model="formData.title" trim="both"></uni-easyinput>
			</uni-forms-item>
			
			<uni-forms-item label="问题选项" name="options" label-width="80px">
			
				<view v-for="(item,index) in options" :key="index" class="options-box">
					<view :class="formData.type == 'radio'?'radio-tip':''" class="tip"></view>
					<input v-model="item.title" :placeholder="'选项' + (index+1)"
						 class="question" type="text" />
					<input v-if="item.title == '其他'" placeholder="选项为[其他]时,填写者可输入内容"
						:disabled="true" class="input-option" type="text" />
					<uni-icons v-if="options.length != 1" @click="subOption(index)" type="minus"  size="26"></uni-icons>
				</view>
			
				<view class="options-box">
					<view @click="handleOptions" class="add-options">
						<uni-icons type="plus" color="#2979ff" size="26"></uni-icons>
						<view>添加选项</view>
					</view>
					<view v-if="hasInputAble == -1" @click="handleOtherOptions" class="add-options">
						<uni-icons type="plus" color="#2979ff" size="26"></uni-icons>
						<view>添加其他选项</view>
					</view>
				</view>
			</uni-forms-item>
			<uni-forms-item name="status" label="状态" label-width="80px">
				<uni-data-checkbox v-model="formData.status" :localdata="formOptions.status_localdata"></uni-data-checkbox>
			</uni-forms-item>
			<view class="uni-button-group">
				<button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
				<navigator open-type="navigateBack" style="margin-left: 15px;">
					<button class="uni-button" style="width: 100px;">返回</button>
				</navigator>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	import {
		validator
	} from '../../js_sdk/validator/uni-vote-questions.js';

	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'uni-vote-questions';

	function getValidator(fields) {
		let result = {}
		for (let key in validator) {
			if (fields.includes(key)) {
				result[key] = validator[key]
			}
		}
		return result
	}

	export default {
		data() {
			let formData = {
				"vote_id": "",
				"type": "radio",
				"title": "",
				"status": 1,
				"create_date": null
			}
			return {
				formData,
				formOptions: {
					"type_localdata": [{
							"value": "radio",
							"text": "单选"
						},
						{
							"value": "checkbox",
							"text": "多选"
						}
					],
					"status_localdata": [{
							"value": 0,
							"text": "关闭"
						},
						{
							"value": 1,
							"text": "启用"
						}
					]
				},
				rules: {
					...getValidator(Object.keys(formData))
				},
				"options": [
					{
						'title': ''
					}
				],
				vote_id:''
			}
		},
		onReady() {
			this.$refs.form.setRules(this.rules)
		},
		onLoad(e) {
			this.vote_id = e.vote_id
		},
		computed:{
			hasInputAble(){
				return this.options.findIndex(i=>i.input_able == true)
			}
		},
		methods: {
			handleOptions() {
				this.options.push({
					"title": ''
				})
			},
			handleOtherOptions() {
				this.options.push({
					"title": '其他',
					"input_able":true,
					"input_value":""
				})
			},
			subOption(index) {
				this.options.splice(index, 1)
			},
			/**
			 * 验证表单并提交
			 */
			submit() {
				uni.showLoading({
					mask: true
				})
				this.$refs.form.validate().then((res) => {
					return this.submitForm(res)
				}).catch(() => {}).finally(() => {
					uni.hideLoading()
				})
			},

			/**
			 * 提交表单
			 */
			submitForm(value) {
				value['vote_id'] = this.vote_id
				if(!this.options[0].title){
					uni.showToast({
						title: '请填写问题选项',
						icon:'none'
					});
					return false
				}
				
				this.options = this.options.map((item,index)=>({
					title: item.title,
					index: index+1,
					input_able: item.title == '其他'? true : false,
					input_value:""
				}))
				
				// 使用 clientDB 提交数据
				return db.collection(dbCollectionName).add(value).then((res) => {
					this.voteQuestionOptions(res.result.id,(addCountRes)=>{
						if(addCountRes>0){
							uni.showToast({
								title: '新增成功'
							})
							this.getOpenerEventChannel().emit('refreshData')
							setTimeout(() => uni.navigateBack(), 500)
						}
					})
					
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				})
			},
			async voteQuestionOptions(id,callback){
				const vote = uniCloud.importObject('uni-vote-co')
				await vote.handleVoteOptions({
					vote_id:this.vote_id,
					vote_question_id:id,
					options:this.options
				}).then((res) => {
					callback(res.addCountRes)
				})
			}
		}
	}
</script>
<style>
	.title {
		font-size: 16px;
		font-weight: 500;
		color: #333;
		margin: 10px;
	}
	.options-box {
		flex-direction: row;
		display: flex;
		align-items: center;
		margin: 0 20px 20px 0;
	}
	.question,.input-option{
		background-color: #f8f8f8;
		border-radius: 10px;
		padding: 10px;
		margin: 10px;
	}
	.question {
		flex:1;
		min-width: 150px;
	}
	.input-option{
		width: 400px;
	}

	.tip {
		width: 15px;
		height: 15px;
		background-color: #eff1f7;
	}

	.radio-tip {
		border-radius: 100px;
	}

	.add-options {
		flex-direction: row;
		display: flex;
		align-items: center;
		margin-right: 30px;
		cursor: pointer;
		color: #2979ff;
	}
</style>