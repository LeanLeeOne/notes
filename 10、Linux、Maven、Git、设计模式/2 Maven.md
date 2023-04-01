## 简述

**Maven**是一个Java项目管理工具，简化我们的开发、测试、部署工作，其主要功能有：

1. 依赖管理

2. 构建管理

   1. 统一的项目结构
   2. 构建过程
   3. 插件机制
   4. 多模块管理

[Maven和Gradle对比](https://www.cnblogs.com/huang0925/p/5209563.html)



## 依赖管理

### 命名

首先，**Maven**采用3段式命名来作为项目的唯一标识：

1. `groupId`
   1. 包名，多为公司名、组织名。
   
2. `artifactId`
   1. 项目名。
   
3. `version`
   1. 版本号。
   2. 版本号多采用3段式：`主版本.子版本.增量版本`。

### 依赖

Dependency，依赖，也称依赖项，指的是我们项目中使用的JAR，这些jar来源于其它Maven项目，当然，这些项目也采用上述三段式命名来标识自己。

**Maven**定义了6种依赖项的作用范围（`scope`）：

1. complie

   1. 适用于所有阶段（编译、运行、测试）。
   2. 默认值。

2. provided

   1. 只在编译、测试阶段使用，避免在运行时与运行环境的jar冲突。
   2. 如`servlet.jar`。

3. runtime

   1. 只在运行、测试时使用。
   2. 如JDBC驱动。

4. test

   1. 只在测试时

5. system

   1. 适用于开发、测试、运行。
   2. 直接显式地提供依赖，**Maven**不会也无需去仓库中获取。

6. import

   1. 略。

对于同名依赖，Maven按以下原则进行选择：

1. 最短路径优先，如，有`A -> B -> C -> D`、`A -> D`两个依赖，则会加载第二条路径中的依赖。
2. 顺序优先，即，先声明的优先。
3. 覆写优先，即，子模块中的依赖优先于父模块。

这里的同名指`groupId`、`artifactId`相同，而版本不同，同名依赖往往存在冲突，大部分情况下**Maven**能按照上述原则自行解决。

对于不能解决的冲突，我们也可以用`<exclusions/>`直接将相应的依赖排除掉。

通过`mvn dependency:tree`命令可以解析项目的依赖，该命令按`groupId`、`artifactId`、`version`的顺序解析。

### 仓库

我们的依赖来源多样，归属于多个公司、组织，而**Maven**提供统一的仓库，仓库囊括了所有公开的依赖。

**Maven**仓库大致分为2种：

1. 本地仓库

2. 远程仓库：

   1. [中央仓库](https://mvnrepository.com/)。
   2. 公共镜像仓库，如阿里云仓库、华为云仓库、Spring仓库。
   3. 私有仓库，搭建在局域网中。

**Nexus**是一个强大的**Maven**仓库管理器，极大地简化了内部仓库的维护和外部仓库的访问。

**Nexus**使用文件系统加**Lucene**来组织数据。

**Nexus**也支持WebDAV与LDAP安全身份认证。

此外，还有Archiva、Artifactory等仓库管理器。

**Nexus**搭配阿里云仓库，是大部分公司的私有仓库搭建方式。

`<dependencyManagement/>`主要用于管理依赖的版本号，它会自动指定依赖的版本号，无需我们为每项依赖都指定。

**Maven**会沿着层级向上查找拥有`<dependencyManagement/>`的项目，然后使用该项目指定的版本号。



## 项目结构

**Maven**的项目采用统一的目录结构：

```java
project root
|----src
|     |----main
|     |     |----java
|     |     |----resource
|     |----test
|           |----java
|           |----resource
|----target
|----pom.xml
```



## 构建过程

一个项目的完整构建过程包括：清理、编译、测试、打包、集成测试、验证、部署。

**Maven**有3个独立的生命周期（`lifecycle`），每个生命周期又包含若干阶段（`phrase`），每个阶段负责构建工作中的一部分：

1. ##### Clean，清理项目。

   1. pre-clean，准备工作。
   2. clean，清理之前构建内容。
   3. post-clean，后续工作。

2. ##### Default，构建项目。

   1. validate，验证项目是否正确、资源是否存在。
   2. complie，编译。
   3. test，单元测试。
   4. package，打包。
   5. integration-test，将项目包发布到集成测试环境中。
   6. verify，检查项目包是否有效且达到标准。
   7. install，将项目包安装到本地仓库，以便其它项目依赖。
   8. deploy，将项目包发布到远程仓库。

3. ##### Site，建立和发布项目站点。

   1. pre-site，准备工作。
   2. site，生成项目站点文档。
   3. post-site，后续工作。
   4. site-deploy，将项目站点部署到服务器。

无论从生命周期中的哪个阶段开始，**Maven**都会从头开始执行，直到用户指定的阶段。



**Maven**的每个阶段又会细分为一个或多个的目标（`goal`），常见目标有：

1. complier，编译。
2. surefile，运行**JUnit**，创建测试报告。
3. jar，打包。
4. war，打包。
5. javadoc，为项目生成文档。
6. run，运行。

通常，我们只需指定`phrase`即可，**Maven**会自动执行相应的`goal`，如果需要指定`goal`，需要按以下形式执行构建命令：

`mvn  <goal>:<phrase>`，如，`mvn tomcat:run`。



## 插件机制

**Maven**中的`goal`只是概念，需要有具体的插件（`plugin`）是来进行实际的工作，常见插件有：

1. `org.springframework.boot.spring-boot-maven-plugin`
   1. 用于打包**Spring Boot**项目。
   
2. `org.apache.maven.plugins.maven-dependency-plugin`
   1. 用于`scope=system`范围的依赖项打入结果包中。
   
3. `org.apache.maven.plugins.maven-compiler-plugin`
1. 可用于排除指定Java文件的编译。



## 多模块管理

对于大型项目来说，项目往往分为多个模块（项目），并且模块之间有层级（父子）关系。

**Maven**提供了多模块的管理。而多模块的管理，主要父子模块间的管理。

**Maven**中父模块的打包方式为`pom`，而非`jar`或`war`，可触发全部子项目的构建。

父模块中用于存放公共配置、公共依赖，使用`<module/>`来指明子模块。

子模块通过配置`<parent/>`标签来继承父模块中的配置。



## 其它

打包版本分为：

1. ##### SNAPSHOT

   1. 快照版本，不稳定。
   2. 项目运行`mvn deploy`命令后，会发布到快照版本库中，会覆盖库中旧的快照版本。
   3. 依赖快照版本的项目，在不修改版本号的情况下，每次打包时会从仓库上下载最新的快照版本的依赖。

2. ##### RELEASE

   1. 发布版本，稳定。
   2. 项目运行`mvn deploy`后，会发布到正是版本库中。<span style=background:#ffee7c>（会被覆盖吗？）</span>
   3. 依赖发布版本的项目，在不修改版本号的情况下，每次打包时不会去仓库中重新获取依赖。

而使用`LATEST`版本，我们可以应用到最新的版本。<span style=background:#ffee7c>（待考证）</span>

`mvnw`，即**Maven Wrapper**，特定版本的**Maven**，需要预先指定版本。