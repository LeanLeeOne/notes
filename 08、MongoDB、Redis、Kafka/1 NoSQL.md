## 关系型数据库与非关系型数据库的简单比较

在我看来“NoSQL”是“没有SQL”、“不用写SQL”、“<span style=background:#c9ccff>非关系型数据库</span>”的意思，同时也是“Not Only SQL（不止SQL）”、“完成<span style=background:#f8d2ff>关系型数据库</span>能力之外工作”的意思。

<span style=background:#c9ccff>非关系型数据库</span>的种类有很多：

1. <u>键值对</u>存储，如**Redis**。
2. 列存储，如**HBase**（实际也是<u>键值对</u>存储）。
3. 文档存储，如**Elasticsearch**、**MongoDB**。
4. 图数据库，如**Neo4J**。

### 结构化

<span style=background:#f8d2ff>关系型数据库</span>采用结构化数据，<span style=background:#c9ccff>非关系型数据库</span>支持非结构化数据，但偏爱结构化数据。

### 事务

<span style=background:#f8d2ff>关系型数据库</span>仍是使用[最广泛的](https://db-engines.com/en/ranking)数据库，因为其对**关系**的表示（`JOIN`）和**事务**，是<span style=background:#c9ccff>非关系型数据库</span>无法替代的，更确切地说<span style=background:#c9ccff>非关系型数据库</span>是对<span style=background:#f8d2ff>关系型数据库</span>一种补充，或者说是对读写能力的增强（因为没有`JOIN`、事务），甚至各类<span style=background:#c9ccff>非关系型数据库</span>之间也不是为了相互取代，而是相互补充。

### 分布式

<span style=background:#f8d2ff>关系型数据库</span>往往使用单机模式，而非集群模式，能够实现强一致性，但在并发读写、容灾、扩展等方面存在先天不足。对此，<span style=background:#f8d2ff>关系型数据库</span>使用主从模式、读写分离等措施来应对，但归途还是集群模式。

<span style=background:#c9ccff>非关系型数据库</span>大多基于集群模式，或者说分布式，只能追求最终一致性，同时，更复杂的系统要求更高的维护成本，再者，集群 / 分布式需要考率网络传输（带宽、延迟、信息丢失）问题。

### 存储方式

数据存储方式可分为**行式存储**、**列式存储**。

- <span style=background:#f8d2ff>关系型数据库</span>多采用**行式存储**。
- <span style=background:#c9ccff>非关系型数据库</span>既有采用**行式存储**，又有采用**列式存储**。

### 数据处理

数据处理分为**OLTP**、**OLAP**：

- OLTP，On-Line Transaction Processing：
  - <span style=background:#f8d2ff>关系型数据库</span>主要用于**OLTP**。
  - 多为随机读写操作，操作耗时短。
- OLAP，On-Line Transaction Processing：
  - <span style=background:#c9ccff>非关系型数据库</span>主要用于**OLAP**。
  - 多为随机写、批量读取操作，读取后往往还需进行聚合操作，也就是报表，故读操作耗时长。



## 非关系型数据库的表设计

### 表的预设计模式与动态模式

#### 预设计模式

<span style=background:#f8d2ff>关系型数据库</span>多采用预设计模式。

指在建表之初就指定表结构，允许表结构的修改，但是插入的数据必须符合当前表结构，即，数据是结构化的。

#### 动态模式

<span style=background:#c9ccff>非关系型数据库</span>多支持动态模式。

指无需指定表结构，每次插入的数据的无需保持结构一致，即，数据是半结构化、甚至非结构化的。

#### 小结

动态模式更加灵活，能够将数量少、种类多的数据集中存储到一张表中。

有利有弊，动态模式要求程序需要对文档类型进行判断，增加编码量、系统复杂性、数据库底层数据维护的开销。

总之，动态模式不能滥用。

### 范式化与反范式化

#### Normalization

<u>范式化</u>：将同一类的不同的属性切分到不同的表中，利用关系模型将这些属性关联起来，某一类属性的变化不对其它属性产生影响。

<u>范式化</u>往往只需写入（增删改）部分表，写入量小、修改方便；读取时往往需要关联多张表。

<span style=background:#f8d2ff>关系型数据库</span>追求<u>范式化</u>。

#### Denormalization

<u>反范式化</u>：不将同一类的不同属性进行切分，采用内嵌的方式将同一对象不同的属性进行关联。

<u>反范式化</u>可以只写入部分字段，也可以要求每次都写入所有字段（写入量大、修改不方便）；读取时只需读取一张表，但有”包含的列可能多余“的问题。

<span style=background:#c9ccff>非关系型数据库</span>大多只支持<u>非范式化</u>。

#### 小结

<u>范式化</u>、<u>反范式化</u>不存在优劣，读写性能的差异也要看具体的场景，实际应用时往往是根据需要采用折中做法。



## 范式设计[[1]](https://baike.baidu.com/item/设计范式/894217)

### 第一范式

每个字段都是不可分割的，确定行的确定字段不能有多个值，不能有重复字段。

### 第二范式

每行记录被唯一地区分，通常是通过主键来区分。

### 第三范式

表中不能包含其它表中包含的非主键信息。

