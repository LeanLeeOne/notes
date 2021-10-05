## 组成

**Hadoop**，是一个用于Reliable（可靠、容灾）、Scalable（可扩展），Distributed（分布式）计算的框架，它根据谷歌的[BigTable论文](https://static.googleusercontent.com/media/research.google.com/zh-CN//archive/bigtable-osdi06.pdf)和[MapReduce论文](https://static.googleusercontent.com/media/research.google.com/zh-CN//archive/mapreduce-osdi04.pdf)实现，[主要由4部分组成](https://www.cnblogs.com/along21/p/10496468.html)：

1. ##### Common Utilities

   1. 提供文件系统和操作系统的抽象共其他模块使用。

2. ##### HDFS

   1. Hadoop Distributed File System，分布式文件系统，数据高吞吐量访问的保证。

3. ##### MapReduce

   1. 一种并行计算框架：应用程序被分割为多个小部分，每个部分都能在集群的任意节点上运行。

4. ##### YARN

   1. 作业调度和集群资源管理的框架。

**Hadoop**关于容灾的理念：硬件故障是常见的，**Hadoop**框架应该能够自动处理故障节点。这一理念正是通过**HDFS**和**MapReduce**实现的。

![](../images/9/hadoop.png)



## 实现

**Hadoop**框架有几个重要的实现。

### **Hive**

一个基于**Hadoop**的数据仓库，能够将结构化数据映射为数据库表，并将我们编写SQL（HQL）转换为**MapReduce**来处理批量数据的计算。

1. 2007年，**Facebook**发布**Hive**，并于2008年捐献给**Apache**。**Hive**是**Hadoop**生态中的第一个SQL框架。
2. **Hive**可以使用**MapReduce**、**TeZ**、**Spark**来执行查询。
   1. 早期的**Hive**使用**MapReduce**进行查询，复杂查询需要多次传递数据，性能低，只能用来做<span style=background:#c2e2ff>离线</span>计算。
   2. 后来**Hive**使用**Tez**，一个精简的**MapReduce**框架，性能得到了提升。
   3. 再后来**Hive** 2.0推出，使用Hive-on-Spark，在性能（实时性）、可用性、稳定性等方面都有了进一步的提高。

### HBase

Hadoop DataBase，是一个基于**Hadoop**的数据库，具有分布式、版本化、非关系型的特点，提供类似BigTable的高并发写和<span style=background:#c2e2ff>实时</span>、<span style=background:#c2e2ff>随机</span>读大数据的能力。

1. **HBase**在列上实现了[BigTable论文](https://static.googleusercontent.com/media/research.google.com/zh-CN//archive/bigtable-osdi06.pdf)中提到的压缩算法、内存操作和布隆过滤器。
2. **HBase**没有使用**MapReduce**，而是使用了自带的基于**HDFS**的执行引擎。
3. **HBase**的表能作为**MapReduce**任务的输入和输出。

### Spark

一个[分布式计算引擎](https://www.techug.com/post/open-source-sql-engine.html)。

1. 它的诞生于2009年，并于2013年成为**Apache**中的项目，要晚于**Hive**。
2. [Spark是一个计算引擎](https://www.codenong.com/cs109813783/)，它对标的应该是**MapReduce**，性能要比**MapReduce**强。
   1. **Spark**是通过为SQL生成有向无环图，加上各种算子和宽窄依赖的优化达到高性能的。

3. **Spark**是为了<span style=background:#c2e2ff>简化</span>**MapReduce**的编写工作，允许我们以SQL的形式查询**Hadoop**中的数据。

4. **Spark**与**Hive**出现的原因一样，所以有时会拿两者进行比较：
   1. **Spark**要比直接使用**MapReduce**的**Hive**要快，但是**Hive**是**Hadoop**的默认SQL，**Hadoop**的每个版本都支持**Hive**。

### Hive与HBase

两者的[应用场景不同](https://blog.csdn.net/zx8167107/article/details/79265537)：

1. **Hive**是数据仓库，用来存储海量<span style=background:#c2e2ff>结构化</span>数据，以及数据的<span style=background:#c2e2ff>全量</span>分析挖掘。

2. **HBase**是数据库，用来存储海量<span style=background:#c2e2ff>半结构化</span>数据，以及数据的条件化（也就是<span style=background:#c2e2ff>非全量</span>）查询。


两者用处不同，但是可以协同关系：

1. **ETL**工具将数据抽取到**HDFS**中。
2. **Hive**对数据进行清洗处理，得到处理好的数据后：
   1. **Hive**可以对这些数据做进一步的挖掘，
   2. **Hive**也可以将这些数据存入**HBase**中，由**HBase**提供随机实时查询。

两者对旧数据的修改删除都是通过追加覆盖的方式实现的，这也是它们追求写入性能的必然。

### Apache Avro

**Avro**是新的数据序列化格式与传输工具，用于逐步取代**Hadoop**的原有IPC（Inter-Process Communication）机制。

> **Kafka**默认也是使用**Avro**