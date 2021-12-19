<span style=background:#ffee7c>mysql的单机峰值多少？</span>sysbench是一款开源的多线程性能测试工具，可以执行CPU、内存、线程、IO、数据库等方面的性能测试。

<span style=background:#ffee7c>《[高性能MySQL](https://read.douban.com/reader/ebook/35648568/)》（书籍，146页）</span>

<span style=background:#ffee7c>[Mysql为何使用可重复读为默认隔离级别?](https://juejin.cn/post/6974318442228744205)</span>

[InnoDB底层数据结构](https://juejin.cn/post/6844904190477598733)

阿里ApsaraDB[技术月报](http://mysql.taobao.org/monthly/)。

MySQL与编码，[导读](https://blog.hufeifei.cn/2018/05/26/DB/MySQL性能优化[实践篇]-复合索引实例/#where-c1-x-and-c2-x-and-c4-gt-x-and-c3-x)。



## 基本组成

SQL，Structured Query Language，有3部分：

- **DDL**，Data Defind Language：定义数据，即，添加表、删除表、修改表结构。
- **DML**，Data Manipulation Language：添加删除更新数据。
- **DQL**，Data Query Language：查询数据。



## 键

### 主键

**主键**不能带有业务信息，可以为自增型或GUID。

自增主键的类型如果为`INT`，可以存储`21亿`（`2^31`)条数据，

如果是`BIGINT`，则可以存储`922亿亿`（`2^63`)条数据。

> `int(M)`: M indicates the maximum display width for integer types.

### 联合主键

除非有必要，才使用联合主键。**联合主键**会提升表之间的复杂度。

**联合主键**会生成相应的<span style=background:#c2e2ff>联合索引</span>。

### 外键

**外键**约束可以保证无效的数据无法插入，但是会降低性能，往往是通过应用程序来实现约束。



## 唯一

想要某一列的值在插入时唯一，有以下2种方式：

1. 唯一索引，不允许作为**外键**。

   ```sql
   ALTER TABLE table_name ADD UNIQUE INDEX idx_column(column_name)
   ```

2. 唯一约束，允许作为**外键**。

   ```sql
   ALTER TABLE table_name ADD CONSTRAINT unique_column UNIQUE (column_name)
   ```

在**MySQL**中，唯一约束实际上是用唯一索引实现的，会创建一个唯一索引，但两者在使用上区别不大。

两种方式都允许为`NULL`，另外**MySQL**中`NULL`不允许和`NULL`作比较，`NULL == NULL`和`NULL != NULL`均为`false`。



## 查询

`UPDATE`过程实际上分为4步：

1. 先将数据查出。
2. 然后进行“row format”，转换到服务层。
3. 服务层修改数据。
4. 将数据写回。

> `SELECT`和`UPDATE`的[执行过程](https://zhuanlan.zhihu.com/p/270632940)。



## 分页

`LIMIT [offset],[rows]`的另一种写法是`LIMIT [rows] OFFSET [offset]`

对`LIMIT`来说，`OFFSET`越大，查询速度越慢。

这是因为`LIMIT`实际上是将`offset+rows`条数据全部查出，然后将前`offset`条数据全部丢弃。⭐



## 排序

我们可以根据业务需要借助索引列来排序。

排序时，**MySQL**会在内存中开辟一块缓存，大小为`sort_buffer_size`：

1. 如果要排序的数据量小于`sort_buffer_size`，则在内存中完成排序。
2. 如果要排序的数据量超出`sort_buffer_size`，则利用磁盘文件辅助排序。
   1. 文件排序一般使用归并排序算法。

### 数据重复问题

[MySQL ORDER BY LIMIT分页数据重复问题](https://www.jianshu.com/p/544c319fd838)

1. `LIMIT`经常会搭配`ORDER BY`使用，但如果排序字段包含重复数值，**MySQL**不会处理重复值之间的顺序，即，无序的，返回顺序依赖具体的执行计划。
2. 这就会造成如果某页正好在这些重复值中截断，会导致所谓的分页数值重复问题。

解决方法很简单：

1. 为排序字段添加<span style=background:#c2e2ff>索引</span>。
2. 将一个绝对有序，也就是没有重复值的字段加入到排序列中，往往会选择主键，这样排序结果就会变为绝对有序。

> If you combine LIMIT row_count with ORDER BY, MySQL stops sorting as soon as it has found the first row_count rows of the sorted result, rather than sorting the entire result. 
>
> <span style=background:#ffee7c>这个“entire result”指的究竟是只是行，还是包含列？</span>



## 关键词的执行顺序[[1]](https://www.jianshu.com/p/30fcf2a79286)

`FROM <left_table>`

`ON <join_condition>`

`<join_type> JOIN <right_table>`

`WHERE <where_condition>`

`GROUP BY <group_by_list>`

`HAVING <having_condition>`

`SELECT`

`DISTINCT <select_list>`

`ORDER BY <order_by_condition>`

`LIMIT <limit_number>`



## 集合运算

| 运算符      | 说明                                                   | 去重           | 排序               |
| ----------- | ------------------------------------------------------ | -------------- | ------------------ |
| `UNION`     | 对查询结果做<span style=background:#c2e2ff>并集</span> | 自动去掉重复行 | ❌                  |
| `UNION ALL` | 对查询结果做<span style=background:#c2e2ff>并集</span> | 不会去掉重复行 | ❌                  |
| `INTERSECT` | 对查询结果做<span style=background:#c2e2ff>交集</span> | ❌              | 根据第一列进行排序 |
| `MINUS`     | 对查询结果做<span style=background:#c2e2ff>减集</span> | ❌              | 根据第一列进行排序 |



## 一些实用SQL[[2]](https://www.liaoxuefeng.com/wiki/1177760294764384/1246617682185952)

##### 插入或替换

`REPLACE`不同于`UPDATE`，它实际上是先`DELETE`再`INSERT`，并且要求表有**主键**或者唯一的<span style=background:#c2e2ff>联合索引</span>。

```sql
REPLACE INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99);
```

##### 插入或更新

```sql
INSERT INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99) ON DUPLICATE KEY UPDATE name='小明', gender='F', score=99;
```

##### 插入或忽略

```sql
INSERT IGNORE INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99);
```

##### 从查询结果中插入

```sql
INSERT INTO statistics (class_id, average) SELECT class_id, AVG(score) FROM students GROUP BY class_id;
```

##### 强制使用指定索引

```sql
SELECT * FROM students FORCE INDEX (idx_class_id) WHERE class_id = 1 ORDER BY id DESC;
```



## MySQL

如下图所示，**MySQL**的[逻辑架构](https://blog.csdn.net/hguisu/article/details/7106342)主要分为：

1. **Connectors**
   1. 各类连接器。**MySQL**的非企业版本只支持一个线程一个连接。
2. **Management Services & Utilities**
   1. 管理服务和工具。
3. **Connection Pool**
   1. 连接池。
4. **SQL Interface**
5. **Parser**
   1. 解析器。
6. **Optimizer**
   1. 查询优化器。
7. **Cache & Buffers**
   1. 读缓存和写缓冲。
8. **Pluggable Storage Engines**
   1. 插件式存储引擎。
   2. **MySQL**有两个主要的存储引擎：⭐
      1. **MyISAM**
         1. 该引擎基于IBM的文件系统ISAM（Index Sequential Access Method，索引顺序访问方法，可以连续地或任意地记录任何访问）。
         2. 其缓存为**Key Cache**，只保存索引，不保存数据（**OS** Cache会保存数据）。
      2. **InnoDB**
         1. 该引擎支持<span style=background:#c2e2ff>事务</span>、<span style=background:#c2e2ff>外键</span>、<span style=background:#c2e2ff>行锁</span>，采用了<span style=background:#c2e2ff>聚族索引</span>、<span style=background:#c2e2ff>预读取</span>的设计。
         2. 其缓存为**Buffer Pool**，保存索引和数据。

![](../images/7/mysql-framework-english.png)

![](../images/7/mysql-framework-chinese.png)



