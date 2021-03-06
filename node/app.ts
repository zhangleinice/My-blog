import * as querystring from 'querystring'
import handleBlogRouter from './src/router/blog'
import handleUserRouter from './src/router/user'
import { getCookieExpires } from './src/util';

// 处理post请求
const getPostData = req => {
  const promise = new Promise(resolve => {
    if (req.method !== 'POST') {
      resolve({})
      return
    }
    if (req.headers['content-type'] !== 'application/json') {
      resolve({})
      return
    }
    let postData: string = ''
    req.on('data', chunk => {
      postData += chunk.toString()
    })
    req.on('end', () => {
      if (!postData) {
        resolve({})
      } else {
        resolve(JSON.parse(postData))
      }
    })
  })
  return promise
}

const SESSION_DATA = { }

const serverHandle = (req, res) => {
  // 设置返回格式
  res.setHeader('Content-type', 'application/json')

  const url = req.url
  const path = url.split('?')[0]
  const query = querystring.parse(url.split('?')[1])
  req.query = query
  req.path = path

  // 解析cookie
  req.cookie = {}
  let cookieStr = req.headers.cookie || '';
  cookieStr.split(';').forEach(item => {
    if(!item) return;
    const [ key, value = '' ] = item.split('=');
    req.cookie[key.trim()] = value.trim()
  });

  // 解析session
  let needCookie: boolean = false
  let userId = req.cookie.userid
  if(userId) {
    if(!SESSION_DATA[userId]){
      SESSION_DATA[userId] = {}
    }
  }else{
    needCookie = true    
    userId = `${Date.now()}_${Math.random()}`
    SESSION_DATA[userId] = {}
  }
  req.session = SESSION_DATA[userId]

  // 处理 post data
  getPostData(req).then((postData: any) => {
    req.body = postData
    // 处理blog路由
    const blogResult: any = handleBlogRouter(req, res)
    if (blogResult) {
      blogResult.then(data => {
        if(needCookie) {
          res.setHeader('Set-Cookie', `username=${data.username}; path=/; httpOnly; expires=${getCookieExpires()};`)
        }
        res.end(JSON.stringify(data))
      })
      return
    }

    // 处理user路由
    const userResult: any = handleUserRouter(req, res)
    if (userResult) {
      userResult.then(data => {
        if(needCookie) {
          res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()};`)
        }
        res.end(JSON.stringify(data)) 
      })
      return
    }

    // 未命中路由
    res.writeHead(404, { 'Content-type': 'text/plain' })
    res.write('404 Not Found\n')
    res.end()
  })
}

export default serverHandle
