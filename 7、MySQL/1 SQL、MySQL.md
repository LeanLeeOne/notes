<span style=background:#ffee7c>mysql的单机峰值多少？</span>

<span style=background:#ffee7c>《[高性能MySQL](https://read.douban.com/reader/ebook/35648568/)》（书籍，146页）</span>

<span style=background:#ffee7c>InnoDB底层数据结构</span>



### 基本组成

SQL，Structured Query Language，有3部分：

DDL，Data Defind Language，定义数据，即添加表、删除表、修改表结构。

DML，Data Manipulation Language，添加删除更新数据。

DQL，Data Query Language，查询数据。



### 键

1. **主键**
   1. 主键不能带有业务信息，可以为自增型或GUID。
   2. 自增主键的类型如果为INT，可以存储21亿（2^31)条数据，
   3. 如果是BIGINT，则可以存储922亿亿（2^63)条数据。
   4. int(M): M indicates the maximum display width for integer types.

2. **联合主键**
   1. 除非有必要，才使用联合主键。联合主键会提升表之间的复杂度。
   2. 联合主键会生成相应的联合索引。

3. 外键
   1. 外键约束可以保证无效的数据无法插入，但是会降低性能，往往是通过应用程序来实现约束。



### 索引

想要某一列的值在插入时唯一，有以下2种方式：

1. 唯一索引，不允许作为外键

   ```sql
   ALTER TABLE table_name ADD UNIQUE INDEX idx_column(column_name)
   ```

   

2. 唯一约束，允许作为外键

   ```sql
   ALTER TABLE table_name ADD CONSTRAINT unique_column UNIQUE (column_name)
   ```

   2. 在MySQL中，唯一约束实际上是用唯一索引实现的，会创建一个唯一索引，两者在使用上没有区别。

两种方式都允许为null，另外MySQL中null不允许和null作比较，null == null和null != null均为false。



### 分页

`LIMIT [offset],[rows]`的另一种写法是`LIMIT [rows] OFFSET [offset]`

对`LIMIT`来说，`OFFSET`越大，查询速度越慢。

1. 这是因为`LIMIT`实际上是将`offset+rows`条数据全部查出，然后将前`offset`条数据全部丢弃。



### 排序

我们可以根据业务需要借助索引列来排序。

[MySQL ORDER BY LIMIT分页数据重复问题](https://www.jianshu.com/p/544c319fd838)：

1. `LIMIT`经常会搭配`ORDER BY`使用，但如果排序字段包含重复数值，**MySQL**不会处理重复值之间的顺序，即无序的，返回顺序依赖具体的执行计划。
2. 这就会造成如果某页正好在这些重复值中截断，会导致所谓的分页数值重复问题。

解决方法很简单：

1. 为排序字段添加<span style=background:#c2e2ff>索引</span>。
2. 将一个绝对有序，也就是没有重复值的字段加入到排序列中，往往会选择主键，这样排序结果就会变为绝对有序。

> If you combine LIMIT row_count with ORDER BY, MySQL stops sorting as soon as it has found the first row_count rows of the sorted result, rather than sorting the entire result. 
>
> <span style=background:#ffee7c>这个“entire result”指的究竟是只是行，还是包含列？</span>



### [一些实用SQL](https://www.liaoxuefeng.com/wiki/1177760294764384/1246617682185952)

1. 插入或替换

   ```sql
   REPLACE INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99);
   ```

2. 插入或更新

   ```sql
   INSERT INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99) ON DUPLICATE KEY UPDATE name='小明', gender='F', score=99;
   ```

3. 插入或忽略

   ```sql
   INSERT IGNORE INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99);
   ```

4. 从查询结果中插入

   ```sql
   INSERT INTO statistics (class_id, average) SELECT class_id, AVG(score) FROM students GROUP BY class_id;
   ```

5. 强制使用指定索引

   ```sql
   SELECT * FROM students FORCE INDEX (idx_class_id) WHERE class_id = 1 ORDER BY id DESC;
   ```



### MySQL

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
   2. **MySQL**有两个主要的存储引擎：
      1. **MyISAM**
         1. 该引擎基于IBM的文件系统ISAM（Index Sequential Access Method，索引顺序访问方法，可以连续地或任意地记录任何访问）。
         2. 其缓存为**Key Cache**，只保存索引，不保存数据（OS Cache会保存数据）。
      2. **InnoDB**
         1. 该引擎支持事务、外键、行锁，采用了聚族索引、预读取的设计。
         2. 其缓存为**Buffer Pool**，保存索引和数据。

![image](E:\markdown\images\7\mysql-framework-english.png)

![image](E:\markdown\images\7\mysql-framework-chinese.png)



