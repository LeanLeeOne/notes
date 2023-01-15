## Flink简洁



## Iceberg

**Iceberg**是一种表格式，可用于实现实时数仓、数据湖。

> [表格式是](https://bigdata.djbook.top/sites/122.html/)一个位于计算层（**Flink**、**Spark**）和存储层（**ORC**、**Parqurt**）的中间层，它不定义数据存储方式，而是定义数据、元数据的组织方式，向上提供统一的“表”的语义。
>
> 数据湖[需要支持](https://blog.51cto.com/u_15127525/2686217)数据更新、事务、可扩展的元数据。
>
> - 数据更新：在分区中追加数据、合并或重写分区。

**Iceberg**的核心思想为，基于快照在时间轴上跟踪表的所有变化。

- 快照是表数据文件在某一时刻的一个完整集合。
- 每次更新都会生成一个新的快照。
- 表的元数据是不可修改的，并且始终向前迭代。

> **Iceberg**中，表的多级分区只是一个逻辑概念，实际上会拼接为一个分区。这种设计减少了文件列表的读取次数。
>
> **Iceberg**的增量读取、表结构变更都是基于快照实现的。
>
> **Iceberg**使用JSON格式保存Schema、Partition Spec以及当前Snapshot Manifests文件路径，使用AVRO格式保存Manifests文件路径、提交的文件以及文件级别元数据。
>
> **Iceberg**对数据、元数据的再组织，减少了不必要的读取，进而提升了读取效率。

### 实时数仓

实时数仓[往往采用](https://mp.weixin.qq.com/s/N7lGOXHqMAeiokF3myH7_g)基于**Kafka**+**Flink**的方式，这种方式存在无法复用离线数仓的数据血缘、数据质量等问题，需要新建一套，增加了系统复杂性和运行、维护成本，因此，有人提出了流批一体的想法。流批一体包括SQL统一和计算引擎统一两种实现方式，但流批一体的核心，不在实现方式上，而在存储层，这也正是**Iceberg**等表格式所努力的方向。

> 数仓架构包含Lambda和Kappa[两种](https://libertydream.github.io/2020/04/12/lambda-%E5%92%8C-kappa-%E7%AE%80%E4%BB%8B/)：
>
> - λ，Lambda：实时数仓和离线数仓并行的架构，整个过程可用函数方程表示为`Query=λ(Complete data)=λ(live streaming data)⋅λ(stored data)`
> - κ，Kappa：流批一体的架构，整个过程可用函数方程表示为`Query=K(New data)=K(Live streaming data)`。
>
> 网易数据湖大数据系列文章：
>
> 1. [实时数据仓库的发展、架构和趋势](https://mp.weixin.qq.com/s/N7lGOXHqMAeiokF3myH7_g)
> 2. [Apache Iceberg快速入门](https://mp.weixin.qq.com/s/LuvN5u9CBPj5AJ_SgJiHsw)
> 3. [如何正确使用Iceberg](https://mp.weixin.qq.com/s/QBIozrtOF5rVnQjneBFS0g)
> 4. [在网易云音乐的实践]()

