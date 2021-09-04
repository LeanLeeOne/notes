**Apache HTTP Server**、**Apache Tomcat**、**Nginx**都是HTTP服务器（软件层面），是运行在服务器（硬件层面）上的应用程序。

HTTP服务器需要监听指定端口，处理请求，并返回响应，我们可以通过简述这三者的发展过程，来捋清它们之间的关系。



### Apach HTTP Server

1989年，HTTP协议诞生，之后出现了一系列HTTP服务器，其中一个广泛传播的服务器是用<span style=background:#c2e2ff>C语言</span>编写的NCSA HTTPd。

由于该服务器是开源的，许多开发者不断地给它增加功能，并针对不断出现的Bug打补丁。

1995年，一些有识之士看不下这种场面，于是成立小组重写了该服务器，将其取名为Apache，全称Apache HTTP Server。

Apache一语双关：

1. Apache是印第安人中最后一个屈服于美国政府的部落。服务器取此名称，寓意可靠、坚韧。
2. Apache与A Patchy同音，意为打满补丁的服务器，毕竟该服务器是基于打满补丁NCSA HTTPd服务器开发的。

1999年，Apache HTTPServer因其自身的稳定、功能丰富、灵活可扩展而获得了极大的成功，

Apache HTTP Server开发小组的成员们进一步成立了非营利性的Apache Software Foundation，来支持Apache HTTP Server及其相关软件的发展。

同时Apache HTTP Server也有自身的局限性，它只能处理HTML、图片等<span style=background:#ffb8b8>静态资源</span>，无法对请求中的数据加工处理，生成<span style=background:#f8d2ff>动态资源</span>的内容，于是便有了Apache Tomcat。



### Apache Tomcat

1999年，Apache Software Foundation与Sun合作推出了用<span style=background:#c2e2ff>Java</span>编写的Apache Tomcat。

如上文所述，传统的HTTP服务器无法动态生成资源，而本质为Servlet容器的Tomcat，通过运行我们编写的Servlet，解决动态内容的生成问题。

那Tomcat的[Catalina](https://www.zhihu.com/question/68213723/answer/260766297)又是个什么玩意儿呢？



### Nginx

2004年，Nginx（Engine X）诞生。

它跟Apache HTTP Server一样，是一种HTTP服务器，但是性能更高（资源占用少、并发数高）。

Nginx也是用<span style=background:#c2e2ff>C语言</span>编写的，是异步的。他的开发者在设计之初的目标，就是要超越同步的Apache HTTP Server。

Nginx确实做到了，Apache HTTP Server也基本淡出了我们的视野。



### 总结

Apache HTTP Server、Nginx是纯粹的HTTP服务器，主要处理<span style=background:#ffb8b8>静态资源</span>。

Tomcat是对HTTP服务器的<span style=background:#c2e2ff>扩展</span>，主要用于生成<span style=background:#f8d2ff>动态资源</span>。

Tomcat虽说是扩展，但是也集成了HTTP处理功能，可以独立运行。

1. 在我们的学习、开发过程中，最先接触到的一般都是Tomcat，之后由于对分离<span style=background:#ffb8b8>静态资源</span>、<span style=background:#f8d2ff>动态资源</span>的处理以提升性能的需要，才接触到Nginx，认为Nginx是Tomcat的扩展。
2. 究竟谁是谁的扩展，不重要；能解决问题才重要。

但要注意，Tomcat虽然能够完成与HTTP服务器相同的功能，但是对<span style=background:#ffb8b8>静态资源</span>的处理能力比不上专业的HTTP处理器，即，术业有专攻。

1. 诚然，人是人，机器是机器。但如果一台机器长得像人，会说人话，能跟人一样干活，那它跟人没什么区别，对资本家来说。或者说人跟机器没什么区别，在资本家面前。

如上所述，这就是[三者之间的关系](ttps://www.zhihu.com/question/32212996/answer/250278240)。