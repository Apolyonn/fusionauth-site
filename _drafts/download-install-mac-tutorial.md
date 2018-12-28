---
layout: blog-post
title: Download and Install FusionAuth - Mac OS
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories:
- Passport
- Tutorials
- Resources
tags:
- Passport
- code
- Identity Management
- tutorial
- video
---
NEED IMAGE

Similar to the <a href="/blog/2018/03/22/download-install-passport-tutorial/">Linux process</a>, there are only a few steps to download and install FusionAuth in your test or production environment. Most existing identity technologies have a complex hierarchy of realms, principals, and distinguished names that restricts where they can be installed and requires extensive configuration. The following tutorial will explain how to install FusionAuth for Mac OS and be up and running in just a few minutes. It will also install and run on:

- Linux - all distributions (64-bit) - <a href="/blog/2018/03/22/download-install-passport-tutorial/>View installation</a>
- Mac OS X 10.8 (Mountain Lion) or newer
- Windows Server 2008 SP2 (64-bit) w/ Windows Management Framework 3.0 or newer
- Windows Server 2008 R2 (64-bit) w/ Windows Management Framework 3.0 or newer
- Windows 7 SP1 (64-bit) w/ Windows Management Framework 3.0 or newer

We will share tutorials for these systems in the near future, but please contact us at dev@fusionauth.io if you need help before they are released.
<!--more-->

## Get Started

Before you start installing onto MacOS, do a quick check on your system to make sure it meets the minimum requirements. You will need:

- Mac OS X 10.8 Mountain Lion or newer
- MySQL 5.6.1 database or newer
- Or PostgreSQL 9.5 database or newer

<img class="aligncenter size-full wp-image-8863" src="" alt="Download and Install FusionAuth MacOS Requirements" width="1200" height="600">


Refer to the latest documentation on <a href="/docs" >fusionauth.io/docs</a> for minimum requirements. Be sure to install your database before you continue.

## Download and Install FusionAuth

Start by going to fusionauth.io and logging into your account. (If you haven’t already, use the <a href="/blog/2018/03/06/using-the-passport-setup-wizard/" >FusionAuth Setup Wizard</a> to establish your account.) Select the “my account” option in the top right of the page. Find your FusionAuth Licenses and select the blue download button on the right side of the page.

You are now on the downloads page. This page has links to all of the needed files to install and run FusionAuth. You will notice there are file types for Linux, Mac OS and Windows. For this demonstration I will be using the MAC OS X files.

<img class="aligncenter size-full wp-image-8862" src="" alt="Download and Install FusionAuth MacOS Downloads" width="1200" height="600">

There are two file packages to download - the Backend AND the Search Engine Package. Make sure to download both, I will briefly cover what each one is for in a later step.

Selecting the FusionAuth Backend ZIP file for MAC will download the file to wherever your browser sends downloaded files. Again, make sure you download BOTH the Search engine AND the backend for OSX. As a final note, at this time you can ignore the Database downloads section. The FusionAuth backend will automatically create a database for you upon your initial login to FusionAuth.

## Install FusionAuth Search Engine

Now that you have the zip files for the backend and search engine downloaded we will need to extract and install them. Let start with the search engine. The Search Engine package contains the Elasticsearch Service that FusionAuth uses to index and search for users.

Use Finder to navigate to where you downloaded the search engine package. In my system I used the <span class="lang:java decode:true crayon-inline ">Downloads</span> folder. From there extract the package to any destination folder that you like. For convenience, I have created the directory <span class="lang:java decode:true crayon-inline ">iversoft</span> </span> to extract the files to.

After extracting,  you will want to start the search engine service. The search engine should always be started before the backend. To start this service open Terminal, and enter this command

<pre class="lang:java decode:true">
$ &lt;PASSPORT_HOME&gt;/fusionauth-search-engine/elasticsearch/bin/elasticsearch -d

<img class="aligncenter size-full wp-image-8861" src="" alt="Download and Install FusionAuth MacOS Elasticsearch" width="1200" height="600">

Keep in mind your file location may be different than this tutorial so replace the directory with your own directory that contains the search engine files.

## Install FusionAuth Backend

Repeat the same process to extract and move the backend files. The backend is the web service that handles all API calls and provides the web-based management interface to FusionAuth.

To start the backend service run this command from your terminal.

<pre class="lang:java decode:true">
$ &lt;PASSPORT_HOME&gt;/fusionauth-backend/apache-tomcat/bin/startup.sh
</pre>

<img class="aligncenter size-full wp-image-8860" src="" alt="Download and Install FusionAuth MacOS Backend" width="1200" height="600">

Next, access FusionAuth’s Maintenance Mode setup via the browser. If you installed FusionAuth Backend on your local machine, you’ll access this interface by opening <span class="lang:java decode:true crayon-inline ">http://localhost:9011 </span> in your browser. If FusionAuth is running on a remote server, change the server name in the URL to match your server’s name.

The first step of Maintenance Mode will prompt you to enter your license Id. You can retrieve your license Id from the FusionAuth website by logging into your FusionAuth account and copying the key from the licenses page.

## Configure FusionAuth’s Database

The next step will be to configure the database connection to allow FusionAuth to configure the database. To complete this step you will need to confirm the database type, host, port and database name. The connection type defaults to MySQL with the default MySQL port of 3306. If you are connecting to a PostgreSQL database the default port is 5432, although your configuration may be different.

<img class="aligncenter size-full wp-image-8859" src="" alt="Download and Install FusionAuth MacOS Database" width="1200" height="600">

In the **Super User credentials** section you will need to supply FusionAuth with a username and password to the database so that it may create a new database and configure the FusionAuth schema. The provided credentials must have adequate authority to complete this successfully. These credentials are not persisted and only utilized to complete maintenance mode.

The final section labeled <strong>FusionAuth credentials</strong> will be used to define a new database user to own the FusionAuth schema and connect to the database when FusionAuth starts up. While default values for this section have been provided, at minimum the password field should be modified to utilize a password of higher entropy. These credentials will be saved to the **fusionauth.properties**  configuration file.

Click the submit button once you have completed this form and if the provided credentials and database connection information was correct you should see an **in progress** panel indicating that FusionAuth is starting up. Once this step completes FusionAuth will be running and ready for you to complete the initial configuration using the <a href="/blog/2018/03/06/using-the-passport-setup-wizard/">FusionAuth Setup Wizard</a>. If you need any help with these steps, you can refer to our<a href="/docs/1.x/tech/getting-started/"> installation documentation</a> at fusionauth.io, or feel free to email dev@fusionauth.io.

## Video: Download and Install FusionAuth - Mac OS

<iframe width="560" height="315" src="https://www.youtube.com/embed/7busnpSQc7g" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen="allowfullscreen"></iframe>

## Learn More About the FusionAuth API

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available on the market. More than a login tool, we provide registration, data search, user segmentation and advanced user management across applications.

Find out more about FusionAuth</a> and sign up for a free trial today. LINK HERE
