### 简介

**Spring**简化了Java的开发，而**Spring Boot**是为了简化**Spring**的开发。

**Spring Boot**主要包括4部分：

1. ##### Spring Boot Starter

   1. 将常用的依赖进行分组，然后整合为一个个的依赖，以方便向**Maven**、**Gradle**（基于**Groovy**语言）的添加。

2. ##### 自动配置

   1. 基于**Spring4**的条件化配置，来从类路径下推测，然后基于**SPI**自动装配应用所需的**Bean**。

3. ##### 命令行接口

   1. Command Line Interface，CLI，发挥**Groovy**语言优势，结合自动配置，进一步简化了Spring的开发。

4. ##### Actuator

   1. 为**Spring Boot**应用添加了一定的管理特性。



### 自动配置

[自动配置靠<span style=background:#e6e6e6>@EnableAutoConfiguration</span>实现](https://blog.csdn.net/zxc123e/article/details/80222967)。

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan( excludeFilters = {
	@Filter(type = FilterType.CUSTOM, classes = {TypeExcludeFilter.class}),
    @Filter( type = FilterType.CUSTOM, classes = {AutoConfigurationExcludeFilter.class})})
public @interface SpringBootApplication {……}
```

<span style=background:#e6e6e6>@EnableAutoConfiguration</span>会借助**AutoConfigurationImportSelector**，自动将所有符合条件的<u>条件化<span style=background:#c9ccff>配置类</span></u>都加载到<span style=background:#ffb8b8>IoC容器</span>中。

1. <span style=background:#e6e6e6>@EnableAutoConfiguration</span>如下：

   ```java
   @Target(ElementType.TYPE)
   @Retention(RetentionPolicy.RUNTIME)
   @Documented
   @Inherited
   @AutoConfigurationPackage
   @Import(AutoConfigurationImportSelector.class)
   public @interface EnableAutoConfiguration {……}
   ```

2. **AutoConfigurationImportSelector**会使用**SPI**加载这些<u>条件化<span style=background:#c9ccff>配置类</span></u>。

   1. 原生的**SPI**会加载<span style=background:#c2e2ff>全部</span>实现类，所以**Spring**实现了自己的**SPI**，以便能够<span style=background:#c2e2ff>按需</span>加载，
   2. 即调用<span style=background:#b3b3b3>SpringFactoriesLoader.loadFactories(Class\<T\>, @Nullable ClassLoader)</span>，根据<span style=background:#e6e6e6>jar/META-INF/spring.factories</span>中的配置来加载这些<u>条件化<span style=background:#c9ccff>配置类</span></u>。

3. <u>条件化<span style=background:#c9ccff>配置类</span></u>就是<span style=background:#e6e6e6>@Configuration</span>、<span style=background:#e6e6e6>@Conditional</span>搭配使用的类，如下所示。

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

4. 这些<span style=background:#c9ccff>配置类</span>往往会再使用<span style=background:#e6e6e6>@Import(OtherConfiguration.class)</span>进行组合。

5. 通过<span style=background:#e6e6e6>@EnableAutoConfiguration(excludes=DatasourceAutoConfiguration.class)</span>来排除某些自动配置。

**Spring Boot**对<span style=background:#e6e6e6>@Conditional</span>进行了扩展：

1. <span style=background:#e6e6e6>@ConditionalOnClass</span>，Class Path中存在该类时起效。
2. <span style=background:#e6e6e6>@ConditionalOnMissingClass</span>，Class Path中不存在该类时起效。
3. <span style=background:#e6e6e6>@ConditionalOnBean</span>，<span style=background:#ffb8b8>IoC容器</span>中存在该类型Bean时起效。
4. <span style=background:#e6e6e6>@ConditionalOnMissingBean</span>，<span style=background:#ffb8b8>IoC容器</span>中不存在该类型Bean时起效。
5. <span style=background:#e6e6e6>@ConditionalOnWebApplication</span>，Web环境时起效。
6. <span style=background:#e6e6e6>@ConditionalOnNotWebApplication</span>，，Web环境时不起效。
7. <span style=background:#e6e6e6>@ConditionalOnExpression</span>，SpEL为true时起效。
8. <span style=background:#e6e6e6>@ConditionalOnSingleCandidate</span>，<span style=background:#ffb8b8>IoC容器</span>中该类型的Bean只有一个或<span style=background:#e6e6e6>@Primary</span>只有一个时起效。
9. <span style=background:#e6e6e6>@ConditionalOnProperty</span>，参数设置或值一致时起效。
10. <span style=background:#e6e6e6>@ConditionalOnResource</span>，存在指定的文件时起效。
11. <span style=background:#e6e6e6>@ConditionalOnJndi </span>，存在指定的JNDI时起效。
12. <span style=background:#e6e6e6>@ConditionalOnJava</span>，存在指定的Java版本时起效。

使用**Spring Boot**时，最好从<span style=background:#e6e6e6>spring-boot-starter-parent</span>中继承，这样可以引入预置。

**Spring Boot**提供更简便的**Filter**编写。

1. **Spring**会自动扫描**FilterRegistrationBean**，将它们返回的**Filter**注册的**Servlet**容器中，纯Java，无需任何配置。



### 配置文件

配置文件<span style=background:#e6e6e6>application.yml</span>

1. <span style=background:#e6e6e6>*.yml</span>采用树状配置。
2. **Spring**可以使用<span style=background:#e6e6e6>${Environment_Variable:default_value}</span>的方式获取值，即，从环境变量中获取值，如果没有则取默认值。
3. 通过<span style=background:#e6e6e6>@ConfigurationProperty</span>将<span style=background:#e6e6e6>application.yml</span>中的配置赋值给属性类。

配置的加载顺序：

1. <span style=background:#e6e6e6>boostrap.properties</span>
2. <span style=background:#e6e6e6>boostrap.yml</span>
3. <span style=background:#e6e6e6>application.properties</span>
4. <span style=background:#e6e6e6>application.yml</span>
5. 系统环境变量
6. 命令行参数

<span style=background:#e6e6e6>boostrap.properties / yml</span>于**ApplicationContext**的引导阶段生效，且其中的配置不会被覆盖。



### Actuator

Actuator，监视器。

1. **Actuator**会将自己收集到的信息暴露给**JMX**，
2. **Actuator**会通过<span style=background:#e6e6e6>/actuator/</span>挂载一些监控点，info、health、beans、env、metrics等，
   1. 这些信息都会提供给**JMX**，但出于安全考量，只向Web提供health、info信息，想要暴露到**JMX**需要额外配置。
   2. metrics是一款监控指标的度量类库，提供应用的性能统计。

**Actuator**功能介绍：

| HTTP方法 | 接口            | 功能描述                                              |
| -------- | --------------- | ----------------------------------------------------- |
| GET      | /autoconfig     | 描述了Spring Boot在使用自动配置的时候，所做出的决策。 |
| GET      | /beans          | 列出运行应用所配置的bean。                            |
| GET      | /configprops    | 列出应用中能够用来配置bean的所有属性及其当前的值。    |
| GET      | /dump           | 列出应用的线程，包括每个线程的栈跟踪信息。            |
| GET      | /env            | 列出应用上下文中所有可用的环境和系统属性变量。        |
| GET      | /env/{name}     | 展现某个特定环境变量和属性变量的值。                  |
| GET      | /health         | 展现当前应用的健康状况。                              |
| GET      | /info           | 展现应用特定的信息。                                  |
| GET      | /metrics        | 列出应用相关的指标，包括请求特定端点的运行次数。      |
| GET      | /metrics/{name} | 展现应用特定指标项的指标状况。                        |
| POST     | /shutdown       | 强制关闭应用。                                        |
| GET      | /trace          | 列出应用最近请求相关的元数据，包括请求和响应头。      |



