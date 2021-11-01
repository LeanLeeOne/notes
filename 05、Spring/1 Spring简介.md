## 简述

1. IOC（beans、context、core）和AOP。
2. JDBC、ORM、Transaction。
3. MVC。
4. Test，支持使用JUnit对Spring组件进行单元测试和集成测试。
5. Spring Boot、Spring Cloud、Spring Data、Spring Security等。
6. JMS、JavaEmail、JMX、缓存等常见Java标准的集成。

更详细的模块划分请参照[下图](https://wiki.jikexueyuan.com/project/spring/architecture.html)：

![](../images/5/spring-modules.png)



## 与设计模式

[工厂模式](http://leanlee.top/notes/10、Linux、Maven、Git、设计模式/4.1 创建型设计模式#factory-method工厂方法模式）)：**BeanFactory**就是简单工厂模式的体现，用来创建对象的实例；

[单例模式](http://leanlee.top/notes/10、Linux、Maven、Git、设计模式/4.1 创建型设计模式#singleton单例)：**Bean**默认为单例模式。

[代理模式](http://leanlee.top/notes/10、Linux、Maven、Git、设计模式/4.2 结构型设计模式#proxy代理)：**Spring**的**AOP**功能用到了JDK的**动态代理**和**CGLib**字节码生成技术；

[模板方法](http://leanlee.top/notes/10、Linux、Maven、Git、设计模式/4.3 行为型设计模式#template-method模板方法)：用来解决代码重复的问题。比如：**RestTemplate**，**JmsTemplate**，**JpaTemplate**。

[观察者模式](http://leanlee.top/notes/10、Linux、Maven、Git、设计模式/4.3 行为型设计模式#observer观察者)：定义对象键一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都会得到通知被制动更新，如**Spring**中<span style=background:#c2e2ff>观察者</span>的实现——**ApplicationListener**。

