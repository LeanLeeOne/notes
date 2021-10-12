### Spring的内容主要

1. IOC（beans、context、core）和AOP。
2. JDBC、ORM、Transaction。
3. MVC。
4. Test，支持使用JUnit对Spring组件进行单元测试和集成测试。
5. Spring Boot、Spring Cloud、Spring Data、Spring Security等。
6. JMS、JavaEmail、JMX、缓存等常见Java标准的集成。

更详细的模块划分请参照[下图](https://wiki.jikexueyuan.com/project/spring/architecture.html)：

![image](../images/5/spring-modules.png)



### Spring与设计模式

1. <span style=background:#c2e2ff>工厂模式</span>：**BeanFactory**就是简单工厂模式的体现，用来创建对象的实例；
2. <span style=background:#c2e2ff>单例模式</span>：**Bean**默认为单例模式。
3. <span style=background:#c2e2ff>代理模式</span>：**Spring**的**AOP**功能用到了JDK的**动态代理**和**CGLib**字节码生成技术；
4. <span style=background:#c2e2ff>模板方法</span>：用来解决代码重复的问题。比如：**RestTemplate**，**JmsTemplate**，**JpaTemplate**。
5. <span style=background:#c2e2ff>观察者模式</span>：定义对象键一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都会得到通知被制动更新，如**Spring**中<span style=background:#c2e2ff>观察者</span>的实现——**ApplicationListener**。

