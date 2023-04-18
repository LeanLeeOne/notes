## 概述⭐

**Redis**是一个基于内存的<u>键值对</u>数据库：

- 键：总是一个字符串对象。
- 值：[支持5种类型](https://www.runoob.com/redis/redis-data-types.html)，包括String、Hash、List、Set、Sorted Set等。

**Redis**还支持订阅 / 发布，运行**Lua**脚本，以及Key过期、主从备份、持久化等功能。

- 支持订阅 / 发布，故可做<span style=background:#c2e2ff>消息代理</span>。
- **Lua**的引入解决了**Redis**不能处理**CAS**命令的问题。

> 此外，**Redis**还提供范围查询、bitmaps、hyperloglogs、坐标操作（地理位置索引）、流等功能。
>
> **Redis Stream**为其提供了消息的<u>持久化</u>和<u>主从备份</u>的功能。
>
> **Redis**的服务端、客户端之间的通信采用基于TCP的**RESP**（**RE**dis **S**erialization **P**rotocol），易解析，也易阅读。



## Redis速度快的原因⭐

**Redis**性能高，单机读能做到`11万次/秒`，写能做到`8万次/秒`，而这归功于：

1. 纯内存操作。
2. 针对不同的数据结构，对底层编码进行了不同的优化。
3. 采用**NIO**和<span style=background:#c2e2ff>多路复用</span>模型，避免了频繁的上下文切换。



## 事务[[1]](https://www.runoob.com/redis/redis-data-types.html)⭐

**Redis**中的单个操作都是原子性的，但多个操作不是。

**Redis**通过`MULTI`、`DISCARD`、`EXEC`、`WATCH`四个命令实现事务：

1. **Redis**使用`MULTI`、`EXEC`将一组操作包围，一起来执行，但是这组操作中的某些操作执行失败，其它命令依然会执行，而且也不会发生<span style=background:#c2e2ff>回滚</span>。
2. 虽然可以使用`WATCH`来监听<u>键值对</u>是否发生变化，即，在`MULTI`命令之前，`WATCH`到了变化，就不会进入`MULTI`命令中，不会说是进入`MULTI`命令后<span style=background:#c2e2ff>回滚</span>操作。
3. 输入`MULTI`后，**Redis**会转为事务模式，将后续接收到的命令都放入一个<u>队列</u>但不执行这些命令，只有当输入`EXEC`时，这组事务才会开始执行。
4. `DISCARD`用于取消一个事务，它会清空命令<u>队列</u>。

### ACID

| 特征            | 是否满足 | 原因                                                         |
| --------------- | -------- | ------------------------------------------------------------ |
| **Atomicity**   | 不满足   | **Redis**不支持<span style=background:#c2e2ff>回滚</span>，多个操作的组合也不支持，需要借助**Lua**来保证 |
| **Isolation**   | 满足     | **Redis**中的命令是<span style=background:#c2e2ff>串行</span>执行的，而其它客户端发来的命令都会排到该事务之后，且事务执行过程中不会中断 |
| **Durability**  | 不满足   | **Redis**虽然支持持久化，但不是实时的                      |
| **Consistency** | 不满足   | 同时保证AID，才能保证**Consistency**                       |



## Pipeline

**Pipeline**，管道，是一种批量操作，Client将一组命令缓存并组装后一起发往Server，Server接收后将命令拆分，逐个执行返回结果，从而减少往返延时，提高吞吐量。

**Pipeline**在Client缓冲，而`MULTI`在Server缓冲。

**Pipeline**没有提供命令，只支持Client使用。



## 数据库

**Redis**在<u>单机模式</u>下支持多个数据库，<u>集群模式</u>下不支持。

数据库之间并不隔离、共用一份密码，`FLUSHALL`无法指定数据库，会将所有数据库中的数据删除。

**Redis**没有提供表，但是提供了Namespace来分隔数据。

数据库的结构如下：

```c
typedef struct redisDb {
    int id; 			 // 该属性仅用于Reids内部使用，
    dict *dict; 		 // 键空间（Key Space），保存着数据库中的所有键值对
    dict *expires;       // 保存着Key的过期信息
    dict *blocking_keys; // 实现列表阻塞原语，如 BLPOP
    dict *ready_keys;
    dict *watched_keys;  // 用于实现 WATCH 命令
} redisDb;
```

使用`SELECT`可以切换不同的数据库：

1. 数据库的编号，从`0`开始递增，默认支持`16`个。
2. 当不指定数据库时，Client会默认使用`0`号数据库。

<span style=background:#fdc200>注意</span>：上面的数据库编号是`redisServer.db`这个数组中的编号，与上面`redisDb.id`无关。

数据库的操作其实都是对**Key Space**的操作，以及一些维护操纵。



## 键的有效期问题

通过`EXPIRE`、`PEXPIRE`、`EXPIREAT`、`PEXPIREAT`可设置Key的有效期。

`redisDb.expires`中的Key指向键空间中的Key；`redisDb.expires`中的Value则保存到期时间，即，以毫秒为单位的UNIX时间戳。

过期Key的删除有`3`种方式：

1. 定时删除：到期后，会触发先前创建的定时事件，事件处理器自动执行Key的删除，占CPU。
2. 惰性删除：每次使用Key时判断Key是否到期，如果到期就删除，占内存。
3. 定期删除：每隔一段时间，遍历`redisDb.expires`，删除过期的Key，以上两者的折衷。

**Redis**实际使用的是<u>惰性删除</u>和<u>定期删除</u>。

在主从模式中，过期Key的删除动作由**Master**负责，**Master**会向**Slave**发送`DEL`，以保证节点间数据的一致性。

