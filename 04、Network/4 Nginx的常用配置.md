## 负载均衡

负载均衡是**Nginx**的一个重要用途，我们通过指定[不同的策略](https://www.jianshu.com/p/4c250c1cd6cd)来达到负载均衡的效果：

### 轮询（round）

```nginx
upstream  server_group {
    server localhost:8081;
    server localhost:8082;
}
```

### 权重

```nginx
upstream server_group {
    server localhost:8081 weight=1;
    server localhost:8082 weight=2;
}
```

### 散列（可以配合权重使用）

```nginx
upstream server_group {
    ip_hash;
    server localhost:8081 weight=1;
    server localhost:8082 weight=2;
}
```

### 最少连接

```nginx
upstream server_group {
    least_conn;
    server localhost:8081 weight=1;
    server localhost:8082 weight=2;
}
```

### 最短响应时间（第三方）

```nginx
upstream server_group {
    fair;
    server localhost:8081 weight=1;
    server localhost:8082 weight=2;
}
```



## 路由（URL替换）

### Location[[1]](https://segmentfault.com/a/1190000013267839)

```nginx
location [ | = | ~ | ~* | ^~ ] uri {...}
location @name {...}
```

#### 修饰符

- `=` ：精确匹配，只有请求的uri与指定的字符串完全相等时，才会命中。
- ` `：前缀匹配。
- `~` ：使用<span style=background:#c2e2ff>正则</span>定义的，区分大小写。
- `~*` ：使用<span style=background:#c2e2ff>正则</span>定义的，不区分大小写。
- `^~` ：普通字符匹配，如果该选项匹配，只匹配该选项，不匹配别的选项。一般用来匹配目录，可搭配`root`、`alias`。

首先检查使用<u>前缀匹配</u>、<u>精确匹配</u>定义的`location`，记录最长的前缀匹配的项，同时，如果找到了<u>精确匹配</u>的项，则停止查找，使用该匹配项；否则，按照顺序查找使用正则定义的`location`，如果匹配到，则使用；否则使用前面记录的最长的前缀匹配项。

### root和alias[[2]](https://sunpenghong.com/2021/01/18/nginx-学习（四）静态服务配置详解root和alias指令/)

#### root

`root`是指定项目的根目录，适用与`server`和`location`，可以指定多个。

如果`location`没有指定`root`，会往其外层的`server`或`http`中寻找继承。

会将匹配后的URL中的`host`，替换为`location`的`root`指定的地址。

例如：

```nginx
location ^~ /static {
    root /vagrant/pro/staitc;
}
```

“http://localhost/static/image.png”会被替换为<span style=background:#c2e2ff>/vagrant/pro/static</span> + <span style=background:#c2e2ff>/static/image.png</span>。

`root`最后的`/`可加可不加，因为在`*nix`系统中， 多个`/`和一个`/`是等价的。但前面的`/`要加，否则URL匹配不上。

#### alias

`alias`替换匹配部分的URL，例如：

```nginx
location ^~ /upload/ {
    alias /vagrant/pro;
}
```

“http://localhost/upload/image.png”会被替换为<span style=background:#c2e2ff>/vagrant/pro</span> + <span style=background:#c2e2ff>image.png</span>。

和`root`相比，`alias`不需要目标路径名开头与URL路径名开头一致。  

#### try_files[[3]](https://www.hi-linux.com/posts/53878.html)

作用是：按顺序检查文件是否存在，返回第一个找到的文件或文件夹（结尾加斜线表示为文件夹），如果所有的文件或文件夹都找不到，会进行一个内部重定向到最后一个参数。

### 转发与重定向[[4]](https://www.cnblogs.com/tugenhua0707/p/10798762.html)

#### forward

<span style=background:#f8d2ff>转发</span>，不改变浏览器地址。

#### redirect

<span style=background:#ffb8b8>重定向</span>，浏览器的地址栏中的链接会重写。

#### rewrite

```nginx
rewrite regex replacement [flag];
```

如果`replacement`中的字符串以`http`/`https`开头，则会进行<span style=background:#ffb8b8>重定向</span>；否则，只会进行<span style=background:#f8d2ff>转发</span>。

`flag`有如下值：

- `last`：本条规则匹配完成后，继续向下匹配新的`location`，只<span style=background:#f8d2ff>转发</span>。
- `break`：本条规则匹配完成后，不再继续匹配后面的任何规则，只<span style=background:#f8d2ff>转发</span>。
- `redirect`：返回302临时<span style=background:#ffb8b8>重定向</span>。
- `permanent`：返回301永久<span style=background:#ffb8b8>重定向</span>。



## 连接、请求限制

```nginx
# 定义一个名为“limit_connection”的限制连接的存储空间，以ip地址作为key，空间大小限制为1MB
limit_conn_zone $binary_remote_addr zone=limit_connection:1m;
# 定义一个名为“limit_req”的限制请求的存储空间，以ip地址作为key，空间大小限制为1MB，请求速率限制为每秒1次
limit_req_zone $binary_remote_addr zone=limit_request:1m rate=1r/s;
server {
    location / {
        limit_conn limit_connection 1; # 限制每个IP只能发起一个连接
        limit_rate 100k; # 连接限速位每秒100k
        limit_req zone=limit_request burst=3 nodelay; # 指定遗留3个请求到下一秒执行，其它请求无延迟直接返回
    }
}
```

`$remote_addr`是字符串形式的IP地址，变长，`7~15 byte`。

`$binary_remote_addr`是二进制形式，定长，64位（x64），`1MB`共享空间可保存。`1MB`可存储`16384`（`2^20/2^6=2^14`）个状态。



## 超时、重试

```nginx
keepalive_timeout
proxy_connect_timeout
proxy_read_timeout
proxy_send_timeout
```



## 其它

此外**Nginx**支持静态资源、GZip压缩，解决跨域，以及浏览器缓存过期。

