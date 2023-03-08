## 简述

**Spring  JDBC**消除了烦琐的JDBC编码和数据库厂商特有的错误代码解析。

如果发生了运行时异常，**Spring**会自动捕获并回滚，但如果有检查型异常，就需要我们额外配置了`@Transactional(rollbackFor=RuntimeException.class, IOException.class)`。

所以为了简化代码，业务异常最好从运行时异常中派生。



## 传播级别

**Spring**的声明式事务的默认<span style=background:#c2e2ff>传播级别</span>是`TransactionDefinition.PROPAGATION_REQUIRED`，满足绝大部分场景。

| 隔离界别                  | 含义                                                         |
| ------------------------- | ------------------------------------------------------------ |
| PROPAGATION_REQUIRED      | 如果没有事务，则开启一个新的事务，如果有事务，则加入到这个事务中<br>默认级别 |
| PROPAGATION_SUPPORTS      | 有就加入，没有也照样执行                                   |
| PROPAGATION_MANDATORY     | 强制加入到当前事务，如果当前没有事务，则抛出异常           |
| PROPAGATION_REQUIRED_NEW  | 每次新建一个事务                                           |
| PROPAGATION_NOT_SUPPORTED | 不支持事务，如果当前有事务，事务会暂时挂起                 |
| PROPAGATION_NEVER         | 遇到事务会暂停执行抛出异常                                 |
| PROPAGATION_NESTED        | 如果有，则开启一个嵌套事务                                 |
| TIMEOUT_DEFAULT           | 使用默认超时的底层事务系统，如果底层不支持超时则没有       |

<span style=background:#fdc200>注意</span>，每开启一个事务，就会新建数据库连接，慢，所以事务不能太复杂。

> 事务边界、事务传播。



## 隔离级别

**Spring**有5种<span style=background:#c2e2ff>隔离级别</span>。

1. ISOLATION_DEFAULT
   1. 默认值，即，使用数据库的设置。
   2. 其它四个隔离级别和数据库的隔离级别一致。
2. ISOLATION_READ_UNCOMMITTED
3. ISOLATION_READ_COMMITTED
4. ISOLATION_REPEATABLE_READ
5. ISOLATION_SERIALIZABLE



## ORM

JPA，Java Persistent API，是JavaEE的一个**ORM**标准，JPA的实现有**Hibernate**、**EclipseLink**等。

**ORM**框架通常提供两级缓存：

1. 一级缓存是Session内的查询，相同查询会返回相同结果
2. 二级缓存是跨Session的查询，默认关闭。
   1. 二级缓存（跨Session的查询）增加了数据的不一致性。

**Spring**的**JdbcTemplate**没有缓存，读取操作就是直接进行数据库操作。

**ORM**框架可以分为三种：

1. ##### 全自动
   
   1. 如**Hibernate**，可以自动完成对象-关系的映射，SQL的创建。
2. ##### 手动
   
   1. 如**Spring JDBC**，需要我们自己传入`Mapper`实例对查询结果进行映射转换，手动填充查询参数，手动编写`SQL`。
   2. 手写SQL繁琐，但是也有优点：优化工作简单，直接优化我们的`SQL`就行，也可以编写任意复杂的`SQL`。
   3. `@Query(SQL)`
3. ##### 半自动
   
   1. 如**MyBatis**，可以自动完成查询结果的映射转换、查询参数的设置，但是执行SQL需要手写。



## 原理[[1]](https://blog.csdn.net/nextyu/article/details/78669997)

**Spring**提供2种事务管理：

- 编程式事务，灵活，但难维护。

- 声明式事务则相反，并且能将业务逻辑与事务处理<span style=background:#c2e2ff>解耦</span>。

### 声明式事务

**Spring**提供2种声明式事务的使用方式：XML和`@Transactional`。

**Spring**通过**AOP**在运行时生成代理对象的方式，来实现的声明式事务：

- 如果方法正常返回则提交。
- 如果方法抛出异常则回滚。

> [`@Async`不能与`@Transactional`修饰同一方法](https://blog.csdn.net/blueheart20/article/details/44648667)，因为这两个注解会分别生成一个代理类。
>
> 同样是因为代理，`@Transactional`只能用在`public`方法上。

### 与ThreadLocal

**Spring**是通过`ThreadLocal`来获取当前事务，具体来说是通过将`Connection`和`TransactionStatus`绑定到`ThreadLocal`上。

正因为`Transaction`都是绑定到`ThreadLocal`里的，所以新线程中的跟旧线程中的显然不是同一个。

### 其它

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
