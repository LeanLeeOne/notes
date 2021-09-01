[Java并发编程：volatile关键字解析](https://www.cnblogs.com/dolphin0520/p/3920373.html)

https://zhuanlan.zhihu.com/p/137193948





### JMM

线程通信有“共享内存”和“消息”两种方式，Java的**synchronized**采用的是“共享内存”的方式，堆中的锁对象就算共享的内存块。

说到”共享内存“，就需要了解[Java的内存模型](https://www.infoq.cn/profile/1C70A577591245/publish)了（Java Memory Model，**JMM**）。

1. **主存与工作内存**（**Memory**与**CPU Cache**）
   1. JVM中，变量保存在主存（**Memory**）中，但是线程会在自己的**工作内存**（**CPU Cache**）中对变量创建一份副本，线程修改值时只修改自己的**工作内存**中的变量的值，之后由JVM择机更新到主存中，而非立刻更新，而对共享变量来说，即便立即更新到主存，其他线程的**工作内存**中保存的值仍然为旧值，需要重新读取，总之，主存中的值与各个线程**工作内存**中的值很容易不一致。这种不一致也叫做不可见。
   2. x86架构回写主存的速度很快，在低负载下不容易发生可见性问题；但是ARM架构会有显著延迟，容易发生<span style=background:#c2e2ff>可见性</span>问题。
   3. JMM定义了8种主存与**工作内存**的交互操作，这里不做展开介绍。
      1. read、load、use、assign、store、write、lock、unlock。
   
2. **JMM**的3大特性：

   1. **原子性**
      1. 操作不会被打断。
      2. 上面说的8种操作均满足**原子性**，确切地说是单个操作满足**原子性**，组合操作不满足。
      3. JVM没有明确规定64位的long、double的赋值是否为原子操作，但在x64平台，JVM是按原子操作实现的。
   2. **可见性**

      1. 即主存与工作内存数据保持一致。

   3. **有序性**
      1. Java编译器和处理器为了提高指令的运行效率，在保证运行结果相同的前提下，会对不存在数据依赖性的指令进行重新排序（Instruction Reorder）。
      2. 即编译后的代码的执行顺序会被打乱，而这里的”保证结果相同“仅指串行环境（单线程）。
      3. Java有8条**先发性规则**实现了基本的有序性，这些规则要求书写在前面的操作必须**发生于**（happens-before）书写在后面的操作之前：单线程规则、Monitor规则、volatile规则、线程启动规则、线程加入规则、线程中断规则、对象终结规则、传递性。




### [Volatile](https://www.cnblogs.com/dolphin0520/p/3920373.html)

1. 保证**可见性**

   1. <span style=background:#ffb8b8>经**volatile**修饰的变量</span>，**工作内存**中的值被修改后会立即更新到主存中，而且持有该变量副本的线程也会立即更新**工作内存**中的值。
   2. 线程间共享变量往往需要<span style=background:#ffb8b8>使用**volatile**修饰</span>，确保每个线程都能读取到最新的值。
   3. **volatile**之所以不能与**final**同时使用，是因为<span style=background:#f8d2ff>经**final**修饰的变量</span>已经是不可变的了，即无需保证可见性。

2. 保证**有序性**

   1. **volatile**会通过插入<span style=background:#c2e2ff>内存屏障</span>（指令前会多一个”lock“前缀）来禁止**重排序**、保证一定的有序性。<span style=background:#c2e2ff>内存屏障</span>后面的指令无法放到前面来执行。

3. 不保证**原子性**

   1. 以自增操作<span style=background:#b3b3b3>i++</span>为例，该指令实际上是两条指令：

   ```java
   var temp = i + 1; // 计算“i+1”，并将其结果保存到一个临时变量中，临时变量在寄存器中，不涉及主存
   i = temp;         // 将临时变量的值赋予给变量i，i会立即更新到主存
   ```

   2. 如果线程执行完第一条指令就被阻塞了，而此时其他线程更新了i的值，被唤醒后的线程的i是会更新（可见性），但临时变量不会更新，它持有的值仍是根据旧的i的值计算出来的，而这个失效的旧值又会赋予给i。
   3. 这种场景需配合**CAS**。

3. 另外，编译器会对<span style=background:#ffb8b8>经**volatile**修饰的变量</span>进行分析，如果该变量仅被单个线程访问，那么编译器会将该变量当作普通变量来对待。（与**锁消除**同理）



### Final

说到**final**与并发：[final、局部变量、并发](https://segmentfault.com/q/1010000019193209)

**final**还会禁止部分重排序，以保证读取到的<span style=background:#f8d2ff>经**final**修饰的变量</span>是用户代码初始化后的值。

Java提供最小安全保障，即所有的变量都有会被JVM初始化，均有默认值（Null也可以看作是值），但对<span style=background:#f8d2ff>经**final**修饰的变量</span>来说，我们不希望得到的是这些默认值，而是用户代码初始化变量时赋予的值。

不可变就意味着线程安全，除了<span style=background:#f8d2ff>经**final**修饰的变量</span>，String、枚举类型、Number的部分子类都是不可变的。



### [总线风暴](https://cloud.tencent.com/developer/article/1707875)

1. **高速缓冲存储器一致性**
   1. CPU会将主存中的数据读到自己的Cache（高速缓冲存储器，简称缓存）中，在多核处理器普及的今天，主存中的共享变量可能存在于多个核心的**缓存**中，当其中一个**核心**修改了自己**缓存**中的变量并将其更新到主存后，其它**核心**的**缓存**中的变量就与主存中的变量不一致了，即失效了。
   2. 这时我们需要一定的机制，让其他**核心**重新从主存中读取该变量到自己的缓存中，这样缓存就一致了。
   
      1. 核心与主存交换数据时会<u>锁住总线</u>。
      2. MESI协议是通用的缓存一致性机制，每个处理器会嗅探总线上传播的数据并检查自己缓存中的值是否失效。
   
3. 共享变量大概率会出现缓存不一致，可<span style=background:#ffb8b8>用**volatile**修饰</span>这些变量。<span style=background:#ffb8b8>经**volatile**修饰的变量</span>将缓存恢复一致的过程会<u>锁住总线</u>，**CAS**也会<u>锁住总线</u>，所以当对<span style=background:#ffb8b8>经**volatile**修饰的变量</span>频繁进行**CAS**时，总线会被频繁<u>锁住</u>，或者说流量激增，如同刮起了<span style=background:#c9ccff>风暴</span>。
