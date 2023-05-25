## 角色

![](../images/6/dubbo_roles.png)

如[上图](https://dubbo.apache.org/zh/docs/concepts/service-discovery/)所示，**Dubbo**也将服务实例分为多种角色。

### Container

容器，字面意思。

### Monitor

与**Eureka**相比，**Dubbo**多了一个监控器，因为如果没有良好的监控，等上线、运维的时候只能抓瞎。

### 另外

**Registry**、**Monitor**均为可选的，不是强制的。

**Registry**、**Consumer**、**Provider**之间均为长连接，但**Monitor**与**Consumer**、**Provider**之间不是。



## 分层

**Dubbo**的框架分为多层：

1. Service：业务逻辑。
2. Config：配置。
3. Proxy：无论**Provider**、**Consumer**都会生成代理类，使得接口透明。
4. Register：封装了服务注册、服务发现。
5. Cluster：路由，负责选取具体要调用的节点；容错，应对调用失败。
6. Monitor：统计调用时间、次数。
7. Protocol：远程调用层，对RPC的封装，管理Invoker（执行体）。
8. Exchange：信息交换，即，封装<span style=background:#c9ccff>Request</span>/<span style=background:#f8d2ff>Response</span>，同步转异步。
9. Transport：提供了网络传输的统一接口，可对接**Netty**、**Mina**。
10. Serialize：序列化/反序列化。

![](../images/6/dubbo_levels.jpg)

按API、SPI分层是因为**Dubbo**采用微内核 + **SPI**的设计，**SPI**方便开发者扩展。

**Dubbo**使用**Javassist**创建代理对象，与**CGLib**（**ASM**的实现）相比，它只需用字符串拼接就可以生成字节码，简单、风险低，而性能相仿。

![](../images/6/dubbo_framework.png)



## Dubbo SPI

为了能<span style=background:#c2e2ff>按需</span>加载实现类，**Dubbo**也实现了自己的**SPI**，即，以配置键值对的形式指定接口的实现类。

**Dubbo SPI**包括`3`个目录：

1. `jar/META-INF/services/`：对原生**SPI**的兼容。
2. `jar/META-INF/dubbo/`：存放开发者自定义的**SPI**配置文件。
3. `jar/META-INF/dubbo/internal/`：存放**Dubbo**内部使用的**SPI**配置文件。

如，`jar/META-INF/dubbo/java.sql.Driver`中配置：

```properties
mysqlDriver=com.mysql.cj.jdbc.Driver
```

### 使用示例

```java
ExtensionLoader<Driver> extensionLoader = ExtensionLoader.getExtensionLoader(Driver.class); // Dubbo SPI的入口
Driver driver = extensionLoader.getExtension("mysqlDriver") // 该方法会先从缓存中查找，如未果，则会通过反射来加载实现类，并实例化

@SPI // 要实现的接口类需使用该注解标示
public interface Driver {}
```

### 特性

**Dubbo SPI**[还有**IoC**和**AOP**特性](https://juejin.cn/post/6872138926216511501)：

1. 实例化实现类后，**Dubbo SPI**会遍历Setter来注入依赖。
2. 然后，如果有包装类的话再对实现类进行包装（Wrapper），以减少重复代码。

`@Adaptive`，自适应扩展，即，根据请求时的参数动态选择对应的扩展，通过代理实现。

1. 该注解有`3`个属性：

   1. `group`：标识是**Provider**，还是**Consumer**。

   2. `value`：在URL参数中才会被激活。

      1. **Dubbo**采用URL作为参数类型，而非`Map`、特定符号分隔字符串。

      2. ```http
         protocol://username:password@host:port/path?key=value&key=value
         ```

   3. `order`，实现类的顺序。

2. 如`Filter`往往有多个实现类，某些场景需要某几个实现类，某些场景需要另外几个实现类，而`@Adaptive`就是用来标记这个的。



## 运行过程

### 暴露服务

**Provider**于<span style=background:#ffb8b8>IoC容器</span>完成刷新时暴露服务，[过程主要包括3步](https://juejin.cn/post/6874731589243240461)：

1. **检测配置**
   1. 缺省的配置会使用默认值，将配置组装为URL。
2. **暴露服务**
   1. 分为本地和远程。
      > 这种设计有助于解耦、测试。
   2. 根据URL参数选择对应的实现类，实现扩展。
   3. 将实现类封装成**Invoker**。
   4. 将**Invoker**通过具体的协议转换成**Exporter**，这时会创建**Netty** Server。
3. **注册服务**

![](../images/6/dubbo_expose_service_processing.png)

### 引入服务

**Consumer**采用懒加载的方式引入服务，[引入服务的具体过程主要包括2步](https://juejin.cn/post/6875109006549975047)：

1. **检测配置**
   1. 将配置组装为URL。
2. **导入服务**
   1. 分为`3`种：本地引入、直接远程引入、通过注册中心引入。
   2. 根据URL参数选择对应的实现类，实现扩展。
      1. 如果是通过注册中心，则会创建`directory`，向注册中心注册**Consumer**，并获取**Provider**的Host等信息，然后创建**Netty** Client进行通信。
   3. 然后根据这些信息，将实现类封装成**Invoker**。
      1. **Invoker**又会被`cluster`封装成代理类，以对多个**Provider**的屏蔽（服务发现）、容错和<span style=background:#d4fe7f>负载均衡</span>等。

### 调用服务

调用过程默认是<span style=background:#c2e2ff>异步</span>的，主要包括`3`步：

1. 当**Consumer**调用接口类的方式时，会找到之前生成代理类，然后从`cluster`中根据<span style=background:#ffee7c>路由的过滤</span>、<span style=background:#d4fe7f>负载均衡</span>，选择一个**Invoker**发送<span style=background:#c9ccff>Request</span>，进行远程调用。
2. **Provider**收到<span style=background:#c9ccff>Request</span>后，会根据URL中的参数，从存储暴露服务的Map中，找到对应的**Exporter**，然后调用真正的实现类，处理好后封装成<span style=background:#f8d2ff>Response</span>返回。
3. **Consumer**收到<span style=background:#f8d2ff>Response</span>后会根据ID找到对应的<span style=background:#c9ccff>Request</span>，然后将<span style=background:#f8d2ff>Response</span>放入对应的**Future**中，并唤醒线程，消费数据。



## 简单对比⭐

| 组件     | Dubbo                               | Netflix                   |
| -------- | ----------------------------------- | ------------------------- |
| 调用方式 | 自定义协议的RPC                     | HTTP                      |
| 划分粒度 | 细：接口层面                        | 粗：实例层面              |
| 服务导入 | 本地、远程、注册中心                | 注册中心                  |
| 注册中心 | **ZooKeeper**、**Redis**、**Nacos** | **ZooKeeper**、**Eureka** |
| 网关     | ❌                                   | **Zuul**                  |

