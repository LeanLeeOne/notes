## PostgreSQL

**PostgreSQL**的拥趸者们在梦想**PostgreSQL**逆袭MySQL的同时，**MySQL**已于**Oracle**[平起平坐](https://db-engines.com/en/ranking)。

> [PostgreSQL也很强大，为何在中国大陆，MySQL成为主流，PostgreSQL屈居二线呢？](https://www.zhihu.com/question/31955622)
>
> [MySQL与PostgreSQL比较，哪个更好、我们该选用哪个？](https://blog.csdn.net/weixin_36380516/article/details/113787668)
>
> [PostgreSQL与MySQL相比，优势何在？](https://www.zhihu.com/question/20010554)



## Oracle

政府行业、企业软件多采用**Oracle**，而互联网公司多采用**MySQL**，主要原因有：

1. 开源是互联网的基本精神，而闭源是商业的根基。

   1. **Oracle**是闭源的，我们无法修改代码，数据库出现问题，由其厂商来处理，贵有贵的道理。
   2. **MySQL**是开源的，我们可以修改代码，但是数据库出现问题，那就是我们的问题了，但持有成本低。
2. 对于简单查询来说，**Oracle**和**MySQL**性能相仿。当单表数据量上亿时：
   1. **Oracle**可以使用分区来水平切分数据，甚至可以使用专用的小型机提升新能；
   2. **MySQL**则通过分表，即，根据主键水平切分，以及避免无主键查询等措施来提升性能。

3. 对于复杂操作来说，**MySQL**自带的优化不如**Oracle**，需要开发者有较高的水平，而**Oracle**一直在持续进行复杂操作优化。
4. 另外，将原本由数据库完成的逻辑交由应用程序来实现，即，减少表连接、外键、[存储过程、触发器](https://www.cnblogs.com/xuancaoyy/p/5814645.html)的使用，能达到应用层与存储层的解耦。

   1. 在解耦的同时，放低了对数据库有复杂查询优化能力的要求，即，淡化了**MySQL**的弱点。

> - 存储过程（ Stored Procedure）是一组为了完成特定功能的SQL。
>   - Stored Procedure存储在数据库中，经过第一次编译后再次调用不需要再次编译，用户通过指定存储过程的名字及参数。 
> - 触发器（Trigger）是一种特殊的存储过程，通过触发事件行来执行，而非直接调用。
>   - 触发事件包括`UPDATE`、`INSERT`、` DELETE`等操作。

关系型数据库不是万能的，人们对它的使用也在逐渐恢复其本质——存储数据，其它工作交由各类丰富的**NoSQL**来处理：**Redis**、**MongoDB**等缓存中间件可以提升读取速度，**Hadoop**可以处理海量数据的批量离线计算（数据分析），<span style=background:#ffee7c>OpenStack Swift</span>处理在线计算。



## MySQL、Oracle在使用上的[区别](https://www.jb51.net/article/181429.htm)

1. ##### 事务的隔离级别

   1. **Oracle**默认为<span style=background:#f8d2ff>读已提交</span>。**Oracle**是通过在**Undo**表空间中构造多版本数据块来实现这些隔离级别的。
   2. **MySQL**默认为<span style=background:#f8d2ff>可重复读</span>。

2. ##### SQL
   
   1. **MySQL**对标准SQL进行了扩展，比如：`LIMIT`、`INSERT`多行、`SELECT`某些管理数据可不加`FROM`、使用聚合函数时可不加`GROUP BY`、自增行、支持双引号包裹字符串。
   
3. ##### 容灾

   1. **Oracle**主库故障时，即，自动切换主从库，此外还支持双机、多机容灾机制，推、拉同步均支持。
   2. **MySQL**主库故障时，需手动切换到从库。

4. ##### 附加功能

   1. **Oracle**有丰富的分析、诊断工具，方便性能调优；**Oracle**权限控制完善。
   2. **MySQL**缺乏调优工具；权限简单。