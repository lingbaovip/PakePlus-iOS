// PakePlus 构建信息
console.log(
    '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
    'color:orangered;font-weight:bolder'
)

// --- 以下是您原来的代码，用于处理页面跳转 ---

// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })


// --- 以下是新增的代码，用于为所有请求添加请求头 ---

// 定义要添加的请求头
const customHeader = {
    'X-Requested-With': 'com.yifengyun.tjp'
};

// 1. 拦截和重写 fetch API
const originalFetch = window.fetch;
window.fetch = function (url, options) {
    // 确保 options.headers 存在
    options = options || {};
    options.headers = options.headers || {};
    
    // 添加自定义请求头
    Object.assign(options.headers, customHeader);
    
    console.log('Fetching with custom header:', url, options.headers);
    
    // 调用原始的 fetch 方法
    return originalFetch.apply(this, arguments);
};

// 2. 拦截和重写 XMLHttpRequest
const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    // 存储请求信息，以便在 send 时使用
    this._url = url; 
    return originalOpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function(data) {
    const originalSetRequestHeader = this.setRequestHeader;
    
    // 重写 setRequestHeader 以便在最后添加我们的请求头
    this.setRequestHeader = function(header, value) {
        // 正常调用原始的 setRequestHeader
        originalSetRequestHeader.apply(this, arguments);
    };

    // 添加我们自定义的请求头
    for (const header in customHeader) {
        this.setRequestHeader(header, customHeader[header]);
    }
    
    console.log('XHR Sending with custom header:', this._url, customHeader);
    
    // 恢复原始的 setRequestHeader，避免影响后续操作
    this.setRequestHeader = originalSetRequestHeader;

    return originalSend.apply(this, arguments);
};

console.log('已成功注入自定义请求头脚本 (fetch & XMLHttpRequest)。');