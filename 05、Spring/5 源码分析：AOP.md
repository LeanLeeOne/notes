## AOP的运行过程[[1]](https://juejin.cn/post/6844903970658320391)：

`AnnotationAwareAspectJAutoProxyCreator`是**AOP**核心处理类，它扩展自`AbstractAutoProxyCreator`，而`AbstractAutoProxyCreator`实现了`BeanPostProcessor`。

**AOP**的核心逻辑都在实现的`BeanPostProcessor.postProcessBeforeInitialization()`/`postProcessAfterInitialization()`的`2`个方法中，但无论这`2`个方法中的哪个方法，都会调用另外`2`个主要方法：

1. `AbstractAutoProxyCreator.getAdvicesAndAdvisorsForBean()`，获取当前**Bean**匹配的<span style=background:#c9ccff>增强/增强器</span>，其核心逻辑为：
   1. 找所有<span style=background:#c9ccff>增强/增强器</span>，即，遍历所有的BeanName，根据BeanName筛选出经`@Aspect`修饰的**Bean**，并创建<span style=background:#c9ccff>增强/增强器</span>。
   2. 找匹配的<span style=background:#c9ccff>增强/增强器</span>，即，根据<span style=background:#c9ccff>增强/增强器</span>的**Pointcut**中的表达式，与当前**Bean**是否匹配来判断，然后暴露匹配上的<span style=background:#c9ccff>增强/增强器</span>。
   3. 对匹配的<span style=background:#c9ccff>增强/增强器</span>进行扩展和排序，即，按照`@Order`或者`PriorityOrdered.getOrder()`的值进行排序，越小的越靠前。
2. `AbstractAutoProxyCreator.createProxy()`，为当前**Bean**创建代理对象，有`2`种创建方式，JDK代理或**CGLib**。
   1. 如果`proxyTargetClass=true`，一定是**CGLib**代理。
   2. 如果`proxyTargetClass=false`，
      1. 并且目标对象<span style=background:#f8d2ff>实现了</span>接口，走JDK的动态代理。
      2. 并且目标对象<span style=background:#c9ccff>没有实现</span>接口，走**CGLib**代理。
   3. 创建的代理类会[以递归（链）的形式调用](https://mp.weixin.qq.com/s?__biz=MzA4ODI0MTIxOA==&mid=2257484863&idx=1&sn=ee579cb36edbcd8f3ed86a0c4583e016&chksm=9357f912a42070045e7cb31ecb4c435fa410ba46915b16611ba795a10453d5b82282cc3f0319&scene=178&cur_album_id=1529509474028355587#rd)<span style=background:#c9ccff>增强/增强器</span>。

![](../images/5/annotation_aware_aspect_j_auto_proxy_creator.awebp)
