https://zhuanlan.zhihu.com/p/45728390

[https://www.cyc2018.xyz/其它/系统设计/分布式.html#zookeeper-的有序节点](https://www.cyc2018.xyz/其它/系统设计/分布式.html#zookeeper-的有序节点)

Zookeeper是一个提供分布式协作的服务器，提供**配置管理**、**命名**、**分布式同步**、**群组服务**。Zookeeper最初由Facebook贡献。



### 基本概念

集群角色、选举

会话，心跳、事件，会话的状态

树状结构，数据节点ZNode

持久节点、顺序节点、临时节点（会话、叶节点）。

数据版本（CAS）

Access Control Lists，ACL：

Create、Read、Write、Delete、Admin。

**Zookeeper**有良好的**Consistency**、**Partition Tolerance**，但在选举时会违反**Availability**。



## 用途

注册订阅

配置中心

命名服务

负载均衡



## Zookeeper、Red Lock与分布式锁

https://mp.weixin.qq.com/s?__biz=MzA4NTg1MjM0Mg==&mid=2657261521&idx=1&sn=7bbb80c8fe4f9dff7cd6a8883cc8fc0a&chksm=84479e08b330171e89732ec1460258a85afe73299c263fcc7df3c77cbeac0573ad7211902649&scene=21#wechat_redirect

创建一个锁目录，如，“/lock”，客户端如需加锁，就在锁目录中创建临时且有序的子节点，如果当子节点的序号最小时，即加锁成功；删除该子节点即可解锁。



**Red Lock**基于同步模型，且对时钟的依赖较强，无法保证某些场景下共享资源的安全访问（没有了锁的保护）：

1. 如客户端长期阻塞（**GC STW**、网络波动都算）导致锁过期，此时其他客户端成功加锁，而该客户端从阻塞中恢复后，还会认为自己持有锁。单机**Redis**作分布式锁时，同样存在该问题。
2. 如**Cluster**中网络故障，且有节点发生时钟向前跳跃所引发的脑裂的问题，进而导致多个客户端同时认为自己加锁成功。

时钟依赖问题，可通过乐观锁的方式改进，即客户端获取锁后会得到一个单调递增的版本号，每次请求节点是都会携带版本号供节点校验。Martin Kleppmann在《How to do distributed locking?》中指出：一个好的分布式算法，应该基于异步模型，且算法的安全性不应依赖于任何记时假设，如，Paxos、Raft。时间因素不应该影响算法的安全性，只可能影响到算法的“活性”，即，即使在非常极端的情况下（比如系统时钟严重错误），算法顶多是不能在有限的时间内给出结果而已，而不应该给出错误的结果。Martin还认为锁分为2种：为了效率锁用于协调各个客户端避免做重复的工作。即使锁偶尔失效了，也只是可能把某些操作多做一遍而已，不会产生其它的不良后果，如，重复发送了Email。**Redis**单机 / 主从就足够了。为了正确性在任何情况下都不允许锁失效，以避免数据不一致、丢失、损坏或者其它严重的问题。不要使用**Red Lock**，它不是强一致性的，应使用**Zookeeper**、数据库事务等方案。