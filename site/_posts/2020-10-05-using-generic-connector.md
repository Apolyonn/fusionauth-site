---
layout: blog-post
title: Centralized authentication with a microservices gateway
description: Implement authentication and authorization using FusionAuth for a gateway API application that routes to two different microservices.
author: Dan Moore
image: blogs/node-microservices-gateway/building-a-microservices-gateway-application.png
category: blog
tags: client-php feature-connectors
excerpt_separator: "<!--more-->"
---

Once you have migrated an application to use a modern data store, how can you migrate your users?

<!--more-->

Previously, you updated a legacy line of business PHP application to use [OAuth and FusionAuth to authenticate users](TBD). 

You can also create [roles in the application](/docs/v1/tech/core-concepts/roles), and assign them to users to enable or prohibit certain actions. 

In this post, you'll create some roles in your application and display different data based on the role of the user. You'll also learn about  

maybe do roles in first post?

But how do you migrate users

## why migrate

## big bang

## as authed

## add roles



second is pulling user data into that application via the generic connector.

Have you ever had a legacy application that you wanted to shift to a different user datastore? And by "legacy" I mean, makes the company money? 

You want to gain the security and functionality benefits of a modern identity provider, but you also want to avoid a risky, big bang migration. You may want to consider a phased migration. 

<!--more-->

Connectors can help you perform just such a migration. If you configure your Connectors to migrate users as they authenticate, each user will be moved over from the user datastore as they authenticate.

At that time, they'll be full FusionAuth users. The external datastore won't be consulted in the future. It'll look a bit like this:

tbd diagram

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
