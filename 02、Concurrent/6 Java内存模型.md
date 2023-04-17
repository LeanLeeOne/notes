## JMM

线程通信有“共享内存”和“消息”两种方式，Java的`synchronized`采用的是“共享内存”的方式，<span style=background:#c9ccff>堆</span>中的**锁对象**就是共享的内存块。

说到”共享内存“，就需要了解[Java的内存模型](https://www.infoq.cn/profile/1C70A577591245/publish)了（Java Memory Model，**JMM**）。

### 主存与工作内存

JVM中，变量保存在**主存**中，但是线程会在自己的**工作内存**中对变量创建一份副本，线程修改值时只修改自己的**工作内存**中的变量的值，之后由JVM择机更新到**主存**中，而非立刻更新，而对共享变量来说，即便立即更新到**主存**，其它线程的**工作内存**中保存的值仍然为旧值，需要重新读取，总之，**主存**中的值与各个线程**工作内存**中的值很容易不一致。

> 这种不一致也叫做不可见。
>
> x86架构回写**主存**的速度很快，在低负载下不容易发生可见性问题；但是ARM架构会有显著延迟，容易发生可见性问题。

JMM定义了`8`种**主存**与**工作内存**的交互操作，这里不做展开介绍。

> read、load、use、assign、store、write、lock、unlock。

### JMM的3大特性

#### 原子性

操作不会被打断。

上面说的`8`种操作均满足**原子性**，确切地说是单个操作满足**原子性**，组合操作不满足。

JVM没有明确规定`64位`的`long`、`double`的赋值是否为原子操作，但在x64平台，JVM是按原子操作实现的。

#### 可见性

即**主存**与**工作内存**数据保持一致。

#### 有序性

Java编译器和处理器为了提高指令的运行效率，在保证运行结果相同的前提下，会对不存在数据依赖性的指令进行重新排序（Instruction Reorder）。

即编译后的代码的执行顺序会被打乱，而这里的”保证结果相同“仅指串行环境（单线程）。

Java有`8`条**先发性规则**实现了基本的有序性，这些规则要求书写在前面的操作必须**发生于**（`happens-before`）书写在后面的操作之前。

> 单线程规则、**Monitor**规则、`volatile`规则、线程启动规则、线程加入规则、线程中断规则、对象终结规则、传递性。



## 对象的创建过程

[Java对象的内存模型](https://www.cnblogs.com/duanxz/p/4967042.html)包括`3`部分：1.对象头、2.实例数据、3.对齐填充。

对象的创建过程分为`4`步：

1. ##### 加载类
   
   1. JVM首先会判断类是否已经加载，即，类的符号引用是否在常量池中，以及符号引用所代表的类是否已解析、初始化。
2. ##### 分配内存空间
   
   1. 选择哪种分配方式由<span style=background:#c9ccff>堆</span>是否规整决定，而<span style=background:#c9ccff>堆</span>是否规整又由所采用的垃圾收集器是否带有**压缩整理**功能决定：
      1. 内存规整的将采用<u>指针碰撞法</u>（Bump The Pointer），`Serial`、`ParNew`等带`Mark-Compact`过程的收集器会采用该方法。
      2. 内存不规整的将采用<u>空闲列表法</u>（Free List），`CMS`这种基于`Mark-Sweep`的收集器通常会采用该方法。
   2. 分配内存时有`2`种方式保证线程安全：
      1. 对分配内存的动作进行同步，JVM采用**CAS**+失败重试的方式保证更新操作的原子性。
      2. 把分配内存的动作按照线程划分到不同的空间，即，每个线程在<span style=background:#c9ccff>堆</span>中预分配一小块空间，这块空间被称为TLAB，Thread Local Allocation Buffer，本地线程分配缓冲区。
3. ##### 初始化实例数据
   
   1. 将实例数据初始化为`0`。
4. ##### 填充对象头
   
   1. 包括<span style=background:#d4fe7f>Mark Word</span>、类型指针等。

上述工作完成后，会调用`<init>`方法，完成初始赋值和构造函数的调用。



## 对象的访问定位

Java程序通过<span style=background:#f8d2ff>栈</span>中的`reference`来操作<span style=background:#c9ccff>堆</span>中的具体对象，但JVM规范只规定了`reference`类型是一个指向对象的引用，并没有规定引用的具体实现方式，而具体的实现方式主要有`2`种。

### 句柄

<span style=background:#c9ccff>堆</span>中会划分出一块空间作为句柄池，`reference`保存对象的句柄的**地址**，句柄包含对象的<span style=background:#c2e2ff>数据</span>和<span style=background:#c2e2ff>类型</span>的**地址**。

这种方式，句柄的**地址**稳定，移动对象时（多发生于垃圾收集）只需改变句柄中存放的<span style=background:#c2e2ff>对象数据</span>的**地址**即可，句柄法广泛存在于各种语言、框架。

![](../images/2/read_object_by_handler.png)

### 直接指针

`reference`直接保存对象的**地址**，对象需要存放<span style=background:#c2e2ff>对象类型</span>的**地址**。

这种方式开销小、速度快，HotSpot就是采用的这种。

![](../images/2/read_object_by_pointer.png)




## Volatile[[1]](https://www.cnblogs.com/dolphin0520/p/3920373.html)⭐

线程间共享变量往往需要<span style=background:#ffb8b8>使用`volatile`修饰</span>，确保每个线程都能读取到最新的值。

### 保证可见性

对<span style=background:#ffb8b8>经`volatile`修饰的变量</span>的修改，会立即更新到**主存**中，而且持有该变量副本的线程也会立即更新**工作内存**中的值。

`volatile`之所以不能与`final`同时使用，是因为<span style=background:#f8d2ff>经`final`修饰的变量</span>已经是不可变的了，即，无需保证可见性。

### 保证有序性

对<span style=background:#ffb8b8>经`volatile`修饰的变量</span>的修改操作，是通过插入<span style=background:#c2e2ff>内存屏障</span>来实现有序性的。

> 更确切地说，`volatile`是通过在指令前增加`lock`前缀，来锁住一个对寄存器加`0`的空操作，来实现<span style=background:#c2e2ff>内存屏障</span>。

> By the way，`synchronized`在加锁、解锁都会引发一次<span style=background:#c2e2ff>内存屏障</span>来强制线程本地内存和主存之间的同步。

### 不保证原子性

以自增操作`i++`为例，该指令实际上是两条指令：

```java
var temp = i + 1; // 计算“i+1”，并将其结果保存到一个临时变量中，临时变量在寄存器中，不涉及主存
i = temp;         // 将临时变量的值赋予给变量i，i会立即更新到主存
```

如果线程执行完第一条指令就被阻塞了，而此时其它线程更新了`i`的值，被唤醒后的线程的`i`是会更新（可见性），但临时变量不会更新，它持有的值仍是根据旧的`i`的值计算出来的，而这个失效的旧值又会赋予给`i`。

这种场景需配合**CAS**。

### 另外

编译器会对<span style=background:#ffb8b8>经`volatile`修饰的变量</span>进行分析，如果该变量仅被单个线程访问，那么编译器会将该变量当作普通变量来对待。

> 与**锁消除**同理。



## Final

说到`final`与并发：[final、局部变量、并发](https://segmentfault.com/q/1010000019193209)。

`final`还会禁止部分重排序，以保证读取到的<span style=background:#f8d2ff>经`final`修饰的变量</span>是用户代码初始化后的值。

Java提供最小安全保障，即，所有的变量都会被JVM初始化，均有默认值（`null`也可以看作是值），但对<span style=background:#f8d2ff>经`final`修饰的变量</span>来说，我们不希望得到的是这些默认值，而是用户代码初始化变量时赋予的值。

除了<span style=background:#f8d2ff>经`final`修饰的变量</span>，`String`、枚举类型、`Number`的部分子类都是不可变的，而不可变就意味着线程安全。



## 总线风暴[[2]](https://cloud.tencent.com/developer/article/1707875)

### 高速缓冲存储器一致性

CPU会将**主存**中的数据读到自己的Cache（高速缓冲存储器，简称缓存）中，在多核处理器普及的今天，**主存**中的共享变量可能存在于多个核心的**缓存**中，当其中一个**核心**修改了自己**缓存**中的变量并将其更新到**主存**后，其它**核心**的**缓存**中的变量就与**主存**中的变量不一致了，即，失效了。

这时我们需要一定的机制，让其它**核心**重新从**主存**中读取该变量到自己的**缓存**中，这样**缓存**就一致了。

1. 核心与**主存**交换数据时会<u>锁住总线</u>。
2. MESI协议是通用的缓存一致性机制，~~每个处理器会嗅探总线上传播的数据并检查自己缓存中的值是否失效~~，确切地说他只是一种约束，没有具体干啥工作（[见评论区](https://zhuanlan.zhihu.com/p/137193948)）。

### Volatile与总线风暴

共享变量大概率会出现缓存不一致，可<span style=background:#ffb8b8>用`volatile`修饰</span>这些变量。

<span style=background:#ffb8b8>经`volatile`修饰的变量</span>将缓存恢复一致的过程会<u>锁住总线</u>，**CAS**也会<u>锁住总线</u>，所以当对<span style=background:#ffb8b8>经`volatile`修饰的变量</span>频繁进行**CAS**时，总线会被频繁<u>锁住</u>，或者说流量激增，如同刮起了<span style=background:#c9ccff>风暴</span>。

