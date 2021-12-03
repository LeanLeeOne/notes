## Buffer

上文中，为了突出“NIO如何<span style=background:#993af9;color:white>实现高并发</span>”这一重点，我们没有对`Buffer`进行详细介绍，下面将对`Buffer`做详细介绍。

Java中只能通过`Buffer`来与`Channel`进行数据交换。

### 属性

`Buffer`实际上是一个数组，但又不仅仅是一个数组，还有3个重要属性：

1. `capacity`：最大容量。
2. `position`：已经读写的元素下标。
3. `limit`：还能读写的元素下标。

### 方法

以下方法正是通过操作这3个属性来实现相应功能的：

1. `Buffer.flip()`：将状态由**读**<span style=background:#c2e2ff>切换</span>为**写**。
2. `Buffer.clear()`：<span style=background:#c2e2ff>清空</span>数据。
3. `Buffer.rewind()`：用于<span style=background:#c2e2ff>重复读</span>。
4. `Buffer.compact()`：将<span style=background:#c2e2ff>未读取</span>的数据拷贝到`Buffer`的头部。
5. `Buffer.mark()/reset()`：`mark`一个位置，`reset`到该位置。

### 实现类

`Buffer`有多种实现类：`ByteBuffer`、`CharBuffer`、`LongBuffer`、`DoubleBuffer`等。

`ByteBuffer`是最常用的，而`ByteBuffer`又有3种常用子类：

1. <span style=background:#ffb8b8>HeapByteBuffer</span>
   
   1. `ByteBuffer.allocate(int)`中使用的就是这个类。
   
      ```java
      class HeapByteBuffer extends ByteBuffer {...}
      ```
   
2. <span style=background:#c9ccff>MappedByteBuffer</span>

   1. 将内存中的`Buffer`直接映射到磁盘的文件上。

      ```java
      public class MappedByteBuffer extends ByteBuffer {...}
      ```

3. <span style=background:#f8d2ff>DirectByteBuffer</span>

   1. IO通常分为<span style=background:#d4fe7f>网卡与内核空间的IO</span>、<span style=background:#d4fe7f>内核空间与用户空间的IO</span>两步，而<span style=background:#f8d2ff>DirectByteBuffer</span>能省去<span style=background:#d4fe7f>内核空间与用户空间的IO</span>这一步（Zero Copy）。

   2. 但<span style=background:#f8d2ff>DirectByteBuffer</span>的创建、销毁成本更高，且更不易维护，往往需要搭配内存池来使用。

   3. 所以中小型应用适合<span style=background:#ffb8b8>HeapByteBuffer</span>，大型应用适合<span style=background:#f8d2ff>DirectByteBuffer</span>。

      ```java
      class DirectByteBuffer extends MappedByteBuffer implements DirectBuffer {...}
      ```

[**Buffer**和**Cache**的区别](https://www.geeksforgeeks.org/difference-between-buffer-and-cache/)主要在于：`Buffer`是IO中的概念，起到批量发送的作用；`Cache`用于加速CPU对内存的访问、内存对硬盘的访问。



## 对多路复用模型的补充

其实，<span style=background:#c2e2ff>多路复用</span>模型可用饭店就餐的比喻来引出：

1. `Selector`好比服务员，<span style=background:#d4fe7f>事件处理器</span>好比食客。
2. <u>BIO+多线程</u>的组合相当于每张桌子配一个服务员，<u>NIO+<span style=background:#c2e2ff>多路复用</span></u>的组合相当于多张桌子配一个服务员。
3. 食客入座思考、讨论要吃什么，“服务员一直旁边等待点餐”的过程相当于**BIO**，而“服务员不等待、每隔一段时间过来询问食客想好没”的过程相当于**NIO**，“食客扫码自助点餐”的过程相当于**AIO**。

### 对4类事件的补充

1. ##### Read

   1. **1<<0**，<span style=background:#19d02a>值为</span>**1**。
   2. <span style=background:#19d02a>于</span><span style=background:#f8d2ff>服务端</span>完成与客户端的连接（**Accept**之后）、<span style=background:#ffb8b8>客户端</span>启动时注册该事件。
   3. 收到数据时就会<span style=background:#19d02a>触发</span>该事件。

2. ##### Write
   
      1. **1<<2**，<span style=background:#19d02a>值为</span>**4**。<span style=background:#ffee7c>（为什么跳过了2，直接从1到了4？）</span>
      
      2. <span style=background:#19d02a>于</span>需要写时注册该事件。
      
      3. 注册完后，可调用`Selector.wakeup()`来解除`Selector.select()/select(long)`中的阻塞，来立即触发<span style=background:#c2e2ff>写事件</span>。
      
      4. [底层缓冲区为空时就会<span style=background:#19d02a>触发</span>](https://segmentfault.com/a/1190000017777939)该事件：
         1. 要触发<span style=background:#c2e2ff>写事件</span>需要`Channel`先在`Selector`中注册<span style=background:#c2e2ff>写事件</span>。
         2. 当底层缓冲区为空时就会**触发**<span style=background:#c2e2ff>写事件</span>，而底层缓冲区在大部分时候都是空闲的，所以，一般注册了<span style=background:#c2e2ff>写事件</span>，就会立刻、不停地触发，而这会导致CPU空转。
            1. 所以为了避免CPU空转，我们需要在写操作完成后将<span style=background:#c2e2ff>写事件</span>注销，下次有些操作需要时再重新注册<span style=background:#c2e2ff>写事件</span>。
            2. 另外，`Buffer`与`Channel`是两个独立的对象，往`Buffer`中`put`数据并不会触发<span style=background:#c2e2ff>写事件</span>。
      5. 推荐使用注册<span style=background:#c2e2ff>写事件</span>的方式发送数据，因为底层缓冲区可能已满，这时如果直接调用`channel.write()`会令CPU陷入空等。
      
3. ##### Connect
   
   1. **1<<3**，<span style=background:#19d02a>值为</span>**8**。
   2. <span style=background:#19d02a>于</span><span style=background:#ffb8b8>客户端</span>启动时注册该事件。
   3. 与<span style=background:#f8d2ff>服务端</span>建立连接后就会<span style=background:#19d02a>触发</span>该事件。
   4. 该事件发生于三次握手之前，所以需要调用`channel.finishConnect()`确保连接完成。
   5. 发生于重连，或直接异步调用`connect`时。<span style=background:#ffee7c>（存疑）</span>
   
4. ##### Accept

   1. **1<<4**，<span style=background:#19d02a>值为</span>**16**。
   2. <span style=background:#19d02a>于</span><span style=background:#f8d2ff>服务端</span>刚启动时注册该事件。
   3. 与<span style=background:#ffb8b8>客户端</span>建立连接后就会<span style=background:#19d02a>触发</span>该事件。

### 注册方法

4类事件均可通过`SelectionKey.interestOps()`进行注册。

`connect`、`read`、`write`等还可通过`SocketChannel.register()`进行注册。

`accept`还可通过`ServerSocketChannel.register()`进行注册。

**注销**事件应调用`SelectionKey.interestOps()`~~而非SelectableChannel.register()和key.cancel()，[因为](https://www.cnblogs.com/burgeen/p/3618059.html)每个SocketChannel只对应一个SelectionKey（纯属放屁）~~。

1. 还可调用`SelectableChannel.register()`，阅读源码可知，该方法最终还是调用的`SelectionKey.interestOps()`。
2. `SelectionKey.cancel()`会将Key直接注销，Key都注销了，Key对应的事件当然也会被注销；但是调用该方法后，`Selector`不会立刻移除相应的Key，而是等下一次调用`Selector.select()`时才会将其移除。<span style=background:#ffee7c>（那这会有隐患吗？）</span>

### 网络编程的一般步骤

##### 服务端

<span style=background:#b3b3b3>create -> bind -> </span><span style=background:#e6e6e6>listen -> accept -> </span><span style=background:#b3b3b3>read/write -> close</span>。

##### 客户端

<span style=background:#b3b3b3>create -></span><span style=background:#e6e6e6>               connect ->             </span><span style=background:#b3b3b3>read/write -> close</span>。

其中`ServerSocketChannel.bind(address)`与`ServerSocketChannel.socket().bind(address)`在使用上[没有区别](https://stackoverflow.com/questions/26459002/accept-and-bind-in-serversocket-and-serversocketchannel)，只是前者是Java7中新增的方法。

具体实例代码可参照[文章](https://blog.csdn.net/cold___play/article/details/106663776)。



## Linux Select

**select**以及**poll**[是最早的](https://blog.hufeifei.cn/2021/06/13/Java/nio/#netty-mina)<span style=background:#c2e2ff>多路复用</span>技术：

1. **select**，开源，是伯克利分校于1983年加入的。
2. **poll**，闭源，是AT&T于1986年加入的。

两者功能相似，细节略有差异。

如今，**select**、**poll**接口均被定义在[POSIX](https://zh.wikipedia.org/wiki/可移植操作系统接口)标准中，几乎所有的操作系统都有实现。

![](../images/4/select-wait.awebp)

![](../images/4/select-active.awebp)

**select**[的工作过程](https://juejin.cn/post/6844903954917097486)如以上2张图所示：

1. 每个**Socket**都会对应一个<span style=background:#c9ccff>File Descriptor</span>，而这些<span style=background:#c9ccff>File Descriptor</span>存放于<u>文件列表</u>中。
2. 一个个的应用程序进程存放于<u>工作队列</u>中。
3. <u>进程A</u>调用**select**陷入阻塞，内核将其从<u>工作队列</u>移入<u>等待队列</u>，<u>进程A</u>监视的所有**Socket**都会放入内核，而<u>进程A</u>也会放入每个它所监视的**Socket**中。
4. 当<u>进程A</u>监听的某个**Socket**接收到数据后，内核就会唤醒<u>进程A</u>，即，将<u>进程A</u>由<u>等待队列</u>移入<u>工作队列</u>。
5. 当<u>进程A</u>被分配时间片后开始执行，由于<u>进程A</u>不知道是哪个**Socket**接收到了数据，所以<u>进程A</u>会遍历其监听的所有**Socket**。

不难看出，**select**、**poll**存在诸多不足：

1. 以线性方式<span style=background:#c2e2ff>扫描</span><span style=background:#c9ccff>File Descriptor</span>，效率低。
2. **select**仍会扫描<span style=background:#c2e2ff>已经关闭</span>的<span style=background:#c9ccff>File Descriptor</span>；**poll**倒是可以compact掉已经关闭的<span style=background:#c9ccff>FileDescriptor</span>。
3. **select**占用空间小；但**poll**占用空间多，`64bit`。同时两者都会再<span style=background:#c2e2ff>内核/用户空间</span>来回复制大量句柄数据结构，开销大。
4. **select**默认能处理`1024`个<span style=background:#c9ccff>File Descriptor</span>；**poll**使用链表保存<span style=background:#c9ccff>File Descriptor</span>。

正是因为以上不足，基于**select**、**poll**的服务端[难以实现10万级的并发](https://www.cnblogs.com/shoshana-kong/p/10932221.html)，所以才有了**epoll**、**kqueue**、**IOCP**：

1. **epoll**改为从<u>就绪链表</u>中读取事件，时间复杂度将为`O(1)`。
2. **kqueue**开源，与**epoll**功能相似。
3. **IOCP**是Windows版的接口。



## Linux Epoll

![](../images/4/epoll-wait.awebp)

![](../images/4/epoll-queue.awebp)

**epoll**的主要改进是增加了<u>就绪链表</u>（eventpoll中的rdlist）：

1. 进程调用`epoll_ctl()`向内核中为监听的每一个**Socket**注册新的描述符以及回调函数。
   1. 已注册的描述符在内核中会被维护在一棵红黑树上。
2. 当**Socket**接收到数据后，就会回调，并将对应的描述符加入到<u>就绪链表</u>中。
3. 进程被唤醒后会调用`epoll_wait()`，无需遍历，直接从<u>就绪链表</u>中获取描述符。

不难看出，**epoll**仅需将描述符从**用户**空间向**内核**空间复制一次，且不需要通过轮询来获取事件完成的描述符。



## Select、Poll、Epoll

**select**、**poll**、**epoll**的[应用场景略有差异](https://www.cyc2018.xyz/计算机基础/Socket/Socket.html#应用场景)：

1. **select**精度为微秒，比**poll**、**epoll**的毫秒要实时。
2. **poll**的<span style=background:#c9ccff>File Descriptor</span>没有数量限制。
3. **epoll**只能运行在Linux上，并且并发量少的场景中，**epoll**不足以发挥优势。


