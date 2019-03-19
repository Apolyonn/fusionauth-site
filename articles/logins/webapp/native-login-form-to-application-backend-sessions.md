---
layout: article
title: Webapp native login to backend 
subtitle: Using sessions 
description: An explanation of webapp login using a native login form that submits to the application backend and uses server-side sessions
image: articles/logins.png
---

{% capture intro %}
{% include_relative _native-intro.md %}
{% endcapture %}
{{ intro | markdownify }}

## Diagram

**Legend**

```text
() --> indicate request/response bodies
{} --> indicate request parameters
[] --> indicate cookies
```

{% plantuml _diagrams/logins/webapp/native-login-form-to-application-backend-sessions.plantuml %}

## Explanation

{% capture steps %}
{% include_relative _native-login-store.md %}
{% include_relative _create-session.md %}
1. The application backend returns a redirect to the browser instructing it to navigate to the user's shopping cart. The id for the server-side session is written back to the browser in an HTTP cookie. This cookie is HttpOnly, which prevents JavaScript from accessing them, making it less vulnerable to theft. Additionally, all requests from the browser to the application backend will include this cookie so that the backend can retrieve the User object from the server-side session 
{% include_relative _shopping-cart-session-load.md %}
{% include_relative _shopping-cart-session-relogin.md %}
{% include_relative _native-login-forums.md %}
{% include_relative _create-session.md %}
1. The application backend returns a redirect to the browser instructing it to navigate to the user's forum posts. The id for the server-side session is written back to the browser in an HTTP cookie. This cookie is HttpOnly, which prevents JavaScript from accessing them, making it less vulnerable to theft. Additionally, all requests from the browser to the application backend will include this cookie so that the backend can retrieve the User object from the server-side session 
{% include_relative _forums-session-load.md %}
{% include_relative _stolen-session-id.md %}
{% endcapture %}
{{ steps | markdownify }}

## Security considerations

This workflow is one of the more secure methods of authenticating users. One downside is that the application backend will be consuming passwords from the browser. While this isn't an issue if TLS is used and the passwords are not stored by the application backend, developers that do not want to be part of the password chain of responsibility should consider other workflows.

## APIs used

Here are the FusionAuth APIs used in this example:

* [/api/login](/docs/v1/tech/apis/login#authenticate-a-user)
