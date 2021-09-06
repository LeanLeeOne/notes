### spring的内容主要

1. IOC（beans、context、core）和AOP
2. JDBC、ORM、Transaction
3. MVC
   1. <span style=background:#fdc200>DispatchServlet、ContextLoaderListener</span>
4. 对Java常见标准地集成，JMS、JavaEmail、JMX、缓存等
5. Test，支持使用JUnit对Spring组件进行单元测试和集成测试。
6. 以及Spring Boot、Spring Cloud、Spring Data、Spring Security等。



### Spring与设计模式

1. 工厂模式：BeanFactory就是简单工厂模式的体现，用来创建对象的实例；
2. 单例模式：Bean默认为单例模式。
3. 代理模式：Spring的AOP功能用到了JDK的动态代理和CGLIB字节码生成技术；
4. 模板方法：用来解决代码重复的问题。比如. RestTemplate, JmsTemplate, JpaTemplate。
5. 观察者模式：定义对象键一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都会得到通知被制动更新，如Spring中listener的实现–ApplicationListener。



### id和name

每个Bean都有一个唯一的beanName，也就是Bean的id，用于标识Bean。

但是Bean可以拥有多个名称aliases，也就是别名。