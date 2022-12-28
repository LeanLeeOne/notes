## Netty特点

**Netty**是一个异步事件驱动的**NIO**服务端-客户端框架。

**Netty**的3个特点：并发高、传输快、封装好。

1. 并发高是因为采用了**NIO**模型。
   1. **BIO**：阻塞整个过程，连接数少时，延迟较低，适用于数据库连接等场景。
   2. **NIO**：阻塞业务处理，但不阻塞数据接收，也就是多路复用，适用于高并发逻辑简单的场景。
2. 传输快是因为采用了**零拷贝**技术。
   1. 对接收方来说，一般的网络传输，是先将数据保存到**NIO**缓冲区，然后再从**Socket**缓冲区复制到Java程序的内存中。
   2. 而**Netty**直接开辟内存（堆、直接内存），数据直接保存到开辟的内存中，少了复制过程。
3. 封装好
   1. **Netty**其实就是对`java.nio`进行了封装，免去了繁琐的细节，简化了使用。
   2. codec，是**Netty**的编码、解码器。
   3. 支持多种主流协议，HTTP、FTP、XML、JSON、Avro、ProtoBuf（Protocol Buffers）。



## Netty与NIO

一般的**NIO**模型会设置两个线程，每个线程绑定一个轮询器（Selector），其中一个负责获取新连接，另一个负责读写数据。

**Netty**默认线程数是CPU核心数的2倍，`bind`之后启动。

阅读源码可知，**Netty**会从`1`、`系统属性`、`CPU核心数*2` 这三个值中取出一个最大的作为默认线程数。



## 缓存

内存开辟有三种模式，<span style=background:#ffb8b8>Heap Buffer</span>、<span style=background:#f8d2ff>Direct Buffer</span>和两者的结合<span style=background:#c2e2ff>Composite Buffer</span>。

- 使用<span style=background:#ffb8b8>Heap Buffer</span>，会多一步向直接内存中复制的过程，然后才将副本发送到<span style=background:#ffb8b8>Heap Buffer</span>。
  - 并且会组合多个<span style=background:#ffb8b8>Heap Buffer</span>对象作为一个来进行操作。
- <span style=background:#f8d2ff>Direct Buffer</span>是调用本地方法在内存中直接开辟，不受JVM的管理，也就没有**GC**一说，不受高负载情况下频繁**GC**中断的影响。
  - `-XXMaxDirectMemorySize=xxxM`
- <span style=background:#c2e2ff>Composite Buffer</span>可以将多个**Buffer**合并为一个，避免了拷贝。
  - **Netty**还支持**Buffer**分解，也减少了拷贝。



## 核心类

1. **Channel**：管道，接口类，提供基本的IO操作，以及`bind`、`connect`、`read`、`write`等操作。
   1. 常见的两个实现类而**NioServerSocketChannel**（服务端）和**NioSocketChannel**（客户端）。
2. **EventLoop**：事件循环，定义了**Netty**的核心抽象，用于处理**Channel**的生命周期中的所有事件。
3. **EventloopGroup**：一组**EventLoop**。
4. **ChannelFuture**：类似于Java中的**Future**类，提供异步的结果响应。
5. **ChannelHandler**：真正处理数据的类。
6. **ChannelPipeline**：由一组**ChannelHandler**组成的调用链。
7. **Bootstrap**、**ServerBootstrap** ，服务端、客户端的启动引导类，负责对象的创建、初始化、连接的建立关闭、端口的绑定等。
8. **IdleStateHandler**：维护心跳，让对方（客户端或者服务端）知晓自己的存活。

![](../images/4/netty_structure.png)



## 示例代码

```java
// 1.bossGroup 用于接收连接，workerGroup 用于具体的处理
EventLoopGroup bossGroup = new NioEventLoopGroup(1);
EventLoopGroup workerGroup = new NioEventLoopGroup();
try {
    //2.创建服务端启动引导/辅助类：ServerBootstrap
    ServerBootstrap b = new ServerBootstrap();
    //3.给引导类配置两大线程组,确定了线程模型
    b.group(bossGroup, workerGroup)
            // (非必备)打印日志
            .handler(new LoggingHandler(LogLevel.INFO))
            // 4.指定 IO 模型
            .channel(NioServerSocketChannel.class)
            .childHandler(new ChannelInitializer<SocketChannel>() {
                @Override
                public void initChannel(SocketChannel ch) {
                    ChannelPipeline p = ch.pipeline();
                    //5.可以自定义客户端消息的业务处理逻辑
                    p.addLast(new HelloServerHandler());
                }
            });
    // 6.绑定端口,调用 sync 方法阻塞知道绑定完成
    ChannelFuture f = b.bind(port).sync();
    // 7.阻塞等待直到服务器Channel关闭(closeFuture()方法获取Channel 的CloseFuture对象,然后调用sync()方法)
    f.channel().closeFuture().sync();
} finally {
    //8.优雅关闭相关线程组资源
    bossGroup.shutdownGracefully();
    workerGroup.shutdownGracefully();
}
```



## 解码器

**Netty**自带了几种解码器：

`LineBasedFrameDecoder`：换行符分隔。

`DelimiterBasedFrameDecoder`：自定义分隔符。

`FixedLengthFrameDecoder`：定长分割。

`LengthFieldBasedFrameDecoder`：自定义解码器。



## Netty与Tomcat

**Netty**、**Tomcat**都涉及网络IO。

不同点在于**Tomcat**专，而**Netty**广。：

- **Tomcat**的核心是**Servlet**，**Tomcat**是一个了**Servlet**容器，提供基于HTTP的Web服务。
- 而**Netty**是一个IO框架，IO是网络程序的核心，并且**Netty**支持多种协议，所以基于**Netty**我们可以实现HTTP、FTP、UDP等各种服务器。



## 补充

压根儿就没有所谓的<span style=background:#c2e2ff>粘包</span>问题，因为TCP是面向流的协议，所以当：

- 开发者没有定义好消息边界才会造成有时一下子收到多个报文的问题。
- 或者发送的消息内容太小，TCP会将其合并为一个报文发送。

> **Elasticsearch**也用到了**Netty**。

<span style=background:#ffee7c>异步IO与Netty</span>

