// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "user_id": {
    "rules": [
      {
        "format": "string"
      }
    ]
  },
  "vote_id": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "所属问卷或投票问题",
    "label": "所属问卷或投票问题"
  },
  "vote_question_id": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "问卷或投票项",
    "label": "问卷或投票项"
  },
  "vote_item_id": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "问卷或投票项",
    "label": "问卷或投票项"
  },
  "results": {
    "rules": [
      {
        "format": "array"
      }
    ]
  },
  "create_date": {
    "rules": [
      {
        "format": "timestamp"
      }
    ],
    "label": "创建时间"
  }
}

const enumConverter = {}

function filterToWhere(filter, command) {
  let where = {}
  for (let field in filter) {
    let { type, value } = filter[field]
    switch (type) {
      case "search":
        if (typeof value === 'string' && value.length) {
          where[field] = new RegExp(value)
        }
        break;
      case "select":
        if (value.length) {
          let selectValue = []
          for (let s of value) {
            selectValue.push(command.eq(s))
          }
          where[field] = command.or(selectValue)
        }
        break;
      case "range":
        if (value.length) {
          let gt = value[0]
          let lt = value[1]
          where[field] = command.and([command.gte(gt), command.lte(lt)])
        }
        break;
      case "date":
        if (value.length) {
          let [s, e] = value
          let startDate = new Date(s)
          let endDate = new Date(e)
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
      case "timestamp":
        if (value.length) {
          let [startDate, endDate] = value
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
    }
  }
  return where
}

export { validator, enumConverter, filterToWhere }
