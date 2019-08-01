import { getList } from '../controller/blog'
import { SuccessModel } from '../model/resModel'

const handleBlogRouter = (req, res) => {
  if (req.method === 'GET' && req.path === '/api/blog/list') {
    const author = req.query.author || ''
    const keyword = req.query.keyword || ''
    const listData = getList(author, keyword)
    return new SuccessModel(listData)
  }

  if (req.method === 'GET' && req.path === '/api/blog/detail') {
    return {
      msg: '博客详情接口'
    }
  }
}

export default handleBlogRouter