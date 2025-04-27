---
layout: post
title:  Struts 1.3.10 not backward compatible with Struts 1.2.9/1.2.4
date:   2016-10-11 10:54:44 +0530
categories: Struts 13 backword compatibility
---
Recently while working on one of the application built on top of Struts 1.2.4, there was a security vulnerability reported by Varacode scan asking us to upgrade to latest Struts 1 version 1.3.10.

Our organisation manages java libraries in Nexus Maven repository, the application built around 6 years back which does not make use of Maven for managing its dependencies. As a security mandate we must use our internal Maven Nexus repository to obtain all dependent jars of Struts 1.3.10 and put them manually in the classpath of ant script.

Fortunately good people at Apache Software Foundation have already thought about the problem and have built maven dependencies plugin which allows us to easily download the dependencies of any artifact, so I followed below steps to download these dependencies

1. I created one blank maven project in Eclipse
2. Updated the pom.xml as follows

{% highlight xml linenos%}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>org.test</groupId>
  <artifactId>dependencydownload</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  
 <build>
  <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-dependency-plugin</artifactId>
        <version>2.10</version>
        <executions>
          <execution>
            <id>copy-dependencies</id>
            <phase>install</phase>
            <goals>
              <goal>copy-dependencies</goal>
            </goals>
            <configuration>
              <outputDirectory>${project.build.directory}/dependencies</outputDirectory>
              <overWriteReleases>false</overWriteReleases>
              <overWriteSnapshots>false</overWriteSnapshots>
              <overWriteIfNewer>true</overWriteIfNewer>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
 </build>
    
    <dependencies>
    <dependency>
    <groupId>org.apache.struts</groupId>
    <artifactId>struts-core</artifactId>
    <version>1.3.10</version>
</dependency>
    </dependencies>
</project>
{% endhighlight %}

As highlighted in above pom.xml dependencies plugin will execute on maven install phase and will store its dependencies in 


{% highlight shell linenos%}
${project.build.directory}/dependencies
{% endhighlight %}

folder which as per Maven convention is your target/dependencies directory.

If your organisation uses custom Maven setup then this default may refer to some other directory. Once you run command mvn install either from command line or from Eclipse you should get all your dependencies in your target/dependencies

Once you obtain all the dependencies you can easily add them in ant script.

Making struts configuration changes.


After updating jars you need to follow below instructions to get the application working.

1. Identify if there are any tag libraries copied from older struts jars to your web application. If there are you need to replace them from the new struts jar.

2. Identify any custom tags defined which points to older struts tag classes, if you find you need to search for new class package [ Don't forget to use Eclipse Ctrl-Shift-T ] Once you make above changes hopefully you will have your application up and running. 

Hope this helps.
