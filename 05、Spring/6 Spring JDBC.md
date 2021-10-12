**Spring  JDBC**消除了烦琐的JDBC编码和数据库厂商特有的错误代码解析。

如果发生了运行时异常，**Spring**会自动捕获并回滚，但如果有检查型异常，就需要我们额外配置了：

<span style=background:#e6e6e6>@Transactional(rollbackFor=RuntimeException.class, IOException.class)</span>。

故，为了简化代码，建议我们的业务异常从运行时异常中派生。



### 传播级别

事务边界、事务传播。

Spring的声明式事务的默认<span style=background:#c2e2ff>传播级别</span>是**PROPAGATION_REQUIRED**，满足绝大部分场景。

除此之外还有以下级别：

1. <span style=background:#b3b3b3>TransactionDefinition.PROPAGATION_REQUIRED</span>
   1. 如果没有事务，则开启一个新的事务，如果有事务，则加入到这个事务中。
2. <span style=background:#b3b3b3>TransactionDefinition.PROPAGATION_SUPPORTS</span>
   1. 有就加入，没有也照样执行。
3. <span style=background:#b3b3b3>TransactionDefinition.PROPAGATION_MANDATORY</span>
   1. 强制加入到当前事务，如果当前没有事务，则抛出异常。
4. <span style=background:#b3b3b3>TransactionDefinition.PROPAGATION_REQUIRED_NEW</span>
   1. 每次新建一个事务。
5. <span style=background:#b3b3b3>TransactionDefinition.PROPAGATION_NOT_SUPPORTED</span>
   1. 不支持事务，如果当前有事务，事务会暂时挂起。
6. <span style=background:#b3b3b3>TransactionDefinition.PROPAGATION_NEVER</span>
   1. 遇到事务会暂停执行抛出异常。
7. <span style=background:#b3b3b3>TransactionDefinition.PROPAGATION_NESTED</span>
   1. 如果有，则开启一个嵌套事务。
8. <span style=background:#b3b3b3>TransactionDefinition.TIMEOUT_DEFAULT</span>
   1. 使用默认超时的底层事务系统，如果底层不支持超时则没有。

每开启一个事务，就会新建数据库连接，慢，所以事务不能太复杂。



### 隔离级别

**Spring**有5种<span style=background:#c2e2ff>隔离级别</span>，

1. <span style=background:#b3b3b3>TransactionDefinition.ISOLATION_DEFAULT</span>
   1. 默认值，即，使用数据库的设置。
   2. 其它四个隔离级别和数据库的隔离级别一致。
2. <span style=background:#b3b3b3>TransactionDefinition.ISOLATION_READ_UNCOMMITTED</span>
3. <span style=background:#b3b3b3>TransactionDefinition.ISOLATION_READ_COMMITTED</span>
4. <span style=background:#b3b3b3>TransactionDefinition.ISOLATION_REPEATABLE_READ</span>
5. <span style=background:#b3b3b3>TransactionDefinition.ISOLATION_SERIALIZABLE</span>



### ORM

JPA，Java Persistent Api，是JavaEE的一个**ORM**标准，JPA的实现有**Hibernate**、**EclipseLink**等。

**ORM**框架通常提供两级缓存：

1. 一级缓存是session内的查询，相同查询会返回相同结果
2. 二级缓存是跨session的查询，默认关闭。二级缓存（跨session的查询）增加了数据的不一致性。

**Spring**的**JdbcTemplate**没有缓存，读取操作就是直接进行数据库操作。

**ORM**框架可以分为三种：

1. 全自动
   1. 如**Hibernate**，可以自动完成对象-关系的映射，sql的创建。
2. 手动
   1. 如**Spring JDBC**，需要我们自己传入Mapper实例对查询结果进行映射转换，手动填充查询参数，手动编写sql。
   2. 手写sql繁琐，但是也有优点：优化工作简单，直接优化我们的sql就行，也可以编写任意复杂的sql。
   3. <span style=background:#e6e6e6>@Query(sql)</span>
3. 半自动
   1. 如**Mybatis**，可以自动完成查询结果的映射转换、查询参数的设置，但是执行sql需要手写。



### 原理

Spring是通过**ThreadLocal**来获取当前事务，具体来说是通过将**Connection**和**TransactionStatus**绑定到**ThreadLocal**上。

编程式事务，灵活，但难维护；声明式事务则相反。声明式事务通过**AOP**实现，如果方法正常返回则提交，如果方法抛出异常则回滚。

```java
public interface PlatformTransactionManager {
	TransactionStatus getTransaction(TransactionDefinition definition) throws TransactionException; // 根据指定的传播行为，返回、创建事务
	void commit(TransactionStatus status) throws TransactionException; // 提交
	void rollback(TransactionStatus status) throws TransactionException; // 回滚
}
```

```java
public interface TransactionDefinition {
	int getPropagationBehavior(); // 传播行为
	int getIsolationLevel();	  // 隔离级别
	String getName();			  // 名称
	int getTimeout();			  // 超时时间
	boolean isReadOnly();		  // 只读
}
```

正因为**Transaction**都是绑定到**ThreadLocal**里的，所以显然新线程中的跟**Controller**里的不是同一个。



[@Async不能与@Transaction修饰同一方法](https://blog.csdn.net/blueheart20/article/details/44648667)，因为这两个注解会分别生成一个代理类。

