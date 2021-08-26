### 进程与线程

1. **关系**

2. 1. 进程与线程的关系就是<span style=background:#c2e2ff>任务</span>与<span style=background:#c2e2ff>子任务</span>。
   2. 一个JVM就是一个进程，而一个进程可以包含多个线程。
   3. 线程是<span style=background:#c2e2ff>独立调度</span>的基本单位。

3. **资源**

4. 1. 进程是资源分配的基本单位，线程不拥有资源，同一进程的多个线程<span style=background:#c2e2ff>共享</span>进程资源。

   2. 1. 资源是指内存、IO设备等。

   3. 也正因此，进程之间不会相互影响，进程更<span style=background:#c2e2ff>稳定</span>，不会因为其他进程挂掉而挂掉（主线程除外）。

   4. Process Control Block，PCB，进程控制块，描述进程的基本信息和运行状态。创建、销毁进程都是对PCB的操作。

5. **开销**

6. 1. 无论是创建、销毁，还是切换，进程开销都要大一些。

7. **通信**

8. 1. 线程间可以通过直接读写同一进程中的数据进行通信，但**进程间通信**需要额外的组件。

9. 

### 进程状态的切换

​    ![0](../images/2/process-state.png)

### 同步

1. <span style=background:#c9ccff>同步</span>与<span style=background:#d4fe7f>临界区</span>

2. 1. 多个线程对<span style=background:#c2e2ff>共享</span>资源的<span style=background:#c2e2ff>互斥</span>访问，简称<span style=background:#c9ccff>同步</span>（synchronization）。
   2. 互斥，即相互排斥，也就是在同一时刻，只允许多个线程中的一个执行某一代码块。
   3. 而这往往通过<span style=background:#c2e2ff>加锁</span>来实现，需要加锁的代码块也叫做**Critical Section**，<span style=background:#d4fe7f>临界区</span>。
   4. 同步执行会降低并发量，并且加锁、解锁会有额外开销。

3. **TSL**，**T**est and **S**et **L**ock。

4. 1. CPU指令，与我们平时说的**CAS**（Compare And Swap）原理一致，锁的基础。

   2. 1. 加锁时（0 => 1），将一个内存中的变量读取到寄存器中，然后将该内存变量设为非0值，然后判断寄存器的值是否为0。
      2. 如果非0，说明已经被其他进程加锁，则重复检测，直到为0。
      3. 如果为0，说明其他进程已经解锁，当前线程可以进行加锁。

   3. 该指令的读写操作在硬件层面上是不可打断的，即原子性的，具体做法为：

   4. 1. 执行**TSL**指令时锁住内存总线，禁止其它CPU在**TSL**指令结束前访问内存。

   5. 线程无法进入<span style=background:#d4fe7f>临界区</span>而进行等待时，可以使用基于**TSL**的**忙等待**（**自旋**）的方式。

   6. 1. **忙等待**会消耗CPU，并[导致优先级反转](https://www.beanlam.me/2018/sync-primitive/)。
      2. **阻塞**不同于**忙等待**，CPU不会分配时间片给被**阻塞**的线程。

5. **Semaphore**，**信号量**

6. 1. 一个整型变量，一种实现锁的<span style=background:#e6e6e6>原语</span>。

   2. 1. 内核提供给用户调用的过程或函数称为<span style=background:#e6e6e6>原语</span>（**Primitive**），<span style=background:#e6e6e6>原语</span>在执行过程中不允许被中断。

   3. 该变量对应2种操作：

   4. 1. **Down**：如果<span style=background:#c2e2ff>“**Semaphore > 0**”</span>，则<span style=background:#c2e2ff>“**Semaphore -= 1**”</span>；如果<span style=background:#c2e2ff>“**Semaphore = 0**”</span>，说明已经<span style=background:#c9ccff>加锁</span>，<span style=background:#ffb8b8>挂起</span>（阻塞、睡眠）当前进程，等待<span style=background:#c2e2ff>“**Semaphore > 0**”</span>。
      2. **Up**：令<span style=background:#c2e2ff>“**Semaphore += 1**”</span>，<span style=background:#c9ccff>唤醒</span>被阻塞的进程让其完成**Down**操作。

7. **Mutex**，**互斥量**

8. 1. 一种特殊的**Semaphore**，只有0、1两个值，0表示加锁，1表示解锁。



### 进程间通信

**IPC**，Inter-Process Communication，进程间相互通信，传递一些<span style=background:#c9ccff>同步</span>所需的信息。

1. 管道

2. 1. <span style=background:#b3b3b3>int pipe(int fd[2])</span>，<span style=background:#b3b3b3>fd[0]</span>用于读，<span style=background:#b3b3b3>fd[1]</span>用于写。
   2. 半双工。
   3. 只能用于父子进程或兄弟进程。

3. FIFO

4. 1. <span style=background:#b3b3b3>int mkfifl(...)</span>，<span style=background:#b3b3b3>int mkfifoat(...)</span>。
   2. 也称为命名管道，去除了上面**1.c**提到的限制。
   3. 常用于“Server/Client”应用中，作为汇聚点在Server和Client之间传递数据。

5. 消息队列

6. 1. 解耦（独立）、异步、分类。

7. 信号量

8. 1. 略。

9. 共享储存

10. 1. 速度快，需要使用信号量控制同步。

11. Socket

12. 1. 略。