## 简介

**Spring**简化了Java的开发，而**Spring Boot**是为了简化**Spring**的开发。

**Spring Boot**主要包括4部分：

1. ##### Spring Boot Starter

   1. 将常用的依赖进行分组，然后整合为一个个的依赖，以方便向**Maven**、**Gradle**（基于**Groovy**语言）的添加。

2. ##### 自动配置🌙

   1. 基于**Spring4**的条件化配置以及**SPI**，自动将所有符合条件的<u>条件化<span style=background:#c9ccff>配置类</span></u>都加载到<span style=background:#ffb8b8>IoC容器</span>中。

3. ##### 命令行接口

   1. Command Line Interface，CLI，发挥**Groovy**语言优势，结合自动配置，进一步简化了**Spring**的开发。

4. ##### Actuator

   1. 为**Spring Boot**应用添加了一定的管理特性。



## 自动配置🌙

### 原理

[自动配置靠`@EnableAutoConfiguration`实现](https://blog.csdn.net/zxc123e/article/details/80222967)。

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration /* 自动配置 */
@ComponentScan( excludeFilters = {
	@Filter(type = FilterType.CUSTOM, classes = {TypeExcludeFilter.class}),
    @Filter( type = FilterType.CUSTOM, classes = {AutoConfigurationExcludeFilter.class})})
public @interface SpringBootApplication {……}
```

`@EnableAutoConfiguration`会借助`AutoConfigurationImportSelector`，自动将所有符合条件的<u>条件化<span style=background:#c9ccff>配置类</span></u>都加载到<span style=background:#ffb8b8>IoC容器</span>中。

1. `@EnableAutoConfiguration`如下：

   ```java
   @Target(ElementType.TYPE)
   @Retention(RetentionPolicy.RUNTIME)
   @Documented
   @Inherited
   @AutoConfigurationPackage
   @Import(AutoConfigurationImportSelector.class)
   public @interface EnableAutoConfiguration {……}
   ```

2. `AutoConfigurationImportSelector`会使用**SPI**加载这些<u>条件化<span style=background:#c9ccff>配置类</span></u>。

   1. 原生的**SPI**会加载<span style=background:#c2e2ff>全部</span>实现类，所以**Spring**实现了自己的**SPI**，以便能够<span style=background:#c2e2ff>按需</span>加载，
   2. 即调用`SpringFactoriesLoader.loadFactories(Class<T>, @Nullable ClassLoader)`，根据`jar/META-INF/spring.factories`中的配置来加载这些<u>条件化<span style=background:#c9ccff>配置类</span></u>。

3. <u>条件化<span style=background:#c9ccff>配置类</span></u>就是`@Configuration`、`@Conditional`搭配使用的类，如下所示。

   ```java
   @Configuration
   public class AnimalConfiguration {
   	@Bean
   	@Conditional(DogCondition.class)
   	public Animal dog(){
   		return new Dog();
   	}
   }
   ```

4. 这些<span style=background:#c9ccff>配置类</span>往往会再使用`@Import(OtherConfiguration.class)`进行组合。

5. 通过`@EnableAutoConfiguration(excludes=DatasourceAutoConfiguration.class)`来排除某些自动配置。

### 扩展配置类

**Spring Boot**对`@Conditional`进行了扩展：

| 条件化注解                      | 配置生效条件                                                 |
| ------------------------------- | ------------------------------------------------------------ |
| @ConditionalOnClass             | `classpath`里存在指定的类时起效                              |
| @ConditionalOnMissingClass      | `classpath`里缺少指定的类时起效                              |
| @ConditionalOnBean              | <span style=background:#ffb8b8>IoC容器</span>中存在指定类型的**Bean**时起效 |
| @ConditionalOnMissingBean       | <span style=background:#ffb8b8>IoC容器</span>中不存在指定类型的**Bean**时起效 |
| @ConditionalOnExpression        | 给定的**SpEL**（**Sp**ring **E**xpression **L**anguage）算结果为`true`时起效 |
| @ConditionalOnJava              | Java的版本为特定值或者范围值时起效                           |
| @ConditionalOnJndi              | 存在指定的JNDI时起效。如果不指定JNDI，则需要JNDI InitialContext |
| @ConditionalOnProperty          | 配置的值与指定的值一致时起效                                 |
| @ConditionalOnResource          | `classpath`里存在指定的文件时起效                            |
| @ConditionalOnWebApplication    | Web环境时起效                                                |
| @ConditionalOnNotWebApplication | Web环境时不起效                                              |
| @ConditionalOnSingleCandidate   | <span style=background:#ffb8b8>IoC容器</span>中指定类型的**Bean**只有一个或经`@Primary`修饰的**Bean**只有一个时起效。 |

### 补充

使用**Spring Boot**时，最好从`spring-boot-starter-parent`中继承，这样可以引入预置。

**Spring Boot**提供更简便的**Filter**编写。

- **Spring**会自动扫描`FilterRegistrationBean`，将它们返回的**Filter**注册的**Servlet**容器中，纯Java，无需任何配置。



## 配置文件

配置文件`application.yml`

1. `*.yml`采用树状配置。
2. **Spring**可以使用`${Environment_Variable:default_value}`的方式获取值，即，从环境变量中获取值，如果没有则取默认值。
3. 通过`@ConfigurationProperty`将`application.yml`中的配置赋值给属性类。

[配置的加载顺序](https://blog.csdn.net/J080624/article/details/80508606)：

1. `boostrap.properties`
2. `boostrap.yml`
3. `application.properties`
4. `application.yml`
5. 系统环境变量
6. 命令行参数

后加载的配置会覆盖已加载的配置，即，前者的优先级高于后者。

但`boostrap.properties/yml`于**ApplicationContext**的引导阶段生效，且其中的配置不会被覆盖。



## 监视器

**Actuator**会监控**Spring Boot**应用的多种信息，并会将收集到的这些信息暴露给**JMX**，但出于安全考量，只向Web提供`health`、`info`信息，想要暴露到**JMX**需要额外配置。

**Actuator**[的监控项包括](http://www.ityouknow.com/springboot/2018/02/06/spring-boot-actuator.html)原生项和自定义项等2类，其中原生项又分为3类：

1. 应用配置类：应用在运行期的静态信息。
2. 度量指标类：应用在运行期的动态信息，如堆栈、请求连接、`metrics`等。
3. 操作控制类：关闭应用等操作。

这些监控项可通过`/actuator/`进行访问。

> `metrics`是一款监控指标的度量类库，提供应用的性能统计。

### 监控项

| HTTP方法 | 接口            | 功能描述                                                     |
| -------- | --------------- | ------------------------------------------------------------ |
| GET      | /autoconfig     | 描述了Spring Boot在使用自动配置的时候，所做出的决策。        |
| GET      | /beans          | 列出运行应用所配置的Bean。                                   |
| GET      | /conditions     | 提供一份自动配置生效的条件情况，记录哪些自动配置条件通过了，哪些没通过。 |
| GET      | /configprops    | 列出应用中能够用来配置Bean的所有属性及其当前的值。           |
| GET      | /dump           | 列出应用的线程，包括每个线程的栈跟踪信息。                   |
| GET      | /env            | 列出应用上下文中所有可用的环境和系统属性变量。               |
| GET      | /env/{name}     | 展现某个特定环境变量和属性变量的值。                         |
| GET      | /health         | 展现当前应用的健康状况。                                     |
| GET      | /heapdump       | `dump`一份应用的堆信息。                                     |
| GET      | /httptrace      | 显示HTTP足迹，最近100个HTTP<span style=background:#c9ccff>请求/响应</span>。 |
| GET      | /info           | 展现应用特定的信息。                                         |
| GET      | /metrics        | 列出应用相关的指标，包括请求特定端点的运行次数。             |
| GET      | /metrics/{name} | 展现应用特定指标项的指标状况。                               |
| POST     | /shutdown       | 强制关闭应用。                                               |
| GET      | /trace          | 列出应用最近请求相关的元数据，包括请求和响应头。             |
| 略       | ……              | ……                                                           |

