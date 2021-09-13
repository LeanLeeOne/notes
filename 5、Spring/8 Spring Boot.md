Spring简化了Java的开发，而Spring Boot是为了简化Spring的开发。

Spring Boot主要包括4部分：

1. Spring Boot Starter，将常用的依赖进行分组，然后整合为一个个的依赖，以方便向Maven、Gradle（基于Groovy语言）的添加。
2. 自动配置，基于Spring4的条件化配置，来从类路径下推测，然后自动装配应用所需的Bean。
3. 命令行接口，Command Line Interface，CLI，发挥Groovy语言优势，结合自动配置，进一步简化了Spring的开发。
4. Actuator，为Spring Boot应用添加了一定的管理特性。



Spring Boot基于条件化配置定义了一下条件注解：

1. ConditionalOnProperty
2. ConditionalOnBean
3. ConditionalOnMissingBean
4. ConditionalOnMissingClass
5. ConditionalOnWebApplication
6. ConditionalOnExpression



application.yml树状配置S

Spring可以使用${Environment_Variable:default_value}的方式获取值，即，从环境变量中获取值，如果没有则取默认值。



使用Spring Boot时，最好从spring-boot-starter-parent中继承，这样可以引入预置。



通过@ConfigurationProperty将application.yml中的配置赋值给属性类。

通过@EnableAutoConfiguration(excludes=DatasourceAutoConfiguration.class)来关闭某些自动配置。

通过@Import(CustomConfiguration.class)来导入自定义配置。



SpringBoot提供更简便的Filter编写。

1. Spring会自动扫描FilterRegistrationBean，将它们返回的Filter注册的Servlet容器中，纯java，无需任何配置。





<span style=background:#ffee7c>spi与springboot自动装载</span>



### Spring Boot Actuator

1. **Actuator**会将自己收集到的信息暴露给JMX，
2. **Actuator**会通过/actuator/挂载一些监控点，info、health、beans、env、metrics等，
   1. 这些信息都会提供给JMX，但出于安全考量，只向web提供health、info信息，想要暴露到JMX需要额外配置。
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

