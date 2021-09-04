[Spring Cloud Eureka原理分析](https://developer.aliyun.com/article/740352?accounttraceid=a86103375a534931a28af14f461ab194teoe)



Spring Cloud Eureka的服务端有注册表registry、一级缓存readOnlyCacheMap、二级缓存readWriteCacheMap

客户端有注册、续约、下线、剔除、获取等行为，服务端有同步行为，这些行为都会引起注册表、缓存表内容的变化



注册中心比较，与Zookeeper、Consul、Nacos



[微服务出现的原因](https://www.zhihu.com/question/451313635/answer/1849701932)