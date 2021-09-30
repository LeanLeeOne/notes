## 基本概念

**Zookeeper**是一个提供分布式协作的服务器，提供**配置管理**、**命名**、**分布式锁**、**群组服务**。

> **Zookeeper**最初由Facebook贡献。

https://zhuanlan.zhihu.com/p/45728390：

集群角色、选举

会话，心跳、事件，会话的状态

树状结构，数据节点ZNode

持久节点、顺序节点、临时节点（会话、叶节点）。

数据版本（CAS）

Access Control Lists，ACL：

Create、Read、Write、Delete、Admin。

**Zookeeper**有良好的**Consistency**、**Partition Tolerance**，但在选举时会违反**Availability**。



## 用途

#### 配置管理

#### 命名

#### 分布式锁

**Zookeeper**[实现分布式锁的一种方式](https://www.cyc2018.xyz/其它/系统设计/分布式.html#zookeeper-的有序节点)：

1. 创建一个持久节点，作为锁目录。

2. 客户端如需加锁，就在锁目录中创建临时且有序的子节点。
   1. 如果自己创建的节点的序号是节点列表中序号最小的，则加锁成功；
   
   2. 否则**Watch**前一个节点，当节点变更时重新判断。
   
      > **Watch**所有节点只会徒增开销，因为如果任意一个节点状态改变，其它所有的节点都会收到通知。（羊群效应：一只羊动起来，其它羊一哄而上）
   
3. 客户端删除创建的子节点即可解锁。

另一种实现方式：

1. 直接使用锁目录作为锁，锁目录为临时节点。
2. 创建锁目录即为加锁，删除锁目录即为解锁。
3. 所有节点Watch锁目录，阻塞等待其变化。

>这种实现方式存在羊群效应。

以上2种方案可用**Apache Curator**来实现。

> **Apache Curator**是**Netflix**开发的**Zookeeper**客户端，简化了原生**Zookeeper**客户端的开发，包括：重连、反复注册Watcher、异常处理等，可用来开发分布式锁。

如果持锁的<span style=background:#c2e2ff>会话超时</span>了，则对应的临时节点会被删掉，其它会话就可获取锁了；但此时，超时会话的客户端<span style=background:#d4fe7f>仍然认为自己持有锁</span>，进而破坏资源的互斥。

<span style=background:#ffee7c>会话机制保证了锁的可重入性。</span>

#### 群组服务

#### 注册订阅

#### 负载均衡





