## 简述

[ZooKeeper](https://zookeeper.apache.org/doc/r3.4.13/zookeeperOver.html)主要用于提供分布式协作，包括：**同步**、**配置维护**、**群组服务**、**命名**。

> **ZooKeeper**最初由**Yahoo!**贡献，后成为**Hadoop**的子项目，并于2011年成为**Apache**顶级项目[\[1]](https://blog.csdn.net/weixin_38256474/article/details/90636262)。

**ZooKeeper**会在内存中保存全量数据，QPS能达`100K`，与**Redis**旗鼓相当。



## 数据结构

**ZooKeeper**采用类似于文件系统的目录节点树来组织数据，该树状数据结构被称为Namespace，树的节点为数据寄存器，被叫做**ZNode**。

<span style=background:#fdc200>注意</span>：Namespace并不是用来专门<span style=background:#c2e2ff>存储</span>数据的，而是用来维护和监控所存储数据的<span style=background:#c2e2ff>状态变化</span>，以便分布式系统通过共享Namespace的方式来相互协作。

**ZNode**分为<span style=background:#c2e2ff>持久</span>和<span style=background:#c2e2ff>临时</span>两种：

1. **Persistent**：<span style=background:#c2e2ff>持久</span>节点一经创建，便一直存在，除非被显式清除。
2. **Ephemeral**：<span style=background:#c2e2ff>临时</span>节点的生命周期同Session绑定。<span style=background:#c2e2ff>临时</span>节点不能创建子节点，即，<span style=background:#ffb8b8>无法作为</span>非叶子节点。

> **ZooKeeper**在内存中实际是用`HashMap`，而非树，来组织数据，其中，<span style=background:#c2e2ff>持久</span>节点使用“**ZNode**的路径”作为Key，<span style=background:#c2e2ff>临时</span>节点使用<span style=background:#b3b3b3>Session.ID</span>作为Key。
>
> 扩展阅读：[Ephemeral机制实现服务集群的陷阱](https://developer.aliyun.com/article/227260)。

此外，非叶子节点还能开启Sequential属性，开启后，该节点会维护其<u>第一级子节点</u>的<span style=background:#c2e2ff>顺序</span>，并在创建<u>第一级子节点</u>时会被自动加上数字后缀。

**ZNode**会维护`3`种<u>版本号</u>，以缓存验证和协调更新：

1. Version：节点数据内容的版本号。
2. CVersion：子节点的版本号。
3. AVersion：**ACL**的版本号。

更新**ZNode**时需提供<u>版本号</u>，若<u>版本号</u>不匹配，则更新失败，并且，**ZNode**的任何更新操作都会引起<u>版本号</u>的变化，从而保证事务的原子性。

**ACL**，Access Control Lists，用于权限控制，包括`Create`、`Delete`、`Read`、`Write`、`Admin`等。

![](../images/9/zookeeper_namespace.jpg)



## 机制

### 监听

**ZooKeeper**允许在指定节点上注册**Watch**，当节点数据发生变化时，会触发相应**Watch**，Server会将其封装为事件并通知Client。

**Watch**触发后就会被移除，以减轻压力，如需再次使用，只能重新注册。

从“移除”到“重新注册”这段时间，[Client是无法感知到Server的变化的](https://blog.csdn.net/qq_22115231/article/details/80784535#5/17)，如果有需要，可在重新注册前执行`get children`获取状态，自行比较变化。所以说，**ZooKeeper**只能保证最终一致性，无法保证强一致性。

#### 操作

**ZooKeeper**包含`9`种操作：`create`、`delete`、`exists`、`get acl`、`set acl`、`get children`、`get data`、`set data`、`sync`等。

在`exists`、`get children`和`get data`等读操作上可以设置**Watch**，当有`create`、`delete`和`set data` 等写操作时，**Watch**会被触发。**ACL**相关操作不会触发任何**Watch**。**Watch**类型和触发它的操作共同决定着事件的类型：

- 当**ZNode**被`create`子节点、`delete`或`set data`时，对`exists`的**Watch**会被触发。
- 当**ZNode**被`delete`或`set data`时，对`get data`的**Watch**会被触发。
  - 当**ZNode**被`create`时，对``get data``的**Watch**不会被触发，因为`get data`触发**Watch**的前提是**ZNode**已经存在。
- 当**ZNode**被`delete`时，或其子节点被`create`或`delete`时，对`get children`的**Watch**会被触发。

权限与操作[的对应关系为](https://matt33.com/2016/04/13/zookeeper-learn/#观察触发器)：

| 权限     | 操作                       |
| -------- | -------------------------- |
| `Create` | `create`（子节点）         |
| `Delete` | `delete`（子节点）         |
| `Read`   | `get children`、`get data` |
| `Write`  | `set data`                 |
| `Admin`  | `set acl`                  |

### 会话

Client会尝试与列表中的一台Server建立连接，如果连接失败，则会尝试连接另一台，直到与所有Server都无法建立连接，才算失败。

Client与Server建立TCP长连接后，会创建Session，之后Client通过<span style=background:#c2e2ff>心跳</span>与Server保持连接，即便Server由于压力太大导致连接断开，又或者Client主动断开连接会话，再或者网络故障，只要Client能在Timeout之内重新连接上集群内的任意一台Server，Session就仍然有效。

Session有`3`个状态：

1. <span style=background:#b3b3b3>CONNECTING</span>：尝试与Server（重新）建立连接。
2. <span style=background:#b3b3b3>CONNECTED</span>：与Server（重新）建立连接。
3. <span style=background:#b3b3b3>CLOSE</span>：会话超时、权限检查、Client主动关闭。

> Session进入<span style=background:#b3b3b3>CONNECTED</span>时，其对应的**ZNode**就会产生一个Watch Event。

Session有4个主要属性：

1. <span style=background:#b3b3b3>ID</span>：Server会为Client分配全局唯一的<span style=background:#b3b3b3>Session.ID</span>用于标识Session。
2. <span style=background:#b3b3b3>Timeout</span>：由Client指定。
3. <span style=background:#b3b3b3>TickTime</span>：Timeout的检查时间间隔。
4. <span style=background:#b3b3b3>isClosing</span>：当Server检测到Session超时，会将<span style=background:#b3b3b3>Session.isClosing</span>标记为已关闭。

> <span style=background:#b3b3b3>Session.Timeout</span>不可小于2个<span style=background:#b3b3b3>Session.TickTime</span>，且不可大于20个<span style=background:#b3b3b3>Session.TickTime</span>。
>
> <span style=background:#b3b3b3>Session.TickTime</span>通常为2秒。
>
> **ZooKeeper**采用“分桶策略”来低耗高效地处理Session超时：[通过计算](https://thinkwon.blog.csdn.net/article/details/104397719#12__250)，将<span style=background:#b3b3b3>Session.Timeout</span>相接近的Session放入到相同的Bucket中，然后定时对Bucket中的Session批量检测、清理。



## 与分布式

<img src="../images/9/zookeeper_framework.png" style="zoom:50%;" />

**ZooKeeper**本身也支持分布式部署，由多实例组成集群。

**ZooKeeper**集群属于CP系统，即，有良好的**Consistency**、**Partition Tolerance**，但在选举时会违反**Availability**。

### 事务

**ZooKeeper**提供的是最终一致性，细分为以下特性：

- 原子性：读写操作要么都整体应用成功，要么都不应用，不会出现部分读写的情况。
  
  > **ZooKeeper**允许将多个基本的读写操作组合为一个整体的操作单元，读写单元具有原子性。
- 顺序一致性：同一个Client发起的事务请求，都会按照发起顺序应用到集群去。
  
  > **ZooKeeper**会为Client的每个更新请求分配全局唯一的递增编号，来标识事务的先后顺序。
- 单一系统映像：无论Client连接哪台Server，它看到的数据都是一样的，并且它所有的请求的处理结果在所有Server上都是一致的。
  > 正常情况下，**Follower**的进度可能慢于**Leader**，可通过`sync`命令让**Follower**更新数据。
  >
  > 当Server故障时，需要追上**Leader**的进度，才会接收请求。
- 可靠性：一旦集群应用事务并向Client返回响应，该事务带来的变更会一直被保留，除非另一个事务又进行了变更。

### 角色

**ZooKeeper**集群中的Server分为`3`种角色：

- **Leader**
  - 集群中只有一个**Leader**。
  - 提供读写服务，写请求处理完成后会广播/同步到**Follower**、**Observer**。
  - **Leader**会向**Follower**、**Observer**[发送并维护心跳](https://blog.csdn.net/LYZ2017/article/details/78305674)。
- **Follower**
  - 集群中可以有多个**Follower**，**Leader**从**Follower**中选举出来。
  - **Follower**只提供读服务，写请求会转发给**Leader**来处理。
  - **Follower**会响应**Leader**的心跳。
- **Observer**
  - **Observer**跟**Follower**类似，但**Observer**不参与选举的任何过程，也不参与写操作的“过半成功”，不需要将事务持久化到磁盘。这样的设计，是为了分担集群的读压力、减少响应时长，但不增加选举过程的耗时。


> Server都有一个唯一的标识符（`sid`）来标识自己。`sid`由管理员手动配置。
>
> Client无法区分所连接的Server是**Leader**，还是**Follower**，还是**Observer**。
>
> 写请求的同步是异步进行的，**Follower**、**Observer**的数据可能不是最新的。所以说，**ZooKeeper**只支持最终一致性，不支持强一致性。

Server依据状态来标识自己当前的角色，[状态有4种](https://blog.csdn.net/chengyuqiang/article/details/79190061)：

- <span style=background:#b3b3b3>LOOKING</span>：寻找**Leader**中。
- <span style=background:#b3b3b3>LEADING</span>：表示自己是**Leader**。
- <span style=background:#b3b3b3>FOLLOWING</span>：表明自己是**Follower**。
- <span style=background:#b3b3b3>OBSERVER</span>：表明自己是**Observer**。

### 原子广播

**ZAB**，**Z**ooKeeper **A**tomic **B**roadcast，是**ZooKeeper**实现一致性的基础。

**ZAB**包括选举和处理写请求两部分。

> **ZAB**理论上包括Leader election、Discovery、Synchronization和Broadcast等过程，但**ZooKooper**[实际上](http://www.tcs.hut.fi/Studies/T-79.5001/reports/2012-deSouzaMedeiros.pdf)是按Fast Leader Election、Recovery和Broadcast实现的，其中，后者的Recovery包含前者的Discovery和Synchronization。

#### 数据结构

**ZAB**的基础是Epoch和**ZXID**。

Epoch，表示选举的轮次，分为`2`种：

- `electionEpoch`：每发起一次选举，`electionEpoch`就会自增，用来标记选举的轮次。
- `peerEpoch`：每次选出**Leader**后，`peerEpoch`会自增，用来标记事务请求所属的选举轮次。

> Epoch，[epək]，纪元。
>
> 发起选举不代表一定会选出**Leader**，比如集群已经存在有效的**Leader**。

**ZXID**，**Z**ooKeeper **T**ransaction **ID**entity，是一个长整型（`64位`），是全局单调递增的：

- `低32位`表示事务轮次。每次写数据，`低32位`会自增。
- `高32位`表示选举轮次，即，`peerEpoch`。每次选出新**Leader**，`高32位`会自增，`低32位`都会重置。

> `peerEpoch`[主要用于](https://developer.aliyun.com/article/62555)防止旧**Leader**继续提交：旧的**Leader**向**Follower**广播写请求时，**Follower**会发现该请求的**ZXID**比自己的小，确切地说，是**ZXID**的`高32位`，也就是`peerEpoch`比自己的小，所以会直接丢弃该请求，从而避免出现不一致。
>
> `electionEpoch`、`peerEpoch`在实际实现时，采用的是长整型。
>
> **Follower**从**Leader**同步数据时，也是基于**ZXID**判断是否要同步，以及要删除或要同步哪些数据。

### 写数据

**Leader**分`2`步写数据，这类似于RDBMS中的两阶段提交：

1. 收到写请求后，会将其封装为一个提议（Proposal），每个Proposal会被分配一个新的**ZXID**，然后**Leader**将该Proposal广播给其他节点，**Leader**等待**Follwer**的响应。
2. 当半数以上的**Follower**响应后，**Leader**会再封装一个提交（Commit），并将该Commit广播给其他节点，这样写请求才会生效，Client才会看到该更新。

> “<u>半数以上</u>”的设计能减少脑裂的发生，这种设计被称为Quorum Peer，简称Quorum。

**ZAB**保证写请求按顺序处理，且**Leader**崩溃重新选举后数据仍然完整。

### 选举

**ZooKeeper**实现了`4`种选举算法，但是废弃了`3`种，只保留[FastLeaderElection](https://github.com/tunsuy/tunsuy.github.io/blob/master/zookeeper/Zookeeper选举机制.md)，本文只介绍FastLeaderElection。

> FastLeaderElection[是对](http://www.jasongj.com/zookeeper/fastleaderelection/#FastLeaderElection)Fast Paxos算法的实现，而[Fast Paxos](https://blog.csdn.net/u010039929/article/details/70171672)是对Paxos的简化，以解决收敛速度慢的问题。

#### 选票

选举基于选票，选票包含如下信息：

- `sid`：投出该选票的服务器的SID。
- `state`：投出该选票的服务器的状态。
- `electionEpoch`：选举轮次。
- `peerEpoch`：事务轮次。
- `zxid`：被推举的服务器上所保存的数据的最大**ZXID**。
- `leader`：被推举的服务器的`sid`。

节点以广播的形式投递选票，每个节点都有一个票箱存放选票。

> SID，**S**erver **ID**entity，又管理员手动配置，唯一地标识一台节点。

#### 发起

当新的**Follower**启动后，或者当已有的**Follower**或**Leader**重启后，或者当**Follower**发现**Leader**失联（连接断开、连接超时、宕机），都会发起一次选举：节点先更新`electionEpoch`，然后将`sid`、``electionEpoch`等信息封装为选票，将选票放入自己的票箱，向所有节点广播选票，然后等待其他节点的回复。

> 无论节点是**Follower**，还是**Leader**，每次重启后，都会投给自己吗？

#### 判断状态

当节点收到选票后，会判断对方选票的`state`的值：

- 若是FOLLOWING或LEADING，则说明对方已选出**Leader**，这时只需要验证下这个**Leader**是否有效即可（半数以上选票）。
  - 有效则选举结束。
  - 否则继续接收选票（继续选举）。
- 若是OBSERVING，则忽略该选票，因为**Observer**不参与投票。
- 若是LOOKING，则表示对方也还处于**Leader**选举状态，会判断选举轮次。

#### 判断选举轮次

只有处于同一选举轮次的节点/选票，对双方来说才是有效的，所以首先需要判断选举轮次，即，节点比较自己选票的`electionEpoch`和收到的选票的`electionEpoch`：

- 若自己选票的`electionEpoch`比较小，说明自己的选举轮次落后于对方、自己的选票无效，所以本节点会立即清空票箱，并将自己选票的`electionEpoch`更新为对方选票的`electionEpoch`，然后对两张选票进行PK，根据胜出的选票更新自己的选票并广播出去。
- 若自己选票的`electionEpoch`比较大，说明自己的选举轮次领先于对方、对方的选票无效，所以本节点直接忽略对方的选票，不做处理。
- 若两张票的`logicClock`相等，说明双方在同一轮选举中、双方的选票都有效，需要进行选票PK。
  - 若自己胜出，则不做处理。
  - 若对方胜出，则根据对方的选票更新自己的选票并广播出去。


每次判断完选举轮次，节点会将收到的选票放入票箱，已经存在的选票（`sid`相同）会被直接覆盖，然后根据票箱中的选票判断选举结果：

- 如果有节点得到了半数以上的投票，则选举基本结束，当前节点会更新自己的状态/角色。
  - 如果是自己当选，则将状态更新为LEADING。
  - 否则，将状态更新为FOLLOWING。
- 否则，继续接收选票。

#### 选票PK

选票PK比较的是两张选票的`peerEpoch`、`zxid`、`leader`：

- 先比较两张选票的`peerEpoch`，大者胜出。
- 若两张选票的`peerEpoch`相等，则比较两张选票的`zxid`，大者胜出。
- 若两张选票的`zxid`也相等，则比较两张选票的`leader`，大者胜出。

#### 总结

1. **发起**
   1. 节点启动后会相互通信并寻找**Leader**，如果找到**Leader**，则直接将自己设置为**Follower**；
   2. 但如果集群中只有**Follower**，则会发起选举，每个节点先把票投给自己，然后会通过广播，让其它节点也投给自己，即，广播包含**ZXID**、**SID**等信息的选票。
2. **处理**
   1. 节点收到其它节点发来的拉票请求，会投票给**ZXID**最大的节点，即，数据最新的节点；
   2. 若**ZXID**相同，则投给其中**SID**最大的节点。
3. **统计**
   1. 当某台节点得到<u>半数以上</u>的选票时，就会成功当选，成为**Leader**。
4. **重新选举**
   1. 当**Leader**宕机或**Leader**失去大多数**Follower**时，集群就会进行**Failover**，发起重新选举。

> 为应对[延迟问题](https://www.cnblogs.com/kevingrace/p/12433503.html)，重新选举后，要将选举结果通知所有Client，之后新**Leader**才可以生效。
>
> 重新选举时，[集群会暂停服务](https://cloud.tencent.com/developer/article/1644921)，直到选出新**Leader**，新**Leader**会向**Follower**发送`NEWLEAD`，待所有**Follower**响应**Leader**后，**Leader**会广播`UPTODATE`，收到该命令的Server即可对外提供服务。这一过程大约持续`200毫秒`。
> 
>如果新**Leader**不是旧**Leader**，旧**Leader**会自觉地变成**Follower**。

### 持久化

**ZooKeeper**会将内存中的数据持久化为[2种数据文件](https://blog.csdn.net/varyall/article/details/79564418)：

1. 快照，Snapshot，用于保存内存中的全量数据。
   1. 由于Snapshot是异步生成的，[所以不能精确到某一时刻（是模糊的）](https://blog.csdn.net/varyall/article/details/79564418#3/15)，这就要求事务操作是幂等的，否则数据会不一致，当然**ZooKeeper**中的操作都是幂等的。

2. 日志，[WAL](../07、MySQL/3.3 日志#预写式日志)，用于顺序记录写请求。
   1. 无论是**Leader**广播/同步写请求，还是**Follower**处理Proposal，[都会先保存到Log中](https://blog.csdn.net/baichoufei90/article/details/88183532#213_Zab_196)。


> Snapshot、WAL类似于**Redis**的RDB、AOF。WAL思想广泛应用于各种数据库。
>
> **Redis**其实也可以用于实现配置中心，但是其持久化、集群的相关设计导致它不是强一致的。
>
> **ZooKeeper**的更新只支持覆盖写，不支持追加写。
>
> 具体的持久化过程见[文章](https://developer.aliyun.com/article/62555#slide-7)。



## 用途

### 同步（分布式锁）🌙

**ZooKeeper**[实现分布式锁的一种方式](https://www.cyc2018.xyz/其它/系统设计/分布式.html#zookeeper-的有序节点)：

1. 创建一个<span style=background:#c2e2ff>持久</span>节点，作为锁目录。
2. Client如需加锁，就在锁目录中创建<span style=background:#c2e2ff>临时</span>且有序的子节点。
   1. 如果自己创建的节点的序号是节点列表中序号最小的，则加锁成功；
   2. 否则**Watch**前一个节点，当节点变更时重新判断。
3. Client删除创建的子节点即可解锁。

另一种实现方式：

1. 直接使用锁目录作为锁，锁目录为<span style=background:#c2e2ff>临时</span>节点。
2. 创建锁目录即为加锁，删除锁目录即为解锁。
3. 所有节点**Watch**锁目录，阻塞等待其变化。

>这种实现方式存在羊群效应。
>
>羊群效应：一只羊动起来，其它羊一哄而上。
>
>**Watch**所有节点只会徒增开销，因为如果任意一个节点状态改变，其它所有的节点都会收到通知。
>
>方式一属于公平模式，方式二属于非公平模式。

以上`2`种方案可用**Apache Curator**来实现。

> **Apache Curator**是**Netflix**开发的**ZooKeeper**客户端，简化了原生**ZooKeeper**客户端的开发，包括：重连、反复注册Watcher、异常处理等，可用来开发分布式锁。

如果持锁的Session<span style=background:#c2e2ff>超时</span>了，则对应的<span style=background:#c2e2ff>临时</span>节点会被删掉，其它Session就可获取锁了；但此时，该Session的Client<span style=background:#d4fe7f>仍然认为自己持有锁</span>，进而破坏资源的互斥。

### 配置维护（注册订阅）

为分布式系统的节点提供一致的配置。

### 群组服务

感知分布式系统的变化，做出相应策略，如：

- 辅助选举：多个候选者通过在**ZooKeeper**上抢注**ZNode**的方式来竞选，成功抢注的那个候选者会当选，落选的候选者、新加入的候选者都会监听该**ZNode**的变化，并进入休眠，等待重新竞选。
  - **Hadoop**、**HBase**、**Kafka**

### 命名

在**ZooKeeper**上为分布式系统中的节点、服务等资源创建**ZNode**，这些**ZNode**会有全局唯一的名字，根据这些名字即可获取资源的地址、提供者等信息。

### 负载均衡

**ZooKeeper**的<span style=background:#d4fe7f>负载均衡</span>是可以调控，**Nginx**只是能调权重，其它需要可控的都需要自己写插件。

**Nginx**的吞吐量比**ZooKeeper**大很多，根据业务需要进行选择。

