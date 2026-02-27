// Cloudflare Worker: 子域名转发到路径
// 把 username.catcat.meme/* 转发到 i.catcat.meme/username
// 同时替换响应中的链接，保持子域名 URL

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const hostname = url.hostname
    
    // 主域名
    const mainDomain = 'i.catcat.meme'
    
    // 如果已经是主域名，直接返回
    if (hostname === mainDomain || hostname === 'www.' + mainDomain) {
      return fetch(request)
    }
    
    // 提取子域名（即用户名）
    let username = hostname
    
    // 去掉 www. 前缀
    if (username.startsWith('www.')) {
      username = username.substring(4)
    }
    
    // 去掉主域名后缀
    if (username.endsWith('.' + mainDomain)) {
      username = username.substring(0, username.length - mainDomain.length - 1)
    }
    
    // 检查是否是有效用户名
    if (!username || username.includes('.') || username.includes('/')) {
      return new Response('Not Found', { status: 404 })
    }
    
    // 构造新的 URL: i.catcat.meme/username
    const newPath = `/${username}${url.pathname === '/' ? '' : url.pathname}${url.search}`
    const newUrl = `${url.protocol}//${mainDomain}${newPath}`
    
    // 转发请求
    const newRequest = new Request(newUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        'Host': mainDomain,
        'X-Forwarded-Host': hostname,
        'X-Forwarded-Proto': url.protocol.replace(':', '')
      },
      body: request.body,
      redirect: 'manual'
    })
    
    const response = await fetch(newRequest)
    
    // 获取响应内容
    let body = await response.text()
    
    // 替换响应中的主域名为子域名
    // 替换 i.catcat.meme/username 为 username.catcat.meme
    const originalHost = `${username}.${mainDomain}`
    body = body.replace(new RegExp(mainDomain, 'g'), originalHost)
    body = body.replace(new RegExp(`${mainDomain}/`, 'g'), `${originalHost}/`)
    
    // 创建新的响应，保留原始状态码
    const newResponse = new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers)
    })
    
    // 处理重定向，让相对路径重定向也能工作
    const location = response.headers.get('location')
    if (location) {
      let newLocation = location
      // 如果是相对路径，转换为子域名路径
      if (location.startsWith('/')) {
        newLocation = `https://${originalHost}${location}`
      } else if (location.startsWith(mainDomain)) {
        newLocation = location.replace(mainDomain, originalHost)
      }
      newResponse.headers.set('location', newLocation)
    }
    
    return newResponse
  }
}
