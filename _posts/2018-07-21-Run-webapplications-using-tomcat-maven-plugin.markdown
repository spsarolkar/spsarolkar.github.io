---
layout: post
title:  "Running web applications with tomcat maven plugin"
date:   2018-03-18 10:54:44 +0530
categories: ESP8266
---

Intellij Idea offers the two variants of their de-facto IDE for Java related projects. One it their feature rich Enterprise edition and another one community supported Community edition. In community edition though they restricted some of the features, one of them is Tomcat plugin. Tomcat plugin for intellij Idea currently only supported in their Enterprise edition. If you have your pockets empty or do not want to buy it there is easy solution available in case you are using maven for managing lifecycle of your project. 

I assume you already have your war project. For this example I would be using the sample web application initialised using maven [maven-archetype-webapp](https://maven.apache.org/archetypes/maven-archetype-webapp/) which contains only one index.jsp file.

------------------------------------------------------------

##### 1. Simple setup without any multimodule project


First thing we need to do it add plugin definition to maven configuration, for that add plugin definition to maven pom.xml as shown below.

```xml
      <plugin>
        <groupId>org.apache.tomcat.maven</groupId>
        <artifactId>tomcat7-maven-plugin</artifactId>
        <version>2.2</version>
        <configuration>
          <!-- http port -->
          <port>9090</port>
          <!-- application path always starts with /-->
          <path>/</path>
          <contextReloadable>true</contextReloadable>
        </configuration>
      </plugin>
```

With the above configuration we will be deploying our maven war project under Tomcat root context path. There many ways to run the application, but for the first start we will use simple run command as below.

```bash
mvn clean compile tomcat7:run
```

With above command we will be fresh compile our web application and the start Tomcat container with our application deployed under root of the server. 

You can reach your application with url `http://localhost:9090/`

For running the application from IntelliJ we need to create new run configuration `Run -> Edit Configuration -> (+) Add New configuaration -> (Select) Maven` as below

![intellij-tomcat-run-configuration]

------------------------------------------------------------

##### 2. Multi-module project with additional external war

In case of multi-module project, if you configure tomcat plugin in parent, plugin will automatically pick up the module with packaging type as war and deploy it. 

In case you need multiple web applications to be hosted on the same tomcat plugin of the project, you will need to use the webapps element under the configuration and provide the GVAC for maven war project that needs to be deployed along with your application. This is perfectly valid use case in case you have interdependent web applications which consume services of each other configuration for the same is as below

Below configuration will only work when added to war type project
```xml
 <plugin>
         <groupId>org.apache.tomcat.maven</groupId>
         <artifactId>tomcat7-maven-plugin</artifactId>
         <version>2.2</version>
         <configuration>
           <!-- http port -->
           <port>9090</port>
           <!-- application path always starts with /-->
           <path>/</path>
           <webapps>
             <webapp>
               <contextPath>/MavenTomcatPlugin</contextPath>
               <groupId>io.github.spsarolkar</groupId>
               <artifactId>MavenTomcatPlugin</artifactId>
               <version>1.1-SNAPSHOT</version>
               <type>war</type>
               <asWebapp>true</asWebapp>
             </webapp>
           </webapps>
         </configuration>
```

Please note that when we are adding multiple web applications with `webapps` tag, the plugin expects the configuration is inside the war type project/module. When you execute `mvn tomcat7:run` the tomcat plugin will deploy current application along with all applications configured under `<webapps>` under their respective context path.

--------------
##### 3. Deploy without executing maven lifecycle phases with `run-war-only`
 
 In the scenario where the compilation time needed for the application is considerably high it makes sense to compile the application once and start stop tomcat multiple times. When you run the tomcat with `run` goal it will execute maven install first before starting the tomcat. This will be very time consuming  if compilation time is very high. So plugin provides another way to start the tomcat using below command .
 
 ```bash
 mvn tomcat7:run-war-only
 ``` 
 
This will start the tomcat without building the application. Its assumed that you have already compiled the application before and the application binaries are available under target folder.

Entire source code for above code is available under [example-maven-tomcat-plugin](https://github.com/spsarolkar/example-maven-tomcat-plugin)

[intellij-tomcat-run-configuration]:/images/intellij-tomcat-run-configuration.png
