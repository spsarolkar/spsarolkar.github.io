---
layout: post
title:  "Findbugs issue with detecting resource leaks for resource initialized outside methods scope"
date:   2014-03-09 10:54:44 +0530
categories: Findbugs issue with detecting resource leaks
---
Recently while working with Findbugs plugin for Eclipse I discovered that Findbugs fails to identify resource leak in the scenarios where resource is initialized outside the method scope. 

Below is the sample code in which Findbugs fails to detect resource leak

{% highlight java linenos%}
public class TestConn {
 // JDBC driver name and database URL
 static final String JDBC_DRIVER = "com.mysql.jdbc.Driver";
 static final String DB_URL = "jdbc:mysql://localhost/EMP";

 // Database credentials
 static final String USER = "username";
 static final String PASS = "password";

 public static void main(String[] args) {
  Test();
 }// end main

 private static void Test() {
  Connection conn = null;
  Statement stmt = null;
  try {
   // STEP 2: Register JDBC driver
   Class.forName("com.mysql.jdbc.Driver");

   // STEP 3: Open a connection
   System.out.println("Connecting to database...");
   conn = getConn();//<===Findbugs fails to detect connection leak

   // STEP 4: Execute a query
   System.out.println("Creating statement...");
   stmt = conn.createStatement();
   String sql;
   sql = "SELECT id, first, last, age FROM Employees";
   ResultSet rs = stmt.executeQuery(sql);

   // STEP 5: Extract data from result set
   while (rs.next()) {
    // Retrieve by column name
    int id = rs.getInt("id");
    int age = rs.getInt("age");
    String first = rs.getString("first");
    String last = rs.getString("last");

    // Display values
    System.out.print("ID: " + id);
    System.out.print(", Age: " + age);
    System.out.print(", First: " + first);
    System.out.println(", Last: " + last);
   }
   
  } catch (SQLException se) {
   // Handle errors for JDBC
   se.printStackTrace();
  } catch (Exception e) {
   // Handle errors for Class.forName
   e.printStackTrace();
  } finally {
   /*try {
    conn.close();
   } catch (SQLException e) {
    // TODO Auto-generated catch block
    e.printStackTrace();
   }*/
  }// end try
  System.out.println("Goodbye!");
 }

 private static Connection getConn() throws SQLException {
  return DriverManager.getConnection(DB_URL, USER, PASS);
 }
}
{% endhighlight %}

As you might already recognized the leak situation where connection object initialized at line 23.

{% highlight java linenos%}
conn = getConn();//<===Findbugs fails to detect connection leak
{% endhighlight %}

The solution for the problem is not that straightforward and separate plugin was required to recognize the resource leak situations. This new plugin would act as add on for Findbugs to detect leak in this specific scenario. 

You download the plugin at https://github.com/spsarolkar/Findbugs_AdResTrackr/blob/master/AdvancedResourceTrackr/dist/LeakedResourceDetector.jar

Feel free fork the repository "https://github.com/spsarolkar/Findbugs_AdResTrackr.git"