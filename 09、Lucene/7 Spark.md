## 简述

如[下图](https://www.hadoopdoc.com/spark/spark-intro)所示，**Spark**主要由`5`部分组成：

1. Spark Core：该模块提供弹性分布式数据集（Resilient Distributed Dataset，RDD），并实现了应用调度、RPC、序列化、压缩和内存计算，并为Spark SQL、Spark Streaming、Spark MLlib、Spark GraphX等上层组件提供API。
2. Spark SQL：该模块允许我们使用SQL来查询结构化数据，支持**Hive**表、**Parquet**文件和JSON文件等内容。
3. Spark Streaming：该模块以微小的批的方式处理流数据，提供强大的交互和数据查询。
4. Spark MLlib：该模块封装了很多高效的机器学习（迭代）算法。
5. Spark GraphX：该模块用于处理图数据。

![](../images/9/spark_architecture.svg)



## Spark Core

见《[7.1 Resilient Distributed Dataset](./7.1 Resilient Distributed Dataset)》《[7.2 运行机制](./7.2 运行机制)》和《[7.3 调优](./7.3 调优)》。

