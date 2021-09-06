### 负载均衡

负载均衡是**Nginx**的一个重要用途，我们通过指定[不同的策略](https://www.jianshu.com/p/4c250c1cd6cd)来达到负载均衡的效果：

1. **轮询**（round）

   ```nginx
   upstream  server_group {
       server localhost:8081;
       server localhost:8082;
   }
   ```

2. **权重**

   ```nginx
   upstream server_group {
       server localhost:8081 weight=1;
       server localhost:8082 weight=2;
   }
   ```

3. **散列**（可以配合权重使用）

   ```nginx
   upstream server_group {
       ip_hash;
       server localhost:8081 weight=1;
       server localhost:8082 weight=2;
   }
   ```

4. **最少连接**

   ```nginx
   upstream server_group {
       least_conn;
       server localhost:8081 weight=1;
       server localhost:8082 weight=2;
   }
   ```

5. **最短响应时间**（第三方）

   ```nginx
   upstream server_group {
       fair;
       server localhost:8081 weight=1;
       server localhost:8082 weight=2;
   }
   ```



### [路由](https://sunpenghong.com/2021/01/18/nginx-学习（四）静态服务配置详解root和alias指令/)（URL替换）

1. root

   1. root是指定项目的根目录，适用与server和location，可以指定多个。

   2. 如果location没有指定，会往其外层的server或http中寻找继承。

   3. 会将匹配后的URL中的host，替换为location的root指定的地址。

   4. 例如：

      ```nginx
      location ^~ /static {
          root /vagrant/pro/staitc
      }
      ```

      “http://localhost/static/image.png”会被替换为<span style=background:#c2e2ff>/vagrant/pro/static</span> + <span style=background:#c2e2ff>/static/image.png</span>。

   5. root指令最后的斜杠可加可不加，因为在\*nix系统中， 多个斜杠和一个斜杠是等价的。但前面的斜杠要加，否则URL匹配不上。

2. alias

   1. alias替换匹配部分的URL，例如：

      ```nginx
      location ^~ /upload/ {
          alias /vagrant/pro
      }
      ```

      “http://localhost/upload/image.png”会被替换为<span style=background:#c2e2ff>/vagrant/pro</span> + <span style=background:#c2e2ff>image.png</span>。
      
   2. 和root相比，alias不需要目标路径名开头与URL路径名开头一致。  



### 连接、请求限制

```nginx
# 定义一个名为“limit_connection”的限制连接的存储空间，以ip地址作为key，空间大小限制为1m
limit_conn_zone $binary_remote_addr zone=limit_connection:1m;
# 定义一个名为“limit_req”的限制请求的存储空间，以ip地址作为key，空间大小限制为1m，请求速率限制为每秒1次
limit_req_zone $binary_remote_addr zone=limit_request:1m rate=1r/s;
server {
    location / {
        limit_conn limit_connection 1; # 限制每个IP只能发起一个连接
        limit_rate 100k; # 连接限速位每秒100k
        limit_req zone=limit_request burst=3 nodelay; # 指定遗留3个请求到下一秒执行，其他请求无延迟直接返回
    }
}
```

<span style=background:#e6e6e6>$remote_addr</span>是字符串形式的IP地址，变长，7~15字节。

<span style=background:#e6e6e6>$binary_remote_addr</span>是二进制形式，定长，64位（x64），1m共享空间可保存。1m可存储16384（2^20/2^6=2^14）个状态。



### 超时、重试

```nginx
keepalive_timeout
proxy_connect_timeout
proxy_read_timeout
proxy_send_timeout
```



此外Nginx支持静态资源、gzip压缩，解决跨域，以及浏览器缓存过期。
