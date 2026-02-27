// Cloudflare Worker: 子域名转发到路径
// 把 username.catcat.meme 转发到 i.catcat.meme/username

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
    // 例如: alice.catcat.meme -> alice
    let username = hostname
    
    // 去掉可能的 www. 前缀
    if (username.startsWith('www.')) {
      username = username.substring(4)
    }
    
    // 去掉主域名后缀
    if (username.endsWith('.' + mainDomain)) {
      username = username.substring(0, username.length - mainDomain.length - 1)
    }
    
    // 跳过已经是以主域名结尾的情况
    if (!username || username.includes('.')) {
      // 不是有效的子域名，返回 404
      return new Response('Not Found', { status: 404 })
    }
    
    // 构造新的 URL: i.catcat.meme/username
    const newUrl = `${url.protocol}//${mainDomain}/${username}${url.pathname}${url.search}`
    
    // 转发请求
    const newRequest = new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    })
    
    return fetch(newRequest)
  }
}
