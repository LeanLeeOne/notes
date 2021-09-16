### 概述

[Redis](https://www.runoob.com/redis/redis-data-types.html)是一个基于内存的数据结构存储，可以用作<span style=background:#c2e2ff>键值数据库</span>、<span style=background:#c2e2ff>缓存</span>、<span style=background:#c2e2ff>消息代理</span>（队列）。

它支持丰富的数据结构：String、Hash（Map中套Map）、List、Set、Sorted Set等，并提供范围查询、bitmaps、hyperloglogs、地理位置索引、流等功能。

它性能高，单机读能做到11w次/秒，写能做到8w次/秒，同时也支持数据的持久化。

Redis中的单个操作都是原子性的。

Redis还支持发布订阅，通知，key过期，主从备份等。

Redis还支持订阅发布，运行Lua脚本，并在3.2版本中引入了坐标操作，允许做消息队列。

Redis Stream为其提供了消息的持久化和主从备份的功能。



### 数据库

Redis支持多个数据库，并且只有单机模式支持，集群模式下不支持。

数据库的编号从0开始递增，默认支持16个。

当我们不指定数据库时，客户端会默认使用0号数据库，不过我们可以使用SELECT命令切换数据库。

所有数据库之间并不隔离，所有数据库共用一份密码，以及使用Flushall命令时会将所有数据库中的数据删除，无法指定数据库。

与其说是数据库，不如说是命名空间。我其实也不清楚到底该怎么称呼，等后面再来完善。



### [事务](https://www.runoob.com/redis/redis-data-types.html)

上文提到Redis的单个操作是原子性的，但多个操作不是。

虽然Redis支持通过使用MULTI、EXEC指令将某一客户端的一组操作包围，一起来执行，但是这组操作中的某些操作执行失败，其他命令依然会执行，而且也不会发生回滚。

虽然可以使用WATCH命令来监听键值对是否发生变化，即在MULTI命令之前，WATCH监听到了变化，就不会进入MULTI命令中，不会说是进入MULTI命令后回滚操作。

也就是说，Redis的事务不满足Atomicity。

而Redis中的命令是串行执行的，只有当输入EXEC命令时，这组事务才会开始执行（而非MULTI命令输入时就开启），而其他客户端发来的命令都会排到该事务之后，即满足Isolution、Consistency。

Redis的服务端、客户端之间的通信采用基于TCP的RESP（REdis Serialization Protocol），易解析，也易阅读。

管道技术能显著提高redis的性能。



### 键的有效期问题

过期键的删除

1. 定时清理
2. 使用时判断

内存不足时的淘汰策略：

1. 报错，不再写入新数据
2. 最近最少使用
3. 更早过期时间
4. 随即删除



redis与秒杀，第7部分，分布式锁的操作：https://www.zhihu.com/question/20978066/answer/2027433026

https://blog.csdn.net/ThinkWon/article/details/103522351（又是一篇东拼西凑的文章，零散琐碎）

https://blog.csdn.net/m0_37450089/article/details/78740692（这篇也是）

[Redis线程模型](https://www.cnblogs.com/barrywxx/p/8570821.html)

[Java中使用Redis的简单说明](https://www.cnblogs.com/edisonfeng/p/3571870.html)

https://zhuanlan.zhihu.com/p/379021086

[Redis实现访问控制频率](https://www.cnblogs.com/duanxz/p/4494072.html)

[基于 redis 的分布式限流](https://www.cnblogs.com/duanxz/p/4123068.html#c-2)：

```lua
local listLen, time
listLen = redis.call('LLEN', KEYS[1])
if listLen and tonumber(listLen) < tonumber(ARGV[1]) then
    local a = redis.call('TIME');
    redis.call('LPUSH', KEYS[1], a[1]*1000000+a[2])
else
    time = redis.call('LINDEX', KEYS[1], -1)
    local a = redis.call('TIME');
    if a[1]*1000000+a[2] - time < tonumber(ARGV[2])*1000000 then
        return 0;
    else
        redis.call('LPUSH', KEYS[1], a[1]*1000000+a[2])
        redis.call('LTRIM', KEYS[1], 0, tonumber(ARGV[1])-1)
    end
end
return 1;
```

```lua
local c
c = redis.call('get', KEYS[1])
if c and tonumber(c) > tonumber(ARGV[1]) then
    return c;
end
    c = redis.call('incr', KEYS[1])
    if tonumber(c) == 1 then
        redis.call('expire', KEYS[1], ARGV[2])
end
return c;
```

