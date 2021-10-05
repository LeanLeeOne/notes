## 简介

**Lucene**是一个全文检索工具包。

全文检索是指：将一段文字或一篇文档，先进行分词处理，然后将词和文档建立映射，并将映射组织为索引，之后通过在索引中检索词，就可以找到相应的文章（全文），而建立的索引也称为倒排索引。

> 一般说的索引都是指倒排索引，因为正排索引是按照记录主键排序的，查询效率低，不适合索引文档。

基于**Lucene**的项目主要有：

1. **Apache Nutch**，一个高扩展性的网络爬虫项目。
2. **Apache Solr**，一个全文检索引擎。
3. **Elasticsearch**，一个全文检索引擎。



## [Apache Nutch](https://blog.csdn.net/weixin_44037478/article/details/86492924)

**Nutch**一个爬虫项目，除了能够爬取网页，还能够自动维护网页的URL信息（去重、定时更新、重定向等）。

**Nutch**采用**MapReduce**来爬取、解析网页，并在0.8版本中将**MapReduce**和**HDFS**剥离成了单独的项目——**Hadoop**，当然**Nutch**仍旧基于**Hadoop**。

> 既然基于**Hadoop**，你可能会猜到**Nutch**可以将**HBase**作为储存工具。

从1.2版本以后，**Nutch**不再提供搜索功能，但是能够向**Solr**等搜索引擎提交爬取的网页。



## Apache Solr与Elasticsearch

**Solr**和**Elasticsearch**单论全文检索功能，性能、易用性都差不多，毕竟都是基于**Lucene**。

不同的是，**Solr**支持非常复杂的查询，而**Elasticsearch**的聚合分析功能更强。

另外一点不同是，**Elasticsearch**更加易上手，但是由商业公司**Elastic**来维护开源工作，而**Solr**是开源社区维护，而且开源时间早，由大量的文档可查阅。

来自文章《[Solr vs Elasticsearch](https://logz.io/blog/solr-vs-elasticsearch/)》，另有[译文](https://www.cnblogs.com/xiaoqi/p/solr-vs-elasticsearch.html)。

