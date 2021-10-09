## 架构

![](../images/9/hbase-framework.png)

如[上图](https://www.cnblogs.com/along21/p/10496468.html)所示，HBase的架构包括：

1. ##### Client

   1. 包含访问**HBase**的接口，并维护缓存以加速访问。
   2. **HBase** Client通过基于**Protocol Buffer**的RPC的方式与**Region Server**通信。

2. ##### Zookeeper

   1. 存储Schema、Table的元数据的<span style=background:#c2e2ff>地址</span>。

      > 真正的元数据还是保存在**Region Server**上的，一张以“hbase”作为命名空间，的表——`hbase:meta`上。

   2. 存储所有**Region**的寻址入口、**Master**的地址。

   3. 确保在任意时刻，集群中只有一个**Master**。

      > 多个Master-eligible通过抢注的方式来<span style=background:#c2e2ff>竞选</span>**Master**。

   5. 监控**Region Server**的上下线，并通知**Master**。

      > **Region Server**会在**Zookeeper**上注册临时节点；
      >
      > 当**Region Server**宕机后，相应的Session会超时，**Zookeeper**就会移除对应的临时节点，并通知**Master**；
      >
      > **Master**处理宕机的**Region Server**上遗留的**HLog**，根据**Region**中的记录和**HLog**中的对应关系对**HLog**进行拆分，并把**HLog**放到相应的**Region**目录下；
      >
      > **Region Server**领取到相应的**Region**和**HLog**后，会把**HLog**上的数据操作重新做一遍，然后将**MemStore**中的数据刷写到**StoreFile**上。[[1]](https://zhuanlan.zhihu.com/p/145551967#21/24)

3. ##### HMaster

   1. **Master**为**Region Server**分配**Region**。

      > 默认采用类似轮询的方式，来保证每个**Region Server**上的**Region**数量基本相同，以便<span style=background:#d4fe7f>负载</span>的<span style=background:#d4fe7f>均衡</span>。
      >
      > 对于<span style=background:#ffb8b8>热点</span>聚集在某个**Region**上的问题无力解决，也不会由**Master**来解决。
      >
      > 此外，还有[一种叫做StochasticLoadBalancer的策略](http://openinx.github.io/2016/06/21/hbase-balance/#stochasticloadbalancer策略)，会根据多个因素计算加权成本。

   2. 发现失效**Region Server**，并重新分配其上的**Region**。

   3. 执行建表等DDL操作。

4. ##### HRegionServer

   1. 负责维护**Region**，处理**Region**上的IO。
   2. 负责切分运行过程中变得过大的**Region**。
   3. 一张表分为多个**Region**，分布在多个**Region Server**上；当然，一个**Region Server**管理着<span style=background:#c2e2ff>多个</span>**Region**。

5. ##### HRegion

   1. **Region**是**HBase**的中分布式存储和<span style=background:#d4fe7f>负载均衡</span>的最小单位，**Store**则是最终存储的最小单位。
   2. 每个**Region**都对应一张表，储存着一张表中的部分连续数据；每个**Region**会保存所存储数据的起止行键，以便数据的定位查找。

6. ##### HLog[[2]](https://segmentfault.com/a/1190000023394317)[[3]](https://www.jianshu.com/p/569106a3008f#14/27)

   1. 每个**Region Server**拥有一个或多个**HLog**，多个**Region**会<span style=background:#c2e2ff>共享</span>一个**HLog**。

      > 默认只有1个，1.1版本可以开启MultiWAL功能，允许多个HLog。

   2. **HLog**会定时滚动，滚动时会新建一个新**HLog**来接收新的日志，滚动的目的是为了防止单个**HLog**体积过大。

   3. 已落盘到**StoreFile**中的日志会被清理，清理过程以**HLog**文件为单位进行。

   4. **HLog**是一种WAL，Write-Ahead Log，其本质上是一个**HSF**，而**HSF**（Hadoop Sequence File）是一种存储键值对的文件：

      1. 键的类型为<span style=background:#c2e2ff>HLogKey</span>，保存有数据的归属信息，`sequence id`、<span style=background:#e6e6e6>write timestamp</span>、<span style=background:#e6e6e6>cluster ids</span>、<span style=background:#e6e6e6>region name</span>、<span style=background:#e6e6e6>table name</span>等信息。
      2. 值的类型为<span style=background:#c2e2ff>WALEdit</span>，也是对<span style=background:#c2e2ff>增删改</span>等操作的进一步封装，实质上是**HBase**的KeyValue对象。

      > HLog的清理、Failover都是根据`sequence id`来进行的。

7. ##### HStore

   1. 一个**Region**包含多个**Store**，一个**Store**[对应一个](https://blog.csdn.net/zhouleilei/article/details/8500938)**Column Family**。

      > 这样的设计也从侧面反映出，**Column Family**的概念应对应数据库中的**Table**。

   2. 一个**Store**由一个内存中的**MemStore**和多个硬盘上的**StoreFile**组成。

8. ##### MemStore

   1. **HBase**中的数据是先写入**HLog**，然后再写入**MemStore**，待内存占用达到阈值或单个**MemStore**达到阈值后，**Region Server**会将其`flush()`到**StoreFile**中。

   2. `flush()`时，**Region**会不可用：**Region Server**会对**Region**做Snapshot，对**HLog**进行Checkpoint。

   3. 由于采用了刷写的设计，Client查询时会先从**MemStore**中查找，未果后再从**StoreFile**中查找。

      > **MemStore**采用跳表来组织数据。
      >
      > 对于IO密集的场景，瓶颈不在内存，而在硬盘。增大JVM的内存，反而会影响GC，导致IO下降，不如增加一台机器，分摊IO压力。[[4]](http://hbasefly.com/2016/12/21/hbase-getorscan/#10/27)

9. ##### StoreFile

   1. **StoreFile**会根据一定条件进行合并，具体内容见下文。
   
   2. **StoreFile**是对HFile的简单封装。

      > HFile，Hadoop Binary File。
      >
      > 
   



## 数据结构

RDBMS是以行进行存储了，一行中的字段（列）是固定的，无论该列有没有值，这也使得RDBMS不适合存储<span style=background:#c2e2ff>稀疏表</span>。

**HBase**[按照列进行存储](https://zhuanlan.zhihu.com/p/145551967)，一条记录字段是不固定的，没有值的字段不存储，因此，**HBase**比RDBMS适合存储<span style=background:#c2e2ff>稀疏表</span>。

> 稠密表大家都一样。

### 键值存储

**HBase**的实际存储单元是<u>键值对</u>，所谓的面向列，就是面向<u>键值对</u>，如[下图](https://blog.csdn.net/bitcarmanlee/article/details/78979836)所示：

1. Key：是由**Rowkey**、**Column Family**、列、版本、类型（增、删）等组成。
2. Value：就是我们实际保存的值。

> **Rowkey**的底层也是B+树。


![](../images/9/hbase-rowkey.jpg)

### 行键

**Rowkey**的设计原则：

1. #### 唯一

   1. 最基本的要求。

2. #### 业务相关

   1. 以便查询。

3. #### 简短

   1. 因为**HBase**面向<u>键值对</u>，**Rowkey**是占空间的，**Rowkey**越小越节省空间。
   2. 对于**Rowkey**中包含时间戳的数据，可以考虑按日期<span style=background:#c2e2ff>分表</span>，这样**Rowkey**中仅需保存时间，节省空间。

4. #### 散列

   1. 散列的Key能保证<span style=background:#d4fe7f>负载</span>的<span style=background:#d4fe7f>均衡</span>。
   2. 可以通过<span style=background:#c9ccff>Hash</span>、<span style=background:#c9ccff>MD5</span>、<span style=background:#c9ccff>时间戳反转</span>、<span style=background:#c9ccff>**加盐**</span>的方式进行散列。

   > 身份证号、车牌号自带散列特点。
   >
   > **加盐**是比较好的散列方式，令**Rowkey**仍然业务相关，但是会增**Rowkey**的长度，增加文件体积。
   >
   > 最好不要采用时间、用户ID等明显有分段现象的属性直接当作**Rowkey**来使用。

**业务相关**与**散列**是矛盾的，所以：

1. <u>写多于读</u>的情景，尽量**散列**，<span style=background:#d4fe7f>负载</span>能够<span style=background:#d4fe7f>均衡</span>，同时再配合<span style=background:#19d02a>预分区</span>，可以有效缓解<span style=background:#ffb8b8>热点问题</span>。
2. <u>读多于写</u>的情景，应避免**散列**，以便根据业务属性直接组装**Rowkey**，从而快速查出数据。

**HBase**按照**Rowkey**排序存放，所以**HBase**适合存储以<span style=background:#c2e2ff>实体</span>为中心的数据。

1. <span style=background:#c2e2ff>实体</span>指的是自然人、车辆、账号、手机号等对象。

2. 以这些<span style=background:#c2e2ff>实体</span>为中心的数据有：

   1. 基础属性信息（含标签类数据）。
   2. 关系信息（图数据）

   3. 事件数据：

      1. 监控数据
      2. 时序数据
      3. 位置数据
      4. 消息、日志数据
      5. 交易记录等

### 列族

**HBase**与RDBMS相比，除了支持<span style=background:#c2e2ff>高并发写</span>和<span style=background:#c2e2ff>海量数据的随机、实时读</span>外，还有个有优点是**Column Family**以及列的<span style=background:#c2e2ff>可扩展性</span>上，而可扩展性，是由于采用了<u>键值对</u>的设计才获得的。

**Column Faimly**的自由伸缩很方便，但是，如果是频繁写入的场景，**Column Family**[不要多于两个](https://blog.csdn.net/diaoxie5099/article/details/101350743)，因为如果不同的**Column Family**之间的行数差异过大，比如A列族有百万条数据，而B列族有十亿条，那么：

- Flushing和Compactions的相互作用导致大量不必要的IO，从而影响性能。
- 会导致百万条数据会随十亿条数据的分散而分散，进而导致对A列族的大规模扫描变慢。



## 读写

### 读写过程[[5]](https://blog.csdn.net/wonderful_life_mrchi/article/details/77566803#数据读写流程)

1. Client访问**Zookeeper**，获取`hbase:meta`所在的**Region**和**Region Server**地址。
2. Client到相应的**Region Server**中读取`hbase:meta`表，并根据Namespace、Table Name、**RowKey**获取**Region**以及**Region Server**地址。
4. Client向**Region Server**直接请求，完成数据读写。

可以看到，**HBase**的RPC过程有点多，[所以](https://chenhy.com/post/hbase-quickstart/#1-4-数据路由-hbase-meta)：

- Client从**Zookeeper**获取到`hbase:meta`所在的**Region Server**的地址后，会缓存该地址，以减少对**ZooKeeper**的访问。
- Client从`hbase:meta`中获取到**RowKey**对应的**Region Server**的地址后，会缓存该地址，以减少对`hbase:meta`的访问。

> - 0.96 版本以前会多一步，这是因为**HBase**在设计之初担心`hbase:meta`会太大。
> - Client对`hbase:meta`的缓存不更新，如果`hbase:meta`的内容发生了变化，如**Region**放到了别的**Region Server**上，Client根据缓存去访问时就会报错，报错后会进行有限重试，所有重试失败后，就会去`hbase:meta`所在的**Region Server**获取最新的数据，如果`hbase:meta`不在之前的**Region Server**上，则会去**Zookeeper**上重新获取`hbase:meta`所在的**Region Server**的地址。
> - 以上两点补充来自[一篇超详细的HBase学习笔记](https://www.jianshu.com/p/569106a3008f#10/27)。

### 查询方式

数据的查询方式：

1. `get`，通过**Rowkey**直接返回指定的记录。

2. `scan`，对表进行扫描。
   1. 使用`setCaching`、`setBatch`方法提高速度，空间换时间。
   2. 设置起止行：`start-key`、`end-key`。
   3. 使用`setFilter()`设置过滤器，但是会降低速度。

不难看出，**HBase**的[查询能力较弱](https://mp.weixin.qq.com/s/CXsGcbbsKTMXotlwRFQ5xw)，我们可以使用如下工具，针对具体场景来增强**HBase**的查询能力：

1. OpenTSDB，时序数据存储，提供基于Metrics、时间、标签等条件的组合查询。
2. GeoMesa，时空数据存储，提供基于时间、空间范围的索引能力。
3. JanusGrph，图数据存储，提供基于属性、关系的图索引能力。

但是即便有了这些工具的增强，**HBase**的查询能力也不能与RDBMS相比，当然**HBase**也不是旨在取代RDBMS，而是一种对其的补充。

### 多条件查询

- 将查询条件提前拼装到**Rowkey**中
- 使用`setFilter()`设置过滤器，过滤器有：
  - <span style=background:#ffee7c>—</span>
  - <span style=background:#ffee7c>—</span>
  - <span style=background:#ffee7c>—</span>

### 二级索引

#### Coprocessor

在`Put`数据时，向**HBase**中的二级索引表插入索引向。

### ElasticSearch、Solr

在**ElasticSearch**、**Solr**等数据库建立对**HBase**表的二级索引。



## 合并与拆分

### 合并StoreFile[[6]](http://hbasefly.com/2016/07/13/hbase-compaction-1/)

当满足某些条件时，**Region Server**会将**SotreFile**合并为更大的**StoreFile**：

1. <span style=background:#f8d2ff>Minor Compaction</span>：每次`flush()`前，会检查**StoreFile**的文件数量是否达到阈值，若是，则选取部分相邻的**StoreFile**进行合并。会频繁进行。
2. <span style=background:#ffb8b8>Major Compaction</span>：对整个**Region**中相同**Column Family**的所有**Store**合并成一个，合并时会清理被标记删除的、TTL到期、版本号超过设定版本数的数据，开销大。默认每周自动触发一次；但往往禁用自动触发，选择在空闲时间手动执行。

![](../images/9/hbase-compaction.jpg)

Compaction相关参数可查看[文章](https://blog.csdn.net/shenshouniu/article/details/83902291)。

### 拆分Region

当满足[拆分策略](https://www.cnblogs.com/duanxz/p/3154487.html)所规定的条件时，**Region Server**就会自动将**Region**拆分为均等的两份。

拆分**Region**前，**Region Server**会先将**Region**下线；拆分完成后，**Region Server**在`hbase:meta`新增**Daughter Region**的信息，即，将**Daughter Region**上线，向**Master**汇报，**Master**会将**Daughter Region**分配到相应的**Region Server**上，实现<span style=background:#d4fe7f>负载均衡</span>。

[拆分过程会在秒级以内，因为](https://www.cnblogs.com/duanxz/p/4516283.html#11/12)只是对**Parent Region**进行了逻辑拆分，没有底层数据的重组，即，**Parent Region**没有被销毁，**Daughter Region**只是简单的对**Parent Region**进行了索引。只有当**Daughter Region**进行<span style=background:#ffb8b8>Major Compaction</span>后，发现不再被**Daughter Region**索引后，才会将其进行清理。

可以看到，拆分会导致**Region**暂时不可用，所以往往会关闭自动拆分，并且在建表时，对**Region**进行<span style=background:#19d02a>预分区</span>。

> 关闭方式为：将`hbase.hregion.max.filesize`设为足够大，并指定拆分策略为**ConstantSizeRegionSplitPolicy**。

### 拆分策略

- ##### ConstantSizeRegionSplitPolicy

  - 0.94 版本之前的默认策略，当一个**Region**的所有**SotreFile**的大小之和达到阈值时就会对其进行拆分。

- ##### IncreasingToUpperBoundRegionSplitPolicy

  - 0.94 版本之后的默认策略，根据`min(r^2 * flushSize, maxFileSize)`确定**Region**的体积阈值。
  - 其中`r`为**Region**的数量。
  - `flushSize`由`hbase.hregion.memstore.flush.size`确定，默认<span style=background:#e6e6e6>134217728</span>（<span style=background:#e6e6e6>128 MB</span>）。
  - `maxFileSize`由`hbase.hregion.max.filesize`确定，默认<span style=background:#e6e6e6>10GB</span>。

- ##### DelimitedKeyPrefixRegionSplitPolicy

  - 以**Rowkey**的前缀为拆分依据，保证相同**RowKey**前缀的数据在同一个**Region**中。
  - 通过<span style=background:#c2e2ff>分隔符</span>来间隔前缀和后缀。

- ##### KeyPrefixRegionSplitPolicy

  - 以**Rowkey**的前缀为拆分依据，保证相同**RowKey**前缀的数据在同一个**Region**中。
  - 通过**Table**的`prefix_split_key_policy.prefix_length`属性，来指定前缀长度。
  - 该策略适合前缀固定的**Rowkey**。
  - 当Table未设置该属性，或该属性不为**Integer**类型时，还是会使用**IncreasingToUpperBoundRegionSplitPolicy**。

> 按前缀拆分的两种策略较少使用。
>
> 技巧：“|”的[ASCII值](https://zh.wikipedia.org/wiki/ASCII#.E5.8F.AF.E6.98.BE.E7.A4.BA.E5.AD.97.E7.AC.A6)为124，“~”的ASCII值为126，大于所有的数字和字母等符号。

