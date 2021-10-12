### 概述

**Redis**是一个基于内存的<u>键值对</u>存储：

1. 键，总是一个字符串对象。
2. 值，[支持5种类型](https://www.runoob.com/redis/redis-data-types.html)：String、Hash、List、Set、Sorted Set等。

此外，**Redis**还支持订阅 / 发布（做<span style=background:#c2e2ff>消息代理</span>），运行Lua脚本，以及Key过期、主从备份等功能。

> Lua的引入解决了**Redis**不能处理**CAS**命令的问题。

此外，**Redis**还提供范围查询、bitmaps、hyperloglogs、坐标操作（地理位置索引）、流等功能。

> **Redis Stream**为其提供了消息的<u>持久化</u>和<u>主从备份</u>的功能。

**Redis**的服务端、客户端之间的通信采用基于TCP的**RESP**（**RE**dis **S**erialization **P**rotocol），易解析，也易阅读。



### Redis速度快的原因

Redis性能高，单机读能做到<span style=background:#e6e6e6>11万次/秒</span>，写能做到<span style=background:#e6e6e6>8万次/秒</span>，同时也支持数据的持久化。

1. 纯内存操作。
2. 针对数据结构，在底层编码方式进行了不同的优化。
3. 采用**NIO**和<span style=background:#c2e2ff>多路复用</span>模型，避免了频繁的上下文切换。



### [事务](https://www.runoob.com/redis/redis-data-types.html)

**Redis**中的单个操作都是原子性的，但多个操作不是。

**Redis**通过`MULTI`、`DISCARD`、`EXEC`、`WATCH`四个命令实现事务：

1. **Redis**使用`MULTI`、`EXEC`将一组操作包围，一起来执行，但是这组操作中的某些操作执行失败，其它命令依然会执行，而且也不会发生<span style=background:#c2e2ff>回滚</span>。
2. 虽然可以使用`WATCH`来监听<u>键值对</u>是否发生变化，即在`MULTI`命令之前，`WATCH`到了变化，就不会进入`MULTI`命令中，不会说是进入`MULTI`命令后<span style=background:#c2e2ff>回滚</span>操作。
3. 输入`MULTI`后，**Redis**会转为事务模式，将后续接收到的命令都放入一个<u>队列</u>但不执行这些命令，只有当输入`EXEC`时，这组事务才会开始执行。
4. `DISCARD`用于取消一个事务，它会清空命令<u>队列</u>。

#### ACID

| 特征            | 是否满足 | 原因                                                         |
| --------------- | -------- | ------------------------------------------------------------ |
| **Atomicity**   | 不满足   | **Redis**不支持<span style=background:#c2e2ff>回滚</span>。  |
| **Isolation**   | 满足     | **Redis**中的命令是<span style=background:#c2e2ff>串行</span>执行的，而其它客户端发来的命令都会排到该事务之后，且事务执行过程中不会中断。 |
| **Durability**  | 不满足   | **Redis**虽然支持持久化，但不是实时的。                      |
| **Consistency** | 不满足   | 同时保证AID，才能保证**Consistency**。                       |



### Pipeline

**Pipeline**（管道技术，批量操作）通过将一组命令组装起来一起发往服务端，减少往返延时，提高**Redis**的性能；服务端会将命令拆分，逐个执行返回结果。

**Pipeline**在客户端缓冲，`MULTI`在服务端队列缓冲。

**Pipeline**没有提供命令，只支持客户端使用。



### 数据库

**Redis**实际上是一个<span style=background:#c2e2ff>键值数据库</span>，在<u>单机模式</u>下支持多个数据库，<u>集群模式</u>下不支持。

所有数据库之间并不隔离，所有数据库共用一份密码，以及使用`FLUSHALL`时会将所有数据库中的数据删除，无法指定数据库。

**Redis**没有提供表，但是提供了命名空间来分隔数据。

数据库的结构如下：

```c
typedef struct redisDb {
    int id; 			 // 该属性仅用于Reids内部使用，
    dict *dict; 		 // 键空间（Key Space），保存着数据库中的所有键值对
    dict *expires;       // 保存着Ke的过期信息
    dict *blocking_keys; // 实现列表阻塞原语，如 BLPOP
    dict *ready_keys;
    dict *watched_keys;  // 用于实现 WATCH 命令
} redisDb;
```

使用`SELECT`可以切换不同的数据库：

1. 数据库的编号，从0开始递增，默认支持16个。
2. 当我们不指定数据库时，客户端会默认使用0号数据库。
3. <span style=background:#fdc200>注意</span>，这里的数据库编号是<span style=background:#b3b3b3>redisServer.db</span>这个数组中的编号，与上面<span style=background:#b3b3b3>redisDb.id</span>无关。

数据库的操作其实都是对**Key Space**的操作，以及一些维护操纵。



### 键的有效期问题

通过`EXPIRE`、`PEXPIRE`、`EXPIREAT`、`PEXPIREAT`可设置Key的有效期。

<span style=background:#b3b3b3>redisDb.expires</span>中的Key指向**Key Space**中的Key；<span style=background:#b3b3b3>redisDb.expires</span>中的Value则保存到期时间，即，亿毫秒为单位的UNIX时间戳。

过期Key的删除有3种方式：

1. 定时删除：到期后，会触发先前创建的定时事件，事件处理器自动执行Key的删除，占CPU。
2. 惰性删除：每次使用Key时判断Key是否到期，如果到期就删除，占内存。
3. 定期删除：每隔一段时间，遍历<span style=background:#b3b3b3>redisDb.expires</span>，删除过期的Key，以上两者的折衷。

**Redis**实际使用的是<u>惰性删除</u>和<u>定期删除</u>。

在主从结构中，过期Key的删除动作由**Master**负责，**MASTER**会向**Slave**发送`DEL`，以保证节点间数据的一致性。



### Big Key

**Big Key**指的是Key对应的Value比较大，这时会造成：

1. 内存空间不均匀（数据倾斜）。
2. 操作耗时（变慢）。
3. 存在网络阻塞风险。
   1. 如，对一个<span style=background:#e6e6e6>1MB</span>的数据每秒访问<span style=background:#e6e6e6>1000次</span>，就会产生<span style=background:#e6e6e6>1000MB</span>的流量。

虽然String类型的Value最大可存储<span style=background:#e6e6e6>512MB</span>的值，但当Value超过<span style=background:#e6e6e6>10KB</span>时，我们就会认为是**Big Key**；

虽然List类型的Value最多可以存储<span style=background:#e6e6e6>2 ^ 32</span>个元素，但是当元素数量超过<span style=background:#e6e6e6>2.5亿</span>时，我们就会认为是**Big Key**；

**Big Key**可用以下方式发现：

1. 使用`redis-cli --bigkeys`。

2. 使用`SCAN`扫描Key，然后使用`DEBUG OBJECT Key`判断Key的大小。

   > `KEYS pattern`开销大，线上往往禁用，所以才用`SCAN`，分批次扫描。

3. 使用`STRLEN`判断当前Key的大小。

找出**Big Key**后将其删除。



### 命令与使用

[命令](https://redis.io/commands)懒得补充了。

[怎么用](https://www.cnblogs.com/edisonfeng/p/3571870.html)，不是面试的重点，工具的原理才是。

