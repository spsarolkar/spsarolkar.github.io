---
layout: post
title: Maven cheatsheet
date: 2018-09-01 18:02:15 +0530
categories: maven cheatsheet
disqus_comments: true
---

Maven has many different plugins and many times its very time consuming to google and find the suitable configuration to achieve your goal. Fortunately maven itself comes with help plugin which allows you to fetch all the necessary information about any plugin.
As a example I will use the Spring boot plugin. The project you can easily obtain from [Spring Initializr](https://start.spring.io/).

#### Get the list of goals available for the plugin

Our obvious starting point would be check what goals available for the plugin, below is the command to achieve the same

```bash
mvn help:describe -DgroupId=org.springframework.boot -DartifactId=spring-boot-maven-plugin
```

Output:

```bash
[INFO] Scanning for projects...
[INFO]
[INFO] ------------------< org.apache.maven:standalone-pom >-------------------
[INFO] Building Maven Stub Project (No POM) 1
[INFO] --------------------------------[ pom ]---------------------------------
[INFO]
[INFO] --- maven-help-plugin:3.1.0:describe (default-cli) @ standalone-pom ---
[INFO] org.springframework.boot:spring-boot-maven-plugin:2.0.4.RELEASE

Name: Spring Boot Maven Plugin
Description: Spring Boot Maven Plugin
Group Id: org.springframework.boot
Artifact Id: spring-boot-maven-plugin
Version: 2.0.4.RELEASE
Goal Prefix: spring-boot

This plugin has 6 goals:

spring-boot:build-info
  Description: Generate a build-info.properties file based the content of the
    current MavenProject.

spring-boot:help
  Description: Display help information on spring-boot-maven-plugin.
    Call mvn spring-boot:help -Ddetail=true -Dgoal=<goal-name> to display
    parameter details.

spring-boot:repackage
  Description: Repackages existing JAR and WAR archives so that they can be
    executed from the command line using java -jar. With layout=NONE can also
    be used simply to package a JAR with nested dependencies (and no main
    class, so not executable).

spring-boot:run
  Description: Run an executable archive application.

spring-boot:start
  Description: Start a spring application. Contrary to the run goal, this
    does not block and allows other goal to operate on the application. This
    goal is typically used in integration test scenario where the application
    is started before a test suite and stopped after.

spring-boot:stop
  Description: Stop a spring application that has been started by the 'start'
    goal. Typically invoked once a test suite has completed.

For more information, run 'mvn help:describe [...] -Ddetail'

[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 1.611 s
[INFO] Finished at: 2018-09-01T18:17:41+05:30
[INFO] ------------------------------------------------------------------------
```

You can see that it has given you all the goals available for the plugin. For example `spring-boot:run` is the plugin goal to be used when we want to run the Spring Application.

#### Get the details of any specific goal

If we need to check bindings of any specific goal to the maven lifecycle phases it can be done using `-Ddetail` and `-Dgoal=<goal name>`.

Command:

```bash
mvn help:describe -Ddetail -Dgoal=start -DgroupId=org.springframework.boot -DartifactId=spring-boot-maven-plugin
```

Output:

```
[INFO] Scanning for projects...
[INFO]
[INFO] ------------------< org.apache.maven:standalone-pom >-------------------
[INFO] Building Maven Stub Project (No POM) 1
[INFO] --------------------------------[ pom ]---------------------------------
[INFO]
[INFO] --- maven-help-plugin:3.1.0:describe (default-cli) @ standalone-pom ---
[INFO] Mojo: 'spring-boot:start'
spring-boot:start
  Description: Start a spring application. Contrary to the run goal, this
    does not block and allows other goal to operate on the application. This
    goal is typically used in integration test scenario where the application
    is started before a test suite and stopped after.
  Implementation: org.springframework.boot.maven.StartMojo
  Language: java
  Bound to phase: pre-integration-test

  Available parameters:

    addResources (Default: false)
      User property: spring-boot.run.addResources
      Add maven resources to the classpath directly, this allows live in-place
      editing of resources. Duplicate resources are removed from target/classes
      to prevent them to appear twice if ClassLoader.getResources() is called.
      Please consider adding spring-boot-devtools to your project instead as it
      provides this feature and many more.

    agent
      User property: spring-boot.run.agent
      Path to agent jar. NOTE: the use of agents means that processes will be
      started by forking a new JVM.

    arguments
      User property: spring-boot.run.arguments
      Arguments that should be passed to the application. On command line use
      commas to separate multiple arguments.

    classesDirectory (Default: ${project.build.outputDirectory})
      Required: true
      Directory containing the classes and resource files that should be
      packaged into the archive.

    excludeArtifactIds
      User property: spring-boot.excludeArtifactIds
      Comma separated list of artifact names to exclude (exact match).
      Deprecated. as of 2.0.2 in favour of {@code excludes}

    excludeGroupIds
      User property: spring-boot.excludeGroupIds
      Comma separated list of groupId names to exclude (exact match).

    excludes
      User property: spring-boot.excludes
      Collection of artifact definitions to exclude. The Exclude element
      defines a groupId and artifactId mandatory properties and an optional
      classifier property.

    folders
      User property: spring-boot.run.folders
      Additional folders besides the classes directory that should be added to
      the classpath.

    fork
      User property: spring-boot.run.fork
      Flag to indicate if the run processes should be forked. fork is
      automatically enabled if an agent, jvmArguments or working directory are
      specified, or if devtools is present.

    includes
      User property: spring-boot.includes
      Collection of artifact definitions to include. The Include element
      defines a groupId and artifactId mandatory properties and an optional
      classifier property.

    jmxName
      The JMX name of the automatically deployed MBean managing the lifecycle
      of the spring application.

    jmxPort
      The port to use to expose the platform MBeanServer if the application
      needs to be forked.

    jvmArguments
      User property: spring-boot.run.jvmArguments
      JVM arguments that should be associated with the forked process used to
      run the application. On command line, make sure to wrap multiple values
      between quotes. NOTE: the use of JVM arguments means that processes will
      be started by forking a new JVM.

    mainClass
      User property: spring-boot.run.main-class
      The name of the main class. If not specified the first compiled class
      found that contains a 'main' method will be used.

    maxAttempts
      The maximum number of attempts to check if the spring application is
      ready. Combined with the 'wait' argument, this gives a global timeout
      value (30 sec by default)

    noverify
      User property: spring-boot.run.noverify
      Flag to say that the agent requires -noverify.

    profiles
      User property: spring-boot.run.profiles
      The spring profiles to activate. Convenience shortcut of specifying the
      'spring.profiles.active' argument. On command line use commas to separate
      multiple profiles.

    skip (Default: false)
      User property: spring-boot.run.skip
      Skip the execution.

    useTestClasspath (Default: false)
      User property: spring-boot.run.useTestClasspath
      Flag to include the test classpath when running.

    wait
      The number of milli-seconds to wait between each attempt to check if the
      spring application is ready.

    workingDirectory
      User property: spring-boot.run.workingDirectory
      Current working directory to use for the application. If not specified,
      basedir will be used. NOTE: the use of working directory means that
      processes will be started by forking a new JVM.


[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 1.082 s
[INFO] Finished at: 2018-09-01T18:26:51+05:30
[INFO] ------------------------------------------------------------------------
```

As you noticed it also printed which phase this goal in our case its the start goal is bound to.

```
Bound to phase: pre-integration-test
```

This line tells us that start goal will automatically get executed during `pre-integration-test` maven phase

Similarly we have `stop` goal which is bound to `post-integration-test` maven lifecycle phase. So that during integration test the application will be turned on so that integration testing can be performed on it.

#### Check which goals executed when execution of any command

If we need to check what goals are invoked by any specific command execution, we can use `-Dcmd` and pass it the exact command,
For example below command will check what goals are executed when we execute `mvn spring-boot:run`

```
mvn help:describe -Dcmd=spring-boot:run -Ddetail
```

Output:

```
[INFO] Scanning for projects...
[INFO]
[INFO] ---------------< io.github.spsarolkar:fortune-teller-ui >---------------
[INFO] Building fortune-teller-ui 0.0.1-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- maven-help-plugin:2.2:describe (default-cli) @ fortune-teller-ui ---
[INFO] 'spring-boot:run' is a plugin goal (aka mojo).
Mojo: 'spring-boot:run'
spring-boot:run
  Description: Run an executable archive application.
  Implementation: org.springframework.boot.maven.RunMojo
  Language: java
  Bound to phase: validate
  Before this mojo executes, it will call:
    Phase: 'test-compile'

  Available parameters:

    addResources (Default: false)
      User property: spring-boot.run.addResources
      Add maven resources to the classpath directly, this allows live in-place
      editing of resources. Duplicate resources are removed from target/classes
      to prevent them to appear twice if ClassLoader.getResources() is called.
      Please consider adding spring-boot-devtools to your project instead as it
      provides this feature and many more.

    agent
      User property: spring-boot.run.agent
      Path to agent jar. NOTE: the use of agents means that processes will be
      started by forking a new JVM.

    arguments
      User property: spring-boot.run.arguments
      Arguments that should be passed to the application. On command line use
      commas to separate multiple arguments.

    classesDirectory (Default: ${project.build.outputDirectory})
      Required: true
      Directory containing the classes and resource files that should be
      packaged into the archive.

    excludeArtifactIds
      User property: spring-boot.excludeArtifactIds
      Comma separated list of artifact names to exclude (exact match).
      Deprecated. as of 2.0.2 in favour of {@code excludes}

    excludeGroupIds
      User property: spring-boot.excludeGroupIds
      Comma separated list of groupId names to exclude (exact match).

    excludes
      User property: spring-boot.excludes
      Collection of artifact definitions to exclude. The Exclude element
      defines a groupId and artifactId mandatory properties and an optional
      classifier property.

    folders
      User property: spring-boot.run.folders
      Additional folders besides the classes directory that should be added to
      the classpath.

    fork
      User property: spring-boot.run.fork
      Flag to indicate if the run processes should be forked. fork is
      automatically enabled if an agent, jvmArguments or working directory are
      specified, or if devtools is present.

    includes
      User property: spring-boot.includes
      Collection of artifact definitions to include. The Include element
      defines a groupId and artifactId mandatory properties and an optional
      classifier property.

    jvmArguments
      User property: spring-boot.run.jvmArguments
      JVM arguments that should be associated with the forked process used to
      run the application. On command line, make sure to wrap multiple values
      between quotes. NOTE: the use of JVM arguments means that processes will
      be started by forking a new JVM.

    mainClass
      User property: spring-boot.run.main-class
      The name of the main class. If not specified the first compiled class
      found that contains a 'main' method will be used.

    noverify
      User property: spring-boot.run.noverify
      Flag to say that the agent requires -noverify.

    profiles
      User property: spring-boot.run.profiles
      The spring profiles to activate. Convenience shortcut of specifying the
      'spring.profiles.active' argument. On command line use commas to separate
      multiple profiles.

    skip (Default: false)
      User property: spring-boot.run.skip
      Skip the execution.

    useTestClasspath (Default: false)
      User property: spring-boot.run.useTestClasspath
      Flag to include the test classpath when running.

    workingDirectory
      User property: spring-boot.run.workingDirectory
      Current working directory to use for the application. If not specified,
      basedir will be used. NOTE: the use of working directory means that
      processes will be started by forking a new JVM.


[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 0.775 s
[INFO] Finished at: 2018-09-01T19:35:11+05:30
[INFO] ------------------------------------------------------------------------
```

As we can see we get below message indicating test-compile will get executed when `spring-boot:run` is executed

```
  Before this mojo executes, it will call:
    Phase: 'test-compile'
```
