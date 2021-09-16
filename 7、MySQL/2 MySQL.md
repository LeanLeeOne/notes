![image](../images/7/mysql-framework-english.png)

![image](../images/7/mysql-framework-chinese.png)

如上图所示，MySQL的[逻辑架构](https://blog.csdn.net/hguisu/article/details/7106342)主要分为：

1. 各类连接器
2. 管理服务和工具
3. 连接池
4. SQL接口
5. 解析器
6. 查询优化器
7. 读缓存和写缓冲
8. 插件式存储引擎

MySQL有两个主要的存储引擎：

1. MyISAM
   1. 该引擎基于IBM的文件系统ISAM（Index Sequential Access Method，索引顺序访问方法，可以连续地或任意地记录任何访问）。
   2. 其缓存为Key Cache，只保存索引，不保存数据（OS Cache会保存数据）。
2. InnoDB
   1. 该引擎支持事务、外键、行锁，采用了聚族索引、预读取的设计。
   2. 其缓存为Buffer Pool，保存索引和数据。



<span style=background:#ffee7c>InnoDB底层数据结构</span>