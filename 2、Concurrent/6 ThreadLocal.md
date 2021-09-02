### 参数传递

线程需要调用其他类的方法，调用时往往需要传递变量，线程可以直接通过方法参数传递变量，也可以通过将要传递的变量托付给第三者，然后被调用的方法再从第三者中获取变量的方式，而这个第三者往往是是一个静态的**ThreadLocal**。

通过方法参数的这种方式，在调用链中存在不便修改的第三方库，且这个库中的相关方法没有提供我们这个方法参数时，我们的变量就传递不下去了；而托付给第三者的方式不会有这个问题，这也是**ThreadLocal**诞生的意义。



### ThreadLocal实现原理

**ThreadLocal**不是真正存储数据的地方，其内部类**ThreadLocalMap**才是，**ThreadLocalMap**的key不是Thread是**ThreadLocal**。

**ThreadLocalMap**没有实现Map接口，但是结构与HashMap相似。ThreadLocalMap使用<span style=background:#c2e2ff>开发地址法</span>解决冲突，没有采用<span style=background:#c2e2ff>拉链法</span>。

**ThreadLocal**使用哈希方式查找，并且是<span style=background:#c2e2ff>开发地址法</span>，效率较低，所以Netty的**FastThreadLocal**采用下标的方式进行查找。



### ThreadLocal的内存泄漏问题

```java
static class Entry extends WeakReference<ThreadLocal<?>> {
    Object value;
    Entry(ThreadLocal<?> k, Object v) {
        super(k);
        value = v;
    }
}
```

可以看出，key为弱引用，value为强引用，并且**ThreadLocal**是key。

所以当**TheadLocal**使用完毕，也就是没有强引用指向该**ThreadLocal**（key）时，**ThreadLocal**只剩弱引用，会被清理，key也就变为null了；但是value和value指向的对象仍为强引用，不会被回收，从而导致<span style=background:#c2e2ff>内存泄漏</span>。

**ThreadLocal**清楚这点，所以在set、get、remove方法内都会将key为null的Entry删掉，避免<span style=background:#c2e2ff>内存泄漏</span>。

当然，如果不调用这些方法，则无法解决，这也是为什么要求使用完**ThreadLocal**后要remove的原因。

key如果设计成强引用的话，就会与value一样，发生内存泄漏.



### [ThreadLocal的使用场景](https://mp.weixin.qq.com/s/9gXSrw6llYy29OPH-rQuxQ)

1. 链路日志增强。

2. 缓存，减少重复调用。
   1. 将调用接口得到的数据保存到**ThreadLocal**中，减少在一次请求中对接口的重复调用。
   2. 比如将Session保存到**ThreadLocal**中。Servlet为每个请求创建一个线程，线程之间相互隔离。我们可以将当前的Session保存到**ThreadLocal**中，就可以在请求处理过程中随时使用Session中的信息，处理完成后调用remove方法清理即可。
   
3. 动态切换数据源。

4. 父子线程间的数据传递。

   ```java
   if (inheritThreadLocals && parent.inheritableThreadLocals != null)
       this.inheritableThreadLocals = ThreadLocal.createInheritedMap(parent.inheritableThreadLocals);
   ```

5. Spring使用**ThreadLocal**解决线程安全问题。

6. Zuul的Filter的RequestContext就是基于**ThreadLocal**。

