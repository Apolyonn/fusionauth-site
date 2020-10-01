---
layout: blog-post
title: Update a crufty PHP application to use OIDC for authorization
description: Implement authentication and authorization using FusionAuth for a gateway API application that routes to two different microservices.
author: Dan Moore
image: blogs/node-microservices-gateway/building-a-microservices-gateway-application.png
category: blog
tags: client-php feature-connectors
excerpt_separator: "<!--more-->"
---

Sometimes applications get written by interns. Sometimes prototypes get put into production. Sometimes crufty old applications, called "legacy" by some, are called "money makers" by others.

But once you introduce an auth system such as FusionAuth, you may want to control access to all applications, even those who might not have been written with OIDC/OAuth in mind.

<!--more-->

In this two part series, you'll update a line of business PHP application with its own user data store to use a modern auth system. In the second part, you'll learn about two methods to migrate accounts and profile data from a legacy data store to FusionAuth.

The code is all available in a [FusionAuth GitHub repository](https://github.com/fusionauth/fusionauth-example-php-connector) so you can clone and follow along if you'd like.

## Prerequisites

You'll need to have a few things set up before you get going.

* A running instance of FusionAuth. If you don't have this, check out the [5 minute setup guide](/docs/v1/tech/5-minute-setup-guide).
* A modern PHP

## Introducing the legacy app

The application you are planning to upgrade has an auth system, it just happens to be homegrown. This causes issues because it's hard to integrate with other systems, no one cares about it unless it doesn't work, and it takes time away from adding features to the app.

This application can be viewed by checking out the `insecure-legacy-app` branch. You can also [view it online](https://github.com/FusionAuth/fusionauth-example-php-connector/tree/insecure-legacy-app). Basically, there's an index page and a way to sign in and sign out. All the money making business logic, whether that's a way to update inventories, help customers or bill vendors, has been left as an exercise for the reader.

This application is assumed to be modern enough to use `composer` to manage its dependencies, even though many older PHP applications don't use such a tool. This tutorial will be thorough, but not thorough enough to cover converting a PHP application to use a modern dependency management tool. I will give such tools a wholehearted endorsement, however; they're very useful.

Here's the entry point of this application, `index.php`:

```php
<?php
require __DIR__. '/config.php';
require __DIR__. '/common.php';
require __DIR__ . '/vendor/autoload.php';
?>

Welcome to the application.

<?php if (!$_SESSION['user']) { ?>
<?php if ($_SESSION['error']) { ?>
  <br/><span style="color: red;"><?php echo $_SESSION['error']; ?></span><br/>
<?php } ?>
<form action="/authenticate.php">
  Username: <input type="text" name="email"/> <br/>
  Password: <input type="password" name="password"/> <br/>
  <input type="submit" value="Log in"/>
</form>
<?php } ?>

<?php if ($_SESSION['user']) { ?>
  You are logged in.<br/>

<form action="/logout.php">
  <input type="submit" value="Log out"/>
</form>
<?php } ?>
```

This posts to `authenticate.php` which looks like this:

```php
<?php
require __DIR__. '/config.php';
require __DIR__. '/common.php';
require __DIR__ . '/vendor/autoload.php';

if ($_REQUEST['email'] && $_REQUEST['password']) {
  if (auth($_REQUEST['email'], $_REQUEST['password'])) {

    // in reality, you'd load from a database
    $user = [];
    $user['email'] = $_REQUEST['email'];
    $user['favoriteColor'] = 'blue';
    $_SESSION['user'] = $user;
    unset($_SESSION['error']);
  } else {
    $_SESSION['error'] = 'Unable to authenticate';
  }
}
header("Location: /"); 
?>
```

`authenticate.php` calls the `auth` function, which determines if the user provided the correct credentials. 

Before you log in, you'll see something like this:

pic TBD

After you login, you'll see a screen like this:

pic TBD

Let's go ahead and start updating the application to use a modern auth protocol: OAuth.

## Configuring an application in FusionAuth

Once you have FusionAuth installed, you need to configure an application to correspond to the legacy PHP application. Let's call it "The ATM" because of how much profit this application throws off. Navigate to "Applications" in the administrative user interface and create a new one. Go to the OAuth tab and ensure that the "Authorization Code" grant is checked. Add a redirect URL of `http://localhost:8000/oauth-callback.php`. At the end, it should look like this:

pic TBD

View the application using the green magnifying glass and scroll down to the "OAuth Configuration" section. Note the `Client ID` and `Client Secret` values, which you'll use below.

Save the application, and then add a user who is registered to the application. Navigate to "Users" and add a user. Then go to the "Registrations" tab and register them to "The ATM" application so they can continue to log in and do their job.

pic TBD

That's all for FusionAuth configuration. Now let's look at the PHP application.

## Updating the PHP app

To update the "The ATM" PHP application, use composer to pull in a standard OAuth library. Instead of using the `auth` function, this code redirects to FusionAuth. It uses the Authorization Code grant to ensure that the user is authorized, then uses OIDC to retrieve customer data.

First, update your `composer.json` file to look like this:

```json
{
  "require": {
    "league/oauth2-client": "^2.5"
  }
}
```

This will pull in a [well supported OAuth client library](https://github.com/thephpleague/oauth2-client). Using this library reduces the integration with FusionAuth to a few lines of configuration. The generic provider works just fine. Install the new dependencies:

```shell
composer install
```

You'll also need to set up the `config.php` file with the OAuth secrets you noted above:

```php
<?php

// definitely update
$client_id = '83767d78-2927-43fa-baef-b556d7c91c9a';
$client_secret = 'a_pOJZu8D3Fy7a8fVxlPkVa92HPlnUt8d8JfJmtJL5U';
$tenant_id = '30663132-6464-6665-3032-326466613934';

// update if you aren't running the app or FusionAuth in the default location 
$redirect_uri = 'http://localhost:8000/oauth-callback.php';
$fa_url = 'http://localhost:9011';
```

The new `index.php` file looks like this:

```php
<?php
require __DIR__. '/config.php';
require __DIR__. '/common.php';
require __DIR__ . '/vendor/autoload.php';

$provider = new \League\OAuth2\Client\Provider\GenericProvider([
    'clientId'                => $client_id, 
    'clientSecret'            => $client_secret,
    'redirectUri'             => $redirect_uri,
    'urlAuthorize'            => $fa_url.'/oauth2/authorize',
    'urlAccessToken'          => $fa_url.'/oauth2/token',
    'urlResourceOwnerDetails' => $fa_url.'/oauth2/userinfo' 
]);

// Get the state generated for you and store it to the session.
$_SESSION['oauth2state'] = $provider->getState();
?>

Welcome to the application.

<?php if (!$_SESSION['user']) { ?>
<br/>
<a href='<?php echo $provider->getAuthorizationUrl(); ?>'>Login</a>
<?php } ?>

<?php if ($_SESSION['user']) { ?>
  You are logged in.<br/>

<form action="/logout.php">
  <input type="submit" value="Log out"/>
</form>
<?php } ?>

```

You've updated this application to authenticate using OAuth and OIDC rather than a crufty local datastore.

Here's a diagram of what the flow is:

{% plantuml source: _diagrams/blogs/update-php-application/authorization-code-grant.plantuml, alt: "The Authorization Code grant data flow." %}

The entire `authenticate.php` file is now obsolete. Instead of posting to the internal datastore, the user is directed to the FusionAuth hosted login pages when they click "Login". This is what they'll see. 

pic TBD

After they authenticate, they'll be sent to the `oauth-callback.php` code, which looks like this:

```php
<?php
require __DIR__. '/config.php';
require __DIR__. '/common.php';
require __DIR__ . '/vendor/autoload.php';

$provider = new \League\OAuth2\Client\Provider\GenericProvider([
    'clientId'                => $client_id, 
    'clientSecret'            => $client_secret,
    'redirectUri'             => $redirect_uri,
    'urlAuthorize'            => $fa_url.'/oauth2/authorize',
    'urlAccessToken'          => $fa_url.'/oauth2/token',
    'urlResourceOwnerDetails' => $fa_url.'/oauth2/userinfo' 
]);

if (empty($_GET['state']) || (isset($_SESSION['oauth2state']) && $_GET['state'] !== $_SESSION['oauth2state'])) {

  if (isset($_SESSION['oauth2state'])) {
    unset($_SESSION['oauth2state']);
  }
    
  exit('Invalid state');
}

try {

  // Try to get an access token using the authorization code grant.
  $accessToken = $provider->getAccessToken('authorization_code', [
    'code' => $_GET['code']
  ]);

  // Using the access token, we may look up details about the
  // resource owner.
  $resourceOwner = $provider->getResourceOwner($accessToken);
  $_SESSION['user'] = $resourceOwner;
  header("Location: /"); 

} catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

  // Failed to get the access token or user details.
  exit($e->getMessage());

}
```

This code verifies that the `state` parameter is unchanged and then retrieves an access token (which is typically a JWT) using the `code` request parameter. The access token is then presented to an endpoint which returns user data. That is stored in the session and the user is sent back to the index page, which looks like this:

pic TBD 



## Configuring FusionAuth

The first thing to do is to log into the administrative user interface and set up an application. As a reminder, an application is anything 




If you have a crufty old application which has its own, custom rolled auth system,


TODO break into two blog posts

first is converting a legacy php app to use oauth, and bailing if they aren't allowed to access the application

second is pulling user data into that application via the generic connector.

Have you ever had a legacy application that you wanted to shift to a different user datastore? And by "legacy" I mean, makes the company money? 

You want to gain the security and functionality benefits of a modern identity provider, but you also want to avoid a risky, big bang migration. You may want to consider a phased migration. 

<!--more-->

Connectors can help you perform just such a migration. If you configure your Connectors to migrate users as they authenticate, each user will be moved over from the user datastore as they authenticate.

At that time, they'll be full FusionAuth users. The external datastore won't be consulted in the future. It'll look a bit like this:


{% plantuml source: _diagrams/blogs/generic-connector/first-time.plantuml, alt: "The first time a user authenticates." %}

{% plantuml source: _diagrams/blogs/generic-connector/subsequent-times.plantuml, alt: "Subsequent times a user authenticates." %}


, 


Migrating users from a legacy user store.

Have you ever wanted to migrate users from an existing database to a central one?

<!--more-->

you could have one or more existing applications. you might want to move users from them to a central auth system.  

you could move people in a big bang migration. if so, you'd want to use the import users api, perhaps with a password plugin (helpful if you have a custom hashing scheme)

you could also move these users bit by bit, as they login. generic connectors can help you do that.

The way this would go is:

* build an API in your existing application which takes the username and password and returns a JSON login response. protect that API by serving it over TLS and using basic authentication.
* configure the connector
* let it run for a while
* reports to see how many users are moved.
* when you reach a certain timeline or percentage moved over delete it 
* users now auth against fusionauth
* migrate the rest of the users (if needed) using the apis

Any new password changes or other data changes will happen in FusionAuth, not in the external data source.
password changes
new registrations

example with php auth 

run through the scenario
