## Servlet

JavaEE的核心是**Servlet**，**Servlet**需要运行在容器中，如**Tomcat**等Web服务器。

`HttpServletRequest`/`HttpServletResponse`其实是一种过度设计，目前只有这一种`ServletRequest`/`ServletResponse`。

**Servlet**的生命周期为：加载、初始化、处理请求、销毁、卸载。



## Tomcat

作为**Servlet**容器，**Tomcat**主要负责：

1. 管理**Servlet**的生命周期。
2. 将URL映射到指定的**Servlet**上。
3. 将请求封装并交由相应的**Servlet**处理。
4. 将**Servlet**处理好的响应返回给客户端。

> URL是一种URI。



## 运行模式

众所周知，**Tomcat**为通过新建线程（线程池）来处理每个请求，其线程创建模式，也就是**Tomcat Connector**的运行模式有3种：

1. <span style=background:#c2e2ff>BIO</span>：使用<span style=background:#b3b3b3>java.io</span>中的类来处理线程问题，效率低，**Tomcat7**及其以下版本默认采用该模式。

2. <span style=background:#c2e2ff>NIO</span>：使用<span style=background:#b3b3b3>java.nio</span>中的类来处理线程问题，性能高，**Tomcat8**及其以上版本默认采用该模式。

3. <span style=background:#c2e2ff>APR</span>：Apache Portable Runtime，可移植运行时，通过<span style=background:#c2e2ff>JNI</span>调用**核心动态链接库**来处理文件读取和网络传输，是使用**OS**级别的**APR**来解决IO问题，性能最高，但是需要额外引入**APR**、**native**库。




## WAR部署方式

**WAR**，**W**eb application **AR**chive，是一种**JAR**（**J**ava **AR**chive）文件，包含了Java代码及各类资源文件。

既然是**JAR**，其实也可以用Java命令直接运行的，当然这需要**WAR**中有启动类，以及包含tomcat-embed等依赖库。

但我们的通常做法是将**WAR**部署到**Tomcat**上，部署方式有3种：

1. `webapps`：最简单、最常用。
2. `conf/server.xml`：在该文件中配置站点信息。
3. `conf/Catalina/localhost/`：在该目录中新增XML文件配置站点信息。



## Session与Cookie⭐

[两者不是同一层次的概念](https://www.zhihu.com/question/19786827/answer/84540780)，`cookie`可用于实现`session`。

### Session

由于HTTP是无状态的，所以才有了`session id`，用于标识**Session**是否有效，可进而用于标识用户。

`session id`往往只在请求中携带，易失；如有需要，可以持久化到数据库，或持久化到`cookie`中。

### cookie

`cookie`用于将数据持久化到浏览器中，以方便服务端下次来取。

`cookie`不仅可以用于保存`session id`，进而追踪用户行为、保存登录状态；还可以用于保存用户的个性化配置等内容。

