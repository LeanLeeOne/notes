## 简述

**Apache HTTP Server**、**Apache Tomcat**、**Nginx**都是HTTP服务器（软件层面），是运行在服务器（硬件层面）上的应用程序，我们可以通过简述这三者的发展过程，来捋清它们之间的关系。

> HTTP服务器需要监听指定端口，处理请求，并返回响应。



## Apach HTTP Server

### 1989年

HTTP协议诞生，之后出现了一系列HTTP服务器，其中一个广泛传播的服务器是用<span style=background:#c2e2ff>C语言</span>编写的NCSA HTTPd。

由于该服务器是开源的，许多开发者不断地给它增加功能，并针对不断出现的Bug打补丁。

### 1995年

一些有识之士看不下这种场面，于是成立小组重写了该服务器，将其取名为**Apache**，全称**Apache HTTP Server**。

**Apache**一语双关：

- **Apache**是印第安人中最后一个屈服于美国政府的部落。服务器取此名称，寓意可靠、坚韧。
- **Apache**与A Patchy同音，意为打满补丁的服务器，毕竟该服务器是基于打满补丁NCSA HTTPd服务器开发的。

### 1999年

**Apache HTTP Server**因其自身的稳定、功能丰富、灵活可扩展而获得了极大的成功。

**Apache HTTP Server**开发小组的成员们进一步成立了非营利性的**Apache Software Foundation**，来支持**Apache HTTP Server**及其相关软件的发展。

同时**Apache HTTP Server**也有自身的局限性，它只能处理HTML、图片等<span style=background:#ffb8b8>静态资源</span>，无法对请求中的数据加工处理，生成<span style=background:#f8d2ff>动态资源</span>，于是便有了**Apache Tomcat**。



## Apache Tomcat

1999年，**Apache Software Foundation**与**Sun**合作推出了用Java编写的**Apache Tomcat**。

如上文所述，传统的HTTP服务器无法生成<span style=background:#f8d2ff>动态资源</span>，而本质为**Servlet**容器的**Tomcat**，通过运行开发者编写的**Servlet**，解决动态内容的生成问题。

**Catalina**是一座[小岛](https://en.wikipedia.org/wiki/Santa_Catalina_Island_(California))，Craig McClannahan[用这个岛名来命名](https://www.zhihu.com/question/68213723/answer/260766297)**Tomcat**最核心的那个模块，即，运行**Servlet**的那个Java模块。



## Nginx

2004年，**Nginx**（Engine X）诞生。

**Nginx**跟**Apache HTTP Server**一样，是一种HTTP服务器，但是性能更高（资源占用少、并发数高）。

**Nginx**也是用<span style=background:#c2e2ff>C语言</span>编写的，是异步的。**Nginx**在设计之初的目标，就是要超越同步的**Apache HTTP Server**。

**Nginx**确实做到了，**Apache HTTP Server**也基本淡出了开发者的视野。



## 总结

**Apache HTTP Server**、**Nginx**是纯粹的HTTP服务器，主要处理<span style=background:#ffb8b8>静态资源</span>。

**Tomcat**是对HTTP服务器的<span style=background:#c2e2ff>扩展</span>，主要用于生成<span style=background:#f8d2ff>动态资源</span>。

**Tomcat**虽说是扩展，但是也集成了HTTP处理功能，可以独立运行。

- 在我们的学习、开发过程中，最先接触到的一般都是**Tomcat**，之后出于对分离<span style=background:#ffb8b8>静态资源</span>、<span style=background:#f8d2ff>动态资源</span>的处理以提升性能的需要，才接触到**Nginx**，认为**Nginx**是**Tomcat**的扩展。
- 其实，究竟谁是谁的扩展，不重要，能解决问题才重要。

<span style=background:#fdc200>注意</span>：**Tomcat**虽然能够完成与HTTP服务器相同的功能，但是对<span style=background:#ffb8b8>静态资源</span>的处理能力比不上专业的HTTP处理器，即，术业有专攻。

> 诚然，人是人，机器是机器。但如果一台机器长得像人，会说人话，能跟人一样干活，那它跟人没什么区别，对资本家来说。或者说人跟机器没什么区别，在资本家面前。

如上所述，这就是[三者之间的关系](ttps://www.zhihu.com/question/32212996/answer/250278240)。