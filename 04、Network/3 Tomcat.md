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




## WAR部署方式

**WAR**，**W**eb application **AR**chive，是一种**JAR**（**J**ava **AR**chive）文件，包含了Java代码及各类资源文件。

既然是**JAR**，其实也可以用Java命令直接运行的，当然这需要**WAR**中有启动类，以及包含tomcat-embed等依赖库。

但我们的通常做法是将**WAR**部署到**Tomcat**上，部署方式有3种：

1. `webapps`：最简单、最常用。
2. `conf/server.xml`：在该文件中配置站点信息。
3. `conf/Catalina/localhost/`：在该目录中新增XML文件配置站点信息。


